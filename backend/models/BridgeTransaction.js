const mongoose = require('mongoose');

const bridgeTransactionSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  fromChain: {
    type: String,
    required: true,
    enum: ['sepolia', 'arc'],
  },
  toChain: {
    type: String,
    required: true,
    enum: ['sepolia', 'arc'],
  },
  amount: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true,
  },
  lockTxHash: {
    type: String,
    required: true,
    lowercase: true,
  },
  mintTxHash: {
    type: String,
    lowercase: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  completedAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
});

// Compound indexes
bridgeTransactionSchema.index({ userAddress: 1, createdAt: -1 });
bridgeTransactionSchema.index({ status: 1, createdAt: -1 });

// Method to complete bridge transaction
bridgeTransactionSchema.methods.complete = function(mintTxHash) {
  this.status = 'completed';
  this.mintTxHash = mintTxHash;
  this.completedAt = new Date();
  return this.save();
};

// Method to fail bridge transaction
bridgeTransactionSchema.methods.fail = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.completedAt = new Date();
  return this.save();
};

const BridgeTransaction = mongoose.model('BridgeTransaction', bridgeTransactionSchema);

module.exports = BridgeTransaction;
