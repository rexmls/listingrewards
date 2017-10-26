var ListingRewards = artifacts.require("./ListingRewards.sol");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards - LISTEE PAYOUT", accounts => {
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

	// LISTEE PAYOUT REQUEST
	it("Listee trying to get his payout after 28 days without any flag", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await web3.currentProvider.sendAsync(
				{
					jsonrpc: "2.0",
					method: "evm_increaseTime",
					params: [86400 * 29], // 86400 seconds in a day
					id: new Date().getTime()
				},
				() => {}
			);
		await listing
			.listeePayout({ from: listee1 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
	});
	it("Listee trying to get his payout before 28 days without any flag", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await web3.currentProvider.sendAsync(
					{
						jsonrpc: "2.0",
						method: "evm_increaseTime",
						params: [86400 * 27], // 86400 seconds in a day
						id: new Date().getTime()
					},
					() => {}
				);
			await listing
				.listeePayout({ from: listee1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee trying to get payout for listing with a flag", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.flagListing(listee1, { from: listee1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await listing
				.listeePayout({ from: listee1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee trying to get payout after 28 days for listing with a flag", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.flagListing(listee1, { from: listee1, value: 20 }).then(tx => {
				log(`Flag request ${tx.receipt.gasUsed} gas`);
			});
			await web3.currentProvider.sendAsync(
					{
						jsonrpc: "2.0",
						method: "evm_increaseTime",
						params: [86400 * 27], // 86400 seconds in a day
						id: new Date().getTime()
					},
					() => {}
				);
			await listing
				.listeePayout({ from: listee1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee trying to get payout after 28 days for a cancelled listing with a flag", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			await web3.currentProvider.sendAsync(
					{
						jsonrpc: "2.0",
						method: "evm_increaseTime",
						params: [86400 * 27], // 86400 seconds in a day
						id: new Date().getTime()
					},
					() => {}
				);
			await listing
				.listeePayout({ from: listee1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee trying to get payout before 28 days for a cancelled listing with a flag", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing
				.listeePayout({ from: listee1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("User trying to get payout for a non existing listing", async () => {
		try {
			await listing
				.listeePayout({ from: listee1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	// it("Listee trying to cancel reward request without request", async () => {
	// 	try {
	// 		await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
	// 			log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
	// 		});
	// 		assert.fail("should have thrown before");
	// 	} catch (error) {
	// 		assertJump(error);
	// 	}
	// });
	// it("Listee trying to cancel reward request with a vote against his request", async () => {
	// 	try {
	// 		await listing
	// 			.newRewardRequest(1, { from: listee1, value: 2 })
	// 			.then(tx => {
	// 				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
	// 			});
	// 		await listing.flagListing(listee1, { from: veto1, value: 2 }).then(tx => {
	// 			log(`Flag request ${tx.receipt.gasUsed} gas`);
	// 		});

	// 		await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
	// 			log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
	// 		});
	// 		assert.fail("should have thrown before");
	// 	} catch (error) {
	// 		assertJump(error);
	// 	}
	// });
	// it("Someone else trying to cancel reward request", async () => {
	// 	try {
	// 		await listing
	// 			.newRewardRequest(1, { from: listee1, value: 2 })
	// 			.then(tx => {
	// 				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
	// 			});
	// 		await listing.cancelRewardRequest({ from: listee2 }).then(tx => {
	// 			log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
	// 		});
	// 		assert.fail("should have thrown before");
	// 	} catch (error) {
	// 		assertJump(error);
	// 	}
	// });
	// it("Flag on a cancelled request", async () => {
	// 	try {
	// 		await listing
	// 			.newRewardRequest(1, { from: listee1, value: 2 })
	// 			.then(tx => {
	// 				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
	// 			});

	// 		await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
	// 			log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
	// 		});
	// 		await listing.flagListing(listee1, { from: veto1, value: 2 }).then(tx => {
	// 			log(`Veto request ${tx.receipt.gasUsed} gas`);
	// 		});
	// 		assert.fail("should have thrown before");
	// 	} catch (error) {
	// 		assertJump(error);
	// 	}
	// });
});
