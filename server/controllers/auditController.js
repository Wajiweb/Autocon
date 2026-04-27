'use strict';
const mongoose    = require('mongoose');
const AuditReport = require('../models/AuditReport');

/**
 * runAudit — DEPRECATED
 *
 * This controller previously served POST /api/audit-contract.
 * It has been RETIRED in favour of the async job pipeline:
 *
 *   POST /api/jobs/create  { type: 'audit', payload: { contractCode } }
 *   GET  /api/jobs/:jobId  (polled by useJobPoller.js)
 *
 * The worker at server/workers/audit.worker.js now handles:
 *   1. Slither static analysis  (slitherService.js)
 *   2. Gemini LLM analysis      (llmService.js)
 *   3. Result aggregation       (auditAggregator.js)
 *   4. AuditReport persistence  (models/AuditReport.js)
 *   5. Job status updates       (models/Job.js)
 *
 * This function is intentionally left as a 410 Gone stub so that
 * any stale client call returns a clear, actionable error rather
 * than silently failing.
 */
async function runAudit(req, res) {
    return res.status(410).json({
        success: false,
        error:   'POST /api/audit-contract has been retired. ' +
                 'Use POST /api/jobs/create with { type: "audit", payload: { contractCode } } instead.',
    });
}

/** GET /api/audit-history/:contractId */
async function getAuditHistory(req, res) {
    try {
        const { contractId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(contractId)) {
            return res.status(400).json({ success: false, error: 'Invalid contract ID.' });
        }

        const reports = await AuditReport.find({
            contractId,
            ownerAddress: req.user.walletAddress,
        })
            .sort({ createdAt: -1 })
            .select('-findings')
            .lean();

        res.json({ success: true, reports });
    } catch (error) {
        console.error('[AuditController] getAuditHistory:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch audit history.' });
    }
}

module.exports = { runAudit, getAuditHistory };
