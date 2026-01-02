/**
 * SmallnumbersGame - Numbers with dice educational game
 * Falling dice with keyboard input for number recognition
 * Based on GCompris smallnumbers activity
 */
import { LalelaGame } from '../utils/LalelaGame.js';

export class SmallnumbersGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'math',
      difficulty: 1,
      ...config
    });

    // Game configuration
    this.fallingDice = [];
    this.currentLevelData = null;
    this.currentSublevel = 0;
    this.speedSetting = 10; // Speed multiplier (higher = faster)
    this.inputBuffer = '';
    this.fallDuration = 8000; // Base fall duration in milliseconds

    // Level configuration
    this.levels = [
      {
        objective: "Numbers up to 3",
        difficulty: 1,
        sublevels: [
          { numbers: ["1", "2"], sublevelCount: 8 },
          { numbers: ["1", "2", "3"], sublevelCount: 10 }
        ]
      },
      {
        objective: "Numbers up to 5",
        difficulty: 2,
        sublevels: [
          { numbers: ["1", "2", "3", "4"], sublevelCount: 8 },
          { numbers: ["2", "3", "4", "5"], sublevelCount: 10 }
        ]
      },
      {
        objective: "Numbers up to 7",
        difficulty: 3,
        sublevels: [
          { numbers: ["3", "4", "5", "6"], sublevelCount: 8 },
          { numbers: ["4", "5", "6", "7"], sublevelCount: 10 }
        ]
      },
      {
        objective: "Numbers up to 9",
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

    // Load dice images (dice0.svg through dice9.svg)
    for (let i = 0; i <= 9; i++) {
      this.load.svg(`dice${i}`, `assets/game-icons/dice${i}.svg`);
    }

    // Load background
    this.load.svg('smallnumbers_bg', 'assets/game-icons/smallnumbers_bg.svg');
  }

  /**
   * Override: Create the background first so it is at the bottom
   */
  createBackground() {
    const { width, height } = this.scale;
    this.background = this.add.image(width / 2, height / 2, 'smallnumbers_bg');
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
      'Type the number of dots on the falling dice!',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Nunito, sans-serif',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(11);

    // Status box (0/8 indicator on the right side)
    this.statusBox = this.add.rectangle(
      width - 80,
      50,
      120,
      50,
      0xffffff,
      1
    ).setStrokeStyle(3, 0x000000).setOrigin(0.5).setDepth(10);

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

    // Input display (shows what player is typing) - larger and more vibrant
    this.inputDisplay = this.add.text(width / 2, height - 150, '', {
      fontSize: '64px',
      color: '#FACA2A',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(15);

    // Feedback text
    this.feedbackText = this.add.text(width / 2, height - 250, '', {
      fontSize: '28px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(15);

    // Create navigation dock
    this.createNavigationDock(width, height);

    // Container for falling dice (set depth to 5)
    this.diceContainer = this.add.container(0, 0);
    this.diceContainer.setDepth(5);
  }

  /**
   * Create the game
   */
  create() {
    // Call super.create() which will call createBackground() and createUI() in proper order
    super.create();

    // Initialize keyboard input
    this.setupKeyboardInput();

    // Setup game logic
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
      this.checkDiceMatch(key);
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
    this.correctAnswersInSublevel = 0;

    // Start spawning dice
    this.startDiceSpawning();
  }

  /**
   * Start spawning falling dice
   */
  startDiceSpawning() {
    // Clear any existing dice
    this.clearAllDice();

    // Start spawning timer
    this.spawnTimer = this.time.addEvent({
      delay: 2000, // Spawn a new dice every 2 seconds
      callback: () => this.spawnDice(),
      callbackScope: this,
      loop: true
    });

    // Spawn first dice immediately
    this.spawnDice();
  }

  /**
   * Spawn a new falling dice
   */
  spawnDice() {
    if (!this.currentLevelData) return;

    // Get random number for current sublevel
    const numbers = this.currentLevelData.sublevels[this.currentSublevel].numbers;
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];

    // Create dice sprite
    const diceNumber = parseInt(randomNumber);
    const diceSprite = this.add.sprite(0, 0, `dice${diceNumber}`);

    // Set size
    const diceSize = 80;
    diceSprite.setDisplaySize(diceSize, diceSize);

    // Position randomly across top of screen
    const margin = 100;
    const x = margin + Math.random() * (this.scale.width - margin * 2 - diceSize);
    diceSprite.x = x;
    diceSprite.y = -diceSize;

    // Add to container
    this.diceContainer.add(diceSprite);

    // Create dice object
    const dice = {
      sprite: diceSprite,
      number: diceNumber,
      targetY: this.scale.height + diceSize,
      speed: (this.scale.height + diceSize) / (this.fallDuration / 1000) // pixels per second
    };

    // Add falling animation
    this.tweens.add({
      targets: diceSprite,
      y: dice.targetY,
      duration: this.fallDuration,
      ease: 'Linear',
      onComplete: () => this.onDiceReachedGround(dice)
    });

    // Add to falling dice array
    this.fallingDice.push(dice);
  }

  /**
   * Check if typed number matches any falling dice
   */
  checkDiceMatch(inputNumber) {
    for (let i = this.fallingDice.length - 1; i >= 0; i--) {
      const dice = this.fallingDice[i];

      if (dice.number.toString() === inputNumber) {
        // Correct match!
        this.onCorrectMatch(dice);
        this.fallingDice.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Handle correct dice match
   */
  onCorrectMatch(dice) {
    // Play success sound
    this.playSound('success');

    // Update score
    this.score += 10;

    // Update sublevel progress
    this.correctAnswersInSublevel++;

    // Update status display
    this.updateStatusDisplay();

    // Show feedback
    this.showFeedback('Correct!', '#00B378');

    // Create particle effect
    this.createParticleEffect(dice.sprite.x, dice.sprite.y);

    // Remove dice
    dice.sprite.destroy();

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
   * Handle dice reaching the ground
   */
  onDiceReachedGround(dice) {
    // Play crash sound
    this.playSound('crash');

    // Show feedback
    this.showFeedback('Too slow!', '#FF6B6B');

    // Remove dice
    dice.sprite.destroy();

    // Remove from array
    const index = this.fallingDice.indexOf(dice);
    if (index > -1) {
      this.fallingDice.splice(index, 1);
    }
  }

  /**
   * Create particle effect for correct answers
   */
  createParticleEffect(x, y) {
    // Create simple particle effect with small circles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(x, y, 3, 0xFACA2A);

      // Random velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Animate particle
      this.tweens.add({
        targets: particle,
        x: x + vx * 0.5,
        y: y + vy * 0.5,
        alpha: 0,
        scale: 0,
        duration: 500,
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
    this.showFeedback('Level Up!', '#FACA2A');
    this.startLevel();
    this.updateStatusDisplay();
  }

  /**
   * Clear all falling dice
   */
  clearAllDice() {
    this.fallingDice.forEach(dice => {
      if (dice.sprite) {
        dice.sprite.destroy();
      }
    });
    this.fallingDice = [];

    if (this.spawnTimer) {
      this.spawnTimer.destroy();
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
   * Show help dialog
   */
  showHelp() {
    if (this.uiManager) {
      this.uiManager.showNotification(
        'Type the number that matches the dots on the falling dice. Be quick before they reach the bottom!',
        'info',
        5000
      );
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
    this.scene.start('GameMenu');
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
  shutdown() {
    this.clearAllDice();
    super.shutdown();
  }
}