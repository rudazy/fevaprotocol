import hre from "hardhat";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

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

// Helper to wait between deployments (avoid nonce issues)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🚀 Starting Arc Testnet deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("📍 Deploying to: Arc Testnet");
  console.log("👛 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no balance! Get testnet ETH from https://faucet-arc-testnet.xana.net");
  }

  // Read existing deployments
  const deployments = readDeployments();
  if (!deployments.arc) {
    deployments.arc = {};
  }

  try {
    // ===== Deploy FEV Token =====
    console.log("📦 Step 1/4: Deploying FEVToken...");
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

    // Save FEV token address immediately
    deployments.arc.FEVToken = fevAddress;
    saveDeployments(deployments);

    // Wait 5 seconds before next deployment
    console.log("⏳ Waiting 5 seconds before next deployment...\n");
    await delay(5000);

    // ===== Deploy DEX Factory =====
    console.log("📦 Step 2/4: Deploying DEXFactory...");
    const DEXFactory = await hre.ethers.getContractFactory("DEXFactory");
    const factory = await DEXFactory.deploy(deployer.address);

    console.log("⏳ Waiting for deployment transaction...");
    await factory.waitForDeployment();

    const factoryAddress = await factory.getAddress();
    const factoryDeployTx = factory.deploymentTransaction();

    console.log("✅ DEXFactory deployed to:", factoryAddress);
    console.log("📊 Gas used:", factoryDeployTx.gasLimit.toString());
    console.log("🧾 Transaction hash:", factoryDeployTx.hash);

    console.log("⏳ Waiting for 2 confirmations...");
    await factoryDeployTx.wait(2);
    console.log("✅ Confirmed!\n");

    // Save factory address
    deployments.arc.DEXFactory = factoryAddress;
    saveDeployments(deployments);

    // Wait 5 seconds before next deployment
    console.log("⏳ Waiting 5 seconds before next deployment...\n");
    await delay(5000);

    // ===== Deploy DEX Router =====
    console.log("📦 Step 3/4: Deploying DEXRouter...");
    console.log("   Factory:", factoryAddress);
    console.log("   FEV Token:", fevAddress);

    const DEXRouter = await hre.ethers.getContractFactory("DEXRouter");
    const router = await DEXRouter.deploy(factoryAddress, fevAddress);

    console.log("⏳ Waiting for deployment transaction...");
    await router.waitForDeployment();

    const routerAddress = await router.getAddress();
    const routerDeployTx = router.deploymentTransaction();

    console.log("✅ DEXRouter deployed to:", routerAddress);
    console.log("📊 Gas used:", routerDeployTx.gasLimit.toString());
    console.log("🧾 Transaction hash:", routerDeployTx.hash);

    console.log("⏳ Waiting for 2 confirmations...");
    await routerDeployTx.wait(2);
    console.log("✅ Confirmed!\n");

    // Save router address
    deployments.arc.DEXRouter = routerAddress;
    saveDeployments(deployments);

    // Wait 5 seconds before next deployment
    console.log("⏳ Waiting 5 seconds before next deployment...\n");
    await delay(5000);

    // ===== Deploy Token Factory =====
    console.log("📦 Step 4/4: Deploying TokenFactory...");
    console.log("   Factory:", factoryAddress);
    console.log("   Router:", routerAddress);
    console.log("   FEV Token:", fevAddress);

    const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
    const tokenFactory = await TokenFactory.deploy(
      factoryAddress,
      routerAddress,
      fevAddress
    );

    console.log("⏳ Waiting for deployment transaction...");
    await tokenFactory.waitForDeployment();

    const tokenFactoryAddress = await tokenFactory.getAddress();
    const tokenFactoryDeployTx = tokenFactory.deploymentTransaction();

    console.log("✅ TokenFactory deployed to:", tokenFactoryAddress);
    console.log("📊 Gas used:", tokenFactoryDeployTx.gasLimit.toString());
    console.log("🧾 Transaction hash:", tokenFactoryDeployTx.hash);

    console.log("⏳ Waiting for 2 confirmations...");
    await tokenFactoryDeployTx.wait(2);
    console.log("✅ Confirmed!\n");

    // Save token factory address
    deployments.arc.TokenFactory = tokenFactoryAddress;
    deployments.arc.deployedAt = new Date().toISOString();
    deployments.arc.deployer = deployer.address;
    deployments.arc.network = "arc";
    deployments.arc.chainId = 8668;

    saveDeployments(deployments);

    // ===== Verify Deployments =====
    console.log("\n🔍 Verifying contract states...");

    const totalSupply = await fevToken.totalSupply();
    const decimals = await fevToken.decimals();
    const factoryOwner = await factory.owner();
    const routerFactory = await router.factory();
    const routerFEV = await router.FEV();

    console.log("\n📊 Contract Details:");
    console.log("\n   FEVToken:");
    console.log("     Total Supply:", hre.ethers.formatUnits(totalSupply, decimals), "FEV");
    console.log("     Decimals:", decimals.toString());
    console.log("     Owner:", await fevToken.owner());

    console.log("\n   DEXFactory:");
    console.log("     Owner:", factoryOwner);
    console.log("     Pair Code Hash:", await factory.INIT_CODE_PAIR_HASH());

    console.log("\n   DEXRouter:");
    console.log("     Factory:", routerFactory);
    console.log("     FEV Token:", routerFEV);
    console.log("     Factory Match:", routerFactory === factoryAddress ? "✅" : "❌");
    console.log("     FEV Match:", routerFEV === fevAddress ? "✅" : "❌");

    console.log("\n   TokenFactory:");
    console.log("     Factory:", await tokenFactory.factory());
    console.log("     Router:", await tokenFactory.router());
    console.log("     FEV:", await tokenFactory.FEV());

    console.log("\n🎉 Arc Testnet deployment complete!");

    console.log("\n📋 Deployed Contracts:");
    console.log("   FEVToken:      ", fevAddress);
    console.log("   DEXFactory:    ", factoryAddress);
    console.log("   DEXRouter:     ", routerAddress);
    console.log("   TokenFactory:  ", tokenFactoryAddress);

    console.log("\n🔍 View on Arc Explorer:");
    console.log(`   FEVToken:      https://explorer-arc-testnet.xana.net/address/${fevAddress}`);
    console.log(`   DEXFactory:    https://explorer-arc-testnet.xana.net/address/${factoryAddress}`);
    console.log(`   DEXRouter:     https://explorer-arc-testnet.xana.net/address/${routerAddress}`);
    console.log(`   TokenFactory:  https://explorer-arc-testnet.xana.net/address/${tokenFactoryAddress}`);

    console.log("\n📝 Next Steps:");
    console.log("   1. Update frontend/.env with these addresses");
    console.log("   2. Test token creation via TokenFactory");
    console.log("   3. Create initial liquidity pools");
    console.log("   4. Bridge FEV to Sepolia (Phase 4)");

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
