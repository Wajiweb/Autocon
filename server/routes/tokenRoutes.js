'use strict';
const express    = require('express');
const router     = express.Router();
const { authMiddleware }                     = require('../middleware/auth');
const { strictLimiter }                      = require('../middleware/rateLimiter');
const { validate, schemas }                  = require('../middleware/validationSchemas');
const { generateToken, saveToken } = require('../controllers/tokenController');

router.post('/generate-token', strictLimiter, authMiddleware, validate(schemas.generateToken), generateToken);
router.post('/save-token',     authMiddleware, validate(schemas.saveToken), saveToken);

module.exports = router;
