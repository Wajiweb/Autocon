'use strict';
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');
const { compileCustomContract } = require('../controllers/compileController');

router.post('/', strictLimiter, authMiddleware, compileCustomContract);

module.exports = router;
