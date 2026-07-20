const express = require('express');
const { streamChat, getChatHistory, getChat, deleteChat, executePendingAction, rejectPendingAction } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect); // All chat routes require auth

router.post('/stream', chatLimiter, streamChat);
router.get('/history', getChatHistory);
router.get('/:id', getChat);
router.post('/action/execute', executePendingAction);
router.post('/action/reject', rejectPendingAction);
router.delete('/:id', deleteChat);

module.exports = router;
