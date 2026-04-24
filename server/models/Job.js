'use strict';

/**
 * Job.js — MongoDB model for persisting BullMQ job lifecycle.
 *
 * Every job enqueued in verificationQueue or auditQueue gets a corresponding
 * document here so that:
 *  - The API can immediately return a jobId to the frontend
 *  - The frontend can poll GET /api/jobs/:jobId for status
 *  - Admins can audit past job executions in MongoDB
 *
 * States: pending → processing → completed | failed
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        // ─── Identity ─────────────────────────────────────────────────────────
        jobId: {
            type:     String,
            required: true,
            unique:   true,
            index:    true,
        },
        type: {
            type:     String,
            required: true,
            enum:     ['verification', 'audit'],
        },

        // ─── Ownership ────────────────────────────────────────────────────────
        ownerAddress: {
            type:      String,
            lowercase: true,
            trim:      true,
            required:  true,
            index:     true,
        },

        // ─── Lifecycle ────────────────────────────────────────────────────────
        status: {
            type:    String,
            enum:    ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
            index:   true,
        },

        // Attempt tracking
        attempts:    { type: Number, default: 0 },
        maxAttempts: { type: Number, default: 3 },

        // Timestamps for the lifecycle transitions
        startedAt:   { type: Date, default: null },
        completedAt: { type: Date, default: null },

        // ─── Payload & Result ─────────────────────────────────────────────────
        // The input data the worker processed. Stored for auditability.
        payload: {
            type:    mongoose.Schema.Types.Mixed,
            default: null,
        },

        // The structured result returned by the worker on success.
        result: {
            type:    mongoose.Schema.Types.Mixed,
            default: null,
        },

        // Human-readable error message on failure.
        error: {
            type:    String,
            default: null,
        },
    },
    { timestamps: true } // Adds createdAt, updatedAt automatically
);

// ─── Compound Indexes ─────────────────────────────────────────────────────────

// Poll by owner — "show me all my jobs"
jobSchema.index({ ownerAddress: 1, createdAt: -1 });

// Filter by type + status (e.g. "all pending audits")
jobSchema.index({ type: 1, status: 1 });

// ─── Static Helpers ───────────────────────────────────────────────────────────

/**
 * Transition a job to 'processing'. Called by worker at job start.
 */
jobSchema.statics.markProcessing = async function (jobId) {
    return this.findOneAndUpdate(
        { jobId },
        { status: 'processing', startedAt: new Date(), $inc: { attempts: 1 } },
        { new: true }
    );
};

/**
 * Transition a job to 'completed' and store the result. Called by worker on success.
 */
jobSchema.statics.markCompleted = async function (jobId, result) {
    return this.findOneAndUpdate(
        { jobId },
        { status: 'completed', result, completedAt: new Date(), error: null },
        { new: true }
    );
};

/**
 * Transition a job to 'failed' and store the error message. Called by worker on failure.
 */
jobSchema.statics.markFailed = async function (jobId, errorMessage) {
    return this.findOneAndUpdate(
        { jobId },
        { status: 'failed', error: errorMessage, completedAt: new Date() },
        { new: true }
    );
};

module.exports = mongoose.model('Job', jobSchema);
