const express = require('express');
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const Auction = require('../models/Auction');
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

function findImports(importPath) {
    try {
        if (importPath.startsWith('@openzeppelin/')) {
            const actualPath = path.resolve(__dirname, '..', 'node_modules', importPath);
            return { contents: fs.readFileSync(actualPath, 'utf8') };
        }
        return { error: 'File not found' };
    } catch (e) {
        return { error: 'File not found: ' + e.message };
    }
}

const sanitize = (str) => str.replace(/[^a-zA-Z0-9\s]/g, '');

/**
 * POST /api/auction/generate
 * Generates and compiles an English Auction contract.
 */
router.post('/generate', strictLimiter, authMiddleware, (req, res) => {
    console.log("--- Compiling Auction Contract ---");
    const { name, itemName, itemDescription, duration, minimumBid, ownerAddress } = req.body;

    const safeName = sanitize(name || '');
    const safeItemName = (itemName || '').replace(/"/g, '\\"').trim();
    const safeItemDesc = (itemDescription || '').replace(/"/g, '\\"').trim();
    const safeDuration = String(parseInt(duration) || 3600);
    const safeMinBid = String(parseFloat(minimumBid) || 0);

    if (!safeName || !ownerAddress) {
        return res.status(400).json({ success: false, error: 'name and ownerAddress are required.' });
    }

    try {
        const templatePath = path.join(__dirname, '..', 'templates', 'EnglishAuctionTemplate.txt');
        let contractCode = fs.readFileSync(templatePath, 'utf8');
        const className = safeName.replace(/\s+/g, '');

        let finalCode = contractCode
            .replace(/{{CONTRACT_NAME}}/g, className);

        const input = {
            language: 'Solidity',
            sources: { 'Auction.sol': { content: finalCode } },
            settings: {
                outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } }
            }
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

        if (output.errors) {
            const errors = output.errors.filter(e => e.severity === 'error');
            if (errors.length > 0) {
                console.error("AUCTION COMPILATION ERRORS:", errors);
                return res.status(500).json({
                    success: false,
                    error: "Solidity Compilation Failed",
                    details: errors.map(e => e.formattedMessage)
                });
            }
        }

        const contractData = output.contracts['Auction.sol'][className];
        if (!contractData) {
            return res.status(500).json({ success: false, error: "Compilation produced no output." });
        }

        console.log(`✅ Auction "${safeName}" compiled successfully!`);

        res.json({
            success: true,
            contractCode: finalCode,
            abi: contractData.abi,
            bytecode: contractData.evm.bytecode.object,
            contractName: className
        });
    } catch (error) {
        console.error("AUCTION SERVER ERROR:", error);
        res.status(500).json({ success: false, error: "Auction generation failed" });
    }
});

/** POST /api/auction/save */
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { name, itemName, itemDescription, contractAddress, ownerAddress, network, duration, minimumBid } = req.body;

        // Validate required fields
        if (!name || !contractAddress || !ownerAddress) {
            return res.status(400).json({ success: false, error: 'name, contractAddress, and ownerAddress are required.' });
        }

        // Validate Ethereum address formats
        if (!ethers.isAddress(contractAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid contract address format.' });
        }
        if (!ethers.isAddress(ownerAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid owner address format.' });
        }

        if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only save your own auctions.' });
        }

        const newAuction = new Auction({
            name, itemName, itemDescription, contractAddress,
            ownerAddress: ownerAddress.toLowerCase(), network: network || 'Sepolia', duration, minimumBid
        });
        await newAuction.save();

        console.log(`💾 Auction "${name}" saved to database!`);
        res.status(201).json({ success: true, message: 'Auction saved successfully!' });
    } catch (error) {
        console.error("Auction DB Error:", error);
        res.status(500).json({ success: false, error: "Failed to save auction" });
    }
});

/** GET /api/auction/my-auctions/:walletAddress */
router.get('/my-auctions/:walletAddress', authMiddleware, async (req, res) => {
    try {
        const { walletAddress } = req.params;
        if (req.user.walletAddress !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'Access denied.' });
        }

        // SECURITY FIX: Use direct lowercase match instead of $regex
        const auctions = await Auction.find({
            ownerAddress: walletAddress.toLowerCase()
        }).sort({ createdAt: -1 });

        res.json({ success: true, auctions });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch auctions" });
    }
});

/** DELETE /api/auction/delete/:id */
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // SECURITY FIX: Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format.' });
        }

        const auction = await Auction.findById(id);
        if (!auction) return res.status(404).json({ success: false, error: 'Not found.' });
        if (req.user.walletAddress !== auction.ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'Access denied.' });
        }

        await Auction.findByIdAndDelete(id);
        console.log(`🗑️ Auction ${id} deleted.`);
        res.json({ success: true, message: "Auction removed." });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to delete auction." });
    }
});

module.exports = router;
