const express = require('express');
const router = express.Router();
const {
  getUserTasks,
  completeTask,
  getDailyTasks,
  getSocialTasks,
  verifySocialTask,
} = require('../controllers/taskController');
const { validateWalletParam } = require('../middleware/auth');

// @route   GET /api/tasks/:walletAddress
// @desc    Get all tasks for user
// @access  Public
router.get('/:walletAddress', validateWalletParam, getUserTasks);

// @route   POST /api/tasks/complete
// @desc    Mark task as completed
// @access  Public
router.post('/complete', completeTask);

// @route   GET /api/tasks/:walletAddress/daily
// @desc    Get daily tasks status
// @access  Public
router.get('/:walletAddress/daily', validateWalletParam, getDailyTasks);

// @route   GET /api/tasks/:walletAddress/social
// @desc    Get social tasks status
// @access  Public
router.get('/:walletAddress/social', validateWalletParam, getSocialTasks);

// @route   POST /api/tasks/verify-social
// @desc    Verify social task completion
// @access  Public
router.post('/verify-social', verifySocialTask);

module.exports = router;
