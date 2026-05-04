/**
 * Throttling utilities for rate limiting client-side requests
 */

export class RequestThrottler {
  constructor(options) {
    this.lastCallTime = 0;
    this.queue = [];
    this.isProcessing = false;
    this.delay = options.delay;
    this.maxQueueSize = options.maxQueueSize || 5;
  }

  /**
   * Execute a function with throttling
   * Returns a promise that resolves when the function is actually executed
   */
  async throttle(fn) {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;

      if (timeSinceLastCall >= this.delay && !this.isProcessing) {
        // Execute immediately
        this.lastCallTime = now;
        this.isProcessing = true;
        execute().finally(() => {
          this.isProcessing = false;
          this.processQueue();
        });
      } else {
        // Queue the request
        if (this.queue.length >= this.maxQueueSize) {
          reject(new Error('Request queue is full. Please wait before sending another message.'));
          return;
        }

        this.queue.push(execute);
      }
    });
  }

  processQueue() {
    if (this.queue.length === 0 || this.isProcessing) return;

    const nextCall = this.queue.shift();
    if (nextCall) {
      this.isProcessing = true;
      this.lastCallTime = Date.now();
      nextCall().finally(() => {
        this.isProcessing = false;
        this.processQueue();
      });
    }
  }

  /**
   * Clear all queued requests
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Get current queue size
   */
  getQueueSize() {
    return this.queue.length;
  }
}

/**
 * Simple debounce utility
 */
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}