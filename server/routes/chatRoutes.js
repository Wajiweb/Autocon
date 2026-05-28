'use strict';

/**
 * chatRoutes.js — Thin router only.
 * All business logic lives in controllers/chat.controller.js.
 */

const express = require('express');
const router  = express.Router();
const { authMiddleware }    = require('../middleware/auth');
const { strictLimiter, aiUserMinutelyLimiter, aiUserDailyLimiter, getAiLimits } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { chat }              = require('../controllers/chat.controller');

/** GET /api/chat/limits — Get active user's AI rate limits */
router.get('/limits',
    authMiddleware,
    async (req, res) => {
        try {
            const limits = await getAiLimits(req);
            res.json({
                success: true,
                limits,
            });
        } catch (error) {
            console.error('Error fetching AI limits:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve AI limits',
            });
        }
    }
);

/** POST /api/chat — AI-powered contract Q&A */
router.post('/',
    strictLimiter,
    authMiddleware,
    aiUserMinutelyLimiter,
    aiUserDailyLimiter,
    validate(schemas.chatMessage),
    chat
);

module.exports = router;

