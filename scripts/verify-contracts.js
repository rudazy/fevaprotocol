import hre from "hardhat";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const DEPLOYMENTS_FILE = join(process.cwd(), "deployments.json");

// Helper to read deployments
function readDeployments() {
  if (!existsSync(DEPLOYMENTS_FILE)) {
    throw new Error(`❌ ${DEPLOYMENTS_FILE} not found! Deploy contracts first.`);
  }
  return JSON.parse(readFileSync(DEPLOYMENTS_FILE, "utf8"));
}

// Helper to wait between verifications
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyContract(address, constructorArguments, contractName, network) {
  try {
    console.log(`\n🔍 Verifying ${contractName} on ${network}...`);
    console.log(`   Address: ${address}`);
    console.log(`   Constructor args:`, constructorArguments);

    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });

    console.log(`✅ ${contractName} verified successfully!`);
    return true;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`ℹ️  ${contractName} is already verified`);
      return true;
    } else {
      console.error(`❌ Failed to verify ${contractName}:`, error.message);
      return false;
    }
  }
}

async function verifySepolia() {
  console.log("\n📋 Verifying Sepolia contracts...");

  const deployments = readDeployments();
  if (!deployments.sepolia) {
    console.log("⚠️  No Sepolia deployments found");
    return;
  }

  const { FEVToken, deployer } = deployments.sepolia;

  // Verify FEVToken
  await verifyContract(
    FEVToken,
    [deployer], // constructor argument: initialOwner
    "FEVToken",
    "Sepolia"
  );

  console.log("\n✅ Sepolia verification complete!");
  console.log(`   View on Etherscan: https://sepolia.etherscan.io/address/${FEVToken}`);
}

async function verifyArc() {
  console.log("\n📋 Verifying Arc Testnet contracts...");

  const deployments = readDeployments();
  if (!deployments.arc) {
    console.log("⚠️  No Arc deployments found");
    return;
  }

  const { FEVToken, DEXFactory, DEXRouter, TokenFactory, deployer } = deployments.arc;

  // Verify FEVToken
  await verifyContract(
    FEVToken,
    [deployer],
    "FEVToken",
    "Arc"
  );

  await delay(3000);

  // Verify DEXFactory
  await verifyContract(
    DEXFactory,
    [deployer],
    "DEXFactory",
    "Arc"
  );

  await delay(3000);

  // Verify DEXRouter
  await verifyContract(
    DEXRouter,
    [DEXFactory, FEVToken],
    "DEXRouter",
    "Arc"
  );

  await delay(3000);

  // Verify TokenFactory
  await verifyContract(
    TokenFactory,
    [DEXFactory, DEXRouter, FEVToken],
    "TokenFactory",
    "Arc"
  );

  console.log("\n✅ Arc verification complete!");
  console.log(`   View on Explorer:`);
  console.log(`   FEVToken:      https://explorer-arc-testnet.xana.net/address/${FEVToken}`);
  console.log(`   DEXFactory:    https://explorer-arc-testnet.xana.net/address/${DEXFactory}`);
  console.log(`   DEXRouter:     https://explorer-arc-testnet.xana.net/address/${DEXRouter}`);
  console.log(`   TokenFactory:  https://explorer-arc-testnet.xana.net/address/${TokenFactory}`);
}

async function main() {
  const args = process.argv.slice(2);
  const network = args[0];

  console.log("🔍 Contract Verification Tool");
  console.log("==============================\n");

  try {
    if (!network || network === "all") {
      console.log("📍 Verifying contracts on all networks...\n");
      await verifySepolia();
      await verifyArc();
    } else if (network === "sepolia") {
      await verifySepolia();
    } else if (network === "arc") {
      await verifyArc();
    } else {
      console.log("❌ Invalid network. Use: sepolia, arc, or all");
      console.log("\nUsage:");
      console.log("  npm run verify sepolia");
      console.log("  npm run verify arc");
      console.log("  npm run verify all");
      process.exit(1);
    }

    console.log("\n🎉 Verification process complete!");

  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
