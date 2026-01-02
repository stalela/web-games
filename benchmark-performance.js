#!/usr/bin/env node
/**
 * Performance Benchmarking Script for Lalela Web Games
 * Tests application performance across different devices and network conditions
 *
 * Usage:
 * - node benchmark-performance.js              # Run all benchmarks
 * - node benchmark-performance.js --mobile    # Test mobile performance
 * - node benchmark-performance.js --desktop   # Test desktop performance
 * - node benchmark-performance.js --network   # Test network performance
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PerformanceBenchmarker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      benchmarks: {},
      summary: {
        overallScore: 0,
        recommendations: []
      }
    };

    this.testUrl = 'http://localhost:8081';
    this.devices = {
      mobile: {
        name: 'Mobile (iPhone 12)',
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
      },
      tablet: {
        name: 'Tablet (iPad)',
        viewport: { width: 768, height: 1024 },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      },
      desktop: {
        name: 'Desktop (1080p)',
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false
      },
      lowEnd: {
        name: 'Low-End Device',
        viewport: { width: 360, height: 640 },
        userAgent: 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',
        deviceScaleFactor: 1.5,
        isMobile: true,
        hasTouch: true,
        cpuSlowdown: 4, // Simulate slower CPU
        networkSlowdown: 2 // Simulate slower network
      }
    };

    this.networkConditions = {
      fast3g: {
        name: 'Fast 3G',
        download: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
        upload: 0.75 * 1024 * 1024 / 8,  // 750 Kbps
        latency: 150
      },
      slow3g: {
        name: 'Slow 3G',
        download: 0.5 * 1024 * 1024 / 8, // 500 Kbps
        upload: 0.25 * 1024 * 1024 / 8,  // 250 Kbps
        latency: 400
      },
      fast: {
        name: 'Fast Network',
        download: 10 * 1024 * 1024 / 8, // 10 Mbps
        upload: 5 * 1024 * 1024 / 8,   // 5 Mbps
        latency: 20
      }
    };
  }

  async runAllBenchmarks() {
    console.log('⚡ Starting Performance Benchmarking Suite');
    console.log('=' .repeat(60));

    try {
      // Device performance benchmarks
      await this.runDeviceBenchmarks();

      // Network performance benchmarks
      await this.runNetworkBenchmarks();

      // Memory usage benchmarks
      await this.runMemoryBenchmarks();

      // Frame rate benchmarks
      await this.runFrameRateBenchmarks();

      // Generate final report
      this.generateBenchmarkReport();

    } catch (error) {
      console.error('❌ Benchmarking failed:', error.message);
      this.results.error = error.message;
    } finally {
      this.saveResults();
    }
  }

  async runDeviceBenchmarks() {
    console.log('\n📱 Running Device Performance Benchmarks...');

    const deviceResults = {};

    for (const [deviceKey, deviceConfig] of Object.entries(this.devices)) {
      console.log(`Testing ${deviceConfig.name}...`);

      const result = await this.benchmarkDevice(deviceConfig);
      deviceResults[deviceKey] = result;
    }

    this.results.benchmarks.devices = deviceResults;
  }

  async benchmarkDevice(deviceConfig) {
    let browser;
    let page;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--disable-gpu' // Disable GPU for consistent benchmarking
        ]
      });

      page = await browser.newPage();

      // Set device configuration
      await page.setViewport(deviceConfig.viewport);
      await page.setUserAgent(deviceConfig.userAgent);

      // Set CPU slowdown if specified
      if (deviceConfig.cpuSlowdown) {
        await page.emulateCPUThrottling(deviceConfig.cpuSlowdown);
      }

      // Start performance monitoring
      await page.evaluateOnNewDocument(() => {
        window.performance.mark('page-start');
      });

      // Navigate to the application
      const startTime = Date.now();
      await page.goto(this.testUrl, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
      const loadTime = Date.now() - startTime;

      // Wait for Phaser to initialize
      await page.waitForSelector('canvas', { timeout: 10000 });

      // Measure initial performance metrics
      const initialMetrics = await this.measurePerformanceMetrics(page);

      // Run gameplay simulation
      const gameplayMetrics = await this.simulateGameplay(page, deviceConfig);

      // Measure final performance metrics
      const finalMetrics = await this.measurePerformanceMetrics(page);

      return {
        device: deviceConfig.name,
        loadTime: loadTime,
        initialMetrics: initialMetrics,
        gameplayMetrics: gameplayMetrics,
        finalMetrics: finalMetrics,
        score: this.calculateDeviceScore(loadTime, initialMetrics, gameplayMetrics, finalMetrics)
      };

    } catch (error) {
      console.error(`❌ Device benchmark failed for ${deviceConfig.name}:`, error.message);
      return {
        device: deviceConfig.name,
        error: error.message,
        score: 0
      };
    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
    }
  }

  async measurePerformanceMetrics(page) {
    return await page.evaluate(() => {
      const perf = window.performance;
      const timing = perf.timing;
      const memory = perf.memory;

      // Calculate timing metrics
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
      const firstPaint = perf.getEntriesByName('first-paint')[0]?.startTime || 0;

      // Memory metrics
      const memoryUsage = memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      } : null;

      // Resource timing
      const resources = perf.getEntriesByType('resource');
      const resourceTiming = {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        averageLoadTime: resources.length > 0 ?
          resources.reduce((sum, r) => sum + (r.responseEnd - r.requestStart), 0) / resources.length : 0
      };

      return {
        loadTime,
        domReady,
        firstPaint,
        memoryUsage,
        resourceTiming,
        timestamp: Date.now()
      };
    });
  }

  async simulateGameplay(page, deviceConfig) {
    const metrics = {
      actionsPerformed: 0,
      averageResponseTime: 0,
      errors: 0,
      frameRate: 0
    };

    try {
      // Wait for the game menu to load
      await page.waitForTimeout(2000);

      // Simulate clicking on a game (try the first game button)
      const gameButtons = await page.$$('.game-button, button, [role="button"]');
      if (gameButtons.length > 0) {
        const startTime = Date.now();

        // Click the first game button
        await gameButtons[0].click();
        metrics.actionsPerformed++;

        // Wait for game to load
        await page.waitForTimeout(1000);

        // Simulate some basic interactions based on device type
        if (deviceConfig.hasTouch) {
          // Simulate touch interactions for mobile/tablet
          await page.touchscreen.tap(200, 300);
          metrics.actionsPerformed++;

          await page.waitForTimeout(500);

          await page.touchscreen.tap(250, 350);
          metrics.actionsPerformed++;
        } else {
          // Simulate mouse interactions for desktop
          await page.mouse.click(200, 300, { button: 'left' });
          metrics.actionsPerformed++;

          await page.waitForTimeout(500);

          await page.mouse.click(250, 350, { button: 'left' });
          metrics.actionsPerformed++;
        }

        const endTime = Date.now();
        metrics.averageResponseTime = (endTime - startTime) / metrics.actionsPerformed;

        // Measure frame rate during interaction
        metrics.frameRate = await this.measureFrameRate(page, 2000);
      }

    } catch (error) {
      metrics.errors++;
      metrics.errorMessage = error.message;
    }

    return metrics;
  }

  async measureFrameRate(page, duration = 1000) {
    return await page.evaluate((duration) => {
      return new Promise((resolve) => {
        let frames = 0;
        let lastTime = performance.now();

        function countFrames() {
          frames++;
          const currentTime = performance.now();

          if (currentTime - lastTime >= duration) {
            const fps = frames / ((currentTime - lastTime) / 1000);
            resolve(Math.round(fps));
          } else {
            requestAnimationFrame(countFrames);
          }
        }

        requestAnimationFrame(countFrames);
      });
    }, duration);
  }

  async runNetworkBenchmarks() {
    console.log('\n🌐 Running Network Performance Benchmarks...');

    const networkResults = {};

    for (const [networkKey, networkConfig] of Object.entries(this.networkConditions)) {
      console.log(`Testing ${networkConfig.name}...`);

      const result = await this.benchmarkNetwork(networkConfig);
      networkResults[networkKey] = result;
    }

    this.results.benchmarks.network = networkResults;
  }

  async benchmarkNetwork(networkConfig) {
    let browser;
    let page;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      page = await browser.newPage();

      // Set network conditions
      const client = await page.target().createCDPSession();
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: networkConfig.download,
        uploadThroughput: networkConfig.upload,
        latency: networkConfig.latency
      });

      // Enable network monitoring
      await client.send('Network.enable');

      let networkRequests = [];
      client.on('Network.responseReceived', (event) => {
        networkRequests.push({
          url: event.response.url,
          status: event.response.status,
          size: event.response.encodedDataLength || 0,
          time: event.response.responseTime || 0
        });
      });

      // Load the application
      const startTime = Date.now();
      await page.goto(this.testUrl, {
        waitUntil: 'networkidle0',
        timeout: 120000 // Longer timeout for slow networks
      });
      const loadTime = Date.now() - startTime;

      // Wait for Phaser
      await page.waitForSelector('canvas', { timeout: 30000 });

      // Calculate network metrics
      const totalSize = networkRequests.reduce((sum, req) => sum + req.size, 0);
      const averageResponseTime = networkRequests.length > 0 ?
        networkRequests.reduce((sum, req) => sum + req.time, 0) / networkRequests.length : 0;

      return {
        network: networkConfig.name,
        loadTime: loadTime,
        totalRequests: networkRequests.length,
        totalSize: totalSize,
        averageResponseTime: averageResponseTime,
        score: this.calculateNetworkScore(loadTime, networkRequests)
      };

    } catch (error) {
      console.error(`❌ Network benchmark failed for ${networkConfig.name}:`, error.message);
      return {
        network: networkConfig.name,
        error: error.message,
        score: 0
      };
    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
    }
  }

  async runMemoryBenchmarks() {
    console.log('\n💾 Running Memory Usage Benchmarks...');

    const memoryResults = await this.benchmarkMemory();

    this.results.benchmarks.memory = memoryResults;
  }

  async benchmarkMemory() {
    let browser;
    let page;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--max-old-space-size=512']
      });

      page = await browser.newPage();

      // Load the application
      await page.goto(this.testUrl, { waitUntil: 'networkidle0' });
      await page.waitForSelector('canvas', { timeout: 10000 });

      // Initial memory measurement
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      // Simulate gameplay to stress test memory
      await this.simulateGameplay(page, this.devices.desktop);

      // Memory after gameplay
      const gameplayMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });

      await page.waitForTimeout(1000);

      // Memory after GC
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      return {
        initialMemory,
        gameplayMemory,
        finalMemory,
        memoryIncrease: gameplayMemory && initialMemory ?
          gameplayMemory.used - initialMemory.used : 0,
        memoryEfficiency: finalMemory && initialMemory ?
          ((finalMemory.used / initialMemory.used) * 100) : 100
      };

    } catch (error) {
      console.error('❌ Memory benchmark failed:', error.message);
      return { error: error.message };
    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
    }
  }

  async runFrameRateBenchmarks() {
    console.log('\n🎬 Running Frame Rate Benchmarks...');

    const frameRateResults = {};

    for (const [deviceKey, deviceConfig] of Object.entries(this.devices)) {
      console.log(`Testing frame rate on ${deviceConfig.name}...`);

      const result = await this.benchmarkFrameRate(deviceConfig);
      frameRateResults[deviceKey] = result;
    }

    this.results.benchmarks.frameRate = frameRateResults;
  }

  async benchmarkFrameRate(deviceConfig) {
    let browser;
    let page;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      page = await browser.newPage();

      // Set device configuration
      await page.setViewport(deviceConfig.viewport);
      await page.setUserAgent(deviceConfig.userAgent);

      // Load the application
      await page.goto(this.testUrl, { waitUntil: 'networkidle0' });
      await page.waitForSelector('canvas', { timeout: 10000 });

      // Measure baseline frame rate
      const baselineFps = await this.measureFrameRate(page, 2000);

      // Start gameplay and measure during gameplay
      await this.simulateGameplay(page, deviceConfig);

      // Measure gameplay frame rate
      const gameplayFps = await this.measureFrameRate(page, 2000);

      return {
        device: deviceConfig.name,
        baselineFps: baselineFps,
        gameplayFps: gameplayFps,
        averageFps: (baselineFps + gameplayFps) / 2,
        stable60Fps: baselineFps >= 55 && gameplayFps >= 55,
        score: this.calculateFrameRateScore(baselineFps, gameplayFps)
      };

    } catch (error) {
      console.error(`❌ Frame rate benchmark failed for ${deviceConfig.name}:`, error.message);
      return {
        device: deviceConfig.name,
        error: error.message,
        score: 0
      };
    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
    }
  }

  calculateDeviceScore(loadTime, initialMetrics, gameplayMetrics, finalMetrics) {
    let score = 100;

    // Penalize slow load times
    if (loadTime > 10000) score -= 30; // 10 seconds
    else if (loadTime > 5000) score -= 15; // 5 seconds
    else if (loadTime > 3000) score -= 5;  // 3 seconds

    // Penalize high memory usage
    if (finalMetrics.memoryUsage && finalMetrics.memoryUsage.usagePercent > 70) {
      score -= 20;
    }

    // Penalize poor gameplay performance
    if (gameplayMetrics.errors > 0) score -= 10;
    if (gameplayMetrics.averageResponseTime > 1000) score -= 15;

    return Math.max(0, score);
  }

  calculateNetworkScore(loadTime, requests) {
    let score = 100;

    // Penalize slow load times
    if (loadTime > 30000) score -= 40; // 30 seconds on slow network
    else if (loadTime > 15000) score -= 20; // 15 seconds
    else if (loadTime > 8000) score -= 10;  // 8 seconds

    // Penalize too many requests
    if (requests.length > 50) score -= 10;

    return Math.max(0, score);
  }

  calculateFrameRateScore(baselineFps, gameplayFps) {
    const averageFps = (baselineFps + gameplayFps) / 2;
    let score = 100;

    if (averageFps < 30) score -= 50; // Very poor performance
    else if (averageFps < 45) score -= 25; // Poor performance
    else if (averageFps < 55) score -= 10; // Below 60fps target

    return Math.max(0, score);
  }

  generateBenchmarkReport() {
    console.log('\n📊 Performance Benchmark Report');
    console.log('=' .repeat(60));

    const benchmarks = this.results.benchmarks;

    // Device performance summary
    if (benchmarks.devices) {
      console.log('\n📱 Device Performance:');
      Object.values(benchmarks.devices).forEach(device => {
        const score = device.score || 0;
        const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'F';
        console.log(`  ${device.device}: ${grade} (${score}/100)`);
      });
    }

    // Network performance summary
    if (benchmarks.network) {
      console.log('\n🌐 Network Performance:');
      Object.values(benchmarks.network).forEach(network => {
        const score = network.score || 0;
        const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'F';
        console.log(`  ${network.network}: ${grade} (${score}/100) - ${network.loadTime}ms`);
      });
    }

    // Frame rate summary
    if (benchmarks.frameRate) {
      console.log('\n🎬 Frame Rate Performance:');
      Object.values(benchmarks.frameRate).forEach(device => {
        const fps = device.averageFps || 0;
        const stable = device.stable60Fps ? '✅' : '❌';
        console.log(`  ${device.device}: ${fps} FPS ${stable}`);
      });
    }

    // Memory summary
    if (benchmarks.memory) {
      console.log('\n💾 Memory Usage:');
      const memory = benchmarks.memory;
      if (memory.initialMemory && memory.finalMemory) {
        const increase = memory.memoryIncrease / 1024 / 1024; // MB
        console.log(`  Memory Increase: ${increase.toFixed(1)} MB`);
        console.log(`  Memory Efficiency: ${memory.memoryEfficiency.toFixed(1)}%`);
      }
    }

    // Overall assessment
    const overallScore = this.calculateOverallScore();
    this.results.summary.overallScore = overallScore;

    const grade = overallScore >= 80 ? 'A' : overallScore >= 60 ? 'B' :
                  overallScore >= 40 ? 'C' : overallScore >= 20 ? 'D' : 'F';

    console.log(`\n🏆 Overall Performance Grade: ${grade} (${overallScore}/100)`);

    // Generate recommendations
    this.generateRecommendations();

    console.log('\n📋 Recommendations:');
    this.results.summary.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }

  calculateOverallScore() {
    let totalScore = 0;
    let benchmarkCount = 0;

    // Average device scores
    if (this.results.benchmarks.devices) {
      const deviceScores = Object.values(this.results.benchmarks.devices)
        .map(d => d.score || 0);
      if (deviceScores.length > 0) {
        totalScore += deviceScores.reduce((sum, score) => sum + score, 0) / deviceScores.length;
        benchmarkCount++;
      }
    }

    // Average network scores
    if (this.results.benchmarks.network) {
      const networkScores = Object.values(this.results.benchmarks.network)
        .map(n => n.score || 0);
      if (networkScores.length > 0) {
        totalScore += networkScores.reduce((sum, score) => sum + score, 0) / networkScores.length;
        benchmarkCount++;
      }
    }

    // Frame rate scores
    if (this.results.benchmarks.frameRate) {
      const frameRateScores = Object.values(this.results.benchmarks.frameRate)
        .map(f => f.score || 0);
      if (frameRateScores.length > 0) {
        totalScore += frameRateScores.reduce((sum, score) => sum + score, 0) / frameRateScores.length;
        benchmarkCount++;
      }
    }

    return benchmarkCount > 0 ? Math.round(totalScore / benchmarkCount) : 0;
  }

  generateRecommendations() {
    const recommendations = [];
    const benchmarks = this.results.benchmarks;

    // Device performance recommendations
    if (benchmarks.devices) {
      const slowDevices = Object.values(benchmarks.devices)
        .filter(d => (d.score || 0) < 60);

      if (slowDevices.length > 0) {
        recommendations.push(`Optimize performance for ${slowDevices.map(d => d.device).join(', ')}`);
      }
    }

    // Network recommendations
    if (benchmarks.network) {
      const slowNetworks = Object.values(benchmarks.network)
        .filter(n => (n.score || 0) < 60);

      if (slowNetworks.length > 0) {
        recommendations.push('Implement progressive loading and asset optimization for slow networks');
      }
    }

    // Frame rate recommendations
    if (benchmarks.frameRate) {
      const lowFrameRate = Object.values(benchmarks.frameRate)
        .filter(f => (f.averageFps || 0) < 50);

      if (lowFrameRate.length > 0) {
        recommendations.push('Optimize rendering pipeline for better frame rates');
      }
    }

    // Memory recommendations
    if (benchmarks.memory && benchmarks.memory.memoryIncrease > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Implement memory management and object pooling optimizations');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance meets acceptable standards');
      recommendations.push('Continue monitoring performance in production');
    }

    this.results.summary.recommendations = recommendations;
  }

  saveResults() {
    const filename = `performance-benchmark-${Date.now()}.json`;
    const filepath = path.join(process.cwd(), 'test-results', filename);

    // Ensure test-results directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'test-results'))) {
      fs.mkdirSync(path.join(process.cwd(), 'test-results'));
    }

    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Benchmark results saved to: ${filepath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Performance Benchmarking for Lalela Web Games

Usage:
  node benchmark-performance.js [options]

Options:
  --mobile     Run mobile device benchmarks only
  --desktop    Run desktop benchmarks only
  --network    Run network performance benchmarks only
  --help       Show this help message

Examples:
  node benchmark-performance.js              # Run all benchmarks
  node benchmark-performance.js --mobile    # Mobile performance only
  node benchmark-performance.js --desktop   # Desktop performance only

Benchmark Results:
  Results are saved to test-results/ directory
  - performance-benchmark-[timestamp].json (detailed results)
    `);
    return;
  }

  const benchmarker = new PerformanceBenchmarker();

  if (args.includes('--mobile')) {
    await benchmarker.runDeviceBenchmarks();
  } else if (args.includes('--desktop')) {
    // Run only desktop benchmarks (would need to modify the class)
    console.log('Desktop-only benchmarking not implemented yet');
  } else if (args.includes('--network')) {
    await benchmarker.runNetworkBenchmarks();
  } else {
    // Run all benchmarks
    await benchmarker.runAllBenchmarks();
  }
}

// Export for use in other modules
module.exports = PerformanceBenchmarker;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}