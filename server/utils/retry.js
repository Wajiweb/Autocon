/**
 * Retries an asynchronous function with exponential backoff.
 * 
 * @param {Function} fn - The async function to retry.
 * @param {number} retries - Maximum number of retries.
 * @param {number} delay - Initial delay in milliseconds.
 * @returns {Promise<any>}
 */
async function withRetry(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        console.warn(`[RetryUtil] Operation failed. Retrying in ${delay}ms... (${retries} attempts left). Error: ${error.message}`);
        await new Promise(res => setTimeout(res, delay));
        return withRetry(fn, retries - 1, delay * 2);
    }
}

module.exports = { withRetry };
