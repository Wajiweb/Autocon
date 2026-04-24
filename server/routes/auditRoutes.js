'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }              = require('../middleware/auth');
const { runAudit, getAuditHistory }   = require('../controllers/auditController');

router.post('/audit-contract',              authMiddleware, runAudit);
router.get ('/audit-history/:contractId',   authMiddleware, getAuditHistory);

module.exports = router;
