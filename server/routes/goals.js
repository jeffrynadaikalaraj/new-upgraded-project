const express = require('express');
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  updateMilestone,
  generateAiSuggestions
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .get(getGoal)
  .put(updateGoal)
  .delete(deleteGoal);

router.route('/:id/milestones')
  .post(addMilestone);

router.route('/:id/milestones/:milestoneId')
  .put(updateMilestone);

router.route('/:id/ai-suggest')
  .post(generateAiSuggestions);

module.exports = router;
