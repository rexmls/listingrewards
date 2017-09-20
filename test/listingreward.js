var MetaCoin = artifacts.require("./MetaCoin.sol");
var ListingRewards = artifacts.require("./ListingRewards.sol");

contract('ListingRewards', (accounts) => {
  let listing;
  beforeEach(async () => {
    listing = await ListingRewards.new(accounts[0], 10, 10);
  });

  it("Adding listees",async () => {
    await listing.addListee(12, {from: accounts[0]});
    await listing.addListee(0, {from: accounts[1]});
    const listee1 = await listing.getRequestID.call({from: accounts[0]});
    assert.equal(listee1, 12);
    const listee2 = await listing.getRequestID.call({from: accounts[1]});
    assert.equal(listee2, 0);
  });

  it("Creating a new Reward Request with less value",async () => {
    await listing.newRewardRequest(1, 30, {from: accounts[0], value: 9})
    const listee1 = await listing.getRequestID.call({from: accounts[0]});
    assert.equal(listee1, 0);
  });
  it("Creating a new Reward Request with more value",async () => {
    await listing.newRewardRequest(1, 30, {from: accounts[0], value: 11})
    const listee1 = await listing.getRequestID.call({from: accounts[0]});
    assert.equal(listee1, 0);
  });
  it("Creating a new Reward Request with equal value",async () => {
    await listing.newRewardRequest(1, 30, {from: accounts[0], value: 10})
    const listee1 = await listing.getRequestID.call({from: accounts[0]});
    assert.equal(listee1, 0);
  });
  it("One listee applying for more then one request",async () => {
    await listing.newRewardRequest(1, 30, {from: accounts[0], value: 10})
    const listee1 = await listing.getRequestID.call({from: accounts[0]});
    assert.equal(listee1, 0);
    await listing.newRewardRequest(2, 30, {from: accounts[0], value: 10})
    const listee2 = await listing.getRequestID.call({from: accounts[0]});
    assert.equal(listee2, 1);
  });
})
