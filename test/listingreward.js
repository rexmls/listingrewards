var ListingRewards = artifacts.require("./ListingRewards.sol");
const assertJump = require('./helpers/assertJump');

contract('ListingRewards', (accounts) => {
  let listing;
  const owner = accounts[0];
  const listee1 = accounts[1];
  const listee2 = accounts[2];
  const veto = accounts[3];
  beforeEach(async () => {
    listing = await ListingRewards.new(owner, 2, 2);
  });

// ADDING LISTEE

  it("Adding listees",async () => {
    await listing.addListee(12, {from: listee1});
    await listing.addListee(0, {from: listee2});
    const listee1Result = await listing.getRequestID.call({from: listee1});
    assert.equal(listee1Result, 12);
    const listee2Result = await listing.getRequestID.call({from: listee2});
    assert.equal(listee2Result, 0);
  });

// CREATING NEW REWARD REQUEST

  it("Creating a new Reward Request with less value then deposit",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 1})
      const listee1Result = await listing.getRequestID.call({from: listee1});
      assert.equal(listee1Result, 1);
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Creating a new Reward Request with more value then deposit",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 3})
      const listee1Result = await listing.getRequestID.call({from: listee1});
      assert.equal(listee1Result, 1);
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Creating a new Reward Request with equal value to deposit",async () => {
    await listing.newRewardRequest(1, 30, {from: listee1, value: 2})
    await listing.getRequestID.call({from: listee1});
    const listee1Result = await listing.getRequestID.call({from: listee1});
    assert.equal(listee1Result, 1);
  });
  it("One listee applying for more then one request",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2})
      await listing.newRewardRequest(2, 30, {from: listee1, value: 2})
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  // CANCELLING REWARD REQUEST

  it("Listee trying to cancel reward request without any veto",async () => {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.cancelRewardRequest({from: listee1});
  });
  it("Listee trying to cancel reward request without request",async () => {
    try {
      await listing.cancelRewardRequest({from: listee1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Listee trying to cancel reward request with veto request",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1);
      await listing.cancelRewardRequest({from: listee1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Veto on a cancelled request",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.cancelRewardRequest({from: listee1});
      await listing.vetoRequest(1, {from: veto, value: 1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  // VETO REQUEST

  it("Creating a new Veto request with less value then amount",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 1});
      await listing.vetoRequest(1, {from: veto, value: 0});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Creating a new Veto request with more value then amount",async () => {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
  });
  it("Creating a new Veto request by the listee itself",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: listee1, value: 1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Creating a new Veto request without the listing",async () => {
    try {
      await listing.vetoRequest(1, {from: veto, value: 1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Trying to veto more then once for the same listing",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.vetoRequest(1, {from: veto, value: 1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  //APPEAL

  it("Creating a new Appeal request with less value then amount",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 1});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 0});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Creating a new Appeal request with more value then amount",async () => {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
  });
  it("Someone else creating a new Appeal request for a listee ",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee2, value: 1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Creating a new Appeal request without any veto",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.appeal(1, {from: listee1, value: 1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  // verdict

  it("REX trying to decide the result",async () => {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.verdict(1, true, {from: owner});
  });
  it("Random user trying to decide the result",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.verdict(1, true, {from: listee2});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Owner trying to decide the result when no appeal",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.verdict(1, true, {from: owner});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Owner trying to decide the result when no veto",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.verdict(1, true, {from: owner});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  // Listee Payout

  it("Listee demanding payout within 28 days when verdict in favor",async () => {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.verdict(1, true, {from: owner});
      await listing.listeePayout(1, {from: listee1});
  });
  it("Random user demanding payout within 28 days when verdict in favor",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.verdict(1, true, {from: owner});
      await listing.listeePayout(1, {from: listee2});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Listee demanding payout when lost",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.verdict(1, false, {from: listee1});
      await listing.listeePayout(1, {from: listee1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Listee demanding payout when verdict is yet to decide the result",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.listeePayout(1, {from: listee1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Listee demanding payout when no veto request is created before 28 days",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.listeePayout(1, {from: listee1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  // Veto Payout

  it("Veto demanding payout within 7 days when verdict in favor",async () => {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.verdict(1, false, {from: owner});
      await listing.vetoPayout(1, {from: veto});
  });
  it("Random user demanding payout within 7 days when verdict in favor",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.verdict(1, false, {from: owner});
      await listing.vetoPayout(1, {from: listee2});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Veto demanding payout when lost",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.verdict(1, true, {from: listee1});
      await listing.vetoPayout(1, {from: veto});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Veto demanding payout when verdict is yet to decide the result",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoRequest(1, {from: veto, value: 1});
      await listing.appeal(1, {from: listee1, value: 1});
      await listing.vetoPayout(1, {from: listee1});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });
  it("Veto demanding payout when no veto request",async () => {
    try {
      await listing.newRewardRequest(1, 30, {from: listee1, value: 2});
      await listing.vetoPayout(1, {from: veto});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

})
