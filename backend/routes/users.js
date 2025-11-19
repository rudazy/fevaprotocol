const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUserProfile,
  getUserPoints,
} = require('../controllers/userController');
const { validateWalletParam } = require('../middleware/auth');

// @route   POST /api/users/register
// @desc    Register or get existing user
// @access  Public
router.post('/register', registerUser);

// @route   GET /api/users/:walletAddress
// @desc    Get user profile
// @access  Public
router.get('/:walletAddress', validateWalletParam, getUserProfile);

// @route   GET /api/users/:walletAddress/points
// @desc    Get user points
// @access  Public
router.get('/:walletAddress/points', validateWalletParam, getUserPoints);

module.exports = router;
