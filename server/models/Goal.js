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

const ActivityLogSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  metric: {
    type: String, // e.g. "runs", "km", "hours", "reps"
  },
  value: {
    type: Number, // e.g. 50, 5, 2, 20
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
    enum: [
      'sports', 'gym', 'study', 'music', 'technology',
      'finance', 'creative', 'communication', 'mental_health',
      'nutrition', 'career', 'travel', 'home', 'personal_growth',
      'gaming', 'fashion', 'social', 'content_creation',
      'business', 'certifications', 'pets', 'automotive',
      // Legacy categories (backward compatibility)
      'health', 'learning', 'personal', 'other'
    ],
    default: 'other',
  },
  subcategory: {
    type: String,
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
  activityLog: [ActivityLogSchema],
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  aiSuggestions: [{
    type: String,
  }],
  prediction: {
    estimatedCompletion: String,
    successRate: Number,
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    insight: String
  },
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
