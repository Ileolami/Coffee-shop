const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const CoffeeModule = buildModule("CoffeeModule", (m) => {
  const coffee = m.contract("Coffee");

  return { coffee };
});

module.exports = CoffeeModule;