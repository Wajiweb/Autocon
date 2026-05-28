'use strict';
const mongoose    = require('mongoose');
const AuditReport = require('../models/AuditReport');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

/**
 * runAudit — DEPRECATED
 *
 * Left as a 410 Gone stub.
 */
const runAudit = asyncHandler(async (req, res) => {
    throw new AppError(
        'POST /api/audit-contract has been retired. Use POST /api/jobs/create with { type: "audit", payload: { contractCode } } instead.',
        410,
        'GONE'
    );
});

/** GET /api/audit-history/:contractId */
const getAuditHistory = asyncHandler(async (req, res) => {
    const { contractId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
        throw new AppError('Invalid contract ID format.', 400, 'INVALID_ID');
    }

    const reports = await AuditReport.find({
        contractId,
        ownerAddress: req.user.walletAddress,
    })
        .sort({ createdAt: -1 })
        .select('-findings')
        .lean();

    return res.json({ success: true, reports });
});

module.exports = { runAudit, getAuditHistory };
