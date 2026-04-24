'use strict';

/**
 * audit.worker.js
 *
 * BullMQ Worker that consumes jobs from auditQueue.
 *
 * RESPONSIBILITIES:
 *  1. Pick up a 'run-security-audit' job from the queue
 *  2. Mark the persisted Job document as 'processing'
 *  3. Run Slither static analysis (deterministic)
 *  4. Run Gemini LLM analysis (AI insights)
 *  5. Aggregate both results into a unified report
 *  6. Persist AuditReport to MongoDB
 *  7. Mark Job as 'completed' with the full audit result
 *  8. On any failure, mark Job as 'failed' and re-throw for BullMQ retry
 *
 * JOB SCHEMA (from queue):
 * {
 *   jobId:   string,
 *   type:    'audit',
 *   payload: { contractCode, ownerAddress, contractAddress? },
 *   status:  'pending',
 *   result:  null,
 *   error:   null
 * }
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Worker }  = require('bullmq');
const mongoose    = require('mongoose');

const connection            = require('../queues/redisConnection');
const Job                   = require('../models/Job');
const AuditReport           = require('../models/AuditReport');
const Contract              = require('../models/Contract');
const { runSlitherAnalysis }  = require('../services/slitherService');
const { runLLMAnalysis }      = require('../services/llmService');
const { aggregateAuditResults } = require('../utils/auditAggregator');

// ─── DB Connection ─────────────────────────────────────────────────────────────
let dbConnected = false;
async function ensureDbConnected() {
    if (dbConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    dbConnected = true;
    console.log('[AuditWorker] MongoDB connected');
}

// ─── Score Calculator ─────────────────────────────────────────────────────────
function calculateScore(riskLevel) {
    const scores = { LOW: 95, MEDIUM: 70, HIGH: 40, CRITICAL: 10 };
    return scores[riskLevel] ?? 50;
}

// ─── Persist AuditReport to MongoDB ──────────────────────────────────────────
async function persistAuditReport(auditResult, payload) {
    const { contractCode, contractAddress, ownerAddress } = payload;

    try {
        // Try to find the parent contract document for the FK relationship
        let contractId = null;
        if (contractAddress) {
            const contract = await Contract.findOne({
                contractAddress: contractAddress.toLowerCase(),
                ownerAddress:    ownerAddress.toLowerCase(),
            }).select('_id').lean();
            contractId = contract?._id || null;
        }

        // contractId is required by the schema — skip persisting if we don't have it
        if (!contractId) {
            console.warn('[AuditWorker] No matching Contract document found — skipping AuditReport save.');
            return null;
        }

        const report = await AuditReport.create({
            contractId,
            contractAddress:  contractAddress?.toLowerCase() || null,
            ownerAddress:     ownerAddress.toLowerCase(),
            score:            calculateScore(auditResult.overallRisk),
            riskLevel:        auditResult.overallRisk,
            totalFindings:    auditResult.vulnerabilities.length,
            findings:         auditResult.vulnerabilities.map(v => ({
                ruleId:      v.id     || v.ruleId || 'UNKNOWN',
                title:       v.title,
                severity:    v.severity,
                description: v.description,
                advice:      v.advice || null,
                line:        v.line   || null,
                code:        v.code   || null,
            })),
            summary: {
                aiSummary:       auditResult.aiInsights.summary,
                recommendations: auditResult.recommendations,
            },
            engineVersion: 'v2-async-bullmq',
        });

        console.log(`[AuditWorker] AuditReport saved: ${report._id}`);
        return report._id;
    } catch (err) {
        // Non-fatal: log warning but don't fail the job just because the report couldn't save
        console.warn(`[AuditWorker] Failed to persist AuditReport: ${err.message}`);
        return null;
    }
}

// ─── Worker Definition ────────────────────────────────────────────────────────

const auditWorker = new Worker(
    'auditQueue',

    async (bullJob) => {
        const { jobId, payload } = bullJob.data;
        const { contractCode, ownerAddress, contractAddress } = payload;

        console.log(`[AuditWorker] Processing job: ${jobId}`);

        await ensureDbConnected();

        // LIFECYCLE: pending → processing
        await Job.markProcessing(jobId);

        try {
            // ── STEP 1: Slither Static Analysis ─────────────────────────────
            console.log(`[AuditWorker] Running Slither analysis...`);
            const slitherFindings = await runSlitherAnalysis(contractCode);
            await bullJob.updateProgress(35);
            console.log(`[AuditWorker] Slither complete. Findings: ${slitherFindings.length}`);

            // ── STEP 2: Gemini LLM Analysis ──────────────────────────────────
            console.log(`[AuditWorker] Running LLM analysis...`);
            const llmInsights = await runLLMAnalysis(contractCode, slitherFindings);
            await bullJob.updateProgress(75);
            console.log(`[AuditWorker] LLM complete.`);

            // ── STEP 3: Aggregate Results ─────────────────────────────────────
            const auditResult = aggregateAuditResults(slitherFindings, llmInsights);
            await bullJob.updateProgress(85);

            // ── STEP 4: Persist AuditReport ───────────────────────────────────
            const reportId = await persistAuditReport(auditResult, payload);
            await bullJob.updateProgress(100);

            // ── STEP 5: Mark Job Completed ────────────────────────────────────
            const result = {
                reportId:         reportId?.toString() || null,
                overallRisk:      auditResult.overallRisk,
                score:            calculateScore(auditResult.overallRisk),
                totalFindings:    auditResult.vulnerabilities.length,
                vulnerabilities:  auditResult.vulnerabilities,
                aiInsights:       auditResult.aiInsights,
                recommendations:  auditResult.recommendations,
                completedAt:      new Date().toISOString(),
            };

            // LIFECYCLE: processing → completed
            await Job.markCompleted(jobId, result);
            console.log(`[AuditWorker] Job ${jobId} completed. Risk: ${auditResult.overallRisk}`);

            return result;
        } catch (err) {
            // LIFECYCLE: processing → failed
            await Job.markFailed(jobId, err.message);
            console.error(`[AuditWorker] Job ${jobId} failed: ${err.message}`);

            // Re-throw for BullMQ to handle retries
            throw err;
        }
    },

    {
        connection,
        concurrency: 2,               // Max 2 concurrent audits (LLM is expensive)
        limiter: {
            max:      4,              // Max 4 audits per 30 seconds (Gemini rate limit)
            duration: 30000,
        },
    }
);

// ─── Worker Events ────────────────────────────────────────────────────────────

auditWorker.on('completed', (job) => {
    console.log(`[AuditWorker] ✅ Job ${job.id} completed. Risk: ${job.returnvalue?.overallRisk}`);
});

auditWorker.on('failed', (job, err) => {
    const isFinalAttempt = job.attemptsMade >= job.opts.attempts;
    if (isFinalAttempt) {
        console.error(`[AuditWorker] ❌ Job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${err.message}`);
    } else {
        console.warn(`[AuditWorker] ⚠️  Job ${job.id} attempt ${job.attemptsMade} failed. Retrying... (${err.message})`);
    }
});

auditWorker.on('error', (err) => {
    console.error(`[AuditWorker] Worker error: ${err.message}`);
});

console.log('[AuditWorker] 🚀 Worker started, listening on auditQueue');

module.exports = auditWorker;
