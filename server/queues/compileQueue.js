'use strict';

/**
 * compileQueue.js
 * 
 * BullMQ Queue for smart contract compilation jobs.
 */

const { Queue } = require('bullmq');
const connection = require('./redisConnection');

const QUEUE_NAME = 'compileQueue';

const compileQueue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 1,                    // No retry needed for compilation (deterministic code)
        removeOnComplete: {
            count: 100,             // Keep last 100 completed jobs in Redis
            age: 24 * 3600,         // ...or keep up to 24 hours
        },
        removeOnFail: {
            count: 500,             // Keep last 500 failed jobs for debugging
            age: 7 * 24 * 3600,     // ...or keep up to 7 days
        },
    },
});

let hasLoggedError = false;
compileQueue.on('error', (err) => {
    if (!hasLoggedError) {
        console.error(`[CompileQueue] Queue error: ${err.message} (Subsequent errors suppressed)`);
        hasLoggedError = true;
    }
});

/**
 * Adds a new compile job to the queue.
 * 
 * @param {object} jobData - Conforms to the standard job schema
 * @param {string} jobData.jobId       - Unique ID for tracking
 * @param {object} jobData.payload     - { sourceCode, contractName, ownerAddress }
 * @returns {Promise<Job>} The created BullMQ Job instance
 */
async function addCompileJob(jobData) {
    const job = await compileQueue.add(
        'run-contract-compile',           // Job name
        {
            jobId:   jobData.jobId,
            type:    'compile',
            payload: jobData.payload,
            status:  'pending',
            result:  null,
            error:   null,
        },
        {
            jobId: jobData.jobId,       // Use our own ID as BullMQ's job ID for easy lookup
        }
    );
    console.log(`[CompileQueue] Job enqueued: ${job.id}`);
    return job;
}

module.exports = { compileQueue, addCompileJob };
