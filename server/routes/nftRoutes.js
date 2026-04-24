'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }  = require('../middleware/auth');
const { strictLimiter }   = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { generateNFT, saveNFT, getMyNFTs, deleteNFT } = require('../controllers/nftController');

router.post  ('/generate',              strictLimiter, authMiddleware, validate(schemas.generateNFT), generateNFT);
router.post  ('/save',                  authMiddleware, saveNFT);
router.get   ('/my-nfts/:walletAddress', authMiddleware, getMyNFTs);
router.delete('/delete/:id',            authMiddleware, deleteNFT);

module.exports = router;
