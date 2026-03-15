const rateLimit = require('express-rate-limit');

// General API rate limiter — applies to all routes
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,  // Return rate limit info in RateLimit-* headers
    legacyHeaders: true,    // Return X-RateLimit-* headers too
    message: {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: 'See Retry-After header'
    },
    statusCode: 429
});

// Strict limiter for expensive operations (compilation, deployment)
const strictLimiter = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 20,               // 20 requests per minute max
    standardHeaders: true,
    legacyHeaders: true,
    message: {
        success: false,
        error: 'Rate limit exceeded for this operation. Please wait before trying again.',
        retryAfter: 'See Retry-After header'
    },
    statusCode: 429
});

// Auth endpoints — prevent brute-force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,                   // 30 attempts per 15 min
    standardHeaders: true,
    legacyHeaders: true,
    message: {
        success: false,
        error: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    statusCode: 429
});

module.exports = { generalLimiter, strictLimiter, authLimiter };
