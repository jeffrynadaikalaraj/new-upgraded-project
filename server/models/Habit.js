const mongoose = require('mongoose');

const CompletionLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  note: {
    type: String,
    default: '',
  },
}, { _id: false });

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily',
  },
  // For custom frequency: 0=Sunday, 1=Monday, ..., 6=Saturday
  customDays: {
    type: [Number],
    default: [],
    validate: {
      validator: (days) => days.every((d) => d >= 0 && d <= 6),
      message: 'customDays must contain values between 0 (Sun) and 6 (Sat)',
    },
  },
  category: {
    type: String,
    enum: ['health', 'productivity', 'mindfulness', 'fitness', 'learning', 'other'],
    default: 'other',
  },
  icon: {
    type: String,
    default: '✅',
  },
  color: {
    type: String,
    default: '#6366f1', // indigo-500
  },
  streak: {
    current: { type: Number, default: 0, min: 0 },
    longest: { type: Number, default: 0, min: 0 },
    lastCompletedAt: { type: Date, default: null },
  },
  // One entry per day (no duplicates enforced in controller)
  completionLog: {
    type: [CompletionLogSchema],
    default: [],
  },
  remindAt: {
    type: String, // "HH:MM" format, e.g. "07:30"
    default: null,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound index to speed up per-user queries
HabitSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });

module.exports = mongoose.model('Habit', HabitSchema);
