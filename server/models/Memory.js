const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['fact', 'preference', 'event', 'insight', 'profile', 'summary'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  key: {
    type: String,
  },
  value: {
    type: String,
  },
  category: {
    type: String,
    enum: ['personal', 'education', 'career', 'health', 'tech', 'lifestyle', 'social', 'general'],
    default: 'general',
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  source: {
    type: String,
    enum: ['chat', 'goal', 'habit', 'manual'],
    required: true,
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  importance: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
    default: 5,
  },
  tags: [{
    type: String,
  }],
  expiresAt: {
    type: Date,
  }
}, {
  timestamps: true
});

// Indexes
MemorySchema.index({ userId: 1 });
MemorySchema.index({ importance: -1 });
MemorySchema.index({ createdAt: -1 });
MemorySchema.index({ userId: 1, key: 1 });
MemorySchema.index({ userId: 1, category: 1 });
MemorySchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Memory', MemorySchema);
