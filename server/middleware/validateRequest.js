'use strict';

const { ZodError } = require('zod');

function buildErrorPayload(requestId, error) {
    const details = error.errors.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
    }));

    return {
        success: false,
        error: 'Validation failed',
        details,
        requestId,
    };
}

function generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateRequest(schema) {
    return (req, res, next) => {
        const requestId = req.headers['x-request-id'] || generateRequestId();
        req.requestId = requestId;

        const start = Date.now();
        const result = schema.safeParse(req.body);
        const durationMs = Date.now() - start;

        console.log(JSON.stringify({
            event: 'request.validation',
            requestId,
            method: req.method,
            path: req.originalUrl,
            mode: req.body?.mode || (req.body?.contract || req.body?.contractCode ? 'contract' : 'chat'),
            valid: result.success,
            durationMs,
        }));

        if (!result.success) {
            const payload = buildErrorPayload(requestId, result.error);
            console.log(JSON.stringify({
                event: 'request.validation.failed',
                requestId,
                details: payload.details,
            }));
            return res.status(400).json(payload);
        }

        req.body = result.data;
        next();
    };
}

module.exports = { validateRequest, generateRequestId };
