'use strict';

/**
 * authController.js
 *
 * Handles Web3 wallet authentication via message signature.
 */

const jwt          = require('jsonwebtoken');
const crypto       = require('crypto');
const User         = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const Nonce        = require('../models/Nonce');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { isValidAddress } = require('../services/blockchainService');
const { ethers }   = require('ethers');

const JWT_SECRET = process.env.JWT_SECRET;
const SIGNUP_NONCE_TTL_MS = 5 * 60 * 1000;

const buildAuthMessage = (nonce) => (
    `AutoCon authentication\n\nSign this message to verify your wallet.\nNonce: ${nonce}`
);

const normalizeWalletAddress = (walletAddress) => {
    if (!walletAddress || !isValidAddress(walletAddress)) {
        throw new AppError('Invalid Ethereum address.', 400, 'INVALID_ADDRESS');
    }

    return walletAddress.toLowerCase();
};

const signToken = (walletAddress, tokenVersion) => (
    jwt.sign({ walletAddress, tokenVersion }, JWT_SECRET, { expiresIn: '24h' })
);

const serializeUser = (user) => ({
    walletAddress: user.walletAddress,
    role:          user.role,
    createdAt:     user.createdAt,
});

const verifyWalletSignature = (message, signature, walletAddress) => {
    let recoveredAddress;

    try {
        recoveredAddress = ethers.verifyMessage(message, signature);
    } catch {
        throw new AppError('Signature verification failed.', 401, 'UNAUTHORIZED');
    }

    if (recoveredAddress.toLowerCase() !== walletAddress) {
        throw new AppError('Signature verification failed.', 401, 'UNAUTHORIZED');
    }
};

const getSignupNonce = async (walletAddress) => {
    const record = await Nonce.findOne({ walletAddress, type: 'signup' });

    if (!record || record.expiresAt < new Date()) {
        if (record) {
            await Nonce.deleteOne({ _id: record._id });
        }
        throw new AppError('Authentication nonce expired. Please request a new nonce.', 400, 'NONCE_EXPIRED');
    }

    return record.nonce;
};

/** POST /api/auth/nonce */
const getNonce = asyncHandler(async (req, res) => {
    const { walletAddress: bodyWalletAddress, mode = 'login' } = req.body || {};
    const walletAddress = normalizeWalletAddress(bodyWalletAddress || req.params.walletAddress);

    if (!['login', 'signup'].includes(mode)) {
        throw new AppError('mode must be either login or signup.', 400, 'INVALID_AUTH_MODE');
    }

    const user = await User.findOne({ walletAddress });

    if (mode === 'login') {
        if (!user) {
            throw new AppError('User not found, please sign up', 404, 'USER_NOT_FOUND');
        }

        return res.json({
            success: true,
            data: {
                nonce:   user.nonce,
                message: buildAuthMessage(user.nonce),
            }
        });
    }

    if (user) {
        throw new AppError('Account already exists, please log in', 409, 'USER_ALREADY_EXISTS');
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    
    // Delete any existing nonce for this wallet
    await Nonce.deleteOne({ walletAddress, type: 'signup' });
    
    // Create new nonce in database
    await Nonce.create({
        walletAddress,
        nonce,
        expiresAt: new Date(Date.now() + SIGNUP_NONCE_TTL_MS),
        type: 'signup',
    });

    return res.json({
        success: true,
        data: {
            nonce,
            message: buildAuthMessage(nonce),
        }
    });
});

/** POST /api/auth/signup */
const signup = asyncHandler(async (req, res) => {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
        throw new AppError('walletAddress and signature are required.', 400, 'MISSING_FIELDS');
    }

    const lowerAddress = normalizeWalletAddress(walletAddress);
    const existingUser = await User.findOne({ walletAddress: lowerAddress });
    if (existingUser) {
        throw new AppError('Account already exists, please log in', 409, 'USER_ALREADY_EXISTS');
    }

    const nonce = await getSignupNonce(lowerAddress);
    await Nonce.deleteOne({ walletAddress: lowerAddress, type: 'signup' }); // Invalidate immediately to prevent replay attacks
    const message = buildAuthMessage(nonce);
    verifyWalletSignature(message, signature, lowerAddress);

    let user;
    try {
        user = await User.create({ walletAddress: lowerAddress });
    } catch (err) {
        if (err?.code === 11000) {
            throw new AppError('Account already exists, please log in', 409, 'USER_ALREADY_EXISTS');
        }
        throw err;
    }

    const token = signToken(lowerAddress, user.tokenVersion);

    return res.status(201).json({
        success: true,
        data: {
            token,
            user: serializeUser(user),
        }
    });
});

/** POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
        throw new AppError('walletAddress and signature are required.', 400, 'MISSING_FIELDS');
    }

    const lowerAddress = normalizeWalletAddress(walletAddress);
    const user = await User.findOne({ walletAddress: lowerAddress });
    if (!user) {
        throw new AppError('User not found, please sign up', 404, 'USER_NOT_FOUND');
    }

    const currentNonce = user.nonce;
    const message = buildAuthMessage(currentNonce);
    
    // Verify signature BEFORE regenerating nonce
    verifyWalletSignature(message, signature, lowerAddress);
    
    // Regenerate nonce AFTER successful verification (prevents replay attacks)
    await user.regenerateNonce();

    const token = signToken(lowerAddress, user.tokenVersion);

    return res.json({
        success: true,
        data: {
            token,
            user: serializeUser(user),
        }
    });
});

/** POST /api/auth/verify - legacy alias for login */
const verifySignature = login;

/** GET /api/auth/me */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

    return res.json({
        success: true,
        data: {
            user: serializeUser(user),
        }
    });
});

/** POST /api/auth/logout */
const logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ success: true, data: { message: 'Already logged out.' } });
    }

    const token = authHeader.split(' ')[1];
    const walletAddress = req.user.walletAddress;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const expiresAt = new Date(decoded.exp * 1000);

        // Blacklist the token
        await TokenBlacklist.create({
            token,
            walletAddress,
            expiresAt,
        });

        // Increment token version to invalidate all other sessions
        const user = await User.findOne({ walletAddress });
        if (user) {
            await user.incrementTokenVersion();
        }

        return res.json({
            success: true,
            data: { message: 'Logged out successfully.' },
        });
    } catch (err) {
        // Even if token is invalid, treat as logout
        return res.json({ success: true, data: { message: 'Logged out.' } });
    }
});

module.exports = { getNonce, signup, login, verifySignature, getMe, logout };
