/**
 * LearnDigitsGame - Interactive number learning game
 * Children learn to recognize, identify, and count digits through interactive activities
 */
import { InteractiveGame } from './InteractiveGame.js';

export class LearnDigitsGame extends InteractiveGame {
  constructor(config) {
    super({
      category: 'mathematics',
      difficulty: 1,
      ...config
    });

    // Number learning properties
    this.currentNumber = 1;
    this.maxNumber = 10;
    this.numberButtons = [];
    this.displayNumber = null;
    this.gameMode = 'identify'; // 'identify', 'count', 'sequence'
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.currentRound = 0;
    this.maxRounds = 5;
  }

  /**
   * Initialize learning objectives for number learning
   */
  initializeLearningObjectives() {
    // Number recognition
    this.addLearningObjective(
      'number_recognition',
      'Number Recognition',
      'Identify and recognize written numbers',
      'Look at the number and click the matching button',
      20,
      10 // Need to correctly identify 10 numbers
    );

    // Counting skills
    this.addLearningObjective(
      'counting_skills',
      'Counting Skills',
      'Learn to count objects and match to numbers',
      'Count the objects and click the correct number',
      25,
      8 // Need to complete 8 counting activities
    );

    // Number sequence
    this.addLearningObjective(
      'number_sequence',
      'Number Sequence',
      'Understand number order and sequences',
      'Click numbers in the correct order',
      30,
      5 // Need to complete 5 sequence activities
    );

    // Number writing
    this.addLearningObjective(
      'number_writing',
      'Number Writing',
      'Learn to write numbers correctly',
      'Practice writing numbers through interactive activities',
      35,
      6 // Need to complete 6 writing activities
    );

    // Set up validation rules
    this.setupValidationRules();
  }

  /**
   * Set up validation rules for number learning objectives
   */
  setupValidationRules() {
    // Validate number recognition
    this.addValidationRule('number_recognition', (interaction) => {
      return interaction.type === 'number_identified' &&
             interaction.correct === true;
    });

    // Validate counting skills
    this.addValidationRule('counting_skills', (interaction) => {
      return interaction.type === 'counting_completed' &&
             interaction.correct === true;
    });

    // Validate number sequence
    this.addValidationRule('number_sequence', (interaction) => {
      return interaction.type === 'sequence_completed' &&
             interaction.correct === true;
    });

    // Validate number writing
    this.addValidationRule('number_writing', (interaction) => {
      return interaction.type === 'writing_completed' &&
             interaction.correct === true;
    });
  }

  /**
   * Create interactive number learning elements
   */
  createInteractiveElements() {
    this.createTitleAndInstructions();
    this.createNumberDisplay();
    this.createNumberButtons();
    this.createGameModeSelector();
    this.createProgressIndicator();
    this.startNewRound();
  }

  /**
   * Create title and instructions
   */
  createTitleAndInstructions() {
    const { width, height } = this.scale;

    // Main title
    this.add.text(width / 2, 40, '🔢 Number Explorer!', {
      fontSize: '36px',
      color: '#FFD93D',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Instructions - will change based on game mode
    this.instructionText = this.add.text(width / 2, 85, 'Click the correct number!', {
      fontSize: '18px',
      color: '#333333',
      fontFamily: 'Nunito, sans-serif',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Create the main number display area
   */
  createNumberDisplay() {
    const { width, height } = this.scale;

    // Create display background (sticker style)
    const displayBg = this.add.graphics();
    displayBg.fillStyle(0xFFFFFF, 0.9);
    displayBg.fillRoundedRect(width / 2 - 100, height / 2 - 120, 200, 100, 20);
    displayBg.lineStyle(4, 0xFFD93D, 1);
    displayBg.strokeRoundedRect(width / 2 - 100, height / 2 - 120, 200, 100, 20);

    // Add drop shadow
    displayBg.fillStyle(0x000000, 0.2);
    displayBg.fillRoundedRect(width / 2 - 95, height / 2 - 115, 200, 100, 20);

    // Redraw main background on top
    displayBg.fillStyle(0xFFFFFF, 0.9);
    displayBg.fillRoundedRect(width / 2 - 100, height / 2 - 120, 200, 100, 20);
    displayBg.lineStyle(4, 0xFFD93D, 1);
    displayBg.strokeRoundedRect(width / 2 - 100, height / 2 - 120, 200, 100, 20);

    // Number display text
    this.displayNumber = this.add.text(width / 2, height / 2 - 70, '1', {
      fontSize: '72px',
      color: '#FF6B6B',
      fontFamily: 'Fredoka One, cursive',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Object counter display (for counting mode)
    this.objectDisplay = this.add.container(width / 2, height / 2 - 70);
    this.objectDisplay.setVisible(false);
  }

  /**
   * Create number selection buttons
   */
  createNumberButtons() {
    const { width, height } = this.scale;

    const buttonsPerRow = 5;
    const buttonSize = 80;
    const buttonSpacing = 20;
    const startY = height * 0.7;

    this.numberButtons = [];

    for (let i = 1; i <= 10; i++) {
      const row = Math.floor((i - 1) / buttonsPerRow);
      const col = (i - 1) % buttonsPerRow;

      const x = width / 2 - (buttonsPerRow - 1) * (buttonSize + buttonSpacing) / 2 + col * (buttonSize + buttonSpacing);
      const y = startY + row * (buttonSize + buttonSpacing);

      // Create button with sticker style
      const buttonGraphics = this.add.graphics();

      // Drop shadow
      buttonGraphics.fillStyle(0x000000, 0.2);
      buttonGraphics.fillRoundedRect(x - buttonSize/2 + 2, y - buttonSize/2 + 2, buttonSize, buttonSize, buttonSize * 0.2);

      // Main button background - will be colored based on number
      buttonGraphics.fillStyle(this.getNumberColor(i), 1);
      buttonGraphics.fillRoundedRect(x - buttonSize/2, y - buttonSize/2, buttonSize, buttonSize, buttonSize * 0.2);
      buttonGraphics.lineStyle(3, 0xFFFFFF, 1);
      buttonGraphics.strokeRoundedRect(x - buttonSize/2, y - buttonSize/2, buttonSize, buttonSize, buttonSize * 0.2);

      // Make interactive with larger hit area
      const hitAreaSize = buttonSize * 1.2;
      buttonGraphics.setInteractive(
        new Phaser.Geom.Rectangle(x - hitAreaSize/2, y - hitAreaSize/2, hitAreaSize, hitAreaSize),
        Phaser.Geom.Rectangle.Contains
      );

      // Number text
      const numberText = this.add.text(x, y, i.toString(), {
        fontSize: `${buttonSize * 0.4}px`,
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        fontWeight: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      const numberButton = {
        graphics: buttonGraphics,
        text: numberText,
        number: i,
        x: x,
        y: y,
        isCorrect: false
      };

      // Add interaction handlers
      this.setupButtonInteractions(numberButton);

      this.numberButtons.push(numberButton);
    }
  }

  /**
   * Set up button interaction handlers
   */
  setupButtonInteractions(numberButton) {
    const button = numberButton.graphics;

    // Hover effects
    button.on('pointerover', () => {
      this.tweens.add({
        targets: numberButton.graphics,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: numberButton.graphics,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
      });
    });

    button.on('pointerdown', () => {
      this.selectNumber(numberButton);
    });
  }

  /**
   * Create game mode selector
   */
  createGameModeSelector() {
    const { width, height } = this.scale;

    const modes = [
      { id: 'identify', name: 'Identify', emoji: '👁️', color: 0xFF6B6B },
      { id: 'count', name: 'Count', emoji: '🔢', color: 0x4ECDC4 },
      { id: 'sequence', name: 'Sequence', emoji: '🔄', color: 0xFFD93D }
    ];

    const modeY = height * 0.18;
    const modeSpacing = 100;
    const startX = width / 2 - (modes.length - 1) * modeSpacing / 2;

    this.modeButtons = [];

    modes.forEach((mode, index) => {
      const x = startX + index * modeSpacing;

      // Create mode button
      const modeGraphics = this.add.graphics();

      // Button background
      modeGraphics.fillStyle(mode.color, 0.8);
      modeGraphics.fillRoundedRect(x - 40, modeY - 20, 80, 40, 12);
      modeGraphics.lineStyle(2, 0xFFFFFF, 1);
      modeGraphics.strokeRoundedRect(x - 40, modeY - 20, 80, 40, 12);

      modeGraphics.setInteractive(
        new Phaser.Geom.Rectangle(x - 40, modeY - 20, 80, 40),
        Phaser.Geom.Rectangle.Contains
      );

      // Mode emoji and text
      const emojiText = this.add.text(x, modeY - 5, mode.emoji, {
        fontSize: '18px',
        align: 'center'
      }).setOrigin(0.5);

      const nameText = this.add.text(x, modeY + 8, mode.name, {
        fontSize: '10px',
        color: '#FFFFFF',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);

      const modeButton = {
        graphics: modeGraphics,
        emojiText: emojiText,
        nameText: nameText,
        mode: mode,
        isSelected: mode.id === this.gameMode
      };

      // Update visual state
      this.updateModeButtonState(modeButton);

      // Add interaction
      modeGraphics.on('pointerdown', () => {
        this.selectGameMode(mode.id);
      });

      // Hover effects
      modeGraphics.on('pointerover', () => {
        if (!modeButton.isSelected) {
          this.tweens.add({
            targets: modeGraphics,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 150,
            ease: 'Power2'
          });
        }
      });

      modeGraphics.on('pointerout', () => {
        if (!modeButton.isSelected) {
          this.tweens.add({
            targets: modeGraphics,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Power2'
          });
        }
      });

      this.modeButtons.push(modeButton);
    });
  }

  /**
   * Create progress indicator
   */
  createProgressIndicator() {
    const { width, height } = this.scale;

    // Progress bar background
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0xFFFFFF, 0.8);
    this.progressBg.fillRoundedRect(width / 2 - 150, height * 0.12, 300, 20, 10);
    this.progressBg.lineStyle(2, 0xFFD93D, 1);
    this.progressBg.strokeRoundedRect(width / 2 - 150, height * 0.12, 300, 20, 10);

    // Progress bar fill
    this.progressFill = this.add.graphics();
    this.updateProgressBar();

    // Progress text
    this.progressText = this.add.text(width / 2, height * 0.115, 'Round 1 of 5', {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Update progress bar visual
   */
  updateProgressBar() {
    const { width, height } = this.scale;
    const progress = this.currentRound / this.maxRounds;

    this.progressFill.clear();
    this.progressFill.fillStyle(0xFFD93D, 1);
    this.progressFill.fillRoundedRect(width / 2 - 145, height * 0.125, 290 * progress, 10, 5);
  }

  /**
   * Get color for number button
   */
  getNumberColor(number) {
    const colors = [
      0xFF6B6B, 0x4ECDC4, 0xFFD93D, 0x54A0FF, 0x5CE600,
      0xFFA726, 0xAB47BC, 0xFF9FF3, 0xF87171, 0x60A5FA
    ];
    return colors[(number - 1) % colors.length];
  }

  /**
   * Select game mode
   */
  selectGameMode(modeId) {
    if (this.gameMode === modeId) return;

    this.gameMode = modeId;

    // Update mode button states
    this.modeButtons.forEach(button => {
      button.isSelected = button.mode.id === modeId;
      this.updateModeButtonState(button);
    });

    // Update instructions
    this.updateInstructions();

    // Reset current round
    this.startNewRound();
  }

  /**
   * Update mode button visual states
   */
  updateModeButtonState(button) {
    const alpha = button.isSelected ? 1 : 0.7;
    const scale = button.isSelected ? 1.05 : 1;

    button.graphics.setAlpha(alpha);
    button.emojiText.setAlpha(alpha);
    button.nameText.setAlpha(alpha);

    button.graphics.setScale(scale);
    button.emojiText.setScale(scale);
    button.nameText.setScale(scale);
  }

  /**
   * Update instructions based on game mode
   */
  updateInstructions() {
    switch (this.gameMode) {
      case 'identify':
        this.instructionText.setText('Look at the number and click the matching button!');
        break;
      case 'count':
        this.instructionText.setText('Count the objects and click the correct number!');
        break;
      case 'sequence':
        this.instructionText.setText('Click the numbers in the correct order!');
        break;
    }
  }

  /**
   * Start a new round
   */
  startNewRound() {
    this.currentRound++;
    this.updateProgressBar();
    this.progressText.setText(`Round ${this.currentRound} of ${this.maxRounds}`);

    // Reset button states
    this.numberButtons.forEach(button => {
      button.isCorrect = false;
      button.graphics.setAlpha(1);
    });

    // Generate new challenge based on mode
    switch (this.gameMode) {
      case 'identify':
        this.startIdentificationRound();
        break;
      case 'count':
        this.startCountingRound();
        break;
      case 'sequence':
        this.startSequenceRound();
        break;
    }
  }

  /**
   * Start identification round
   */
  startIdentificationRound() {
    // Show number display, hide object display
    this.displayNumber.setVisible(true);
    this.objectDisplay.setVisible(false);

    // Generate random number to identify
    this.currentNumber = Phaser.Math.Between(1, 10);
    this.displayNumber.setText(this.currentNumber.toString());

    // Mark correct button
    this.numberButtons.forEach(button => {
      button.isCorrect = button.number === this.currentNumber;
    });
  }

  /**
   * Start counting round
   */
  startCountingRound() {
    // Hide number display, show object display
    this.displayNumber.setVisible(false);
    this.objectDisplay.setVisible(true);

    // Clear previous objects
    this.objectDisplay.removeAll(true);

    // Generate random number of objects to count (1-10)
    this.currentNumber = Phaser.Math.Between(1, 10);

    // Create objects to count (using emojis)
    const objectEmoji = '🍎'; // Could randomize this
    const objectSize = 40;
    const objectsPerRow = 5;

    for (let i = 0; i < this.currentNumber; i++) {
      const row = Math.floor(i / objectsPerRow);
      const col = i % objectsPerRow;
      const x = (col - (objectsPerRow - 1) / 2) * (objectSize + 10);
      const y = (row - Math.floor((this.currentNumber - 1) / objectsPerRow) / 2) * (objectSize + 10);

      const objectText = this.add.text(x, y, objectEmoji, {
        fontSize: `${objectSize}px`,
        align: 'center'
      }).setOrigin(0.5);

      this.objectDisplay.add(objectText);
    }

    // Mark correct button
    this.numberButtons.forEach(button => {
      button.isCorrect = button.number === this.currentNumber;
    });
  }

  /**
   * Start sequence round
   */
  startSequenceRound() {
    // Hide displays
    this.displayNumber.setVisible(false);
    this.objectDisplay.setVisible(false);

    // For sequence mode, we want the child to click numbers in order
    // Start with 1 and go up to current round number
    this.sequenceTarget = this.currentRound;
    this.sequenceStep = 1;

    this.displayNumber.setVisible(true);
    this.displayNumber.setText('Click 1 first!');

    // Mark first button as correct
    this.numberButtons.forEach(button => {
      button.isCorrect = button.number === 1;
    });
  }

  /**
   * Handle number button selection
   */
  selectNumber(numberButton) {
    this.totalAttempts++;

    if (this.gameMode === 'sequence') {
      this.handleSequenceSelection(numberButton);
    } else {
      this.handleRegularSelection(numberButton);
    }
  }

  /**
   * Handle regular number selection (identify/count modes)
   */
  handleRegularSelection(numberButton) {
    if (numberButton.isCorrect) {
      this.correctAnswers++;

      // Success animation
      this.tweens.add({
        targets: numberButton.graphics,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        yoyo: true,
        ease: 'Power2'
      });

      // Trigger interaction validation
      this.onElementInteraction('number_button', 'number_identified', {
        selectedNumber: numberButton.number,
        correctNumber: this.currentNumber,
        correct: true
      });

      this.showFeedback(`Great job! That's number ${numberButton.number}! 🎉`, 'success', 2000);

      // Move to next round after delay
      this.time.delayedCall(2000, () => {
        if (this.currentRound < this.maxRounds) {
          this.startNewRound();
        } else {
          this.showGameComplete();
        }
      });
    } else {
      // Wrong answer animation
      this.tweens.add({
        targets: numberButton.graphics,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });

      this.showFeedback('Try again! 💪', 'info', 1500);

      // Trigger interaction validation for wrong answer
      this.onElementInteraction('number_button', 'number_identified', {
        selectedNumber: numberButton.number,
        correctNumber: this.currentNumber,
        correct: false
      });
    }
  }

  /**
   * Handle sequence selection
   */
  handleSequenceSelection(numberButton) {
    if (numberButton.isCorrect) {
      this.correctAnswers++;

      // Success animation
      this.tweens.add({
        targets: numberButton.graphics,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });

      this.sequenceStep++;

      if (this.sequenceStep <= this.sequenceTarget) {
        // Continue sequence
        this.displayNumber.setText(`Now click ${this.sequenceStep}!`);
        this.numberButtons.forEach(button => {
          button.isCorrect = button.number === this.sequenceStep;
        });
      } else {
        // Sequence completed
        this.onElementInteraction('number_button', 'sequence_completed', {
          sequenceLength: this.sequenceTarget,
          correct: true
        });

        this.showFeedback(`Perfect sequence! You counted to ${this.sequenceTarget}! 🌟`, 'success', 2000);

        // Move to next round after delay
        this.time.delayedCall(2000, () => {
          if (this.currentRound < this.maxRounds) {
            this.startNewRound();
          } else {
            this.showGameComplete();
          }
        });
      }
    } else {
      // Wrong answer - reset sequence
      this.tweens.add({
        targets: numberButton.graphics,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });

      this.showFeedback('Oops! Let\'s start over. Click 1!', 'info', 1500);
      this.sequenceStep = 1;
      this.displayNumber.setText('Click 1 first!');

      this.numberButtons.forEach(button => {
        button.isCorrect = button.number === 1;
      });
    }
  }

  /**
   * Show game completion
   */
  showGameComplete() {
    const accuracy = Math.round((this.correctAnswers / this.totalAttempts) * 100);

    this.showFeedback(`Amazing work! You completed all rounds with ${accuracy}% accuracy! 🎊`, 'success', 5000);

    // Trigger final interaction validation
    this.onElementInteraction('game', 'completed', {
      totalRounds: this.maxRounds,
      correctAnswers: this.correctAnswers,
      totalAttempts: this.totalAttempts,
      accuracy: accuracy
    });
  }

  /**
   * Create tutorial steps for number learning
   */
  createTutorialSteps() {
    return [
      {
        message: "Welcome to Number Explorer! 🔢",
        highlightElement: null
      },
      {
        message: "Choose a game mode to learn numbers!",
        highlightElement: this.modeButtons[0]
      },
      {
        message: "Look at the number or objects in the center",
        highlightElement: this.displayNumber
      },
      {
        message: "Click the correct number button below!",
        highlightElement: this.numberButtons[0]
      }
    ];
  }

  /**
   * Get number learning specific statistics
   */
  getGameStats() {
    const accuracy = this.totalAttempts > 0 ? Math.round((this.correctAnswers / this.totalAttempts) * 100) : 0;

    return {
      ...super.getGameStats(),
      gameMode: this.gameMode,
      currentRound: this.currentRound,
      correctAnswers: this.correctAnswers,
      totalAttempts: this.totalAttempts,
      accuracy: accuracy,
      numbersLearned: this.interactionHistory.filter(h => h.type === 'number_identified' && h.correct).length
    };
  }

  /**
   * Override restart to reset number learning state
   */
  restartGame() {
    // Reset game state
    this.currentNumber = 1;
    this.correctAnswers = 0;
    this.totalAttempts = 0;
    this.currentRound = 0;

    // Reset displays
    this.displayNumber.setVisible(true);
    this.objectDisplay.setVisible(false);
    this.objectDisplay.removeAll(true);

    // Reset progress
    this.updateProgressBar();
    this.progressText.setText('Round 1 of 5');

    // Reset button states
    this.numberButtons.forEach(button => {
      button.isCorrect = false;
      button.graphics.setAlpha(1);
    });

    super.restartGame();

    // Start first round
    this.startNewRound();
  }
}