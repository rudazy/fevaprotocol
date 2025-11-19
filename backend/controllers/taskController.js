const Task = require('../models/Task');
const User = require('../models/User');
const { TASK_CONFIG, getTaskPoints, getTaskConfig } = require('../config/taskConfig');
const { formatResponse, formatError, normalizeAddress, isDailyTask, isSocialTask, getUTCMidnight } = require('../utils/helpers');

/**
 * Get all tasks for a user
 * GET /api/tasks/:walletAddress
 */
const getUserTasks = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    // Get user
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    // Get all tasks for user
    const tasks = await Task.find({
      userId: user._id,
      walletAddress,
    }).sort({ completedAt: -1 });

    // Get task configs
    const dailyTasksConfig = Object.values(TASK_CONFIG.daily);
    const socialTasksConfig = Object.values(TASK_CONFIG.social);

    // Build response with task status
    const dailyTasks = dailyTasksConfig.map((config) => {
      const userTask = tasks.find((t) => t.taskType === config.type && t.isDaily);
      return {
        ...config,
        isDaily: true,
        completed: userTask ? userTask.completed : false,
        completedAt: userTask ? userTask.completedAt : null,
        pointsAwarded: userTask ? userTask.pointsAwarded : 0,
      };
    });

    const socialTasks = socialTasksConfig.map((config) => {
      const userTask = tasks.find((t) => t.taskType === config.type && !t.isDaily);
      return {
        ...config,
        isDaily: false,
        completed: userTask ? userTask.completed : false,
        completedAt: userTask ? userTask.completedAt : null,
        pointsAwarded: userTask ? userTask.pointsAwarded : 0,
      };
    });

    return res.status(200).json(
      formatResponse(
        true,
        {
          daily: dailyTasks,
          social: socialTasks,
          totalPoints: user.totalPoints,
        },
        'Tasks retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a task
 * POST /api/tasks/complete
 */
const completeTask = async (req, res, next) => {
  try {
    const { walletAddress, taskType, transactionHash, metadata } = req.body;

    if (!walletAddress || !taskType) {
      return res.status(400).json(
        formatError('walletAddress and taskType are required')
      );
    }

    const normalizedAddress = normalizeAddress(walletAddress);

    // Get or create user
    let user = await User.findOne({ walletAddress: normalizedAddress });
    if (!user) {
      user = await User.create({ walletAddress: normalizedAddress });
    }

    // Get task configuration
    const taskConfig = getTaskConfig(taskType);
    if (!taskConfig) {
      return res.status(400).json(formatError('Invalid task type'));
    }

    // Check if task exists for user
    let task = await Task.findOne({
      userId: user._id,
      walletAddress: normalizedAddress,
      taskType,
      isDaily: taskConfig.isDaily,
    });

    // If task exists and is completed
    if (task && task.completed) {
      // For social tasks (one-time), don't allow completion again
      if (!taskConfig.isDaily) {
        return res.status(400).json(
          formatError('Social task already completed')
        );
      }

      // For daily tasks, they should have been reset at midnight
      return res.status(400).json(
        formatError('Task already completed today')
      );
    }

    // Create task if it doesn't exist
    if (!task) {
      task = await Task.create({
        userId: user._id,
        walletAddress: normalizedAddress,
        taskType,
        isDaily: taskConfig.isDaily,
        metadata: metadata || {},
      });
    }

    // Mark task as completed
    const points = getTaskPoints(taskType);
    await task.complete(points, transactionHash);

    // Update user points
    user.totalPoints += points;
    await user.save();

    return res.status(200).json(
      formatResponse(
        true,
        {
          task,
          newTotalPoints: user.totalPoints,
          pointsEarned: points,
        },
        'Task completed successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get daily tasks status
 * GET /api/tasks/:walletAddress/daily
 */
const getDailyTasks = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    const dailyTasks = await Task.find({
      userId: user._id,
      walletAddress,
      isDaily: true,
    });

    const dailyTasksConfig = Object.values(TASK_CONFIG.daily);

    const tasksStatus = dailyTasksConfig.map((config) => {
      const userTask = dailyTasks.find((t) => t.taskType === config.type);
      return {
        ...config,
        completed: userTask ? userTask.completed : false,
        completedAt: userTask ? userTask.completedAt : null,
        pointsAwarded: userTask ? userTask.pointsAwarded : 0,
      };
    });

    return res.status(200).json(
      formatResponse(true, tasksStatus, 'Daily tasks retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get social tasks status
 * GET /api/tasks/:walletAddress/social
 */
const getSocialTasks = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    const socialTasks = await Task.find({
      userId: user._id,
      walletAddress,
      isDaily: false,
    });

    const socialTasksConfig = Object.values(TASK_CONFIG.social);

    const tasksStatus = socialTasksConfig.map((config) => {
      const userTask = socialTasks.find((t) => t.taskType === config.type);
      return {
        ...config,
        completed: userTask ? userTask.completed : false,
        completedAt: userTask ? userTask.completedAt : null,
        pointsAwarded: userTask ? userTask.pointsAwarded : 0,
      };
    });

    return res.status(200).json(
      formatResponse(true, tasksStatus, 'Social tasks retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify social task completion
 * POST /api/tasks/verify-social
 */
const verifySocialTask = async (req, res, next) => {
  try {
    const { walletAddress, taskType } = req.body;

    if (!walletAddress || !taskType) {
      return res.status(400).json(
        formatError('walletAddress and taskType are required')
      );
    }

    if (!isSocialTask(taskType)) {
      return res.status(400).json(
        formatError('Invalid social task type')
      );
    }

    // In a real application, you would verify the social action here
    // For now, we'll just mark it as completable
    // You could integrate with Twitter API, Telegram Bot API, etc.

    return res.status(200).json(
      formatResponse(
        true,
        { verified: true, taskType },
        'Social task verification successful. You can now complete the task.'
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserTasks,
  completeTask,
  getDailyTasks,
  getSocialTasks,
  verifySocialTask,
};
