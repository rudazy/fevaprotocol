const { verifySignature, isValidAddress, formatError } = require('../utils/helpers');

/**
 * Simple authentication middleware
 * Verifies wallet signature for protected routes
 */
const authenticate = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Check if required fields are present
    if (!walletAddress || !signature || !message) {
      return res.status(401).json(
        formatError('Authentication required', [
          'Missing walletAddress, signature, or message',
        ])
      );
    }

    // Validate wallet address format
    if (!isValidAddress(walletAddress)) {
      return res.status(400).json(
        formatError('Invalid wallet address format')
      );
    }

    // Verify signature
    const isValid = verifySignature(message, signature, walletAddress);

    if (!isValid) {
      return res.status(401).json(
        formatError('Invalid signature')
      );
    }

    // Attach wallet address to request
    req.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json(
      formatError('Authentication failed', [error.message])
    );
  }
};

/**
 * Optional authentication middleware
 * Verifies signature if provided, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (walletAddress && signature && message) {
      const isValid = verifySignature(message, signature, walletAddress);
      if (isValid) {
        req.walletAddress = walletAddress.toLowerCase();
      }
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Validate wallet address from params
 */
const validateWalletParam = (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json(
        formatError('Wallet address is required')
      );
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json(
        formatError('Invalid wallet address format')
      );
    }

    req.params.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    return res.status(500).json(
      formatError('Validation failed', [error.message])
    );
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  validateWalletParam,
};
