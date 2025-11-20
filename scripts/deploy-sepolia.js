const hre = require("hardhat");
const { writeFileSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");

const DEPLOYMENTS_FILE = join(process.cwd(), "deployments.json");

// Helper to read existing deployments
function readDeployments() {
  if (existsSync(DEPLOYMENTS_FILE)) {
    return JSON.parse(readFileSync(DEPLOYMENTS_FILE, "utf8"));
  }
  return {};
}

// Helper to save deployments
function saveDeployments(deployments) {
  writeFileSync(
    DEPLOYMENTS_FILE,
    JSON.stringify(deployments, null, 2),
    "utf8"
  );
  console.log(`\n📝 Deployment addresses saved to ${DEPLOYMENTS_FILE}`);
}

async function main() {
  console.log("🚀 Starting Sepolia deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("📍 Deploying to: Sepolia Testnet");
  console.log("👛 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no balance! Get testnet ETH from https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
  }

  // Read existing deployments
  const deployments = readDeployments();
  if (!deployments.sepolia) {
    deployments.sepolia = {};
  }

  try {
    // ===== Deploy FEV Token =====
    console.log("📦 Deploying FEVToken...");
    const FEVToken = await hre.ethers.getContractFactory("FEVToken");
    const fevToken = await FEVToken.deploy(deployer.address);

    console.log("⏳ Waiting for deployment transaction...");
    await fevToken.waitForDeployment();

    const fevAddress = await fevToken.getAddress();
    const fevDeployTx = fevToken.deploymentTransaction();

    console.log("✅ FEVToken deployed to:", fevAddress);
    console.log("📊 Gas used:", fevDeployTx.gasLimit.toString());
    console.log("🧾 Transaction hash:", fevDeployTx.hash);

    // Wait for 2 confirmations
    console.log("⏳ Waiting for 2 confirmations...");
    await fevDeployTx.wait(2);
    console.log("✅ Confirmed!\n");

    // Save deployment
    deployments.sepolia.FEVToken = fevAddress;
    deployments.sepolia.deployedAt = new Date().toISOString();
    deployments.sepolia.deployer = deployer.address;
    deployments.sepolia.network = "sepolia";
    deployments.sepolia.chainId = 11155111;

    saveDeployments(deployments);

    // Verify token supply
    const totalSupply = await fevToken.totalSupply();
    const decimals = await fevToken.decimals();
    console.log("\n📊 Token Details:");
    console.log("   Total Supply:", hre.ethers.formatUnits(totalSupply, decimals), "FEV");
    console.log("   Decimals:", decimals.toString());
    console.log("   Owner:", await fevToken.owner());

    console.log("\n🎉 Sepolia deployment complete!");
    console.log("\n📋 Deployed Contracts:");
    console.log("   FEVToken:", fevAddress);

    console.log("\n🔍 Verify on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${fevAddress}`);

    console.log("\n⚙️  To verify contracts, run:");
    console.log(`   npx hardhat verify --network sepolia ${fevAddress} "${deployer.address}"`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
