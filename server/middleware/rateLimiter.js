const rateLimit = require('express-rate-limit');
const { ipKeyGenerator, MemoryStore } = require('express-rate-limit');

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

// Auth endpoints — prevent brute-force (IP-based)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,                   // 30 attempts per 15 min
    standardHeaders: true,
    legacyHeaders: true,
    handler: createRateLimitHandler(15 * 60),
});

// Per-wallet auth rate limiter — prevents abuse of specific wallets
const perWalletAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per wallet per 15 min
    keyGenerator: (req) => {
        // Use wallet address from request body if available, otherwise IP
        const wallet = req.body?.walletAddress;
        if (wallet) {
            return `wallet:${wallet.toLowerCase()}`;
        }
        // Use the built-in IP helper for IPv6 compatibility
        return ipKeyGenerator(req);
    },
    standardHeaders: true,
    legacyHeaders: true,
    handler: createRateLimitHandler(15 * 60),
});

// AI User stores
const aiUserMinutelyStore = new MemoryStore();
const aiUserDailyStore = new MemoryStore();

// Helper to fetch current AI limits for a user
const getAiLimits = async (req) => {
    const key = req.user?.userId || req.user?.walletAddress || ipKeyGenerator(req);
    const rpmTotal = parseInt(process.env.AI_LIMIT_RPM) || 5;
    const rpdTotal = parseInt(process.env.AI_LIMIT_RPD) || 50;

    const minutelyInfo = await aiUserMinutelyStore.get(key);
    const dailyInfo = await aiUserDailyStore.get(key);

    const rpmHits = minutelyInfo ? minutelyInfo.totalHits : 0;
    const rpdHits = dailyInfo ? dailyInfo.totalHits : 0;

    const rpmRemaining = Math.max(0, rpmTotal - rpmHits);
    const rpdRemaining = Math.max(0, rpdTotal - rpdHits);

    return {
        rpm: {
            total: rpmTotal,
            remaining: rpmRemaining,
            resetTime: minutelyInfo?.resetTime || new Date(Date.now() + 60 * 1000),
        },
        rpd: {
            total: rpdTotal,
            remaining: rpdRemaining,
            resetTime: dailyInfo?.resetTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
    };
};

// AI User Rate Limit Handlers
const createAiRateLimitHandler = (windowMs, store) => async (req, res) => {
    const key = req.user?.userId || req.user?.walletAddress || ipKeyGenerator(req);
    const info = await store.get(key);
    let retryAfter = Math.ceil(windowMs / 1000);
    if (info && info.resetTime) {
        retryAfter = Math.ceil((new Date(info.resetTime).getTime() - Date.now()) / 1000);
        if (retryAfter < 0) retryAfter = 0;
    }

    console.log(JSON.stringify({
        level: 'WARN',
        event: 'ai_rate_limit_exceeded',
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        userId: req.user?.userId || 'anonymous',
        wallet: req.user?.walletAddress || req.body?.walletAddress,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        retryAfter,
    }));

    const limits = await getAiLimits(req);

    res.set('Retry-After', retryAfter);
    res.status(429).json({
        success: false,
        error: 'AI Rate limit exceeded. Please wait before trying again.',
        retryAfter,
        limits,
    });
};

// AI User Rate Limiters
const aiUserMinutelyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: () => parseInt(process.env.AI_LIMIT_RPM) || 5,
    store: aiUserMinutelyStore,
    keyGenerator: (req) => req.user?.userId || req.user?.walletAddress || ipKeyGenerator(req),
    standardHeaders: true,
    legacyHeaders: true,
    handler: createAiRateLimitHandler(60 * 1000, aiUserMinutelyStore),
});

const aiUserDailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: () => parseInt(process.env.AI_LIMIT_RPD) || 50,
    store: aiUserDailyStore,
    keyGenerator: (req) => req.user?.userId || req.user?.walletAddress || ipKeyGenerator(req),
    standardHeaders: true,
    legacyHeaders: true,
    handler: createAiRateLimitHandler(24 * 60 * 60 * 1000, aiUserDailyStore),
});

module.exports = {
    generalLimiter,
    strictLimiter,
    authLimiter,
    perWalletAuthLimiter,
    aiUserMinutelyLimiter,
    aiUserDailyLimiter,
    getAiLimits,
};

