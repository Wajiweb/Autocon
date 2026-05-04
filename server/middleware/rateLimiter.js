const rateLimit = require('express-rate-limit');

// Custom handler for rate limit events
const createRateLimitHandler = (retryAfter) => (req, res) => {
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
        retryAfter,
    }));

    res.set('Retry-After', retryAfter);
    res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter,
    });
};

// General API rate limiter — applies to all routes
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,  // Return rate limit info in RateLimit-* headers
    legacyHeaders: true,    // Return X-RateLimit-* headers too
    handler: createRateLimitHandler(Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000) / 1000)),
});

// Strict limiter for expensive operations (compilation, deployment)
const strictLimiter = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 20,               // 20 requests per minute max
    standardHeaders: true,
    legacyHeaders: true,
    handler: createRateLimitHandler(60),
});

// Auth endpoints — prevent brute-force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,                   // 30 attempts per 15 min
    standardHeaders: true,
    legacyHeaders: true,
    handler: createRateLimitHandler(15 * 60),
});

module.exports = { generalLimiter, strictLimiter, authLimiter };
