const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

// Index for leaderboard queries
userSchema.index({ totalPoints: -1 });

// Update lastActive on any save
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Virtual for user rank (calculated when needed)
userSchema.virtual('rank').get(function() {
  return this._rank;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
