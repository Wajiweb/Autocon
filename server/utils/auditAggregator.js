/**
 * Merges and normalizes deterministic Slither findings with AI insights.
 * 
 * @param {Array} slitherFindings - Array of normalized Slither vulnerabilities.
 * @param {Object} llmInsights - The structured JSON response from the LLM.
 * @returns {Object} Final API response payload.
 */
function aggregateAuditResults(slitherFindings, llmInsights) {
    const finalVulnerabilities = [];
    const seenTitles = new Set();

    // 1. Add Slither findings first (High priority / Deterministic)
    for (const finding of slitherFindings) {
        // Normalize title to lowercase for duplicate detection
        const key = finding.title.toLowerCase().trim();
        if (!seenTitles.has(key)) {
            seenTitles.add(key);
            finalVulnerabilities.push({
                ...finding,
                source: 'Slither (Deterministic)'
            });
        }
    }

    // 2. Add LLM findings (Logic-based)
    if (llmInsights && llmInsights.risks) {
        for (const risk of llmInsights.risks) {
            const key = risk.title.toLowerCase().trim();
            // Only add if it's not a duplicate of a Slither finding
            if (!seenTitles.has(key)) {
                seenTitles.add(key);
                finalVulnerabilities.push({
                    id: `AI_${key.replace(/\s+/g, '_').substring(0, 15)}`,
                    title: risk.title,
                    severity: risk.severity || 'LOW',
                    description: risk.description,
                    location: risk.location || 'Global',
                    source: 'AI Analysis'
                });
            }
        }
    }

    // 3. Calculate Overall Risk
    let overallRisk = 'LOW';
    let severityScore = 0;
    
    for (const v of finalVulnerabilities) {
        if (v.severity === 'CRITICAL') severityScore += 100;
        else if (v.severity === 'HIGH') severityScore += 50;
        else if (v.severity === 'MEDIUM') severityScore += 20;
        else severityScore += 5;
    }

    if (severityScore >= 100) overallRisk = 'CRITICAL';
    else if (severityScore >= 50) overallRisk = 'HIGH';
    else if (severityScore >= 20) overallRisk = 'MEDIUM';

    // 4. Construct Final Payload
    return {
        overallRisk,
        vulnerabilities: finalVulnerabilities,
        aiInsights: {
            summary: llmInsights?.summary || 'No AI summary available.',
        },
        recommendations: llmInsights?.recommendations || []
    };
}

module.exports = { aggregateAuditResults };
