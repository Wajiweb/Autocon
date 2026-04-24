'use strict';

/**
 * usageService.js — Usage Tracking Service
 *
 * Provides atomic increment functions for tracking user activity.
 * Uses MongoDB $inc operator — never loads the full document, never
 * risks a race condition, never goes negative.
 *
 * Integration points:
 *   - Call incrementDeployments(userId) inside saveToken/saveNFT/saveAuction
 *   - Call incrementAudits(userId)     inside runAudit or audit worker
 *
 * Usage:
 *   const { incrementDeployments, incrementAudits } = require('../services/usageService');
 *   await incrementDeployments(req.user.userId);
 */

const User = require('../models/User');

/**
 * Increment the deployment counter for a user.
 * Silently no-ops if userId is missing (prevents breaking deploys on edge cases).
 *
 * @param {string} userId  MongoDB ObjectId string
 */
async function incrementDeployments(userId) {
    if (!userId) return;
    try {
        await User.updateOne(
            { _id: userId },
            { $inc: { 'usage.deployments': 1 } }
        );
    } catch (err) {
        // Non-fatal — usage tracking must never break the main flow
        console.warn(`[UsageService] Failed to increment deployments for ${userId}:`, err.message);
    }
}

/**
 * Increment the audit counter for a user.
 *
 * @param {string} userId  MongoDB ObjectId string
 */
async function incrementAudits(userId) {
    if (!userId) return;
    try {
        await User.updateOne(
            { _id: userId },
            { $inc: { 'usage.audits': 1 } }
        );
    } catch (err) {
        console.warn(`[UsageService] Failed to increment audits for ${userId}:`, err.message);
    }
}

/**
 * Get the current usage counters for a user.
 *
 * @param {string} userId
 * @returns {{ deployments: number, audits: number } | null}
 */
async function getUsage(userId) {
    if (!userId) return null;
    try {
        const user = await User.findById(userId).select('usage').lean();
        return user?.usage || { deployments: 0, audits: 0 };
    } catch (err) {
        console.warn(`[UsageService] Failed to fetch usage for ${userId}:`, err.message);
        return null;
    }
}

module.exports = { incrementDeployments, incrementAudits, getUsage };
