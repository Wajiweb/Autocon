const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * POST /api/chat
 * AI-powered contract explainer using Gemini.
 */
router.post('/', strictLimiter, authMiddleware, async (req, res) => {
    try {
        const { contractCode, question } = req.body;

        if (!contractCode || !question) {
            return res.status(400).json({ success: false, error: 'contractCode and question are required.' });
        }
        if (!genAI) {
            return res.status(500).json({ success: false, error: 'AI integration is not configured on the server.' });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
You are a Senior Smart Contract Security Auditor and Web3 Educator.
The user is asking a question about the following Solidity contract.

Input Solidity Code:
\`\`\`solidity
${contractCode}
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

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        res.json({
            success: true,
            answer: parsed.answer || "I'm sorry, I couldn't generate an answer.",
            suggestedQuestions: parsed.suggestedQuestions || []
        });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate AI response.' });
    }
});

module.exports = router;
