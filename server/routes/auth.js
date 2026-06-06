const express = require('express');
const { register, login, refresh, getMe, updateConsent } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
router.get('/me', protect, getMe);
router.put('/consent', protect, updateConsent);

module.exports = router;
