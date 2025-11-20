import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import TokenSelector from '../ui/TokenSelector';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useLiquidity } from '@/hooks/useLiquidity';
import { useSwap } from '@/hooks/useSwap';
import { useTokens } from '@/hooks/useTokens';
import { parseTokenAmount, formatTokenAmount } from '@/utils/formatters';
import { CONTRACTS } from '@/utils/constants';

const Liquidity = () => {
  const { address, chainId, isConnected } = useAccount();
  const { tokens, fetchAllTokens } = useTokens();
  const {
    loading,
    getPairReserves,
    getLPTokenBalance,
    getPairAddress,
    addLiquidity,
    removeLiquidity,
  } = useLiquidity();
  const { getTokenBalance, getTokenAllowance, approveToken, approving } = useSwap();

  const contracts = chainId === 8668 ? CONTRACTS.ARC : CONTRACTS.SEPOLIA;

  // Tab state
  const [activeTab, setActiveTab] = useState('add');

  // Add Liquidity states
  const [selectedToken, setSelectedToken] = useState(null);
  const [amountToken, setAmountToken] = useState('');
  const [amountFEV, setAmountFEV] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0n);
  const [fevBalance, setFevBalance] = useState(0n);
  const [tokenNeedsApproval, setTokenNeedsApproval] = useState(false);
  const [fevNeedsApproval, setFevNeedsApproval] = useState(false);

  // Remove Liquidity states
  const [lpAmount, setLpAmount] = useState('');
  const [lpBalance, setLpBalance] = useState(0n);
  const [expectedToken, setExpectedToken] = useState('0');
  const [expectedFEV, setExpectedFEV] = useState('0');

  // Pool states
  const [reserves, setReserves] = useState({ reserve0: 0n, reserve1: 0n });
  const [poolShare, setPoolShare] = useState(0);

  // Fetch tokens on mount
  useEffect(() => {
    fetchAllTokens('new', '', 1);
  }, [fetchAllTokens]);

  // Fetch balances when token changes
  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address) return;

      // Fetch FEV balance
      try {
        const fevBal = await getTokenBalance(contracts.FEV_TOKEN);
        setFevBalance(fevBal || 0n);
      } catch (err) {
        console.error('Error fetching FEV balance:', err);
      }

      // Fetch selected token balance
      if (selectedToken) {
        try {
          const tokenBal = await getTokenBalance(selectedToken.contractAddress);
          setTokenBalance(tokenBal || 0n);
        } catch (err) {
          console.error('Error fetching token balance:', err);
        }
      }
    };

    fetchBalances();
  }, [selectedToken, isConnected, address, getTokenBalance, contracts]);

  // Fetch reserves when token changes
  useEffect(() => {
    const fetchReserves = async () => {
      if (!selectedToken) return;

      try {
        const res = await getPairReserves(selectedToken.contractAddress);
        setReserves(res);
      } catch (err) {
        console.error('Error fetching reserves:', err);
      }
    };

    fetchReserves();
  }, [selectedToken, getPairReserves]);

  // Fetch LP balance for remove tab
  useEffect(() => {
    const fetchLPBalance = async () => {
      if (!selectedToken || activeTab !== 'remove') return;

      try {
        const pairAddr = await getPairAddress(selectedToken.contractAddress);
        if (pairAddr && pairAddr !== ethers.ZeroAddress) {
          const lpBal = await getLPTokenBalance(pairAddr);
          setLpBalance(lpBal || 0n);
        }
      } catch (err) {
        console.error('Error fetching LP balance:', err);
      }
    };

    fetchLPBalance();
  }, [selectedToken, activeTab, getPairAddress, getLPTokenBalance]);

  // Calculate FEV amount based on token amount (maintain ratio)
  useEffect(() => {
    if (!amountToken || !reserves.reserve0 || reserves.reserve0 === 0n) {
      setAmountFEV('');
      return;
    }

    try {
      const tokenAmountParsed = parseTokenAmount(amountToken, selectedToken?.decimals || 18);

      // If pool exists, calculate based on ratio
      if (reserves.reserve0 > 0n && reserves.reserve1 > 0n) {
        const fevAmountCalculated = (tokenAmountParsed * reserves.reserve1) / reserves.reserve0;
        setAmountFEV(formatTokenAmount(fevAmountCalculated, 18, 6));
      }
    } catch (err) {
      console.error('Error calculating FEV amount:', err);
    }
  }, [amountToken, reserves, selectedToken]);

  // Calculate expected tokens for remove liquidity
  useEffect(() => {
    const calculateExpectedAmounts = async () => {
      if (!lpAmount || !selectedToken || activeTab !== 'remove') return;

      try {
        const pairAddr = await getPairAddress(selectedToken.contractAddress);
        if (!pairAddr || pairAddr === ethers.ZeroAddress) return;

        const lpAmountParsed = parseTokenAmount(lpAmount, 18);

        // Get total supply (you'd need to add this to useLiquidity or call directly)
        // For now, calculate based on proportions
        if (reserves.reserve0 > 0n && lpBalance > 0n) {
          const expectedTokenAmount = (reserves.reserve0 * lpAmountParsed) / lpBalance;
          const expectedFEVAmount = (reserves.reserve1 * lpAmountParsed) / lpBalance;

          setExpectedToken(formatTokenAmount(expectedTokenAmount, selectedToken?.decimals || 18, 6));
          setExpectedFEV(formatTokenAmount(expectedFEVAmount, 18, 6));
        }
      } catch (err) {
        console.error('Error calculating expected amounts:', err);
      }
    };

    calculateExpectedAmounts();
  }, [lpAmount, selectedToken, activeTab, reserves, lpBalance, getPairAddress]);

  // Check approvals for add liquidity
  useEffect(() => {
    const checkApprovals = async () => {
      if (!selectedToken || !amountToken || !amountFEV || !address) {
        setTokenNeedsApproval(false);
        setFevNeedsApproval(false);
        return;
      }

      try {
        const tokenAmountParsed = parseTokenAmount(amountToken, selectedToken.decimals);
        const fevAmountParsed = parseTokenAmount(amountFEV, 18);

        const tokenAllowance = await getTokenAllowance(
          selectedToken.contractAddress,
          contracts.DEX_ROUTER
        );
        const fevAllowance = await getTokenAllowance(
          contracts.FEV_TOKEN,
          contracts.DEX_ROUTER
        );

        setTokenNeedsApproval(tokenAllowance < tokenAmountParsed);
        setFevNeedsApproval(fevAllowance < fevAmountParsed);
      } catch (err) {
        console.error('Error checking approvals:', err);
      }
    };

    if (activeTab === 'add') {
      checkApprovals();
    }
  }, [selectedToken, amountToken, amountFEV, address, getTokenAllowance, contracts, activeTab]);

  const handleTokenMaxClick = () => {
    if (tokenBalance > 0n) {
      setAmountToken(formatTokenAmount(tokenBalance, selectedToken?.decimals || 18, 6));
    }
  };

  const handleFEVMaxClick = () => {
    if (fevBalance > 0n) {
      setAmountFEV(formatTokenAmount(fevBalance, 18, 6));
    }
  };

  const handleLPMaxClick = () => {
    if (lpBalance > 0n) {
      setLpAmount(formatTokenAmount(lpBalance, 18, 6));
    }
  };

  const handleApproveToken = async () => {
    if (!selectedToken) return;
    try {
      await approveToken(selectedToken.contractAddress, contracts.DEX_ROUTER);
      setTokenNeedsApproval(false);
    } catch (err) {
      console.error('Token approval failed:', err);
    }
  };

  const handleApproveFEV = async () => {
    try {
      await approveToken(contracts.FEV_TOKEN, contracts.DEX_ROUTER);
      setFevNeedsApproval(false);
    } catch (err) {
      console.error('FEV approval failed:', err);
    }
  };

  const handleAddLiquidity = async () => {
    if (!selectedToken || !amountToken || !amountFEV) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const tokenAmountParsed = parseTokenAmount(amountToken, selectedToken.decimals);
      const fevAmountParsed = parseTokenAmount(amountFEV, 18);

      await addLiquidity(
        selectedToken.contractAddress,
        tokenAmountParsed,
        fevAmountParsed,
        1 // 1% slippage
      );

      // Reset form
      setAmountToken('');
      setAmountFEV('');

      // Refresh balances
      const newTokenBalance = await getTokenBalance(selectedToken.contractAddress);
      const newFevBalance = await getTokenBalance(contracts.FEV_TOKEN);
      setTokenBalance(newTokenBalance);
      setFevBalance(newFevBalance);

      // Refresh reserves
      const newReserves = await getPairReserves(selectedToken.contractAddress);
      setReserves(newReserves);
    } catch (err) {
      console.error('Add liquidity failed:', err);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedToken || !lpAmount) {
      toast.error('Please enter LP token amount');
      return;
    }

    try {
      const lpAmountParsed = parseTokenAmount(lpAmount, 18);

      await removeLiquidity(selectedToken.contractAddress, lpAmountParsed, 1);

      // Reset form
      setLpAmount('');
      setExpectedToken('0');
      setExpectedFEV('0');

      // Refresh balances
      const pairAddr = await getPairAddress(selectedToken.contractAddress);
      const newLpBalance = await getLPTokenBalance(pairAddr);
      setLpBalance(newLpBalance);

      const newTokenBalance = await getTokenBalance(selectedToken.contractAddress);
      const newFevBalance = await getTokenBalance(contracts.FEV_TOKEN);
      setTokenBalance(newTokenBalance);
      setFevBalance(newFevBalance);
    } catch (err) {
      console.error('Remove liquidity failed:', err);
    }
  };

  const getAddButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (!selectedToken) return 'Select Token';
    if (!amountToken || !amountFEV) return 'Enter Amounts';
    if (tokenNeedsApproval) return `Approve ${selectedToken.symbol}`;
    if (fevNeedsApproval) return 'Approve FEV';
    return 'Add Liquidity';
  };

  const getRemoveButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (!selectedToken) return 'Select Token';
    if (!lpAmount || parseFloat(lpAmount) <= 0) return 'Enter Amount';
    return 'Remove Liquidity';
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-secondary-black rounded-lg">
          <button
            onClick={() => setActiveTab('add')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300
              ${
                activeTab === 'add'
                  ? 'bg-primary-blue text-off-white'
                  : 'text-light-gray hover:text-off-white'
              }
            `}
          >
            <Plus size={20} />
            Add Liquidity
          </button>
          <button
            onClick={() => setActiveTab('remove')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300
              ${
                activeTab === 'remove'
                  ? 'bg-primary-red text-off-white'
                  : 'text-light-gray hover:text-off-white'
              }
            `}
          >
            <Minus size={20} />
            Remove Liquidity
          </button>
        </div>

        {/* Add Liquidity Tab */}
        {activeTab === 'add' && (
          <div>
            {/* Token Input */}
            <div className="mb-4">
              <Input
                label="Token Amount"
                type="text"
                value={amountToken}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setAmountToken(value);
                  }
                }}
                placeholder="0.0"
                showBalance={true}
                balance={tokenBalance}
                decimals={selectedToken?.decimals || 18}
                onMaxClick={handleTokenMaxClick}
                rightElement={
                  <TokenSelector
                    selectedToken={selectedToken}
                    onSelectToken={setSelectedToken}
                    tokens={tokens}
                    excludeTokens={[contracts.FEV_TOKEN.toLowerCase()]}
                  />
                }
              />
            </div>

            {/* FEV Input */}
            <div className="mb-6">
              <Input
                label="FEV Amount"
                type="text"
                value={amountFEV}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setAmountFEV(value);
                  }
                }}
                placeholder="0.0"
                showBalance={true}
                balance={fevBalance}
                decimals={18}
                onMaxClick={handleFEVMaxClick}
                rightElement={
                  <div className="px-4 py-2 bg-primary-red text-off-white font-semibold rounded-lg">
                    FEV
                  </div>
                }
              />
            </div>

            {/* Pool Info */}
            {reserves.reserve0 > 0n && reserves.reserve1 > 0n && (
              <div className="mb-4 p-4 bg-secondary-black border border-dark-gray rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-light-gray">Pool Ratio</span>
                  <span className="text-off-white font-semibold">
                    1 {selectedToken?.symbol} ={' '}
                    {(
                      parseFloat(formatTokenAmount(reserves.reserve1, 18, 18)) /
                      parseFloat(formatTokenAmount(reserves.reserve0, selectedToken?.decimals || 18, 18))
                    ).toFixed(6)}{' '}
                    FEV
                  </span>
                </div>
              </div>
            )}

            {/* Approval Buttons */}
            {tokenNeedsApproval && (
              <Button
                onClick={handleApproveToken}
                loading={approving}
                variant="secondary"
                className="w-full mb-3"
              >
                {approving ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="white" />
                    <span>Approving...</span>
                  </div>
                ) : (
                  `Approve ${selectedToken?.symbol}`
                )}
              </Button>
            )}

            {fevNeedsApproval && !tokenNeedsApproval && (
              <Button
                onClick={handleApproveFEV}
                loading={approving}
                variant="secondary"
                className="w-full mb-3"
              >
                {approving ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="white" />
                    <span>Approving...</span>
                  </div>
                ) : (
                  'Approve FEV'
                )}
              </Button>
            )}

            {/* Add Liquidity Button */}
            <Button
              onClick={handleAddLiquidity}
              disabled={
                !isConnected ||
                !selectedToken ||
                !amountToken ||
                !amountFEV ||
                tokenNeedsApproval ||
                fevNeedsApproval
              }
              loading={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" color="white" />
                  <span>Adding Liquidity...</span>
                </div>
              ) : (
                getAddButtonText()
              )}
            </Button>
          </div>
        )}

        {/* Remove Liquidity Tab */}
        {activeTab === 'remove' && (
          <div>
            {/* Token Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-off-white mb-2">
                Select Pool
              </label>
              <TokenSelector
                selectedToken={selectedToken}
                onSelectToken={setSelectedToken}
                tokens={tokens}
                excludeTokens={[contracts.FEV_TOKEN.toLowerCase()]}
                showBalance={false}
              />
            </div>

            {/* LP Amount Input */}
            <div className="mb-6">
              <Input
                label="LP Token Amount"
                type="text"
                value={lpAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setLpAmount(value);
                  }
                }}
                placeholder="0.0"
                showBalance={true}
                balance={lpBalance}
                decimals={18}
                onMaxClick={handleLPMaxClick}
              />
            </div>

            {/* Expected Amounts */}
            {lpAmount && parseFloat(lpAmount) > 0 && (
              <div className="mb-6 p-4 bg-secondary-black border border-dark-gray rounded-lg space-y-3">
                <h4 className="font-semibold text-off-white mb-2">You will receive:</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-light-gray">{selectedToken?.symbol || 'TOKEN'}</span>
                  <span className="text-off-white font-semibold">{expectedToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-light-gray">FEV</span>
                  <span className="text-off-white font-semibold">{expectedFEV}</span>
                </div>
              </div>
            )}

            {/* Remove Liquidity Button */}
            <Button
              onClick={handleRemoveLiquidity}
              disabled={!isConnected || !selectedToken || !lpAmount || parseFloat(lpAmount) <= 0}
              loading={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" color="white" />
                  <span>Removing Liquidity...</span>
                </div>
              ) : (
                getRemoveButtonText()
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Liquidity;
