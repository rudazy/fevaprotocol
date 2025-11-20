import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { ERC20_ABI, DEX_ROUTER_ABI } from '../utils/contracts';
import { CONTRACTS } from '../utils/constants';
import { recordTransaction, completeTask } from '../utils/api';
import { parseTokenAmount } from '../utils/formatters';

export const useSwap = () => {
  const { address, chainId } = useAccount();
  const { writeContract } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  const contracts = chainId === 8668 ? CONTRACTS.ARC : CONTRACTS.SEPOLIA;

  const getTokenBalance = useCallback(async (tokenAddress) => {
    try {
      const balance = await useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      return balance;
    } catch (err) {
      console.error('Error fetching balance:', err);
      return ethers.parseUnits('0', 18);
    }
  }, [address]);

  const getTokenAllowance = useCallback(async (tokenAddress, spenderAddress) => {
    try {
      const allowance = await useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, spenderAddress],
      });
      return allowance;
    } catch (err) {
      console.error('Error fetching allowance:', err);
      return ethers.parseUnits('0', 18);
    }
  }, [address]);

  const approveToken = useCallback(async (tokenAddress, spenderAddress) => {
    setApproving(true);
    const toastId = toast.loading('Approving token...');

    try {
      const tx = await writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, ethers.MaxUint256],
      });

      const receipt = await useWaitForTransactionReceipt({ hash: tx });

      toast.success('Token approved!', { id: toastId });
      setApproving(false);
      return receipt;
    } catch (err) {
      console.error('Approval error:', err);
      toast.error(`Approval failed: ${err.message}`, { id: toastId });
      setApproving(false);
      throw err;
    }
  }, [writeContract]);

  const calculateSwapOutput = useCallback(async (amountIn, tokenIn, tokenOut) => {
    try {
      // Get reserves from pair
      const routerAddress = contracts.DEX_ROUTER;

      const amountOut = await useReadContract({
        address: routerAddress,
        abi: DEX_ROUTER_ABI,
        functionName: 'getAmountOut',
        args: [amountIn, tokenIn, tokenOut],
      });

      return amountOut;
    } catch (err) {
      console.error('Error calculating swap output:', err);
      return ethers.parseUnits('0', 18);
    }
  }, [contracts]);

  const executeSwap = useCallback(async (tokenIn, tokenOut, amountIn, amountOutMin, slippage = 1) => {
    setLoading(true);
    const toastId = toast.loading('Swapping tokens...');

    try {
      const routerAddress = contracts.DEX_ROUTER;
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes

      // Determine which swap function to use
      const isFEVIn = tokenIn.toLowerCase() === contracts.FEV_TOKEN.toLowerCase();
      const functionName = isFEVIn ? 'swapExactFEVForTokens' : 'swapExactTokensForFEV';
      const token = isFEVIn ? tokenOut : tokenIn;

      const tx = await writeContract({
        address: routerAddress,
        abi: DEX_ROUTER_ABI,
        functionName,
        args: [amountIn, amountOutMin, token, address, deadline],
      });

      const receipt = await useWaitForTransactionReceipt({ hash: tx });

      toast.success('Swap successful!', { id: toastId });

      // Record transaction in backend
      try {
        await recordTransaction({
          userAddress: address,
          type: 'swap',
          tokenIn,
          tokenOut,
          amountIn: amountIn.toString(),
          amountOut: amountOutMin.toString(),
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
        });

        // Complete task
        await completeTask(address, 'swap', receipt.transactionHash);
        toast.success('+10 points earned!');
      } catch (apiErr) {
        console.error('Error recording transaction:', apiErr);
      }

      setLoading(false);
      return receipt;
    } catch (err) {
      console.error('Swap error:', err);
      toast.error(`Swap failed: ${err.message}`, { id: toastId });
      setLoading(false);
      throw err;
    }
  }, [address, chainId, writeContract]);

  return {
    loading,
    approving,
    getTokenBalance,
    getTokenAllowance,
    approveToken,
    calculateSwapOutput,
    executeSwap,
  };
};

export default useSwap;
