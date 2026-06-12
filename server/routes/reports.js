const express = require('express');
const {
  getAllReports,
  getLatestReport,
  getReportById,
  generateReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getAllReports);
router.get('/latest', getLatestReport);
router.get('/:id', getReportById);
router.post('/generate', generateReport);

module.exports = router;
