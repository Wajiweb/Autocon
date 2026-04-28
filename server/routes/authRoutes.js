'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }                  = require('../middleware/auth');
const { getNonce, signup, login, verifySignature, getMe } = require('../controllers/authController');

router.post('/nonce', getNonce);
router.post('/signup', signup);
router.post('/login', login);
router.get ('/me', authMiddleware, getMe);

// Legacy aliases kept for older clients during migration.
router.get ('/nonce/:walletAddress', getNonce);
router.post('/verify', verifySignature);

module.exports = router;
