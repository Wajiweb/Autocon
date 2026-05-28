'use strict';

/**
 * geminiService.js
 *
 * Single shared Gemini AI client factory for the entire backend.
 *
 * Eliminates three independent GoogleGenerativeAI instantiations that
 * previously existed across:
 *   - llmService.js
 *   - ai.controller.js
 *   - chatRoutes.js (inline)
 *
 * Usage:
 *   const { getGeminiModel } = require('../services/geminiService');
 *   const model = getGeminiModel(); // default: gemini-2.5-flash, JSON mode
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let _client = null;

/**
 * Returns a configured Gemini GenerativeModel instance.
 * Lazily initializes the client on first call.
 *
 * @param {string} [modelName='gemini-2.5-flash']
 * @param {boolean} [jsonMode=true]  When true, enforces JSON-only output.
 * @returns {import('@google/generative-ai').GenerativeModel}
 * @throws {Error} If GEMINI_API_KEY is not configured in the environment.
 */
function getGeminiModel(modelName = 'gemini-2.5-flash', jsonMode = true, customSchema = null) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured. Add it to server/.env');
    }

    if (!_client) {
        _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    let generationConfig = {
        maxOutputTokens: 800,
    };
    if (jsonMode) {
        const schema = customSchema || {
            type: 'OBJECT',
            properties: {
                answer: {
                    type: 'STRING',
                    description: 'The detailed answer to the user question, using markdown formatting.',
                },
                suggestedQuestions: {
                    type: 'ARRAY',
                    items: {
                        type: 'STRING',
                        description: 'A follow-up question the user might ask.',
                    },
                    description: 'Array of 3-4 relevant follow-up questions.',
                },
            },
            required: ['answer', 'suggestedQuestions'],
        };

        generationConfig = {
            responseMimeType: 'application/json',
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            responseSchema: schema,
            maxOutputTokens: 800,
        };
    }


    const originalModel = _client.getGenerativeModel({ model: modelName, generationConfig });

    // Return a wrapped object that intercepts generateContent with retries and fallback models
    return {
        ...originalModel,
        generateContent: async (prompt, ...args) => {
            const modelsToTry = [modelName, 'gemini-1.5-flash', 'gemini-1.5-pro'];
            let lastError = null;
            const maxRetries = 3;

            for (const modelToUse of modelsToTry) {
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        const targetModel = _client.getGenerativeModel({ model: modelToUse, generationConfig });
                        const result = await targetModel.generateContent(prompt, ...args);
                        return result;
                    } catch (err) {
                        lastError = err;
                        const errMsg = err.message || '';
                        const is503 = errMsg.includes('503') || errMsg.includes('Service Unavailable') || errMsg.includes('high demand') || errMsg.includes('experiencing high demand');
                        const is429 = errMsg.includes('429') || errMsg.includes('Too Many Requests') || errMsg.includes('Quota exceeded') || errMsg.includes('resource exhausted');

                        if (is503 || is429) {
                            console.warn(`[GeminiService] Model ${modelToUse} failed (attempt ${attempt}/${maxRetries}): ${errMsg}. Retrying...`);
                            
                            // Exponential backoff delay
                            const delay = Math.pow(2, attempt) * 500 + Math.random() * 200;
                            await new Promise(resolve => setTimeout(resolve, delay));
                            continue;
                        }

                        // For syntax or auth errors, propagate immediately
                        throw err;
                    }
                }
                
                console.warn(`[GeminiService] Model ${modelToUse} exhausted all retries. Falling back to next model...`);
            }

            throw lastError || new Error('Gemini generation failed on all fallback models');
        }
    };
}

/**
 * Returns true if the Gemini integration is available (key configured).
 * Use this for graceful degradation instead of crashing.
 */
function isGeminiAvailable() {
    return !!process.env.GEMINI_API_KEY;
}

module.exports = { getGeminiModel, isGeminiAvailable };
