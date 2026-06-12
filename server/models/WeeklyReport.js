const mongoose = require('mongoose');

const WeeklyReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    weekStartDate: {
      type: Date,
      required: true
    },
    weekEndDate: {
      type: Date,
      required: true
    },
    summary: {
      type: String,
      default: ''
    },
    highlights: {
      type: [String],
      default: []
    },
    improvements: {
      type: [String],
      default: []
    },
    recommendations: {
      type: [String],
      default: []
    },
    productivityScore: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

WeeklyReportSchema.index({ userId: 1, weekStartDate: -1 });

module.exports = mongoose.model('WeeklyReport', WeeklyReportSchema);
