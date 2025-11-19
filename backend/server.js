const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./utils/db');
const { errorHandler, notFound, logger } = require('./middleware/errorHandler');
const taskResetService = require('./services/taskResetService');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use(logger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FEVA Protocol API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'FEVA Protocol API v1.0.0',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
      tokens: '/api/tokens',
      transactions: '/api/transactions',
      leaderboard: '/api/leaderboard',
    },
  });
});

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tokens', require('./routes/tokens'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start task reset service
taskResetService.start();

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log('🚀 FEVA PROTOCOL API SERVER');
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`${'='.repeat(50)}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  taskResetService.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully');
  taskResetService.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
