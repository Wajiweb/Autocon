'use strict';

/**
 * compile.worker.js
 *
 * BullMQ Worker that consumes jobs from compileQueue.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('../config/envValidation'); // Runs startup variable and JWT entropy checks

const { Worker }  = require('bullmq');
const mongoose    = require('mongoose');

const connection                    = require('../queues/redisConnection');
const Job                           = require('../models/Job');
const logger                        = require('../utils/logger');

// Redirect console logs to central structured logger
const console = {
    log: (msg, ...args) => logger.info(msg, args.length ? { extra: args } : {}),
    warn: (msg, ...args) => logger.warn(msg, args.length ? { extra: args } : {}),
    error: (msg, ...args) => logger.error(msg, args.length ? { extra: args } : {})
};
const { compileContractAsync }      = require('../services/compilerService');

// ─── DB Connection ─────────────────────────────────────────────────────────────
let dbConnected = false;
async function ensureDbConnected() {
    if (dbConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    dbConnected = true;
    console.log('[CompileWorker] MongoDB connected');
}

// ─── Job Processor ────────────────────────────────────────────────────────────
async function processCompileJob(bullJob) {
    const { jobId, payload } = bullJob.data;
    const { sourceCode, contractName } = payload;

    console.log(`[CompileWorker] Processing job: ${jobId}`);

    await ensureDbConnected();

    // LIFECYCLE: pending → processing
    await Job.markProcessing(jobId);

    try {
        console.log(`[CompileWorker] Compiling contract "${contractName}"...`);
        
        // Execute Solidity compile. includeAST is true for custom review features
        const compilation = await compileContractAsync(sourceCode, 'CustomContract.sol', contractName, true);
        
        await bullJob.updateProgress(100);

        const result = {
            abi:             compilation.abi,
            bytecode:        compilation.bytecode,
            ast:             compilation.ast,
            compilerVersion: compilation.compilerVersion,
            contractName,
            sourceCode,
            completedAt:     new Date().toISOString(),
        };

        // LIFECYCLE: processing → completed
        await Job.markCompleted(jobId, result);
        console.log(`[CompileWorker] Job ${jobId} completed successfully.`);

        return result;
    } catch (err) {
        // LIFECYCLE: processing → failed
        await Job.markFailed(jobId, err.message);
        console.error(`[CompileWorker] Job ${jobId} failed: ${err.message}`);

        // Re-throw for BullMQ
        throw err;
    }
}

// ─── Worker Instance ──────────────────────────────────────────────────────────
function startCompileWorker() {
    const compileWorker = new Worker(
        'compileQueue',
        processCompileJob,
        {
            connection,
            concurrency: 3,          // Solidity compilation is local & CPU bound, concurrency of 3 is safe
        }
    );

    // ─── Worker Events ────────────────────────────────────────────────────────────
    compileWorker.on('completed', (job) => {
        console.log(`[CompileWorker] ✅ Job ${job.id} completed.`);
    });

    compileWorker.on('failed', (job, err) => {
        const isFinalAttempt = job.attemptsMade >= job.opts.attempts;
        if (isFinalAttempt) {
            console.error(`[CompileWorker] ❌ Job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${err.message}`);
        } else {
            console.warn(`[CompileWorker] ⚠️  Job ${job.id} attempt ${job.attemptsMade} failed. Retrying... (${err.message})`);
        }
    });

    compileWorker.on('error', (err) => {
        console.error(`[CompileWorker] Worker error: ${err.message}`);
    });

    console.log('[CompileWorker] 🚀 Worker started, listening on compileQueue');

    return compileWorker;
}

if (require.main === module) {
    startCompileWorker();
}

module.exports = { startCompileWorker, processCompileJob };
