'use strict';

/**
 * ai.controller.js
 * Implements the AI Contract Assistant using Gemini API.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Enforce strict JSON output
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    generationConfig: { responseMimeType: "application/json" } 
});

/**
 * POST /api/ai/suggest
 * AI Auto-configuration based on user intent
 */
async function suggestConfig(req, res, next) {
    try {
        const { contractType, userDescription, partialInputs } = req.body;
        
        const prompt = `You are an expert Web3 smart contract architect.
The user wants to configure a ${contractType} contract.
Their description of what they want: "${userDescription}"
Current inputs they have already filled (if any): ${JSON.stringify(partialInputs || {})}

Based on this, suggest optimal smart contract parameters.
Return ONLY a valid JSON object matching this schema exactly. Only include properties relevant to ${contractType}:
{
  "suggestions": {
    "supply": 1000000,
    "decimals": 18,
    "mintPrice": "0.05",
    "maxSupply": 10000,
    "duration": 7,
    "minimumBid": "0.1",
    "isMintable": true,
    "isBurnable": false,
    "hasTax": true,
    "taxRate": 5
  },
  "reasoning": "A concise 1-2 sentence explanation of why you chose these parameters."
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText);
        } catch (e) {
            throw new Error("AI returned malformed JSON");
        }

        return res.json({ success: true, data: jsonResponse });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/ai/audit-explain
 * Translates technical Slither results into plain English
 */
async function explainAudit(req, res, next) {
    try {
        const { vulnerabilities, contractCode } = req.body;
        
        const prompt = `You are an expert Web3 security auditor.
I have a smart contract and its raw technical audit results (e.g. from Slither).
DO NOT override or hide any risks. Your job is ONLY to translate the technical jargon into plain English.

Technical Vulnerabilities:
${JSON.stringify(vulnerabilities)}

Contract Code Snippet (first 1500 chars to provide context):
${contractCode.substring(0, 1500)}

Return ONLY a valid JSON object matching this schema exactly:
{
  "summary": "A 1-2 sentence plain English summary of the overall security posture.",
  "risks": ["Simple explanation of risk 1", "Simple explanation of risk 2"],
  "recommendations": ["Actionable step to fix risk 1", "Actionable step to fix risk 2"]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText);
        } catch (e) {
            throw new Error("AI returned malformed JSON");
        }

        return res.json({ success: true, data: jsonResponse });
    } catch (error) {
        next(error);
    }
}

module.exports = { suggestConfig, explainAudit };
