const mongoose = require('mongoose');

const nonceSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    nonce: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete when expiresAt is reached
    },
    type: {
      type: String,
      enum: ['signup', 'login'],
      default: 'signup',
    },
  },
  { timestamps: true }
);

// Ensure one active nonce per wallet address
nonceSchema.index({ walletAddress: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Nonce', nonceSchema);
