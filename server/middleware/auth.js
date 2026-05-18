'use strict';

const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error(' FATAL: JWT_SECRET must be set in .env and be at least 32 characters.');
    process.exit(1);
}

/**
 * authMiddleware
 * Verifies the JWT and attaches a full user context to req.user:
 *   { walletAddress, userId, role }
 *
 * Security checks:
 * 1. Token signature and expiration
 * 2. Token not blacklisted (logout invalidation)
 * 3. Token version matches user's current version (session invalidation)
 * 4. User exists in database
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const walletAddress = decoded.walletAddress.toLowerCase();

        // Check if token is blacklisted (logged out)
        const blacklisted = await TokenBlacklist.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ success: false, error: 'Token has been revoked. Please sign in again.' });
        }

        // Load user to get current role and token version
        const user = await User.findOne({ walletAddress }).select('walletAddress role tokenVersion').lean();

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found. Please sign in again.' });
        }

        // Check token version - if mismatch, all sessions are invalidated
        if (decoded.tokenVersion !== undefined && decoded.tokenVersion < user.tokenVersion) {
            return res.status(401).json({ success: false, error: 'Session expired. Please sign in again.' });
        }

        req.user = {
            walletAddress: user.walletAddress,
            userId:        user._id.toString(),
            role:          user.role,
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired. Please sign in again.' });
        }
        return res.status(401).json({ success: false, error: 'Invalid token.' });
    }
}

module.exports = { authMiddleware, JWT_SECRET };
