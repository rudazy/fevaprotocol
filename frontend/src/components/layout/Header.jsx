import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <header className="bg-card-black border-b border-dark-gray">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔥</span>
          <h1 className="text-2xl font-bold text-gradient">FEVA PROTOCOL</h1>
        </div>

        <ConnectButton
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </header>
  );
};

export default Header;
