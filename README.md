# FEVA PROTOCOL

A decentralized exchange (DEX) and memecoin launchpad built on blockchain technology. FEVA Protocol allows users to create, trade, and provide liquidity for memecoins using the native $FEV token as the base trading pair.

## Overview

FEVA Protocol consists of:
- **$FEV Token**: Native ERC20 token with 1 billion fixed supply
- **DEX (Decentralized Exchange)**: Uniswap V2-style AMM for TOKEN/$FEV pairs
- **Token Factory**: Platform for deploying memecoins with metadata
- **Liquidity Pools**: Automated market maker for seamless token swaps

## Features

- Create custom ERC20 tokens with metadata (logo, socials, description)
- All tokens have a fixed supply of 1 billion
- All trading pairs use $FEV as the base currency (TOKEN/$FEV)
- Add/remove liquidity to earn trading fees
- Swap tokens with low slippage using AMM algorithm
- 0.3% trading fee (0.25% to LPs, 0.05% to protocol)

## Project Structure

```
fevaprotocol/
├── contracts/
│   ├── interfaces/
│   │   ├── IDEXFactory.sol    # Factory interface
│   │   ├── IDEXPair.sol       # Pair interface
│   │   └── IDEXRouter.sol     # Router interface
│   ├── FEVToken.sol           # Native FEV token
│   ├── DEXFactory.sol         # Creates trading pairs
│   ├── DEXPair.sol            # AMM liquidity pool
│   ├── DEXRouter.sol          # Handles swaps & liquidity
│   └── TokenFactory.sol       # Memecoin deployment
├── scripts/
│   └── deploy-all.js          # Deployment script
├── test/                      # Test files (to be added)
├── frontend/                  # React frontend (Phase 3)
├── backend/                   # Node.js backend (Phase 2)
├── hardhat.config.js          # Hardhat configuration
└── .env.example               # Environment variables template
```

## Smart Contracts

### FEVToken.sol
- ERC20 token with 1 billion fixed supply
- Burnable tokens
- Used as base currency for all trading pairs

### DEXFactory.sol
- Creates new TOKEN/$FEV trading pairs
- Manages pair registry
- Controls protocol fee settings

### DEXPair.sol
- Implements constant product AMM (x * y = k)
- LP tokens for liquidity providers
- Swap, mint, and burn functions
- Price oracle via cumulative prices

### DEXRouter.sol
- User-friendly interface for DEX operations
- Add/remove liquidity functions
- Token swap functions (exact input/output)
- Quote and price calculation helpers

### TokenFactory.sol
- Deploy custom ERC20 memecoins
- Store token metadata (logo, socials, description)
- Track all created tokens and creators
- Update metadata (creator only)

## Setup Instructions

### Prerequisites
- Node.js v18+ and npm
- Git
- MetaMask or similar Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rudazy/fevaprotocol.git
cd fevaprotocol
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `PRIVATE_KEY`: Your wallet private key
- `ARC_RPC_URL`: Arc testnet RPC endpoint
- `SEPOLIA_RPC_URL`: Sepolia testnet RPC endpoint
- `ETHERSCAN_API_KEY`: Etherscan API key (for verification)

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy Contracts

#### Deploy to Arc Testnet:
```bash
npx hardhat run scripts/deploy-all.js --network arc
```

#### Deploy to Sepolia Testnet:
```bash
npx hardhat run scripts/deploy-all.js --network sepolia
```

#### Deploy to Local Hardhat Network:
```bash
npx hardhat node
# In a new terminal:
npx hardhat run scripts/deploy-all.js --network localhost
```

### Verify Contracts

After deployment, verify contracts on block explorer:

```bash
npx hardhat verify --network <network> <contract-address> <constructor-args>
```

Example:
```bash
npx hardhat verify --network sepolia 0x123... "0xYourAddress"
```

## Deployed Contract Addresses

### Arc Testnet
- FEV Token: `TBD`
- DEX Factory: `TBD`
- DEX Router: `TBD`
- Token Factory: `TBD`

### Sepolia Testnet
- FEV Token: `TBD`
- DEX Factory: `TBD`
- DEX Router: `TBD`
- Token Factory: `TBD`

## Usage Examples

### Create a Memecoin

```javascript
const tokenFactory = await ethers.getContractAt("TokenFactory", FACTORY_ADDRESS);

const tx = await tokenFactory.createToken(
  "My Memecoin",
  "MEME",
  "https://example.com/logo.png",
  "https://mymemecoin.com",
  "https://twitter.com/mymemecoin",
  "https://t.me/mymemecoin",
  "The best memecoin ever created!"
);

await tx.wait();
```

### Add Liquidity

```javascript
const router = await ethers.getContractAt("DEXRouter", ROUTER_ADDRESS);
const token = await ethers.getContractAt("ERC20", TOKEN_ADDRESS);
const fev = await ethers.getContractAt("FEVToken", FEV_ADDRESS);

// Approve tokens
await token.approve(ROUTER_ADDRESS, amountToken);
await fev.approve(ROUTER_ADDRESS, amountFEV);

// Add liquidity
await router.addLiquidity(
  TOKEN_ADDRESS,
  amountToken,
  amountFEV,
  minAmountToken,
  minAmountFEV,
  yourAddress,
  deadline
);
```

### Swap Tokens

```javascript
const router = await ethers.getContractAt("DEXRouter", ROUTER_ADDRESS);

// Approve tokens
await token.approve(ROUTER_ADDRESS, amountIn);

// Swap tokens for FEV
await router.swapExactTokensForFEV(
  amountIn,
  minAmountOut,
  TOKEN_ADDRESS,
  yourAddress,
  deadline
);
```

## Security Features

- **ReentrancyGuard**: Protects against reentrancy attacks
- **SafeERC20**: Safe token transfer operations
- **Custom Errors**: Gas-efficient error handling
- **Access Control**: Ownable contracts with proper permissions
- **Overflow Protection**: Solidity 0.8.20+ built-in checks

## Development Roadmap

### Phase 1: Smart Contracts Foundation ✅
- [x] FEV Token implementation
- [x] DEX contracts (Factory, Pair, Router)
- [x] Token Factory with metadata
- [x] Deployment scripts
- [ ] Comprehensive test suite

### Phase 2: Backend API & MongoDB (In Progress)
- [ ] REST API for token metadata
- [ ] MongoDB integration
- [ ] User authentication
- [ ] Analytics endpoints

### Phase 3: Frontend dApp
- [ ] React.js web application
- [ ] Web3 wallet integration
- [ ] Token creation interface
- [ ] Trading interface
- [ ] Liquidity management

### Phase 4: Advanced Features
- [ ] Governance system
- [ ] Staking rewards
- [ ] Token vesting
- [ ] Advanced analytics

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact & Support

- GitHub: [@rudazy](https://github.com/rudazy)
- Repository: [fevaprotocol](https://github.com/rudazy/fevaprotocol)

## Disclaimer

This software is provided as-is. Use at your own risk. Always do your own research (DYOR) before investing in any cryptocurrency or token.

---

Built with ❤️ for the memecoin community
