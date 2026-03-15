const mongoose = require('mongoose');

const nftSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    contractAddress: { type: String, required: true, trim: true },
    ownerAddress: { type: String, required: true, lowercase: true, trim: true },
    network: { type: String, default: 'Sepolia' },
    maxSupply: { type: Number, required: true },
    mintPrice: { type: String, default: '0' },
    baseURI: { type: String, default: '' },
    type: { type: String, default: 'ERC-721' },
    createdAt: { type: Date, default: Date.now }
});

// Performance indexes
nftSchema.index({ ownerAddress: 1, createdAt: -1 });
nftSchema.index({ contractAddress: 1 }, { unique: true });

module.exports = mongoose.model('NFT', nftSchema);
