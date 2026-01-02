/**
 * LoadingScene - Displays asset loading progress
 * Shows a beautiful loading screen while preloading all game assets
 */
export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  init(data) {
    this.nextScene = data.nextScene || 'MainMenu';
    this.loadingText = data.loadingText || 'Loading Lalela Games...';
    this.assetManager = data.assetManager;
    this.app = data.app;
  }

  preload() {
    // Load minimal assets for the loading screen itself
    // These should be very small/quick to load

    // Create loading graphics directly (no external assets needed)
  }

  create() {
    const { width, height } = this.scale;

    // Create beautiful loading background
    const bgGraphics = this.add.graphics();

    // Gradient background
    bgGraphics.fillGradientStyle(0xA2D2FF, 0xA2D2FF, 0x87CEEB, 0x87CEEB, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // Add cloud decorations
    bgGraphics.fillStyle(0xFFFFFF, 0.8);
    bgGraphics.fillRoundedRect(width * 0.1, height * 0.2, width * 0.15, height * 0.08, width * 0.03);
    bgGraphics.fillRoundedRect(width * 0.4, height * 0.15, width * 0.12, height * 0.06, width * 0.025);
    bgGraphics.fillRoundedRect(width * 0.7, height * 0.25, width * 0.14, height * 0.07, width * 0.035);

    // Add sun
    bgGraphics.fillStyle(0xFFD93D, 0.9);
    bgGraphics.fillCircle(width * 0.85, height * 0.15, width * 0.04);

    // Sun rays
    bgGraphics.lineStyle(3, 0xFFD93D, 0.6);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const rayLength = width * 0.06;
      const centerX = width * 0.85;
      const centerY = height * 0.15;

      bgGraphics.lineBetween(
        centerX + Math.cos(angle) * width * 0.045,
        centerY + Math.sin(angle) * height * 0.045,
        centerX + Math.cos(angle) * rayLength,
        centerY + Math.sin(angle) * rayLength
      );
    }

    // Title
    this.titleText = this.add.text(width / 2, height * 0.4, '🌍 Lalela Games', {
      fontSize: `${Math.min(width, height) * 0.06}px`,
      color: '#FFD93D',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.text(width / 2, height * 0.55, this.loadingText, {
      fontSize: `${Math.min(width, height) * 0.025}px`,
      color: '#333333',
      fontFamily: 'Nunito, sans-serif',
      align: 'center'
    }).setOrigin(0.5);

    // Progress bar background
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0xFFFFFF, 0.8);
    this.progressBg.fillRoundedRect(width / 2 - width * 0.3, height * 0.65, width * 0.6, height * 0.04, height * 0.02);
    this.progressBg.lineStyle(3, 0xFFD93D, 1);
    this.progressBg.strokeRoundedRect(width / 2 - width * 0.3, height * 0.65, width * 0.6, height * 0.04, height * 0.02);

    // Progress bar fill
    this.progressFill = this.add.graphics();

    // Progress text
    this.progressText = this.add.text(width / 2, height * 0.75, '0%', {
      fontSize: `${Math.min(width, height) * 0.03}px`,
      color: '#333333',
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Fun loading animations
    this.createLoadingAnimations();

    // Start preloading assets
    this.startAssetPreloading();
  }

  createLoadingAnimations() {
    const { width, height } = this.scale;

    // Animated bouncing dots
    this.dots = [];
    const dotColors = [0xFF6B6B, 0x4ECDC4, 0xFFD93D, 0x54A0FF];

    for (let i = 0; i < 4; i++) {
      const dot = this.add.circle(
        width / 2 - width * 0.1 + i * width * 0.05,
        height * 0.8,
        width * 0.008,
        dotColors[i],
        1
      );

      // Add drop shadow
      const shadow = this.add.circle(
        width / 2 - width * 0.1 + i * width * 0.05 + 1,
        height * 0.8 + 1,
        width * 0.008,
        0x000000,
        0.3
      );

      this.dots.push({ dot, shadow });

      // Bounce animation with delay
      this.tweens.add({
        targets: [dot, shadow],
        y: height * 0.78,
        duration: 600,
        ease: 'Power2',
        yoyo: true,
        repeat: -1,
        delay: i * 150
      });
    }

    // Gentle title animation
    this.tweens.add({
      targets: this.titleText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      ease: 'Power2',
      yoyo: true,
      repeat: -1
    });
  }

  async startAssetPreloading() {
    try {
      // Get asset manager from init data
      const assetManager = this.assetManager;

      if (!assetManager) {
        console.error('AssetManager not found in scene data');
        // Fallback to showing game menu
        this.app.showGameMenu();
        return;
      }

      // Start preloading all assets
      await assetManager.preloadAllAssets(this, (progress) => {
        this.updateProgress(progress);
      });

      // Preloading complete - transition to next scene
      this.onPreloadingComplete();

    } catch (error) {
      console.error('Asset preloading failed:', error);
      // Still proceed to game menu even if some assets fail
      this.app.showGameMenu();
    }
  }

  updateProgress(progress) {
    const percentage = Math.round(progress * 100);

    // Update progress bar
    const { width, height } = this.scale;
    this.progressFill.clear();
    this.progressFill.fillStyle(0xFFD93D, 1);
    this.progressFill.fillRoundedRect(
      width / 2 - width * 0.295,
      height * 0.655,
      width * 0.59 * progress,
      height * 0.03,
      height * 0.015
    );

    // Update progress text
    this.progressText.setText(`${percentage}%`);

    // Update loading text based on progress
    if (percentage < 25) {
      this.loadingText.setText('Preparing Lalela Games...');
    } else if (percentage < 50) {
      this.loadingText.setText('Loading game assets...');
    } else if (percentage < 75) {
      this.loadingText.setText('Setting up adventures...');
    } else if (percentage < 100) {
      this.loadingText.setText('Almost ready to play!');
    } else {
      this.loadingText.setText('Ready for fun! 🎉');
    }
  }

  onPreloadingComplete() {
    console.log('Loading complete, transitioning to destination...');

    // Add a small delay for visual feedback
    this.time.delayedCall(500, () => {
      // Stop any ongoing animations safely
      try {
        this.tweens.killAll();
      } catch (error) {
        console.warn('Error killing tweens:', error);
      }

      // Identify targets safely - include dots if they exist
      const targets = [
        this.titleText,
        this.loadingText,
        this.progressBg,
        this.progressFill,
        this.progressText,
        ...(this.dots ? this.dots.flatMap(d => [d.dot, d.shadow]) : [])
      ].filter(t => t && t.active); // Ensure they exist and are active

      if (targets.length > 0) {
        // Try the smooth transition
        this.tweens.add({
          targets: targets,
          alpha: 0,
          scaleX: 0.8,
          scaleY: 0.8,
          duration: 300,
          ease: 'Power2',
          onComplete: () => this.transitionToDestination()
        });

        // Safety timeout in case tween fails
        this.time.delayedCall(1000, () => {
          if (this.scene.isActive()) {
            console.warn('Tween timeout, forcing transition...');
            this.transitionToDestination();
          }
        });
      } else {
        // No valid targets, skip animation
        this.transitionToDestination();
      }
    });
  }

  // Direct transition to destination scene
  transitionToDestination() {
    console.log(`Starting destination scene: ${this.nextScene}`);

    try {
      // IMPORTANT: Start the actual scene directly, NOT through app methods that trigger loading
      this.scene.start(this.nextScene, { app: this.app });

      // If you need to tell your app the menu is shown, do it AFTER the scene has switched
      if (this.app && typeof this.app.onMenuReady === 'function') {
        this.app.onMenuReady();
      }
    } catch (error) {
      console.error(`Failed to start ${this.nextScene} scene:`, error);
      // Fallback: try to restart the loading scene
      this.scene.restart();
    }
  }

  // Fallback method in case something goes wrong
  update() {
    // If loading takes too long (30 seconds), proceed anyway
    if (this.loadStartTime && Date.now() - this.loadStartTime > 30000) {
      console.warn('Loading timeout - proceeding to game menu');
      this.app.showGameMenu();
    }
  }
}