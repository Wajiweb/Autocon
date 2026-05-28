'use strict';

/**
 * userController.js
 *
 * Handles user profile, usage stats, and API key management.
 * Follows the clean controller pattern — no business logic here,
 * everything delegates to services.
 */

const User = require('../models/User');
const { getUsage } = require('../services/usageService');
const { assignApiKey } = require('../services/apiKeyService');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// ─── GET /api/user/profile ────────────────────────────────────────────────────

/**
 * Returns the authenticated user's profile including role and usage stats.
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId)
        .select('walletAddress role usage apiKey createdAt')
        .lean();

    if (!user) {
        throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    return res.json({
        success: true,
        data: {
            walletAddress: user.walletAddress,
            role:          user.role,
            usage:         user.usage,
            hasApiKey:     !!user.apiKey,
            memberSince:   user.createdAt,
        },
    });
});

// ─── GET /api/user/usage ──────────────────────────────────────────────────────

/**
 * Returns raw usage counters for the authenticated user.
 */
const getMyUsage = asyncHandler(async (req, res) => {
    const usage = await getUsage(req.user.userId);
    return res.json({ success: true, data: { usage } });
});

// ─── POST /api/user/generate-api-key ─────────────────────────────────────────

/**
 * Generates (or returns existing) API key for the authenticated user.
 * Pass { force: true } in body to rotate an existing key.
 *
 * Response exposes the key ONCE. Store it securely — it is not shown again.
 */
const generateApiKey = asyncHandler(async (req, res) => {
    const force = req.body?.force === true;
    const { apiKey, isNew } = await assignApiKey(req.user.userId, force);

    return res.json({
        success: true,
        data: {
            apiKey,
            isNew,
            message: isNew
                ? 'API key generated. Store it securely — it will not be shown again.'
                : 'You already have an API key. Send { force: true } to rotate it.',
        },
    });
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

/**
 * Admin-only: list all users with usage stats (paginated).
 */
const listAllUsers = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .select('walletAddress role usage createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(),
    ]);

    return res.json({
        success: true,
        data: {
            users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
    });
});

// ─── PUT /api/admin/users/:walletAddress/role ─────────────────────────────────

/**
 * Admin-only: promote or demote a user's role.
 */
const updateUserRole = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        throw new AppError('role must be "user" or "admin".', 400, 'INVALID_ROLE');
    }

    const user = await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { role },
        { new: true }
    ).select('walletAddress role');

    if (!user) {
        throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    return res.json({ success: true, data: { walletAddress: user.walletAddress, role: user.role } });
});

module.exports = { getProfile, getMyUsage, generateApiKey, listAllUsers, updateUserRole };
