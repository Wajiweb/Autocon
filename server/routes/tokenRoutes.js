'use strict';
const express    = require('express');
const router     = express.Router();
const { authMiddleware }                     = require('../middleware/auth');
const { strictLimiter }                      = require('../middleware/rateLimiter');
const { validate, schemas }                  = require('../middleware/validationSchemas');
const { generateToken, saveToken, getMyTokens, deleteToken } = require('../controllers/tokenController');

router.post('/generate-token', strictLimiter, authMiddleware, validate(schemas.generateToken), generateToken);
router.post('/save-token',     authMiddleware, saveToken);
router.get ('/my-tokens/:walletAddress', authMiddleware, getMyTokens);
router.delete('/delete-token/:id',       authMiddleware, deleteToken);

module.exports = router;
