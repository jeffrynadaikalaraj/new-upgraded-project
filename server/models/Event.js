const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  isAllDay: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['task', 'meeting', 'focus', 'reminder'],
    default: 'task',
  }
}, {
  timestamps: true
});

// Avoid overlapping validation for MVP, just store it.

module.exports = mongoose.model('Event', EventSchema);
