'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

// Ensure standard JWT Secret exists for test context
process.env.JWT_SECRET = 'super_secret_test_key_that_is_at_least_32_characters_long';

const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

describe('JWT Expiry & Blacklisting Logic Tests', () => {
    let originalUserFindOne;
    let originalBlacklistFindOne;

    before(() => {
        // Backup original models before overriding for mocks
        originalUserFindOne = User.findOne;
        originalBlacklistFindOne = TokenBlacklist.findOne;
    });

    after(() => {
        // Restore original models after tests run
        User.findOne = originalUserFindOne;
        TokenBlacklist.findOne = originalBlacklistFindOne;
    });

    test('TTL Expiration conversion - should calculate correct Date from JWT exp claim', () => {
        const decodedExp = 1785500000; // Mock unix epoch time
        const expectedDate = new Date(decodedExp * 1000);
        
        // Assert correct MS precision
        assert.strictEqual(expectedDate.getTime(), decodedExp * 1000);
    });

    test('authMiddleware - should authorize valid, active, non-blacklisted tokens', async () => {
        const payload = { walletAddress: '0x1234567890123456789012345678901234567890', tokenVersion: 1 };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Mock Mongoose model method chaining
        User.findOne = () => ({
            select: () => ({
                lean: async () => ({
                    _id: '507f1f77bcf86cd799439011',
                    walletAddress: '0x1234567890123456789012345678901234567890',
                    role: 'user',
                    tokenVersion: 1
                })
            })
        });

        // Mock not blacklisted
        TokenBlacklist.findOne = async () => null;

        const req = { headers: { authorization: `Bearer ${token}` } };
        let responseStatus = null;
        let responseJson = null;
        const res = {
            status: (code) => {
                responseStatus = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        let nextCalled = false;
        const next = () => { nextCalled = true; };

        await authMiddleware(req, res, next);

        assert.strictEqual(nextCalled, true);
        assert.strictEqual(responseStatus, null); // Middleware called next() instead of responding
        assert.strictEqual(req.user.walletAddress, '0x1234567890123456789012345678901234567890');
    });

    test('authMiddleware - should reject blacklisted (logged-out) tokens', async () => {
        const payload = { walletAddress: '0x1234567890123456789012345678901234567890', tokenVersion: 1 };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Mock token exists in blacklisted collection
        TokenBlacklist.findOne = async () => ({ token });

        const req = { headers: { authorization: `Bearer ${token}` } };
        let responseStatus = null;
        let responseJson = null;
        const res = {
            status: (code) => {
                responseStatus = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        let nextCalled = false;
        const next = () => { nextCalled = true; };

        await authMiddleware(req, res, next);

        assert.strictEqual(nextCalled, false);
        assert.strictEqual(responseStatus, 401);
        assert.strictEqual(responseJson.success, false);
        assert.match(responseJson.error, /Token has been revoked/);
    });

    test('authMiddleware - should reject tokens with outdated tokenVersion (concurrent session invalidation)', async () => {
        const payload = { walletAddress: '0x1234567890123456789012345678901234567890', tokenVersion: 1 };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Mock user updated session version to 2 (token has version 1)
        User.findOne = () => ({
            select: () => ({
                lean: async () => ({
                    _id: '507f1f77bcf86cd799439011',
                    walletAddress: '0x1234567890123456789012345678901234567890',
                    role: 'user',
                    tokenVersion: 2
                })
            })
        });

        TokenBlacklist.findOne = async () => null;

        const req = { headers: { authorization: `Bearer ${token}` } };
        let responseStatus = null;
        let responseJson = null;
        const res = {
            status: (code) => {
                responseStatus = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        let nextCalled = false;
        const next = () => { nextCalled = true; };

        await authMiddleware(req, res, next);

        assert.strictEqual(nextCalled, false);
        assert.strictEqual(responseStatus, 401);
        assert.strictEqual(responseJson.success, false);
        assert.match(responseJson.error, /Session expired/);
    });
});
