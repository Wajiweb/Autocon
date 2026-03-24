const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    contractAddress: { type: String, required: true, trim: true },
    ownerAddress: { type: String, required: true, lowercase: true, trim: true },
    network: { type: String, default: 'Sepolia' },
    abi: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now }
});

// Performance indexes
tokenSchema.index({ ownerAddress: 1, createdAt: -1 });
tokenSchema.index({ contractAddress: 1 }, { unique: true });

module.exports = mongoose.model('Token', tokenSchema);