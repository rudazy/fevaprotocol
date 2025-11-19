/**
 * Task configuration
 * Defines all available tasks and their point values
 */

const TASK_CONFIG = {
  // Daily tasks (reset every day at UTC midnight)
  daily: {
    swap: {
      name: 'Make a Swap',
      description: 'Swap any token on the DEX',
      points: 10,
      type: 'swap',
      icon: '🔄',
    },
    bridge: {
      name: 'Bridge Tokens',
      description: 'Bridge FEV between Sepolia and Arc',
      points: 15,
      type: 'bridge',
      icon: '🌉',
    },
    deploy: {
      name: 'Deploy a Token',
      description: 'Create your own memecoin',
      points: 50,
      type: 'deploy',
      icon: '🚀',
    },
    addLiquidity: {
      name: 'Add Liquidity',
      description: 'Provide liquidity to any pool',
      points: 20,
      type: 'addLiquidity',
      icon: '💧',
    },
    trade3Different: {
      name: 'Trade 3 Different Tokens',
      description: 'Swap 3 different token pairs',
      points: 25,
      type: 'trade3Different',
      icon: '🎯',
    },
  },

  // Social tasks (one-time only, never reset)
  social: {
    followTwitter: {
      name: 'Follow on Twitter',
      description: 'Follow FEVA Protocol on Twitter',
      points: 50,
      type: 'followTwitter',
      icon: '🐦',
      url: 'https://twitter.com/fevaprotocol',
    },
    joinTelegram: {
      name: 'Join Telegram',
      description: 'Join our Telegram community',
      points: 50,
      type: 'joinTelegram',
      icon: '✈️',
      url: 'https://t.me/fevaprotocol',
    },
    joinDiscord: {
      name: 'Join Discord',
      description: 'Join our Discord server',
      points: 50,
      type: 'joinDiscord',
      icon: '💬',
      url: 'https://discord.gg/fevaprotocol',
    },
  },
};

/**
 * Get points for a specific task type
 */
const getTaskPoints = (taskType) => {
  // Check daily tasks
  const dailyTask = Object.values(TASK_CONFIG.daily).find(
    (task) => task.type === taskType
  );
  if (dailyTask) return dailyTask.points;

  // Check social tasks
  const socialTask = Object.values(TASK_CONFIG.social).find(
    (task) => task.type === taskType
  );
  if (socialTask) return socialTask.points;

  return 0;
};

/**
 * Get all task types
 */
const getAllTaskTypes = () => {
  const dailyTypes = Object.values(TASK_CONFIG.daily).map((task) => task.type);
  const socialTypes = Object.values(TASK_CONFIG.social).map((task) => task.type);
  return [...dailyTypes, ...socialTypes];
};

/**
 * Get task configuration by type
 */
const getTaskConfig = (taskType) => {
  // Check daily tasks
  const dailyTask = Object.values(TASK_CONFIG.daily).find(
    (task) => task.type === taskType
  );
  if (dailyTask) return { ...dailyTask, isDaily: true };

  // Check social tasks
  const socialTask = Object.values(TASK_CONFIG.social).find(
    (task) => task.type === taskType
  );
  if (socialTask) return { ...socialTask, isDaily: false };

  return null;
};

module.exports = {
  TASK_CONFIG,
  getTaskPoints,
  getAllTaskTypes,
  getTaskConfig,
};
