const express = require('express');
const router = express.Router();
const {
  createToken,
  getTokens,
  getTokenDetails,
  updateTokenMetadata,
  searchTokens,
} = require('../controllers/tokenController');

// @route   GET /api/tokens/search
// @desc    Search tokens by name/symbol
// @access  Public
router.get('/search', searchTokens);

// @route   POST /api/tokens
// @desc    Create new token entry
// @access  Public
router.post('/', createToken);

// @route   GET /api/tokens
// @desc    Get all tokens (with filters)
// @access  Public
router.get('/', getTokens);

// @route   GET /api/tokens/:contractAddress
// @desc    Get token details
// @access  Public
router.get('/:contractAddress', getTokenDetails);

// @route   PUT /api/tokens/:contractAddress
// @desc    Update token metadata
// @access  Public
router.put('/:contractAddress', updateTokenMetadata);

module.exports = router;
