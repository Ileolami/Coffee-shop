import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";
import { expect } from "chai";
import pkg from "hardhat";
import artifacts from "../artifacts/contracts/Coffee.sol/Coffee.json" assert { type: "json" };
const { web3 } = pkg;

describe("Coffee Contract", function () {
  // Fixture to deploy the Coffee contract
  async function deployCoffeeFixture() {
    const coffeeContract = new web3.eth.Contract(artifacts.abi);
    coffeeContract.handleRevert = true;

    const [deployer, buyer] = await web3.eth.getAccounts();
    const rawContract = coffeeContract.deploy({
      data: artifacts.bytecode,
    });

    // Estimate gas for the deployment
    const estimateGas = await rawContract.estimateGas({ from: deployer });

    // Deploy the contract
    const coffee = await rawContract.send({
      from: deployer,
      gas: estimateGas.toString(),
      gasPrice: "10000000000",
    });

    console.log("Coffee contract deployed to: ", coffee.options.address);
    return { coffee, deployer, buyer, rawContract };
  }

  describe("Deployment", function () {
    // Test to check initial values after deployment
    it("Should set the initial values correctly", async function () {
      const { coffee } = await loadFixture(deployCoffeeFixture);
      const totalCoffeesSold = await coffee.methods.totalCoffeesSold().call();
      const totalEtherReceived = await coffee.methods
        .totalEtherReceived()
        .call();

      expect(totalCoffeesSold).to.equal("0");
      expect(totalEtherReceived).to.equal("0");
    });
  });

  describe("Buying Coffee", function () {
    // Test to check coffee purchase and event emission
    it("Should purchase coffee and emit an event", async function () {
      const { coffee, buyer } = await loadFixture(deployCoffeeFixture);
      const quantity = 3;
      const totalCost = web3.utils.toWei("0.006", "ether");

      // Buyer purchases coffee
      const receipt = await coffee.methods
        .buyCoffee(quantity)
        .send({ from: buyer, value: totalCost });

      // Check event
      const event = receipt.events.CoffeePurchased;
      expect(event).to.exist;
      expect(event.returnValues.buyer).to.equal(buyer);
      expect(event.returnValues.quantity).to.equal(String(quantity));
      expect(event.returnValues.totalCost).to.equal(totalCost);
    });

    // Test to check revert when quantity is zero
    it("Should revert if the quantity is zero", async function () {
      const { coffee, buyer } = await loadFixture(deployCoffeeFixture);
      expect(
        coffee.methods
          .buyCoffee(0)
          .send({ from: buyer, value: web3.utils.toWei("0.002", "ether") })
      ).to.be.revertedWith("Quantity must be greater than zero");
    });

    // Test to check revert when insufficient ether is sent
    it("Should revert if not enough ether is sent", async function () {
      const { coffee, buyer } = await loadFixture(deployCoffeeFixture);
      const quantity = 2;
      const insufficientEther = web3.utils.toWei("0.003", "ether");

      expect(
        coffee.methods
          .buyCoffee(quantity)
          .send({ from: buyer, value: insufficientEther })
      ).to.be.revertedWith("Insufficient ether sent");
    });

    // Test to check if totalCoffeesSold and totalEtherReceived are updated correctly
    it("Should update totalCoffeesSold and totalEtherReceived correctly", async function () {
      const { coffee, buyer } = await loadFixture(deployCoffeeFixture);
      const quantity = 5;
      const totalCost = web3.utils.toWei("0.01", "ether");

      await coffee.methods
        .buyCoffee(quantity)
        .send({ from: buyer, value: totalCost });

      const totalCoffeesSold = await coffee.methods.totalCoffeesSold().call();
      const totalEtherReceived = await coffee.methods
        .totalEtherReceived()
        .call();

      expect(totalCoffeesSold).to.equal(String(quantity));
      expect(totalEtherReceived).to.equal(totalCost);
    });

    // Test to check if excess ether is refunded
    it("Should refund excess ether sent", async function () {
      const { coffee, buyer } = await loadFixture(deployCoffeeFixture);
      const quantity = 1;
      const overpayment = web3.utils.toWei("0.004", "ether");

      const initialBalance = await web3.eth.getBalance(buyer);

      // Buyer purchases coffee with excess payment
      const receipt = await coffee.methods
        .buyCoffee(quantity)
        .send({ from: buyer, value: overpayment });
      const gasUsed =
        BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice);
      const finalBalance = await web3.eth.getBalance(buyer);

      // Check if the excess amount is refunded
      expect(web3.utils.toBigInt(finalBalance)).to.be.closeTo(
        web3.utils.toBigInt(initialBalance) -
          web3.utils.toBigInt(web3.utils.toWei("0.002", "ether")) -
          gasUsed,
        10 ** 12 // Tolerance for minor rounding differences
      );
    });
  });

  describe("Fallback function", function () {
    // Test to check revert when ether is sent directly to the contract
    it("Should revert if ether is sent directly to the contract", async function () {
      const { coffee, buyer } = await loadFixture(deployCoffeeFixture);

      expect(
        web3.eth.sendTransaction({
          from: buyer,
          to: coffee.options.address,
          value: web3.utils.toWei("0.01", "ether"),
        })
      ).to.be.revertedWith("Direct ether transfer not allowed");
    });
  });
});
