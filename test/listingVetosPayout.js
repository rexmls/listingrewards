var ListingRewards = artifacts.require("./ListingRewards.sol");
const assertJump = require("./helpers/assertJump");
const log = require("./helpers/logger");

contract("ListingRewards - VETOSPAYOUT", accounts => {
	let listing;
	const owner = accounts[0];
	const listee1 = accounts[1];
	const listee2 = accounts[2];
	const veto1 = accounts[3];
	const veto2 = accounts[4];
	const veto3 = accounts[5];
	const veto4 = accounts[6];
	beforeEach(async () => {
		listing = await ListingRewards.new(owner, 20, 20);
	});

  it("Claiming in favor veto payout after voting in favor and winning veto", async () => {
    const balanceBeforePayout = web3.eth.getBalance(veto2);
    await listing
      .newRewardRequest(1, { from: listee1, value: 20 })
      .then(tx => {
        log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
      });
    await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
        log(`Flag request ${tx.receipt.gasUsed} gas`);
      });
    await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
        log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
      });
    await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
      log(`In favor payout request ${tx.receipt.gasUsed} gas`);
      });
    const balanceAfterPayout = web3.eth.getBalance(veto2);
    assert.equal(balanceAfterPayout - balanceBeforePayout, 22);
  });

  it("Claiming in favor veto payout after voting against", async () => {
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
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout after voting against and winning veto", async () => {
    const balanceBeforePayout = web3.eth.getBalance(veto2);
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
    await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
      log(`Against payout request ${tx.receipt.gasUsed} gas`);
      });
    const balanceAfterPayout = web3.eth.getBalance(veto2);
    assert.equal(balanceAfterPayout - balanceBeforePayout, 22);
  });

  it("Claiming against veto payout after voting in favor", async () => {
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
          log(`Vote In Favor Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor veto payout after voting in favor and losing veto", async () => {
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
          log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto3, value: 20 }).then(tx => {
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteAgainstListing(listee1, { from: veto4, value: 20 }).then(tx => {
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout after voting against and losing veto", async () => {
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
          log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto3, value: 20 }).then(tx => {
          log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.voteInFavorOfListing(listee1, { from: veto4, value: 20 }).then(tx => {
          log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 claiming against", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: 20 })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: listee1 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 claiming in favor of veto payout after losing veto", async () => {
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
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 claiming in favor of veto payout after winning veto", async () => {
    const balanceBeforePayout = web3.eth.getBalance(listee1);
    await listing
      .newRewardRequest(1, { from: listee1, value: 20 })
      .then(tx => {
        log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
      });
    await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
        log(`Flag request ${tx.receipt.gasUsed} gas`);
      });
    await listing.voteInFavorOfListing(listee1, { from: veto2, value: 20 }).then(tx => {
        log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
      });
    await listing.vetosInFavorPayout(listee1, { from: listee1 }).then(tx => {
      log(`In favor payout request ${tx.receipt.gasUsed} gas`);
      });
    const balanceAfterPayout = web3.eth.getBalance(listee1);
    assert.equal(balanceAfterPayout - balanceBeforePayout, 40);
  });

  it("Claiming in favor of veto payout without voting", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: 20 })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout without voting", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: 20 })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.flagListing(listee1, { from: veto1, value: 20 }).then(tx => {
          log(`Flag request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor of veto payout for an unflagged listee", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: 20 })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorPayout(listee1, { from: veto1 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout for an unflagged listee", async () => {
    try {
      await listing
        .newRewardRequest(1, { from: listee1, value: 20 })
        .then(tx => {
          log(`Adding new reward request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: veto1 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor of veto payout before 7 days", async () => {
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
        log(`Vote In Favor Of Request request ${tx.receipt.gasUsed} gas`);
        });
      await web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [86400 * 6], // 86400 seconds in a day
            id: new Date().getTime()
          },
          () => {}
        );
      await listing.vetosInFavorPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout before 7 days", async () => {
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
        log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
        });
      await web3.currentProvider.sendAsync(
          {
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [86400 * 6], // 86400 seconds in a day
            id: new Date().getTime()
          },
          () => {}
        );
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor of veto payout multiple times", async () => {
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
          log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosInFavorOfPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorOfPayout(listee1, { from: veto2 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout multiple times", async () => {
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
          log(`Vote Against Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosAgainstPayout(listee1, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("listee1 claiming in favor of veto payout multiple times", async () => {
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
          log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosInFavorOfPayout(listee1, { from: listee1 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      await listing.vetosInFavorOfPayout(listee1, { from: listee1 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming in favor of veto payout for an invalid listee", async () => {
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
          log(`Vote in favor of Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosInFavorOfPayout(0x00, { from: veto2 }).then(tx => {
        log(`In favor of payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

  it("Claiming against veto payout for an invalid listee", async () => {
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
          log(`Vote against Request request ${tx.receipt.gasUsed} gas`);
          });
      await listing.vetosAgainstPayout(0x00, { from: veto2 }).then(tx => {
        log(`Against payout request ${tx.receipt.gasUsed} gas`);
        });
      assert.fail("should have thrown before");
    } catch(error) {
        assertJump(error);
    }
  });

}