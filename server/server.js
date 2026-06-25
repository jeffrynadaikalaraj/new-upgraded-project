const app = require('./app');
const { connectDB } = require('./config/db');
const config = require('./config/env');
const { initCronJobs } = require('./jobs/cronJobs');

// Connect to database and start cron jobs
connectDB().then(() => {
  initCronJobs();

  const server = app.listen(config.PORT, () => {
    console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  });

  // Handle unhandled promise rejections without crashing the server
  process.on('unhandledRejection', (err, promise) => {
    console.error(`[Unhandled Rejection]: ${err.message}`);
    console.error(err);
  });

  // Handle uncaught exceptions without crashing the server
  process.on('uncaughtException', (err) => {
    console.error(`[Uncaught Exception]: ${err.message}`);
    console.error(err);
  });
}).catch(err => {
  console.error(`Failed to connect to DB: ${err.message}`);
  process.exit(1);
});
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI LifeOS Backend Running Successfully'
  });
});