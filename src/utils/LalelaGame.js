/**
 * LalelaGame - Base class for all Lalela educational games
 * Provides common functionality and lifecycle management
 */
import { PerformanceMonitor } from './PerformanceMonitor.js';
import { ObjectPool, GameObjectPool, TweenPool } from './ObjectPool.js';
import { HelpSystem } from './HelpSystem.js';
import { RenderingOptimizer } from './RenderingOptimizer.js';

export class LalelaGame extends Phaser.Scene {
  constructor(config = {}) {
    super(config);

    // Game configuration
    this.gameConfig = {
      id: config.id || 'unknown',
      name: config.name || 'Unknown Game',
      category: config.category || 'general',
      difficulty: config.difficulty || 1,
      description: config.description || '',
      ...config
    };

    // Game state
    this.gameState = 'initializing';
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.timeRemaining = 0;

    // UI elements
    this.uiElements = {};

    // Game data
    this.levelData = null;
    this.gameData = null;

    // Managers (injected)
    this.assetManager = null;
    this.uiManager = null;
    this.gameManager = null;

    // Performance optimizations
    this.objectPools = new Map();
    this.tweenPool = null;
    this.renderingOptimizer = null;
    this.helpSystem = null;
    this.performanceMonitor = null;
  }

  /**
   * Initialize game with managers
   */
  init(data) {
    // Store injected managers
    this.assetManager = data.assetManager;
    this.uiManager = data.uiManager;
    this.gameManager = data.gameManager;

    // Initialize game data
    this.gameData = data.gameData || {};

    // Setup game
    this.setupGame();
  }

  /**
   * Setup game before preload
   */
  setupGame() {
    this.gameState = 'setup';

    // Set up input
    this.setupInput();

    // Set up camera and world bounds
    this.setupCamera();

    // Load saved progress
    this.loadProgress();
  }

  /**
   * Shuffle an array in place
   * @param {Array} array - Array to shuffle
   * @returns {Array} - Shuffled array
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Get safe area for UI placement
   * @returns {Phaser.Geom.Rectangle} Safe area rectangle
   */
  getSafeArea() {
    const { width, height } = this.cameras.main;
    // Simple implementation: 90% of screen centered
    const marginX = width * 0.05;
    const marginY = height * 0.05;
    return new Phaser.Geom.Rectangle(
      marginX,
      marginY,
      width - marginX * 2,
      height - marginY * 2
    );
  }

  /**
   * Create bottom navigation dock (GCompris style)
   * @param {number} width - Screen width
   * @param {number} height - Screen height
   */
  createNavigationDock(width, height) {
    const dockY = height - 80;
    const buttonSize = 90;
    const spacing = 130;

    // Dock background
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.95);
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);
    dockBg.setScrollFactor(0).setDepth(100);

    // Dock shadow
    const dockShadow = this.add.graphics();
    dockShadow.fillStyle(0x000000, 0.3);
    dockShadow.fillRoundedRect(width / 2 - (width - 60) / 2 + 4, dockY - 56, width - 60, 120, 60);
    dockShadow.setScrollFactor(0).setDepth(99);

    // Dock border
    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(5, 0x0062FF, 1);
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);
    dockBorder.setScrollFactor(0).setDepth(100);

    const controls = [
      { icon: 'help', action: 'help', color: 0x00B378, label: 'Help' },
      { icon: 'home', action: 'home', color: 0x0062FF, label: 'Home' },
      { icon: 'settings', action: 'levels', color: 0xFACA2A, label: 'Levels' },
      { icon: 'exit', action: 'menu', color: 0xAB47BC, label: 'Menu' }
    ];

    const totalWidth = (controls.length - 1) * spacing + buttonSize;
    const startX = (width - totalWidth) / 2 + buttonSize / 2;

    controls.forEach((control, index) => {
      const x = startX + index * spacing;

      // Button background
      const buttonShadow = this.add.circle(x + 4, dockY + 4, buttonSize / 2, 0x000000, 0.4);
      buttonShadow.setScrollFactor(0).setDepth(101);
      
      const button = this.add.circle(x, dockY, buttonSize / 2, control.color);
      button.setStrokeStyle(5, 0xFFFFFF);
      button.setInteractive({ useHandCursor: true });
      button.setScrollFactor(0).setDepth(102);

      // Icon
      // Note: Icons should be loaded in preload() of the game or base class
      // We assume they are loaded as 'help', 'home', 'settings', 'exit'
      // If they are loaded with .svg extension in key, we need to handle that.
      // In LouisBrailleGame we loaded them as 'help', 'home' etc.
      const icon = this.add.image(x, dockY, control.icon);
      icon.setScale((buttonSize * 0.6) / Math.max(icon.width, icon.height));
      icon.setTint(0xFFFFFF);
      icon.setScrollFactor(0).setDepth(103);

      // Label
      const label = this.add.text(x, dockY + buttonSize / 2 + 25, control.label, {
        fontSize: '20px',
        color: '#101012',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#FFFFFF',
        strokeThickness: 4
      }).setOrigin(0.5);
      label.setScrollFactor(0).setDepth(103);

      // Interactions
      button.on('pointerdown', () => {
        this.tweens.add({
          targets: [button, icon],
          scale: 0.9,
          duration: 100,
          yoyo: true
        });
        
        if (this.audioManager) this.audioManager.playClickSound();

        if (control.action === 'menu') {
          this.scene.start('GameMenu');
        } else if (control.action === 'home') {
          this.scene.start('GameMenu');
        } else if (control.action === 'help') {
          this.showHelp();
        }
      });
    });
  }

  /**
   * Preload game assets
   */
  preload() {
    this.gameState = 'loading';

    // Show loading progress
    this.load.on('progress', (value) => {
      // Update loading progress if UI manager is available
      if (this.uiManager) {
        this.uiManager.updateLoadingProgress(value);
      }
    });

    // Load game-specific assets
    this.loadGameAssets();
  }

  /**
   * Create game objects and UI
   */
  create() {
    this.gameState = 'ready';

    // Initialize performance optimizations
    this.initializePerformanceOptimizations();

    // Create game world
    this.createWorld();

    // Create UI elements
    this.createUI();

    // Setup game logic
    this.setupGameLogic();

    // Start first level
    this.startLevel(1);

    // Hide loading screen
    if (this.uiManager) {
      this.uiManager.hideLoading();
    }
  }

  /**
   * Initialize performance optimizations
   */
  initializePerformanceOptimizations() {
    // Initialize rendering optimizer
    this.renderingOptimizer = new RenderingOptimizer(this);

    // Initialize tween pool
    this.tweenPool = new TweenPool(this, 100);

    // Initialize performance monitor
    this.performanceMonitor = new PerformanceMonitor();
    this.performanceMonitor.startMonitoring();

    // Initialize help system
    this.helpSystem = new HelpSystem(this);

    // Create common object pools
    this.createObjectPools();

    console.log('Performance optimizations initialized for', this.gameConfig.name);
  }

  /**
   * Create common object pools for the game
   */
  createObjectPools() {
    // Create pools for common game objects
    this.objectPools.set('rectangles', new ObjectPool(this, 'rectangle', 20, 100));
    this.objectPools.set('circles', new ObjectPool(this, 'circle', 15, 75));
    this.objectPools.set('texts', new ObjectPool(this, 'text', 10, 50));
    this.objectPools.set('containers', new ObjectPool(this, 'container', 10, 30));

    // Create game-specific pools
    this.createGameSpecificPools();
  }

  /**
   * Create game-specific object pools (override in subclasses)
   */
  createGameSpecificPools() {
    // Override in subclasses for game-specific pools
  }

  /**
   * Get object from pool
   */
  getPooledObject(poolName, config = {}) {
    const pool = this.objectPools.get(poolName);
    if (!pool) {
      console.warn(`Object pool '${poolName}' not found`);
      return null;
    }

    return pool.get(config);
  }

  /**
   * Return object to pool
   */
  releasePooledObject(poolName, object) {
    const pool = this.objectPools.get(poolName);
    if (pool) {
      pool.release(object);
    }
  }

  /**
   * Get tween from pool
   */
  getPooledTween(config) {
    if (!this.tweenPool) return null;
    return this.tweenPool.get(config);
  }

  /**
   * Release tween to pool
   */
  releasePooledTween(tween) {
    if (this.tweenPool) {
      this.tweenPool.release(tween);
    }
  }

  /**
   * Get performance stats
   */
  getPerformanceStats() {
    const stats = {
      rendering: this.renderingOptimizer ? this.renderingOptimizer.getStats() : null,
      objectPools: {},
      tweenPool: this.tweenPool ? this.tweenPool.getStats() : null,
      performance: this.performanceMonitor ? this.performanceMonitor.getCurrentMetrics() : null
    };

    // Get object pool stats
    this.objectPools.forEach((pool, name) => {
      stats.objectPools[name] = pool.getStats();
    });

    return stats;
  }

  /**
   * Main game update loop
   */
  update(time, delta) {
    if (this.gameState !== 'playing') {
      return;
    }

    // Update game logic
    this.updateGame(delta);

    // Update UI
    this.updateUI();

    // Check win/lose conditions
    this.checkGameConditions();
  }

  /**
   * Setup input handling
   */
  setupInput() {
    // Enable input
    this.input.enabled = true;

    // Setup keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  /**
   * Setup camera and world bounds
   */
  setupCamera() {
    const { width, height } = this.game.config;

    // Set world bounds
    this.physics.world.setBounds(0, 0, width, height);

    // Configure camera
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setBackgroundColor(this.gameConfig.backgroundColor || 0x2c3e50);
  }

  /**
   * Load game-specific assets
   */
  loadGameAssets() {
    // Override in subclasses to load specific assets
    // Assets are loaded via AssetManager before scene starts
  }

  /**
   * Create game world
   */
  createWorld() {
    // Create background
    this.createBackground();

    // Create game objects
    this.createGameObjects();
  }

  /**
   * Create background
   */
  createBackground() {
    const { width, height } = this.game.config;

    // Default background
    this.add.rectangle(width / 2, height / 2, width, height,
      this.gameConfig.backgroundColor || 0x2c3e50);
  }

  /**
   * Create game objects (override in subclasses)
   */
  createGameObjects() {
    // Override in subclasses
  }

  /**
   * Create UI elements
   */
  createUI() {
    if (!this.uiManager) return;

    this.uiElements = this.uiManager.createGameUI(this, {
      showScore: true,
      showTimer: false,
      showProgress: true
    });

    // Update score display
    if (this.uiElements.score) {
      this.uiElements.score.updateScore(this.score);
    }

    // Create help system icon
    if (this.helpSystem) {
      this.helpSystem.createHelpIcon();
    }
  }

  /**
   * Setup game logic (override in subclasses)
   */
  setupGameLogic() {
    // Override in subclasses
  }

  /**
   * Update game logic (override in subclasses)
   */
  updateGame(delta) {
    // Override in subclasses
  }

  /**
   * Update UI elements
   */
  updateUI() {
    // Update score
    if (this.uiElements.score) {
      this.uiElements.score.updateScore(this.score);
    }

    // Update timer if exists
    if (this.uiElements.timer) {
      this.uiElements.timer.update();
    }
  }

  /**
   * Check win/lose conditions
   */
  checkGameConditions() {
    // Override in subclasses
  }

  /**
   * Start a specific level
   */
  startLevel(levelNumber) {
    this.level = levelNumber;
    this.gameState = 'playing';

    // Load level data
    this.loadLevelData(levelNumber);

    // Reset level state
    this.resetLevel();

    // Start level timer if needed
    if (this.uiElements.timer) {
      this.uiElements.timer.start();
    }

    // Notify level start
    this.onLevelStart();
  }

  /**
   * Load level data
   */
  loadLevelData(levelNumber) {
    // Override in subclasses
    this.levelData = {
      number: levelNumber,
      difficulty: Math.min(levelNumber, 5),
      // Default level data
    };
  }

  /**
   * Reset level state
   */
  resetLevel() {
    this.score = 0;
    this.lives = 3;
    this.timeRemaining = 0;
  }

  /**
   * Called when level starts
   */
  onLevelStart() {
    if (this.uiManager) {
      this.uiManager.showNotification(`Level ${this.level} started!`, 'info', 2000);
    }
  }

  /**
   * Complete current level
   */
  completeLevel() {
    this.gameState = 'level_complete';

    // Save progress
    this.saveProgress();

    // Show success message
    if (this.uiManager) {
      this.uiManager.showSuccess(`Level ${this.level} completed!`);
    }

    // Pause timer
    if (this.uiElements.timer) {
      this.uiElements.timer.pause();
    }

    // Auto-advance to next level after delay
    this.time.delayedCall(2000, () => {
      this.startLevel(this.level + 1);
    });
  }

  /**
   * Fail current level
   */
  failLevel() {
    this.gameState = 'level_failed';
    this.lives--;

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Retry level
      this.time.delayedCall(2000, () => {
        this.startLevel(this.level);
      });
    }
  }

  /**
   * Game over
   */
  gameOver() {
    this.gameState = 'game_over';

    if (this.uiManager) {
      this.uiManager.showError('Game Over! Try again.', 5000);
    }

    // Return to menu after delay
    this.time.delayedCall(3000, () => {
      this.scene.start('GameMenu');
    });
  }

  /**
   * Load saved progress
   */
  loadProgress() {
    if (this.gameManager) {
      const progress = this.gameManager.loadProgress(this.gameConfig.id);
      if (progress) {
        this.level = progress.level || 1;
        this.score = progress.score || 0;
      }
    }
  }

  /**
   * Save current progress
   */
  saveProgress() {
    if (this.gameManager) {
      this.gameManager.saveProgress(this.gameConfig.id, {
        level: this.level,
        score: this.score,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Add points to score
   */
  addScore(points) {
    this.score += points;

    // Visual feedback
    if (this.uiManager) {
      this.uiManager.showNotification(`+${points} points!`, 'success', 1000);
    }
  }

  /**
   * Play sound effect
   */
  playSound(key, config = {}) {
    if (this.sound && this.sound.get(key)) {
      this.sound.play(key, config);
    }
  }

  /**
   * Show help/tutorial
   */
  showHelp() {
    // Override in subclasses
    console.log('Help requested for', this.gameConfig.name);
  }

  /**
   * Pause game
   */
  pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.physics.pause();

      if (this.uiElements.timer) {
        this.uiElements.timer.pause();
      }
    }
  }

  /**
   * Resume game
   */
  resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.physics.resume();

      if (this.uiElements.timer) {
        this.uiElements.timer.resume();
      }
    }
  }

  /**
   * Clean up when scene is destroyed
   */
  destroy() {
    // Save final progress
    this.saveProgress();

    // Clean up resources
    this.cleanup();

    // Clean up help system
    if (this.helpSystem) {
      this.helpSystem.destroy();
      this.helpSystem = null;
    }

    // Call parent destroy
    super.destroy();
  }

  /**
   * Clean up resources (override in subclasses)
   */
  cleanup() {
    // Override in subclasses for custom cleanup
  }
}