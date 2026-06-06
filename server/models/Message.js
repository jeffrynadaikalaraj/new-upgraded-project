const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    default: 'system', // e.g., 'gemini-2.5-flash'
  },
  latencyMs: {
    type: Number,
  },
  emotion: {
    type: String,
    enum: ['idle', 'thinking', 'speaking', 'listening', 'happy', 'concerned', 'encouraging', 'calm'],
    default: 'idle',
  },
  sourceDocs: [{
    docId: mongoose.Schema.Types.ObjectId,
    snippet: String,
  }],
  actions: [{
    type: { type: String }, // e.g., 'goal_created'
    payload: Object,
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Message', MessageSchema);
