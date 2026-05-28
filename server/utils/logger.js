'use strict';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Centralized logging utility.
 * Logs as structured JSON in production for Sentry / Log aggregators.
 * Logs in human-readable colorized strings in development.
 */
function log(level, message, meta = {}) {
    const entry = {
        level,
        timestamp: new Date().toISOString(),
        message,
        ...meta
    };

    if (isProduction) {
        console.log(JSON.stringify(entry));
    } else {
        const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[32m';
        const reset = '\x1b[0m';
        console.log(`[${entry.timestamp}] ${color}${level}${reset}: ${message}`, Object.keys(meta).length ? meta : '');
    }
}

module.exports = {
    info: (msg, meta) => log('INFO', msg, meta),
    warn: (msg, meta) => log('WARN', msg, meta),
    error: (msg, meta) => log('ERROR', msg, meta),
    debug: (msg, meta) => !isProduction && log('DEBUG', msg, meta)
};
