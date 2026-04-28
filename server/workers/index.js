'use strict';

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

const verificationWorker = startVerificationWorker();
const auditWorker        = startAuditWorker();

console.log('═══════════════════════════════════════════════════');
console.log('  AutoCon Worker Process Started');
console.log('  • verificationWorker  → verificationQueue');
console.log('  • auditWorker         → auditQueue');
console.log('═══════════════════════════════════════════════════');

// Graceful shutdown — close workers cleanly on SIGTERM/SIGINT
async function gracefulShutdown(signal) {
    console.log(`\n[Workers] Received ${signal}. Closing workers gracefully...`);
    await Promise.all([
        verificationWorker.close(),
        auditWorker.close(),
    ]);
    console.log('[Workers] All workers closed. Exiting.');
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

module.exports = { verificationWorker, auditWorker };
