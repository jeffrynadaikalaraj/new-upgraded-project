const express = require('express');
const {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
  getHabitStats,
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .get(getHabit)
  .put(updateHabit)
  .delete(deleteHabit);

router.route('/:id/complete')
  .post(completeHabit);

router.route('/:id/uncomplete')
  .post(uncompleteHabit);

router.route('/:id/stats')
  .get(getHabitStats);

module.exports = router;
