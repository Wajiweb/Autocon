'use strict';

/**
 * userController.js
 *
 * Handles user profile, usage stats, and API key management.
 * Follows the clean controller pattern — no business logic here,
 * everything delegates to services.
 */

const User           = require('../models/User');
const { getUsage }   = require('../services/usageService');
const { assignApiKey } = require('../services/apiKeyService');

// ─── GET /api/user/profile ────────────────────────────────────────────────────

/**
 * Returns the authenticated user's profile including role and usage stats.
 */
async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user.userId)
            .select('walletAddress role usage apiKey createdAt')
            .lean();

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        return res.json({
            success: true,
            data: {
                walletAddress: user.walletAddress,
                role:          user.role,
                usage:         user.usage,
                hasApiKey:     !!user.apiKey,
                // Never expose the raw API key in profile — only confirm it exists
                memberSince:   user.createdAt,
            },
        });
    } catch (err) {
        console.error('[UserController] getProfile:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
    }
}

// ─── GET /api/user/usage ──────────────────────────────────────────────────────

/**
 * Returns raw usage counters for the authenticated user.
 */
async function getMyUsage(req, res) {
    try {
        const usage = await getUsage(req.user.userId);
        return res.json({ success: true, data: { usage } });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to fetch usage.' });
    }
}

// ─── POST /api/user/generate-api-key ─────────────────────────────────────────

/**
 * Generates (or returns existing) API key for the authenticated user.
 * Pass { force: true } in body to rotate an existing key.
 *
 * Response exposes the key ONCE. Store it securely — it is not shown again.
 */
async function generateApiKey(req, res) {
    const force = req.body?.force === true;

    try {
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
    } catch (err) {
        console.error('[UserController] generateApiKey:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to generate API key.' });
    }
}

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

/**
 * Admin-only: list all users with usage stats (paginated).
 */
async function listAllUsers(req, res) {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    try {
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
    } catch (err) {
        console.error('[UserController] listAllUsers:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to fetch users.' });
    }
}

// ─── PUT /api/admin/users/:walletAddress/role ─────────────────────────────────

/**
 * Admin-only: promote or demote a user's role.
 */
async function updateUserRole(req, res) {
    const { walletAddress } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, error: 'role must be "user" or "admin".' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { walletAddress: walletAddress.toLowerCase() },
            { role },
            { new: true }
        ).select('walletAddress role');

        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        return res.json({ success: true, data: { walletAddress: user.walletAddress, role: user.role } });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to update role.' });
    }
}

module.exports = { getProfile, getMyUsage, generateApiKey, listAllUsers, updateUserRole };
