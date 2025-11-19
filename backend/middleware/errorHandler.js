const { formatError } = require('../utils/helpers');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => error.message);
    return res.status(400).json(
      formatError('Validation failed', errors)
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json(
      formatError(`Duplicate ${field}`, [`${field} already exists`])
    );
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json(
      formatError('Invalid ID format', [err.message])
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      formatError('Invalid token', [err.message])
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      formatError('Token expired', [err.message])
    );
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json(
    formatError(message, [err.stack])
  );
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  return res.status(404).json(
    formatError(`Route not found: ${req.originalUrl}`)
  );
};

/**
 * Request logger middleware
 */
const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

module.exports = {
  errorHandler,
  notFound,
  logger,
};
