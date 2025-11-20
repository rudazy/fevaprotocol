import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import { getTokens, getTokenDetails as apiGetTokenDetails } from '../utils/api';
import { ERC20_ABI, DEX_PAIR_ABI, DEX_FACTORY_ABI } from '../utils/contracts';
import { CONTRACTS } from '../utils/constants';

export const useTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { address, chainId } = useAccount();

  const fetchAllTokens = useCallback(async (filter = 'new', search = '', page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = search
        ? await searchTokens(search, page)
        : await getTokens(filter, page, 20);

      setTokens(response.data || []);
      setLoading(false);
      return response;
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError(err.message);
      setLoading(false);
      return { data: [], pagination: {} };
    }
  }, []);

  const fetchTokenPrice = useCallback(async (tokenAddress) => {
    try {
      const contracts = chainId === 8668 ? CONTRACTS.ARC : CONTRACTS.SEPOLIA;
      const factoryAddress = contracts.DEX_FACTORY;

      // Get pair address
      const pairAddress = await useReadContract({
        address: factoryAddress,
        abi: DEX_FACTORY_ABI,
        functionName: 'getPair',
        args: [tokenAddress, contracts.FEV_TOKEN],
      });

      if (!pairAddress || pairAddress === ethers.ZeroAddress) {
        return { price: '0', reserves: null };
      }

      // Get reserves
      const reserves = await useReadContract({
        address: pairAddress,
        abi: DEX_PAIR_ABI,
        functionName: 'getReserves',
      });

      // Calculate price (assuming token0 is TOKEN and token1 is FEV)
      const price = parseFloat(ethers.formatUnits(reserves[1], 18)) /
                   parseFloat(ethers.formatUnits(reserves[0], 18));

      return { price: price.toString(), reserves };
    } catch (err) {
      console.error('Error fetching token price:', err);
      return { price: '0', reserves: null };
    }
  }, [chainId]);

  const fetchTokenDetails = useCallback(async (contractAddress) => {
    setLoading(true);
    try {
      const details = await apiGetTokenDetails(contractAddress);
      setLoading(false);
      return details;
    } catch (err) {
      console.error('Error fetching token details:', err);
      setLoading(false);
      return null;
    }
  }, []);

  const searchTokens = useCallback(async (query, page = 1) => {
    try {
      const response = await getTokens('new', page, 20);
      const filtered = response.data.filter(token =>
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase()) ||
        token.contractAddress.toLowerCase().includes(query.toLowerCase())
      );
      return { data: filtered, pagination: response.pagination };
    } catch (err) {
      console.error('Error searching tokens:', err);
      return { data: [], pagination: {} };
    }
  }, []);

  return {
    tokens,
    loading,
    error,
    fetchAllTokens,
    fetchTokenPrice,
    fetchTokenDetails,
    searchTokens,
  };
};

export default useTokens;
