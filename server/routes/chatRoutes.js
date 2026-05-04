'use strict';

/**
 * chatRoutes.js — Thin router only.
 * All business logic lives in controllers/chat.controller.js.
 */

const express = require('express');
const router  = express.Router();
const { authMiddleware }    = require('../middleware/auth');
const { strictLimiter }     = require('../middleware/rateLimiter');
const { validateRequest } = require('../middleware/validateRequest');
const { schemas } = require('../middleware/validationSchemas');
const { chat }              = require('../controllers/chat.controller');

/** POST /api/chat — AI-powered contract Q&A */
router.post('/',
    strictLimiter,
    authMiddleware,
    validateRequest(schemas.chatMessage),
    chat
);

module.exports = router;
