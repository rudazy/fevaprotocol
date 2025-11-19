const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  totalSupply: {
    type: String,
    required: true,
  },
  decimals: {
    type: Number,
    required: true,
    default: 18,
  },
  logoUrl: {
    type: String,
    default: '',
  },
  websiteUrl: {
    type: String,
    default: '',
  },
  twitterUrl: {
    type: String,
    default: '',
  },
  telegramUrl: {
    type: String,
    default: '',
  },
  discordUrl: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  creator: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  pairAddress: {
    type: String,
    lowercase: true,
    sparse: true,
  },
  initialLiquidity: {
    type: String,
    default: '0',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  volume24h: {
    type: String,
    default: '0',
  },
  priceInFEV: {
    type: String,
    default: '0',
  },
  marketCap: {
    type: String,
    default: '0',
  },
  holders: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for search and filtering
tokenSchema.index({ name: 'text', symbol: 'text' });
tokenSchema.index({ volume24h: -1 });
tokenSchema.index({ createdAt: -1 });

// Update timestamp on save
tokenSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
