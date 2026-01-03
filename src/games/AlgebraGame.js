/**
 * AlgebraGame - Base class for algebra practice games
 * Educational game teaching mental math within a time limit
 * Based on GCompris algebra_by activity (shared base)
 * 
 * Game: Type the answer to math problems before the balloon lands!
 * Extended by: AlgebraPlusGame, AlgebraMinusGame, AlgebraByGame, AlgebraDivGame
 */
import { LalelaGame } from '../utils/LalelaGame.js';

export class AlgebraGame extends LalelaGame {
  constructor(config) {
    super({
      ...config,
      category: 'mathematics',
      difficulty: 3
    });

    // Operation configuration (MUST be set by subclass)
    this.operatorSymbol = '+';  // +, −, ×, ÷
    this.operatorName = 'addition';
    
    // Game state
    this.currentLevel = 0;
    this.currentSubLevel = 0;
    this.score = 0;
    this.totalSubLevels = 10;
    this.subLevelData = [];
    
    // Current problem
    this.firstOperand = 0;
    this.secondOperand = 0;
    this.correctAnswer = 0;
    this.userAnswer = '';
    
    // UI elements
    this.questionText = null;
    this.answerText = null;
    this.balloon = null;
    this.numpadButtons = [];
    this.okButton = null;
    
    // Timing
    this.balloonTween = null;
    this.speedSetting = 5; // 1-10, higher = faster balloon
    
    // Level data (to be set by subclass via loadLevelData)
    this.levels = [];
  }

  /**
   * Generate operands for a problem based on operator type
   * Subclasses can override for special logic (e.g., division needs multiples)
   */
  generateOperands(min, max, limit) {
    let first = this.randomInRange(min, max);
    let second = this.randomInRange(min, max);
    return [first, second];
  }

  /**
   * Calculate the correct answer for given operands
   * MUST be overridden by subclass
   */
  calculateAnswer(first, second) {
    return first + second; // Default to addition
  }

  /**
   * Generate a multiplication/addition table for a given base number
   */
  generateTable(base) {
    const operands = [];
    for (let i = 1; i <= 10; i++) {
      operands.push({ first: base, second: i });
    }
    return operands;
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();
    
    // Load background
    this.load.svg('algebra-background', 'assets/game-icons/algebra-background.svg');
    
    // Load UI icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach(icon => {
      this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  /**
   * Initialize game state
   */
  init(data) {
    super.init(data);
    this.currentLevel = 0;
    this.currentSubLevel = 0;
    this.userAnswer = '';
  }

  /**
   * Create background (GCompris sky/nature theme)
   */
  createBackground() {
    const { width, height } = this.scale;
    
    // Try to use loaded background, fallback to gradient
    if (this.textures.exists('algebra-background')) {
      this.background = this.add.image(width / 2, height / 2, 'algebra-background');
      this.background.setDisplaySize(width, height);
    } else {
      // Fallback: Create a sky gradient background
      const graphics = this.add.graphics();
      graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F7FA, 0xE0F7FA, 1);
      graphics.fillRect(0, 0, width, height);
    }
    
    if (this.background) {
      this.background.setDepth(-1);
    }
  }

  /**
   * Create UI elements
   */
  createUI() {
    const { width, height } = this.scale;
    
    // Question display panel (top area)
    this.createQuestionPanel(width, height);
    
    // Balloon (animated element)
    this.createBalloon(width, height);
    
    // Numpad for answer input
    this.createNumpad(width, height);
    
    // Score/Progress display
    this.createScoreDisplay(width, height);
    
    // Navigation dock
    this.createNavigationDock(width, height);
    
    // "I am ready" button (shown at start of each level)
    this.createReadyButton(width, height);
  }

  /**
   * Create the question display panel
   */
  createQuestionPanel(width, height) {
    const panelY = height * 0.12;
    
    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xFFFFFF, 0.85);
    panelBg.fillRoundedRect(width * 0.15, panelY - 50, width * 0.7, 100, 20);
    panelBg.setDepth(5);
    
    // Question text: "X + Y = ?"
    this.firstOpText = this.add.text(width * 0.30, panelY, '5', {
      fontSize: '64px',
      color: '#333333',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(10);
    
    // Use the operator symbol from subclass
    this.operatorText = this.add.text(width * 0.40, panelY, this.operatorSymbol, {
      fontSize: '64px',
      color: '#0062FF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(10);
    
    this.secondOpText = this.add.text(width * 0.50, panelY, '3', {
      fontSize: '64px',
      color: '#333333',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(10);
    
    this.equalsText = this.add.text(width * 0.60, panelY, '=', {
      fontSize: '64px',
      color: '#333333',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(10);
    
    // Answer display (user input)
    this.answerBg = this.add.rectangle(width * 0.75, panelY, 120, 80, 0xFFFDE7);
    this.answerBg.setStrokeStyle(4, 0x0062FF);
    this.answerBg.setDepth(9);
    
    this.answerText = this.add.text(width * 0.75, panelY, '', {
      fontSize: '64px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(10);
  }

  /**
   * Create the animated balloon
   */
  createBalloon(width, height) {
    const balloonX = width * 0.85;
    const balloonStartY = height * 0.25;
    
    // Balloon body (oval)
    this.balloon = this.add.graphics();
    this.balloon.setDepth(8);
    this.balloonX = balloonX;
    this.balloonY = balloonStartY;
    this.balloonStartY = balloonStartY;
    this.balloonEndY = height * 0.75;
    
    this.drawBalloon();
    
    // Water/landing zone at bottom
    const waterY = height * 0.8;
    const water = this.add.graphics();
    water.fillStyle(0x0062FF, 0.6);
    water.fillRect(0, waterY, width, height - waterY);
    water.setDepth(2);
    
    // Water waves decoration
    const waves = this.add.graphics();
    waves.lineStyle(3, 0xFFFFFF, 0.5);
    for (let i = 0; i < 5; i++) {
      const waveY = waterY + 20 + i * 15;
      waves.beginPath();
      waves.moveTo(0, waveY);
      for (let x = 0; x < width; x += 40) {
        waves.lineTo(x + 20, waveY - 5);
        waves.lineTo(x + 40, waveY);
      }
      waves.strokePath();
    }
    waves.setDepth(3);
  }

  /**
   * Draw the balloon at current position
   */
  drawBalloon() {
    this.balloon.clear();
    
    // Balloon body (red/orange)
    this.balloon.fillStyle(0xFF6B35, 1);
    this.balloon.fillEllipse(this.balloonX, this.balloonY, 60, 80);
    
    // Balloon highlight
    this.balloon.fillStyle(0xFFFFFF, 0.3);
    this.balloon.fillEllipse(this.balloonX - 15, this.balloonY - 20, 15, 25);
    
    // Balloon string
    this.balloon.lineStyle(2, 0x333333, 1);
    this.balloon.beginPath();
    this.balloon.moveTo(this.balloonX, this.balloonY + 40);
    this.balloon.lineTo(this.balloonX, this.balloonY + 70);
    this.balloon.strokePath();
    
    // Basket
    this.balloon.fillStyle(0x8B4513, 1);
    this.balloon.fillRect(this.balloonX - 20, this.balloonY + 70, 40, 25);
    
    // Penguin in basket (simplified)
    this.balloon.fillStyle(0x000000, 1);
    this.balloon.fillCircle(this.balloonX, this.balloonY + 75, 12);
    this.balloon.fillStyle(0xFFFFFF, 1);
    this.balloon.fillCircle(this.balloonX, this.balloonY + 78, 6);
  }

  /**
   * Create the on-screen numpad
   */
  createNumpad(width, height) {
    const numpadX = width * 0.15;
    const numpadY = height * 0.45;
    const buttonSize = 60;
    const gap = 10;
    
    // Numpad background
    const numpadBg = this.add.graphics();
    numpadBg.fillStyle(0x333333, 0.9);
    numpadBg.fillRoundedRect(
      numpadX - buttonSize - gap,
      numpadY - buttonSize - gap,
      (buttonSize + gap) * 3 + gap,
      (buttonSize + gap) * 4 + gap + buttonSize,
      15
    );
    numpadBg.setDepth(10);
    
    // Number buttons 1-9
    const numbers = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ['⌫', 0, 'OK']
    ];
    
    numbers.forEach((row, rowIndex) => {
      row.forEach((num, colIndex) => {
        const x = numpadX + colIndex * (buttonSize + gap);
        const y = numpadY + rowIndex * (buttonSize + gap);
        
        let bgColor = 0xFFFFFF;
        let textColor = '#333333';
        
        if (num === '⌫') {
          bgColor = 0xF08A00; // Orange for backspace
          textColor = '#FFFFFF';
        } else if (num === 'OK') {
          bgColor = 0x00B378; // Green for OK
          textColor = '#FFFFFF';
        }
        
        const button = this.add.rectangle(x, y, buttonSize, buttonSize, bgColor);
        button.setStrokeStyle(3, 0x0062FF);
        button.setInteractive({ useHandCursor: true });
        button.setDepth(11);
        
        const label = this.add.text(x, y, String(num), {
          fontSize: num === '⌫' || num === 'OK' ? '24px' : '32px',
          color: textColor,
          fontFamily: 'Fredoka One, cursive'
        }).setOrigin(0.5).setDepth(12);
        
        // Button interactions
        button.on('pointerover', () => {
          button.setScale(1.1);
        });
        
        button.on('pointerout', () => {
          button.setScale(1);
        });
        
        button.on('pointerdown', () => {
          this.onNumpadPress(num);
        });
        
        this.numpadButtons.push({ button, label, value: num });
      });
    });
    
    // Keyboard input support
    this.input.keyboard.on('keydown', (event) => {
      if (event.key >= '0' && event.key <= '9') {
        this.onNumpadPress(parseInt(event.key));
      } else if (event.key === 'Backspace') {
        this.onNumpadPress('⌫');
      } else if (event.key === 'Enter') {
        this.onNumpadPress('OK');
      }
    });
  }

  /**
   * Handle numpad button press
   */
  onNumpadPress(value) {
    if (this.readyButton && this.readyButton.visible) {
      return; // Ignore input when ready button is shown
    }
    
    if (value === '⌫') {
      // Backspace
      this.userAnswer = this.userAnswer.slice(0, -1);
    } else if (value === 'OK') {
      // Submit answer
      this.checkAnswer();
    } else {
      // Add digit (max 3 digits)
      if (this.userAnswer.length < 3) {
        this.userAnswer += String(value);
      }
    }
    
    // Update display
    this.answerText.setText(this.userAnswer);
  }

  /**
   * Create score/progress display
   */
  createScoreDisplay(width, height) {
    // Level indicator
    this.levelText = this.add.text(20, 20, 'Level 1', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0).setDepth(15);
    this.levelText.setStroke('#333333', 4);
    
    // Progress indicator (sub-level)
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x87CEEB, 0.9);
    progressBg.fillRoundedRect(width - 160, 15, 140, 50, 15);
    progressBg.lineStyle(3, 0x0062FF);
    progressBg.strokeRoundedRect(width - 160, 15, 140, 50, 15);
    progressBg.setDepth(14);
    
    this.progressText = this.add.text(width - 90, 40, '0 / 10', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(15);
  }

  /**
   * Create "I am ready" button
   */
  createReadyButton(width, height) {
    // Semi-transparent overlay
    this.readyOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);
    this.readyOverlay.setDepth(50);
    
    // Ready button
    this.readyButton = this.add.rectangle(width / 2, height / 2, 300, 100, 0x00B378);
    this.readyButton.setStrokeStyle(6, 0xFFFFFF);
    this.readyButton.setInteractive({ useHandCursor: true });
    this.readyButton.setDepth(51);
    
    this.readyButtonText = this.add.text(width / 2, height / 2, 'I am ready!', {
      fontSize: '36px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(52);
    
    this.readyButton.on('pointerover', () => {
      this.readyButton.setScale(1.05);
      this.readyButtonText.setScale(1.05);
    });
    
    this.readyButton.on('pointerout', () => {
      this.readyButton.setScale(1);
      this.readyButtonText.setScale(1);
    });
    
    this.readyButton.on('pointerdown', () => {
      this.startLevel();
    });
  }

  /**
   * Create navigation dock
   */
  createNavigationDock(width, height) {
    const dockY = height - 50;
    const buttonSize = 50;
    const spacing = 70;
    
    // Dock background
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.9);
    dockBg.fillRoundedRect(width - 320, dockY - 30, 300, 60, 30);
    dockBg.setDepth(100);
    
    const controls = [
      { key: 'help', color: 0x00B378, action: () => this.showHelp() },
      { key: 'home', color: 0x0062FF, action: () => this.goHome() },
      { key: 'settings', color: 0xFACA2A, action: () => this.showSettings() },
      { key: 'exit', color: 0xAB47BC, action: () => this.exitGame() }
    ];
    
    controls.forEach((ctrl, index) => {
      const x = width - 280 + index * spacing;
      
      const circle = this.add.circle(x, dockY, buttonSize / 2 - 5, ctrl.color);
      circle.setStrokeStyle(2, 0xFFFFFF);
      circle.setInteractive({ useHandCursor: true });
      circle.setDepth(101);
      
      // Try to load icon, fallback to text
      if (this.textures.exists(ctrl.key)) {
        const icon = this.add.image(x, dockY, ctrl.key);
        icon.setDisplaySize(24, 24);
        icon.setDepth(102);
      }
      
      circle.on('pointerdown', ctrl.action);
    });
  }

  /**
   * Setup game logic - called after UI is created
   */
  setupGameLogic() {
    this.initLevel();
  }

  /**
   * Initialize current level
   */
  initLevel() {
    const level = this.levels[this.currentLevel];
    this.currentSubLevel = 0;
    this.subLevelData = [];
    
    if (level.type === 'table') {
      // Fixed operands from table
      this.totalSubLevels = level.operands.length;
      level.operands.forEach(op => {
        this.subLevelData.push([op.first, op.second]);
      });
    } else {
      // Random generation
      this.totalSubLevels = 10;
      for (let i = 0; i < this.totalSubLevels; i++) {
        let first, second;
        do {
          [first, second] = this.generateOperands(level.min, level.max, level.limit);
        } while (level.limit > 0 && this.calculateAnswer(first, second) > level.limit);
        this.subLevelData.push([first, second]);
      }
    }
    
    // Shuffle the questions
    this.shuffleArray(this.subLevelData);
    
    // Update UI
    this.levelText.setText(`Level ${this.currentLevel + 1}`);
    this.progressText.setText(`0 / ${this.totalSubLevels}`);
    
    // Show ready button
    this.showReadyButton();
  }

  /**
   * Show the ready button overlay
   */
  showReadyButton() {
    this.readyOverlay.setVisible(true);
    this.readyButton.setVisible(true);
    this.readyButtonText.setVisible(true);
    this.stopBalloon();
  }

  /**
   * Hide ready button and start playing
   */
  startLevel() {
    this.readyOverlay.setVisible(false);
    this.readyButton.setVisible(false);
    this.readyButtonText.setVisible(false);
    this.runQuestion();
  }

  /**
   * Run the current question
   */
  runQuestion() {
    // Get current operands
    const [first, second] = this.subLevelData[0];
    this.firstOperand = first;
    this.secondOperand = second;
    this.correctAnswer = this.calculateAnswer(first, second);
    this.userAnswer = '';
    
    // Update display
    this.firstOpText.setText(String(first));
    this.secondOpText.setText(String(second));
    this.answerText.setText('');
    this.progressText.setText(`${this.currentSubLevel} / ${this.totalSubLevels}`);
    
    // Start balloon animation
    this.startBalloon();
  }

  /**
   * Start balloon descent animation
   */
  startBalloon() {
    this.balloonY = this.balloonStartY;
    this.drawBalloon();
    
    // Calculate duration based on speed setting (100000 / speed)
    const duration = 100000 / this.speedSetting;
    
    if (this.balloonTween) {
      this.balloonTween.stop();
    }
    
    this.balloonTween = this.tweens.add({
      targets: this,
      balloonY: this.balloonEndY,
      duration: duration,
      ease: 'Linear',
      onUpdate: () => {
        this.drawBalloon();
      },
      onComplete: () => {
        this.onBalloonTimeout();
      }
    });
  }

  /**
   * Stop balloon animation
   */
  stopBalloon() {
    if (this.balloonTween) {
      this.balloonTween.stop();
    }
    this.balloonY = this.balloonStartY;
    this.drawBalloon();
  }

  /**
   * Balloon reached the water - time's up!
   */
  onBalloonTimeout() {
    // Wrong answer - balloon landed
    this.showFeedback(false);
    
    // Move current question to end of queue
    this.subLevelData.push(this.subLevelData.shift());
    
    // Continue after delay
    this.time.delayedCall(1500, () => {
      this.runQuestion();
    });
  }

  /**
   * Check user's answer
   */
  checkAnswer() {
    if (this.userAnswer === '') return;
    
    this.stopBalloon();
    
    const userNum = parseInt(this.userAnswer);
    const isCorrect = userNum === this.correctAnswer;
    
    this.showFeedback(isCorrect);
    
    if (isCorrect) {
      // Correct answer
      this.currentSubLevel++;
      this.subLevelData.shift(); // Remove answered question
      
      this.time.delayedCall(1000, () => {
        if (this.currentSubLevel >= this.totalSubLevels) {
          // Level complete
          this.onLevelComplete();
        } else {
          this.runQuestion();
        }
      });
    } else {
      // Wrong answer - move question to end
      this.subLevelData.push(this.subLevelData.shift());
      
      this.time.delayedCall(1500, () => {
        this.runQuestion();
      });
    }
  }

  /**
   * Show feedback for answer
   */
  showFeedback(isCorrect) {
    const { width, height } = this.scale;
    
    // Flash the answer background
    const color = isCorrect ? 0x00B378 : 0xFF0000;
    this.answerBg.setFillStyle(color);
    
    // Show correct answer if wrong
    if (!isCorrect) {
      this.answerText.setText(String(this.correctAnswer));
      this.answerText.setColor('#FF0000');
    } else {
      this.answerText.setColor('#00B378');
    }
    
    // Play sound
    if (this.audioManager) {
      if (isCorrect) {
        this.audioManager.play('correct');
      } else {
        this.audioManager.play('wrong');
      }
    }
    
    // Reset after delay
    this.time.delayedCall(800, () => {
      this.answerBg.setFillStyle(0xFFFDE7);
      this.answerText.setColor('#00B378');
    });
  }

  /**
   * Level completed successfully
   */
  onLevelComplete() {
    const { width, height } = this.scale;
    
    // Show success message
    const successBg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x00B378, 0.95);
    successBg.setStrokeStyle(6, 0xFFFFFF);
    successBg.setDepth(60);
    
    const successText = this.add.text(width / 2, height / 2 - 30, '⭐ Great Job! ⭐', {
      fontSize: '42px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(61);
    
    const continueText = this.add.text(width / 2, height / 2 + 40, 'Click to continue', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(61);
    
    // Click to continue
    this.input.once('pointerdown', () => {
      successBg.destroy();
      successText.destroy();
      continueText.destroy();
      this.nextLevel();
    });
  }

  /**
   * Advance to next level
   */
  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= this.levels.length) {
      // All levels complete - show final victory
      this.showVictory();
    } else {
      this.initLevel();
    }
  }

  /**
   * Show final victory screen
   */
  showVictory() {
    const { width, height } = this.scale;
    
    const victoryBg = this.add.rectangle(width / 2, height / 2, width, height, 0x0062FF, 0.95);
    victoryBg.setDepth(70);
    
    this.add.text(width / 2, height / 2 - 50, '🏆 YOU WIN! 🏆', {
      fontSize: '64px',
      color: '#FACA2A',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(71);
    
    this.add.text(width / 2, height / 2 + 30, `You mastered all ${this.operatorName} levels!`, {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(71);
    
    const menuBtn = this.add.rectangle(width / 2, height / 2 + 120, 200, 60, 0x00B378);
    menuBtn.setStrokeStyle(4, 0xFFFFFF);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(71);
    
    this.add.text(width / 2, height / 2 + 120, 'Menu', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(72);
    
    menuBtn.on('pointerdown', () => {
      this.scene.start('GameMenu');
    });
  }

  /**
   * Navigation actions
   */
  showHelp() {
    // Show help modal
    if (this.uiManager) {
      this.uiManager.showModal(
        this,
        'How to Play',
        `Solve the ${this.operatorName} problems and type your answer before the balloon lands!\n\n` +
        '• Use the numpad or keyboard to enter numbers\n' +
        '• Press OK or Enter to submit\n' +
        '• Be quick - the balloon is falling!',
        () => {}
      );
    }
  }

  goHome() {
    this.scene.start('GameMenu');
  }

  showSettings() {
    // TODO: Implement settings (speed adjustment)
  }

  exitGame() {
    this.scene.start('GameMenu');
  }

  /**
   * Utility functions
   */
  randomInRange(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
