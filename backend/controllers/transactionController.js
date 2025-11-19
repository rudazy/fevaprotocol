const Transaction = require('../models/Transaction');
const BridgeTransaction = require('../models/BridgeTransaction');
const { formatResponse, formatError, normalizeAddress, calculatePagination } = require('../utils/helpers');

/**
 * Record new transaction
 * POST /api/transactions
 */
const createTransaction = async (req, res, next) => {
  try {
    const {
      userAddress,
      type,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      transactionHash,
      blockNumber,
    } = req.body;

    if (!userAddress || !type || !tokenIn || !tokenOut || !amountIn || !amountOut || !transactionHash || !blockNumber) {
      return res.status(400).json(formatError('Missing required fields'));
    }

    const normalizedUserAddress = normalizeAddress(userAddress);
    const normalizedTokenIn = normalizeAddress(tokenIn);
    const normalizedTokenOut = normalizeAddress(tokenOut);

    // Check if transaction already exists
    const existingTx = await Transaction.findOne({ transactionHash: transactionHash.toLowerCase() });
    if (existingTx) {
      return res.status(409).json(formatError('Transaction already recorded'));
    }

    // Create transaction
    const transaction = await Transaction.create({
      userAddress: normalizedUserAddress,
      type,
      tokenIn: normalizedTokenIn,
      tokenOut: normalizedTokenOut,
      amountIn,
      amountOut,
      transactionHash: transactionHash.toLowerCase(),
      blockNumber,
    });

    return res.status(201).json(
      formatResponse(true, transaction, 'Transaction recorded successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user transactions
 * GET /api/transactions/:walletAddress?page=1&limit=20
 */
const getUserTransactions = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const { page, limit } = req.query;

    const normalizedAddress = normalizeAddress(walletAddress);
    const { page: parsedPage, limit: parsedLimit, skip } = calculatePagination(page, limit);

    const total = await Transaction.countDocuments({ userAddress: normalizedAddress });

    const transactions = await Transaction.find({ userAddress: normalizedAddress })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parsedLimit);

    return res.status(200).json(
      formatResponse(
        true,
        transactions,
        'Transactions retrieved successfully',
        {
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            pages: Math.ceil(total / parsedLimit),
          },
        }
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent platform transactions
 * GET /api/transactions/recent?limit=50
 */
const getRecentTransactions = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 50, 100);

    const transactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(parsedLimit);

    return res.status(200).json(
      formatResponse(true, transactions, 'Recent transactions retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create bridge transaction
 * POST /api/bridge
 */
const createBridgeTransaction = async (req, res, next) => {
  try {
    const {
      userAddress,
      fromChain,
      toChain,
      amount,
      lockTxHash,
    } = req.body;

    if (!userAddress || !fromChain || !toChain || !amount || !lockTxHash) {
      return res.status(400).json(formatError('Missing required fields'));
    }

    if (!['sepolia', 'arc'].includes(fromChain) || !['sepolia', 'arc'].includes(toChain)) {
      return res.status(400).json(formatError('Invalid chain. Must be sepolia or arc'));
    }

    if (fromChain === toChain) {
      return res.status(400).json(formatError('Cannot bridge to the same chain'));
    }

    const normalizedAddress = normalizeAddress(userAddress);

    // Create bridge transaction
    const bridgeTx = await BridgeTransaction.create({
      userAddress: normalizedAddress,
      fromChain,
      toChain,
      amount,
      lockTxHash: lockTxHash.toLowerCase(),
      status: 'pending',
    });

    return res.status(201).json(
      formatResponse(true, bridgeTx, 'Bridge transaction created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user bridge history
 * GET /api/bridge/:walletAddress
 */
const getUserBridgeHistory = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const { page, limit } = req.query;

    const normalizedAddress = normalizeAddress(walletAddress);
    const { page: parsedPage, limit: parsedLimit, skip } = calculatePagination(page, limit);

    const total = await BridgeTransaction.countDocuments({ userAddress: normalizedAddress });

    const bridgeTransactions = await BridgeTransaction.find({ userAddress: normalizedAddress })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    return res.status(200).json(
      formatResponse(
        true,
        bridgeTransactions,
        'Bridge history retrieved successfully',
        {
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            pages: Math.ceil(total / parsedLimit),
          },
        }
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update bridge transaction status
 * PUT /api/bridge/:id/status
 */
const updateBridgeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, mintTxHash, errorMessage } = req.body;

    if (!status) {
      return res.status(400).json(formatError('Status is required'));
    }

    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json(formatError('Invalid status'));
    }

    const bridgeTx = await BridgeTransaction.findById(id);

    if (!bridgeTx) {
      return res.status(404).json(formatError('Bridge transaction not found'));
    }

    // Update status
    if (status === 'completed' && mintTxHash) {
      await bridgeTx.complete(mintTxHash.toLowerCase());
    } else if (status === 'failed') {
      await bridgeTx.fail(errorMessage || 'Bridge transaction failed');
    } else {
      bridgeTx.status = status;
      await bridgeTx.save();
    }

    return res.status(200).json(
      formatResponse(true, bridgeTx, 'Bridge status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getRecentTransactions,
  createBridgeTransaction,
  getUserBridgeHistory,
  updateBridgeStatus,
};
