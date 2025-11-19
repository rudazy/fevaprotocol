import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Arc Testnet Configuration
    arc: {
      url: process.env.ARC_RPC_URL || "https://rpc-arc-testnet.xana.net",
      chainId: 8668,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    // Sepolia Testnet Configuration
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    // Hardhat local network
    hardhat: {
      chainId: 31337,
    },
    // Localhost
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      arc: "no-api-key-needed", // Arc testnet might not have Etherscan verification
    },
    customChains: [
      {
        network: "arc",
        chainId: 8668,
        urls: {
          apiURL: "https://explorer-arc-testnet.xana.net/api",
          browserURL: "https://explorer-arc-testnet.xana.net"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
