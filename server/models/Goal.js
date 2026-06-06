const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  }
});

const GoalSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['career', 'health', 'finance', 'learning', 'personal', 'other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  targetDate: {
    type: Date,
  },
  milestones: [MilestoneSchema],
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  aiSuggestions: [{
    type: String,
  }],
  tags: [{
    type: String,
  }],
  completedAt: {
    type: Date,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', GoalSchema);
