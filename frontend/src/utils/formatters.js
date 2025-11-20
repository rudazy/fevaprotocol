import { ethers } from 'ethers';

/**
 * Format wallet address to shortened version
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format token amount with decimals
 */
export const formatTokenAmount = (amount, decimals = 18, displayDecimals = 4) => {
  if (!amount) return '0';
  try {
    const formatted = ethers.formatUnits(amount.toString(), decimals);
    const number = parseFloat(formatted);
    return number.toFixed(displayDecimals);
  } catch (error) {
    return '0';
  }
};

/**
 * Parse token amount to BigNumber
 */
export const parseTokenAmount = (amount, decimals = 18) => {
  if (!amount || amount === '') return ethers.parseUnits('0', decimals);
  try {
    return ethers.parseUnits(amount.toString(), decimals);
  } catch (error) {
    return ethers.parseUnits('0', decimals);
  }
};

/**
 * Format USD value
 */
export const formatUSD = (value) => {
  if (!value || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format large numbers with K, M, B suffix
 */
export const formatLargeNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  const number = parseFloat(num);

  if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
  if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
  if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';

  return number.toFixed(2);
};

/**
 * Format percentage
 */
export const formatPercentage = (value) => {
  if (!value || isNaN(value)) return '0.00%';
  return `${parseFloat(value).toFixed(2)}%`;
};

/**
 * Format transaction hash
 */
export const formatTxHash = (hash) => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

/**
 * Calculate price impact
 */
export const calculatePriceImpact = (inputAmount, outputAmount, reserveIn, reserveOut) => {
  if (!inputAmount || !outputAmount || !reserveIn || !reserveOut) return 0;

  try {
    const exactQuote = (parseFloat(inputAmount) * parseFloat(reserveOut)) / parseFloat(reserveIn);
    const priceImpact = ((exactQuote - parseFloat(outputAmount)) / exactQuote) * 100;
    return Math.abs(priceImpact);
  } catch (error) {
    return 0;
  }
};

/**
 * Format date/time
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Validate address
 */
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};
