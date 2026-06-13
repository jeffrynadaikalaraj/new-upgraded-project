const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
    required: true, // 1 (Terrible) to 5 (Excellent)
  },
  note: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mood', MoodSchema);
