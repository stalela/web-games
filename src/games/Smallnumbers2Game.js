/**
 * Smallnumbers2Game - Numbers with dominoes educational game
 * Falling dominoes showing number pairs that add up to target number
 * Based on GCompris smallnumbers2 activity
 */
import { LalelaGame } from '../utils/LalelaGame.js';

export class Smallnumbers2Game extends LalelaGame {
  constructor(config) {
    super({
      category: 'math',
      difficulty: 1,
      ...config
    });

    // Game configuration
    this.fallingDominoes = [];
    this.currentLevelData = null;
    this.currentSublevel = 0;
    this.correctAnswersInSublevel = 0;
    this.speedSetting = 10; // Speed multiplier (higher = faster)
    this.inputBuffer = '';
    this.fallDuration = 8000; // Base fall duration in milliseconds

    // Level configuration - same as smallnumbers but with dominoes
    this.levels = [
      {
        objective: "Numbers up to 3 with dominoes",
        difficulty: 1,
        sublevels: [
          { numbers: ["1", "2"], sublevelCount: 8 },
          { numbers: ["1", "2", "3"], sublevelCount: 10 }
        ]
      },
      {
        objective: "Numbers up to 5 with dominoes",
        difficulty: 2,
        sublevels: [
          { numbers: ["1", "2", "3", "4"], sublevelCount: 8 },
          { numbers: ["2", "3", "4", "5"], sublevelCount: 10 }
        ]
      },
      {
        objective: "Numbers up to 7 with dominoes",
        difficulty: 3,
        sublevels: [
          { numbers: ["3", "4", "5", "6"], sublevelCount: 8 },
          { numbers: ["4", "5", "6", "7"], sublevelCount: 10 }
        ]
      },
      {
        objective: "Numbers up to 9 with dominoes",
        difficulty: 4,
        sublevels: [
          { numbers: ["5", "6", "7", "8"], sublevelCount: 8 },
          { numbers: ["6", "7", "8", "9"], sublevelCount: 10 }
        ]
      }
    ];
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // No additional assets needed - we'll create dominoes programmatically
    // But we could load a background
    this.load.svg('smallnumbers2_bg', 'assets/game-icons/smallnumbers2_bg.svg');
  }

  /**
   * Override: Create the background first so it is at the bottom
   */
  createBackground() {
    const { width, height } = this.scale;

    // Use the loaded background asset for beach theme
    this.background = this.add.sprite(width / 2, height / 2, 'smallnumbers2_bg');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-1);
  }

  /**
   * Override: Create UI elements
   */
  createUI() {
    const { width, height } = this.scale;

    // Instruction panel background (GCompris style)
    const instructionPanelBg = this.add.rectangle(
      width / 2,
      50,
      width - 40,
      60,
      0x000000,
      0.7
    ).setOrigin(0.5).setDepth(10);

    // Instruction text
    this.instructionText = this.add.text(
      width / 2,
      50,
      'Type the total number of dots on the falling dominoes!',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Nunito, sans-serif',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(11);

    // Status box - sticker style (0/8 indicator on the right side)
    // Drop shadow
    const statusShadow = this.add.graphics();
    statusShadow.fillStyle(0x000000, 0.3);
    statusShadow.fillRoundedRect(width - 80 - 62, 50 - 27, 124, 54, 15);
    statusShadow.setDepth(9);

    // Main status box
    const statusBoxGraphics = this.add.graphics();
    statusBoxGraphics.fillStyle(0xFFFFFF, 1);
    statusBoxGraphics.fillRoundedRect(width - 80 - 60, 50 - 25, 120, 50, 15);
    statusBoxGraphics.lineStyle(5, 0x101012, 1); // Thick ink black border
    statusBoxGraphics.strokeRoundedRect(width - 80 - 60, 50 - 25, 120, 50, 15);
    statusBoxGraphics.setDepth(10);

    this.statusBox = statusBoxGraphics; // Store reference for any future use

    this.statusText = this.add.text(
      width - 80,
      50,
      '0/8',
      {
        fontSize: '20px',
        color: '#000000',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(11);

    // Input display (shows what player is typing) - mega-size and prominently positioned
    this.inputDisplay = this.add.text(width / 2, height * 0.65, '', {
      fontSize: '120px',
      color: '#FACA2A',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(200);

    // Feedback text
    this.feedbackText = this.add.text(width / 2, height - 250, '', {
      fontSize: '28px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(200);

    // Create navigation dock
    this.createNavigationDock(width, height);

    // Container for falling dominoes (set depth to 5)
    this.dominoesContainer = this.add.container(0, 0);
    this.dominoesContainer.setDepth(5);
  }


  /**
   * Create the game - override LalelaGame create to avoid conflicts
   */
  create() {
    this.gameState = 'ready';

    // Create background first
    this.createBackground();

    // Create UI elements
    this.createUI();

    // Initialize keyboard input
    this.setupKeyboardInput();

    // Setup game logic and start level
    this.setupGameLogic();
  }

  /**
   * Setup game logic after UI is created
   */
  setupGameLogic() {
    this.startLevel();
  }

  /**
   * Setup keyboard input handling
   */
  setupKeyboardInput() {
    // Create keyboard input handler
    this.input.keyboard.on('keydown', (event) => {
      this.handleKeyInput(event);
    });
  }

  /**
   * Handle keyboard input
   */
  handleKeyInput(event) {
    const key = event.key;

    // Handle number keys
    if (key >= '0' && key <= '9') {
      this.inputBuffer = key;
      this.updateInputDisplay();
      this.checkDominoMatch(key);
    }
    // Handle backspace
    else if (key === 'Backspace') {
      this.inputBuffer = '';
      this.updateInputDisplay();
    }
  }

  /**
   * Update the input display
   */
  updateInputDisplay() {
    if (this.inputDisplay) {
      this.inputDisplay.setText(this.inputBuffer);

      // Add dramatic bounce animation for immediate visual feedback
      this.tweens.add({
        targets: this.inputDisplay,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 200,
        ease: 'Back.easeOut',
        yoyo: true,
        onComplete: () => {
          // Reset scale after animation
          this.inputDisplay.setScale(1);
        }
      });
    }
  }

  /**
   * Start the current level
   */
  startLevel() {
    // Determine level based on progress
    const levelIndex = Math.min(Math.floor(this.score / 20), this.levels.length - 1);
    this.currentLevelData = this.levels[levelIndex];

    // Update instruction with current objective
    if (this.instructionText) {
      this.instructionText.setText(`${this.currentLevelData.objective}`);
    }

    // Reset sublevel
    this.currentSublevel = 0;
    this.correctAnswersInSublevel = 0; // Reset counter for new level

    // Update status display
    this.updateStatusDisplay();

    // Start spawning dominoes
    this.startDominoSpawning();
  }

  /**
   * Start spawning falling dominoes
   */
  startDominoSpawning() {
    // Clear any existing dominoes
    this.clearAllDominoes();

    // Start spawning timer
    this.spawnTimer = this.time.addEvent({
      delay: 2500, // Spawn a new domino every 2.5 seconds (slightly slower than dice)
      callback: () => this.spawnDomino(),
      callbackScope: this,
      loop: true
    });

    // Spawn first domino immediately
    this.spawnDomino();
  }

  /**
   * Spawn a new falling domino
   */
  spawnDomino() {
    if (!this.currentLevelData) return;

    // Get random number for current sublevel
    const numbers = this.currentLevelData.sublevels[this.currentSublevel].numbers;
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];

    // Generate domino values that add up to the target number
    const targetNumber = parseInt(randomNumber);
    const value1 = Math.floor(Math.random() * targetNumber);
    const value2 = targetNumber - value1;

    // Create domino sprite (custom component)
    const dominoSprite = this.createDominoSprite(value1, value2);

    // Set size - use scale instead of setDisplaySize to avoid NaN issues with 0-size containers
    const dominoSize = 220; // Increased slightly for better dot visibility
    dominoSprite.setScale(1.1); // Scale up from the original 360x180 to approximately 400px wide

    // Position randomly across top of screen
    const margin = 220; // More margin for wider dominoes
    const x = margin + Math.random() * (this.scale.width - margin * 2 - dominoSize * 2);
    dominoSprite.x = x;
    dominoSprite.y = -dominoSize;

    // Add to container
    this.dominoesContainer.add(dominoSprite);

    // Create domino object
    const domino = {
      sprite: dominoSprite,
      total: targetNumber,
      value1: value1,
      value2: value2,
      targetY: this.scale.height + dominoSize,
      speed: (this.scale.height + dominoSize) / (this.fallDuration / 1000) // pixels per second
    };

    // Add falling animation
    this.tweens.add({
      targets: dominoSprite,
      y: domino.targetY,
      duration: this.fallDuration,
      ease: 'Linear',
      onComplete: () => this.onDominoReachedGround(domino)
    });

    // Add to falling dominoes array
    this.fallingDominoes.push(domino);
  }

  /**
   * Create a domino sprite with dots
   */
  createDominoSprite(value1, value2) {
    // Create a container for the domino
    const dominoContainer = this.add.container(0, 0);

    // Fix: Set explicit size for container to prevent NaN scale issues
    dominoContainer.setSize(360, 180);

    // Domino background - sticker style with rounded corners and thick border
    const dominoBg = this.add.graphics();
    dominoBg.fillStyle(0xFFFFFF, 1); // White fill
    dominoBg.fillRoundedRect(-180, -90, 360, 180, 20); // Rounded corners
    dominoBg.lineStyle(5, 0x101012, 1); // Thick ink black border
    dominoBg.strokeRoundedRect(-180, -90, 360, 180, 20);
    dominoBg.setDepth(1);
    dominoContainer.add(dominoBg);

    // Drop shadow for 3D sticker effect
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3); // Semi-transparent black
    shadow.fillRoundedRect(-175, -85, 360, 180, 20); // Slightly offset
    shadow.setDepth(0);
    dominoContainer.add(shadow);

    // Center line dividing the two halves
    const centerLine = this.add.rectangle(0, 0, 6, 160, 0x000000); // Thicker and taller line
    dominoContainer.add(centerLine);

    // Left side dots
    this.addDotsToDomino(dominoContainer, value1, -90, 0);

    // Right side dots
    this.addDotsToDomino(dominoContainer, value2, 90, 0);

    return dominoContainer;
  }

  /**
   * Add dots to one half of the domino
   */
  addDotsToDomino(container, value, centerX, centerY) {
    // Standard domino dot patterns (doubled coordinates for larger dominoes)
    const dotPatterns = {
      0: [], // Empty
      1: [[0, 0]], // Center
      2: [[-30, -30], [30, 30]], // Diagonal
      3: [[-30, -30], [0, 0], [30, 30]], // Diagonal with center
      4: [[-30, -30], [-30, 30], [30, -30], [30, 30]], // Corners
      5: [[-30, -30], [-30, 30], [0, 0], [30, -30], [30, 30]], // Corners + center
      6: [[-30, -40], [-30, 0], [-30, 40], [30, -40], [30, 0], [30, 40]], // Two columns
      7: [[-30, -40], [-30, 0], [-30, 40], [0, 0], [30, -40], [30, 0], [30, 40]], // Two columns + center
      8: [[-40, -30], [-40, 30], [0, -30], [0, 30], [40, -30], [40, 30], [-20, 0], [20, 0]], // Complex pattern
      9: [[-40, -40], [-40, 0], [-40, 40], [0, -40], [0, 0], [0, 40], [40, -40], [40, 0], [40, 40]] // Full grid
    };

    const pattern = dotPatterns[value] || [];
    pattern.forEach(([dx, dy]) => {
      const dot = this.add.circle(centerX + dx, centerY + dy, 10, 0x000000); // High-contrast black dots, large for easy counting
      container.add(dot);
    });
  }

  /**
   * Check if typed number matches any falling domino
   */
  checkDominoMatch(inputNumber) {
    for (let i = this.fallingDominoes.length - 1; i >= 0; i--) {
      const domino = this.fallingDominoes[i];

      if (domino.total.toString() === inputNumber) {
        // Correct match!
        this.onCorrectMatch(domino);
        this.fallingDominoes.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Handle correct domino match
   */
  onCorrectMatch(domino) {
    // Play success sound
    this.playSound('success');

    // Update score
    this.score += 10;

    // Update sublevel progress
    this.correctAnswersInSublevel++;

    // Update status display with pop animation
    this.updateStatusDisplay();

    // Show randomized positive feedback
    const positiveMessages = ['Wow!', 'Amazing!', 'Cool!', 'Super!', 'Great!', 'Awesome!'];
    const randomMessage = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
    this.showFeedback(randomMessage, '#00B378');

    // Create particle effect
    this.createParticleEffect(domino.sprite.x, domino.sprite.y);

    // Remove domino
    domino.sprite.destroy();

    // Check for sublevel completion
    if (this.correctAnswersInSublevel >= this.currentLevelData.sublevels[this.currentSublevel].sublevelCount) {
      this.advanceSublevel();
    }
  }

  /**
   * Update the status display (X/Y format)
   */
  updateStatusDisplay() {
    if (this.statusText && this.currentLevelData) {
      const currentSublevelData = this.currentLevelData.sublevels[this.currentSublevel];
      this.statusText.setText(`${this.correctAnswersInSublevel}/${currentSublevelData.sublevelCount}`);

      // Add pop animation to status box for visual feedback
      this.tweens.add({
        targets: [this.statusBox, this.statusText],
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 150,
        ease: 'Back.easeOut',
        yoyo: true,
        onComplete: () => {
          // Reset scale after animation
          this.statusBox.setScale(1);
          this.statusText.setScale(1);
        }
      });
    }
  }

  /**
   * Advance to next sublevel
   */
  advanceSublevel() {
    this.currentSublevel++;
    this.correctAnswersInSublevel = 0;

    // Check if all sublevels in this level are complete
    if (this.currentSublevel >= this.currentLevelData.sublevels.length) {
      this.advanceLevel();
    } else {
      // Continue with next sublevel
      this.updateStatusDisplay();
      this.showFeedback('Next round!', '#FACA2A');
    }
  }

  /**
   * Handle domino reaching the ground
   */
  onDominoReachedGround(domino) {
    // Play splash sound (or gentle sound)
    this.playSound('splash');

    // Show gentle feedback - no negative pressure for toddlers
    this.showFeedback('Splash!', '#FFA500'); // Soft orange instead of red

    // Add sink effect - fade out and move down slightly
    this.tweens.add({
      targets: domino.sprite,
      alpha: 0,
      y: domino.sprite.y + 50,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        domino.sprite.destroy();
      }
    });

    // Remove from array
    const index = this.fallingDominoes.indexOf(domino);
    if (index > -1) {
      this.fallingDominoes.splice(index, 1);
    }
  }

  /**
   * Create particle effect for correct answers
   */
  createParticleEffect(x, y) {
    // Create simple particle effect with small circles
    for (let i = 0; i < 25; i++) { // More particles for dominoes
      const particle = this.add.circle(x, y, 3, 0xFACA2A);

      // Random velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 240; // Faster particles
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Animate particle
      this.tweens.add({
        targets: particle,
        x: x + vx * 0.5,
        y: y + vy * 0.5,
        alpha: 0,
        scale: 0,
        duration: 600, // Longer duration
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Show feedback text
   */
  showFeedback(text, color) {
    if (this.feedbackText) {
      this.feedbackText.setText(text);
      this.feedbackText.setColor(color);

      // Clear after 2 seconds
      this.time.delayedCall(2000, () => {
        if (this.feedbackText) {
          this.feedbackText.setText('');
        }
      });
    }
  }

  /**
   * Advance to next level
   */
  advanceLevel() {
    // Clear any existing level up overlay
    this.clearLevelUpOverlay();

    const { width, height } = this.scale;

    // Create dark overlay
    this.levelUpOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.levelUpOverlay.setDepth(1000);

    // Create giant golden star
    this.levelUpStar = this.add.graphics();
    this.levelUpStar.fillStyle(0xFFD700, 1); // Gold color

    // Draw a 5-pointed star
    const centerX = width / 2;
    const centerY = height / 2 - 50;
    const outerRadius = 80;
    const innerRadius = 40;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle - Math.PI / 2) * radius;
      const y = centerY + Math.sin(angle - Math.PI / 2) * radius;

      if (i === 0) {
        this.levelUpStar.moveTo(x, y);
      } else {
        this.levelUpStar.lineTo(x, y);
      }
    }
    this.levelUpStar.closePath();
    this.levelUpStar.fillPath();
    this.levelUpStar.setDepth(1001);

    // Create "LEVEL UP!" text
    this.levelUpText = this.add.text(width / 2, height / 2 + 80, 'LEVEL UP!', {
      fontSize: '48px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      stroke: '#FFD700',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(1001);

    // Show overlay for 2 seconds, then fade out
    this.time.delayedCall(2000, () => {
      this.fadeOutLevelUpOverlay();
    });
  }

  /**
   * Fade out the level up overlay
   */
  fadeOutLevelUpOverlay() {
    if (this.levelUpOverlay && this.levelUpStar && this.levelUpText) {
      this.tweens.add({
        targets: [this.levelUpOverlay, this.levelUpStar, this.levelUpText],
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.clearLevelUpOverlay();
          // Now start the next level
          this.startLevel();
          this.updateStatusDisplay();
        }
      });
    }
  }

  /**
   * Clear the level up overlay elements
   */
  clearLevelUpOverlay() {
    if (this.levelUpOverlay) {
      this.levelUpOverlay.destroy();
      this.levelUpOverlay = null;
    }
    if (this.levelUpStar) {
      this.levelUpStar.destroy();
      this.levelUpStar = null;
    }
    if (this.levelUpText) {
      this.levelUpText.destroy();
      this.levelUpText = null;
    }
  }

  /**
   * Create navigation dock (GCompris style)
   */
  createNavigationDock(width, height) {
    const dockY = height - 80;
    const buttonSize = 90;
    const spacing = 130;

    // Dock background
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.95);
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);
    dockBg.setDepth(100);

    // Dock shadow
    const dockShadow = this.add.graphics();
    dockShadow.fillStyle(0x000000, 0.3);
    dockShadow.fillRoundedRect(width / 2 - (width - 60) / 2 + 4, dockY - 56, width - 60, 120, 60);
    dockShadow.setDepth(99);

    // Dock border
    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(5, 0x0062FF, 1);
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);
    dockBorder.setDepth(100);

    const controls = [
      { icon: 'help.svg', action: 'help', color: 0x00B378, label: 'Help' },
      { icon: 'home.svg', action: 'home', color: 0x0062FF, label: 'Home' },
      { icon: 'settings.svg', action: 'levels', color: 0xFACA2A, label: 'Levels' },
      { icon: 'exit.svg', action: 'menu', color: 0xAB47BC, label: 'Menu' }
    ];

    const totalWidth = (controls.length - 1) * spacing + buttonSize;
    const startX = (width - totalWidth) / 2 + buttonSize / 2;

    controls.forEach((control, index) => {
      const x = startX + index * spacing;

      // Button shadow
      const buttonShadow = this.add.circle(x + 4, dockY + 4, buttonSize / 2, 0x000000, 0.4);
      buttonShadow.setDepth(100);

      // Button
      const button = this.add.circle(x, dockY, buttonSize / 2, control.color);
      button.setStrokeStyle(5, 0xFFFFFF);
      button.setInteractive({ useHandCursor: true });
      button.setDepth(100);

      // Icon
      const icon = this.add.sprite(x, dockY, control.icon.replace('.svg', ''));
      icon.setScale((buttonSize * 0.7) / 100);
      icon.setTint(0xFFFFFF);
      icon.setDepth(100);

      // Label
      const label = this.add.text(x, dockY + buttonSize / 2 + 25, control.label, {
        fontSize: '20px',
        color: '#101012',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5).setDepth(100);

      // Hover effects
      button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scale: 1.2,
          duration: 150,
          ease: 'Back.easeOut'
        });
      });

      button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scale: 1.0,
          duration: 150,
          ease: 'Back.easeOut'
        });
      });

      button.on('pointerdown', () => {
        this.handleDockAction(control.action);
      });
    });
  }

  /**
   * Handle navigation dock actions
   */
  handleDockAction(action) {
    // Close any open modals before performing actions
    this.closeHelpModal();
    this.closeLevelSelector();

    switch (action) {
      case 'help':
        this.showHelp();
        break;
      case 'home':
        this.returnToMenu();
        break;
      case 'levels':
        this.showLevelSelector();
        break;
      case 'menu':
        this.showMenu();
        break;
    }
  }

  /**
   * Show help modal dialog
   */
  showHelp() {
    const { width, height } = this.scale;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.setDepth(150);
    overlay.on('pointerdown', () => this.closeHelpModal());

    // Modal background
    const modalBg = this.add.rectangle(width / 2, height / 2, 550, 450, 0xFDFAED, 1);
    modalBg.setStrokeStyle(4, 0xFACA2A);
    modalBg.setDepth(151);

    // Help content
    const helpText = this.add.text(width / 2, height / 2, '🎯 Dominoes Game Help! 🎯\n\n' +
      '• Look at the falling dominoes with dots on both sides\n' +
      '• Count ALL the dots on both halves\n' +
      '• Type the TOTAL number on your keyboard\n' +
      '• For example: 3 + 2 = 5, so type "5"\n\n' +
      'Practice addition with falling dominoes!', {
      fontSize: '18px',
      color: '#101012',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5).setDepth(152);

    // Close button
    const closeBtn = this.add.circle(width / 2 + 250, height / 2 - 210, 20, 0xE32528);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setDepth(153);
    closeBtn.on('pointerdown', () => this.closeHelpModal());

    const closeText = this.add.text(width / 2 + 250, height / 2 - 210, '×', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(154);

    // Store modal elements for cleanup
    this.helpModal = [overlay, modalBg, helpText, closeBtn, closeText];
  }

  /**
   * Close help modal dialog
   */
  closeHelpModal() {
    if (this.helpModal) {
      this.helpModal.forEach(element => element.destroy());
      this.helpModal = null;
    }
  }

  /**
   * Show level selector
   */
  showLevelSelector() {
    if (this.uiManager) {
      this.uiManager.showNotification(
        `Current Level: ${Math.min(Math.floor(this.score / 20) + 1, this.levels.length)} of ${this.levels.length}`,
        'info',
        3000
      );
    }
  }

  /**
   * Close level selector modal
   */
  closeLevelSelector() {
    if (this.levelSelectorModal) {
      this.levelSelectorModal.forEach(element => element.destroy());
      this.levelSelectorModal = null;
    }
  }

  /**
   * Show menu
   */
  showMenu() {
    if (this.uiManager) {
      this.uiManager.showNotification(
        'Use the navigation buttons to access help, return home, or select levels.',
        'info',
        3000
      );
    }
  }

  /**
   * Return to main menu
   */
  returnToMenu() {
    // Close any open modals
    this.closeHelpModal();
    this.closeLevelSelector();
    this.scene.start('GameMenu');
  }

  /**
   * Clear all falling dominoes
   */
  clearAllDominoes() {
    this.fallingDominoes.forEach(domino => {
      if (domino.sprite) {
        domino.sprite.destroy();
      }
    });
    this.fallingDominoes = [];

    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
  }

  /**
   * Play sound effect
   */
  playSound(soundName) {
    // For now, just log - we'll implement proper audio later
    console.log(`Playing sound: ${soundName}`);
  }

  /**
   * Update method - called every frame
   */
  update(time, delta) {
    // Game logic updates if needed
  }

  /**
   * Clean up when game ends
   */
  destroy() {
    // Clean up modals if open
    if (this.helpModal) {
      this.helpModal.forEach(element => element.destroy());
      this.helpModal = null;
    }
    if (this.levelSelectorModal) {
      this.levelSelectorModal.forEach(element => element.destroy());
      this.levelSelectorModal = null;
    }

    // Clean up level up overlay
    this.clearLevelUpOverlay();

    this.clearAllDominoes();
    super.destroy();
  }
}