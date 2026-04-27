'use strict';

/**
 * redisConnection.js
 * 
 * Shared ioredis connection for BullMQ.
 * BullMQ requires a "lazy" connection — it must NOT auto-connect on import,
 * so we use the `lazyConnect: true` option and pass an ioredis instance.
 * 
 * All queues and workers import this single connection to avoid
 * creating dozens of open Redis sockets.
 */

const IORedis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_TLS = process.env.REDIS_TLS === 'true';

const connection = new IORedis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    tls: REDIS_TLS ? {} : undefined,
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,    // Required by BullMQ
    lazyConnect: true,          // Don't connect until first command
});

connection.on('connect', () => {
    console.log(`[Redis] Connected to ${REDIS_HOST}:${REDIS_PORT}`);
});

let hasLoggedError = false;
connection.on('error', (err) => {
    // Log error but don't crash — queues are non-critical for basic operation
    if (!hasLoggedError) {
        console.error(`[Redis] Connection error: ${err.message} (Subsequent errors suppressed)`);
        hasLoggedError = true;
    }
});

module.exports = connection;
