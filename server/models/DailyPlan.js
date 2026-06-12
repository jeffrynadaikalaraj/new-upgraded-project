const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
  startTime: {
    type: String, // "HH:MM" format
    required: true,
  },
  endTime: {
    type: String, // "HH:MM" format
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['habit', 'goal_work', 'break', 'free', 'custom'],
    required: true,
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: '',
  },
  aiNotes: {
    type: String,
    default: '',
  },
});

const DailyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD" format for easy querying
      required: true,
    },
    blocks: {
      type: [BlockSchema],
      default: [],
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    aiSummary: {
      type: String,
      default: '',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast per-user date lookup
DailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyPlan', DailyPlanSchema);
