const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    extractedText: {
      type: String,
      default: ''
    },
    summary: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

DocumentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Document', DocumentSchema);
