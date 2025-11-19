const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['swap', 'addLiquidity', 'removeLiquidity'],
  },
  tokenIn: {
    type: String,
    required: true,
    lowercase: true,
  },
  tokenOut: {
    type: String,
    required: true,
    lowercase: true,
  },
  amountIn: {
    type: String,
    required: true,
  },
  amountOut: {
    type: String,
    required: true,
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  blockNumber: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound indexes for efficient queries
transactionSchema.index({ userAddress: 1, timestamp: -1 });
transactionSchema.index({ timestamp: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
