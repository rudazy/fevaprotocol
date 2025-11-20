import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const network = hre.network.name;

  console.log("\n💰 Balance Check");
  console.log("================\n");
  console.log("📍 Network:", network);
  console.log("👛 Address:", deployer.address);
  console.log("💵 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.log("⚠️  WARNING: Account has no balance!");
    console.log("\n🔗 Get testnet ETH from:");

    if (network === "sepolia") {
      console.log("   Sepolia Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
    } else if (network === "arc") {
      console.log("   Arc Faucet: https://faucet-arc-testnet.xana.net");
    }
  } else if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low balance!");
    console.log("   Recommend at least 0.1 ETH for deployment");
  } else {
    console.log("✅ Balance looks good!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
