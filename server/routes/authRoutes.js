const express = require('express');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/auth/nonce/:walletAddress
 * Returns a nonce for the user to sign with MetaMask.
 * Creates a new user record if this wallet hasn't been seen before.
 */
router.get('/nonce/:walletAddress', async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();

        // Validate Ethereum address format
        if (!ethers.isAddress(walletAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid Ethereum address.' });
        }

        // Find or create user
        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = await User.create({ walletAddress });
            console.log(`🆕 New user registered: ${walletAddress}`);
        }

        res.json({
            success: true,
            nonce: user.nonce,
            message: `Sign this message to verify your identity:\n\nNonce: ${user.nonce}`
        });
    } catch (error) {
        console.error('Nonce Error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate nonce.' });
    }
});

/**
 * POST /api/auth/verify
 * Verifies a MetaMask signature and returns a JWT.
 * Body: { walletAddress, signature }
 */
router.post('/verify', async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) {
            return res.status(400).json({ success: false, error: 'walletAddress and signature are required.' });
        }

        const lowerAddress = walletAddress.toLowerCase();

        // Find the user and their nonce
        const user = await User.findOne({ walletAddress: lowerAddress });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found. Request a nonce first.' });
        }

        // Reconstruct the message that was signed
        const expectedMessage = `Sign this message to verify your identity:\n\nNonce: ${user.nonce}`;

        // Recover the address that signed the message
        const recoveredAddress = ethers.verifyMessage(expectedMessage, signature);

        if (recoveredAddress.toLowerCase() !== lowerAddress) {
            return res.status(401).json({ success: false, error: 'Signature verification failed.' });
        }

        // Signature is valid! Issue JWT
        const token = jwt.sign(
            { walletAddress: lowerAddress },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Rotate nonce to prevent replay attacks
        await user.regenerateNonce();

        console.log(`✅ User authenticated: ${lowerAddress}`);

        res.json({
            success: true,
            token,
            user: {
                walletAddress: lowerAddress,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ success: false, error: 'Authentication failed.' });
    }
});

/**
 * GET /api/auth/me
 * Returns current user info (protected route).
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ walletAddress: req.user.walletAddress });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        res.json({
            success: true,
            user: {
                walletAddress: user.walletAddress,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch user.' });
    }
});

module.exports = router;
