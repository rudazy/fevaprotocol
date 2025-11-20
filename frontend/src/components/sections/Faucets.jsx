import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FAUCETS } from '@/utils/constants';

const Faucets = () => {
  const faucets = [
    { name: 'Sepolia ETH Faucet', url: FAUCETS.SEPOLIA_ETH, description: 'Get Sepolia testnet ETH' },
    { name: 'Circle USDC Faucet', url: FAUCETS.CIRCLE_USDC, description: 'Get testnet USDC' },
    { name: 'Arc Testnet Faucet', url: FAUCETS.ARC, description: 'Get Arc testnet ETH' },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {faucets.map((faucet) => (
        <div key={faucet.name} className="bg-secondary-black p-6 rounded-lg border border-dark-gray hover:border-primary-blue transition-colors">
          <h3 className="text-lg font-bold text-off-white mb-2">{faucet.name}</h3>
          <p className="text-light-gray text-sm mb-4">{faucet.description}</p>
          <a
            href={faucet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-blue hover:text-accent-blue transition-colors"
          >
            Open Faucet <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ))}
    </div>
  );
};

export default Faucets;
