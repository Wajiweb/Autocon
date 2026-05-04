const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    itemName: { type: String, required: true, trim: true },
    itemDescription: { type: String, default: '', trim: true },
    contractAddress: { type: String, required: true, trim: true },
    ownerAddress: { type: String, required: true, lowercase: true, trim: true },
    network: { type: String, default: 'Sepolia' },
    duration: { type: Number, required: true },
    minimumBid: { type: String, default: '0' },
    type: { type: String, default: 'Auction' },
    sourceCode: { type: String, default: '' },
    compilerVersion: { type: String, default: 'v0.8.20+commit.a1b79de6' },
    constructorArgs: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

// Performance indexes
auctionSchema.index({ ownerAddress: 1, createdAt: -1 });
auctionSchema.index({ contractAddress: 1 }, { unique: true });

module.exports = mongoose.model('Auction', auctionSchema);
