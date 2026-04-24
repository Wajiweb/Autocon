'use strict';

/**
 * verifyRoutes.js — Thin router only.
 * All business logic lives in controllers/verify.controller.js.
 */

const express = require('express');
const router  = express.Router();
const { authMiddleware }                        = require('../middleware/auth');
const { strictLimiter }                         = require('../middleware/rateLimiter');
const { validate, schemas }                     = require('../middleware/validationSchemas');
const { submitVerification, checkVerificationStatus } = require('../controllers/verify.controller');

/** POST /api/verify — Submit contract for Etherscan verification */
router.post('/',
    strictLimiter,
    authMiddleware,
    validate(schemas.verifyContract),
    submitVerification
);

/** GET /api/verify/status/:network/:guid — Poll verification status */
router.get('/status/:network/:guid',
    authMiddleware,
    checkVerificationStatus
);

module.exports = router;
