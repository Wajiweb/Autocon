const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

/**
 * Runs Slither AST-based static analysis via child_process.
 * 
 * @param {string} contractCode - The raw Solidity source code.
 * @returns {Promise<Array>} Array of normalized vulnerabilities.
 */
async function runSlitherAnalysis(contractCode) {
    const tempDir = os.tmpdir();
    const fileName = `audit_${crypto.randomBytes(8).toString('hex')}.sol`;
    const filePath = path.join(tempDir, fileName);

    let vulnerabilities = [];

    try {
        // Write the code to a temporary file
        await fs.writeFile(filePath, contractCode, 'utf8');

        // Run Slither and output results as JSON
        const command = `slither ${filePath} --json -`;

        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
                // Slither often exits with code != 0 if it finds issues, so we don't reject on error alone.
                resolve({ error, stdout, stderr });
            });
        });

        let slitherOutput;

        try {
            // Slither writes JSON to stderr when run with --json -.
            // stdout may contain progress text. Pick whichever stream has the JSON object.
            const stdoutHasJson = stdout.includes('{');
            const stderrHasJson = stderr.includes('{');
            const outputString  = stderrHasJson ? stderr : (stdoutHasJson ? stdout : '');

            const jsonStart = outputString.indexOf('{');
            if (jsonStart !== -1) {
                slitherOutput = JSON.parse(outputString.substring(jsonStart));
            } else {
                throw new Error('No JSON found in Slither output');
            }
        } catch (parseError) {
            console.warn('[SlitherService] Failed to parse Slither output:', parseError.message);
            return []; // Return empty array so aggregation layer can fall back
        }

        if (slitherOutput && slitherOutput.results && slitherOutput.results.detectors) {
            vulnerabilities = slitherOutput.results.detectors.map(detector => {
                let risk = 'LOW';
                if (detector.impact === 'High') risk = 'CRITICAL';
                if (detector.impact === 'Medium') risk = 'HIGH';

                return {
                    source: 'Slither',
                    id: detector.check,
                    title: detector.check,
                    severity: risk,
                    description: detector.description,
                    location: detector.elements && detector.elements.length > 0
                        ? `Line ${detector.elements[0].source_mapping.lines.join('-')}`
                        : 'Unknown'
                };
            });
        }

    } catch (err) {
        console.error('[SlitherService] Execution error:', err.message);
    } finally {
        // Clean up temp file
        try {
            await fs.unlink(filePath);
        } catch (e) {
            // Ignore cleanup errors
        }
    }

    return vulnerabilities;
}

module.exports = { runSlitherAnalysis };
