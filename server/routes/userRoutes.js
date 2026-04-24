'use strict';

/**
 * userRoutes.js
 *
 * User profile, usage, and API key routes.
 * Admin management routes are mounted here under /api/admin.
 */

const express = require('express');
const router  = express.Router();

const { authMiddleware }  = require('../middleware/auth');
const { requireRole }     = require('../middleware/role.middleware');
const { strictLimiter }   = require('../middleware/rateLimiter');
const {
    getProfile, getMyUsage, generateApiKey,
    listAllUsers, updateUserRole,
} = require('../controllers/userController');

// ─── Authenticated User Routes ────────────────────────────────────────────────

// GET  /api/user/profile         — full profile (role, usage, apiKey existence)
router.get ('/profile',           authMiddleware, getProfile);

// GET  /api/user/usage           — usage counters only
router.get ('/usage',             authMiddleware, getMyUsage);

// POST /api/user/generate-api-key — generate or rotate API key
router.post('/generate-api-key',  strictLimiter, authMiddleware, generateApiKey);

// ─── Admin-Only Routes ────────────────────────────────────────────────────────
// Example: GET /api/admin/users
// requireRole('admin') blocks any non-admin even with a valid JWT

router.get ('/admin/users',                           authMiddleware, requireRole('admin'), listAllUsers);
router.put ('/admin/users/:walletAddress/role',        authMiddleware, requireRole('admin'), updateUserRole);

module.exports = router;
