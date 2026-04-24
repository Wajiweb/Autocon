const mongoose = require('mongoose');

/**
 * Unified Contract model for AutoCon.
 *
 * Replaces the fragmented Token, NFT, and Auction collections.
 * A single `contractType` field discriminates between contract kinds.
 * Type-specific data lives in the flexible `metadata` object, keeping
 * the core schema lean while remaining fully queryable.
 *
 * Relationships:
 *   Contract.userId  → User._id
 *   AuditReport.contractId → Contract._id
 */
const contractSchema = new mongoose.Schema(
  {
    // ─── Ownership ─────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalized wallet string for fast on-chain correlation (no join needed)
    ownerAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ─── Contract Identity ──────────────────────────────────────────────────
    contractType: {
      type: String,
      enum: ['ERC20', 'ERC721', 'AUCTION'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional — relevant for ERC20 / ERC721
    symbol: {
      type: String,
      uppercase: true,
      trim: true,
    },
    contractAddress: {
      type: String,
      required: true,
      trim: true,
    },
    network: {
      type: String,
      default: 'Sepolia',
      enum: ['Sepolia', 'Mainnet', 'Amoy', 'BNBTestnet'],
    },

    // ─── On-Chain Deployment Data ───────────────────────────────────────────
    abi: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    txHash: {
      type: String,
      trim: true,
      default: null,
    },
    gasUsed: {
      type: Number,
      default: null,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    sourceCode: {
      type: String,
      default: null,
    },
    compilerVersion: {
      type: String,
      default: null,
    },
    optimizationUsed: {
      type: Number,
      default: 1,
    },
    runs: {
      type: Number,
      default: 200,
    },
    constructorArgs: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    // ─── Verification Status ────────────────────────────────────────────────
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },

    // ─── Type-Specific Metadata ─────────────────────────────────────────────
    // ERC20:   { supply: Number }
    // ERC721:  { maxSupply: Number, mintPrice: String, baseURI: String }
    // AUCTION: { itemName: String, itemDescription: String, duration: Number, minimumBid: String }
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Primary dashboard query: all contracts for a user, newest first
contractSchema.index({ userId: 1, createdAt: -1 });

// Wallet-address lookup (on-chain correlation, backward compat)
contractSchema.index({ ownerAddress: 1, createdAt: -1 });

// Unique contract per network (prevents duplicate saves across chains)
contractSchema.index({ contractAddress: 1, network: 1 }, { unique: true });

// Filter by contract type within a user's portfolio
contractSchema.index({ userId: 1, contractType: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

// Access all audit reports for this contract without extra queries
contractSchema.virtual('auditReports', {
  ref: 'AuditReport',
  localField: '_id',
  foreignField: 'contractId',
});

contractSchema.set('toJSON', { virtuals: true });
contractSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contract', contractSchema);
