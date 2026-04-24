'use strict';

/**
 * index.js — Queue Registry
 * 
 * Central export for all BullMQ queues.
 * Import from here to avoid circular dependencies when
 * routes or controllers need to enqueue jobs.
 * 
 * Usage:
 *   const { addVerificationJob } = require('../queues');
 *   const { addAuditJob }        = require('../queues');
 */

const { verificationQueue, addVerificationJob } = require('./verificationQueue');
const { auditQueue,        addAuditJob }        = require('./auditQueue');

module.exports = {
    // Queue instances (for advanced usage, e.g. draining in tests)
    verificationQueue,
    auditQueue,

    // Enqueue helpers (primary API for routes/controllers)
    addVerificationJob,
    addAuditJob,
};
