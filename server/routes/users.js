const express = require('express');
const {
  getProfile,
  updateProfile,
  exportData,
  deleteAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.post('/me/export', exportData);
router.delete('/me', deleteAccount);

module.exports = router;
