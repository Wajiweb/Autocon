const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    nonce: {
      type: String,
      required: true,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
  },
  { timestamps: true } // provides createdAt + updatedAt automatically
);

// Helper to regenerate nonce after each login (prevents replay attacks)
userSchema.methods.regenerateNonce = function () {
    this.nonce = crypto.randomBytes(32).toString('hex');
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
