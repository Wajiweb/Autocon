'use strict';

/**
 * verification.worker.js
 *
 * BullMQ Worker that consumes jobs from verificationQueue.
 *
 * RESPONSIBILITIES:
 *  1. Pick up a 'verify-contract' job from the queue
 *  2. Mark the persisted Job document as 'processing'
 *  3. Submit source code to Etherscan V2 via axios
 *  4. Poll Etherscan until verified, timed out, or failed
 *  5. Persist final status + result in MongoDB
 *  6. Handle retries — BullMQ auto-retries according to queue defaultJobOptions
 *
 * JOB SCHEMA (from queue):
 * {
 *   jobId:   string,
 *   type:    'verification',
 *   payload: { contractAddress, sourceCode, contractName, compilerVersion, network, constructorArguements? },
 *   status:  'pending',
 *   result:  null,
 *   error:   null
 * }
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Worker } = require('bullmq');
const axios      = require('axios');
const mongoose   = require('mongoose');

const connection = require('../queues/redisConnection');
const Job        = require('../models/Job');

// ─── Etherscan Chain ID Map ───────────────────────────────────────────────────
const CHAIN_IDS = {
    'sepolia':       11155111,
    'mainnet':       1,
    'polygon amoy':  80002,
    'amoy':          80002,
    'bnb testnet':   97,
    'bnbtestnet':    97,
    'bsc testnet':   97,
};

// ─── Polling Config ───────────────────────────────────────────────────────────
const POLL_INTERVAL_MS   = 6000;   // Check Etherscan every 6s
const POLL_MAX_ATTEMPTS  = 20;     // Max 20 polls = 2 minutes timeout

// ─── Ensure DB connected (worker runs as a separate process) ──────────────────
let dbConnected = false;
async function ensureDbConnected() {
    if (dbConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    dbConnected = true;
    console.log('[VerificationWorker] MongoDB connected');
}

// ─── Core Processing Logic ────────────────────────────────────────────────────

/**
 * Submits source code to Etherscan V2 for verification.
 * @returns {string} GUID returned by Etherscan for polling
 */
async function submitToEtherscan(payload) {
    const { contractAddress, sourceCode, contractName, compilerVersion, network, constructorArguements } = payload;

    const apiKey  = process.env.ETHERSCAN_API_KEY;
    const chainId = CHAIN_IDS[network?.toLowerCase()];

    if (!chainId) throw new Error(`Unsupported network: "${network}"`);
    if (!apiKey)  throw new Error('ETHERSCAN_API_KEY not configured');

    const params = new URLSearchParams();
    params.append('apikey',          apiKey);
    params.append('module',          'contract');
    params.append('action',          'verifysourcecode');
    params.append('contractaddress', contractAddress);
    params.append('sourceCode',      sourceCode);
    params.append('codeformat',      'solidity-single-file');
    params.append('contractname',    contractName);
    params.append('compilerversion', compilerVersion);
    params.append('optimizationUsed', '1');
    params.append('runs',            '200');

    if (constructorArguements) {
        const clean = constructorArguements.startsWith('0x')
            ? constructorArguements.slice(2)
            : constructorArguements;
        params.append('constructorArguements', clean);
    }

    const apiUrl  = `https://api.etherscan.io/v2/api?chainid=${chainId}`;
    const response = await axios.post(apiUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
    });

    if (response.data.status !== '1') {
        throw new Error(response.data.result || 'Etherscan submission failed');
    }

    return response.data.result; // This is the GUID
}

/**
 * Polls Etherscan until verification passes, fails, or times out.
 * @returns {{ isVerified: boolean, status: string }}
 */
async function pollVerificationStatus(guid, network) {
    const apiKey  = process.env.ETHERSCAN_API_KEY;
    const chainId = CHAIN_IDS[network?.toLowerCase()];
    const apiUrl  = `https://api.etherscan.io/v2/api?chainid=${chainId}`;

    for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

        const response = await axios.get(apiUrl, {
            params: { apikey: apiKey, module: 'contract', action: 'checkverifystatus', guid },
            timeout: 10000,
        });

        const statusMsg = response.data.result || '';
        console.log(`[VerificationWorker] Poll ${attempt + 1}/${POLL_MAX_ATTEMPTS}: ${statusMsg}`);

        if (statusMsg.includes('Pass - Verified') || statusMsg.includes('Already Verified')) {
            return { isVerified: true, status: statusMsg };
        }
        if (!statusMsg.includes('Pending in queue')) {
            // Any non-pending, non-verified response is a failure
            throw new Error(`Verification failed: ${statusMsg}`);
        }
    }

    throw new Error(`Verification timed out after ${POLL_MAX_ATTEMPTS} polls (~${(POLL_MAX_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s)`);
}

// ─── Worker Definition ────────────────────────────────────────────────────────

async function processVerificationJob(bullJob) {
    const { jobId, payload } = bullJob.data;

    console.log(`[VerificationWorker] Processing job: ${jobId}`);

    await ensureDbConnected();

    // LIFECYCLE: pending → processing
    await Job.markProcessing(jobId);

    try {
        // Step 1: Submit to Etherscan
        console.log(`[VerificationWorker] Submitting to Etherscan (network: ${payload.network})`);
        const guid = await submitToEtherscan(payload);
        console.log(`[VerificationWorker] GUID received: ${guid}`);

        // Report progress to BullMQ (visible in monitoring tools)
        await bullJob.updateProgress(30);

        // Step 2: Poll until verified
        const { isVerified, status } = await pollVerificationStatus(guid, payload.network);
        await bullJob.updateProgress(100);

        // LIFECYCLE: processing → completed
        const result = {
            guid,
            isVerified,
            status,
            network: payload.network,
            contractAddress: payload.contractAddress,
            verifiedAt: new Date().toISOString(),
        };

        await Job.markCompleted(jobId, result);
        console.log(`[VerificationWorker] Job ${jobId} completed successfully.`);

        return result; // BullMQ stores this in job.returnvalue
    } catch (err) {
        // LIFECYCLE: processing → failed
        await Job.markFailed(jobId, err.message);
        console.error(`[VerificationWorker] Job ${jobId} failed: ${err.message}`);

        // Re-throw so BullMQ knows to handle retries
        throw err;
    }
}

function startVerificationWorker() {
    const verificationWorker = new Worker(
        'verificationQueue',
        processVerificationJob,
        {
            connection,
            concurrency: 3,              // Process up to 3 verifications in parallel
            limiter: {
                max:      5,             // Max 5 jobs per 10 seconds (Etherscan rate limit)
                duration: 10000,
            },
        }
    );

// ─── Worker Events ────────────────────────────────────────────────────────────

verificationWorker.on('completed', (job) => {
    console.log(`[VerificationWorker] ✅ Job ${job.id} completed`);
});

verificationWorker.on('failed', (job, err) => {
    const isFinalAttempt = job.attemptsMade >= job.opts.attempts;
    if (isFinalAttempt) {
        console.error(`[VerificationWorker] ❌ Job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${err.message}`);
    } else {
        console.warn(`[VerificationWorker] ⚠️  Job ${job.id} attempt ${job.attemptsMade} failed. Retrying... (${err.message})`);
    }
});

verificationWorker.on('error', (err) => {
    console.error(`[VerificationWorker] Worker error: ${err.message}`);
});

console.log('[VerificationWorker] 🚀 Worker started, listening on verificationQueue');

return verificationWorker;
}

if (require.main === module) {
    startVerificationWorker();
}

module.exports = { startVerificationWorker, processVerificationJob };
