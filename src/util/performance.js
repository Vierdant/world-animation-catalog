/**
 * Performance monitoring and optimization utilities
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      searchTime: [],
      renderTime: [],
      imageLoadTime: [],
      memoryUsage: []
    };
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Measure execution time of a function
   * @param {string} label - Label for the measurement
   * @param {Function} fn - Function to measure
   * @returns {any} - Result of the function
   */
  measure(label, fn) {
    if (!this.isEnabled) return fn();
    
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    this.metrics[label] = this.metrics[label] || [];
    this.metrics[label].push(duration);
    
    // Keep only last 100 measurements
    if (this.metrics[label].length > 100) {
      this.metrics[label] = this.metrics[label].slice(-100);
    }
    
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return result;
  }

  /**
   * Get average performance metrics
   * @returns {Object} - Average metrics
   */
  getAverageMetrics() {
    const averages = {};
    for (const [key, values] of Object.entries(this.metrics)) {
      if (values.length > 0) {
        averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
    return averages;
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (!this.isEnabled) return;
    
    const averages = this.getAverageMetrics();
    console.log('📊 Performance Summary:');
    for (const [key, value] of Object.entries(averages)) {
      console.log(`  ${key}: ${value.toFixed(2)}ms avg`);
    }
  }

  /**
   * Monitor memory usage
   */
  monitorMemory() {
    if (!this.isEnabled || !performance.memory) return;
    
    const memory = performance.memory;
    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    
    console.log(`💾 Memory: ${usedMB}MB / ${totalMB}MB`);
    
    // Warn if memory usage is high
    if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.8) {
      console.warn('⚠️ High memory usage detected');
    }
  }

  /**
   * Debounce function with performance tracking
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        this.measure('debouncedFunction', () => func(...args));
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function with performance tracking
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} - Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        this.measure('throttledFunction', () => func(...args));
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Batch DOM updates to reduce layout thrashing
   * @param {Function} updateFn - Function containing DOM updates
   */
  batchDOMUpdates(updateFn) {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        performanceMonitor.measure('batchDOMUpdates', updateFn);
      });
    } else {
      performanceMonitor.measure('batchDOMUpdates', updateFn);
    }
  },

  /**
   * Lazy load images with intersection observer
   * @param {string} src - Image source
   * @param {Function} onLoad - Load callback
   * @param {Function} onError - Error callback
   */
  lazyLoadImage(src, onLoad, onError) {
    if ('IntersectionObserver' in window) {
      const img = new Image();
      img.onload = () => performanceMonitor.measure('imageLoad', onLoad);
      img.onerror = onError;
      img.src = src;
    } else {
      // Fallback for older browsers
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onError;
      img.src = src;
    }
  },

  /**
   * Memoize function results
   * @param {Function} fn - Function to memoize
   * @param {number} maxSize - Maximum cache size
   * @returns {Function} - Memoized function
   */
  memoize(fn, maxSize = 100) {
    const cache = new Map();
    
    return function memoizedFunction(...args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn(...args);
      
      // Limit cache size
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      cache.set(key, result);
      return result;
    };
  },

  /**
   * Optimize array operations for large datasets
   * @param {Array} array - Array to process
   * @param {Function} processor - Processing function
   * @param {number} batchSize - Batch size for processing
   * @returns {Promise<Array>} - Processed array
   */
  async processArrayInBatches(array, processor, batchSize = 50) {
    const results = [];
    
    for (let i = 0; i < array.length; i += batchSize) {
      const batch = array.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
      
      // Yield control to prevent blocking
      if (i + batchSize < array.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return results;
  }
};

// Export for use in components
export default performanceMonitor;
