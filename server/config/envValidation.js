'use strict';

/**
 * envValidation.js
 * Centralized environment variable validator and JWT_SECRET entropy checker.
 * Automatically runs at server and worker startup.
 */

const path = require('path');

// Ensure dotenv is loaded before running validation
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Blocklist of known weak or default development secrets
const BLOCKED_SECRETS = [
    'super_secret_development_key_change_me_in_production_123',
    'autocon_super_secret_auth_key_2026_xyz123',
    'secret',
    'password',
    'development',
    'dev',
    'autocon'
];

/**
 * Calculates the Shannon entropy of a string (bits per symbol).
 * Higher entropy means more randomness/unpredictability.
 * @param {string} str 
 * @returns {number}
 */
function calculateEntropy(str) {
    if (!str) return 0;
    const len = str.length;
    const frequencies = {};
    for (let i = 0; i < len; i++) {
        const char = str[i];
        frequencies[char] = (frequencies[char] || 0) + 1;
    }
    let entropy = 0;
    for (const char in frequencies) {
        const p = frequencies[char] / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

/**
 * Runs validation checks on all required environment variables.
 * Fails fast and aborts process in production if critical requirements are not met.
 */
function validateEnv() {
    const requiredEnv = [
        'MONGO_URI',
        'JWT_SECRET',
        'SEPOLIA_RPC_URL',
        'AMOY_RPC_URL',
        'BNB_TESTNET_RPC_URL',
        'GEMINI_API_KEY',
        'PINATA_JWT'
    ];

    const missing = [];
    for (const variable of requiredEnv) {
        if (!process.env[variable] || process.env[variable].trim() === '') {
            missing.push(variable);
        }
    }

    // REDIS_HOST is required unless in-memory queue is explicitly enabled
    if (process.env.USE_IN_MEMORY_QUEUE !== 'true') {
        if (!process.env.REDIS_HOST || process.env.REDIS_HOST.trim() === '') {
            missing.push('REDIS_HOST');
        }
    }

    if (missing.length > 0) {
        const errorMsg = `❌ CRITICAL: Missing required environment variables: ${missing.join(', ')}`;
        if (isProduction) {
            console.error(JSON.stringify({ level: 'FATAL', timestamp: new Date().toISOString(), message: errorMsg }));
            process.exit(1);
        } else {
            console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message: `${errorMsg} (Startup allowed in development)` }));
        }
    }

    // ─── JWT_SECRET Entropy and Strength Checks ───
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
        const length = jwtSecret.length;
        const entropy = calculateEntropy(jwtSecret);
        const isBlocked = BLOCKED_SECRETS.some(weakKey => 
            jwtSecret.toLowerCase().includes(weakKey.toLowerCase())
        );

        let isWeak = false;
        let failReason = '';

        if (length < 32) {
            isWeak = true;
            failReason = 'JWT_SECRET length is less than 32 characters.';
        } else if (entropy < 3.0) {
            isWeak = true;
            failReason = `JWT_SECRET has critically low Shannon entropy (${entropy.toFixed(2)} bits/symbol).`;
        } else if (isBlocked) {
            isWeak = true;
            failReason = 'JWT_SECRET contains a blocklisted default development keyword or key pattern.';
        }

        if (isWeak) {
            const errorMsg = ` JWT_SECRET Strength Check Failed: ${failReason}`;
            if (isProduction) {
                console.error(JSON.stringify({
                    level: 'FATAL',
                    timestamp: new Date().toISOString(),
                    message: `${errorMsg}. Boot aborted in production mode for system hardening. Please configure a strong, high-entropy 256-bit key.`
                }));
                process.exit(1);
            } else {
                console.warn(JSON.stringify({
                    level: 'WARN',
                    timestamp: new Date().toISOString(),
                    message: `${errorMsg}. Weak keys are permitted only in development mode. Update your production configuration immediately.`
                }));
            }
        }
    }
}

// Run validation immediately on load
validateEnv();

module.exports = { validateEnv, calculateEntropy };
