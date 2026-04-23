const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const solc = require('solc');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const Token = require('../models/Token');
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');

// ─── TOKEN GENERATION (strict rate limit, auth required) ───
router.post('/generate-token', strictLimiter, authMiddleware, (req, res) => {
    console.log("--- Compiling Contract ---");
    const { name, symbol, supply, ownerAddress } = req.body;

    // Input sanitization
    const sanitize = (str) => str.replace(/[^a-zA-Z0-9\s]/g, '');
    const safeName = sanitize(name || '');
    const safeSymbol = sanitize(symbol || '').toUpperCase();
    const safeSupply = String(parseInt(supply) || 1000000);

    if (!safeName || !safeSymbol || !ownerAddress) {
        return res.status(400).json({ success: false, error: 'name, symbol, supply, and ownerAddress are required.' });
    }

    try {
        // Step back out of routes folder with ..
        const templatePath = path.join(__dirname, '..', 'templates', 'ERC20Template.txt');
        let contractCode = fs.readFileSync(templatePath, 'utf8');
        let className = safeName.replace(/\s+/g, '');
        if (!className) className = 'TokenContract';
        if (/^[0-9]/.test(className)) className = '_' + className;

        let finalCode = contractCode
            .replace(/{{CONTRACT_NAME}}/g, className)
            .replace(/{{TOKEN_NAME}}/g, safeName)
            .replace(/{{TOKEN_SYMBOL}}/g, safeSymbol)
            .replace(/{{SUPPLY}}/g, safeSupply)
            .replace(/{{IMPORT_BURNABLE}}/g, "").replace(/{{IMPORT_PAUSABLE}}/g, "")
            .replace(/{{INHERIT_BURNABLE}}/g, "").replace(/{{INHERIT_PAUSABLE}}/g, "")
            .replace(/{{FUNCTION_MINT}}/g, "").replace(/{{FUNCTION_PAUSE}}/g, "");

        const input = {
            language: 'Solidity',
            sources: { 'Token.sol': { content: finalCode } },
            settings: {
                outputSelection: {
                    '*': { '*': ['abi', 'evm.bytecode.object'] },
                    '':  { '': ['ast'] }
                }
            }
        };

        function findImports(importPath) {
            try {
                if (importPath.startsWith('@openzeppelin/')) {
                    const actualPath = require.resolve(importPath, { paths: [__dirname] });
                    return { contents: fs.readFileSync(actualPath, 'utf8') };
                }
                return { error: 'File not found' };
            } catch (e) {
                return { error: 'File not found: ' + e.message };
            }
        }

        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

        if (output.errors) {
            const errors = output.errors.filter(error => error.severity === 'error');
            if (errors.length > 0) {
                console.error("COMPILATION ERRORS:", errors);
                return res.status(500).json({ success: false, error: "Compile Error: " + errors[0].message });
            }
        }

        const contractData = output.contracts['Token.sol'][className];
        const fileName     = Object.keys(output.sources ?? {})[0];
        const ast          = output.sources?.[fileName]?.ast ?? null;

        res.json({
            success: true,
            contractCode: finalCode,
            abi: contractData.abi,
            bytecode: contractData.evm.bytecode.object,
            ast
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ success: false, error: "Generation failed" });
    }
});

// ─── SAVE TOKEN (auth required) ───
router.post('/save-token', authMiddleware, async (req, res) => {
    try {
        const { name, symbol, contractAddress, ownerAddress, network, abi } = req.body;

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

        // Authorization: user can only save tokens for their own wallet
        if (req.user.walletAddress !== ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only save tokens for your own wallet.' });
        }

        const newToken = new Token({ name, symbol, contractAddress, ownerAddress: ownerAddress.toLowerCase(), network: network || 'Sepolia', abi: abi || null });
        await newToken.save();

        console.log(`💾 Saved ${name} to database!`);
        res.status(201).json({ success: true, message: 'Token saved successfully!' });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, error: "Failed to save token" });
    }
});

// ─── FETCH USER TOKENS (auth required) ───
router.get('/my-tokens/:walletAddress', authMiddleware, async (req, res) => {
    try {
        const { walletAddress } = req.params;

        // Authorization: user can only view their own tokens
        if (req.user.walletAddress !== walletAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only view your own tokens.' });
        }

        const userTokens = await Token.find({
            ownerAddress: walletAddress.toLowerCase()
        }).sort({ createdAt: -1 });

        res.json({ success: true, tokens: userTokens });

    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch tokens" });
    }
});

// ─── DELETE TOKEN (auth required + authorization) ───
router.delete('/delete-token/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format.' });
        }

        // Find the token first to check ownership
        const token = await Token.findById(id);
        if (!token) {
            return res.status(404).json({ success: false, error: 'Token not found.' });
        }

        // Authorization: user can only delete their own tokens
        if (req.user.walletAddress !== token.ownerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'You can only delete your own tokens.' });
        }

        await Token.findByIdAndDelete(id);

        console.log(`🗑️ Token ${id} deleted from database.`);
        res.json({ success: true, message: "Deployment removed from registry." });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, error: "Failed to delete token." });
    }
});

module.exports = router;
