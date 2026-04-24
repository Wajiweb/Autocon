'use strict';

/**
 * authController.js
 *
 * Handles Web3 wallet authentication via message signature.
 */

const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { isValidAddress } = require('../services/blockchainService');
const { ethers }   = require('ethers');

const JWT_SECRET = process.env.JWT_SECRET;

/** GET /api/auth/nonce/:walletAddress */
const getNonce = asyncHandler(async (req, res) => {
    const walletAddress = req.params.walletAddress.toLowerCase();

    if (!isValidAddress(walletAddress)) {
        throw new AppError('Invalid Ethereum address.', 400, 'INVALID_ADDRESS');
    }

    let user = await User.findOne({ walletAddress });
    if (!user) {
        user = await User.create({ walletAddress });
    }

    return res.json({
        success: true,
        data: {
            nonce: user.nonce,
            message: `Sign this message to verify your identity:\n\nNonce: ${user.nonce}`,
        }
    });
});

/** POST /api/auth/verify */
const verifySignature = asyncHandler(async (req, res) => {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
        throw new AppError('walletAddress and signature are required.', 400, 'MISSING_FIELDS');
    }

    const lowerAddress = walletAddress.toLowerCase();
    const user = await User.findOne({ walletAddress: lowerAddress });
    if (!user) {
        throw new AppError('User not found. Request a nonce first.', 404, 'NOT_FOUND');
    }

    const expectedMessage  = `Sign this message to verify your identity:\n\nNonce: ${user.nonce}`;
    const recoveredAddress = ethers.verifyMessage(expectedMessage, signature);

    if (recoveredAddress.toLowerCase() !== lowerAddress) {
        throw new AppError('Signature verification failed.', 401, 'UNAUTHORIZED');
    }

    const token = jwt.sign({ walletAddress: lowerAddress }, JWT_SECRET, { expiresIn: '24h' });
    await user.regenerateNonce();

    return res.json({
        success: true,
        data: {
            token,
            user: { walletAddress: lowerAddress, createdAt: user.createdAt },
        }
    });
});

/** GET /api/auth/me */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

    return res.json({
        success: true,
        data: {
            user: { walletAddress: user.walletAddress, createdAt: user.createdAt },
        }
    });
});

module.exports = { getNonce, verifySignature, getMe };
