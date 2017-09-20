pragma solidity ^0.4.16;
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

    address creator;
    address coordinator;

    listingRewardRequestsStruct[] requests;
    uint[] emptySlots;

    mapping (address => listeeStruct) listees;

    mapping (address => uint[]) vetosToRequestMapping;

    uint public rewardAmount;
    uint public depositAmount;
    uint public appealAmount;

    enum verdictTypes {NoResult, Listee, Vetos}
    
    enum vetosState {Created, Withdrawn}

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
        verdictTypes verdictWinner;  // Will be used to indicate the winner of the verdict `1` for listee and `2` for vetos
        vetosStruct vetos;
    }
    
    //CTOR
    function ListingRewards(address _CoordinatorAddress, uint rewardAmount, uint depositAmount) {
        creator = msg.sender;
        updateRewardAmount(rewardAmount);
        updateDepositAmount(depositAmount);
    }


    //Listing Reward Amount
    event rewardAmountChanged(uint newAmount);

    function updateRewardAmount(uint newAmount) {
        if (msg.sender != creator) revert();

        rewardAmount = newAmount;
        rewardAmountChanged(newAmount);
    }

    //Deposit Amount
    event depositAmountChanged(uint newAmount);

    function updateDepositAmount(uint newAmount) {
        if (msg.sender != creator) revert();

        depositAmount = newAmount;
        depositAmountChanged(newAmount);
    }


    // listee balance
    function withdraw(uint amount) {
        //dont allow withdraw if request pending
        if (listees[msg.sender].requestIdx != 0) revert();
        if (listees[msg.sender].balance < amount) revert();

        if (!msg.sender.send(amount))
            revert();
    }


    // request events
    enum RequestEventTypes {New, Cancel, Payout, Vetoed, Appeal, Verdict}

    event RequestEvent(RequestEventTypes eventType, uint idx, uint amount);

    function newRewardRequest(uint newListings, uint amount) {
        if (listees[msg.sender].requestIdx != 0) revert();

        if (depositAmount - listees[msg.sender].balance > 0)
            address tokenAddress = 0x1234567890;
            if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, depositAmount - listees[msg.sender].balance))
                revert();

        uint idx;
        if (emptySlots.length > 0) {
            idx = emptySlots[emptySlots.length - 1];
            emptySlots.length = emptySlots.length - 1;
        }
        else {
            idx = requests.length;
            requests.length = requests.length + 1;
        }

        requests[idx].listeeAddress = msg.sender;
        requests[idx].fromBlock = listees[msg.sender].lastBlockClaimed + 1;
        requests[idx].toBlock = block.number;
        requests[idx].newListings = newListings;
        requests[idx].amount = amount;
        requests[idx].dateCreated = now;
        requests[idx].deposit = depositAmount;
        requests[idx].verdictWinner = verdictTypes.NoResult;

        listees[msg.sender].requestIdx = idx;

        RequestEvent(RequestEventTypes.New, idx, amount);
    }

    function cancelRewardRequest() {
        uint idx = listees[msg.sender].requestIdx;

        if (idx == 0) revert();
        // no cancel if people have vetod
        if (requests[idx].vetos.numberOfVetos > 0) revert();

        //send listee their deposit back
        if (!requests[idx].listeeAddress.send(requests[idx].deposit))
            revert();

        //clear the data
        delete requests[idx];
    
        //raise the event
        RequestEvent(RequestEventTypes.Cancel, idx, 0);

        //clear out the request idx
        listees[msg.sender].requestIdx = 0;

        emptySlots.push(idx);
    }

    function vetoRequest(uint idx) payable {
        // NOTE:- Avoid self veto
        if (msg.sender == requests[idx].listeeAddress) revert();
        // Check if the veto already exist
        if (requests[idx].vetos.vetos[msg.sender] == vetosState.Withdrawn) revert();

        // take 10% of deposit amount
        if (msg.value > (depositAmount * 101) / 100) {
            if (!msg.sender.send(msg.value - ((depositAmount * 101) / 100))) revert();

            requests[idx].vetos.vetos[msg.sender] = vetosState.Created;
            vetosToRequestMapping[msg.sender].push(idx);

            if (requests[idx].vetos.numberOfVetos == 0) {
                requests[idx].vetos.dateCreated = now;
            }

            requests[idx].vetos.numberOfVetos += 1;
        }
        else revert();

        RequestEvent(RequestEventTypes.Vetoed, idx, 0);

    }

    function appeal(uint idx) {
        if (msg.sender != requests[idx].listeeAddress)
            revert();

        // take 10% of deposit amount
        if (msg.value > (depositAmount * 101) / 100) {
            appealAmount = (depositAmount * 101) / 100;
            if (!msg.sender.send(msg.value - appealAmount))
                revert();
        }
        else revert();

        requests[idx].appeal = true;

        RequestEvent(RequestEventTypes.Appeal, idx, 0);
    }

    function verdict(uint idx, bool inFavorOfListee) {
        if (msg.sender != creator) revert();
        if (idx <= 0) revert();

        // NOTE:- Check if the id exist in the array

        if (inFavorOfListee) {
            requests[idx].verdictWinner = verdictTypes.Listee;
          }
        else {
            requests[idx].verdictWinner = verdictTypes.Vetos;
         }

        RequestEvent(RequestEventTypes.Verdict, idx, (inFavorOfListee)? 1 : 0);
    }

    function listeePayout(uint idx) {
        // NOTE:- Check if the idx exists
        // NOTE:- Condition for 28 days
        if (now - requests[idx].dateCreated > (1 * 28 days))
            revert();
        if (listees[msg.sender].requestIdx != idx) revert();

        // NOTE: Check if the vetos exist for the listee
        if (requests[idx].vetos.numberOfVetos == 0) {
            delete requests[idx];
            listees[msg.sender].requestIdx = 0;

            if (!msg.sender.send(depositAmount + rewardAmount)) revert();

        } else {
            if(requests[idx].appeal == true) {
                if(requests[idx].verdictWinner != verdictTypes.Listee) revert();

                // Send d + r + a, where a is 10% of d
                uint amount = depositAmount + rewardAmount + (depositAmount * 101) / 100;

                delete requests[idx];
                listees[msg.sender].requestIdx = 0;

                if (!msg.sender.send(amount))
                    revert();

                RequestEvent(RequestEventTypes.Payout, idx, amount);
            }
        }    
    }

    function getVetoRequests() returns (uint[]) {
        return vetosToRequestMapping[msg.sender];
    }

    function vetoPayout(uint idx) {
        if (idx <= 0) revert();
        if (now - requests[idx].vetos.dateCreated > (1 * 7 days))
            revert();
        if(requests[idx].appeal == true) {
            if(requests[idx].verdictWinner != verdictTypes.Vetos) revert();
            // NOTE: Check if the sender exists as a veto and is authorized to be paid
            if(requests[idx].vetos.vetos[msg.sender] != vetosState.Created) revert();
        }

        // Avoid reentrancy 
        uint amount = ((depositAmount + rewardAmount)/requests[idx].vetos.numberOfVetos) + ((depositAmount * 101) / 100);
        requests[idx].vetos.vetos[msg.sender] = vetosState.Withdrawn;
        if (!msg.sender.send(amount)) revert();
        RequestEvent(RequestEventTypes.Payout, idx, amount);
        
        if (requests[idx].vetos.numberOfWithdrawn == requests[idx].vetos.numberOfVetos) {
            delete requests[idx];
            listees[msg.sender].requestIdx = 0;
        } else {
            requests[idx].vetos.numberOfWithdrawn += 1;
        }
    }

    function returnEth(address _to) {
        if (msg.sender != creator) revert();
        if (!_to.send(this.balance)) revert();
    }

}