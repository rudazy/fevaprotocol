import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const registerUser = async (walletAddress) => {
  const response = await api.post('/api/users/register', { walletAddress });
  return response.data;
};

export const getUserProfile = async (walletAddress) => {
  const response = await api.get(`/api/users/${walletAddress}`);
  return response.data;
};

export const getUserPoints = async (walletAddress) => {
  const response = await api.get(`/api/users/${walletAddress}/points`);
  return response.data;
};

// Tasks API
export const getUserTasks = async (walletAddress) => {
  const response = await api.get(`/api/tasks/${walletAddress}`);
  return response.data;
};

export const completeTask = async (walletAddress, taskType, transactionHash) => {
  const response = await api.post('/api/tasks/complete', {
    walletAddress,
    taskType,
    transactionHash,
  });
  return response.data;
};

// Tokens API
export const createToken = async (tokenData) => {
  const response = await api.post('/api/tokens', tokenData);
  return response.data;
};

export const getTokens = async (filter = 'new', page = 1, limit = 20) => {
  const response = await api.get(`/api/tokens`, {
    params: { filter, page, limit },
  });
  return response.data;
};

export const getTokenDetails = async (contractAddress) => {
  const response = await api.get(`/api/tokens/${contractAddress}`);
  return response.data;
};

export const searchTokens = async (query, page = 1, limit = 20) => {
  const response = await api.get(`/api/tokens/search`, {
    params: { q: query, page, limit },
  });
  return response.data;
};

// Transactions API
export const recordTransaction = async (txData) => {
  const response = await api.post('/api/transactions', txData);
  return response.data;
};

export const getUserTransactions = async (walletAddress, page = 1, limit = 20) => {
  const response = await api.get(`/api/transactions/${walletAddress}`, {
    params: { page, limit },
  });
  return response.data;
};

// Leaderboard API
export const getLeaderboard = async (page = 1, limit = 100) => {
  const response = await api.get('/api/leaderboard', {
    params: { page, limit },
  });
  return response.data;
};

export const getUserRank = async (walletAddress) => {
  const response = await api.get(`/api/leaderboard/rank/${walletAddress}`);
  return response.data;
};

export default api;
