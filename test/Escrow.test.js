const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  async function deployFixture() {
    const [buyer, seller, arbitrator, other] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    return { escrow, buyer, seller, arbitrator, other };
  }

  async function createEscrowFixture() {
    const fixture = await deployFixture();
    const { escrow, buyer, seller, arbitrator } = fixture;
    const amount = ethers.parseEther("1");
    const latest = await ethers.provider.getBlock("latest");
    const deliveryTime = BigInt(latest.timestamp) + 7n * 24n * 60n * 60n;
    const metadata = "ipfs://bafybeigdyrztjexample";

    await expect(
      escrow.connect(buyer).createEscrow(seller.address, arbitrator.address, deliveryTime, metadata, { value: amount })
    )
      .to.emit(escrow, "EscrowCreated")
      .withArgs(0, buyer.address, seller.address, arbitrator.address, amount, deliveryTime, metadata);

    return { ...fixture, amount, deliveryTime, metadata, escrowId: 0n };
  }

  it("creates an escrow with packed fields and metadata", async function () {
    const { escrow, buyer, seller, arbitrator, amount, deliveryTime, metadata, escrowId } = await createEscrowFixture();

    const item = await escrow.getEscrow(escrowId);
    expect(item.buyer).to.equal(buyer.address);
    expect(item.seller).to.equal(seller.address);
    expect(item.arbitrator).to.equal(arbitrator.address);
    expect(item.amount).to.equal(amount);
    expect(item.deliveryTime).to.equal(deliveryTime);
    expect(item.deliveredAt).to.equal(0);
    expect(item.state).to.equal(0);
    expect(item.metadata).to.equal(metadata);
  });

  it("supports the normal delivery then buyer release flow", async function () {
    const { escrow, buyer, seller, amount, escrowId } = await createEscrowFixture();

    await expect(escrow.connect(seller).markDelivered(escrowId))
      .to.emit(escrow, "Delivered");

    await expect(() => escrow.connect(buyer).releaseFunds(escrowId)).to.changeEtherBalances(
      [seller, escrow],
      [amount, -amount]
    );

    const item = await escrow.getEscrow(escrowId);
    expect(item.state).to.equal(3);
    expect(item.amount).to.equal(0);
  });

  it("handles disputes and arbitrator fund splitting", async function () {
    const { escrow, buyer, seller, arbitrator, amount, escrowId } = await createEscrowFixture();
    const buyerShare = ethers.parseEther("0.4");
    const sellerShare = amount - buyerShare;

    await expect(escrow.connect(buyer).openDispute(escrowId))
      .to.emit(escrow, "DisputeOpened")
      .withArgs(escrowId, buyer.address);

    await expect(() => escrow.connect(arbitrator).resolveDispute(escrowId, buyerShare, sellerShare)).to.changeEtherBalances(
      [buyer, seller, escrow],
      [buyerShare, sellerShare, -amount]
    );

    const item = await escrow.getEscrow(escrowId);
    expect(item.state).to.equal(3);
    expect(item.amount).to.equal(0);
  });

  it("lets the buyer cancel after the seller misses the delivery deadline", async function () {
    const { escrow, buyer, amount, deliveryTime, escrowId } = await createEscrowFixture();

    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(deliveryTime) + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(() => escrow.connect(buyer).cancelEscrow(escrowId)).to.changeEtherBalances(
      [buyer, escrow],
      [amount, -amount]
    );

    const item = await escrow.getEscrow(escrowId);
    expect(item.state).to.equal(4);
  });

  it("lets the seller withdraw after buyer inactivity post-delivery", async function () {
    const { escrow, seller, amount, escrowId } = await createEscrowFixture();
    const reviewPeriod = await escrow.REVIEW_PERIOD();

    await escrow.connect(seller).markDelivered(escrowId);
    const itemBefore = await escrow.getEscrow(escrowId);
    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(itemBefore.deliveredAt + reviewPeriod) + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(() => escrow.connect(seller).sellerWithdraw(escrowId)).to.changeEtherBalances(
      [seller, escrow],
      [amount, -amount]
    );

    const item = await escrow.getEscrow(escrowId);
    expect(item.state).to.equal(3);
  });

  it("blocks unauthorized callers", async function () {
    const { escrow, other, escrowId } = await createEscrowFixture();
    await expect(escrow.connect(other).markDelivered(escrowId)).to.be.revertedWith("Escrow: caller is not seller");
    await expect(escrow.connect(other).releaseFunds(escrowId)).to.be.revertedWith("Escrow: caller is not buyer");
  });

  it("prevents reentrancy during seller withdrawal", async function () {
    const { escrow, buyer, arbitrator } = await deployFixture();
    const Attacker = await ethers.getContractFactory("ReentrantSeller");
    const attacker = await Attacker.deploy(await escrow.getAddress());
    await attacker.waitForDeployment();

    const amount = ethers.parseEther("1");
    const latest = await ethers.provider.getBlock("latest");
    const deliveryTime = BigInt(latest.timestamp) + 3n * 24n * 60n * 60n;

    await escrow.connect(buyer).createEscrow(await attacker.getAddress(), arbitrator.address, deliveryTime, "ipfs://attack", {
      value: amount
    });

    await attacker.markDelivered(0);

    const reviewPeriod = await escrow.REVIEW_PERIOD();
    const item = await escrow.getEscrow(0);
    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(item.deliveredAt + reviewPeriod) + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(() => attacker.attackWithdraw(0)).to.changeEtherBalances(
      [attacker, escrow],
      [amount, -amount]
    );

    expect(await attacker.reentered()).to.equal(false);

    const finalItem = await escrow.getEscrow(0);
    expect(finalItem.state).to.equal(3);
    expect(finalItem.amount).to.equal(0);
  });
});
