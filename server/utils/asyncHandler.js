'use strict';

/**
 * asyncHandler.js
 *
 * Wraps an async Express route handler so any thrown error or rejected
 * promise is automatically forwarded to Express's next(err) handler.
 *
 * This eliminates the need for manual try/catch in every controller:
 *
 *   // Before:
 *   async function handler(req, res) {
 *       try { ... } catch(e) { res.status(500).json({ ... }) }
 *   }
 *
 *   // After:
 *   const handler = asyncHandler(async (req, res) => { ... });
 *
 * All errors propagate to the centralized errorHandler middleware.
 *
 * @param {Function} fn  Async Express handler (req, res, next) => Promise
 * @returns {Function}   Synchronous Express handler that catches promise rejections
 */
function asyncHandler(fn) {
    return function asyncRouteHandler(req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;
