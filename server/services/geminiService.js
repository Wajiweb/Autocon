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
function getGeminiModel(modelName = 'gemini-2.5-flash', jsonMode = true) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured. Add it to server/.env');
    }

    if (!_client) {
        _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    const generationConfig = jsonMode
        ? { responseMimeType: 'application/json' }
        : {};

    return _client.getGenerativeModel({ model: modelName, generationConfig });
}

/**
 * Returns true if the Gemini integration is available (key configured).
 * Use this for graceful degradation instead of crashing.
 */
function isGeminiAvailable() {
    return !!process.env.GEMINI_API_KEY;
}

module.exports = { getGeminiModel, isGeminiAvailable };
