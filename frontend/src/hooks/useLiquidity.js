import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { ERC20_ABI, DEX_ROUTER_ABI, DEX_PAIR_ABI, DEX_FACTORY_ABI } from '../utils/contracts';
import { CONTRACTS } from '../utils/constants';
import { recordTransaction, completeTask } from '../utils/api';

export const useLiquidity = () => {
  const { address, chainId } = useAccount();
  const { writeContract } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const contracts = chainId === 8668 ? CONTRACTS.ARC : CONTRACTS.SEPOLIA;

  const getPairAddress = useCallback(async (tokenAddress) => {
    try {
      const pairAddress = await useReadContract({
        address: contracts.DEX_FACTORY,
        abi: DEX_FACTORY_ABI,
        functionName: 'getPair',
        args: [tokenAddress, contracts.FEV_TOKEN],
      });
      return pairAddress;
    } catch (err) {
      console.error('Error getting pair address:', err);
      return null;
    }
  }, [contracts]);

  const getPairReserves = useCallback(async (tokenAddress) => {
    try {
      const pairAddress = await getPairAddress(tokenAddress);
      if (!pairAddress || pairAddress === ethers.ZeroAddress) {
        return { reserve0: 0n, reserve1: 0n };
      }

      const reserves = await useReadContract({
        address: pairAddress,
        abi: DEX_PAIR_ABI,
        functionName: 'getReserves',
      });

      return {
        reserve0: reserves[0],
        reserve1: reserves[1],
        blockTimestampLast: reserves[2],
      };
    } catch (err) {
      console.error('Error fetching reserves:', err);
      return { reserve0: 0n, reserve1: 0n };
    }
  }, [getPairAddress]);

  const getLPTokenBalance = useCallback(async (pairAddress) => {
    try {
      const balance = await useReadContract({
        address: pairAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      return balance;
    } catch (err) {
      console.error('Error fetching LP balance:', err);
      return 0n;
    }
  }, [address]);

  const addLiquidity = useCallback(async (tokenAddress, amountToken, amountFEV, slippage = 1) => {
    setLoading(true);
    const toastId = toast.loading('Adding liquidity...');

    try {
      const routerAddress = contracts.DEX_ROUTER;
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      // Calculate minimum amounts with slippage
      const minAmountToken = (amountToken * BigInt(100 - slippage)) / 100n;
      const minAmountFEV = (amountFEV * BigInt(100 - slippage)) / 100n;

      const tx = await writeContract({
        address: routerAddress,
        abi: DEX_ROUTER_ABI,
        functionName: 'addLiquidity',
        args: [
          tokenAddress,
          amountToken,
          amountFEV,
          minAmountToken,
          minAmountFEV,
          address,
          deadline,
        ],
      });

      const receipt = await useWaitForTransactionReceipt({ hash: tx });

      toast.success('Liquidity added!', { id: toastId });

      // Record transaction
      try {
        await recordTransaction({
          userAddress: address,
          type: 'addLiquidity',
          tokenIn: tokenAddress,
          tokenOut: contracts.FEV_TOKEN,
          amountIn: amountToken.toString(),
          amountOut: amountFEV.toString(),
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
        });

        await completeTask(address, 'addLiquidity', receipt.transactionHash);
        toast.success('+20 points earned!');
      } catch (apiErr) {
        console.error('Error recording transaction:', apiErr);
      }

      setLoading(false);
      return receipt;
    } catch (err) {
      console.error('Add liquidity error:', err);
      toast.error(`Failed to add liquidity: ${err.message}`, { id: toastId });
      setLoading(false);
      throw err;
    }
  }, [address, chainId, writeContract]);

  const removeLiquidity = useCallback(async (tokenAddress, lpAmount, slippage = 1) => {
    setLoading(true);
    const toastId = toast.loading('Removing liquidity...');

    try {
      const routerAddress = contracts.DEX_ROUTER;
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      // Get current reserves to calculate min amounts
      const reserves = await getPairReserves(tokenAddress);
      const pairAddress = await getPairAddress(tokenAddress);
      const totalSupply = await useReadContract({
        address: pairAddress,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      });

      // Calculate expected token amounts
      const expectedToken = (reserves.reserve0 * lpAmount) / totalSupply;
      const expectedFEV = (reserves.reserve1 * lpAmount) / totalSupply;

      // Apply slippage
      const minAmountToken = (expectedToken * BigInt(100 - slippage)) / 100n;
      const minAmountFEV = (expectedFEV * BigInt(100 - slippage)) / 100n;

      const tx = await writeContract({
        address: routerAddress,
        abi: DEX_ROUTER_ABI,
        functionName: 'removeLiquidity',
        args: [tokenAddress, lpAmount, minAmountToken, minAmountFEV, address, deadline],
      });

      const receipt = await useWaitForTransactionReceipt({ hash: tx });

      toast.success('Liquidity removed!', { id: toastId });

      // Record transaction
      try {
        await recordTransaction({
          userAddress: address,
          type: 'removeLiquidity',
          tokenIn: tokenAddress,
          tokenOut: contracts.FEV_TOKEN,
          amountIn: minAmountToken.toString(),
          amountOut: minAmountFEV.toString(),
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
        });
      } catch (apiErr) {
        console.error('Error recording transaction:', apiErr);
      }

      setLoading(false);
      return receipt;
    } catch (err) {
      console.error('Remove liquidity error:', err);
      toast.error(`Failed to remove liquidity: ${err.message}`, { id: toastId });
      setLoading(false);
      throw err;
    }
  }, [address, chainId, writeContract, getPairReserves, getPairAddress]);

  return {
    loading,
    getPairReserves,
    getLPTokenBalance,
    getPairAddress,
    addLiquidity,
    removeLiquidity,
  };
};

export default useLiquidity;
