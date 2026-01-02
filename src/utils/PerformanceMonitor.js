/**
 * PerformanceMonitor - Monitor and report application performance metrics
 * Tracks loading times, frame rates, memory usage, and other key metrics
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTimes: [],
      frameRates: [],
      memoryUsage: [],
      networkRequests: [],
      errors: []
    };

    this.isMonitoring = false;
    this.frameCount = 0;
    this.lastTime = 0;
    this.currentFPS = 0;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastTime = performance.now();

    // Start frame rate monitoring
    this.startFrameRateMonitoring();

    // Monitor memory usage if available
    if (performance.memory) {
      this.startMemoryMonitoring();
    }

    // Monitor network requests
    this.startNetworkMonitoring();

    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;

    // Stop frame rate monitoring
    if (this.frameRateAnimationId) {
      cancelAnimationFrame(this.frameRateAnimationId);
    }

    // Stop memory monitoring
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }

    console.log('Performance monitoring stopped');
  }

  /**
   * Start frame rate monitoring
   */
  startFrameRateMonitoring() {
    const monitorFrameRate = (currentTime) => {
      this.frameCount++;

      if (currentTime >= this.lastTime + 1000) {
        this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.metrics.frameRates.push({
          timestamp: Date.now(),
          fps: this.currentFPS
        });

        this.frameCount = 0;
        this.lastTime = currentTime;
      }

      if (this.isMonitoring) {
        this.frameRateAnimationId = requestAnimationFrame(monitorFrameRate);
      }
    };

    this.frameRateAnimationId = requestAnimationFrame(monitorFrameRate);
  }

  /**
   * Start memory usage monitoring
   */
  startMemoryMonitoring() {
    this.memoryInterval = setInterval(() => {
      if (!this.isMonitoring) return;

      const memory = performance.memory;
      const memoryUsage = {
        timestamp: Date.now(),
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };

      this.metrics.memoryUsage.push(memoryUsage);

      // Warn if memory usage is high
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (usagePercent > 80) {
        console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
      }
    }, 5000);
  }

  /**
   * Start network request monitoring
   */
  startNetworkMonitoring() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.metrics.networkRequests.push({
          timestamp: Date.now(),
          url: typeof url === 'string' ? url : url.url,
          method: args[1]?.method || 'GET',
          duration,
          status: response.status,
          success: response.ok
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;

        this.metrics.networkRequests.push({
          timestamp: Date.now(),
          url: typeof url === 'string' ? url : url.url,
          method: args[1]?.method || 'GET',
          duration,
          error: error.message
        });

        throw error;
      }
    };
  }

  /**
   * Record loading time
   */
  recordLoadTime(component, duration) {
    this.metrics.loadTimes.push({
      timestamp: Date.now(),
      component,
      duration
    });
  }

  /**
   * Record error
   */
  recordError(error, context = {}) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context
    });
  }

  /**
   * Measure function execution time
   */
  measureExecutionTime(label, fn) {
    const startTime = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - startTime;

      this.recordLoadTime(`${label}_execution`, duration);

      // If result is a promise, measure that too
      if (result && typeof result.then === 'function') {
        return result.then(resolvedResult => {
          const asyncDuration = performance.now() - startTime;
          this.recordLoadTime(`${label}_async`, asyncDuration);
          return resolvedResult;
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordLoadTime(`${label}_error`, duration);
      throw error;
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics() {
    const memory = performance.memory;
    const navigation = performance.getEntriesByType('navigation')[0];

    return {
      fps: this.currentFPS,
      memory: memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      } : null,
      timing: navigation ? {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: this.getFirstPaintTime()
      } : null,
      networkRequests: this.metrics.networkRequests.length
    };
  }

  /**
   * Get First Paint time
   */
  getFirstPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      summary: this.getCurrentMetrics(),
      averages: this.calculateAverages(),
      issues: this.identifyIssues(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * Calculate average metrics
   */
  calculateAverages() {
    const averages = {
      fps: 0,
      memoryUsage: 0,
      loadTimes: {},
      networkRequests: 0
    };

    // Average FPS
    if (this.metrics.frameRates.length > 0) {
      const fpsSum = this.metrics.frameRates.reduce((sum, entry) => sum + entry.fps, 0);
      averages.fps = Math.round(fpsSum / this.metrics.frameRates.length);
    }

    // Average memory usage
    if (this.metrics.memoryUsage.length > 0) {
      const memorySum = this.metrics.memoryUsage.reduce((sum, entry) => sum + entry.used, 0);
      averages.memoryUsage = memorySum / this.metrics.memoryUsage.length;
    }

    // Average load times by component
    const loadTimeGroups = {};
    this.metrics.loadTimes.forEach(entry => {
      if (!loadTimeGroups[entry.component]) {
        loadTimeGroups[entry.component] = [];
      }
      loadTimeGroups[entry.component].push(entry.duration);
    });

    Object.keys(loadTimeGroups).forEach(component => {
      const times = loadTimeGroups[component];
      averages.loadTimes[component] = times.reduce((sum, time) => sum + time, 0) / times.length;
    });

    // Network request count
    averages.networkRequests = this.metrics.networkRequests.length;

    return averages;
  }

  /**
   * Identify performance issues
   */
  identifyIssues() {
    const issues = [];
    const currentMetrics = this.getCurrentMetrics();
    const averages = this.calculateAverages();

    // FPS issues
    if (averages.fps < 55) {
      issues.push({
        type: 'fps',
        severity: 'high',
        message: `Low average FPS: ${averages.fps} (target: 60)`,
        recommendation: 'Optimize rendering, reduce draw calls, use object pooling'
      });
    }

    // Memory issues
    if (currentMetrics.memory && averages.memoryUsage > 0) {
      const memoryPercent = (averages.memoryUsage / currentMetrics.memory.limit) * 100;
      if (memoryPercent > 80) {
        issues.push({
          type: 'memory',
          severity: 'high',
          message: `High memory usage: ${memoryPercent.toFixed(1)}%`,
          recommendation: 'Implement object pooling, clean up unused assets, optimize textures'
        });
      }
    }

    // Load time issues
    Object.entries(averages.loadTimes).forEach(([component, time]) => {
      if (time > 2000) { // 2 seconds
        issues.push({
          type: 'load_time',
          severity: 'medium',
          message: `Slow ${component} loading: ${time.toFixed(0)}ms`,
          recommendation: 'Optimize assets, implement lazy loading, use compression'
        });
      }
    });

    // Network issues
    const failedRequests = this.metrics.networkRequests.filter(req => !req.success && !req.error).length;
    if (failedRequests > 0) {
      issues.push({
        type: 'network',
        severity: 'medium',
        message: `${failedRequests} failed network requests`,
        recommendation: 'Implement retry logic, offline caching, error boundaries'
      });
    }

    // Error issues
    if (this.metrics.errors.length > 0) {
      issues.push({
        type: 'errors',
        severity: 'high',
        message: `${this.metrics.errors.length} JavaScript errors detected`,
        recommendation: 'Fix error sources, implement error boundaries, improve error handling'
      });
    }

    return issues;
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const currentMetrics = this.getCurrentMetrics();

    // General recommendations
    recommendations.push({
      priority: 'high',
      category: 'general',
      action: 'Enable production build optimizations',
      details: 'Use webpack production mode, enable code splitting, minification'
    });

    // Asset recommendations
    if (currentMetrics.timing && currentMetrics.timing.loadTime > 3000) {
      recommendations.push({
        priority: 'high',
        category: 'assets',
        action: 'Optimize asset loading',
        details: 'Compress images, use WebP format, implement lazy loading'
      });
    }

    // Memory recommendations
    if (currentMetrics.memory && currentMetrics.memory.used > 100 * 1024 * 1024) { // 100MB
      recommendations.push({
        priority: 'medium',
        category: 'memory',
        action: 'Implement memory management',
        details: 'Use object pooling, clean up unused Phaser objects, optimize textures'
      });
    }

    // Network recommendations
    const slowRequests = this.metrics.networkRequests.filter(req => req.duration > 1000).length;
    if (slowRequests > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'network',
        action: 'Optimize network requests',
        details: 'Use HTTP/2, implement caching, compress responses'
      });
    }

    return recommendations;
  }

  /**
   * Export metrics data
   */
  exportMetrics() {
    return {
      ...this.metrics,
      summary: this.getCurrentMetrics(),
      report: this.generateReport()
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = [];
    });
    this.frameCount = 0;
    this.currentFPS = 0;
  }

  /**
   * Create performance benchmark
   */
  async runBenchmark(testName, testFunction, iterations = 100) {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await testFunction();
      const duration = performance.now() - startTime;
      results.push(duration);
    }

    const avgTime = results.reduce((sum, time) => sum + time, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);

    this.recordLoadTime(`${testName}_benchmark`, avgTime);

    return {
      testName,
      iterations,
      averageTime: avgTime,
      minTime,
      maxTime,
      results
    };
  }
}