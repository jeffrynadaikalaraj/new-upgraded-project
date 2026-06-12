const express = require('express');
const { getMemories, deleteMemory, clearMemories } = require('../controllers/memoryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getMemories)
  .delete(clearMemories);

router.route('/:id')
  .delete(deleteMemory);

module.exports = router;
