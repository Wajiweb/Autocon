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

    // ─── SaaS Foundation Fields ───────────────────────────────────────────────

    // Role-based access control
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Usage counters for billing/analytics (atomic increments only)
    usage: {
      deployments: { type: Number, default: 0, min: 0 },
      audits:      { type: Number, default: 0, min: 0 },
    },

    // API key for future machine-to-machine access (null by default)
    apiKey: {
      type:    String,
      default: null,
      sparse:  true,   // Allow many null values but enforce uniqueness when set
      unique:  true,
      index:   true,
    },
  },
  { timestamps: true }
);

// ─── Instance Methods ─────────────────────────────────────────────────────────

// Regenerate nonce after each login (prevents replay attacks)
userSchema.methods.regenerateNonce = function () {
    this.nonce = crypto.randomBytes(32).toString('hex');
    return this.save();
};

// Check if user has a specific role
userSchema.methods.hasRole = function (role) {
    return this.role === role;
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 }); // Admin user lookups

module.exports = mongoose.model('User', userSchema);
