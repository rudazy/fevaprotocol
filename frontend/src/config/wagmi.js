import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Define Arc Testnet chain
export const arcTestnet = {
  id: 8668,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_ARC_RPC_URL || 'https://rpc-arc-testnet.xana.net'] },
    public: { http: ['https://rpc-arc-testnet.xana.net'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer-arc-testnet.xana.net' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'FEVA Protocol',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [arcTestnet, sepolia],
  ssr: false,
});
