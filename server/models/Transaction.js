'use strict';

/**
 * Transaction.js — Transaction lifecycle tracking model
 *
 * Tracks every on-chain transaction submitted through AutoCon.
 * Lifecycle: pending → success | failed
 *
 * This is intentionally lightweight — the Contract model stores
 * the full deployment record. This model tracks raw tx status.
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        // ─── Ownership ────────────────────────────────────────────────────────
        ownerAddress: {
            type:      String,
            required:  true,
            lowercase: true,
            trim:      true,
            index:     true,
        },

        // ─── Transaction Data ─────────────────────────────────────────────────
        txHash: {
            type:     String,
            required: true,
            trim:     true,
            unique:   true,
            index:    true,
        },
        network: {
            type:    String,
            default: 'Sepolia',
        },
        contractType: {
            type: String,
            enum: ['ERC20', 'ERC721', 'AUCTION', 'UNKNOWN'],
            default: 'UNKNOWN',
        },
        contractName: {
            type:    String,
            default: null,
        },

        // ─── Lifecycle Status ─────────────────────────────────────────────────
        status: {
            type:    String,
            enum:    ['pending', 'success', 'failed'],
            default: 'pending',
            index:   true,
        },

        // ─── Result Data ──────────────────────────────────────────────────────
        contractAddress: {
            type:    String,
            default: null,
        },
        blockNumber: {
            type:    Number,
            default: null,
        },
        gasUsed: {
            type:    Number,
            default: null,
        },

        // Human-readable failure reason
        error: {
            type:    String,
            default: null,
        },

        // When the status last changed
        resolvedAt: {
            type:    Date,
            default: null,
        },
    },
    { timestamps: true }
);

// ─── Compound Indexes ─────────────────────────────────────────────────────────
transactionSchema.index({ ownerAddress: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

// ─── Static Helpers ───────────────────────────────────────────────────────────

transactionSchema.statics.markSuccess = function (txHash, data = {}) {
    return this.findOneAndUpdate(
        { txHash },
        {
            status:          'success',
            resolvedAt:      new Date(),
            contractAddress: data.contractAddress || null,
            blockNumber:     data.blockNumber     || null,
            gasUsed:         data.gasUsed         || null,
            error:           null,
        },
        { new: true, upsert: false }
    );
};

transactionSchema.statics.markFailed = function (txHash, errorMessage) {
    return this.findOneAndUpdate(
        { txHash },
        { status: 'failed', resolvedAt: new Date(), error: errorMessage },
        { new: true, upsert: false }
    );
};

module.exports = mongoose.model('Transaction', transactionSchema);
