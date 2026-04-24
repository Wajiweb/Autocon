'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }  = require('../middleware/auth');
const { strictLimiter }   = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { generateAuction, saveAuction, getMyAuctions, deleteAuction } = require('../controllers/auctionController');

router.post  ('/generate',                  strictLimiter, authMiddleware, validate(schemas.generateAuction), generateAuction);
router.post  ('/save',                      authMiddleware, saveAuction);
router.get   ('/my-auctions/:walletAddress', authMiddleware, getMyAuctions);
router.delete('/delete/:id',                authMiddleware, deleteAuction);

module.exports = router;
