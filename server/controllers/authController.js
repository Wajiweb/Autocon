'use strict';
const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { isValidAddress } = require('../services/blockchainService');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { ethers } = require('ethers');

/** GET /api/auth/nonce/:walletAddress */
async function getNonce(req, res) {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();

        if (!isValidAddress(walletAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid Ethereum address.' });
        }

        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = await User.create({ walletAddress });
        }

        res.json({
            success: true,
            nonce: user.nonce,
            message: `Sign this message to verify your identity:\n\nNonce: ${user.nonce}`,
        });
    } catch (error) {
        console.error('[AuthController] getNonce:', error.message);
        res.status(500).json({ success: false, error: 'Failed to generate nonce.' });
    }
}

/** POST /api/auth/verify */
async function verifySignature(req, res) {
    try {
        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) {
            return res.status(400).json({ success: false, error: 'walletAddress and signature are required.' });
        }

        const lowerAddress = walletAddress.toLowerCase();
        const user = await User.findOne({ walletAddress: lowerAddress });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found. Request a nonce first.' });
        }

        const expectedMessage  = `Sign this message to verify your identity:\n\nNonce: ${user.nonce}`;
        const recoveredAddress = ethers.verifyMessage(expectedMessage, signature);

        if (recoveredAddress.toLowerCase() !== lowerAddress) {
            return res.status(401).json({ success: false, error: 'Signature verification failed.' });
        }

        const token = jwt.sign({ walletAddress: lowerAddress }, JWT_SECRET, { expiresIn: '24h' });
        await user.regenerateNonce();

        res.json({
            success: true,
            token,
            user: { walletAddress: lowerAddress, createdAt: user.createdAt },
        });
    } catch (error) {
        console.error('[AuthController] verifySignature:', error.message);
        res.status(500).json({ success: false, error: 'Authentication failed.' });
    }
}

/** GET /api/auth/me */
async function getMe(req, res) {
    try {
        const user = await User.findOne({ walletAddress: req.user.walletAddress });
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        res.json({
            success: true,
            user: { walletAddress: user.walletAddress, createdAt: user.createdAt },
        });
    } catch (error) {
        console.error('[AuthController] getMe:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch user.' });
    }
}

module.exports = { getNonce, verifySignature, getMe };
