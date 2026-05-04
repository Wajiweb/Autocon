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
 *   message:  string               — User's prompt or question
 *   mode?:    "chat" | "contract" — AI request mode
 *   contract?: string               — Solidity source for contract analysis mode
 *   wallet?:  string               — Optional wallet address
 *   chain?:   string               — Optional network name
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

    const {
        mode,
        message,
        question,
        contract,
        contractCode,
        wallet,
        chain,
        contextId,
        history,
        temperature,
    } = req.body;

    const text = (message || question || '').trim();
    const contractPayload = (contract || contractCode || '').trim();
    const effectiveMode = mode || (contractPayload ? 'contract' : 'chat');
    const requestId = req.requestId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startTime = Date.now();

    console.log(JSON.stringify({
        event: 'ai.chat.request',
        requestId,
        mode: effectiveMode,
        hasContract: Boolean(contractPayload),
        wallet,
        chain,
        contextId,
        historyLength: Array.isArray(history) ? history.length : undefined,
        temperature,
    }));

    const truncatedCode = contractPayload.slice(0, MAX_CONTRACT_SIZE);
    const model = getGeminiModel('gemini-2.5-flash');

    let prompt;
    if (effectiveMode === 'contract' && truncatedCode) {
        prompt = `
You are a Senior Smart Contract Security Auditor and Web3 Educator.
The user is asking a question about the following Solidity contract.

Input Solidity Code:
\`\`\`solidity
${truncatedCode}
\`\`\`

User Question: ${text}

Provide a helpful, accurate, and easy-to-understand answer. Use markdown formatting inside the answer string.
Also, generate an array of 3 to 4 highly relevant, contextual follow-up questions the user might want to ask next based on this code.

Respond STRICTLY in JSON format with the following structure:
{
  "answer": "Your detailed answer to the user's question, using markdown.",
  "suggestedQuestions": ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
}
`;
    } else {
        prompt = `
You are a Senior Web3 AI Assistant and Smart Contract Educator.
Answer the user's question directly and clearly, without contract context.

User Question: ${text}

Provide a helpful, accurate, and easy-to-understand answer. Use markdown formatting inside the answer string.
Also, generate an array of 3 to 4 highly relevant, contextual follow-up questions the user might want to ask next.

Respond STRICTLY in JSON format with the following structure:
{
  "answer": "Your detailed answer to the user's question, using markdown.",
  "suggestedQuestions": ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
}
`;
    }

    const result       = await model.generateContent(prompt);
    const responseText = result.response.text();
    let parsed;

    try {
        const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanText);
    } catch {
        throw new AppError('AI returned malformed JSON.', 502, 'AI_PARSE_ERROR');
    }

    const answer = (parsed.answer || parsed.reply || "I'm sorry, I couldn't generate an answer.").slice(0, MAX_ANSWER_SIZE);
    const responseTimeMs = Date.now() - startTime;

    console.log(JSON.stringify({
        event: 'ai.chat.response',
        requestId,
        mode: effectiveMode,
        success: true,
        durationMs: responseTimeMs,
        hasSuggestedQuestions: Array.isArray(parsed.suggestedQuestions),
    }));

    return res.json({
        success: true,
        data: {
            reply: answer,
            suggestedQuestions: parsed.suggestedQuestions || [],
        },
    });
});

module.exports = { chat };
