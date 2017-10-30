# Listing Reward Contract

[![N|REX](http://www.rexmls.com/images/coin@2x.png)](http://www.rexmls.com)

### Overview
> This Contract keeps track of pending reward requests and their status
> (r) = reward amount
> (d) = deposit amount
> (t) = trust amount

> Verified listees will be able to claims for a reward (r) for their listings. Listees have to deposit an amount (d) when they apply for the listing which will be given back to them when their request is successful.

> Other verified users can flag against the listing for a time period of 28 days. The user has to deposit (t) amount which will be returned to them once their flagging is successful.

> At the time of flagging the one vote will be given against listing by the flagee and one in favor of listing by the listee. The user will have 7 days to vote in favor of listing and against the listing from then on. To vote user have to pay (t) amount which will be given back to them when they win the voting.

#### Payouts
##### Listee
 Reward request with/without any flag

> (d) + (r)

##### Winning pool of voters

`In favor`
```sh
 ((t)*number of votes against the listing)/(number of votes for the listing - 1) + (t)
```
We are subtracting one to remove listee from our counting.

`Against`
```sh
 ((t)*number of votes for the listing)/(number of votes against the listing) + (t)
```

### Functions and their working

```sh
ListingRewards(address coordinatorAddress, uint initialRewardAmount, uint initialDepositAmount)
```
| Variable | Uses |
| ------ | ------ |
|`coordinatorAddress` |  |
|initialRewardAmount | The reward amount that will be awarded for a listing |
|initialDepositAmount |  The deposit listee needs to put in for a listing reward request |

```sh
newRewardRequest(uint newListings)
```
To create a new reward request for a listing.

| Variable | Uses |
| ------ | ------ |
|`newListings` | Address of the listing  |

```sh
cancelRewardRequest()
```
If listee wants to cancel reward request. The request will only be canceled if there is no flag against the listing.

```sh
flagListing(address listeeAddress)
```
If a user thinks that the listing is no genuine and there are no votes against the listing, he can flag against the listing using this function.

| Variable | Uses |
| ------ | ------ |
|listeeAddress | Address of the listee to map with the reward request |

```sh
voteInFavorOfListing(address listeeAddress)
```
If there is a flag raised and the user wants to vote for the listing.

| Variable | Uses |
| ------ | ------ |
|listeeAddress | Address of the listee to map with the reward request |

```sh
voteAgainstListing(address listeeAddress)
```
If there is a flag raised and the user wants to vote against the listing.

| Variable | Uses |
| ------ | ------ |
|listeeAddress | Address of the listee to map with the reward request |

```sh
listeePayout()
```
If there are no flags in 28 days or it's 7 days past the flagging of the listing and the number of votes in favor of listing is more then that of the number of votes against the listing, Listee gets his reward and deposit amount back.
```sh
getVetoAgainstRequests(address listingAddress)
```
Get the list of address voting against a listing.

```sh
getVetoInFavorRequests(address listingAddress)
``` 
Get the list of voters voting in favor of a listing.

```sh
getNumberOfVotesInFavor(address listingAddress)
```
Used to get the number of votes in favor a listing, after 7 days.

```sh
getNumberOfVotesAgainst(address listingAddress)
```
Used to get the number of votes against a listing, after 7 days.

```sh
checkForVetoWinner(address listingAddress)
```
Get the winner of the voting after 7 day period.

| Variable | Uses |
| ------ | ------ |
|listeeAddress | Address of the listee to map with the reward request |

```sh
vetosInFavorPayout(address listingAddress)
```
This function will be called by the voters who voted in favor for a listing and won after 7 days of voting period

| Variable | Uses |
| ------ | ------ |
|listeeAddress | Address of the listee to map with the reward request |

```sh
vetosAgainstPayout(address listingAddress)
```
This function will be called by the voters who voted against for a listing and won after 7 days of voting period

| Variable | Uses |
| ------ | ------ |
|listeeAddress | Address of the listee to map with the reward request |

### `Issues/Queries`
> What if the number of votes against the listing is equal to the number of votes in favor of listing.
> Will we user ETH or REX tokens for all the transactions in the contract.
