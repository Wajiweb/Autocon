'use strict';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('../config/envValidation'); // Runs env and JWT_SECRET validation at worker boot

/**
 * workers/index.js — Worker Bootstrap
 *
 * Imports and starts both workers.
 * Run this file as a SEPARATE Node.js process from the Express API:
 *
 *   node server/workers/index.js
 *
 * Or add to package.json scripts:
 *   "worker": "node workers/index.js"
 *
 * Workers are fully independent from the API — they only share Redis (queue)
 * and MongoDB (Job model persistence).
 */

const { startVerificationWorker } = require('./verification.worker');
const { startAuditWorker }        = require('./audit.worker');
const { startCompileWorker }      = require('./compile.worker');

const verificationWorker = startVerificationWorker();
const auditWorker        = startAuditWorker();
const compileWorker      = startCompileWorker();

console.log('═══════════════════════════════════════════════════');
console.log('  AutoCon Worker Process Started');
console.log('  • verificationWorker  → verificationQueue');
console.log('  • auditWorker         → auditQueue');
console.log('  • compileWorker       → compileQueue');
console.log('═══════════════════════════════════════════════════');

// Graceful shutdown — close workers cleanly on SIGTERM/SIGINT
async function gracefulShutdown(signal) {
    console.log(`\n[Workers] Received ${signal}. Closing workers gracefully...`);
    try {
        await Promise.all([
            verificationWorker.close(),
            auditWorker.close(),
            compileWorker.close(),
        ]);
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('[Workers] MongoDB connection closed.');
        }
        const redisConn = require('../queues/redisConnection');
        await redisConn.quit();
        console.log('[Workers] Redis connection closed.');
    } catch (err) {
        console.error('[Workers] Error during graceful shutdown:', err.message);
    }
    console.log('[Workers] Shutdown complete. Exiting.');
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

module.exports = { verificationWorker, auditWorker, compileWorker };
