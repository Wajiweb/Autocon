const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    contractAddress: { type: String, required: true },
    ownerAddress: { type: String, required: true },
    network: { type: String, default: 'Sepolia' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', tokenSchema);