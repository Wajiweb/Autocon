'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }  = require('../middleware/auth');
const { strictLimiter }   = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { generateAuction, saveAuction } = require('../controllers/auctionController');

router.post  ('/generate',                  strictLimiter, authMiddleware, validate(schemas.generateAuction), generateAuction);
router.post  ('/save',                      authMiddleware, validate(schemas.saveAuction), saveAuction);

module.exports = router;
