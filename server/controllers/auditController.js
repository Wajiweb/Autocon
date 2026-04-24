'use strict';
const mongoose    = require('mongoose');
const AuditReport = require('../models/AuditReport');
const Contract    = require('../models/Contract');
const { runSlitherAnalysis } = require('../services/slitherService');
const { runLLMAnalysis } = require('../services/llmService');
const { aggregateAuditResults } = require('../utils/auditAggregator');
const { incrementAudits } = require('../services/usageService');
/** POST /api/audit-contract */
async function runAudit(req, res) {
    try {
        const { contractCode, contractAddress } = req.body;

        if (!contractCode || typeof contractCode !== 'string') {
            return res.status(400).json({ success: false, error: 'contractCode (string) is required.' });
        }

        // 1. Slither Deterministic Analysis
        const slitherFindings = await runSlitherAnalysis(contractCode);

        // 2. AI Logic Analysis
        const llmInsights = await runLLMAnalysis(contractCode, slitherFindings);

        // 3. Aggregation & Normalization
        const auditResult = aggregateAuditResults(slitherFindings, llmInsights);

        // Persist to MongoDB (non-fatal if save fails)
        let savedReportId = null;
        try {
            let contractId = null;
            if (contractAddress) {
                const contract = await Contract.findOne({
                    contractAddress: contractAddress.toLowerCase(),
                    ownerAddress: req.user.walletAddress,
                });
                contractId = contract?._id || null;
            }

            if (contractId) {
                const report = await AuditReport.create({
                    contractId,
                    contractAddress: contractAddress?.toLowerCase() || null,
                    ownerAddress: req.user.walletAddress,
                    score:         auditResult.overallRisk === 'LOW' ? 95 : auditResult.overallRisk === 'MEDIUM' ? 70 : auditResult.overallRisk === 'HIGH' ? 40 : 10,
                    riskLevel:     auditResult.overallRisk,
                    totalFindings: auditResult.vulnerabilities.length,
                    findings:      auditResult.vulnerabilities,
                    summary:       {
                        aiSummary: auditResult.aiInsights.summary,
                        recommendations: auditResult.recommendations
                    },
                    engineVersion: 'v2-hybrid',
                });
                savedReportId = report._id;
            }
        } catch (saveErr) {
            console.warn('[AuditController] Save warning:', saveErr.message);
        }

        // Track audit usage (atomic, non-fatal)
        incrementAudits(req.user.userId);

        res.json({ success: true, reportId: savedReportId, audit: auditResult });
    } catch (error) {
        console.error('[AuditController] runAudit:', error.message);
        res.status(500).json({ success: false, error: 'Failed to run security audit.' });
    }
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
