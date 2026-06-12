const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter, authLimiter, chatLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/env');

// Route files
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const goalRoutes = require('./routes/goals');
const habitRoutes = require('./routes/habits');
const memoryRoutes = require('./routes/memories');

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({
  // In production, only allow requests from the deployed frontend
  origin: config.NODE_ENV === 'production' ? config.CLIENT_URL : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiter to all routes
app.use('/api', apiLimiter);

// Mount routers with targeted rate limits
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/planner', require('./routes/planner'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));
app.use('/api/documents', uploadLimiter, require('./routes/documents'));

// Basic health route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AI LifeOS API is running', env: config.NODE_ENV });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
