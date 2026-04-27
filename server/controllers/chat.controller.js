'use strict';

/**
 * chat.controller.js
 *
 * AI-powered contract Q&A using Gemini.
 * Previously inlined inside chatRoutes.js — now a proper controller.
 *
 * Route: POST /api/chat
 */

const asyncHandler            = require('../utils/asyncHandler');
const { AppError }            = require('../middleware/errorHandler');
const { getGeminiModel, isGeminiAvailable } = require('../services/geminiService');

const MAX_CONTRACT_SIZE = 50000; // 50KB max contract code
const MAX_ANSWER_SIZE = 10000;   // 10KB max answer

/**
 * POST /api/chat
 *
 * Body (validated by Joi schema `chatMessage`):
 *   contractCode: string  — The Solidity source to analyze
 *   question:     string  — User's question about the contract
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       answer:             string,
 *       suggestedQuestions: string[]
 *     }
 *   }
 */
const chat = asyncHandler(async (req, res) => {
    if (!isGeminiAvailable()) {
        throw new AppError(
            'AI integration is not configured on the server.',
            503, 'AI_UNAVAILABLE'
        );
    }

    const { contractCode, question } = req.body;

    // Truncate contract code if too large to prevent abuse
    const truncatedCode = (contractCode || '').slice(0, MAX_CONTRACT_SIZE);
    
    const model = getGeminiModel('gemini-2.5-flash');

    const prompt = `
You are a Senior Smart Contract Security Auditor and Web3 Educator.
The user is asking a question about the following Solidity contract.

Input Solidity Code:
\`\`\`solidity
${truncatedCode}
\`\`\`

User Question: ${question}

Provide a helpful, accurate, and easy-to-understand answer. Use markdown formatting inside the answer string.
Also, generate an array of 3 to 4 highly relevant, contextual follow-up questions the user might want to ask next based on this code.

Respond STRICTLY in JSON format with the following structure:
{
  "answer": "Your detailed answer to the user's question, using markdown.",
  "suggestedQuestions": ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
}
`;

    const result       = await model.generateContent(prompt);
    const responseText = result.response.text();
    let parsed;

    try {
        const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanText);
    } catch {
        throw new AppError('AI returned malformed JSON.', 502, 'AI_PARSE_ERROR');
    }

    // Truncate answer if too large
    const answer = (parsed.answer || "I'm sorry, I couldn't generate an answer.").slice(0, MAX_ANSWER_SIZE);

    return res.json({
        success: true,
        data: {
            answer:             answer,
            suggestedQuestions: parsed.suggestedQuestions || [],
        },
    });
});

module.exports = { chat };
