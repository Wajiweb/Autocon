'use strict';

/**
 * jobController.js
 *
 * Handles:
 *  - POST /api/jobs/create   — Enqueue a verification or audit job
 *  - GET  /api/jobs/:jobId   — Poll a specific job's status
 *  - GET  /api/jobs          — List all jobs for the authenticated user (paginated)
 *  - GET  /api/jobs/stats    — Aggregated stats per type/status (dashboard widget)
 */

const Job         = require('../models/Job');
const { buildVerificationJob, buildAuditJob, buildCompileJob } = require('../queues/jobHelpers');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ─── Failure Logger ───────────────────────────────────────────────────────────
function logJobFailure(context, jobId, reason, attempt) {
    logger.error(`Job failure in context: ${context}`, {
        jobContext: context,
        jobId,
        reason,
        attempt,
    });
}

const shouldRunInlineJobs = () => (
    process.env.USE_IN_MEMORY_QUEUE === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.USE_IN_MEMORY_QUEUE !== 'false')
);

const runInlineJob = (type, jobData) => {
    const mockBullJob = { data: jobData, updateProgress: async () => {} };

    if (type === 'verification') {
        const { processVerificationJob } = require('../workers/verification.worker');
        processVerificationJob(mockBullJob).catch(err => logger.error('[InlineWorker] Verification failed', { error: err.message }));
        return;
    }

    if (type === 'audit') {
        const { processAuditJob } = require('../workers/audit.worker');
        processAuditJob(mockBullJob).catch(err => logger.error('[InlineWorker] Audit failed', { error: err.message }));
        return;
    }

    if (type === 'compile') {
        const { processCompileJob } = require('../workers/compile.worker');
        processCompileJob(mockBullJob).catch(err => logger.error('[InlineWorker] Compile failed', { error: err.message }));
        return;
    }
};

// ─── POST /api/jobs/create ────────────────────────────────────────────────────

/**
 * Creates and enqueues a new background job.
 *
 * Body:
 *   type: 'verification' | 'audit'
 *   payload: { ...type-specific fields }
 *
 * Response (202 Accepted — non-blocking):
 *   { success: true, jobId, status: 'pending', message }
 */
const createJob = asyncHandler(async (req, res) => {
    const { type, payload } = req.body;
    const ownerAddress = req.user.walletAddress;

    if (!type || !payload) {
        throw new AppError('`type` and `payload` are required.', 400, 'BAD_REQUEST');
    }
    if (!['verification', 'audit', 'compile'].includes(type)) {
        throw new AppError('`type` must be "verification", "audit", or "compile".', 400, 'BAD_REQUEST');
    }

    let jobData;
    const USE_IN_MEMORY_QUEUE = shouldRunInlineJobs();

    if (type === 'verification') {
        const { contractAddress, sourceCode, contractName, compilerVersion, network } = payload;
        if (!contractAddress || !sourceCode || !contractName || !compilerVersion || !network) {
            throw new AppError('Verification requires: contractAddress, sourceCode, contractName, compilerVersion, network.', 400, 'BAD_REQUEST');
        }
        jobData = buildVerificationJob({ ...payload, ownerAddress });

        // Persist Job document BEFORE enqueuing so status is immediately pollable
        await Job.create({
            jobId:        jobData.jobId,
            type:         'verification',
            ownerAddress,
            status:       'pending',
            payload:      jobData.payload,
            maxAttempts:  3,
        });

        // Enqueue into Redis/BullMQ or run inline
        if (USE_IN_MEMORY_QUEUE) {
            runInlineJob('verification', jobData);
        } else {
            try {
                const { addVerificationJob } = require('../queues');
                await addVerificationJob(jobData);
            } catch (enqueueErr) {
                await Job.markFailed(jobData.jobId, `Enqueuing failed: ${enqueueErr.message}`);
                throw new AppError(`Failed to enqueue verification job: ${enqueueErr.message}`, 500, 'QUEUE_ERROR');
            }
        }

    } else if (type === 'audit') {
        const { contractCode } = payload;
        if (!contractCode) {
            throw new AppError('Audit requires: contractCode.', 400, 'BAD_REQUEST');
        }
        jobData = buildAuditJob({ ...payload, ownerAddress });

        await Job.create({
            jobId:        jobData.jobId,
            type:         'audit',
            ownerAddress,
            status:       'pending',
            payload:      jobData.payload,
            maxAttempts:  2,
        });

        if (USE_IN_MEMORY_QUEUE) {
            runInlineJob('audit', jobData);
        } else {
            try {
                const { addAuditJob } = require('../queues');
                await addAuditJob(jobData);
            } catch (enqueueErr) {
                await Job.markFailed(jobData.jobId, `Enqueuing failed: ${enqueueErr.message}`);
                throw new AppError(`Failed to enqueue audit job: ${enqueueErr.message}`, 500, 'QUEUE_ERROR');
            }
        }
    } else if (type === 'compile') {
        const { sourceCode, contractName } = payload;
        if (!sourceCode || !contractName) {
            throw new AppError('Compilation requires: sourceCode and contractName.', 400, 'BAD_REQUEST');
        }
        jobData = buildCompileJob({ ...payload, ownerAddress });

        await Job.create({
            jobId:        jobData.jobId,
            type:         'compile',
            ownerAddress,
            status:       'pending',
            payload:      jobData.payload,
            maxAttempts:  1,
        });

        if (USE_IN_MEMORY_QUEUE) {
            runInlineJob('compile', jobData);
        } else {
            try {
                const { addCompileJob } = require('../queues');
                await addCompileJob(jobData);
            } catch (enqueueErr) {
                await Job.markFailed(jobData.jobId, `Enqueuing failed: ${enqueueErr.message}`);
                throw new AppError(`Failed to enqueue compile job: ${enqueueErr.message}`, 500, 'QUEUE_ERROR');
            }
        }
    }

    // 202 Accepted — work is queued but not yet done
    return res.status(202).json({
        success: true,
        jobId:   jobData.jobId,
        type,
        status:  'pending',
        message: `${type} job queued successfully. Poll /api/jobs/${jobData.jobId} for status.`,
    });
});

// ─── GET /api/jobs/:jobId ──────────────────────────────────────────────────────

/**
 * Returns the current status + result/error for a single job.
 * Used by the frontend to poll progress.
 */
const getJobStatus = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const ownerAddress = req.user.walletAddress;

    const job = await Job.findOne({ jobId, ownerAddress })
        .select('jobId type status attempts maxAttempts result error startedAt completedAt createdAt')
        .lean();

    if (!job) {
        throw new AppError('Job not found.', 404, 'NOT_FOUND');
    }

    // Compute processing duration if job has started
    let durationMs = null;
    if (job.startedAt && job.completedAt) {
        durationMs = new Date(job.completedAt) - new Date(job.startedAt);
    }

    return res.json({
        success: true,
        job: { ...job, durationMs },
    });
});

// ─── GET /api/jobs ─────────────────────────────────────────────────────────────

/**
 * Lists jobs for the authenticated user with pagination and optional filters.
 */
const listJobs = asyncHandler(async (req, res) => {
    const ownerAddress = req.user.walletAddress;

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    const filter = { ownerAddress };
    if (['verification', 'audit', 'compile'].includes(req.query.type))   filter.type   = req.query.type;
    if (['pending','processing','completed','failed'].includes(req.query.status)) filter.status = req.query.status;

    try {
        const [result] = await Job.aggregate([
            { $match: filter },
            {
                $facet: {
                    totalCount: [{ $count: 'count' }],
                    jobs: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id:         0,
                                jobId:       1,
                                type:        1,
                                status:      1,
                                attempts:    1,
                                maxAttempts: 1,
                                error:       1,
                                createdAt:   1,
                                startedAt:   1,
                                completedAt: 1,
                                resultSummary: {
                                    $cond: {
                                        if:   { $eq: ['$status', 'completed'] },
                                        then: {
                                            overallRisk:   '$result.overallRisk',
                                            totalFindings: '$result.totalFindings',
                                            isVerified:    '$result.isVerified',
                                            reportId:      '$result.reportId',
                                        },
                                        else: null
                                    }
                                }
                            }
                        }
                    ],
                }
            }
        ]);

        const total = result.totalCount[0]?.count || 0;

        return res.json({
            success: true,
            jobs:    result.jobs || [],
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        logJobFailure('listJobs', null, err.message, 0);
        // Return empty result instead of failing to prevent dashboard UI breakage
        return res.json({
            success: true,
            jobs: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        });
    }
});

// ─── GET /api/jobs/stats ───────────────────────────────────────────────────────

/**
 * Returns aggregated job statistics per type and status.
 */
const getJobStats = asyncHandler(async (req, res) => {
    const ownerAddress = req.user.walletAddress;

    try {
        const pipeline = [
            { $match: { ownerAddress } },
            {
                $group: {
                    _id:   { type: '$type', status: '$status' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id:    '$_id.type',
                    counts: {
                        $push: { status: '$_id.status', count: '$count' }
                    }
                }
            }
        ];

        const raw = await Job.aggregate(pipeline);

        const defaultCounts = { pending: 0, processing: 0, completed: 0, failed: 0 };
        const stats = { verification: { ...defaultCounts }, audit: { ...defaultCounts }, compile: { ...defaultCounts } };

        for (const row of raw) {
            const type = row._id;
            if (!stats[type]) continue;
            for (const { status, count } of row.counts) {
                stats[type][status] = count;
            }
        }

        return res.json({ success: true, stats });
    } catch (err) {
        logJobFailure('getJobStats', null, err.message, 0);
        return res.json({
            success: true,
            stats: {
                verification: { pending: 0, processing: 0, completed: 0, failed: 0 },
                audit: { pending: 0, processing: 0, completed: 0, failed: 0 }
            }
        });
    }
});

async function enqueueCompileJobHelper(sourceCode, contractName, ownerAddress) {
    const jobData = buildCompileJob({ sourceCode, contractName, ownerAddress });

    await Job.create({
        jobId:        jobData.jobId,
        type:         'compile',
        ownerAddress,
        status:       'pending',
        payload:      jobData.payload,
        maxAttempts:  1,
    });

    const USE_IN_MEMORY_QUEUE = shouldRunInlineJobs();
    if (USE_IN_MEMORY_QUEUE) {
        runInlineJob('compile', jobData);
    } else {
        try {
            const { addCompileJob } = require('../queues');
            await addCompileJob(jobData);
        } catch (enqueueErr) {
            await Job.markFailed(jobData.jobId, `Enqueuing failed: ${enqueueErr.message}`);
            throw new AppError(`Failed to enqueue compile job: ${enqueueErr.message}`, 500, 'QUEUE_ERROR');
        }
    }

    return jobData.jobId;
}

module.exports = { createJob, getJobStatus, listJobs, getJobStats, enqueueCompileJobHelper };
