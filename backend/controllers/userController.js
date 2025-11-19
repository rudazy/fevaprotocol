const User = require('../models/User');
const { formatResponse, formatError, normalizeAddress } = require('../utils/helpers');

/**
 * Register or get existing user
 * POST /api/users/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json(formatError('Wallet address is required'));
    }

    const normalizedAddress = normalizeAddress(walletAddress);

    // Check if user already exists
    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (user) {
      // Update last active
      user.lastActive = new Date();
      await user.save();

      return res.status(200).json(
        formatResponse(true, user, 'User retrieved successfully')
      );
    }

    // Create new user
    user = await User.create({
      walletAddress: normalizedAddress,
    });

    return res.status(201).json(
      formatResponse(true, user, 'User registered successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile
 * GET /api/users/:walletAddress
 */
const getUserProfile = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    return res.status(200).json(
      formatResponse(true, user, 'User profile retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user points
 * GET /api/users/:walletAddress/points
 */
const getUserPoints = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    return res.status(200).json(
      formatResponse(
        true,
        {
          walletAddress: user.walletAddress,
          totalPoints: user.totalPoints,
        },
        'User points retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  getUserProfile,
  getUserPoints,
};
