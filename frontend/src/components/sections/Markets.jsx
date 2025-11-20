import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Clock, BarChart3, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useTokens } from '@/hooks/useTokens';
import { formatAddress, formatUSD, formatLargeNumber } from '@/utils/formatters';

const Markets = ({ onTradeClick }) => {
  const { tokens, loading, fetchAllTokens, fetchTokenPrice, searchTokens } = useTokens();
  const [activeFilter, setActiveFilter] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tokenPrices, setTokenPrices] = useState({});

  // Fetch tokens on mount and when filter changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchTokens(searchQuery, currentPage);
    } else {
      fetchAllTokens(activeFilter, '', currentPage);
    }
  }, [activeFilter, currentPage, searchQuery, fetchAllTokens, searchTokens]);

  // Fetch prices for visible tokens
  useEffect(() => {
    const fetchPrices = async () => {
      if (!tokens || tokens.length === 0) return;

      const prices = {};
      for (const token of tokens.slice(0, 10)) {
        // Limit to first 10 for performance
        try {
          const priceData = await fetchTokenPrice(token.contractAddress);
          prices[token.contractAddress] = priceData.price;
        } catch (err) {
          console.error(`Error fetching price for ${token.symbol}:`, err);
          prices[token.contractAddress] = '0';
        }
      }
      setTokenPrices(prices);
    };

    fetchPrices();
  }, [tokens, fetchTokenPrice]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handleTradeClick = (token) => {
    if (onTradeClick) {
      onTradeClick(token);
    }
  };

  const filters = [
    { id: 'new', label: 'New', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'volume', label: 'Volume', icon: BarChart3 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-off-white mb-2">Token Markets</h2>
        <p className="text-light-gray">Discover and trade the latest tokens on FEVA</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-light-gray"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name, symbol, or contract address..."
            className="input-field w-full pl-12"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-300
                ${
                  activeFilter === filter.id
                    ? 'bg-primary-blue text-off-white shadow-lg shadow-primary-blue/30'
                    : 'bg-secondary-black text-light-gray hover:bg-dark-gray hover:text-off-white border border-dark-gray'
                }
              `}
            >
              <Icon size={18} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" color="blue" />
        </div>
      )}

      {/* Token Grid */}
      {!loading && tokens && tokens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {tokens.map((token, index) => (
            <motion.div
              key={token.contractAddress}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card hover padding="default" className="h-full">
                {/* Token Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {token.logo ? (
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        className="w-12 h-12 rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-blue flex items-center justify-center font-bold text-off-white text-lg">
                        {token.symbol?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-off-white text-lg">
                        {token.symbol}
                      </h3>
                      <p className="text-sm text-light-gray">{token.name}</p>
                    </div>
                  </div>
                  {token.isVerified && (
                    <Badge variant="primary" size="sm">
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Token Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-light-gray">Price</span>
                    <span className="text-off-white font-semibold">
                      {tokenPrices[token.contractAddress]
                        ? `${parseFloat(tokenPrices[token.contractAddress]).toFixed(6)} FEV`
                        : 'Loading...'}
                    </span>
                  </div>
                  {token.marketCap && (
                    <div className="flex justify-between text-sm">
                      <span className="text-light-gray">Market Cap</span>
                      <span className="text-off-white font-semibold">
                        {formatUSD(token.marketCap)}
                      </span>
                    </div>
                  )}
                  {token.volume24h && (
                    <div className="flex justify-between text-sm">
                      <span className="text-light-gray">24h Volume</span>
                      <span className="text-off-white font-semibold">
                        {formatUSD(token.volume24h)}
                      </span>
                    </div>
                  )}
                  {token.priceChange24h !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-light-gray">24h Change</span>
                      <Badge
                        variant={token.priceChange24h >= 0 ? 'positive' : 'negative'}
                        size="sm"
                      >
                        {token.priceChange24h >= 0 ? '+' : ''}
                        {token.priceChange24h.toFixed(2)}%
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-light-gray">Contract</span>
                    <a
                      href={`https://etherscan.io/address/${token.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-blue hover:text-accent-blue flex items-center gap-1 font-mono text-xs"
                    >
                      {formatAddress(token.contractAddress)}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Description */}
                {token.description && (
                  <p className="text-sm text-light-gray mb-4 line-clamp-2">
                    {token.description}
                  </p>
                )}

                {/* Social Links */}
                {(token.twitter || token.telegram || token.website) && (
                  <div className="flex gap-2 mb-4">
                    {token.twitter && (
                      <a
                        href={token.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light-gray hover:text-primary-blue transition-colors duration-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                    {token.telegram && (
                      <a
                        href={token.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light-gray hover:text-primary-blue transition-colors duration-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 3.778-1.359 5.014-.168.523-.5.697-.818.715-.696.063-1.225-.46-1.901-.902-1.056-.693-1.653-1.124-2.678-1.799-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.001.321.023.465.141.122.1.155.234.171.329-.01.089-.01.175 0 .258z" />
                        </svg>
                      </a>
                    )}
                    {token.website && (
                      <a
                        href={token.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light-gray hover:text-primary-blue transition-colors duration-300"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                )}

                {/* Trade Button */}
                <Button
                  onClick={() => handleTradeClick(token)}
                  variant="primary"
                  className="w-full"
                >
                  TRADE
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && (!tokens || tokens.length === 0) && (
        <Card padding="lg" className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-off-white mb-2">No tokens found</h3>
          <p className="text-light-gray">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'No tokens available at the moment'}
          </p>
        </Card>
      )}

      {/* Pagination */}
      {!loading && tokens && tokens.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <div className="px-4 py-2 bg-secondary-black border border-dark-gray rounded-lg text-off-white font-semibold">
            Page {currentPage}
          </div>
          <Button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={tokens.length < 20}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Markets;
