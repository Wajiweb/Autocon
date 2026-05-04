'use strict';

/**
 * ai.controller.js
 * Implements the AI Contract Assistant using Gemini API.
 */

const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { getGeminiModel, isGeminiAvailable } = require('../services/geminiService');

/**
 * POST /api/ai/suggest
 * AI Auto-configuration based on user intent
 */
const MAX_CONTRACT_SIZE = 50000; // 50KB max contract code

const suggestConfig = asyncHandler(async (req, res) => {
    if (!isGeminiAvailable()) {
        throw new AppError('AI integration is not configured on the server.', 503, 'AI_UNAVAILABLE');
    }

    const { contractType, userDescription, partialInputs } = req.body;
    
    // Validate and truncate contract code if too large
    const codeToProcess = (partialInputs?.sourceCode || '').slice(0, MAX_CONTRACT_SIZE);
    
    const model = getGeminiModel('gemini-2.5-flash');

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
        const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        jsonResponse = JSON.parse(cleanText);
    } catch (e) {
        throw new AppError("AI returned malformed JSON", 502, 'AI_PARSE_ERROR');
    }

    return res.json({ success: true, data: jsonResponse });
});

/**
 * POST /api/ai/audit-explain
 * Translates technical Slither results into plain English
 */
const AUDIT_MAX_CONTRACT_SIZE = 100000; // 100KB max contract code for audit

const explainAudit = asyncHandler(async (req, res) => {
    if (!isGeminiAvailable()) {
        throw new AppError('AI integration is not configured on the server.', 503, 'AI_UNAVAILABLE');
    }

    const { vulnerabilities, contractCode } = req.body;
    
    // Validate and truncate contract code
    const truncatedCode = (contractCode || '').slice(0, AUDIT_MAX_CONTRACT_SIZE);
    
    const model = getGeminiModel('gemini-2.5-flash');

    const prompt = `You are an expert Web3 security auditor.
I have a smart contract and its raw technical audit results (e.g. from Slither).
DO NOT override or hide any risks. Your job is ONLY to translate the technical jargon into plain English.

Technical Vulnerabilities:
${JSON.stringify(vulnerabilities)}

Contract Code Snippet (first 1500 chars to provide context):
${truncatedCode.substring(0, 1500)}

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
        const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        jsonResponse = JSON.parse(cleanText);
    } catch (e) {
        throw new AppError("AI returned malformed JSON", 502, 'AI_PARSE_ERROR');
    }

    return res.json({ success: true, data: jsonResponse });
});

module.exports = { suggestConfig, explainAudit };
