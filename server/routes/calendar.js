const express = require('express');
const { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  generateDaily,
  generateWeekly,
  checkConflict,
  syncPlanner,
  getAnalytics
} = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.post('/generate', generateDaily);
router.post('/generate-week', generateWeekly);
router.post('/check-conflict', checkConflict);
router.post('/sync-planner', syncPlanner);
router.get('/analytics', getAnalytics);

router.route('/:id')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;
