const cron = require('node-cron');
const User = require('../models/User');
const { generateWeeklyReportForUser } = require('../services/reportService');

/**
 * Initialize all cron jobs.
 * Call this once in server.js after DB connects.
 */
const initCronJobs = () => {
  // Every Sunday at midnight (00:00)
  cron.schedule('0 0 * * 0', async () => {
    console.log('[CronJob] Running weekly report generation...');
    try {
      const users = await User.find({}, '_id').lean();
      console.log(`[CronJob] Generating reports for ${users.length} users...`);

      for (const user of users) {
        try {
          await generateWeeklyReportForUser(user._id);
          console.log(`[CronJob] Report generated for user ${user._id}`);
        } catch (userErr) {
          // One failure must NOT stop others
          console.error(`[CronJob] Failed for user ${user._id}:`, userErr.message);
        }
      }

      console.log('[CronJob] Weekly report generation complete.');
    } catch (err) {
      console.error('[CronJob] Fatal error during weekly report job:', err.message);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('[CronJob] Weekly report cron scheduled (Every Sunday 00:00 UTC).');
};

module.exports = { initCronJobs };
