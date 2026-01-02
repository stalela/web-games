/**
 * BrowserCompatibility - Cross-browser compatibility testing and feature detection
 * Ensures the Lalela Web Games work across different browsers and devices
 */
export class BrowserCompatibility {
  constructor() {
    this.compatibility = {};
    this.featureSupport = {};
    this.performanceMetrics = {};
    this.issues = [];
  }

  /**
   * Run comprehensive browser compatibility tests
   */
  async runCompatibilityTests() {
    console.log('Running browser compatibility tests...');

    this.detectBrowser();
    this.testFeatureSupport();
    this.testPerformanceCapabilities();
    this.testWebGLSupport();
    this.testAudioSupport();
    this.testTouchSupport();
    this.testWebAPIs();

    this.generateCompatibilityReport();
    return this.compatibility;
  }

  /**
   * Detect browser and version
   */
  detectBrowser() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';

    // Chrome
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    }
    // Edge
    else if (ua.indexOf('Edg') > -1) {
      browser = 'Edge';
      version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    }
    // Firefox
    else if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    }
    // Safari
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    }
    // Mobile browsers
    else if (ua.indexOf('Mobile') > -1) {
      if (ua.indexOf('Android') > -1) {
        browser = 'Android Browser';
      } else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
        browser = 'Mobile Safari';
      } else {
        browser = 'Mobile Browser';
      }
    }

    this.compatibility.browser = {
      name: browser,
      version: version,
      userAgent: ua,
      isMobile: /Mobi|Android/i.test(ua),
      isTablet: /Tablet|iPad/i.test(ua),
      platform: navigator.platform
    };

    console.log(`Detected browser: ${browser} ${version}`);
  }

  /**
   * Test core feature support
   */
  testFeatureSupport() {
    this.featureSupport = {
      // ES6+ features
      es6: {
        arrowFunctions: typeof (() => {}) === 'function',
        templateLiterals: typeof `${1}` === 'string',
        destructuring: (() => {
          try {
            const { a } = { a: 1 };
            return true;
          } catch { return false; }
        })(),
        promises: typeof Promise !== 'undefined',
        asyncAwait: (() => {
          try {
            // Test async function support without eval
            return typeof AsyncFunction !== 'undefined' ||
                   (typeof Function !== 'undefined' &&
                    Function.prototype.toString.call(async function(){}).includes('async'));
          } catch { return false; }
        })()
      },

      // Web APIs
      webAPIs: {
        fetch: typeof fetch !== 'undefined',
        webGL: this.testWebGLSupport(),
        canvas: !!document.createElement('canvas').getContext,
        audio: this.testAudioSupport(),
        localStorage: this.testLocalStorage(),
        indexedDB: this.testIndexedDB(),
        serviceWorker: 'serviceWorker' in navigator,
        webRTC: 'RTCPeerConnection' in window,
        geolocation: 'geolocation' in navigator
      },

      // CSS features
      css: {
        flexbox: this.testCSS('display', 'flex'),
        grid: this.testCSS('display', 'grid'),
        transforms: this.testCSS('transform', 'translateX(10px)'),
        animations: this.testCSS('animation', 'test 1s'),
        webkitPrefix: this.testCSS('-webkit-transform', 'translateX(10px)')
      }
    };

    // Check for missing features
    this.checkFeatureCompatibility();
  }

  /**
   * Test WebGL support
   */
  testWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          supported: true,
          vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
          renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
          version: gl.getParameter(gl.VERSION),
          shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
        };
      }
    } catch (e) {
      console.warn('WebGL test failed:', e);
    }
    return { supported: false };
  }

  /**
   * Test audio support
   */
  testAudioSupport() {
    const audio = document.createElement('audio');
    const canPlayTypes = {
      mp3: audio.canPlayType('audio/mpeg'),
      ogg: audio.canPlayType('audio/ogg'),
      wav: audio.canPlayType('audio/wav'),
      webm: audio.canPlayType('audio/webm')
    };

    return {
      supported: !!audio.canPlayType,
      webAudio: typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined',
      canPlayTypes: canPlayTypes,
      hasSupportedFormat: Object.values(canPlayTypes).some(type => type !== '')
    };
  }

  /**
   * Test localStorage support
   */
  testLocalStorage() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test IndexedDB support
   */
  testIndexedDB() {
    return 'indexedDB' in window ||
           'mozIndexedDB' in window ||
           'webkitIndexedDB' in window ||
           'msIndexedDB' in window;
  }

  /**
   * Test touch support
   */
  testTouchSupport() {
    return {
      touchEvents: 'ontouchstart' in window,
      touchPoints: navigator.maxTouchPoints || navigator.msMaxTouchPoints || 0,
      pointerEvents: 'onpointerdown' in window,
      msPointerEvents: 'onmspointerdown' in window
    };
  }

  /**
   * Test CSS property support
   */
  testCSS(property, value) {
    const element = document.createElement('div');
    element.style[property] = value;
    return element.style[property] === value;
  }

  /**
   * Test Web API support
   */
  testWebAPIs() {
    const apis = {
      // Modern APIs
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      mutationObserver: 'MutationObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,

      // Input APIs
      gamepad: 'getGamepads' in navigator,
      vibration: 'vibrate' in navigator,

      // Media APIs
      mediaDevices: 'mediaDevices' in navigator,
      getUserMedia: 'getUserMedia' in navigator,

      // Battery API
      battery: 'getBattery' in navigator,

      // Network APIs
      online: 'onLine' in navigator,
      connection: 'connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator
    };

    this.featureSupport.webAPIs = { ...this.featureSupport.webAPIs, ...apis };
  }

  /**
   * Test performance capabilities
   */
  testPerformanceCapabilities() {
    this.performanceMetrics = {
      // Memory info (if available)
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usagePercent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      } : null,

      // Timing info
      timing: performance.timing ? {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        totalLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
      } : null,

      // Hardware concurrency
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',

      // Device pixel ratio
      devicePixelRatio: window.devicePixelRatio || 1,

      // Screen info
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      }
    };
  }

  /**
   * Check feature compatibility and identify issues
   */
  checkFeatureCompatibility() {
    this.issues = [];

    // Check ES6 support
    const es6Features = Object.entries(this.featureSupport.es6);
    const missingES6 = es6Features.filter(([feature, supported]) => !supported);

    if (missingES6.length > 0) {
      this.issues.push({
        type: 'es6',
        severity: 'critical',
        message: `Missing ES6 features: ${missingES6.map(([f]) => f).join(', ')}`,
        impact: 'Application will not function properly'
      });
    }

    // Check WebGL support
    if (!this.featureSupport.webAPIs.webGL.supported) {
      this.issues.push({
        type: 'webgl',
        severity: 'critical',
        message: 'WebGL not supported',
        impact: 'Games will not render properly'
      });
    }

    // Check audio support
    if (!this.featureSupport.webAPIs.audio.supported) {
      this.issues.push({
        type: 'audio',
        severity: 'medium',
        message: 'Audio not supported',
        impact: 'Sound effects and music will not work'
      });
    }

    // Check localStorage
    if (!this.featureSupport.webAPIs.localStorage) {
      this.issues.push({
        type: 'storage',
        severity: 'medium',
        message: 'localStorage not supported',
        impact: 'Progress saving may not work'
      });
    }

    // Check for old browsers
    const browser = this.compatibility.browser;
    if (browser.name === 'Internet Explorer' ||
        (browser.name === 'Edge' && parseInt(browser.version) < 79)) {
      this.issues.push({
        type: 'browser',
        severity: 'high',
        message: `Outdated browser: ${browser.name} ${browser.version}`,
        impact: 'Limited functionality and performance issues'
      });
    }

    // Performance warnings
    const memory = this.performanceMetrics.memory;
    if (memory && memory.usagePercent > 80) {
      this.issues.push({
        type: 'memory',
        severity: 'medium',
        message: `High memory usage: ${memory.usagePercent.toFixed(1)}%`,
        impact: 'May experience performance issues'
      });
    }
  }

  /**
   * Generate compatibility report
   */
  generateCompatibilityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      browser: this.compatibility.browser,
      compatibility: {
        overall: this.calculateOverallScore(),
        features: this.featureSupport,
        performance: this.performanceMetrics,
        issues: this.issues
      },
      recommendations: this.generateRecommendations()
    };

    console.log('Browser Compatibility Report:', report);
    return report;
  }

  /**
   * Calculate overall compatibility score
   */
  calculateOverallScore() {
    let score = 100;
    let criticalIssues = 0;
    let highIssues = 0;

    this.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 30;
          criticalIssues++;
          break;
        case 'high':
          score -= 15;
          highIssues++;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 1;
          break;
      }
    });

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      score: score,
      grade: score >= 90 ? 'A' :
             score >= 80 ? 'B' :
             score >= 70 ? 'C' :
             score >= 60 ? 'D' : 'F',
      criticalIssues: criticalIssues,
      highIssues: highIssues,
      totalIssues: this.issues.length
    };
  }

  /**
   * Generate recommendations based on compatibility issues
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.issues.length === 0) {
      recommendations.push({
        priority: 'low',
        action: 'Monitor for updates',
        details: 'Browser is fully compatible. Continue monitoring for new features.'
      });
      return recommendations;
    }

    this.issues.forEach(issue => {
      switch (issue.type) {
        case 'es6':
          recommendations.push({
            priority: 'critical',
            action: 'Upgrade browser or use transpiler',
            details: 'Application requires modern JavaScript features not supported in this browser.'
          });
          break;

        case 'webgl':
          recommendations.push({
            priority: 'critical',
            action: 'Enable hardware acceleration or upgrade browser',
            details: 'WebGL is required for 3D graphics rendering.'
          });
          break;

        case 'audio':
          recommendations.push({
            priority: 'medium',
            action: 'Check browser audio settings',
            details: 'Audio may be disabled or not supported in this browser.'
          });
          break;

        case 'storage':
          recommendations.push({
            priority: 'medium',
            action: 'Enable browser storage or use alternative storage',
            details: 'localStorage is needed for saving game progress.'
          });
          break;

        case 'browser':
          recommendations.push({
            priority: 'high',
            action: 'Upgrade to a modern browser',
            details: 'Current browser version may have security and compatibility issues.'
          });
          break;

        case 'memory':
          recommendations.push({
            priority: 'medium',
            action: 'Close other tabs/applications',
            details: 'High memory usage may cause performance issues.'
          });
          break;
      }
    });

    return recommendations;
  }

  /**
   * Run performance benchmark
   */
  async runPerformanceBenchmark() {
    console.log('Running performance benchmark...');

    const results = {
      renderPerformance: await this.benchmarkRendering(),
      memoryUsage: await this.benchmarkMemory(),
      inputResponsiveness: await this.benchmarkInput()
    };

    console.log('Performance benchmark results:', results);
    return results;
  }

  /**
   * Benchmark rendering performance
   */
  async benchmarkRendering() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const startTime = performance.now();
    let frames = 0;

    return new Promise(resolve => {
      const render = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw some test graphics
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(Math.random() * 700, Math.random() * 500, 100, 100);

        ctx.beginPath();
        ctx.arc(Math.random() * 800, Math.random() * 600, 50, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff00';
        ctx.fill();

        frames++;

        if (frames < 100) {
          requestAnimationFrame(render);
        } else {
          const endTime = performance.now();
          const fps = (frames / (endTime - startTime)) * 1000;

          resolve({
            fps: fps,
            frameTime: 1000 / fps,
            supported: fps > 30 // Consider 30fps as minimum acceptable
          });
        }
      };

      requestAnimationFrame(render);
    });
  }

  /**
   * Benchmark memory usage
   */
  async benchmarkMemory() {
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

    // Create some objects to test memory
    const testObjects = [];
    for (let i = 0; i < 10000; i++) {
      testObjects.push({
        id: i,
        data: new Array(100).fill(Math.random()),
        timestamp: Date.now()
      });
    }

    // Wait a bit for garbage collection
    await new Promise(resolve => setTimeout(resolve, 100));

    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryIncrease = finalMemory - initialMemory;

    // Clean up
    testObjects.length = 0;

    return {
      initialMemory: initialMemory,
      finalMemory: finalMemory,
      memoryIncrease: memoryIncrease,
      memoryAvailable: performance.memory ? performance.memory.jsHeapSizeLimit : 'Unknown',
      memoryEfficient: memoryIncrease < 10 * 1024 * 1024 // Less than 10MB increase
    };
  }

  /**
   * Benchmark input responsiveness
   */
  async benchmarkInput() {
    return new Promise(resolve => {
      const results = {
        touchEvents: false,
        pointerEvents: false,
        mouseEvents: false,
        keyboardEvents: false,
        responseTime: 0
      };

      const startTime = performance.now();

      // Test mouse events
      const mouseHandler = () => {
        results.mouseEvents = true;
        results.responseTime = performance.now() - startTime;
        document.removeEventListener('mousemove', mouseHandler);
        resolve(results);
      };

      document.addEventListener('mousemove', mouseHandler, { once: true });

      // Timeout after 2 seconds if no interaction
      setTimeout(() => {
        document.removeEventListener('mousemove', mouseHandler);
        resolve(results);
      }, 2000);
    });
  }

  /**
   * Export compatibility data
   */
  exportCompatibilityData() {
    return {
      compatibility: this.compatibility,
      featureSupport: this.featureSupport,
      performanceMetrics: this.performanceMetrics,
      issues: this.issues,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
  }
}

// Create global instance
export const browserCompatibility = new BrowserCompatibility();