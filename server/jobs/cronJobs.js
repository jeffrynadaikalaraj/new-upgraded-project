const cron = require('node-cron');
const User = require('../models/User');
const { generateWeeklyReportForUser } = require('../services/reportService');
const { generateDailyReview } = require('../services/dailyReviewService');

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

  // Every day at 23:30 (11:30 PM) for daily review
  cron.schedule('30 23 * * *', async () => {
    console.log('[CronJob] Running daily review generation...');
    try {
      const users = await User.find({}, '_id').lean();
      for (const user of users) {
        try {
          await generateDailyReview(user._id);
        } catch (err) {
          console.error(`[CronJob] Failed daily review for user ${user._id}:`, err.message);
        }
      }
      console.log('[CronJob] Daily review generation complete.');
    } catch (err) {
      console.error('[CronJob] Fatal error during daily review job:', err.message);
    }
  }, {
    timezone: 'UTC'
  });
  console.log('[CronJob] Daily review cron scheduled (Every day 23:30 UTC).');
};

module.exports = { initCronJobs };
