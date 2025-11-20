import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import DropdownSection from './components/layout/DropdownSection';
import Faucets from './components/sections/Faucets';
import Swap from './components/sections/Swap';
import Liquidity from './components/sections/Liquidity';
import Markets from './components/sections/Markets';
import PlaceholderSection from './components/sections/PlaceholderSection';
import { registerUser } from './utils/api';

function App() {
  const { address, isConnected } = useAccount();
  const [openSections, setOpenSections] = useState({});
  const [selectedTokenForSwap, setSelectedTokenForSwap] = useState(null);

  // Refs for scrolling
  const swapRef = useRef(null);

  // Register user on wallet connect
  useEffect(() => {
    const register = async () => {
      if (isConnected && address) {
        try {
          await registerUser(address);
          console.log('User registered:', address);
        } catch (err) {
          console.error('Error registering user:', err);
        }
      }
    };

    register();
  }, [isConnected, address]);

  const toggleSection = (sectionName) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const handleTradeClick = (token) => {
    // Set the selected token for swap
    setSelectedTokenForSwap(token);

    // Open the swap section
    setOpenSections((prev) => ({
      ...prev,
      swap: true,
    }));

    // Scroll to swap section after a brief delay
    setTimeout(() => {
      if (swapRef.current) {
        swapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-primary-black">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111111',
            color: '#F5F5F5',
            border: '1px solid #333333',
          },
          success: {
            iconTheme: {
              primary: '#0066FF',
              secondary: '#F5F5F5',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF0000',
              secondary: '#F5F5F5',
            },
          },
        }}
      />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            Welcome to FEVA Protocol
          </h1>
          <p className="text-xl text-light-gray max-w-2xl mx-auto">
            The ultimate DeFi platform for token creation, trading, and liquidity provision.
            Earn points, climb the leaderboard, and unlock exclusive rewards.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {/* Faucets */}
          <DropdownSection
            title="💰 Faucets"
            isOpen={openSections.faucets}
            onToggle={() => toggleSection('faucets')}
          >
            <Faucets />
          </DropdownSection>

          {/* Swap */}
          <div ref={swapRef}>
            <DropdownSection
              title="🔄 Swap"
              isOpen={openSections.swap}
              onToggle={() => toggleSection('swap')}
            >
              <Swap selectedToken={selectedTokenForSwap} />
            </DropdownSection>
          </div>

          {/* Liquidity */}
          <DropdownSection
            title="💧 Liquidity"
            isOpen={openSections.liquidity}
            onToggle={() => toggleSection('liquidity')}
          >
            <Liquidity />
          </DropdownSection>

          {/* Markets */}
          <DropdownSection
            title="📈 Markets"
            isOpen={openSections.markets}
            onToggle={() => toggleSection('markets')}
          >
            <Markets onTradeClick={handleTradeClick} />
          </DropdownSection>

          {/* Bridge - Phase 4 */}
          <DropdownSection
            title="🌉 Bridge"
            isOpen={openSections.bridge}
            onToggle={() => toggleSection('bridge')}
          >
            <PlaceholderSection
              title="Bridge"
              description="Bridge tokens between Arc Testnet and Sepolia"
              phase="Phase 4"
            />
          </DropdownSection>

          {/* Deploy Token - Phase 5 */}
          <DropdownSection
            title="🚀 Deploy Token"
            isOpen={openSections.deploy}
            onToggle={() => toggleSection('deploy')}
          >
            <PlaceholderSection
              title="Deploy Token"
              description="Create your own memecoin with custom metadata"
              phase="Phase 5"
            />
          </DropdownSection>

          {/* Tasks - Phase 6 */}
          <DropdownSection
            title="✅ Tasks"
            isOpen={openSections.tasks}
            onToggle={() => toggleSection('tasks')}
          >
            <PlaceholderSection
              title="Tasks"
              description="Complete tasks to earn points and rewards"
              phase="Phase 6"
            />
          </DropdownSection>

          {/* Leaderboard - Phase 6 */}
          <DropdownSection
            title="🏆 Leaderboard"
            isOpen={openSections.leaderboard}
            onToggle={() => toggleSection('leaderboard')}
          >
            <PlaceholderSection
              title="Leaderboard"
              description="See top performers and your ranking"
              phase="Phase 6"
            />
          </DropdownSection>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-light-gray border-t border-dark-gray pt-8">
          <p className="mb-2">FEVA Protocol - DeFi Made Simple</p>
          <p className="text-sm">
            Built with 🔥 on Arc Testnet & Sepolia
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
