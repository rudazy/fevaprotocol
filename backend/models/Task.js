const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  taskType: {
    type: String,
    required: true,
    enum: [
      'swap',
      'bridge',
      'deploy',
      'addLiquidity',
      'trade3Different',
      'followTwitter',
      'joinTelegram',
      'joinDiscord',
    ],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  pointsAwarded: {
    type: Number,
    default: 0,
  },
  transactionHash: {
    type: String,
    sparse: true,
  },
  isDaily: {
    type: Boolean,
    required: true,
    default: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Compound index for efficient task queries
taskSchema.index({ walletAddress: 1, taskType: 1, isDaily: 1 });
taskSchema.index({ userId: 1, completed: 1 });

// Method to mark task as completed
taskSchema.methods.complete = function(points, txHash = null) {
  this.completed = true;
  this.completedAt = new Date();
  this.pointsAwarded = points;
  if (txHash) {
    this.transactionHash = txHash;
  }
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
