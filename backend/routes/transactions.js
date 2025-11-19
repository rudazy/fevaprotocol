const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getUserTransactions,
  getRecentTransactions,
  createBridgeTransaction,
  getUserBridgeHistory,
  updateBridgeStatus,
} = require('../controllers/transactionController');
const { validateWalletParam } = require('../middleware/auth');

// @route   GET /api/transactions/recent
// @desc    Get recent platform transactions
// @access  Public
router.get('/recent', getRecentTransactions);

// @route   POST /api/transactions
// @desc    Record new transaction
// @access  Public
router.post('/', createTransaction);

// @route   GET /api/transactions/:walletAddress
// @desc    Get user transactions
// @access  Public
router.get('/:walletAddress', validateWalletParam, getUserTransactions);

// Bridge routes
// @route   POST /api/transactions/bridge
// @desc    Create bridge transaction
// @access  Public
router.post('/bridge', createBridgeTransaction);

// @route   GET /api/transactions/bridge/:walletAddress
// @desc    Get user bridge history
// @access  Public
router.get('/bridge/:walletAddress', validateWalletParam, getUserBridgeHistory);

// @route   PUT /api/transactions/bridge/:id/status
// @desc    Update bridge transaction status
// @access  Public
router.put('/bridge/:id/status', updateBridgeStatus);

module.exports = router;
