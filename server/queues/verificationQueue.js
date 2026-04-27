'use strict';

/**
 * verificationQueue.js
 * 
 * BullMQ Queue for Etherscan contract verification jobs.
 * 
 * Each job added to this queue follows the standard job schema:
 * {
 *   jobId:   string  — unique identifier (e.g. uuid or MongoDB ObjectId)
 *   type:    string  — always 'verification'
 *   payload: object  — { contractAddress, sourceCode, contractName, compilerVersion, network, constructorArguements? }
 *   status:  string  — 'pending' | 'processing' | 'completed' | 'failed'  (managed by worker)
 *   result:  object  — populated by the worker on success
 *   error:   string  — populated by the worker on failure
 * }
 */

const { Queue } = require('bullmq');
const connection = require('./redisConnection');

const QUEUE_NAME = 'verificationQueue';

const verificationQueue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 3,                    // Retry up to 3 times on failure
        backoff: {
            type: 'exponential',
            delay: 5000,                // Start with 5s delay, double each retry
        },
        removeOnComplete: true,
        removeOnFail:     true,
    },
});

let hasLoggedError = false;
verificationQueue.on('error', (err) => {
    if (!hasLoggedError) {
        console.error(`[VerificationQueue] Queue error: ${err.message} (Subsequent errors suppressed)`);
        hasLoggedError = true;
    }
});

/**
 * Adds a new verification job to the queue.
 * 
 * @param {object} jobData - Conforms to the standard job schema
 * @param {string} jobData.jobId     - Unique ID for tracking
 * @param {object} jobData.payload   - Etherscan verification parameters
 * @returns {Promise<Job>} The created BullMQ Job instance
 */
async function addVerificationJob(jobData) {
    const job = await verificationQueue.add(
        'verify-contract',              // Job name (for logging/filtering)
        {
            jobId:   jobData.jobId,
            type:    'verification',
            payload: jobData.payload,
            status:  'pending',
            result:  null,
            error:   null,
        },
        {
            jobId: jobData.jobId,       // Use our own ID as BullMQ's job ID for easy lookup
        }
    );
    console.log(`[VerificationQueue] Job enqueued: ${job.id}`);
    return job;
}

module.exports = { verificationQueue, addVerificationJob };
