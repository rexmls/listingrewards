var ListingRewards = artifacts.require("./ListingRewards.sol");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards - VOTES", accounts => {
	let listing;
	const owner = accounts[0];
	const listee1 = accounts[1];
	const listee2 = accounts[2];
	const veto1 = accounts[3];
	const veto2 = accounts[4];
	const veto3 = accounts[5];
	const veto4 = accounts[6];
	const veto5 = accounts[7];
	const veto6 = accounts[8];
	beforeEach(async () => {
		listing = await ListingRewards.new(owner, 20, 20);
	});

	// VOTES LISTING REWARDS
	it("Voting against a flagged listing", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
			});
	});
	it("Voting for a flagged listing", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
	});
	it("Multiple voting against a flagged listing", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
	});
	it("Multiple voting for a flagged listing", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
	});
	it("Multiple voting for and against a flagged listing", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto4, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto5, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
	});
	it("Checking number of votes after flagging", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto4, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto5, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
		const voteForListing = await listing.getNumberOfVotesInFavor.call(listee1);
		const voteAgainst = await listing.getNumberOfVotesAgainst.call(listee1);
		assert.equal(voteForListing, 3);
		assert.equal(voteAgainst, 3);
	});
	it("Checking number of votes with 3 in favor and 1 against after flagging", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		const voteForListing = await listing.getNumberOfVotesInFavor.call(listee1);
		const voteAgainst = await listing.getNumberOfVotesAgainst.call(listee1);
		assert.equal(voteForListing, 3);
		assert.equal(voteAgainst, 1);
	});
	it("Checking number of votes with 1 in favor and 3 against after flagging", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto4, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto5, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
		const voteForListing = await listing.getNumberOfVotesInFavor.call(listee1);
		const voteAgainst = await listing.getNumberOfVotesAgainst.call(listee1);
		assert.equal(voteForListing, 1);
		assert.equal(voteAgainst, 3);
	});
	it("Checking number of votes with 2 in favor and 2 against after flagging", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto5, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
		const voteForListing = await listing.getNumberOfVotesInFavor.call(listee1);
		const voteAgainst = await listing.getNumberOfVotesAgainst.call(listee1);
		assert.equal(voteForListing, 2);
		assert.equal(voteAgainst, 2);
	});
	it("Checking number of votes with 3 in favor and 2 against after flagging", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteAgainstListing(listee1, { from: veto4, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		await listing.voteInFavorOfListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
		const voteForListing = await listing.getNumberOfVotesInFavor.call(listee1);
		const voteAgainst = await listing.getNumberOfVotesAgainst.call(listee1);
		assert.equal(voteForListing, 3);
		assert.equal(voteAgainst, 2);
	});




	it("Voting in favor without a flag", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Voting against without a flag", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto4, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Voting a cancelled in favor of own listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Voting against a cancelled listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Voting in favor of a non existing listing", async () => {
		try {
			await listing.voteInFavorOfListing(listee1, { from: listee1, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Voting against a non existing listing", async () => {
		try {
			await listing.voteAgainstListing(listee1, { from: listee1, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Voting in favor of own listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: listee1, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Voting against own listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: listee1, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User who flagged the listing voting in favor of listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User who flagged the listing voting against listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User who voted in favor the listing voting in favor of listing again", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User who voted in favor the listing voting against listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User who voted against the listing voting in favor of listing", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote In Favor Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User who voted against the listing voting against listing again", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User trying to vote against listing with no deposit", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto2 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User trying to vote in favor of a listing with no deposit", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto2 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User trying to vote in favor of a listing after 7 days of flagging", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await web3.currentProvider.sendAsync(
				{
					jsonrpc: "2.0",
					method: "evm_increaseTime",
					params: [86400 * 8], // 86400 seconds in a day
					id: new Date().getTime()
				},
				() => {}
			);
			await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User trying to vote against listing after 7 days of flagging", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await web3.currentProvider.sendAsync(
				{
					jsonrpc: "2.0",
					method: "evm_increaseTime",
					params: [86400 * 8], // 86400 seconds in a day
					id: new Date().getTime()
				},
				() => {}
			);
			await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User trying to vote for a listing before and after 7 days of flagging", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			await web3.currentProvider.sendAsync(
				{
					jsonrpc: "2.0",
					method: "evm_increaseTime",
					params: [86400 * 8], // 86400 seconds in a day
					id: new Date().getTime()
				},
				() => {}
			);
			await listing.voteInFavorOfListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User trying to vote listing before and after 7 days of flagging", async () => {
		try {
			await listing
			.newRewardRequest(1, { from: listee1, value: 20 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing.voteAgainstListing(listee1, { from: veto2, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			await web3.currentProvider.sendAsync(
				{
					jsonrpc: "2.0",
					method: "evm_increaseTime",
					params: [86400 * 8], // 86400 seconds in a day
					id: new Date().getTime()
				},
				() => {}
			);
			await listing.voteAgainstListing(listee1, { from: veto3, value: 20 }).then(tx => {
				log(`Vote Against Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});

	// it("Flagging a listing after 28 days", async () => {
	// 	try {
	// 		await listing
	// 			.newRewardRequest(1, { from: listee1, value: 20 })
	// 			.then(tx => {
	// 				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
	// 			});
			// await web3.currentProvider.sendAsync(
			// 	{
			// 		jsonrpc: "2.0",
			// 		method: "evm_increaseTime",
			// 		params: [86400 * 29], // 86400 seconds in a day
			// 		id: new Date().getTime()
			// 	},
			// 	() => {}
			// );
	// 		await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
	// 				log(`Flag request ${tx.receipt.gasUsed} gas`);
	// 			});
	// 		assert.fail("should have thrown before");
	// 	} catch (error) {
	// 		assertJump(error);
	// 	}
	// });
});
