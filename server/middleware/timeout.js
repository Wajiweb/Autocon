/**
 * Request Timeout Middleware
 * 
 * Prevents requests from hanging indefinitely by setting a timeout.
 * Returns a 408 Request Timeout response if the request takes too long.
 * 
 * @param {number} ms - Timeout in milliseconds (default: 10000 = 10 seconds)
 */
const timeout = (ms = 10000) => {
  return (req, res, next) => {
    // Set timeout on the request
    req.setTimeout(ms, () => {
      // Check if response has already been sent
      if (!res.headersSent) {
        console.warn(`️  Request timeout: ${req.method} ${req.originalUrl} (${ms}ms)`);
        res.status(408).json({
          success: false,
          error: 'Request timeout. The server took too long to respond. Please try again.',
          timeout: ms
        });
      }
    });

    // Also set timeout on the response
    res.setTimeout(ms, () => {
      if (!res.headersSent) {
        console.warn(`⏱️  Response timeout: ${req.method} ${req.originalUrl} (${ms}ms)`);
        res.status(408).json({
          success: false,
          error: 'Response timeout. Please try again.',
          timeout: ms
        });
      }
    });

    next();
  };
};

module.exports = timeout;
