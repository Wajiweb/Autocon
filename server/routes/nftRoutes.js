'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }  = require('../middleware/auth');
const { strictLimiter }   = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { generateNFT, saveNFT } = require('../controllers/nftController');

router.post  ('/generate',              strictLimiter, authMiddleware, validate(schemas.generateNFT), generateNFT);
router.post  ('/save',                  authMiddleware, validate(schemas.saveNFT), saveNFT);

module.exports = router;
