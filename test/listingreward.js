var MetaCoin = artifacts.require("./MetaCoin.sol");
var ListingRewards = artifacts.require("./ListingRewards.sol");

contract('ListingRewards', (accounts) => {
  let listing;
  beforeEach(async () => {
    listing = await ListingRewards.new(accounts[0], 10, 10);
    await listing.addListee.call(363213, {from: accounts[0]});
    await listing.addListee.call(32123122, {from: accounts[1]});
  });

  it("Adding listees",async () => {
    let deposit;
    
    console.log(listing.listees(accounts[1]).requestIdx, "######");
    const abc = await listing.getBal.call({from: accounts[1]});
    console.log(abc , "$$$$$$$");
    assert.equal(abc, 2);
  });

  it("Checking for min amount",async () => {
    let deposit;
    await listing.getRA.call().then((b) => deposit = b.toNumber());
    assert.equal(deposit, 10);
  });
})

