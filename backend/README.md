# FEVA Protocol Backend API

Backend API for FEVA Protocol with task system, token management, leaderboard, and bridge functionality.

## Features

- 🎯 Task System (Daily & Social tasks)
- 💰 Points & Leaderboard
- 🪙 Token Management
- 🔄 Transaction Tracking
- 🌉 Bridge Transaction Management
- ⏰ Automated Daily Task Reset (UTC midnight)
- 🔒 Wallet Signature Authentication
- 📊 MongoDB Database

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- ethers.js (wallet signature verification)
- node-cron (task reset automation)
- CORS enabled
- Rate limiting

## Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and other configs

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secret_here
```

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

---

### 👤 Users

#### Register/Get User
```http
POST /api/users/register
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "totalPoints": 0,
    "createdAt": "2025-01-19T...",
    "lastActive": "2025-01-19T..."
  }
}
```

#### Get User Profile
```http
GET /api/users/:walletAddress
```

#### Get User Points
```http
GET /api/users/:walletAddress/points
```

---

### 📋 Tasks

#### Get All Tasks for User
```http
GET /api/tasks/:walletAddress
```

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "daily": [
      {
        "name": "Make a Swap",
        "description": "Swap any token on the DEX",
        "points": 10,
        "type": "swap",
        "icon": "🔄",
        "isDaily": true,
        "completed": false,
        "completedAt": null,
        "pointsAwarded": 0
      }
    ],
    "social": [
      {
        "name": "Follow on Twitter",
        "description": "Follow FEVA Protocol on Twitter",
        "points": 50,
        "type": "followTwitter",
        "icon": "🐦",
        "url": "https://twitter.com/fevaprotocol",
        "isDaily": false,
        "completed": false,
        "completedAt": null,
        "pointsAwarded": 0
      }
    ],
    "totalPoints": 0
  }
}
```

#### Complete a Task
```http
POST /api/tasks/complete
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "taskType": "swap",
  "transactionHash": "0x123...",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task completed successfully",
  "data": {
    "task": { ... },
    "newTotalPoints": 10,
    "pointsEarned": 10
  }
}
```

#### Get Daily Tasks
```http
GET /api/tasks/:walletAddress/daily
```

#### Get Social Tasks
```http
GET /api/tasks/:walletAddress/social
```

#### Verify Social Task
```http
POST /api/tasks/verify-social
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "taskType": "followTwitter"
}
```

---

### 🪙 Tokens

#### Create Token
```http
POST /api/tokens
Content-Type: application/json

{
  "contractAddress": "0x...",
  "name": "My Memecoin",
  "symbol": "MEME",
  "totalSupply": "1000000000000000000000000000",
  "decimals": 18,
  "logoUrl": "https://...",
  "websiteUrl": "https://...",
  "twitterUrl": "https://...",
  "telegramUrl": "https://...",
  "discordUrl": "https://...",
  "description": "The best memecoin ever",
  "creator": "0x...",
  "pairAddress": "0x...",
  "initialLiquidity": "100000000000000000000"
}
```

#### Get All Tokens
```http
GET /api/tokens?filter=trending&page=1&limit=20
```

Query parameters:
- `filter`: `trending`, `new`, `volume`
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

#### Get Token Details
```http
GET /api/tokens/:contractAddress
```

#### Update Token Metadata
```http
PUT /api/tokens/:contractAddress
Content-Type: application/json

{
  "logoUrl": "https://...",
  "description": "Updated description",
  "volume24h": "1000000000000000000",
  "priceInFEV": "100000000000000000",
  "marketCap": "10000000000000000000000",
  "holders": 150
}
```

#### Search Tokens
```http
GET /api/tokens/search?q=pepe&page=1&limit=20
```

---

### 💸 Transactions

#### Record Transaction
```http
POST /api/transactions
Content-Type: application/json

{
  "userAddress": "0x...",
  "type": "swap",
  "tokenIn": "0x...",
  "tokenOut": "0x...",
  "amountIn": "1000000000000000000",
  "amountOut": "2000000000000000000",
  "transactionHash": "0x...",
  "blockNumber": 123456
}
```

#### Get User Transactions
```http
GET /api/transactions/:walletAddress?page=1&limit=20
```

#### Get Recent Transactions
```http
GET /api/transactions/recent?limit=50
```

---

### 🌉 Bridge

#### Create Bridge Transaction
```http
POST /api/transactions/bridge
Content-Type: application/json

{
  "userAddress": "0x...",
  "fromChain": "sepolia",
  "toChain": "arc",
  "amount": "1000000000000000000",
  "lockTxHash": "0x..."
}
```

#### Get Bridge History
```http
GET /api/transactions/bridge/:walletAddress?page=1&limit=20
```

#### Update Bridge Status
```http
PUT /api/transactions/bridge/:id/status
Content-Type: application/json

{
  "status": "completed",
  "mintTxHash": "0x..."
}
```

Or for failed:
```json
{
  "status": "failed",
  "errorMessage": "Insufficient balance"
}
```

---

### 🏆 Leaderboard

#### Get Leaderboard
```http
GET /api/leaderboard?page=1&limit=100
```

**Response:**
```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": [
    {
      "rank": 1,
      "walletAddress": "0x...",
      "totalPoints": 500,
      "createdAt": "2025-01-19T...",
      "lastActive": "2025-01-19T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1523,
    "pages": 16
  }
}
```

#### Get User Rank
```http
GET /api/leaderboard/rank/:walletAddress
```

**Response:**
```json
{
  "success": true,
  "message": "User rank retrieved successfully",
  "data": {
    "user": {
      "walletAddress": "0x...",
      "totalPoints": 150,
      "rank": 45
    },
    "totalUsers": 1523,
    "percentile": "97.05",
    "nearby": {
      "above": [...],
      "below": [...]
    }
  }
}
```

---

## Task System

### Daily Tasks
Reset automatically at **00:00 UTC** every day.

| Task Type | Description | Points |
|-----------|-------------|--------|
| `swap` | Make a swap | 10 |
| `bridge` | Bridge tokens | 15 |
| `deploy` | Deploy a token | 50 |
| `addLiquidity` | Add liquidity | 20 |
| `trade3Different` | Trade 3 different tokens | 25 |

### Social Tasks
One-time tasks, never reset.

| Task Type | Description | Points |
|-----------|-------------|--------|
| `followTwitter` | Follow on Twitter | 50 |
| `joinTelegram` | Join Telegram | 50 |
| `joinDiscord` | Join Discord | 50 |

---

## Database Models

### User
```javascript
{
  walletAddress: String (unique, indexed),
  totalPoints: Number,
  createdAt: Date,
  lastActive: Date
}
```

### Task
```javascript
{
  userId: ObjectId (ref: User),
  walletAddress: String (indexed),
  taskType: String (enum),
  completed: Boolean,
  completedAt: Date,
  pointsAwarded: Number,
  transactionHash: String,
  isDaily: Boolean,
  metadata: Mixed
}
```

### Token
```javascript
{
  contractAddress: String (unique, indexed),
  name: String,
  symbol: String,
  totalSupply: String,
  decimals: Number,
  logoUrl: String,
  websiteUrl: String,
  twitterUrl: String,
  telegramUrl: String,
  discordUrl: String,
  description: String,
  creator: String (indexed),
  pairAddress: String,
  initialLiquidity: String,
  createdAt: Date,
  volume24h: String,
  priceInFEV: String,
  marketCap: String,
  holders: Number,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  userAddress: String (indexed),
  type: String (enum: swap, addLiquidity, removeLiquidity),
  tokenIn: String,
  tokenOut: String,
  amountIn: String,
  amountOut: String,
  transactionHash: String (unique),
  blockNumber: Number,
  timestamp: Date (indexed)
}
```

### BridgeTransaction
```javascript
{
  userAddress: String (indexed),
  fromChain: String (enum: sepolia, arc),
  toChain: String (enum: sepolia, arc),
  amount: String,
  status: String (enum: pending, completed, failed),
  lockTxHash: String,
  mintTxHash: String,
  createdAt: Date,
  completedAt: Date,
  errorMessage: String
}
```

---

## Automated Services

### Task Reset Service
- Runs automatically at **00:00 UTC** every day
- Resets all daily tasks for all users
- Social tasks are never reset
- Logs all reset operations

---

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Testing the API

### Using cURL

```bash
# Register user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}'

# Get user tasks
curl http://localhost:5000/api/tasks/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Complete a task
curl -X POST http://localhost:5000/api/tasks/complete \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "taskType": "swap",
    "transactionHash": "0x123..."
  }'

# Get leaderboard
curl http://localhost:5000/api/leaderboard?limit=10
```

### Using Postman or Thunder Client

Import the following collection or manually create requests using the endpoints above.

---

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

---

## Project Structure

```
backend/
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Task.js
│   ├── Token.js
│   ├── Transaction.js
│   └── BridgeTransaction.js
├── controllers/         # Request handlers
│   ├── userController.js
│   ├── taskController.js
│   ├── tokenController.js
│   ├── transactionController.js
│   └── leaderboardController.js
├── routes/             # API routes
│   ├── users.js
│   ├── tasks.js
│   ├── tokens.js
│   ├── transactions.js
│   └── leaderboard.js
├── middleware/         # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── utils/              # Helper functions
│   ├── db.js
│   └── helpers.js
├── config/             # Configuration files
│   └── taskConfig.js
├── services/           # Background services
│   └── taskResetService.js
├── server.js           # Main entry point
├── package.json
├── .env.example
└── README.md
```

---

## Security Features

- ✅ Wallet signature verification
- ✅ Input validation & sanitization
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Error handling
- ✅ MongoDB injection prevention (Mongoose)

---

## Future Enhancements

- [ ] JWT token-based authentication
- [ ] Social task verification (Twitter, Telegram, Discord APIs)
- [ ] WebSocket for real-time updates
- [ ] Admin dashboard
- [ ] Analytics endpoints
- [ ] Caching layer (Redis)
- [ ] API documentation with Swagger

---

## License

MIT

---

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Built with ❤️ for FEVA Protocol**
