'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }                  = require('../middleware/auth');
const { getNonce, verifySignature, getMe } = require('../controllers/authController');

router.get ('/nonce/:walletAddress', getNonce);
router.post('/verify',              verifySignature);
router.get ('/me',   authMiddleware, getMe);

module.exports = router;
