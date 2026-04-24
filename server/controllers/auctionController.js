'use strict';
const mongoose = require('mongoose');
const Auction  = require('../models/Auction');
const { compileContract, sanitize, toClassName, readTemplate } = require('../services/compilerService');
const { isValidAddress } = require('../services/blockchainService');
const { incrementDeployments } = require('../services/usageService');

/** POST /api/auction/generate */
async function generateAuction(req, res) {
    const { name, itemName, itemDescription, duration, minimumBid, ownerAddress } = req.body;

    const safeName     = sanitize(name || '');
    const safeItemName = (itemName || '').replace(/"/g, '\\"').trim();
    const safeItemDesc = (itemDescription || '').replace(/"/g, '\\"').trim();
    const safeDuration = String(parseInt(duration) || 3600);
    const safeMinBid   = String(parseFloat(minimumBid) || 0);

    if (!safeName || !ownerAddress) {
        return res.status(400).json({ success: false, error: 'name and ownerAddress are required.' });
    }

    try {
        const className  = toClassName(safeName, 'AuctionContract');
        let contractCode = readTemplate('EnglishAuctionTemplate.txt');
        const finalCode  = contractCode.replace(/{{CONTRACT_NAME}}/g, className);

        const { abi, bytecode } = compileContract(finalCode, 'Auction.sol', className);

        res.json({ success: true, contractCode: finalCode, abi, bytecode, contractName: className });
    } catch (error) {
        console.error('[AuctionController] generateAuction:', error.message);
        res.status(500).json({ success: false, error: error.message || 'Auction generation failed' });
    }
}

/** POST /api/auction/save */
async function saveAuction(req, res) {
    try {
        const { name, itemName, itemDescription, contractAddress, ownerAddress, network, duration, minimumBid } = req.body;

        if (!name || !contractAddress || !ownerAddress) {
            return res.status(400).json({ success: false, error: 'name, contractAddress, and ownerAddress are required.' });
        }
        if (!isValidAddress(contractAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid contract address format.' });
        }
        if (!isValidAddress(ownerAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid owner address format.' });
        }
        if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only save your own auctions.' });
        }

        const newAuction = new Auction({
            name, itemName, itemDescription, contractAddress,
            ownerAddress: ownerAddress.toLowerCase(),
            network: network || 'Sepolia',
            duration, minimumBid,
        });
        await newAuction.save();

        // Track deployment usage (atomic, non-fatal)
        incrementDeployments(req.user.userId);

        res.status(201).json({ success: true, message: 'Auction saved successfully!' });
    } catch (error) {
        console.error('[AuctionController] saveAuction:', error.message);
        res.status(500).json({ success: false, error: 'Failed to save auction' });
    }
}

/** GET /api/auction/my-auctions/:walletAddress */
async function getMyAuctions(req, res) {
    try {
        const { walletAddress } = req.params;

        if (req.user.walletAddress !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'Access denied.' });
        }

        const auctions = await Auction.find({ ownerAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 });
        res.json({ success: true, auctions });
    } catch (error) {
        console.error('[AuctionController] getMyAuctions:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch auctions' });
    }
}

/** DELETE /api/auction/delete/:id */
async function deleteAuction(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format.' });
        }

        const auction = await Auction.findById(id);
        if (!auction) return res.status(404).json({ success: false, error: 'Not found.' });
        if (req.user.walletAddress !== auction.ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'Access denied.' });
        }

        await Auction.findByIdAndDelete(id);
        res.json({ success: true, message: 'Auction removed.' });
    } catch (error) {
        console.error('[AuctionController] deleteAuction:', error.message);
        res.status(500).json({ success: false, error: 'Failed to delete auction.' });
    }
}

module.exports = { generateAuction, saveAuction, getMyAuctions, deleteAuction };
