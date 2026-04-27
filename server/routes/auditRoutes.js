'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }            = require('../middleware/auth');
const { getAuditHistory }           = require('../controllers/auditController');

/**
 * POST /api/audit-contract  — REMOVED
 *
 * The inline regex-based audit endpoint has been retired.
 * All audit submissions now go through the async job queue:
 *   POST /api/jobs/create  { type: 'audit', payload: { contractCode } }
 *
 * The worker at server/workers/audit.worker.js handles:
 *   1. Slither static analysis
 *   2. Gemini LLM analysis
 *   3. AuditReport persistence
 *   4. Job status updates (polled by frontend via GET /api/jobs/:jobId)
 */

router.get('/audit-history/:contractId', authMiddleware, getAuditHistory);

module.exports = router;
