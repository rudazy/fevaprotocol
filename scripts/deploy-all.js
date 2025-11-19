import hre from "hardhat";

async function main() {
  console.log("🚀 Starting FEVA Protocol deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // ==================== DEPLOY FEV TOKEN ====================
  console.log("📝 Deploying FEV Token...");
  const FEVToken = await hre.ethers.getContractFactory("FEVToken");
  const fevToken = await FEVToken.deploy(deployer.address);
  await fevToken.waitForDeployment();
  const fevTokenAddress = await fevToken.getAddress();
  console.log("✅ FEV Token deployed to:", fevTokenAddress);

  const totalSupply = await fevToken.totalSupply();
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "FEV\n");

  // ==================== DEPLOY DEX FACTORY ====================
  console.log("📝 Deploying DEX Factory...");
  const DEXFactory = await hre.ethers.getContractFactory("DEXFactory");
  const dexFactory = await DEXFactory.deploy(deployer.address);
  await dexFactory.waitForDeployment();
  const dexFactoryAddress = await dexFactory.getAddress();
  console.log("✅ DEX Factory deployed to:", dexFactoryAddress, "\n");

  // ==================== DEPLOY DEX ROUTER ====================
  console.log("📝 Deploying DEX Router...");
  const DEXRouter = await hre.ethers.getContractFactory("DEXRouter");
  const dexRouter = await DEXRouter.deploy(dexFactoryAddress, fevTokenAddress);
  await dexRouter.waitForDeployment();
  const dexRouterAddress = await dexRouter.getAddress();
  console.log("✅ DEX Router deployed to:", dexRouterAddress, "\n");

  // ==================== DEPLOY TOKEN FACTORY ====================
  console.log("📝 Deploying Token Factory...");
  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy();
  await tokenFactory.waitForDeployment();
  const tokenFactoryAddress = await tokenFactory.getAddress();
  console.log("✅ Token Factory deployed to:", tokenFactoryAddress, "\n");

  // ==================== DEPLOYMENT SUMMARY ====================
  console.log("=" .repeat(60));
  console.log("🎉 FEVA PROTOCOL DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("\n📋 CONTRACT ADDRESSES:\n");
  console.log("FEV Token:       ", fevTokenAddress);
  console.log("DEX Factory:     ", dexFactoryAddress);
  console.log("DEX Router:      ", dexRouterAddress);
  console.log("Token Factory:   ", tokenFactoryAddress);
  console.log("\n" + "=" .repeat(60));

  // Save deployment addresses to a file
  const fs = await import("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      FEVToken: fevTokenAddress,
      DEXFactory: dexFactoryAddress,
      DEXRouter: dexRouterAddress,
      TokenFactory: tokenFactoryAddress,
    },
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${deploymentsDir}/${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filename}`);

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n📝 To verify contracts on block explorer, run:");
    console.log(`\nnpx hardhat verify --network ${hre.network.name} ${fevTokenAddress} "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${dexFactoryAddress} "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${dexRouterAddress} "${dexFactoryAddress}" "${fevTokenAddress}"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${tokenFactoryAddress}`);
  }

  console.log("\n✨ Deployment script completed successfully!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
