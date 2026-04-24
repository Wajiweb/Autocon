'use strict';

/**
 * jobHelpers.js
 * 
 * Utilities for creating and validating job IDs and payloads.
 * Keeps job schema consistent across all queues.
 */

const crypto = require('crypto');

/**
 * Generates a unique job ID.
 * Format: <type>_<timestamp>_<random8hex>
 * Example: verification_1714000000000_a3f7c1d9
 * 
 * @param {string} type - Job type ('verification' | 'audit')
 * @returns {string}
 */
function generateJobId(type) {
    const timestamp = Date.now();
    const random    = crypto.randomBytes(4).toString('hex');
    return `${type}_${timestamp}_${random}`;
}

/**
 * Builds a standard verification job payload.
 * 
 * @param {object} params
 * @param {string} params.contractAddress
 * @param {string} params.sourceCode
 * @param {string} params.contractName
 * @param {string} params.compilerVersion
 * @param {string} params.network
 * @param {string} [params.constructorArguements]
 * @returns {{ jobId: string, payload: object }}
 */
function buildVerificationJob(params) {
    return {
        jobId: generateJobId('verification'),
        payload: {
            contractAddress:      params.contractAddress,
            sourceCode:           params.sourceCode,
            contractName:         params.contractName,
            compilerVersion:      params.compilerVersion,
            network:              params.network,
            constructorArguements: params.constructorArguements || null,
        },
    };
}

/**
 * Builds a standard audit job payload.
 * 
 * @param {object} params
 * @param {string} params.contractCode
 * @param {string} params.ownerAddress
 * @param {string} [params.contractAddress]
 * @returns {{ jobId: string, payload: object }}
 */
function buildAuditJob(params) {
    return {
        jobId: generateJobId('audit'),
        payload: {
            contractCode:    params.contractCode,
            ownerAddress:    params.ownerAddress,
            contractAddress: params.contractAddress || null,
        },
    };
}

module.exports = { generateJobId, buildVerificationJob, buildAuditJob };
