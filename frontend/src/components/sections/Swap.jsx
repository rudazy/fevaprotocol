import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { ArrowDownUp, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import TokenSelector from '../ui/TokenSelector';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useSwap } from '@/hooks/useSwap';
import { useTokens } from '@/hooks/useTokens';
import { parseTokenAmount, formatTokenAmount, calculatePriceImpact } from '@/utils/formatters';
import { CONTRACTS } from '@/utils/constants';

const Swap = ({ selectedToken }) => {
  const { address, chainId, isConnected } = useAccount();
  const { tokens, fetchAllTokens } = useTokens();
  const {
    loading,
    approving,
    getTokenBalance,
    getTokenAllowance,
    approveToken,
    calculateSwapOutput,
    executeSwap,
  } = useSwap();

  const contracts = chainId === 8668 ? CONTRACTS.ARC : CONTRACTS.SEPOLIA;

  // Token states
  const [tokenIn, setTokenIn] = useState(null);
  const [tokenOut, setTokenOut] = useState(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');

  // Balance states
  const [balanceIn, setBalanceIn] = useState(0n);
  const [balanceOut, setBalanceOut] = useState(0n);

  // UI states
  const [slippage, setSlippage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);

  // Fetch tokens on mount
  useEffect(() => {
    fetchAllTokens('new', '', 1);
  }, [fetchAllTokens]);

  // Set default tokens (FEV)
  useEffect(() => {
    if (contracts && !tokenIn) {
      setTokenIn({
        contractAddress: contracts.FEV_TOKEN,
        name: 'FEVA Token',
        symbol: 'FEV',
        decimals: 18,
      });
    }
  }, [contracts, tokenIn]);

  // Handle selected token from Markets
  useEffect(() => {
    if (selectedToken) {
      setTokenOut(selectedToken);
      // Set tokenIn to FEV if not already set
      if (!tokenIn || tokenIn.contractAddress.toLowerCase() === selectedToken.contractAddress.toLowerCase()) {
        setTokenIn({
          contractAddress: contracts.FEV_TOKEN,
          name: 'FEVA Token',
          symbol: 'FEV',
          decimals: 18,
        });
      }
    }
  }, [selectedToken, contracts]);

  // Fetch balances when tokens change
  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address) return;

      if (tokenIn) {
        try {
          const balance = await getTokenBalance(tokenIn.contractAddress);
          setBalanceIn(balance || 0n);
        } catch (err) {
          console.error('Error fetching tokenIn balance:', err);
        }
      }

      if (tokenOut) {
        try {
          const balance = await getTokenBalance(tokenOut.contractAddress);
          setBalanceOut(balance || 0n);
        } catch (err) {
          console.error('Error fetching tokenOut balance:', err);
        }
      }
    };

    fetchBalances();
  }, [tokenIn, tokenOut, isConnected, address, getTokenBalance]);

  // Calculate output amount when input changes
  useEffect(() => {
    const calculateOutput = async () => {
      if (!amountIn || !tokenIn || !tokenOut || parseFloat(amountIn) <= 0) {
        setAmountOut('');
        return;
      }

      try {
        const amountInParsed = parseTokenAmount(amountIn, tokenIn.decimals);
        const output = await calculateSwapOutput(
          amountInParsed,
          tokenIn.contractAddress,
          tokenOut.contractAddress
        );

        setAmountOut(formatTokenAmount(output, tokenOut.decimals, 6));

        // Calculate price impact (simplified)
        if (output > 0n) {
          const expectedRate = parseFloat(amountIn) / parseFloat(formatTokenAmount(output, tokenOut.decimals, 18));
          // This is a simplified price impact calculation
          setPriceImpact(0); // You can implement more accurate calculation with reserves
        }
      } catch (err) {
        console.error('Error calculating output:', err);
        setAmountOut('0');
      }
    };

    const debounce = setTimeout(calculateOutput, 500);
    return () => clearTimeout(debounce);
  }, [amountIn, tokenIn, tokenOut, calculateSwapOutput]);

  // Check if approval is needed
  useEffect(() => {
    const checkApproval = async () => {
      if (!tokenIn || !amountIn || !address || parseFloat(amountIn) <= 0) {
        setNeedsApproval(false);
        return;
      }

      try {
        const amountInParsed = parseTokenAmount(amountIn, tokenIn.decimals);
        const allowance = await getTokenAllowance(
          tokenIn.contractAddress,
          contracts.DEX_ROUTER
        );

        setNeedsApproval(allowance < amountInParsed);
      } catch (err) {
        console.error('Error checking allowance:', err);
        setNeedsApproval(false);
      }
    };

    checkApproval();
  }, [tokenIn, amountIn, address, getTokenAllowance, contracts]);

  const handleFlipTokens = () => {
    const tempToken = tokenIn;
    const tempAmount = amountIn;
    const tempBalance = balanceIn;

    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    setAmountIn(amountOut);
    setAmountOut(tempAmount);
    setBalanceIn(balanceOut);
    setBalanceOut(tempBalance);
  };

  const handleMaxClick = () => {
    if (balanceIn > 0n) {
      setAmountIn(formatTokenAmount(balanceIn, tokenIn?.decimals || 18, 6));
    }
  };

  const handleApprove = async () => {
    if (!tokenIn) return;

    try {
      await approveToken(tokenIn.contractAddress, contracts.DEX_ROUTER);
      setNeedsApproval(false);
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !amountOut) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const amountInParsed = parseTokenAmount(amountIn, tokenIn.decimals);
      const amountOutParsed = parseTokenAmount(amountOut, tokenOut.decimals);
      const minAmountOut = (amountOutParsed * BigInt(100 - slippage)) / 100n;

      await executeSwap(
        tokenIn.contractAddress,
        tokenOut.contractAddress,
        amountInParsed,
        minAmountOut,
        slippage
      );

      // Reset form
      setAmountIn('');
      setAmountOut('');

      // Refresh balances
      const newBalanceIn = await getTokenBalance(tokenIn.contractAddress);
      const newBalanceOut = await getTokenBalance(tokenOut.contractAddress);
      setBalanceIn(newBalanceIn);
      setBalanceOut(newBalanceOut);
    } catch (err) {
      console.error('Swap failed:', err);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (!tokenIn || !tokenOut) return 'Select Tokens';
    if (!amountIn || parseFloat(amountIn) <= 0) return 'Enter Amount';
    if (parseTokenAmount(amountIn, tokenIn.decimals) > balanceIn) {
      return 'Insufficient Balance';
    }
    if (needsApproval) return `Approve ${tokenIn.symbol}`;
    return 'Swap';
  };

  const isButtonDisabled = () => {
    if (!isConnected) return false;
    if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) return true;
    if (parseTokenAmount(amountIn, tokenIn.decimals) > balanceIn) return true;
    return false;
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-off-white">Swap</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-light-gray hover:text-off-white transition-colors duration-300"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Slippage Settings */}
        {showSettings && (
          <div className="mb-4 p-4 bg-secondary-black border border-dark-gray rounded-lg">
            <label className="block text-sm font-medium text-off-white mb-2">
              Slippage Tolerance
            </label>
            <div className="flex gap-2">
              {[0.5, 1, 2, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`
                    px-4 py-2 rounded-lg font-semibold transition-all duration-300
                    ${
                      slippage === value
                        ? 'bg-primary-blue text-off-white'
                        : 'bg-dark-gray text-light-gray hover:bg-primary-blue/20'
                    }
                  `}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* From Token */}
        <div className="mb-4">
          <Input
            label="From"
            type="text"
            value={amountIn}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setAmountIn(value);
              }
            }}
            placeholder="0.0"
            showBalance={true}
            balance={balanceIn}
            decimals={tokenIn?.decimals || 18}
            onMaxClick={handleMaxClick}
            rightElement={
              <TokenSelector
                selectedToken={tokenIn}
                onSelectToken={setTokenIn}
                tokens={tokens}
                excludeTokens={tokenOut ? [tokenOut.contractAddress.toLowerCase()] : []}
              />
            }
          />
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleFlipTokens}
            disabled={!tokenIn || !tokenOut}
            className="p-2 bg-card-black border-2 border-dark-gray rounded-lg hover:border-primary-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownUp size={20} className="text-primary-blue" />
          </button>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <Input
            label="To"
            type="text"
            value={amountOut}
            onChange={() => {}}
            placeholder="0.0"
            disabled={true}
            showBalance={true}
            balance={balanceOut}
            decimals={tokenOut?.decimals || 18}
            rightElement={
              <TokenSelector
                selectedToken={tokenOut}
                onSelectToken={setTokenOut}
                tokens={tokens}
                excludeTokens={tokenIn ? [tokenIn.contractAddress.toLowerCase()] : []}
              />
            }
          />
        </div>

        {/* Price Impact Warning */}
        {priceImpact > 5 && (
          <div className="mb-4 p-3 bg-primary-red/10 border border-primary-red rounded-lg">
            <p className="text-sm text-primary-red font-semibold">
              High price impact: {priceImpact.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Swap/Approve Button */}
        <Button
          onClick={needsApproval && !isButtonDisabled() ? handleApprove : handleSwap}
          disabled={isButtonDisabled()}
          loading={loading || approving}
          variant="primary"
          className="w-full"
        >
          {loading || approving ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" color="white" />
              <span>{approving ? 'Approving...' : 'Swapping...'}</span>
            </div>
          ) : (
            getButtonText()
          )}
        </Button>

        {/* Swap Details */}
        {amountIn && amountOut && tokenIn && tokenOut && (
          <div className="mt-4 p-4 bg-secondary-black border border-dark-gray rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-light-gray">Rate</span>
              <span className="text-off-white font-semibold">
                1 {tokenIn.symbol} ≈{' '}
                {amountOut && amountIn
                  ? (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)
                  : '0'}{' '}
                {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-light-gray">Slippage Tolerance</span>
              <span className="text-off-white font-semibold">{slippage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-light-gray">Minimum Received</span>
              <span className="text-off-white font-semibold">
                {amountOut
                  ? (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6)
                  : '0'}{' '}
                {tokenOut.symbol}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Swap;
