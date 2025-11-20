import React, { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Modal from './Modal';
import { formatTokenAmount, formatAddress } from '@/utils/formatters';
import { CONTRACTS } from '@/utils/constants';
import { useAccount } from 'wagmi';

const TokenSelector = ({
  selectedToken,
  onSelectToken,
  tokens,
  showBalance = true,
  excludeTokens = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { chainId } = useAccount();

  const contracts = chainId === 8668 ? CONTRACTS.ARC : CONTRACTS.SEPOLIA;

  const filteredTokens = useMemo(() => {
    if (!tokens) return [];

    let filtered = tokens.filter(
      (token) => !excludeTokens.includes(token.contractAddress.toLowerCase())
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (token) =>
          token.name.toLowerCase().includes(query) ||
          token.symbol.toLowerCase().includes(query) ||
          token.contractAddress.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tokens, searchQuery, excludeTokens]);

  const handleSelectToken = (token) => {
    onSelectToken(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Token Selector Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-secondary-black border border-dark-gray rounded-lg hover:border-primary-blue transition-all duration-300"
      >
        {selectedToken ? (
          <>
            {selectedToken.logo && (
              <img
                src={selectedToken.logo}
                alt={selectedToken.symbol}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <span className="font-semibold text-off-white">
              {selectedToken.symbol}
            </span>
          </>
        ) : (
          <span className="text-light-gray">Select Token</span>
        )}
        <ChevronDown size={16} className="text-light-gray" />
      </button>

      {/* Token Selection Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
        title="Select Token"
        maxWidth="md"
      >
        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-light-gray"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, symbol, or address"
              className="input-field w-full pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Token List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {/* FEV Token */}
          <button
            onClick={() =>
              handleSelectToken({
                contractAddress: contracts.FEV_TOKEN,
                name: 'FEVA Token',
                symbol: 'FEV',
                decimals: 18,
              })
            }
            className="w-full flex items-center justify-between p-4 bg-secondary-black hover:bg-dark-gray border border-dark-gray hover:border-primary-blue rounded-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-red flex items-center justify-center font-bold text-off-white">
                F
              </div>
              <div className="text-left">
                <div className="font-semibold text-off-white">FEV</div>
                <div className="text-sm text-light-gray">FEVA Token</div>
              </div>
            </div>
            {showBalance && (
              <div className="text-right">
                <div className="text-sm text-light-gray">Balance</div>
                <div className="font-semibold text-off-white">-</div>
              </div>
            )}
          </button>

          {/* Other Tokens */}
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <button
                key={token.contractAddress}
                onClick={() => handleSelectToken(token)}
                className="w-full flex items-center justify-between p-4 bg-secondary-black hover:bg-dark-gray border border-dark-gray hover:border-primary-blue rounded-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {token.logo ? (
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center font-bold text-off-white">
                      {token.symbol?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-off-white">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-light-gray">
                      {token.name}
                    </div>
                    <div className="text-xs text-dark-gray">
                      {formatAddress(token.contractAddress)}
                    </div>
                  </div>
                </div>
                {showBalance && token.balance !== undefined && (
                  <div className="text-right">
                    <div className="text-sm text-light-gray">Balance</div>
                    <div className="font-semibold text-off-white">
                      {formatTokenAmount(token.balance, token.decimals || 18, 4)}
                    </div>
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-light-gray">
              No tokens found
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default TokenSelector;
