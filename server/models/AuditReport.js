const mongoose = require('mongoose');

/**
 * AuditReport model for AutoCon.
 *
 * Persists the result of every static security analysis run.
 * Previously audit results were computed and immediately discarded —
 * this model fixes that gap.
 *
 * Relationships:
 *   AuditReport.contractId → Contract._id
 */

// Subdocument schema for individual findings.
// _id: false because findings are identified by ruleId, not a Mongo ID.
const findingSchema = new mongoose.Schema(
  {
    ruleId: { type: String, required: true },
    title: String,
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    },
    description: String,
    advice: String,
    line: Number,
    code: String,
    additionalLines: [Number], // other line numbers where same rule triggered
  },
  { _id: false }
);

const auditReportSchema = new mongoose.Schema(
  {
    // ─── Ownership ──────────────────────────────────────────────────────────
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    // Denormalized for display without a contract join
    contractAddress: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    ownerAddress: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },

    // ─── Audit Results ───────────────────────────────────────────────────────
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    totalFindings: {
      type: Number,
      default: 0,
    },
    findings: [findingSchema],
    summary: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
    },

    // Engine version for reproducibility and future comparisons
    engineVersion: {
      type: String,
      default: 'v1',
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Fetch audit history for a specific contract, most recent first
auditReportSchema.index({ contractId: 1, createdAt: -1 });

// Fetch all audits for a wallet owner (dashboard "audit history" view)
auditReportSchema.index({ ownerAddress: 1, createdAt: -1 });

module.exports = mongoose.model('AuditReport', auditReportSchema);
