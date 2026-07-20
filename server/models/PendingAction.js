const mongoose = require('mongoose');

const pendingActionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    payload: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'executed', 'rejected', 'failed', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    result: {
      type: Object, // To store the output if executed, or error if failed
    }
  },
  { timestamps: true }
);

// Optional: Automatically expire documents via TTL index
// pendingActionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PendingAction', pendingActionSchema);
