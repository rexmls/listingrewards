var ListingRewards = artifacts.require("./ListingRewards.sol");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards", accounts => {
	let listing;
	const owner = accounts[0];
	const listee1 = accounts[1];
	const listee2 = accounts[2];
	const veto = accounts[3];
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

	// CANCELLING REWARD REQUEST

	it("Listee trying to cancel reward request without any veto", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
			log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
		});
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
	it("Listee trying to cancel reward request with veto request", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});

			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Veto on a cancelled request", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});

			await listing.cancelRewardRequest({ from: listee1 }).then(tx => {
				log(`Cancel new reward request ${tx.receipt.gasUsed} gas`);
			});
			await listing.vetoRequest(1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});

	// VETO REQUEST

	it("Creating a new Veto request with less value then amount", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 0 }).then(tx => {
				log(`Veto Request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Creating a new Veto request with more value then amount", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
			log(`Veto request ${tx.receipt.gasUsed} gas`);
		});
	});
	it("Creating a new Veto request by the listee itself", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing
				.vetoRequest(listee1, { from: listee1, value: 1 })
				.then(tx => {
					log(`Veto request ${tx.receipt.gasUsed} gas`);
				});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Creating a new Veto request after 28 days", async () => {
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
					params: [86400 * 29], // 86400 seconds in a day
					id: new Date().getTime()
				},
				() => {}
			);
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Creating a new Veto request without the listing", async () => {
		try {
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Trying to veto more then once for the same listing", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});

	//APPEAL

	it("Creating a new Appeal request with less value then amount", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 1 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			await listing.appeal(listee1, { from: listee1, value: 0 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Creating a new Appeal request with more value then amount", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request  ${tx.receipt.gasUsed} gas`);
			});
		await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
			log(`Veto request ${tx.receipt.gasUsed} gas`);
		});
		await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
			log(`Appeal request  ${tx.receipt.gasUsed} gas`);
		});
	});
	it("Someone else creating a new Appeal request for a listee ", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			await listing.appeal(listee1, { from: listee2, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee creating a new Appeal request after 7 days ", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
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
			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Creating a new Appeal request without any veto", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});

	// verdict

	it("REX trying to decide the result", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
			log(`Veto request ${tx.receipt.gasUsed} gas`);
		});
		await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
			log(`Appeal request ${tx.receipt.gasUsed} gas`);
		});
		await listing.verdict(listee1, true, { from: owner }).then(tx => {
			log(`Verdict request ${tx.receipt.gasUsed} gas`);
		});
	});
	it("Random user trying to decide the result", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			await listing.verdict(listee1, true, { from: listee2 }).then(tx => {
				log(`Verdict request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Owner trying to decide the result when no appeal", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});
			await listing.verdict(listee1, true, { from: owner }).then(tx => {
				log(`Verdict request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Owner trying to decide the result when no veto", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.verdict(listee1, true, { from: owner }).then(tx => {
				log(`Verdict request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});

	// Listee Payout

	it("Listee demanding payout after 28 days without veto request", async () => {
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
		await listing.listeePayout(listee1, { from: listee1 }).then(tx => {
			log(`Listee Payout request ${tx.receipt.gasUsed} gas`);
		});
	});
	it("Listee demanding payout within 28 days when verdict in favor", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
			log(`Veto request ${tx.receipt.gasUsed} gas`);
		});
		await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
			log(`Appeal request ${tx.receipt.gasUsed} gas`);
		});
		await listing.verdict(listee1, true, { from: owner }).then(tx => {
			log(`Verdict request ${tx.receipt.gasUsed} gas`);
		});
		await listing.listeePayout(listee1, { from: listee1 }).then(tx => {
			log(`Listee Payout request ${tx.receipt.gasUsed} gas`);
		});
	});
	it("Random user demanding payout within 28 days when verdict in favor", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});

			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			await listing.verdict(listee1, true, { from: owner }).then(tx => {
				log(`Verdict request ${tx.receipt.gasUsed} gas`);
			});
			await listing.listeePayout(listee1, { from: listee2 }).then(tx => {
				log(`Listee Payout request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee demanding payout when lost", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});

			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			await listing.verdict(listee1, false, { from: listee1 }).then(tx => {
				log(`Verdict ${tx.receipt.gasUsed} gas`);
			});
			await listing.listeePayout(listee1, { from: listee1 }).then(tx => {
				log(`Listee Payout request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee demanding payout when verdict is yet to decide the result", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});

			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});

			await listing.listeePayout(listee1, { from: listee1 }).then(tx => {
				log(`Listee Payout request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Listee demanding payout when no veto request is created before 28 days", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});

			await listing.listeePayout(listee1, { from: listee1 }).then(tx => {
				log(`Listee Payout request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});

	// Veto Payout

	it("Veto demanding payout within 7 days when verdict in favor", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
			log(`Veto request ${tx.receipt.gasUsed} gas`);
		});
		await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
			log(`Appeal request ${tx.receipt.gasUsed} gas`);
		});
		await listing.verdict(listee1, false, { from: owner }).then(tx => {
			log(`Verdict request ${tx.receipt.gasUsed} gas`);
		});

		await listing.vetoPayout(listee1, { from: veto }).then(tx => {
			log(`Veto Payout request ${tx.receipt.gasUsed} gas`);
		});
	});
	it("Random user demanding payout within 7 days when verdict in favor", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});

			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			await listing.verdict(listee1, false, { from: owner }).then(tx => {
				log(`Verdict request ${tx.receipt.gasUsed} gas`);
			});

			await listing.vetoPayout(listee1, { from: listee2 }).then(tx => {
				log(`Veto Payout request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Veto demanding payout when lost", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});

			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});
			await listing.verdict(listee1, true, { from: listee1 }).then(tx => {
				log(`Verdict request ${tx.receipt.gasUsed} gas`);
			});

			await listing.vetoPayout(listee1, { from: veto }).then(tx => {
				log(`Veto Payout request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Veto demanding payout when no appeal and 7 days past the veto", async () => {
		await listing
			.newRewardRequest(1, { from: listee1, value: 2 })
			.then(tx => {
				log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
			});
		await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
			log(`Veto request ${tx.receipt.gasUsed} gas`);
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
		await listing.vetoPayout(listee1, { from: veto }).then(tx => {
			log(`Veto request ${tx.receipt.gasUsed} gas`);
		});
	});
	it("Veto demanding payout when verdict is yet to decide the result", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});
			await listing.vetoRequest(listee1, { from: veto, value: 1 }).then(tx => {
				log(`Veto request ${tx.receipt.gasUsed} gas`);
			});

			await listing.appeal(listee1, { from: listee1, value: 1 }).then(tx => {
				log(`Appeal request ${tx.receipt.gasUsed} gas`);
			});

			await listing.vetoPayout(listee1, { from: listee1 }).then(tx => {
				log(`Veto Payout request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
	it("Veto demanding payout when no veto request", async () => {
		try {
			await listing
				.newRewardRequest(1, { from: listee1, value: 2 })
				.then(tx => {
					log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
				});

			await listing.vetoPayout(listee1, { from: veto }).then(tx => {
				log(`Veto Payout request ${tx.receipt.gasUsed} gas`);
			});
			assert.fail("should have thrown before");
		} catch (error) {
			assertJump(error);
		}
	});
});
