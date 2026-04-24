const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Ensure the API key is present. If not, the service will gracefully return a fallback response.
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Runs an AI-powered smart contract audit using Gemini.
 * 
 * @param {string} contractCode - The raw Solidity source code.
 * @param {Array} slitherResults - Vulnerabilities detected by Slither.
 * @returns {Promise<Object>} Structured JSON containing summary, risks, and recommendations.
 */
async function runLLMAnalysis(contractCode, slitherResults) {
    if (!genAI) {
        console.warn('[LLMService] GEMINI_API_KEY not found in .env. Skipping AI analysis.');
        return {
            summary: "AI analysis skipped due to missing API configuration.",
            risks: [],
            recommendations: ["Configure GEMINI_API_KEY in the backend .env to enable AI auditing."]
        };
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
You are a Senior Smart Contract Security Auditor. 
Your task is to analyze the following Solidity contract and the deterministic findings from Slither.
Provide human-readable explanations, detect any logical business flaws Slither missed, and suggest actionable improvements.

Input Solidity Code:
\`\`\`solidity
${contractCode}
\`\`\`

Slither Findings (Deterministic AST analysis):
${JSON.stringify(slitherResults, null, 2)}

Respond STRICTLY in JSON format with the following structure:
{
  "summary": "A 2-3 sentence overview of the contract's security posture.",
  "risks": [
    {
      "title": "Clear vulnerability title",
      "severity": "CRITICAL, HIGH, MEDIUM, or LOW",
      "description": "Human-readable explanation of why this is a risk",
      "location": "Line number or function name"
    }
  ],
  "recommendations": [
    "Actionable step to fix risk 1",
    "General architectural improvement"
  ]
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Ensure it parses successfully
        const parsedResponse = JSON.parse(responseText);
        return parsedResponse;

    } catch (error) {
        console.error('[LLMService] AI Generation Error:', error.message);
        return {
            summary: "AI analysis encountered an error during generation.",
            risks: [],
            recommendations: []
        };
    }
}

module.exports = { runLLMAnalysis };
