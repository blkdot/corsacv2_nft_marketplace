require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

require("dotenv").config();
// require("hardhat-deploy");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "testnet",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [
        "2c9950b89e00f2585a5e1a353648b2ea07fd3cf437146b4dc1b2b624e045596d",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
      ]
    },
    hardhat: {
      forking: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        chainId: 97,
        gasPrice: 20000000000,
        // accounts: ["9e33e7fc1edaad3099f6788013921c5a01f418be85eff34f94a6a8923b6fc671"]
        accounts: [
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
          "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
        ]
      }
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 4,
      gasPrice: "auto",
      accounts: ["2c9950b89e00f2585a5e1a353648b2ea07fd3cf437146b4dc1b2b624e045596d"],
    },
    kovan: {
      url: "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 42,
      gasPrice: "auto",
      accounts: ["2c9950b89e00f2585a5e1a353648b2ea07fd3cf437146b4dc1b2b624e045596d"],
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      // gas: 2100000,
      // gasPrice: 8000000000,
      accounts: ["2c9950b89e00f2585a5e1a353648b2ea07fd3cf437146b4dc1b2b624e045596d"]
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,

      gasPrice: 20000000000,
      accounts: ["9e33e7fc1edaad3099f6788013921c5a01f418be85eff34f94a6a8923b6fc671"]
    }
  },
  etherscan: {
    apiKey: 
    {
      mainnet: "B77M9DYRXMQC74ZI9N8TH5EETPMSX66MAE",
      ropsten: "B77M9DYRXMQC74ZI9N8TH5EETPMSX66MAE",
      rinkeby: "B77M9DYRXMQC74ZI9N8TH5EETPMSX66MAE",
      goerli: "B77M9DYRXMQC74ZI9N8TH5EETPMSX66MAE",
      kovan: "B77M9DYRXMQC74ZI9N8TH5EETPMSX66MAE",
      // binance smart chain
      bsc: "P5W8JCU8Q3F8CNVX69DXU8PCFVE6VGG8QT",
      bscTestnet: "P5W8JCU8Q3F8CNVX69DXU8PCFVE6VGG8QT"
    }
  },
  solidity: {
    version: "0.8.1",
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  // paths: {
  //   sources: "./contracts",
  //   tests: "./test",
  //   cache: "./cache",
  //   artifacts: "./artifacts"
  // },
  // mocha: {
  //   timeout: 200000
  // }
};
