const mongoose = require('mongoose');

/**
 * Activity model for AutoCon — optional analytics / timeline layer.
 *
 * Records every significant user action (generate, deploy, audit, verify, delete).
 * Powers the dashboard "Recent Activity" feed and provides audit trail
 * data for FYP evaluation.
 *
 * This is a write-once log — records are never mutated after creation.
 */
const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerAddress: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    action: {
      type: String,
      enum: ['GENERATE', 'DEPLOY', 'AUDIT', 'VERIFY', 'DELETE'],
      required: true,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null,
    },
    // Flexible extra data per action:
    // GENERATE: { contractType, name }
    // DEPLOY:   { contractType, contractAddress, txHash, network }
    // AUDIT:    { score, riskLevel }
    // VERIFY:   { contractAddress, network }
    // DELETE:   { contractType, contractAddress }
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Dashboard timeline: user's recent activity, newest first
activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
