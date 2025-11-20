import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export const useContract = () => {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (contractAddress, abi, functionName, args = [], options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await writeContract({
        address: contractAddress,
        abi,
        functionName,
        args,
        ...options,
      });

      setLoading(false);
      return result;
    } catch (err) {
      console.error('Contract call error:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [writeContract]);

  const read = useCallback(async (contractAddress, abi, functionName, args = []) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi,
        functionName,
        args,
      });
      return result;
    } catch (err) {
      console.error('Contract read error:', err);
      throw err;
    }
  }, []);

  return { call, read, loading, error, address };
};

export default useContract;
