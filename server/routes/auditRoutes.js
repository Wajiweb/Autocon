const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Vulnerability patterns for static analysis of Solidity contracts.
 * Each rule checks for a known vulnerability pattern.
 */
const AUDIT_RULES = [
    {
        id: 'REENTRANCY',
        title: 'Potential Reentrancy Vulnerability',
        severity: 'CRITICAL',
        description: 'External calls (call, send, transfer) found before state changes. An attacker could re-enter the function before state is updated.',
        pattern: /\.call\{value:|\.call\.value\(/gi,
        advice: 'Use the Checks-Effects-Interactions pattern. Update state before making external calls, or use ReentrancyGuard.'
    },
    {
        id: 'TX_ORIGIN',
        title: 'Unsafe tx.origin Usage',
        severity: 'HIGH',
        description: 'Using tx.origin for authorization is vulnerable to phishing attacks. A malicious contract can trick a user into calling it, inheriting their tx.origin.',
        pattern: /tx\.origin/gi,
        advice: 'Replace tx.origin with msg.sender for access control checks.'
    },
    {
        id: 'FLOATING_PRAGMA',
        title: 'Floating Pragma Version',
        severity: 'MEDIUM',
        description: 'The contract uses a floating pragma (e.g., ^0.8.x). This means it can be compiled with different compiler versions, potentially introducing unexpected behavior.',
        pattern: /pragma solidity \^/gi,
        advice: 'Lock the pragma to a specific version (e.g., pragma solidity 0.8.20;) for production deployments.'
    },
    {
        id: 'UNCHECKED_RETURN',
        title: 'Unchecked Low-Level Call Return Value',
        severity: 'HIGH',
        description: 'Low-level calls (.call, .delegatecall, .staticcall) return a boolean indicating success. Ignoring this value can lead to silent failures.',
        pattern: /\.call\(|\.delegatecall\(|\.staticcall\(/gi,
        advice: 'Always check the return value: (bool success, ) = addr.call(...); require(success);'
    },
    {
        id: 'SELFDESTRUCT',
        title: 'Use of selfdestruct',
        severity: 'HIGH',
        description: 'selfdestruct can destroy the contract and send remaining ETH to an address. This is a dangerous operation if accessible to unauthorized users.',
        pattern: /selfdestruct\(|suicide\(/gi,
        advice: 'Avoid selfdestruct unless absolutely necessary. If used, protect it with strict access control.'
    },
    {
        id: 'BLOCK_TIMESTAMP',
        title: 'Timestamp Dependence',
        severity: 'LOW',
        description: 'Relying on block.timestamp for critical logic can be manipulated by miners within a ~15 second window.',
        pattern: /block\.timestamp|now/gi,
        advice: 'Avoid using block.timestamp for critical randomness or time-sensitive logic. Use block numbers or oracles instead.'
    },
    {
        id: 'ASSEMBLY',
        title: 'Inline Assembly Usage',
        severity: 'MEDIUM',
        description: 'Inline assembly bypasses Solidity safety checks and can introduce low-level bugs that are hard to audit.',
        pattern: /assembly\s*\{/gi,
        advice: 'Use inline assembly only when necessary and with thorough documentation and testing.'
    },
    {
        id: 'MISSING_ZERO_CHECK',
        title: 'Missing Zero-Address Validation',
        severity: 'MEDIUM',
        description: 'Functions that accept address parameters should validate they are not the zero address (0x0) to prevent accidental token burns or locks.',
        pattern: /function\s+\w+\s*\([^)]*address\s+\w+/gi,
        advice: 'Add require(addr != address(0)) checks for all address parameters in critical functions.'
    },
    {
        id: 'UNPROTECTED_FUNCTION',
        title: 'Potentially Unprotected Sensitive Function',
        severity: 'MEDIUM',
        description: 'Functions like mint, burn, pause, or transfer ownership should have access control modifiers.',
        pattern: /function\s+(mint|burn|pause|unpause|transferOwnership|withdraw|kill)\s*\(/gi,
        advice: 'Ensure all sensitive functions are protected with onlyOwner or similar access control modifiers.'
    },
    {
        id: 'HARDCODED_ADDRESS',
        title: 'Hardcoded Address Detected',
        severity: 'LOW',
        description: 'Hardcoded addresses reduce contract flexibility and may become invalid on different chains.',
        pattern: /0x[a-fA-F0-9]{40}/g,
        advice: 'Consider using constructor parameters or configurable state variables instead of hardcoded addresses.'
    }
];

/**
 * POST /api/audit-contract
 * Performs static security analysis on Solidity source code.
 * Body: { contractCode }
 */
router.post('/audit-contract', authMiddleware, async (req, res) => {
    try {
        const { contractCode } = req.body;

        if (!contractCode || typeof contractCode !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'contractCode (string) is required.'
            });
        }

        const lines = contractCode.split('\n');
        const findings = [];

        // Run each audit rule against the code
        for (const rule of AUDIT_RULES) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Reset regex lastIndex for global patterns
                rule.pattern.lastIndex = 0;

                if (rule.pattern.test(line)) {
                    // Check if this is a protected function (has onlyOwner modifier)
                    if (rule.id === 'UNPROTECTED_FUNCTION') {
                        // Look at the full function declaration (next few lines) for modifiers
                        const functionBlock = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
                        if (/onlyOwner|onlyRole|require\(msg\.sender/i.test(functionBlock)) {
                            continue; // Function is protected, skip this finding
                        }
                    }

                    // For HARDCODED_ADDRESS, skip common init addresses and constructor params
                    if (rule.id === 'HARDCODED_ADDRESS') {
                        if (/import|pragma|\/\//i.test(line)) continue;
                    }

                    findings.push({
                        ruleId: rule.id,
                        title: rule.title,
                        severity: rule.severity,
                        description: rule.description,
                        advice: rule.advice,
                        line: i + 1,
                        code: line.trim()
                    });
                }
            }
        }

        // Deduplicate findings per rule (keep first occurrence of each unique rule)
        const uniqueFindings = [];
        const seenRules = new Set();
        for (const finding of findings) {
            const key = `${finding.ruleId}`;
            if (!seenRules.has(key)) {
                seenRules.add(key);
                uniqueFindings.push(finding);
            } else {
                // Add additional occurrences as extra locations
                const existing = uniqueFindings.find(f => f.ruleId === finding.ruleId);
                if (existing) {
                    if (!existing.additionalLines) existing.additionalLines = [];
                    existing.additionalLines.push(finding.line);
                }
            }
        }

        // Calculate security score (100 base, deduct per finding severity)
        const severityPenalties = { CRITICAL: 25, HIGH: 15, MEDIUM: 8, LOW: 3 };
        let score = 100;
        for (const finding of uniqueFindings) {
            score -= (severityPenalties[finding.severity] || 5);
        }
        score = Math.max(0, Math.min(100, score));

        // Determine overall risk level
        let riskLevel = 'LOW';
        if (score < 40) riskLevel = 'CRITICAL';
        else if (score < 60) riskLevel = 'HIGH';
        else if (score < 80) riskLevel = 'MEDIUM';

        res.json({
            success: true,
            audit: {
                score,
                riskLevel,
                totalFindings: uniqueFindings.length,
                findings: uniqueFindings,
                summary: {
                    critical: uniqueFindings.filter(f => f.severity === 'CRITICAL').length,
                    high: uniqueFindings.filter(f => f.severity === 'HIGH').length,
                    medium: uniqueFindings.filter(f => f.severity === 'MEDIUM').length,
                    low: uniqueFindings.filter(f => f.severity === 'LOW').length
                },
                scannedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Audit Error:', error);
        res.status(500).json({ success: false, error: 'Failed to run security audit.' });
    }
});

module.exports = router;
