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
        uint dateCreated;
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
        bool appeal;
        bool flag;
        vetosStruct vetosInFavor;
        vetosStruct vetosAgainst;
        uint vetoDateCreated;
    }

    address creator;
    address coordinator;
    uint public rewardAmount;
    uint public depositAmount;
    uint public trustAmount;
    mapping (address => listingRewardRequestsStruct) requests;

    mapping (address => listeeStruct) listees;
    mapping (address => address[]) vetosAgainstToRequestMapping;
    mapping (address => address[]) vetosInFavorToRequestMapping;

    // ENUMS

    enum vetosState {NotActive, Created, Withdrawn}
    enum RequestEventTypes {New, Cancel, Payout, Vetoed, Appeal, Verdict}
    enum vetoType {InFavor, Against}

    // EVENTS

    event RewardAmountChanged(uint newAmount);
    event DepositAmountChanged(uint newAmount);
    event RequestEvent(RequestEventTypes eventType, address idx, uint amount);

    // MODIFIERS

    modifier isOwner() {
        if (msg.sender == creator) {
            _;
        } else {
            revert();
        }
    }

    modifier isValidAddress() {
        if (requests[msg.sender].listeeAddress != 0x00) {
            _;
        } else {
            revert();
        }
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
        if (requests[msg.sender].listeeAddress != 0x00) revert();
        if (msg.value < depositAmount) revert();

        requests[msg.sender].listeeAddress = msg.sender;
        requests[msg.sender].fromBlock = listees[msg.sender].lastBlockClaimed + 1;
        requests[msg.sender].toBlock = block.number;
        requests[msg.sender].newListings = newListings;
        requests[msg.sender].dateCreated = now;
        requests[msg.sender].deposit = depositAmount;
        requests[msg.sender].verdictWinner = verdictTypes.NotDeclared;

        RequestEvent(RequestEventTypes.New, msg.sender, 0);
    }

    function cancelRewardRequest() payable isValidAddress {

        if (requests[msg.sender].flag) revert();

        listingRewardRequestsStruct storage request = requests[msg.sender];

        // Avoid reentrancy 
        //clear the data
        requests[msg.sender].listeeAddress == 0x00;

        //send listee their deposit back
        if (!request.listeeAddress.send(request.deposit))
            revert();

        //raise the event
        RequestEvent(RequestEventTypes.Cancel, msg.sender, 0);
    }

    function flagListing(address listingAddress) payable {
        if (listingAddress == 0x00) revert();

        if (msg.sender == listingAddress) revert();

        if (requests[msg.sender].flag) revert();
        // Check if it's 28 days past reward request
        if (now - requests[listingAddress].dateCreated > (1 * 28 days))
            revert();

        // take 10% of deposit amount
        if (msg.value < trustAmount) revert();

        requests[msg.sender].flag = true;
        requests[listingAddress].vetoDateCreated = now;

        vetosStruct storage vetoAgainstObject = requests[listingAddress].vetosAgainst;
        vetosStruct storage vetoInfavorObject = requests[listingAddress].vetosInFavor;

        vetoAgainstObject.vetos[msg.sender] = vetosState.Created;
        vetosAgainstToRequestMapping[msg.sender].push(listingAddress);

        vetoInfavorObject.vetos[requests[listingAddress].listeeAddress] = vetosState.Created;
        vetosInFavorToRequestMapping[requests[listingAddress].listeeAddress].push(listingAddress);

        vetoAgainstObject.numberOfVetos += 1;
        vetoInfavorObject.numberOfVetos += 1;
    }

    function vetoRequest(address listingAddress, vetoType typeOfVeto) payable {
        if (listingAddress == 0x00) revert();
        // Avoid self veto
        if (msg.sender == listingAddress) revert();
        // Check if it's 28 days past reward request
        if (now - requests[listingAddress].dateCreated > (1 * 28 days))
            revert();

        // take 10% of deposit amount
        if (msg.value < trustAmount) revert();

        if (typeOfVeto == vetoType.Against) {
            // Check if its 7 days past the first veto request
            vetosStruct storage vetoAgainstObject = requests[listingAddress].vetosAgainst;
            if (vetoAgainstObject.numberOfVetos != 0 && now - requests[listingAddress].vetoDateCreated > (1 * 7 days)) revert();
            // Check if the veto already exist
            if (vetoAgainstObject.vetos[msg.sender] != vetosState.NotActive) revert();
            vetoAgainstObject.vetos[msg.sender] = vetosState.Created;
            vetosAgainstToRequestMapping[msg.sender].push(listingAddress);
            vetoAgainstObject.numberOfVetos += 1;
        } else {
            // Check if its 7 days past the first veto request
            vetosStruct storage vetoInfavorObject = requests[listingAddress].vetosInFavor;
            if (vetoInfavorObject.numberOfVetos != 0 && now - requests[listingAddress].vetoDateCreated > (1 * 7 days)) revert();
            // Check if the veto already exist
            if (vetoInfavorObject.vetos[msg.sender] != vetosState.NotActive) revert();
            vetoInfavorObject.vetos[msg.sender] = vetosState.Created;
            vetosInFavorToRequestMapping[msg.sender].push(listingAddress);
            vetoInfavorObject.numberOfVetos += 1;
        }

        RequestEvent(RequestEventTypes.Vetoed, listingAddress, 0);

    }

    function listeePayout(address listingAddress) payable {
        // Check if the idx exists
        if (listingAddress == 0x00) revert();
        // NOTE: Check if the vetos exist for the listee
        if (!requests[listingAddress].flag) {
            if (msg.sender != requests[listingAddress].listeeAddress) revert();

            if (now - requests[listingAddress].dateCreated < (1 * 28 days))
                revert();
            listingRewardRequestsStruct storage request = requests[listingAddress];
            requests[listingAddress].listeeAddress == 0x00;

            if (!msg.sender.send(request.deposit)) revert();
            // address tokenAddress = 0x1234567890;
            //     if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, rewardAmount))
            //         revert();
            RequestEvent(RequestEventTypes.Payout, listingAddress, depositAmount);
        }  
    }

    // function getVetoAgainstRequests() returns (address[]) {
    //     return vetosAgainstToRequestMapping[msg.sender];
    // }

    // function getVetoInFavorRequests() returns (address[]) {
    //     return vetosInFavorToRequestMapping[msg.sender];
    // }

    // function vetoPayout(address listingAddress) payable {
    //     if(requests[listingAddress].appeal == true) {
    //         if(requests[listingAddress].verdictWinner != verdictTypes.VetosWon)
    //             revert();
    //         // NOTE: Check if the sender exists as a veto and is authorized to be paid
    //         if(requests[listingAddress].vetos.vetos[msg.sender] != vetosState.Created)
    //             revert();
    //     } else {
    //         if (now - requests[listingAddress].vetoDateCreated < (1 * 7 days))
    //             revert();
    //     }

    //     // Avoid reentrancy
    //     uint amount = (requests[listingAddress].deposit/requests[listingAddress].vetos.numberOfVetos) + trustAmount;
    //     requests[listingAddress].vetos.vetos[msg.sender] = vetosState.Withdrawn;

    //     if (!msg.sender.send(amount)) revert();
        
    //     // address tokenAddress = 0x1234567890;
    //     // if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, rewardAmount/requests[idx].vetos.numberOfVetos))
    //     //     revert();
    //     RequestEvent(RequestEventTypes.Payout, listingAddress, amount);
        
    //     if (requests[listingAddress].vetos.numberOfWithdrawn == requests[listingAddress].vetos.numberOfVetos) {
    //         requests[listingAddress].listeeAddress == 0x00;
    //         listees[msg.sender].requestIdx = 0;
    //     } else {
    //         requests[listingAddress].vetos.numberOfWithdrawn += 1;
    //     }
    // }

    function returnEth(address _to) isOwner {
        if (!_to.send(this.balance)) revert();
    }
}