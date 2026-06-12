const app = require('./app');
const { connectDB } = require('./config/db');
const config = require('./config/env');
const { initCronJobs } = require('./jobs/cronJobs');

// Connect to database and start cron jobs
connectDB().then(() => {
  initCronJobs();
});

const server = app.listen(config.PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
