'use strict';

/**
 * errorHandler.js — Centralized Express Error Handler
 *
 * Replaces the inline error handler in index.js.
 * Produces a consistent JSON response for all unhandled errors:
 *
 * {
 *   "success": false,
 *   "code":    "VALIDATION_ERROR",
 *   "message": "Human-readable message",
 *   "details": [...] | null
 * }
 *
 * Error types handled:
 *  - ValidationError (Joi)
 *  - MongoServerError 11000 (duplicate key)
 *  - CastError (invalid MongoDB ObjectId)
 *  - CORS rejection
 *  - JSON parse errors
 *  - Unexpected / uncaught errors
 */

// ─── Custom Application Error ─────────────────────────────────────────────────

class AppError extends Error {
    /**
     * @param {string} message  Human-readable error message
     * @param {number} status   HTTP status code
     * @param {string} code     Machine-readable error code (e.g. 'NOT_FOUND')
     * @param {Array}  details  Optional array of field-level detail objects
     */
    constructor(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.name    = 'AppError';
        this.status  = status;
        this.code    = code;
        this.details = details;
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildErrorResponse(code, message, details = null) {
    return {
        success: false,
        code,
        message,
        error: message,
        details,
    };
}

// ─── Centralized Error Middleware ─────────────────────────────────────────────

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    // Log every error with context (structured for easy log aggregation)
    console.error(JSON.stringify({
        level:     'ERROR',
        timestamp: new Date().toISOString(),
        method:    req.method,
        path:      req.originalUrl,
        name:      err.name,
        message:   err.message,
        stack:     process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    }));

    // Send to Sentry (excluding 4xx client errors like validation and bad ID)
    if (process.env.NODE_ENV === 'production' && !['ValidationError', 'CastError'].includes(err.name) && err.message !== 'Not allowed by CORS') {
        const Sentry = require('@sentry/node');
        Sentry.captureException(err);
    }

    // ── CORS ────────────────────────────────────────────────────────────────
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json(buildErrorResponse(
            'CORS_REJECTED',
            'This origin is not allowed to access this resource.',
            null
        ));
    }

    // ── Joi Validation Error ─────────────────────────────────────────────────
    if (err.name === 'ValidationError' && err.isJoi) {
        const details = err.details.map(d => ({
            field:   d.path.join('.'),
            message: d.message.replace(/['"]/g, ''),
        }));
        return res.status(400).json(buildErrorResponse(
            'VALIDATION_ERROR',
            'Request validation failed. Please check the highlighted fields.',
            details
        ));
    }

    // ── MongoDB Duplicate Key ────────────────────────────────────────────────
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json(buildErrorResponse(
            'DUPLICATE_KEY',
            `A record with this ${field} already exists.`,
            null
        ));
    }

    // ── MongoDB Bad ObjectId ─────────────────────────────────────────────────
    if (err.name === 'CastError') {
        return res.status(400).json(buildErrorResponse(
            'INVALID_ID',
            `Invalid format for parameter: ${err.path}`,
            null
        ));
    }

    // ── JSON Parse Error ─────────────────────────────────────────────────────
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json(buildErrorResponse(
            'INVALID_JSON',
            'Request body contains malformed JSON.',
            null
        ));
    }

    // ── Our Own AppError ─────────────────────────────────────────────────────
    if (err.name === 'AppError') {
        return res.status(err.status).json(buildErrorResponse(
            err.code,
            err.message,
            err.details
        ));
    }

    // ── Rate Limit Exceeded ───────────────────────────────────────────────────
    if (err.status === 429 || res.statusCode === 429) {
        // Log rate limit events for monitoring
        console.log(JSON.stringify({
            level: 'WARN',
            event: 'rate_limit_exceeded',
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.originalUrl,
            userId: req.user?.id || 'anonymous',
            wallet: req.user?.wallet || req.body?.wallet,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            retryAfter: res.get('Retry-After') || 'unknown',
        }));

        return res.status(429).json(buildErrorResponse(
            'RATE_LIMIT_EXCEEDED',
            'Rate limit exceeded. Please try again later.',
            null
        ));
    }

    // ── Fallback: Unexpected Error ────────────────────────────────────────────
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json(buildErrorResponse(
        'INTERNAL_ERROR',
        isDev ? err.message : 'An unexpected error occurred. Please try again.',
        null
    ));
}

module.exports = { errorHandler, AppError };
