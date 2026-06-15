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
  // In production, allow requests from configured frontend origins
  origin: config.NODE_ENV === 'production' && config.CLIENT_URL ? config.CLIENT_URL.split(',') : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Removed global apiLimiter here, applied individually below

// Mount routers with targeted rate limits
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/goals', apiLimiter, goalRoutes);
app.use('/api/habits', apiLimiter, habitRoutes);
app.use('/api/memories', apiLimiter, memoryRoutes);
app.use('/api/planner', apiLimiter, require('./routes/planner'));
app.use('/api/dashboard', apiLimiter, require('./routes/dashboard'));
app.use('/api/analytics', apiLimiter, require('./routes/analytics'));
app.use('/api/reports', apiLimiter, require('./routes/reports'));
app.use('/api/users', apiLimiter, require('./routes/users'));
app.use('/api/documents', uploadLimiter, require('./routes/documents'));
app.use('/api/study', apiLimiter, require('./routes/studyRoutes'));
app.use('/api/calendar', apiLimiter, require('./routes/calendar'));

// Basic health route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AI LifeOS API is running', env: config.NODE_ENV });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
