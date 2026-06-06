const express = require('express');
const { streamChat, getChatHistory, getChat, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect); // All chat routes require auth

router.get('/stream', chatLimiter, streamChat);
router.get('/history', getChatHistory);
router.get('/:id', getChat);
router.delete('/:id', deleteChat);

module.exports = router;
