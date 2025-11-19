const User = require('../models/User');
const { formatResponse, formatError, normalizeAddress, calculatePagination } = require('../utils/helpers');

/**
 * Get leaderboard (top users by points)
 * GET /api/leaderboard?page=1&limit=100
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const { page: parsedPage, limit: parsedLimit, skip } = calculatePagination(page, limit);

    // Get total users
    const total = await User.countDocuments({ totalPoints: { $gt: 0 } });

    // Get top users
    const users = await User.find({ totalPoints: { $gt: 0 } })
      .sort({ totalPoints: -1, createdAt: 1 })
      .skip(skip)
      .limit(parsedLimit)
      .select('walletAddress totalPoints createdAt lastActive');

    // Add rank to each user
    const usersWithRank = users.map((user, index) => ({
      rank: skip + index + 1,
      walletAddress: user.walletAddress,
      totalPoints: user.totalPoints,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    }));

    return res.status(200).json(
      formatResponse(
        true,
        usersWithRank,
        'Leaderboard retrieved successfully',
        {
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            pages: Math.ceil(total / parsedLimit),
          },
        }
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user rank
 * GET /api/leaderboard/rank/:walletAddress
 */
const getUserRank = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const normalizedAddress = normalizeAddress(walletAddress);

    // Find user
    const user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    // Calculate rank
    const rank = await User.countDocuments({
      totalPoints: { $gt: user.totalPoints },
    }) + 1;

    // Get total users with points
    const totalUsers = await User.countDocuments({ totalPoints: { $gt: 0 } });

    // Get users above and below (for context)
    const usersAbove = await User.find({
      totalPoints: { $gt: user.totalPoints },
    })
      .sort({ totalPoints: 1 })
      .limit(3)
      .select('walletAddress totalPoints');

    const usersBelow = await User.find({
      totalPoints: { $lt: user.totalPoints },
    })
      .sort({ totalPoints: -1 })
      .limit(3)
      .select('walletAddress totalPoints');

    return res.status(200).json(
      formatResponse(
        true,
        {
          user: {
            walletAddress: user.walletAddress,
            totalPoints: user.totalPoints,
            rank,
          },
          totalUsers,
          percentile: ((totalUsers - rank + 1) / totalUsers * 100).toFixed(2),
          nearby: {
            above: usersAbove.reverse(),
            below: usersBelow,
          },
        },
        'User rank retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getUserRank,
};
