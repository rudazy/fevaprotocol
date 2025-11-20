# 🚀 FEVA Protocol - Smart Contract Deployment Guide

Complete guide for deploying Phase 1 smart contracts to Arc Testnet and Sepolia Testnet.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Getting Testnet ETH](#getting-testnet-eth)
4. [Deployment Process](#deployment-process)
5. [Contract Verification](#contract-verification)
6. [Frontend Integration](#frontend-integration)
7. [Troubleshooting](#troubleshooting)
8. [Deployed Contracts](#deployed-contracts)

---

## 🔧 Prerequisites

### Required Tools

- **Node.js** v18+ and npm
- **MetaMask** wallet (or any Web3 wallet)
- **Testnet ETH** on both networks
- **RPC Access** (Alchemy, Infura, or public RPCs)

### Check Installation

```bash
node --version  # Should be v18 or higher
npm --version   # Should be v8 or higher
```

### Install Dependencies

```bash
# Navigate to project root
cd fevaprotocol

# Install all dependencies
npm install
```

---

## 🔐 Environment Setup

### 1. Create `.env` File

Copy the example file and fill in your details:

```bash
# Copy example
cp .env.example .env

# Edit with your values
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

### 2. Get Private Key from MetaMask

**⚠️ SECURITY WARNING: Never commit your private key to git!**

1. Open MetaMask
2. Click the 3 dots menu → Account details
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key
6. Paste into `.env` file:

```env
PRIVATE_KEY=your_64_character_private_key_here
```

### 3. Get RPC URLs

#### Option A: Alchemy (Recommended)

1. Go to [https://www.alchemy.com/](https://www.alchemy.com/)
2. Sign up / Log in
3. Create a new app for Sepolia
4. Copy the HTTPS URL
5. Add to `.env`:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE
```

#### Option B: Infura

1. Go to [https://infura.io/](https://infura.io/)
2. Sign up / Log in
3. Create a new API key
4. Add to `.env`:

```env
INFURA_API_KEY=your_infura_key_here
```

#### Arc Testnet RPC

Arc testnet RPC is already configured (public):

```env
ARC_RPC_URL=https://rpc-arc-testnet.xana.net
```

### 4. Get Etherscan API Key (For Verification)

1. Go to [https://etherscan.io/myapikey](https://etherscan.io/myapikey)
2. Sign up / Log in
3. Create a new API key
4. Add to `.env`:

```env
ETHERSCAN_API_KEY=your_etherscan_key_here
```

### 5. Verify `.env` File

Your `.env` should look like:

```env
PRIVATE_KEY=abc123def456...
ARC_RPC_URL=https://rpc-arc-testnet.xana.net
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=ABC123DEF456
```

### 6. Add `.env` to `.gitignore`

**Critical: Ensure `.env` is in `.gitignore`**

```bash
# Check if .env is ignored
cat .gitignore | grep .env

# If not found, add it:
echo ".env" >> .gitignore
```

---

## 💰 Getting Testnet Tokens

### Sepolia Testnet ETH

**You need ~0.1 ETH on Sepolia for FEV token deployment**

#### Faucet Options:

1. **Google Cloud Faucet** (Recommended)
   - URL: [https://cloud.google.com/application/web3/faucet/ethereum/sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
   - Amount: 0.05 ETH per day
   - Requires Google account

2. **Alchemy Faucet**
   - URL: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
   - Amount: 0.5 ETH
   - Requires Alchemy account

3. **Infura Faucet**
   - URL: [https://www.infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia)
   - Amount: 0.5 ETH
   - Requires Infura account

### Arc Testnet USDC (Gas Token)

**⚠️ IMPORTANT: Arc Testnet uses USDC as the gas token, NOT ETH!**

**You need ~500 USDC on Arc for all contracts (FEV, Factory, Router, TokenFactory)**

1. **Arc Faucet**
   - URL: [https://faucet-arc-testnet.xana.net](https://faucet-arc-testnet.xana.net)
   - Token: USDC (used for gas fees)
   - Amount: Varies (request at least 500 USDC)
   - May require social verification

### Verify Balance

```bash
# Check Sepolia ETH balance
npx hardhat run scripts/check-balance.js --network sepolia

# Check Arc USDC balance (gas token)
npx hardhat run scripts/check-balance.js --network arc
```

---

## 🚀 Deployment Process

### Deploy to Sepolia (FEV Token Only)

**Purpose:** Deploy FEV token for bridge functionality in Phase 4

```bash
# Deploy FEV token to Sepolia
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

**Expected Output:**

```
🚀 Starting Sepolia deployment...

📍 Deploying to: Sepolia Testnet
👛 Deployer address: 0xYourAddress
💰 Deployer balance: 0.1 ETH

📦 Deploying FEVToken...
⏳ Waiting for deployment transaction...
✅ FEVToken deployed to: 0xFEVAddress
📊 Gas used: 1234567
🧾 Transaction hash: 0xtxhash
⏳ Waiting for 2 confirmations...
✅ Confirmed!

📝 Deployment addresses saved to deployments.json

📊 Token Details:
   Total Supply: 1000000000.0 FEV
   Decimals: 18
   Owner: 0xYourAddress

🎉 Sepolia deployment complete!

📋 Deployed Contracts:
   FEVToken: 0xFEVAddress

🔍 Verify on Etherscan:
   https://sepolia.etherscan.io/address/0xFEVAddress
```

### Deploy to Arc Testnet (Full DEX System)

**Purpose:** Deploy complete DEX with FEV, Factory, Router, and TokenFactory

```bash
# Deploy all contracts to Arc
npx hardhat run scripts/deploy-arc.js --network arc
```

**Expected Output:**

```
🚀 Starting Arc Testnet deployment...

📍 Deploying to: Arc Testnet
👛 Deployer address: 0xYourAddress
💰 Deployer balance: 500.0 USDC (gas token)

📦 Step 1/4: Deploying FEVToken...
✅ FEVToken deployed to: 0xFEVAddress
⏳ Waiting 5 seconds before next deployment...

📦 Step 2/4: Deploying DEXFactory...
✅ DEXFactory deployed to: 0xFactoryAddress
⏳ Waiting 5 seconds before next deployment...

📦 Step 3/4: Deploying DEXRouter...
✅ DEXRouter deployed to: 0xRouterAddress
⏳ Waiting 5 seconds before next deployment...

📦 Step 4/4: Deploying TokenFactory...
✅ TokenFactory deployed to: 0xTokenFactoryAddress

🔍 Verifying contract states...

📊 Contract Details:
   FEVToken:
     Total Supply: 1000000000.0 FEV
     Decimals: 18
     Owner: 0xYourAddress

   DEXFactory:
     Owner: 0xYourAddress
     Pair Code Hash: 0xhash...

   DEXRouter:
     Factory: 0xFactoryAddress
     FEV Token: 0xFEVAddress
     Factory Match: ✅
     FEV Match: ✅

🎉 Arc Testnet deployment complete!

📋 Deployed Contracts:
   FEVToken:      0xFEV...
   DEXFactory:    0xFactory...
   DEXRouter:     0xRouter...
   TokenFactory:  0xTokenFactory...
```

### Deployment Files Generated

After deployment, check these files:

```bash
# Contains all deployed contract addresses
cat deployments.json

# Example output:
{
  "sepolia": {
    "FEVToken": "0x...",
    "deployedAt": "2024-01-20T10:00:00.000Z",
    "deployer": "0x...",
    "network": "sepolia",
    "chainId": 11155111
  },
  "arc": {
    "FEVToken": "0x...",
    "DEXFactory": "0x...",
    "DEXRouter": "0x...",
    "TokenFactory": "0x...",
    "deployedAt": "2024-01-20T10:30:00.000Z",
    "deployer": "0x...",
    "network": "arc",
    "chainId": 8668
  }
}
```

---

## 🔍 Contract Verification

Verify contracts on block explorers for transparency and easier interaction.

### Verify Sepolia Contracts

```bash
# Verify all Sepolia contracts
npm run verify sepolia
```

### Verify Arc Contracts

```bash
# Verify all Arc contracts
npm run verify arc
```

### Verify All Networks

```bash
# Verify everything
npm run verify all
```

### Manual Verification (If Needed)

If automatic verification fails, use manual commands:

#### Sepolia - FEVToken

```bash
npx hardhat verify --network sepolia \
  0xYourFEVTokenAddress \
  "0xYourDeployerAddress"
```

#### Arc - All Contracts

```bash
# FEVToken
npx hardhat verify --network arc \
  0xFEVAddress \
  "0xDeployerAddress"

# DEXFactory
npx hardhat verify --network arc \
  0xFactoryAddress \
  "0xDeployerAddress"

# DEXRouter
npx hardhat verify --network arc \
  0xRouterAddress \
  "0xFactoryAddress" "0xFEVAddress"

# TokenFactory
npx hardhat verify --network arc \
  0xTokenFactoryAddress \
  "0xFactoryAddress" "0xRouterAddress" "0xFEVAddress"
```

---

## 🔗 Frontend Integration

### Update Frontend Environment

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Copy addresses from `deployments.json` to `frontend/.env`:**

```bash
# Create .env from example
cp .env.example .env
```

3. **Edit `frontend/.env`:**

```env
# Backend API
VITE_BACKEND_API_URL=http://localhost:5000

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Contract Addresses - Arc Testnet
VITE_FEV_TOKEN_ARC=0xYourFEVAddressOnArc
VITE_DEX_FACTORY_ARC=0xYourFactoryAddress
VITE_DEX_ROUTER_ARC=0xYourRouterAddress
VITE_TOKEN_FACTORY_ARC=0xYourTokenFactoryAddress

# Contract Addresses - Sepolia Testnet
VITE_FEV_TOKEN_SEPOLIA=0xYourFEVAddressOnSepolia
```

4. **Verify configuration in constants:**

The frontend will automatically use these addresses from `.env`. Verify in:

```bash
cat frontend/src/utils/constants.js
```

### Test Frontend Connection

```bash
# Start backend
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev

# Open http://localhost:3000
# Connect wallet
# Try swapping or viewing markets
```

---

## 🔧 Troubleshooting

### Issue 1: Insufficient Balance

**Error:** `sender doesn't have enough funds to send tx`

**Solution:**
- Get more testnet ETH from faucets
- Verify balance: `npx hardhat run scripts/check-balance.js --network sepolia`

### Issue 2: Nonce Too High

**Error:** `nonce has already been used`

**Solution:**
```bash
# Reset MetaMask account
# Settings → Advanced → Clear Activity Tab Data

# Or wait a few minutes and retry
```

### Issue 3: RPC Connection Failed

**Error:** `could not detect network` or `timeout`

**Solution:**
- Check RPC URL in `.env`
- Try different RPC provider (Alchemy, Infura)
- Check internet connection
- Try again in a few minutes

### Issue 4: Contract Already Deployed

**Error:** `contract creation code storage out of gas`

**Solution:**
- Use a different deployer address
- Or clear the existing deployment

### Issue 5: Verification Failed

**Error:** `Already Verified` or `Could not verify`

**Solution:**
- If "Already Verified", it's fine
- If failed, try manual verification with exact constructor args
- Check Etherscan API key is valid

### Issue 6: Gas Price Too Low

**Error:** `transaction underpriced`

**Solution:**
```bash
# In .env, increase gas price:
GAS_PRICE_GWEI=100

# Or let Hardhat auto-calculate:
# Remove GAS_PRICE_GWEI from .env
```

### Debug Mode

Run deployment with more logs:

```bash
# Enable debug mode
export DEBUG=true

# Run deployment
npx hardhat run scripts/deploy-arc.js --network arc --verbose
```

---

## 📊 Deployed Contracts

After successful deployment, your contracts will be available at:

### Sepolia Testnet

| Contract | Address | Explorer |
|----------|---------|----------|
| FEVToken | Check `deployments.json` | [Etherscan](https://sepolia.etherscan.io/) |

### Arc Testnet

| Contract | Address | Explorer |
|----------|---------|----------|
| FEVToken | Check `deployments.json` | [Arc Explorer](https://explorer-arc-testnet.xana.net/) |
| DEXFactory | Check `deployments.json` | [Arc Explorer](https://explorer-arc-testnet.xana.net/) |
| DEXRouter | Check `deployments.json` | [Arc Explorer](https://explorer-arc-testnet.xana.net/) |
| TokenFactory | Check `deployments.json` | [Arc Explorer](https://explorer-arc-testnet.xana.net/) |

---

## 🎯 Next Steps

After successful deployment:

1. ✅ **Verify Contracts** - Run verification scripts
2. ✅ **Update Frontend** - Add addresses to `frontend/.env`
3. ✅ **Test Token Creation** - Deploy a test token via TokenFactory
4. ✅ **Create Initial Pools** - Add liquidity for FEV pairs
5. ✅ **Test Trading** - Execute swaps through frontend
6. ⏳ **Implement Bridge** - Phase 4 (bridge FEV between networks)
7. ⏳ **Enable Tasks** - Phase 6 (task system with points)

---

## 📝 Deployment Checklist

Before deployment:
- [ ] `.env` file created with private key
- [ ] RPC URLs configured
- [ ] Etherscan API key added
- [ ] Testnet ETH acquired (0.1 Sepolia, 0.5 Arc)
- [ ] `.env` added to `.gitignore`
- [ ] Dependencies installed (`npm install`)

During deployment:
- [ ] Deploy to Sepolia (FEVToken)
- [ ] Deploy to Arc (all contracts)
- [ ] Verify deployment succeeded
- [ ] Check `deployments.json` created
- [ ] Verify contracts on explorers

After deployment:
- [ ] Update `frontend/.env` with addresses
- [ ] Test frontend connection
- [ ] Create test token
- [ ] Add test liquidity
- [ ] Execute test swap

---

## 🔗 Useful Links

- **Arc Testnet Faucet:** https://faucet-arc-testnet.xana.net
- **Arc Testnet Explorer:** https://explorer-arc-testnet.xana.net
- **Sepolia Faucet:** https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- **Sepolia Explorer:** https://sepolia.etherscan.io
- **Alchemy:** https://www.alchemy.com
- **Infura:** https://infura.io
- **MetaMask:** https://metamask.io

---

## 📞 Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review error messages carefully
3. Verify all configuration steps
4. Check testnet status (network may be down)

---

**🎉 Ready to deploy! Follow the steps above and your contracts will be live on testnets.**
