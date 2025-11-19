const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getUserRank,
} = require('../controllers/leaderboardController');
const { validateWalletParam } = require('../middleware/auth');

// @route   GET /api/leaderboard
// @desc    Get leaderboard (top users by points)
// @access  Public
router.get('/', getLeaderboard);

// @route   GET /api/leaderboard/rank/:walletAddress
// @desc    Get user rank
// @access  Public
router.get('/rank/:walletAddress', validateWalletParam, getUserRank);

module.exports = router;
