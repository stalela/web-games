/**
 * ObjectPool - Efficient object pooling for Phaser game objects
 * Reduces garbage collection and improves performance by reusing objects
 */
export class ObjectPool {
  constructor(scene, objectType, initialSize = 10, maxSize = 100) {
    this.scene = scene;
    this.objectType = objectType;
    this.initialSize = initialSize;
    this.maxSize = maxSize;

    this.available = [];
    this.inUse = new Set();
    this.createFunctions = new Map();

    // Initialize the pool
    this.initialize();
  }

  /**
   * Initialize the object pool
   */
  initialize() {
    // Only initialize if scene is ready
    if (!this.scene || !this.scene.add) {
      console.warn(`ObjectPool: Scene not ready for ${this.objectType}, skipping initialization`);
      return;
    }

    for (let i = 0; i < this.initialSize; i++) {
      try {
        const object = this.createObject();
        if (object) {
          this.available.push(object);
        }
      } catch (error) {
        console.warn(`Failed to create ${this.objectType} object:`, error);
      }
    }
  }

  /**
   * Create a new object (override in subclasses for specific object types)
   */
  createObject() {
    switch (this.objectType) {
      case 'rectangle':
        return this.scene.add.rectangle(0, 0, 50, 50, 0xFFFFFF);
      case 'circle':
        return this.scene.add.circle(0, 0, 25, 0xFFFFFF);
      case 'text':
        return this.scene.add.text(0, 0, '', { fontSize: '16px', color: '#000000' });
      case 'sprite':
        return this.scene.add.sprite(0, 0, 'default');
      case 'container':
        return this.scene.add.container(0, 0);
      case 'graphics':
        return this.scene.add.graphics();
      default:
        console.warn(`Unknown object type: ${this.objectType}`);
        return null;
    }
  }

  /**
   * Get an object from the pool
   */
  get(config = {}) {
    let object = this.available.pop();

    if (!object) {
      // Pool is empty, create new object if under max size
      if (this.inUse.size < this.maxSize) {
        object = this.createObject();
      } else {
        console.warn('Object pool exhausted, consider increasing maxSize');
        return null;
      }
    }

    // Configure the object
    this.configureObject(object, config);

    // Mark as in use
    this.inUse.add(object);

    return object;
  }

  /**
   * Configure object properties
   */
  configureObject(object, config) {
    if (!object) return;

    // Common properties
    if (config.x !== undefined) object.x = config.x;
    if (config.y !== undefined) object.y = config.y;
    if (config.alpha !== undefined) object.alpha = config.alpha;
    if (config.visible !== undefined) object.visible = config.visible;
    if (config.scale !== undefined) {
      if (typeof config.scale === 'number') {
        object.setScale(config.scale);
      } else if (config.scale.x !== undefined && config.scale.y !== undefined) {
        object.setScale(config.scale.x, config.scale.y);
      }
    }

    // Type-specific properties
    switch (this.objectType) {
      case 'rectangle':
        if (config.width) object.width = config.width;
        if (config.height) object.height = config.height;
        if (config.fillColor !== undefined) object.setFillStyle(config.fillColor, config.fillAlpha || 1);
        if (config.strokeColor !== undefined) object.setStrokeStyle(config.strokeWidth || 2, config.strokeColor);
        break;

      case 'circle':
        if (config.radius) object.radius = config.radius;
        if (config.fillColor !== undefined) object.setFillStyle(config.fillColor, config.fillAlpha || 1);
        if (config.strokeColor !== undefined) object.setStrokeStyle(config.strokeWidth || 2, config.strokeColor);
        break;

      case 'text':
        if (config.text !== undefined) object.setText(config.text);
        if (config.fontSize) object.setFontSize(config.fontSize);
        if (config.color) object.setColor(config.color);
        if (config.fontFamily) object.setFontFamily(config.fontFamily);
        break;

      case 'sprite':
        if (config.texture) object.setTexture(config.texture, config.frame);
        if (config.tint !== undefined) object.setTint(config.tint);
        break;

      case 'graphics':
        // Graphics objects need to be cleared and redrawn
        object.clear();
        if (config.drawFunction) {
          config.drawFunction(object);
        }
        break;
    }
  }

  /**
   * Return an object to the pool
   */
  release(object) {
    if (!object || !this.inUse.has(object)) {
      return;
    }

    // Reset object to default state
    this.resetObject(object);

    // Remove from in-use set
    this.inUse.delete(object);

    // Add to available pool if not at max capacity
    if (this.available.length < this.maxSize) {
      this.available.push(object);
    } else {
      // Destroy object if pool is full
      object.destroy();
    }
  }

  /**
   * Reset object to default state
   */
  resetObject(object) {
    if (!object) return;

    // Common reset properties
    object.alpha = 1;
    object.visible = false;
    object.setScale(1);
    object.clearTint();

    // Stop any tweens
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.killTweensOf(object);
    }

    // Type-specific reset
    switch (this.objectType) {
      case 'rectangle':
      case 'circle':
        object.setFillStyle(0xFFFFFF, 0);
        object.setStrokeStyle(0, 0x000000, 0);
        break;

      case 'text':
        object.setText('');
        object.setColor('#000000');
        break;

      case 'sprite':
        object.setTexture('default');
        object.clearTint();
        break;

      case 'graphics':
        object.clear();
        break;
    }
  }

  /**
   * Release all objects back to pool
   */
  releaseAll() {
    const inUseObjects = Array.from(this.inUse);
    inUseObjects.forEach(object => this.release(object));
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      objectType: this.objectType,
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
      maxSize: this.maxSize,
      utilization: this.inUse.size / (this.available.length + this.inUse.size)
    };
  }

  /**
   * Resize the pool
   */
  resize(newMaxSize) {
    this.maxSize = newMaxSize;

    // Remove excess available objects
    while (this.available.length > newMaxSize) {
      const object = this.available.pop();
      object.destroy();
    }
  }

  /**
   * Clean up the pool
   */
  destroy() {
    // Destroy all available objects
    this.available.forEach(object => {
      if (object && object.destroy) {
        object.destroy();
      }
    });

    // Destroy all in-use objects
    this.inUse.forEach(object => {
      if (object && object.destroy) {
        object.destroy();
      }
    });

    this.available = [];
    this.inUse.clear();
  }
}

/**
 * Specialized pool for game-specific objects
 */
export class GameObjectPool extends ObjectPool {
  constructor(scene, gameType, initialSize = 20, maxSize = 200) {
    super(scene, 'container', initialSize, maxSize);
    this.gameType = gameType;
  }

  createObject() {
    return this.scene.add.container(0, 0);
  }

  configureObject(container, config) {
    super.configureObject(container, config);

    // Add game-specific objects based on type
    switch (this.gameType) {
      case 'memory-card':
        // Add card background and content
        const cardBg = this.scene.add.rectangle(0, 0, 80, 100, 0xFFFFFF);
        const cardContent = this.scene.add.text(0, 0, '?', {
          fontSize: '32px',
          color: '#000000',
          fontFamily: 'Nunito, sans-serif'
        }).setOrigin(0.5);

        container.add([cardBg, cardContent]);
        container.cardBg = cardBg;
        container.cardContent = cardContent;
        break;

      case 'draggable-tile':
        // Add tile background and text
        const tileBg = this.scene.add.rectangle(0, 0, 50, 50, 0x3498db);
        const tileText = this.scene.add.text(0, 0, '', {
          fontSize: '24px',
          color: '#FFFFFF',
          fontFamily: 'Nunito, sans-serif'
        }).setOrigin(0.5);

        container.add([tileBg, tileText]);
        container.tileBg = tileBg;
        container.tileText = tileText;
        break;

      case 'particle':
        // Add small particle effect
        const particle = this.scene.add.circle(0, 0, 3, 0xFFD93D, 0.8);
        container.add(particle);
        container.particle = particle;
        break;
    }
  }

  resetObject(container) {
    super.resetObject(container);

    // Reset game-specific properties
    switch (this.gameType) {
      case 'memory-card':
        if (container.cardBg) {
          container.cardBg.setFillStyle(0xFFFFFF);
          container.cardBg.setStrokeStyle(2, 0x000000);
        }
        if (container.cardContent) {
          container.cardContent.setText('?');
          container.cardContent.setColor('#000000');
        }
        break;

      case 'draggable-tile':
        if (container.tileBg) {
          container.tileBg.setFillStyle(0x3498db);
        }
        if (container.tileText) {
          container.tileText.setText('');
          container.tileText.setColor('#FFFFFF');
        }
        break;

      case 'particle':
        if (container.particle) {
          container.particle.setFillStyle(0xFFD93D, 0.8);
        }
        break;
    }
  }
}

/**
 * Tween pool for efficient animation management
 */
export class TweenPool {
  constructor(scene, maxSize = 50) {
    this.scene = scene;
    this.maxSize = maxSize;
    this.activeTweens = new Set();
    this.availableTweens = [];
  }

  /**
   * Get a tween from the pool
   */
  get(config) {
    let tween = this.availableTweens.pop();

    if (!tween) {
      tween = this.scene.tweens.add({
        targets: config.targets || [],
        duration: 1000,
        ease: 'Power2',
        ...config
      });
    } else {
      // Reconfigure existing tween
      tween.targets = config.targets || [];
      tween.duration = config.duration || 1000;
      tween.ease = config.ease || 'Power2';
      Object.assign(tween, config);
    }

    this.activeTweens.add(tween);
    return tween;
  }

  /**
   * Release a tween back to the pool
   */
  release(tween) {
    if (!tween || !this.activeTweens.has(tween)) return;

    tween.removeAllListeners();
    tween.stop();
    tween.targets = [];

    this.activeTweens.delete(tween);

    if (this.availableTweens.length < this.maxSize) {
      this.availableTweens.push(tween);
    }
  }

  /**
   * Release all completed tweens
   */
  releaseCompleted() {
    const completedTweens = Array.from(this.activeTweens).filter(tween => !tween.isPlaying());
    completedTweens.forEach(tween => this.release(tween));
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      active: this.activeTweens.size,
      available: this.availableTweens.length,
      total: this.activeTweens.size + this.availableTweens.length,
      maxSize: this.maxSize
    };
  }

  /**
   * Clean up all tweens
   */
  destroy() {
    this.activeTweens.forEach(tween => {
      tween.stop();
      tween.removeAllListeners();
    });

    this.activeTweens.clear();
    this.availableTweens = [];
  }
}