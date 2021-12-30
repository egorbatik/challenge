/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat/config")
require("@nomiclabs/hardhat-web3");

const { ETHPool_abi } = require('./abi/ethpool_abi');

const { ALCHEMY_API_KEY, ROPSTEN_PRIVATE_KEY } = process.env;

task(
  "balance",
  "Prints the results of getTotalPoolBalance()",
  async function (taskArguments, hre, runSuper) {
    const ETHPoolContract = new web3.eth.Contract(ETHPool_abi, '0xb07BEAF62Be1C61466A3BEBeCE9e8bc63270B54d');
    console.log(await ETHPoolContract.methods.getTotalPoolBalance().call());
  }
);

module.exports = {
  solidity: "0.8.7",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${ROPSTEN_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  
  
};
