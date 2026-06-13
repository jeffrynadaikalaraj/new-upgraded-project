const express = require('express');
const { getEvents, createEvent, deleteEvent } = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:id')
  .delete(deleteEvent);

module.exports = router;
