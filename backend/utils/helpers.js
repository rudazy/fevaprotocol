const { ethers } = require('ethers');

/**
 * Validate Ethereum address
 */
const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

/**
 * Normalize Ethereum address to lowercase
 */
const normalizeAddress = (address) => {
  if (!isValidAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  return address.toLowerCase();
};

/**
 * Verify wallet signature
 */
const verifySignature = (message, signature, address) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
};

/**
 * Generate nonce message for wallet signature
 */
const generateNonceMessage = (address, nonce) => {
  return `Sign this message to authenticate with FEVA Protocol.\n\nWallet: ${address}\nNonce: ${nonce}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
};

/**
 * Calculate pagination offset
 */
const calculatePagination = (page = 1, limit = 20) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 20;
  const maxLimit = 100;

  return {
    page: parsedPage,
    limit: Math.min(parsedLimit, maxLimit),
    skip: (parsedPage - 1) * Math.min(parsedLimit, maxLimit),
  };
};

/**
 * Format API response
 */
const formatResponse = (success, data = null, message = '', meta = {}) => {
  return {
    success,
    message,
    data,
    ...meta,
  };
};

/**
 * Format error response
 */
const formatError = (message, errors = []) => {
  return {
    success: false,
    message,
    errors,
  };
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Check if task is daily task
 */
const isDailyTask = (taskType) => {
  const dailyTasks = ['swap', 'bridge', 'deploy', 'addLiquidity', 'trade3Different'];
  return dailyTasks.includes(taskType);
};

/**
 * Check if task is social task
 */
const isSocialTask = (taskType) => {
  const socialTasks = ['followTwitter', 'joinTelegram', 'joinDiscord'];
  return socialTasks.includes(taskType);
};

/**
 * Get UTC midnight timestamp
 */
const getUTCMidnight = (date = new Date()) => {
  const midnight = new Date(date);
  midnight.setUTCHours(0, 0, 0, 0);
  return midnight;
};

/**
 * Check if date is today (UTC)
 */
const isToday = (date) => {
  const today = getUTCMidnight();
  const checkDate = getUTCMidnight(date);
  return today.getTime() === checkDate.getTime();
};

module.exports = {
  isValidAddress,
  normalizeAddress,
  verifySignature,
  generateNonceMessage,
  calculatePagination,
  formatResponse,
  formatError,
  sanitizeInput,
  isDailyTask,
  isSocialTask,
  getUTCMidnight,
  isToday,
};
