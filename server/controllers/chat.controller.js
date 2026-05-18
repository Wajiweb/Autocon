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

const WEB3_KEYWORDS = [
  // Smart Contracts
  'smart contract', 'solidity', 'vyper', 'contract', 'deploy', 'compile', 
  'abi', 'bytecode', 'function', 'modifier', 'event', 'mapping',
  
  // Blockchain
  'ethereum', 'sepolia', 'bnb', 'polygon', 'web3', 'blockchain', 
  'consensus', 'proof of work', 'proof of stake', 'mining', 'validator',
  
  // Tokens & NFTs
  'token', 'erc-20', 'erc20', 'erc-721', 'erc721', 'erc-1155', 
  'nft', 'mint', 'auction', 'collection',
  
  // DeFi & Web3
  'defi', 'dao', 'staking', 'yield', 'liquidity', 'swap', 'wallet', 
  'metamask', 'transaction', 'gas',
  
  // Security
  'audit', 'vulnerability', 'reentrancy', 'overflow', 'access control',
  'security', 'hack', 'exploit',
  
  // Platform
  'autocon', 'generate', 'template', 'wizard',
  
  // Development
  'remix', 'hardhat', 'foundry', 'truffle', 'dapp', 'frontend',
  'react', 'next.js', 'javascript', 'typescript',
];

const isWeb3Related = (text) => {
  const lower = text.toLowerCase();
  return WEB3_KEYWORDS.some(keyword => lower.includes(keyword));
};

const generateOffTopicResponse = () => `I'm specialized in **Web3 and Smart Contract Development**. 

Here's what I can help you with:

✅ **Smart Contract Development** - Create, deploy, and audit contracts
✅ **Token Generation** - ERC-20, ERC-721 (NFTs), ERC-1155
✅ **Security Auditing** - Find vulnerabilities and best practices
✅ **Blockchain Concepts** - Consensus, gas, wallets, transactions
✅ **AutoCon Platform** - Generate contracts, templates, deployment

💡 *Try asking: "How do I create an ERC-20 token?" or "What is reentrancy?"*`;

const getWeb3Suggestions = () => [
  "How do I create an ERC-20 token?",
  "What are common security vulnerabilities?",
  "Explain how smart contracts work",
];

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

    // Pre-validate topic - reject off-topic questions early
    if (!isWeb3Related(text) && !contractPayload) {
        console.log(JSON.stringify({
            event: 'ai.chat.off_topic',
            requestId,
            question: text.slice(0, 100),
        }));

        return res.json({
            success: true,
            data: {
                reply: generateOffTopicResponse(),
                suggestedQuestions: getWeb3Suggestions(),
            },
        });
    }

    const truncatedCode = contractPayload.slice(0, MAX_CONTRACT_SIZE);
    const model = getGeminiModel('gemini-2.5-flash');

    let prompt;
    if (effectiveMode === 'contract' && truncatedCode) {
        prompt = `You are a Senior Smart Contract Security Auditor and Web3 Educator.

The user is asking a question about the following Solidity contract.

Input Solidity Code:
\`\`\`solidity
${truncatedCode}
\`\`\`

User Question: ${text}

RULES:
1. Provide a helpful, accurate, and easy-to-understand answer.
2. Use markdown formatting inside the answer string (headings, lists, code blocks, bold, etc).
3. Generate an array of 3 to 4 highly relevant, contextual follow-up questions.
4. You MUST respond ONLY with valid JSON matching this exact structure:
{
  "answer": "Your detailed answer here. Escape all quotes with \\\" and newlines with \\n.",
  "suggestedQuestions": ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
}
5. Do NOT include any text before or after the JSON object.
6. Do NOT wrap the JSON in markdown code fences.
7. The "answer" field must be a single string with proper escaping.
8. The "suggestedQuestions" field must be an array of 3-4 strings.`;
    } else {
        prompt = `You are a Senior Web3 AI Assistant and Smart Contract Educator.

Answer the user's question directly and clearly, without contract context.

User Question: ${text}

RULES:
1. Provide a helpful, accurate, and easy-to-understand answer.
2. Use markdown formatting inside the answer string (headings, lists, code blocks, bold, etc).
3. Generate an array of 3 to 4 highly relevant, contextual follow-up questions.
4. You MUST respond ONLY with valid JSON matching this exact structure:
{
  "answer": "Your detailed answer here. Escape all quotes with \\\" and newlines with \\n.",
  "suggestedQuestions": ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
}
5. Do NOT include any text before or after the JSON object.
6. Do NOT wrap the JSON in markdown code fences.
7. The "answer" field must be a single string with proper escaping.
8. The "suggestedQuestions" field must be an array of 3-4 strings.

REAL-TIME DATA HANDLING:
If asked about live data (current gas prices, token prices, block numbers, network status):
1. Acknowledge you don't have real-time data access
2. Provide direct links to relevant tools:
   - Gas prices: https://etherscan.io/gastracker
   - Token prices: https://www.coingecko.com/ or https://coinmarketcap.com/
   - Blockchain data: https://etherscan.io/ or https://bscscan.com/
   - Network status: https://etherscan.io/chart
3. Offer to teach related concepts instead`;
    }

    const result       = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log(JSON.stringify({
        event: 'ai.chat.raw_response',
        requestId,
        responseLength: responseText.length,
        responsePreview: responseText.slice(0, 200),
    }));

    let parsed;
    let rawAnswer = null;

    try {
        parsed = parseAIResponse(responseText);
    } catch (err) {
        console.error(JSON.stringify({
            event: 'ai.chat.parse_error',
            requestId,
            error: err.message,
            rawResponse: responseText.slice(0, 1000),
        }));

        rawAnswer = responseText.trim();

        parsed = {
            answer: rawAnswer || "I'm sorry, I couldn't generate a structured response.",
            suggestedQuestions: generateFallbackQuestions(text),
        };
    }

    const answer = validateAndSanitizeAnswer(parsed.answer, rawAnswer);
    const suggestedQuestions = validateSuggestedQuestions(parsed.suggestedQuestions, text);
    const responseTimeMs = Date.now() - startTime;

    console.log(JSON.stringify({
        event: 'ai.chat.response',
        requestId,
        mode: effectiveMode,
        success: true,
        durationMs: responseTimeMs,
        answerLength: answer.length,
        hasSuggestedQuestions: Array.isArray(suggestedQuestions) && suggestedQuestions.length > 0,
    }));

    return res.json({
        success: true,
        data: {
            reply: answer,
            suggestedQuestions,
        },
    });
});

/**
 * Robustly parse AI response text into a JSON object.
 * Handles multiple formats: pure JSON, markdown-wrapped JSON, mixed content.
 *
 * @param {string} responseText - Raw response from AI
 * @returns {object} Parsed JSON object
 * @throws {Error} If parsing fails completely
 */
function parseAIResponse(responseText) {
    if (!responseText || typeof responseText !== 'string') {
        throw new Error('Empty or invalid response text');
    }

    const trimmed = responseText.trim();

    // Strategy 1: Direct parse (works when response is pure JSON)
    try {
        const parsed = JSON.parse(trimmed);
        if (isValidResponseShape(parsed)) return parsed;
    } catch {
        // Continue to next strategy
    }

    // Strategy 2: Strip markdown code fences
    const strippedFences = trimmed
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    try {
        const parsed = JSON.parse(strippedFences);
        if (isValidResponseShape(parsed)) return parsed;
    } catch {
        // Continue to next strategy
    }

    // Strategy 3: Extract JSON object from mixed content
    // Find the outermost JSON object by tracking brace depth
    const jsonMatch = extractOutermostJSON(trimmed);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch);
            if (isValidResponseShape(parsed)) return parsed;
        } catch {
            // Continue to next strategy
        }
    }

    // Strategy 4: Try to repair common JSON issues
    const repaired = repairJSON(strippedFences);
    if (repaired) {
        try {
            const parsed = JSON.parse(repaired);
            if (isValidResponseShape(parsed)) return parsed;
        } catch {
            // Continue to next strategy
        }
    }

    // All strategies failed
    throw new Error('AI returned malformed JSON after all parsing attempts');
}

/**
 * Check if parsed object has the expected response shape.
 */
function isValidResponseShape(obj) {
    return obj && typeof obj === 'object' && (
        (typeof obj.answer === 'string') ||
        (typeof obj.reply === 'string')
    );
}

/**
 * Extract the outermost JSON object from text by tracking brace depth.
 */
function extractOutermostJSON(text) {
    let depth = 0;
    let startIndex = -1;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
        }

        if (inString) continue;

        if (char === '{') {
            if (depth === 0) {
                startIndex = i;
            }
            depth++;
        } else if (char === '}') {
            depth--;
            if (depth === 0 && startIndex !== -1) {
                return text.slice(startIndex, i + 1);
            }
        }
    }

    return null;
}

/**
 * Attempt to repair common JSON issues.
 */
function repairJSON(text) {
    if (!text) return null;

    let repaired = text;

    // Remove trailing commas before closing braces/brackets
    repaired = repaired.replace(/,\s*([}\]])/g, '$1');

    // Fix unescaped quotes in string values (basic heuristic)
    // This is a simplified repair - won't catch all cases

    // Ensure proper opening/closing
    if (!repaired.startsWith('{')) {
        const firstBrace = repaired.indexOf('{');
        if (firstBrace !== -1) {
            repaired = repaired.slice(firstBrace);
        }
    }

    if (!repaired.endsWith('}')) {
        const lastBrace = repaired.lastIndexOf('}');
        if (lastBrace !== -1) {
            repaired = repaired.slice(0, lastBrace + 1);
        }
    }

    return repaired;
}

/**
 * Validate and sanitize the answer field.
 * Falls back to raw response if answer is invalid.
 */
function validateAndSanitizeAnswer(answer, rawResponse) {
    if (typeof answer === 'string' && answer.trim().length > 0) {
        return answer.trim().slice(0, MAX_ANSWER_SIZE);
    }

    // Fallback: use raw response or default message
    if (rawResponse && typeof rawResponse === 'string' && rawResponse.trim().length > 0) {
        return rawResponse.trim().slice(0, MAX_ANSWER_SIZE);
    }

    return "I'm sorry, I couldn't generate an answer. Please try again.";
}

/**
 * Validate suggestedQuestions field.
 * Returns fallback questions if invalid.
 */
function validateSuggestedQuestions(questions, userQuestion) {
    if (Array.isArray(questions) && questions.length > 0) {
        return questions
            .filter(q => typeof q === 'string' && q.trim().length > 0)
            .slice(0, 4)
            .map(q => q.trim());
    }

    return generateFallbackQuestions(userQuestion);
}

/**
 * Generate contextual fallback questions based on user input.
 */
function generateFallbackQuestions(userQuestion) {
    const lower = userQuestion.toLowerCase();

    if (lower.includes('create') || lower.includes('build') || lower.includes('develop')) {
        return [
            'What programming languages are used for smart contracts?',
            'How do I deploy a smart contract?',
            'What are the best practices for smart contract development?',
        ];
    }

    if (lower.includes('secure') || lower.includes('vulnerability') || lower.includes('audit')) {
        return [
            'What are common smart contract vulnerabilities?',
            'How can I audit my own smart contracts?',
            'What tools exist for smart contract security?',
        ];
    }

    if (lower.includes('token') || lower.includes('erc-20') || lower.includes('erc20')) {
        return [
            'How do I create an ERC-20 token?',
            'What is the difference between ERC-20 and ERC-721?',
            'How much does it cost to deploy a token?',
        ];
    }

    // Generic fallback
    return [
        'Can you explain how smart contracts work?',
        'What are the benefits of using smart contracts?',
        'How do I get started with blockchain development?',
    ];
}

module.exports = { chat };
