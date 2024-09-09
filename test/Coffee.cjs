const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers.js");
const { expect } = require("chai");
const pkg = require("hardhat");
const ABI = require('../artifacts/contracts/coffee.sol/Coffee.json');
const { web3 } = pkg;

describe("Coffee Contract", function () {
  // Fixture to deploy the Coffee contract
  async function deployCoffeeFixture() {
    const coffeeContract = new web3.eth.Contract(ABI.abi);
    coffeeContract.handleRevert = true;

    const [deployer, buyer] = await web3.eth.getAccounts();
    const rawContract = coffeeContract.deploy({
      data: ABI.bytecode,
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
      const totalEtherReceived = await coffee.methods.totalEtherReceived().call();

      expect(totalCoffeesSold).to.equal("0");
      expect(totalEtherReceived).to.equal("0");
    });
  });

  describe("Buying Coffee", function () {
    // Test to check coffee purchase and event emission
    it("Should purchase coffee and emit an event", async function () {
      const { coffee, buyer } = await loadFixture(deployCoffeeFixture);
      const quantity = 3;
      const totalCost = web3.utils.toWei("0.0006", "ether");

      // Buyer purchases coffee
      const receipt = await coffee.methods.buyCoffee(quantity).send({ from: buyer, value: totalCost });

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
              coffee.methods.buyCoffee(0).send({ from: buyer, value: web3.utils.toWei("0.0002", "ether") })
            ).to.be.revertedWith("QuantityMustBeGreaterThanZero");
          });

          
    // Test to check if totalCoffeesSold and totalEtherReceived are updated correctly
    it("Should update totalCoffeesSold and totalEtherReceived correctly", async function () {
      const { coffee, buyer } = await loadFixture(deployCoffeeFixture);
      const quantity = 5;
      const totalCost = web3.utils.toWei("0.001", "ether");

      await coffee.methods.buyCoffee(quantity).send({ from: buyer, value: totalCost });

      const totalCoffeesSold = await coffee.methods.totalCoffeesSold().call();
      const totalEtherReceived = await coffee.methods.totalEtherReceived().call();

      expect(totalCoffeesSold).to.equal(String(quantity));
      expect(totalEtherReceived).to.equal(totalCost);
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
          value: web3.utils.toWei("0.001", "ether"),
        })
      ).to.be.revertedWith("DirectEtherTransferNotAllowed");
    });
  });
});
