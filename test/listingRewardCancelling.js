var ListingRewards = artifacts.require("./ListingRewards.sol");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards - CANCELLING", accounts => {
	let listing;
	const owner = accounts[0];
	const listee1 = accounts[1];
	const listee2 = accounts[2];
	const veto1 = accounts[3];
	const veto2 = accounts[4];
	const veto3 = accounts[5];
	const veto4 = accounts[6];
	beforeEach(async () => {
		listing = await ListingRewards.new(owner, 2, 2);
	});

	// CANCELLING REWARD REQUEST
	it("Listee trying to cancelling a reward request without a flag", async () => {
		let balance = await web3.eth.getBalance(listee1);
		log(`BALANCE: ${balance}`);
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		balance = await web3.eth.getBalance(listee1);
		log(`BALANCE: ${balance}`);
		await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
			log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
		});
		balance = await web3.eth.getBalance(listee1);
		log(`BALANCE: ${balance}`);
	});
	it("Listee trying to cancel reward request without request", async () => {
		try {
			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee trying to cancel reward request with a vote against his request", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.flagListing(listee1, { from: veto1, value: 2 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});

			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Someone else trying to cancel reward request", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.cancelRewardRequest({ from: listee2 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Flag on a cancelled request", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});

			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.flagListing(listee1, { from: veto1, value: 2 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
});
