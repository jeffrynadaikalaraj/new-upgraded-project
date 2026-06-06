const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/env');

// Route files
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: '*', // For MVP, allow all. Restrict in prod to frontend domain
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiter to all routes
app.use('/api', apiLimiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Basic health route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AI LifeOS API is running', env: config.NODE_ENV });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
