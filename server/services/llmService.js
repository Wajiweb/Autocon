const { getGeminiModel, isGeminiAvailable } = require('./geminiService');

const AUDIT_RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        summary: {
            type: 'STRING',
            description: "A highly compact 1-2 sentence overview of the contract's security posture."
        },
        risks: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING', description: 'Clear vulnerability title' },
                    severity: { type: 'STRING', description: 'CRITICAL, HIGH, MEDIUM, or LOW' },
                    description: { type: 'STRING', description: 'Brief human-readable explanation of why this is a risk' },
                    location: { type: 'STRING', description: 'Line number or function name' }
                },
                required: ['title', 'severity', 'description']
            },
            description: 'Vulnerabilities and security risks detected in the contract.'
        },
        recommendations: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Actionable steps to fix risks or general architectural improvements.'
        }
    },
    required: ['summary', 'risks', 'recommendations']
};

/**
 * Runs an AI-powered smart contract audit using Gemini.
 * 
 * @param {string} contractCode - The raw Solidity source code.
 * @param {Array} slitherResults - Vulnerabilities detected by Slither.
 * @returns {Promise<Object>} Structured JSON containing summary, risks, and recommendations.
 */
async function runLLMAnalysis(contractCode, slitherResults) {
    if (!isGeminiAvailable()) {
        console.warn('[LLMService] GEMINI_API_KEY not found in .env. Skipping AI analysis.');
        return {
            summary: "AI analysis skipped due to missing API configuration.",
            risks: [],
            recommendations: ["Configure GEMINI_API_KEY in the backend .env to enable AI auditing."]
        };
    }

    try {
        const model = getGeminiModel('gemini-2.5-flash', true, AUDIT_RESPONSE_SCHEMA);


        const prompt = `
You are a Senior Smart Contract Security Auditor. 
Your task is to analyze the following Solidity contract and the deterministic findings from Slither.
Provide highly compact, direct, human-readable explanations, detect any logical business flaws Slither missed, and suggest actionable improvements.
Keep all text fields extremely brief and to the point.

Input Solidity Code:
\`\`\`solidity
${contractCode}
\`\`\`

Slither Findings (Deterministic AST analysis):
${JSON.stringify(slitherResults, null, 2)}

Respond STRICTLY in JSON format with the following structure:
{
  "summary": "A highly compact 1-2 sentence overview of the contract's security posture.",
  "risks": [
    {
      "title": "Clear vulnerability title",
      "severity": "CRITICAL, HIGH, MEDIUM, or LOW",
      "description": "Brief human-readable explanation of why this is a risk",
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
        
        // Robust JSON extraction — handle markdown fences and mixed content
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseText);
        } catch {
            const stripped = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            try {
                parsedResponse = JSON.parse(stripped);
            } catch {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedResponse = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('AI returned unparseable response');
                }
            }
        }
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
