'use strict';

/**
 * auditQueue.js
 * 
 * BullMQ Queue for smart contract security audit jobs.
 * 
 * Each job added to this queue follows the standard job schema:
 * {
 *   jobId:   string  — unique identifier (e.g. uuid or MongoDB ObjectId)
 *   type:    string  — always 'audit'
 *   payload: object  — { contractCode, contractAddress?, ownerAddress }
 *   status:  string  — 'pending' | 'processing' | 'completed' | 'failed'  (managed by worker)
 *   result:  object  — populated by the worker on success (full audit report)
 *   error:   string  — populated by the worker on failure
 * }
 */

const { Queue } = require('bullmq');
const connection = require('./redisConnection');

const QUEUE_NAME = 'auditQueue';

const auditQueue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 2,                    // Retry once on failure (LLM may time out)
        backoff: {
            type: 'fixed',
            delay: 8000,                // Wait 8s before retry (LLM throttle)
        },
        removeOnComplete: { count: 50 },
        removeOnFail:     { count: 100 },
    },
});

auditQueue.on('error', (err) => {
    console.error(`[AuditQueue] Queue error: ${err.message}`);
});

/**
 * Adds a new audit job to the queue.
 * 
 * @param {object} jobData - Conforms to the standard job schema
 * @param {string} jobData.jobId       - Unique ID for tracking
 * @param {object} jobData.payload     - { contractCode, contractAddress?, ownerAddress }
 * @returns {Promise<Job>} The created BullMQ Job instance
 */
async function addAuditJob(jobData) {
    const job = await auditQueue.add(
        'run-security-audit',           // Job name
        {
            jobId:   jobData.jobId,
            type:    'audit',
            payload: jobData.payload,
            status:  'pending',
            result:  null,
            error:   null,
        },
        {
            jobId: jobData.jobId,       // Use our own ID as BullMQ's job ID for easy lookup
        }
    );
    console.log(`[AuditQueue] Job enqueued: ${job.id}`);
    return job;
}

module.exports = { auditQueue, addAuditJob };
