const IORedis = require('ioredis');

// Create Redis client for caching (separate from BullMQ connection)
const cacheClient = new IORedis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : false,
  retryStrategy: (times) => {
    // Stop retrying after 10 attempts to prevent infinite loops
    if (times > 10) return null;
    return Math.min(times * 100, 3000);
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false, // Don't queue commands when disconnected
});

// Handle connection events
cacheClient.on('connect', () => {
  console.log('✅ Redis cache client connected');
});

cacheClient.on('error', (err) => {
  console.warn('⚠️  Redis cache error:', err.message);
});

cacheClient.on('close', () => {
  console.warn('⚠️  Redis cache connection closed');
});

/**
 * Cache middleware for Express routes
 * @param {string} key - Cache key (can use function for dynamic keys)
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
const cacheMiddleware = (key, ttl = 300) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = typeof key === 'function' ? key(req) : key;
      
      // Try to get cached response
      const cached = await cacheClient.get(cacheKey);
      
      if (cached) {
        console.log(` Cache HIT: ${cacheKey}`);
        return res.json(JSON.parse(cached));
      }

      console.log(` Cache MISS: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function(body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheClient.setex(cacheKey, ttl, JSON.stringify(body)).catch(err => {
            console.warn('Failed to cache response:', err.message);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      // If Redis fails, continue without caching (graceful degradation)
      console.warn('Cache middleware error, continuing without cache:', err.message);
      next();
    }
  };
};

/**
 * Invalidate cache by key pattern
 * @param {string} pattern - Redis key pattern (e.g., 'contracts:*')
 */
const invalidateCache = async (pattern) => {
  try {
    const keys = await cacheClient.keys(pattern);
    if (keys.length > 0) {
      await cacheClient.del(...keys);
      console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (err) {
    console.warn('Failed to invalidate cache:', err.message);
  }
};

/**
 * Clear specific cache key
 * @param {string} key - Cache key to clear
 */
const clearCache = async (key) => {
  try {
    await cacheClient.del(key);
    console.log(`🗑️  Cleared cache key: ${key}`);
  } catch (err) {
    console.warn('Failed to clear cache:', err.message);
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearCache,
  cacheClient,
};
