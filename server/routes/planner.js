const express = require('express');
const {
  generatePlan,
  getTodayPlan,
  getPlanByDate,
  updateBlock,
} = require('../controllers/plannerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/generate', generatePlan);
router.get('/today', getTodayPlan);
router.get('/:date', getPlanByDate);
router.put('/:date/blocks/:blockId', updateBlock);

module.exports = router;
