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
  },
  category: {
    type: String,
    enum: ['Study', 'Fitness', 'Work', 'Personal', 'Meeting', 'Other'],
    default: 'Other',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    default: null
  },
  focusTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  recurrenceRule: {
    type: String, // e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  }
}, {
  timestamps: true
});

// Advanced recurring event validation and overlap detection moved to services.

module.exports = mongoose.model('Event', EventSchema);
