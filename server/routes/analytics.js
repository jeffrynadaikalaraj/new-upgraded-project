const express = require('express');
const {
  getOverview,
  getWeekly,
  getMonthly,
  getHabits,
  getGoals
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/weekly', getWeekly);
router.get('/monthly', getMonthly);
router.get('/habits', getHabits);
router.get('/goals', getGoals);

module.exports = router;
