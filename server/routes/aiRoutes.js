'use strict';
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { suggestConfig, explainAudit } = require('../controllers/ai.controller');

router.post('/suggest', strictLimiter, authMiddleware, validate(schemas.aiSuggest), suggestConfig);
router.post('/audit-explain', strictLimiter, authMiddleware, validate(schemas.aiAuditExplain), explainAudit);

module.exports = router;
