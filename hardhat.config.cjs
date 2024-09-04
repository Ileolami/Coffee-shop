require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-web3-v4");
const HardhatUserConfig = require("hardhat/config");

const dRPC_API_KEY = process.env.VITE_dRPC_API_KEY;
const PRIVATE_KEY = process.env.VITE_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://lb.drpc.org/ogrpc?network=sepolia&dkey=${dRPC_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
    }
  }
};
