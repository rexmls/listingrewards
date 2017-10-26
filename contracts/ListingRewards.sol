pragma solidity ^0.4.15;
/*********************************************************************************************
* This Contract keeps track of pending reward requests and their status
*
* (r) = Reward cost
* (d) = deposit cost
* (v) = veto cost
* (a) = appeal cost
*
* Verified listees only can make claims for a reward (r), they post (d) * ETH/REX rate as deposit
* separate UI process can be used to validate reward requests
* Other verified users can veto withdraw with (v) ETH deposit and get their (v) ETH + (d + r / num(vetos) back, listee looses (d + r)
* Verified listee can appeal for another (a) ETH
*  If Listee wins, gets (d + a + r) ETH back, Vetos loose their (v) ETH which goes to REX
*  If Vetos win, get their (v + (d + r / num(vetos)), Listee looses (d + a + r) ETH, REX gets (a)
*
* A typical successful claim scenario looks like this
*  Listee submits reward claim for (r) rewards (capped at 5), deposits (d)
*  After 28 day (r) and (d) is available for withdraw
* 
* A protracted scenario looks like this
*  Listee submits fraudulent claim for (r) rewards, deposits (d)
*  Verified listee submits a Veto within the 28 days (v), original Listee has 7 days to appeal
*  Listee submits appeal (a)
*  Rex to decide, submits tx with outcome.  (d + v + a + r) are available for withdraw to winner
*********************************************************************************************/

contract StandardToken {
    function transferFrom(address from, address to, uint amount) returns (bool);
}

contract ListingRewards {

    function version() constant returns (bytes32) {
        return "0.2.2-debug";
    }

    struct listeeStruct {
        uint lastBlockClaimed;
        uint requestIdx;
        uint balance;
    }

    struct vetosStruct {
        mapping (address => vetosState) vetos; // Bool value will check if the user is eligible to withdraw
        uint numberOfVetos;
        uint numberOfWithdrawn;
    }

    struct listingRewardRequestsStruct {
        address listeeAddress;
        uint fromBlock;
        uint toBlock;
        uint newListings;
        uint amount;
        uint dateCreated;
        uint deposit;
        bool flag;
        vetosStruct vetosInFavor;
        vetosStruct vetosAgainst;
        uint vetoDateCreated;
    }

    vetoType winner = vetoType.Pending;

    //ADDRESSES

    address creator;
    address coordinator;

    uint public rewardAmount;
    uint public depositAmount;
    uint public trustAmount;

    // MAPPINGS

    mapping (address => listingRewardRequestsStruct) requests;
    mapping (address => listeeStruct) listees;
    mapping (address => address[]) vetosAgainstToRequestMapping;
    mapping (address => address[]) vetosInFavorToRequestMapping;

    // ENUMS

    enum vetosState {NotActive, Created, Withdrawn}
    enum RequestEventTypes {New, Cancel, Payout, Vetoed, Appeal, Verdict}
    enum vetoType {Pending, InFavor, Against}

    // EVENTS

    event RewardAmountChanged(uint newAmount);
    event DepositAmountChanged(uint newAmount);
    event RequestEvent(RequestEventTypes eventType, address idx, uint amount);

    // MODIFIERS

    modifier isOwner() {
        require(msg.sender == creator);
        _;
    }

    modifier isValidAddress() {
        require(requests[msg.sender].listeeAddress != 0x00);
        _;
    }

    modifier isValidListeeAddress(address listeeAddress) {
        require(listeeAddress != 0x00);
        _;
    }

    //CTOR
    function ListingRewards(address coordinatorAddress, uint initialRewardAmount, uint initialDepositAmount) {
        creator = msg.sender;
        coordinator = coordinatorAddress;
        updateRewardAmount(initialRewardAmount);
        updateDepositAmount(initialDepositAmount);
    }

    //For testing
    //Add Listee

    function addListee(uint idx) returns (uint) {
        listees[msg.sender].lastBlockClaimed = 0;
        listees[msg.sender].requestIdx = idx;
        listees[msg.sender].balance = 0;
        return listees[msg.sender].requestIdx;
    }

    //For testing

    function getRequestID() returns (address) {
        return requests[msg.sender].listeeAddress;
    }


    //Listing Reward Amount

    function updateRewardAmount(uint newAmount) isOwner {
        rewardAmount = newAmount;
        RewardAmountChanged(newAmount);
    }

    //Deposit Amount

    function updateDepositAmount(uint newAmount) isOwner {
        depositAmount = newAmount;
        trustAmount = (depositAmount * 10) / 100;
        DepositAmountChanged(newAmount);
    }

    // New Reward Request
    
    function newRewardRequest(uint newListings) payable {
        require(requests[msg.sender].listeeAddress == 0x00);
        require(msg.value >= depositAmount);

        requests[msg.sender].listeeAddress = msg.sender;
        requests[msg.sender].fromBlock = listees[msg.sender].lastBlockClaimed + 1;
        requests[msg.sender].toBlock = block.number;
        requests[msg.sender].newListings = newListings;
        requests[msg.sender].dateCreated = now;
        requests[msg.sender].deposit = depositAmount;

        RequestEvent(RequestEventTypes.New, msg.sender, 0);
    }

    function cancelRewardRequest() payable isValidAddress {

        require(!requests[msg.sender].flag);
        // Avoid reentrancy 
        //clear the data
        requests[msg.sender].listeeAddress = 0x00;

        //send listee their deposit back
        msg.sender.transfer(requests[msg.sender].deposit);

        //raise the event
        RequestEvent(RequestEventTypes.Cancel, msg.sender, requests[msg.sender].deposit);
    }

    function flagListing(address listeeAddress) payable isValidListeeAddress(listeeAddress) {

        require(msg.sender != listeeAddress);
        require(!requests[listeeAddress].flag);
        require(requests[listeeAddress].listeeAddress != 0x00);
        // Check if it's 28 days past reward request
        require(now - requests[listeeAddress].dateCreated <= (1 * 28 days));
        // take 10% of deposit amount
        require(msg.value >= trustAmount);

        requests[listeeAddress].flag = true;
        requests[listeeAddress].vetoDateCreated = now;

        vetosStruct storage vetoAgainstObject = requests[listeeAddress].vetosAgainst;
        vetosStruct storage vetoInfavorObject = requests[listeeAddress].vetosInFavor;

        vetoAgainstObject.vetos[msg.sender] = vetosState.Created;
        vetosAgainstToRequestMapping[listeeAddress].push(msg.sender);

        vetoInfavorObject.vetos[requests[listeeAddress].listeeAddress] = vetosState.Created;
        vetosInFavorToRequestMapping[listeeAddress].push(listeeAddress);

        vetoAgainstObject.numberOfVetos += 1;
        vetoInfavorObject.numberOfVetos += 1;
    }
    
    function isValidVoteRequest(address listeeAddress)  isValidListeeAddress(listeeAddress) {
        // Avoid self veto
        require(msg.sender != listeeAddress);
        // Check if it's 7 days past reward request
        require(now - requests[listeeAddress].vetoDateCreated <= (1 * 7 days));

        // take 10% of deposit amount
        require(msg.value >= trustAmount);
    }

    function voteInFavorOfListing(address listeeAddress) payable {
        isValidVoteRequest(listeeAddress);
        // Check if its 7 days past the first veto request
        vetosStruct storage vetoInfavorObject = requests[listeeAddress].vetosInFavor;
        require(vetoInfavorObject.numberOfVetos != 0);
        // Check if the veto already exist
        require(vetoInfavorObject.vetos[msg.sender] == vetosState.NotActive);
        require(requests[listeeAddress].vetosAgainst.vetos[msg.sender] == vetosState.NotActive);
        vetoInfavorObject.vetos[msg.sender] = vetosState.Created;
        vetosInFavorToRequestMapping[listeeAddress].push(msg.sender);
        vetoInfavorObject.numberOfVetos += 1;
        RequestEvent(RequestEventTypes.Vetoed, listeeAddress, 0);
    }

    function voteAgainstListing(address listeeAddress) payable {
        isValidVoteRequest(listeeAddress);
        vetosStruct storage vetoAgainstObject = requests[listeeAddress].vetosAgainst;
        require(vetoAgainstObject.numberOfVetos != 0);
        // Check if the veto already exist
        require(vetoAgainstObject.vetos[msg.sender] == vetosState.NotActive);
        require(requests[listeeAddress].vetosInFavor.vetos[msg.sender] == vetosState.NotActive);
        vetoAgainstObject.vetos[msg.sender] = vetosState.Created;
        vetosAgainstToRequestMapping[listeeAddress].push(msg.sender);
        vetoAgainstObject.numberOfVetos += 1;
        RequestEvent(RequestEventTypes.Vetoed, listeeAddress, 0);
    }

    function listeePayout() payable isValidAddress {
        // NOTE: Check if the vetos exist for the listee
        require(!requests[msg.sender].flag);

        require(now - requests[msg.sender].dateCreated > (1 * 28 days));

        // Avoid reentrancy 
        //clear the data
        requests[msg.sender].listeeAddress = 0x00;

        //send listee their deposit back
        msg.sender.transfer(requests[msg.sender].deposit);
        // address tokenAddress = 0x1234567890;
        //     if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, rewardAmount))
        //         revert();
        RequestEvent(RequestEventTypes.Payout, msg.sender, depositAmount);
    }

    function getVetoAgainstRequests() returns (address[]) {
        return vetosAgainstToRequestMapping[msg.sender];
    }

    function getVetoInFavorRequests() returns (address[]) {
        return vetosInFavorToRequestMapping[msg.sender];
    }

    function vetoPayoutValidation(address listeeAddress) isValidListeeAddress(listeeAddress) {

        require(requests[listeeAddress].flag == true);
    }

    function getNumberOfVotesInFavor(address listingAddress) returns (uint) {
        return requests[listingAddress].vetosInFavor.numberOfVetos;
    }

    function getNumberOfVotesAgainst(address listingAddress) returns (uint) {
        return requests[listingAddress].vetosAgainst.numberOfVetos;
    }

    function checkForVetoWinner(address listingAddress) returns (vetoType) {
        require(now - requests[listingAddress].vetoDateCreated > (1 * 7 days));
        if (winner == vetoType.Pending) {
            if (requests[listingAddress].vetosInFavor.numberOfVetos < requests[listingAddress].vetosAgainst.numberOfVetos) {
                winner = vetoType.Against;
            } else {
                winner = vetoType.InFavor;
            }
        }
        return winner;
    }

    function vetosInFavorPayout(address listingAddress) payable {

        vetoPayoutValidation(listingAddress);
        // Check for the winner
        require(checkForVetoWinner(listingAddress)==vetoType.InFavor);

        uint amount;
        require(requests[listingAddress].vetosInFavor.vetos[msg.sender]==vetosState.Created);
        // Avoid reentrancy
        if (msg.sender == requests[listingAddress].listeeAddress) {
            amount = (depositAmount/requests[listingAddress].vetosAgainst.numberOfVetos) + depositAmount;
        } else {
            amount = (requests[listingAddress].deposit/requests[listingAddress].vetosAgainst.numberOfVetos) + trustAmount;
        }
        requests[listingAddress].vetosInFavor.vetos[msg.sender] = vetosState.Withdrawn;

        msg.sender.transfer(amount);
        
        // address tokenAddress = 0x1234567890;
        // if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, rewardAmount/requests[idx].vetos.numberOfVetos))
        //     revert();
        RequestEvent(RequestEventTypes.Payout, listingAddress, amount);
        checkNumberOfWithdraws(listingAddress, requests[listingAddress].vetosInFavor);

    }

    function vetosAgainstPayout(address listingAddress) payable {

        vetoPayoutValidation(listingAddress);
        // Check for the winner
        require(checkForVetoWinner(listingAddress)==vetoType.Against);
        require(requests[listingAddress].vetosAgainst.vetos[msg.sender] == vetosState.Created);
        // Avoid reentrancy
        uint amount = (requests[listingAddress].deposit/requests[listingAddress].vetosInFavor.numberOfVetos) + trustAmount;
        requests[listingAddress].vetosAgainst.vetos[msg.sender] = vetosState.Withdrawn;

        msg.sender.transfer(amount);
        
        // address tokenAddress = 0x1234567890;
        // if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, rewardAmount/requests[idx].vetos.numberOfVetos))
        //     revert();
        RequestEvent(RequestEventTypes.Payout, listingAddress, amount);
        checkNumberOfWithdraws(listingAddress, requests[listingAddress].vetosAgainst);

    }

    function checkNumberOfWithdraws(address listingAddress, vetosStruct veto) internal {
        if (veto.numberOfWithdrawn == veto.numberOfVetos) {
            requests[listingAddress].listeeAddress = 0x00;
        } else {
            veto.numberOfWithdrawn += 1;
        }
    }

    function returnEth(address _to) isOwner {
        if (!_to.send(this.balance)) revert();
    }
}