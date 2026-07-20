const express = require('express');
const { getMetrics } = require('../controllers/observabilityController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

router.get('/metrics', getMetrics);

module.exports = router;
