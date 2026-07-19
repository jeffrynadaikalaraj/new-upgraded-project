const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter, authLimiter, chatLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/env');
const setupSwagger = require('./swagger');

// Route files
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const goalRoutes = require('./routes/goals');
const habitRoutes = require('./routes/habits');
const memoryRoutes = require('./routes/memories');

const app = express();

// Initialize Swagger Docs
setupSwagger(app);

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: false, // Capacitor needs flexible CSP
}));

// CORS: Allow web origins and Capacitor native origins
const allowedOrigins = [
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'http://localhost:3000',
];
if (config.CLIENT_URL) {
  allowedOrigins.push(...config.CLIENT_URL.split(','));
}

app.use(cors({
  origin: config.NODE_ENV === 'production' 
    ? allowedOrigins 
    : true, // Allow all in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
app.use('/api/documents', apiLimiter, require('./routes/documents'));
app.use('/api/study', apiLimiter, require('./routes/studyRoutes'));
app.use('/api/calendar', apiLimiter, require('./routes/calendar'));
app.use('/api/tts', apiLimiter, require('./routes/tts'));

// Basic health route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AI LifeOS API is running', env: config.NODE_ENV });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
