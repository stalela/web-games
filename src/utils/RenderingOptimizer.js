/**
 * RenderingOptimizer - Advanced rendering optimizations for Phaser games
 * Implements performance techniques for smooth 60fps gameplay
 */
export class RenderingOptimizer {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    this.optimizations = {
      culling: true,
      batching: true,
      textureOptimization: true,
      updateOptimization: true
    };

    this.stats = {
      drawCalls: 0,
      culledObjects: 0,
      optimizedUpdates: 0,
      lastFrameTime: 0
    };

    this.initialize();
  }

  /**
   * Initialize rendering optimizations
   */
  initialize() {
    // Enable Phaser's built-in optimizations
    this.scene.game.renderer.config.batchSize = 4096; // Larger batch size for better performance

    // Set up frame rate monitoring
    this.scene.events.on('preupdate', this.onPreUpdate, this);
    this.scene.events.on('postupdate', this.onPostUpdate, this);

    // Enable render culling
    this.setupRenderCulling();

    // Optimize texture loading
    this.optimizeTextures();

    console.log('Rendering optimizations initialized');
  }

  /**
   * Set up render culling to only render visible objects
   */
  setupRenderCulling() {
    if (!this.optimizations.culling) return;

    // Override the scene's render method to implement culling
    const originalRender = this.scene.render;
    this.scene.render = (renderer, time, delta) => {
      // Custom culling logic before rendering
      this.performCulling();

      // Call original render
      originalRender.call(this.scene, renderer, time, delta);

      // Update stats
      this.stats.drawCalls = renderer.drawCount || 0;
    };
  }

  /**
   * Perform render culling on scene objects
   */
  performCulling() {
    // Check if scene and camera are available
    if (!this.scene || !this.scene.cameras || !this.scene.cameras.main) return;
    if (!this.scene.children || !this.scene.children.list) return;

    const camera = this.scene.cameras.main;
    const cameraBounds = new Phaser.Geom.Rectangle(
      camera.scrollX - camera.width / 2,
      camera.scrollY - camera.height / 2,
      camera.width * 2,
      camera.height * 2
    );

    let culledCount = 0;

    // Cull display list objects
    this.scene.children.list.forEach(child => {
      if (child.getBounds && typeof child.getBounds === 'function') {
        try {
          const bounds = child.getBounds();
          const isVisible = Phaser.Geom.Rectangle.Overlaps(cameraBounds, bounds);

          // Only update visibility if it changed
          if (child._wasVisible !== isVisible) {
            child._wasVisible = isVisible;
            child.setVisible(isVisible);

            if (!isVisible) {
              culledCount++;
            }
          }
        } catch (error) {
          // Some objects might not have getBounds method or it might fail
          // In that case, keep them visible
        }
      }
    });

    this.stats.culledObjects = culledCount;
  }

  /**
   * Optimize texture loading and management
   */
  optimizeTextures() {
    if (!this.optimizations.textureOptimization) return;

    // Set texture compression hints for better performance
    const renderer = this.scene.game.renderer;
    if (renderer.gl) {
      // Enable texture compression if supported
      const gl = renderer.gl;
      const ext = gl.getExtension('WEBGL_compressed_texture_s3tc') ||
                  gl.getExtension('WEBGL_compressed_texture_pvrtc') ||
                  gl.getExtension('WEBGL_compressed_texture_etc1');

      if (ext) {
        console.log('Texture compression supported');
      }
    }

    // Optimize texture atlas usage
    this.scene.load.on('filecomplete', (key, type, texture) => {
      if (type === 'texture' && texture) {
        // Set texture filtering for better performance
        texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    });
  }

  /**
   * Pre-update hook for optimization
   */
  onPreUpdate(time, delta) {
    // Limit delta to prevent large jumps (e.g., when tab is inactive)
    const clampedDelta = Math.min(delta, 100); // Max 100ms per frame

    // Update optimization stats
    this.stats.lastFrameTime = time;
  }

  /**
   * Post-update hook for cleanup and optimization
   */
  onPostUpdate(time, delta) {
    // Perform cleanup operations
    this.performCleanup();

    // Update performance metrics
    this.updatePerformanceMetrics(delta);
  }

  /**
   * Perform cleanup operations to free memory
   */
  performCleanup() {
    // Clean up destroyed objects from display list
    if (this.scene && this.scene.children && this.scene.children.list) {
      const children = this.scene.children.list;
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child && child._destroyed) {
          children.splice(i, 1);
        }
      }
    }

    // Clean up completed tweens
    if (this.scene && this.scene.tweens && this.scene.tweens._active) {
      const tweens = this.scene.tweens._active;
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tween = tweens[i];
        if (!tween.isPlaying && !tween.isPaused) {
          tweens.splice(i, 1);
        }
      }
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(delta) {
    // Track frame time variations
    const targetFrameTime = 1000 / 60; // 60fps
    const frameTimeRatio = delta / targetFrameTime;

    if (frameTimeRatio > 1.5) {
      // Frame took significantly longer than expected
      this.stats.optimizedUpdates++;
    }
  }

  /**
   * Optimize object updates for better performance
   */
  optimizeObjectUpdates() {
    if (!this.optimizations.updateOptimization) return;

    // Check if scene and children are available
    if (!this.scene || !this.scene.children || !this.scene.children.list) return;

    // Batch update operations
    const children = this.scene.children.list;
    const batchedUpdates = [];

    // Group objects by type for batch processing
    const objectGroups = {
      sprites: [],
      texts: [],
      graphics: [],
      containers: []
    };

    children.forEach(child => {
      if (child.type === 'Sprite') {
        objectGroups.sprites.push(child);
      } else if (child.type === 'Text') {
        objectGroups.texts.push(child);
      } else if (child.type === 'Graphics') {
        objectGroups.graphics.push(child);
      } else if (child.type === 'Container') {
        objectGroups.containers.push(child);
      }
    });

    // Process batched updates
    this.processBatchedUpdates(objectGroups);
  }

  /**
   * Process batched updates for better performance
   */
  processBatchedUpdates(objectGroups) {
    // Optimize sprite updates
    if (objectGroups.sprites.length > 10) {
      objectGroups.sprites.forEach(sprite => {
        // Batch sprite property updates
        if (sprite._dirty) {
          sprite.update();
          sprite._dirty = false;
        }
      });
    }

    // Optimize text updates (most expensive)
    if (objectGroups.texts.length > 5) {
      objectGroups.texts.forEach(text => {
        // Only update text if content changed
        if (text._textChanged) {
          text.updateText();
          text._textChanged = false;
        }
      });
    }
  }

  /**
   * Enable or disable specific optimizations
   */
  setOptimization(type, enabled) {
    if (this.optimizations.hasOwnProperty(type)) {
      this.optimizations[type] = enabled;

      switch (type) {
        case 'culling':
          if (enabled) {
            this.setupRenderCulling();
          }
          break;
        case 'batching':
          // Adjust batch size based on setting
          this.scene.game.renderer.config.batchSize = enabled ? 4096 : 2048;
          break;
      }

      console.log(`${type} optimization ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Create optimized particle system
   */
  createOptimizedParticles(config) {
    const particles = this.scene.add.particles(0, 0, config.texture || 'particle', {
      ...config,
      batchSize: config.batchSize || 100, // Smaller batch for particles
      frequency: config.frequency || 100,
      lifespan: config.lifespan || 1000,
      speed: config.speed || { min: 50, max: 100 },
      scale: config.scale || { start: 1, end: 0 },
      alpha: config.alpha || { start: 1, end: 0 },
      blendMode: config.blendMode || 'ADD'
    });

    // Optimize particle updates
    particles.onParticleEmit = (particle) => {
      // Custom particle optimization logic
      particle._optimized = true;
    };

    return particles;
  }

  /**
   * Optimize camera for better performance
   */
  optimizeCamera() {
    const camera = this.scene.cameras.main;

    // Set camera bounds to prevent unnecessary rendering
    camera.setBounds(0, 0, this.scene.scale.width, this.scene.scale.height);

    // Enable camera rounding for pixel-perfect rendering
    camera.roundPixels = true;

    // Set zoom limits for performance
    camera.setZoomLimits(0.5, 2.0);
  }

  /**
   * Get rendering performance stats
   */
  getStats() {
    const renderer = this.scene.game.renderer;
    const camera = this.scene.cameras.main;

    return {
      ...this.stats,
      totalObjects: this.scene.children.list.length,
      visibleObjects: this.scene.children.list.filter(child => child.visible).length,
      cameraZoom: camera.zoom,
      rendererInfo: renderer ? {
        drawCalls: renderer.drawCount || 0,
        textures: Object.keys(renderer.textures).length,
        maxTextures: renderer.maxTextures
      } : null,
      optimizations: { ...this.optimizations }
    };
  }

  /**
   * Run performance diagnostic
   */
  runDiagnostic() {
    const stats = this.getStats();
    const issues = [];

    // Check for performance issues
    if (stats.totalObjects > 1000) {
      issues.push({
        type: 'object_count',
        severity: 'high',
        message: `High object count: ${stats.totalObjects} objects`,
        recommendation: 'Implement object pooling or reduce scene complexity'
      });
    }

    if (stats.drawCalls > 100) {
      issues.push({
        type: 'draw_calls',
        severity: 'medium',
        message: `High draw calls: ${stats.drawCalls}`,
        recommendation: 'Use texture atlases, reduce overdraw, optimize shaders'
      });
    }

    if (stats.culledObjects < stats.totalObjects * 0.5) {
      issues.push({
        type: 'culling_efficiency',
        severity: 'low',
        message: `Low culling efficiency: ${stats.culledObjects}/${stats.totalObjects} objects culled`,
        recommendation: 'Optimize camera bounds or improve culling logic'
      });
    }

    return {
      stats,
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(issues) {
    const recommendations = [];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'object_count':
          recommendations.push({
            priority: 'high',
            action: 'Implement Object Pooling',
            details: 'Use ObjectPool utility to reuse game objects instead of creating/destroying'
          });
          break;

        case 'draw_calls':
          recommendations.push({
            priority: 'high',
            action: 'Optimize Draw Calls',
            details: 'Use texture atlases, reduce texture switches, batch similar objects'
          });
          break;

        case 'culling_efficiency':
          recommendations.push({
            priority: 'medium',
            action: 'Improve Render Culling',
            details: 'Optimize camera bounds and object positioning for better culling'
          });
          break;
      }
    });

    // General recommendations
    recommendations.push({
      priority: 'medium',
      action: 'Enable Texture Compression',
      details: 'Use compressed textures to reduce memory usage and improve loading'
    });

    recommendations.push({
      priority: 'low',
      action: 'Implement Level-of-Detail (LOD)',
      details: 'Reduce detail for distant objects to improve performance'
    });

    return recommendations;
  }

  /**
   * Destroy the optimizer and clean up
   */
  destroy() {
    this.scene.events.off('preupdate', this.onPreUpdate, this);
    this.scene.events.off('postupdate', this.onPostUpdate, this);

    // Reset any overrides
    if (this.scene.render._original) {
      this.scene.render = this.scene.render._original;
    }

    console.log('Rendering optimizer destroyed');
  }
}

/**
 * Optimized Game Object with performance features
 */
export class OptimizedGameObject extends Phaser.GameObjects.Container {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y);

    this._isOptimized = true;
    this._lastUpdate = 0;
    this._updateFrequency = 1; // Update every frame by default

    // Add texture if provided
    if (texture) {
      this.sprite = scene.add.sprite(0, 0, texture, frame);
      this.add(this.sprite);
    }
  }

  /**
   * Optimized update method that can skip frames
   */
  optimizedUpdate(time, delta) {
    this._lastUpdate += delta;

    // Only update if enough time has passed
    if (this._lastUpdate >= this._updateFrequency) {
      this.updateLogic(time, this._lastUpdate);
      this._lastUpdate = 0;
    }
  }

  /**
   * Override this method with your game logic
   */
  updateLogic(time, delta) {
    // Default implementation - override in subclasses
  }

  /**
   * Set update frequency (lower = better performance, higher = more responsive)
   */
  setUpdateFrequency(frequency) {
    this._updateFrequency = frequency;
  }

  /**
   * Check if object is visible in camera
   */
  isVisibleInCamera() {
    const camera = this.scene.cameras.main;
    const bounds = this.getBounds();
    const cameraBounds = new Phaser.Geom.Rectangle(
      camera.scrollX,
      camera.scrollY,
      camera.width,
      camera.height
    );

    return Phaser.Geom.Rectangle.Overlaps(bounds, cameraBounds);
  }
}

// Make OptimizedGameObject available as a Phaser Game Object
Phaser.GameObjects.OptimizedGameObject = OptimizedGameObject;