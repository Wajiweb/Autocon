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
const { buildVerificationJob, buildAuditJob } = require('../queues/jobHelpers');

// ─── Failure Logger ───────────────────────────────────────────────────────────
// Centralized failure logger — writes structured log entries so all failures
// are visible in one place (can be wired to external loggers like Winston later).
function logJobFailure(context, jobId, reason, attempt) {
    console.error(
        JSON.stringify({
            level:     'ERROR',
            timestamp: new Date().toISOString(),
            context,
            jobId,
            reason,
            attempt,
        })
    );
}

const shouldRunInlineJobs = () => (
    process.env.USE_IN_MEMORY_QUEUE === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.USE_IN_MEMORY_QUEUE !== 'false')
);

const runInlineJob = (type, jobData) => {
    const mockBullJob = { data: jobData, updateProgress: async () => {} };

    if (type === 'verification') {
        const { processVerificationJob } = require('../workers/verification.worker');
        processVerificationJob(mockBullJob).catch(err => console.error('[InlineWorker]', err));
        return;
    }

    const { processAuditJob } = require('../workers/audit.worker');
    processAuditJob(mockBullJob).catch(err => console.error('[InlineWorker]', err));
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
async function createJob(req, res) {
    const { type, payload } = req.body;
    const ownerAddress = req.user.walletAddress;

    if (!type || !payload) {
        return res.status(400).json({ success: false, error: '`type` and `payload` are required.' });
    }
    if (!['verification', 'audit'].includes(type)) {
        return res.status(400).json({ success: false, error: '`type` must be "verification" or "audit".' });
    }

    try {
        let jobData;
        const USE_IN_MEMORY_QUEUE = shouldRunInlineJobs();

        if (type === 'verification') {
            const { contractAddress, sourceCode, contractName, compilerVersion, network } = payload;
            if (!contractAddress || !sourceCode || !contractName || !compilerVersion || !network) {
                return res.status(400).json({
                    success: false,
                    error: 'Verification requires: contractAddress, sourceCode, contractName, compilerVersion, network.'
                });
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
                const { addVerificationJob } = require('../queues');
                await addVerificationJob(jobData);
            }

        } else if (type === 'audit') {
            const { contractCode } = payload;
            if (!contractCode) {
                return res.status(400).json({ success: false, error: 'Audit requires: contractCode.' });
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
                const { addAuditJob } = require('../queues');
                await addAuditJob(jobData);
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

    } catch (err) {
        logJobFailure('createJob', null, err.message, 0);
        return res.status(500).json({ success: false, error: 'Failed to enqueue job.' });
    }
}

// ─── GET /api/jobs/:jobId ──────────────────────────────────────────────────────

/**
 * Returns the current status + result/error for a single job.
 * Used by the frontend to poll progress.
 *
 * Response:
 *   { success, job: { jobId, type, status, attempts, result, error, startedAt, completedAt } }
 */
async function getJobStatus(req, res) {
    const { jobId } = req.params;
    const ownerAddress = req.user.walletAddress;

    try {
        const job = await Job.findOne({ jobId, ownerAddress })
            .select('jobId type status attempts maxAttempts result error startedAt completedAt createdAt')
            .lean();

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found.' });
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

    } catch (err) {
        logJobFailure('getJobStatus', jobId, err.message, 0);
        return res.status(500).json({ success: false, error: 'Failed to fetch job status.' });
    }
}

// ─── GET /api/jobs ─────────────────────────────────────────────────────────────

/**
 * Lists jobs for the authenticated user with pagination and optional filters.
 *
 * Query params:
 *   page    (default: 1)
 *   limit   (default: 10, max: 50)
 *   type    ('verification' | 'audit')
 *   status  ('pending' | 'processing' | 'completed' | 'failed')
 *
 * Response:
 *   { success, jobs: [...], pagination: { page, limit, total, pages } }
 */
async function listJobs(req, res) {
    const ownerAddress = req.user.walletAddress;

    // ── Pagination ──────────────────────────────────────────────────────────────
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    // ── Filters ─────────────────────────────────────────────────────────────────
    const filter = { ownerAddress };
    if (['verification', 'audit'].includes(req.query.type))   filter.type   = req.query.type;
    if (['pending','processing','completed','failed'].includes(req.query.status)) filter.status = req.query.status;

    try {
        // Run count + data query in parallel using aggregation pipeline for efficiency
        const [result] = await Job.aggregate([
            { $match: filter },
            {
                $facet: {
                    // Total count (for pagination metadata)
                    totalCount: [{ $count: 'count' }],

                    // Paginated data — only fields needed by the frontend
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
                                // Expose result summary (not full payload to keep response lean)
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
            jobs:    result.jobs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });

    } catch (err) {
        logJobFailure('listJobs', null, err.message, 0);
        return res.status(500).json({ success: false, error: 'Failed to list jobs.' });
    }
}

// ─── GET /api/jobs/stats ───────────────────────────────────────────────────────

/**
 * Returns aggregated job statistics per type and status.
 * Used by the dashboard to show a summary widget.
 *
 * Response:
 *   { success, stats: { verification: { pending, processing, completed, failed }, audit: {...} } }
 */
async function getJobStats(req, res) {
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

        // Reshape into { verification: { pending: 0, ... }, audit: { ... } }
        const defaultCounts = { pending: 0, processing: 0, completed: 0, failed: 0 };
        const stats = { verification: { ...defaultCounts }, audit: { ...defaultCounts } };

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
        return res.status(500).json({ success: false, error: 'Failed to fetch job stats.' });
    }
}

module.exports = { createJob, getJobStatus, listJobs, getJobStats };
