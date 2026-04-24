'use strict';
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { compileCustomContract } = require('../controllers/compileController');

// Standard compile for Monaco editor (smaller)
router.post('/', strictLimiter, authMiddleware, validate(schemas.compileCustom), compileCustomContract);

module.exports = router;
