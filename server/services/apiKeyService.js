'use strict';

/**
 * apiKeyService.js — API Key Generation Utility
 *
 * Generates a cryptographically secure API key and stores it on the User document.
 * The key is stored as plain text (prefixed) for now.
 * When full API key auth is needed, swap to storing a SHA-256 hash.
 *
 * Key format: autocon_<32 random hex bytes>  (68 chars total — unmistakable prefix)
 */

const crypto = require('crypto');
const User   = require('../models/User');

/**
 * Generate a new API key string (not persisted).
 * @returns {string} e.g. "autocon_a3f9c12d..."
 */
function generateApiKey() {
    return `autocon_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Assign a new API key to a user.
 * Prevents generating a second key if one already exists (idempotent-safe).
 *
 * @param {string} userId   MongoDB ObjectId string
 * @param {boolean} force   If true, replaces an existing key
 * @returns {{ apiKey: string, isNew: boolean }}
 */
async function assignApiKey(userId, force = false) {
    const user = await User.findById(userId).select('apiKey');

    if (!user) throw new Error('User not found.');

    if (user.apiKey && !force) {
        // Already has a key — return existing (don't regenerate without explicit force)
        return { apiKey: user.apiKey, isNew: false };
    }

    const apiKey = generateApiKey();
    user.apiKey = apiKey;
    await user.save();

    return { apiKey, isNew: true };
}

module.exports = { generateApiKey, assignApiKey };
