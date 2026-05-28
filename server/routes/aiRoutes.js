'use strict';
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter, aiUserMinutelyLimiter, aiUserDailyLimiter } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { suggestConfig, explainAudit } = require('../controllers/ai.controller');

router.post('/suggest', strictLimiter, authMiddleware, aiUserMinutelyLimiter, aiUserDailyLimiter, validate(schemas.aiSuggest), suggestConfig);
router.post('/audit-explain', strictLimiter, authMiddleware, aiUserMinutelyLimiter, aiUserDailyLimiter, validate(schemas.aiAuditExplain), explainAudit);

module.exports = router;

