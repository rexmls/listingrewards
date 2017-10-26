var ListingRewards = artifacts.require("./ListingRewards.sol");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards - NEW LISTING", accounts => {
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

	// CREATING NEW REWARD REQUEST

	it("Creating a new Reward Request with less value then deposit", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			const listee1Result = await listing.getRequestID.call({
				from: listee1
			});
			assert.equal(listee1Result, 1);
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Creating a new Reward Request with more value then deposit", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 3 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		const listee1Result = await listing.getRequestID.call({
			from: listee1
		});
		assert.equal(listee1Result, listee1);
	});
	it("Creating a new Reward Request with equal value to deposit", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		const listee1Result = await listing.getRequestID.call({
			from: listee1
		});
		assert.equal(listee1Result, listee1);
	});
	it("One listee applying for more then one request", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing
				.newRewardRequest(2, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
});
