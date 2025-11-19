const cron = require('node-cron');
const Task = require('../models/Task');
const { getUTCMidnight } = require('../utils/helpers');

/**
 * Task Reset Service
 * Resets all daily tasks at UTC midnight every day
 */
class TaskResetService {
  constructor() {
    this.cronJob = null;
  }

  /**
   * Start the task reset service
   */
  start() {
    // Run at 00:00 UTC every day
    // Cron format: second minute hour day month weekday
    this.cronJob = cron.schedule('0 0 * * *', async () => {
      console.log('⏰ Running daily task reset at', new Date().toISOString());
      await this.resetDailyTasks();
    }, {
      scheduled: true,
      timezone: 'UTC',
    });

    console.log('✅ Task reset service started');
    console.log('📅 Daily tasks will reset at 00:00 UTC');
  }

  /**
   * Stop the task reset service
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('🛑 Task reset service stopped');
    }
  }

  /**
   * Reset all daily tasks for all users
   */
  async resetDailyTasks() {
    try {
      const today = getUTCMidnight();

      // Find all daily tasks
      const dailyTasks = await Task.find({ isDaily: true });

      console.log(`📊 Found ${dailyTasks.length} daily tasks to process`);

      let resetCount = 0;
      let deletedCount = 0;

      // Process each task
      for (const task of dailyTasks) {
        // If task was completed, reset it
        if (task.completed) {
          task.completed = false;
          task.completedAt = null;
          task.pointsAwarded = 0;
          task.transactionHash = null;
          await task.save();
          resetCount++;
        }
      }

      console.log(`✅ Daily task reset complete:`);
      console.log(`   - Reset ${resetCount} completed tasks`);
      console.log(`   - Total daily tasks: ${dailyTasks.length}`);

      return {
        success: true,
        resetCount,
        totalTasks: dailyTasks.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error resetting daily tasks:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Manual trigger for testing
   */
  async manualReset() {
    console.log('🔧 Manual task reset triggered');
    return await this.resetDailyTasks();
  }
}

// Export singleton instance
const taskResetService = new TaskResetService();

module.exports = taskResetService;
