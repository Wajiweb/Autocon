const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete when expiresAt is reached
    },
  },
  { timestamps: true }
);

// Index for efficient lookups during auth middleware
tokenBlacklistSchema.index({ token: 1, walletAddress: 1 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
