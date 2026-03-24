const express = require('express');
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const NFT = require('../models/NFT');
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Helper: resolve OpenZeppelin imports for solc
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

// Sanitize input strings
const sanitize = (str) => str.replace(/[^a-zA-Z0-9\s]/g, '');

/**
 * POST /api/nft/generate
 * Generates and compiles an ERC-721 NFT contract.
 * Body: { name, symbol, maxSupply, baseURI, mintPrice, ownerAddress }
 */
router.post('/generate', strictLimiter, authMiddleware, (req, res) => {
    console.log("--- Compiling NFT Contract ---");
    const { name, symbol, maxSupply, baseURI, mintPrice, ownerAddress } = req.body;

    const safeName = sanitize(name || '');
    const safeSymbol = sanitize(symbol || '').toUpperCase();
    const safeMaxSupply = String(parseInt(maxSupply) || 10000);
    const safeMintPrice = String(parseFloat(mintPrice) || 0);
    const safeBaseURI = (baseURI || '').trim();

    if (!safeName || !safeSymbol || !ownerAddress) {
        return res.status(400).json({
            success: false,
            error: 'name, symbol, and ownerAddress are required.'
        });
    }

    try {
        const templatePath = path.join(__dirname, '..', 'templates', 'ERC721Template.txt');
        let contractCode = fs.readFileSync(templatePath, 'utf8');
        const className = safeName.replace(/\s+/g, '');

        let finalCode = contractCode
            .replace(/{{CONTRACT_NAME}}/g, className)
            .replace(/{{NFT_NAME}}/g, safeName)
            .replace(/{{NFT_SYMBOL}}/g, safeSymbol);

        const input = {
            language: 'Solidity',
            sources: { 'NFT.sol': { content: finalCode } },
            settings: {
                outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } }
            }
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

        if (output.errors) {
            const errors = output.errors.filter(error => error.severity === 'error');
            if (errors.length > 0) {
                console.error("NFT COMPILATION ERRORS:", errors);
                return res.status(500).json({
                    success: false,
                    error: "Solidity Compilation Failed",
                    details: errors.map(e => e.formattedMessage)
                });
            }
        }

        const contractData = output.contracts['NFT.sol'][className];

        if (!contractData) {
            return res.status(500).json({
                success: false,
                error: "Compilation produced no output. Check contract name."
            });
        }

        console.log(`✅ NFT Contract "${safeName}" compiled successfully!`);

        res.json({
            success: true,
            contractCode: finalCode,
            abi: contractData.abi,
            bytecode: contractData.evm.bytecode.object,
            contractName: className
        });

    } catch (error) {
        console.error("NFT SERVER ERROR:", error);
        res.status(500).json({ success: false, error: "NFT generation failed" });
    }
});

/**
 * POST /api/nft/save
 * Saves a deployed NFT collection to the database.
 */
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { name, symbol, contractAddress, ownerAddress, network, maxSupply, mintPrice, baseURI, abi } = req.body;

        // Validate required fields
        if (!name || !symbol || !contractAddress || !ownerAddress) {
            return res.status(400).json({ success: false, error: 'name, symbol, contractAddress, and ownerAddress are required.' });
        }

        // Validate Ethereum address formats
        if (!ethers.isAddress(contractAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid contract address format.' });
        }
        if (!ethers.isAddress(ownerAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid owner address format.' });
        }

        // Authorization check
        if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only save NFTs for your own wallet.' });
        }

        const newNFT = new NFT({
            name, symbol, contractAddress, ownerAddress: ownerAddress.toLowerCase(),
            network: network || 'Sepolia', maxSupply, mintPrice, baseURI, abi: abi || null
        });
        await newNFT.save();

        console.log(`💾 NFT "${name}" saved to database!`);
        res.status(201).json({ success: true, message: 'NFT collection saved successfully!' });

    } catch (error) {
        console.error("NFT Database Error:", error);
        res.status(500).json({ success: false, error: "Failed to save NFT" });
    }
});

/**
 * GET /api/nft/my-nfts/:walletAddress
 * Fetches all NFT collections belonging to a wallet.
 */
router.get('/my-nfts/:walletAddress', authMiddleware, async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (req.user.walletAddress !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only view your own NFTs.' });
        }

        // SECURITY FIX: Use direct lowercase match instead of $regex
        const userNFTs = await NFT.find({
            ownerAddress: walletAddress.toLowerCase()
        }).sort({ createdAt: -1 });

        res.json({ success: true, nfts: userNFTs });

    } catch (error) {
        console.error("NFT Fetch Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch NFTs" });
    }
});

/**
 * DELETE /api/nft/delete/:id
 * Deletes an NFT collection record from the database.
 */
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // SECURITY FIX: Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format.' });
        }

        const nft = await NFT.findById(id);
        if (!nft) {
            return res.status(404).json({ success: false, error: 'NFT not found.' });
        }

        if (req.user.walletAddress !== nft.ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only delete your own NFTs.' });
        }

        await NFT.findByIdAndDelete(id);
        console.log(`🗑️ NFT ${id} deleted from database.`);
        res.json({ success: true, message: "NFT removed from registry." });

    } catch (error) {
        console.error("NFT Delete Error:", error);
        res.status(500).json({ success: false, error: "Failed to delete NFT." });
    }
});

module.exports = router;
