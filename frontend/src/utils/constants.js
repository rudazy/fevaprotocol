// Network configurations
export const NETWORKS = {
  ARC: {
    id: 8668,
    name: 'Arc Testnet',
    rpcUrl: import.meta.env.VITE_ARC_RPC_URL || 'https://rpc-arc-testnet.xana.net',
    blockExplorer: 'https://explorer-arc-testnet.xana.net',
  },
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
};

// Contract addresses (from environment variables)
export const CONTRACTS = {
  ARC: {
    FEV_TOKEN: import.meta.env.VITE_FEV_TOKEN_ARC || '',
    DEX_FACTORY: import.meta.env.VITE_DEX_FACTORY_ARC || '',
    DEX_ROUTER: import.meta.env.VITE_DEX_ROUTER_ARC || '',
    TOKEN_FACTORY: import.meta.env.VITE_TOKEN_FACTORY_ARC || '',
  },
  SEPOLIA: {
    FEV_TOKEN: import.meta.env.VITE_FEV_TOKEN_SEPOLIA || '',
    DEX_FACTORY: import.meta.env.VITE_DEX_FACTORY_SEPOLIA || '',
    DEX_ROUTER: import.meta.env.VITE_DEX_ROUTER_SEPOLIA || '',
    TOKEN_FACTORY: import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA || '',
  },
};

// API configuration
export const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';

// Task types and points
export const TASK_TYPES = {
  SWAP: { type: 'swap', points: 10, name: 'Make a Swap' },
  BRIDGE: { type: 'bridge', points: 15, name: 'Bridge Tokens' },
  DEPLOY: { type: 'deploy', points: 50, name: 'Deploy a Token' },
  ADD_LIQUIDITY: { type: 'addLiquidity', points: 20, name: 'Add Liquidity' },
  TRADE_3: { type: 'trade3Different', points: 25, name: 'Trade 3 Different Tokens' },
  FOLLOW_TWITTER: { type: 'followTwitter', points: 50, name: 'Follow on Twitter' },
  JOIN_TELEGRAM: { type: 'joinTelegram', points: 50, name: 'Join Telegram' },
  JOIN_DISCORD: { type: 'joinDiscord', points: 50, name: 'Join Discord' },
};

// Default slippage tolerance (1%)
export const DEFAULT_SLIPPAGE = 1;

// Token decimals
export const DEFAULT_DECIMALS = 18;

// Faucet URLs
export const FAUCETS = {
  SEPOLIA_ETH: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
  CIRCLE_USDC: 'https://faucet.circle.com',
  ARC: 'https://faucet-arc-testnet.xana.net',
};

// Social links
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/fevaprotocol',
  TELEGRAM: 'https://t.me/fevaprotocol',
  DISCORD: 'https://discord.gg/fevaprotocol',
  GITHUB: 'https://github.com/rudazy/fevaprotocol',
};
