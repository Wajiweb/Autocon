'use strict';

/**
 * auditService.js — ⚠️  DEPRECATED — DO NOT USE
 *
 * This service previously provided regex-based static analysis for the
 * POST /api/audit-contract endpoint (now retired).
 *
 * All audit logic has been migrated to the async BullMQ pipeline:
 *   - Queue:   server/queues/auditQueue.js
 *   - Worker:  server/workers/audit.worker.js
 *   - Engine:  server/services/slitherService.js  (deterministic AST)
 *              server/services/llmService.js       (Gemini AI)
 *              server/utils/auditAggregator.js     (merge + risk scoring)
 *
 * Frontend triggers via:
 *   POST /api/jobs/create { type: 'audit', payload: { contractCode } }
 *   GET  /api/jobs/:jobId  (polled by useJobPoller.js)
 *
 * This file is intentionally preserved (not deleted) to avoid breaking
 * any stale require() call, but its exports are no longer invoked.
 */

/**
 * Static analysis rules for Solidity contracts.
 * Each rule describes a known vulnerability pattern.
 */
const AUDIT_RULES = [
    {
        id: 'REENTRANCY', title: 'Potential Reentrancy Vulnerability', severity: 'CRITICAL',
        description: 'External calls (call, send, transfer) found before state changes. An attacker could re-enter the function before state is updated.',
        pattern: /\.call\{value:|\\.call\.value\(/gi,
        advice: 'Use the Checks-Effects-Interactions pattern. Update state before making external calls, or use ReentrancyGuard.',
    },
    {
        id: 'TX_ORIGIN', title: 'Unsafe tx.origin Usage', severity: 'HIGH',
        description: 'Using tx.origin for authorization is vulnerable to phishing attacks.',
        pattern: /tx\.origin/gi,
        advice: 'Replace tx.origin with msg.sender for access control checks.',
    },
    {
        id: 'FLOATING_PRAGMA', title: 'Floating Pragma Version', severity: 'MEDIUM',
        description: 'The contract uses a floating pragma (e.g., ^0.8.x). It can compile with different versions.',
        pattern: /pragma solidity \^/gi,
        advice: 'Lock the pragma to a specific version (e.g., pragma solidity 0.8.20;).',
    },
    {
        id: 'UNCHECKED_RETURN', title: 'Unchecked Low-Level Call Return Value', severity: 'HIGH',
        description: 'Low-level calls return a boolean. Ignoring it can lead to silent failures.',
        pattern: /\.call\(|\.delegatecall\(|\.staticcall\(/gi,
        advice: 'Always check the return value: (bool success, ) = addr.call(...); require(success);',
    },
    {
        id: 'SELFDESTRUCT', title: 'Use of selfdestruct', severity: 'HIGH',
        description: 'selfdestruct can destroy the contract. Dangerous if accessible to unauthorized users.',
        pattern: /selfdestruct\(|suicide\(/gi,
        advice: 'Avoid selfdestruct unless absolutely necessary. Protect with strict access control.',
    },
    {
        id: 'BLOCK_TIMESTAMP', title: 'Timestamp Dependence', severity: 'LOW',
        description: 'block.timestamp can be manipulated by miners within ~15 seconds.',
        pattern: /block\.timestamp|now/gi,
        advice: 'Avoid block.timestamp for critical randomness. Use block numbers or oracles.',
    },
    {
        id: 'ASSEMBLY', title: 'Inline Assembly Usage', severity: 'MEDIUM',
        description: 'Inline assembly bypasses Solidity safety checks.',
        pattern: /assembly\s*\{/gi,
        advice: 'Use inline assembly only when necessary and with thorough documentation.',
    },
    {
        id: 'MISSING_ZERO_CHECK', title: 'Missing Zero-Address Validation', severity: 'MEDIUM',
        description: 'Functions that accept address params should validate they are not 0x0.',
        pattern: /function\s+\w+\s*\([^)]*address\s+\w+/gi,
        advice: 'Add require(addr != address(0)) checks for address parameters.',
    },
    {
        id: 'UNPROTECTED_FUNCTION', title: 'Potentially Unprotected Sensitive Function', severity: 'MEDIUM',
        description: 'Functions like mint, burn, pause should have access control modifiers.',
        pattern: /function\s+(mint|burn|pause|unpause|transferOwnership|withdraw|kill)\s*\(/gi,
        advice: 'Ensure sensitive functions are protected with onlyOwner or similar access control.',
    },
    {
        id: 'HARDCODED_ADDRESS', title: 'Hardcoded Address Detected', severity: 'LOW',
        description: 'Hardcoded addresses reduce flexibility and may be invalid on different chains.',
        pattern: /0x[a-fA-F0-9]{40}/g,
        advice: 'Use constructor parameters or configurable state variables instead.',
    },
];

const SEVERITY_PENALTIES = { CRITICAL: 25, HIGH: 15, MEDIUM: 8, LOW: 3 };

/**
 * Runs static security analysis on Solidity source code.
 *
 * @param {string} contractCode - Raw Solidity source
 * @returns {{ score, riskLevel, totalFindings, findings, summary, scannedAt }}
 */
function runStaticAudit(contractCode) {
    const lines    = contractCode.split('\n');
    const findings = [];

    for (const rule of AUDIT_RULES) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            rule.pattern.lastIndex = 0;

            if (!rule.pattern.test(line)) continue;

            // Protected function check
            if (rule.id === 'UNPROTECTED_FUNCTION') {
                const block = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
                if (/onlyOwner|onlyRole|require\(msg\.sender/i.test(block)) continue;
            }

            // Skip import/pragma lines for hardcoded address rule
            if (rule.id === 'HARDCODED_ADDRESS' && /import|pragma|\/\//i.test(line)) continue;

            findings.push({
                ruleId: rule.id, title: rule.title, severity: rule.severity,
                description: rule.description, advice: rule.advice,
                line: i + 1, code: line.trim(),
            });
        }
    }

    // Deduplicate — keep first occurrence per rule, accumulate extra lines
    const uniqueFindings = [];
    const seenRules = new Set();
    for (const finding of findings) {
        if (!seenRules.has(finding.ruleId)) {
            seenRules.add(finding.ruleId);
            uniqueFindings.push(finding);
        } else {
            const existing = uniqueFindings.find(f => f.ruleId === finding.ruleId);
            if (existing) {
                existing.additionalLines = existing.additionalLines || [];
                existing.additionalLines.push(finding.line);
            }
        }
    }

    let score = 100;
    for (const f of uniqueFindings) score -= (SEVERITY_PENALTIES[f.severity] || 5);
    score = Math.max(0, Math.min(100, score));

    let riskLevel = 'LOW';
    if (score < 40) riskLevel = 'CRITICAL';
    else if (score < 60) riskLevel = 'HIGH';
    else if (score < 80) riskLevel = 'MEDIUM';

    const summary = {
        critical: uniqueFindings.filter(f => f.severity === 'CRITICAL').length,
        high:     uniqueFindings.filter(f => f.severity === 'HIGH').length,
        medium:   uniqueFindings.filter(f => f.severity === 'MEDIUM').length,
        low:      uniqueFindings.filter(f => f.severity === 'LOW').length,
    };

    return {
        score, riskLevel,
        totalFindings: uniqueFindings.length,
        findings: uniqueFindings,
        summary,
        scannedAt: new Date().toISOString(),
    };
}

module.exports = { runStaticAudit, AUDIT_RULES };
