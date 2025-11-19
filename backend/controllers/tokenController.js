const Token = require('../models/Token');
const { formatResponse, formatError, normalizeAddress, calculatePagination, sanitizeInput } = require('../utils/helpers');

/**
 * Create new token entry
 * POST /api/tokens
 */
const createToken = async (req, res, next) => {
  try {
    const {
      contractAddress,
      name,
      symbol,
      totalSupply,
      decimals,
      logoUrl,
      websiteUrl,
      twitterUrl,
      telegramUrl,
      discordUrl,
      description,
      creator,
      pairAddress,
      initialLiquidity,
    } = req.body;

    if (!contractAddress || !name || !symbol || !totalSupply || !creator) {
      return res.status(400).json(
        formatError('Missing required fields')
      );
    }

    const normalizedAddress = normalizeAddress(contractAddress);
    const normalizedCreator = normalizeAddress(creator);

    // Check if token already exists
    const existingToken = await Token.findOne({ contractAddress: normalizedAddress });
    if (existingToken) {
      return res.status(409).json(
        formatError('Token already exists')
      );
    }

    // Create new token
    const token = await Token.create({
      contractAddress: normalizedAddress,
      name: sanitizeInput(name),
      symbol: sanitizeInput(symbol).toUpperCase(),
      totalSupply,
      decimals: decimals || 18,
      logoUrl: sanitizeInput(logoUrl || ''),
      websiteUrl: sanitizeInput(websiteUrl || ''),
      twitterUrl: sanitizeInput(twitterUrl || ''),
      telegramUrl: sanitizeInput(telegramUrl || ''),
      discordUrl: sanitizeInput(discordUrl || ''),
      description: sanitizeInput(description || ''),
      creator: normalizedCreator,
      pairAddress: pairAddress ? normalizeAddress(pairAddress) : '',
      initialLiquidity: initialLiquidity || '0',
    });

    return res.status(201).json(
      formatResponse(true, token, 'Token created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tokens with filters
 * GET /api/tokens?filter=trending&page=1&limit=20
 */
const getTokens = async (req, res, next) => {
  try {
    const { filter = 'new', page, limit } = req.query;
    const { page: parsedPage, limit: parsedLimit, skip } = calculatePagination(page, limit);

    let sortOptions = {};
    let query = {};

    // Apply filters
    switch (filter) {
      case 'trending':
        sortOptions = { volume24h: -1, createdAt: -1 };
        break;
      case 'new':
        sortOptions = { createdAt: -1 };
        break;
      case 'volume':
        sortOptions = { volume24h: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Get total count
    const total = await Token.countDocuments(query);

    // Get tokens
    const tokens = await Token.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit);

    return res.status(200).json(
      formatResponse(
        true,
        tokens,
        'Tokens retrieved successfully',
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
 * Get token details
 * GET /api/tokens/:contractAddress
 */
const getTokenDetails = async (req, res, next) => {
  try {
    const { contractAddress } = req.params;
    const normalizedAddress = normalizeAddress(contractAddress);

    const token = await Token.findOne({ contractAddress: normalizedAddress });

    if (!token) {
      return res.status(404).json(formatError('Token not found'));
    }

    return res.status(200).json(
      formatResponse(true, token, 'Token details retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update token metadata
 * PUT /api/tokens/:contractAddress
 */
const updateTokenMetadata = async (req, res, next) => {
  try {
    const { contractAddress } = req.params;
    const {
      logoUrl,
      websiteUrl,
      twitterUrl,
      telegramUrl,
      discordUrl,
      description,
      volume24h,
      priceInFEV,
      marketCap,
      holders,
    } = req.body;

    const normalizedAddress = normalizeAddress(contractAddress);

    const token = await Token.findOne({ contractAddress: normalizedAddress });

    if (!token) {
      return res.status(404).json(formatError('Token not found'));
    }

    // Update metadata
    if (logoUrl !== undefined) token.logoUrl = sanitizeInput(logoUrl);
    if (websiteUrl !== undefined) token.websiteUrl = sanitizeInput(websiteUrl);
    if (twitterUrl !== undefined) token.twitterUrl = sanitizeInput(twitterUrl);
    if (telegramUrl !== undefined) token.telegramUrl = sanitizeInput(telegramUrl);
    if (discordUrl !== undefined) token.discordUrl = sanitizeInput(discordUrl);
    if (description !== undefined) token.description = sanitizeInput(description);
    if (volume24h !== undefined) token.volume24h = volume24h;
    if (priceInFEV !== undefined) token.priceInFEV = priceInFEV;
    if (marketCap !== undefined) token.marketCap = marketCap;
    if (holders !== undefined) token.holders = holders;

    await token.save();

    return res.status(200).json(
      formatResponse(true, token, 'Token updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Search tokens
 * GET /api/tokens/search?q=searchTerm
 */
const searchTokens = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;

    if (!q) {
      return res.status(400).json(formatError('Search query is required'));
    }

    const { page: parsedPage, limit: parsedLimit, skip } = calculatePagination(page, limit);

    // Search by name or symbol
    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { symbol: { $regex: q, $options: 'i' } },
      ],
    };

    const total = await Token.countDocuments(query);

    const tokens = await Token.find(query)
      .sort({ volume24h: -1, createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    return res.status(200).json(
      formatResponse(
        true,
        tokens,
        'Search results retrieved successfully',
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

module.exports = {
  createToken,
  getTokens,
  getTokenDetails,
  updateTokenMetadata,
  searchTokens,
};
