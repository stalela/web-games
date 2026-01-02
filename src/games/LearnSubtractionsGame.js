/**
 * LearnSubtractionsGame - Visual subtraction learning game
 * Interactive subtraction problems with clickable circles to represent the difference
 * Based on GCompris learn_subtractions activity
 */
import { InteractiveGame } from './InteractiveGame.js';

export class LearnSubtractionsGame extends InteractiveGame {
  constructor(config) {
    super({
      category: 'math',
      difficulty: 2,
      ...config
    });

    // Game configuration
    this.currentQuestion = null;
    this.currentAnswer = 0;
    this.selectedCircles = [];
    this.maxCircles = 3;
    this.level = 1;
    this.currentStreak = 0;
    this.score = 0;
    this.lastQuestionIndex = -1; // Track last question to avoid repeats

    // Level configuration based on GCompris data
    this.levels = [
      {
        objective: "Subtractions with 1, 2 and 3.",
        difficulty: 2,
        questions: ["2 - 1", "3 - 1", "3 - 2"],
        answers: [1, 2, 1],
        circlesModel: 3
      },
      {
        objective: "Subtractions with 1, 2, 3 and 4.",
        difficulty: 3,
        questions: ["2 - 1", "3 - 1", "3 - 2", "4 - 1", "4 - 2", "4 - 3"],
        answers: [1, 2, 1, 3, 2, 1],
        circlesModel: 4
      },
      {
        objective: "Subtractions with 1, 2, 3, 4 and 5.",
        difficulty: 4,
        questions: ["2 - 1", "3 - 1", "3 - 2", "4 - 1", "4 - 2", "4 - 3", "5 - 1", "5 - 2", "5 - 3", "5 - 4"],
        answers: [1, 2, 1, 3, 2, 1, 4, 3, 2, 1],
        circlesModel: 5
      },
      {
        objective: "Subtractions with 1, 2, 3, 4, 5 and 6.",
        difficulty: 5,
        questions: ["3 - 1", "3 - 2", "4 - 1", "4 - 2", "4 - 3", "5 - 1", "5 - 2", "5 - 3", "5 - 4", "6 - 1", "6 - 2", "6 - 3", "6 - 4", "6 - 5"],
        answers: [2, 1, 3, 2, 1, 4, 3, 2, 1, 5, 4, 3, 2, 1],
        circlesModel: 6
      },
      {
        objective: "Subtractions with 1, 2, 3, 4, 5, 6 and 7.",
        difficulty: 6,
        questions: ["3 - 1", "3 - 2", "4 - 1", "4 - 2", "4 - 3", "5 - 1", "5 - 2", "5 - 3", "5 - 4", "6 - 1", "6 - 2", "6 - 3", "6 - 4", "6 - 5", "7 - 1", "7 - 2", "7 - 3", "7 - 4", "7 - 5", "7 - 6"],
        answers: [2, 1, 3, 2, 1, 4, 3, 2, 1, 5, 4, 3, 2, 1, 6, 5, 4, 3, 2, 1],
        circlesModel: 7
      }
    ];
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load background
    this.load.svg('learn_subtractions_bg', 'assets/game-icons/learn_subtractions_bg.svg');
  }

  /**
   * Override: Create background
   */
  createBackground() {
    const { width, height } = this.scale;

    // Background image with proper depth - ensure nature theme
    this.background = this.add.image(width / 2, height / 2, 'learn_subtractions_bg');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);
  }

  /**
   * Override InteractiveGame methods to prevent conflicts
   */
  startNextObjective() {
    // LearnSubtractionsGame handles its own game flow
  }

  onObjectiveStart(objective) {
    // LearnSubtractionsGame handles its own game flow
  }

  createInteractiveElements() {
    // LearnSubtractionsGame creates its own interactive elements
  }

  /**
   * Override: Create UI elements
   */
  createUI() {
    const { width, height } = this.scale;

    // Math problem display (huge, top center)
    this.questionText = this.add.text(width / 2, 80, '2 - 1', {
      fontSize: '80px',
      color: '#FD5E1A', // High-contrast orange
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      backgroundColor: '#FFFFFF',
      padding: { left: 40, right: 40, top: 20, bottom: 20 }
    }).setOrigin(0.5).setDepth(10);
    this.questionText.setStroke('#000000', 6);

    // OK button (massive, top-right)
    this.okButton = this.add.circle(width - 120, 120, 60, 0x00B378);
    this.okButton.setStrokeStyle(8, 0xFFFFFF);
    this.okButton.setInteractive({ useHandCursor: true });
    this.okButton.setDepth(15);
    this.okButton.setVisible(false); // Initially hidden

    // OK text
    this.okButtonText = this.add.text(width - 120, 120, 'OK', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(16);
    this.okButtonText.setVisible(false); // Initially hidden

    // OK button click handler
    this.okButton.on('pointerdown', () => this.checkAnswer());

    // Progress badge (top-right, inside light blue rounded rectangle)
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x87CEEB, 0.8); // Light blue
    progressBg.fillRoundedRect(width - 200, 20, 160, 60, 20);
    progressBg.lineStyle(4, 0x0062FF, 1);
    progressBg.strokeRoundedRect(width - 200, 20, 160, 60, 20);
    progressBg.setDepth(10);

    this.progressText = this.add.text(width - 120, 50, '0/3', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(11);
    this.progressText.setStroke('#000000', 2);

    // Level display (top-left)
    this.levelText = this.add.text(50, 50, 'Level 1', {
      fontSize: '28px',
      color: '#0062FF',
      fontFamily: 'Fredoka One, cursive',
      align: 'left'
    }).setOrigin(0).setDepth(10);
    this.levelText.setStroke('#000000', 2);

    // Instruction text (below question, above circles)
    this.instructionText = this.add.text(width / 2, 180, 'Click on the circles to show the answer!', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(10);
    this.instructionText.setStroke('#FFFFFF', 4);

    // Create navigation dock
    this.createNavigationDock(width, height);

    // Create circles area
    this.createCirclesArea();

    // Feedback text (moved to center, initially hidden)
    this.feedbackText = this.add.text(width / 2, height / 2, '', {
      fontSize: '32px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(20);
    this.feedbackText.setVisible(false);
  }

  /**
   * Create navigation dock (GCompris style bottom dock)
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
      { icon: '?', action: 'help', color: 0x00B378, label: 'Help' },
      { icon: '🏠', action: 'home', color: 0x0062FF, label: 'Home' },
      { icon: '⚙️', action: 'levels', color: 0xFACA2A, label: 'Levels' },
      { icon: '❌', action: 'menu', color: 0xAB47BC, label: 'Menu' }
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

      // Icon (using text symbols)
      const icon = this.add.text(x, dockY, control.icon, {
        fontSize: '36px',
        color: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        align: 'center'
      }).setOrigin(0.5).setDepth(101);

      // Label
      const label = this.add.text(x, dockY + buttonSize / 2 + 20, control.label, {
        fontSize: '14px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }).setOrigin(0.5).setDepth(101);

      // Click handler
      button.on('pointerdown', () => this.onNavigationClick(control.action));
    });
  }

  /**
   * Handle navigation dock clicks
   */
  onNavigationClick(action) {
    switch (action) {
      case 'help':
        // Show help modal using HelpSystem
        if (this.helpSystem) {
          this.helpSystem.showHelpModal('LearnSubtractionsGame');
        }
        break;
      case 'home':
      case 'menu':
        // Go to main menu
        this.scene.start('GameMenu');
        break;
      case 'levels':
        // Show level selection modal
        this.showLevelSelector();
        break;
    }
  }

  /**
   * Show level selector modal - Sticker-style design
   */
  showLevelSelector() {
    const { width, height } = this.scale;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.setDepth(150);
    overlay.on('pointerdown', () => this.closeLevelSelector());

    // Main modal container - "Sticker Box" style
    const modalWidth = 600;
    const modalHeight = 450;
    const modalX = width / 2;
    const modalY = height / 2;

    // Drop shadow (behind everything)
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(modalX - modalWidth/2 + 8, modalY - modalHeight/2 + 8, modalWidth, modalHeight, 30);
    shadow.setDepth(150);

    // Main sticker background (white with rounded corners)
    const modalBg = this.add.graphics();
    modalBg.fillStyle(0xFFFFFF, 1);
    modalBg.fillRoundedRect(modalX - modalWidth/2, modalY - modalHeight/2, modalWidth, modalHeight, 30);
    modalBg.lineStyle(6, 0x101012, 1); // Thick black border
    modalBg.strokeRoundedRect(modalX - modalWidth/2, modalY - modalHeight/2, modalWidth, modalHeight, 30);
    modalBg.setDepth(151);

    // Title with icon
    const titleText = this.add.text(modalX, modalY - modalHeight/2 + 60, '🌟 SELECT A LEVEL', {
      fontSize: '32px',
      color: '#0062FF', // River Blue
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(152);

    // Lalela color palette for level buttons
    const levelColors = [
      0x00B378, // Aloe Green (Level 1)
      0xFACA2A, // Lalela Yellow (Level 2)
      0xFD5E1A  // Bead Orange (Level 3)
    ];

    // Create chunky level buttons
    const buttonWidth = 140;
    const buttonHeight = 120;
    const buttonSpacing = 30;
    const startY = modalY - 60;
    const startX = modalX - (this.levels.length * (buttonWidth + buttonSpacing) - buttonSpacing) / 2 + buttonWidth / 2;

    this.levels.forEach((levelData, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing);
      const y = startY;

      // Button shadow
      const buttonShadow = this.add.graphics();
      buttonShadow.fillStyle(0x000000, 0.4);
      buttonShadow.fillRoundedRect(x - buttonWidth/2 + 4, y - buttonHeight/2 + 4, buttonWidth, buttonHeight, 20);
      buttonShadow.setDepth(151);

      // Button background
      const buttonBg = this.add.graphics();
      buttonBg.fillStyle(levelColors[index % levelColors.length], 1);
      buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 20);
      buttonBg.lineStyle(4, 0xFFFFFF, 1);
      buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 20);
      buttonBg.setDepth(152);

      // Level number
      const levelNumber = this.add.text(x, y - 20, `LEVEL\n${index + 1}`, {
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }).setOrigin(0.5).setDepth(153);

      // Level description
      const levelDesc = this.add.text(x, y + 20, levelData.objective.split('.')[0], {
        fontSize: '14px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        align: 'center',
        wordWrap: { width: buttonWidth - 20 }
      }).setOrigin(0.5).setDepth(153);

      // Make button interactive
      buttonBg.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      buttonBg.on('pointerdown', () => {
        this.level = index + 1;
        this.closeLevelSelector();
        this.recreateCirclesForLevel();
        this.generateQuestion();
        this.levelText.setText(`Level ${this.level}`);
      });
    });

    // Store references for cleanup
    this.levelSelectorElements = [overlay, shadow, modalBg, titleText, ...this.levels.flatMap((_, index) => {
      // Return all button elements for this level
      return []; // We'll implement proper cleanup later
    })];
  }

  /**
   * Close level selector modal
   */
  closeLevelSelector() {
    if (this.levelSelectorElements) {
      this.levelSelectorElements.forEach(element => {
        if (element && element.destroy) {
          element.destroy();
        }
      });
      this.levelSelectorElements = null;
    }
  }

  /**
   * Create the circles area where players click
   */
  createCirclesArea() {
    const { width, height } = this.scale;
    const circlesY = height / 2 + 50;

    // Container for circles
    this.circlesContainer = this.add.container(width / 2, circlesY);

    // Create circles based on current level
    this.circles = [];
    this.selectedCircles = [];

    const levelData = this.levels[this.level - 1];
    const numCircles = levelData.circlesModel;
    const circleRadius = 35;
    const spacing = 90;

    // Calculate starting position to center the circles
    const totalWidth = (numCircles - 1) * spacing;
    const startX = -totalWidth / 2;

    for (let i = 0; i < numCircles; i++) {
      const x = startX + (i * spacing);
      const circle = this.createClickableCircle(x, 0, circleRadius, i);
      this.circles.push(circle);
      this.circlesContainer.add(circle.bg);
      this.circlesContainer.add(circle.label);
    }
  }

  /**
   * Create a clickable circle
   */
  createClickableCircle(x, y, radius, index) {
    // Circle background (white with 6px Ink Black border - "chunky sticker" style)
    const circleBg = this.add.circle(x, y, radius, 0xFFFFFF);
    circleBg.setStrokeStyle(6, 0x101012); // 6px Ink Black border

    // Make it interactive
    circleBg.setInteractive({ useHandCursor: true });
    circleBg.on('pointerdown', () => this.onCircleClick(index));
    circleBg.on('pointerover', () => {
      if (!this.selectedCircles.includes(index)) {
        circleBg.setFillStyle(0xF0F0F0); // Light gray hover
      }
    });
    circleBg.on('pointerout', () => {
      if (!this.selectedCircles.includes(index)) {
        circleBg.setFillStyle(0xFFFFFF); // Back to white
      }
    });

    // Number label (initially hidden)
    const label = this.add.text(x, y, (index + 1).toString(), {
      fontSize: '32px',
      color: '#000000',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    label.setVisible(false);
    // Make label extra bold when visible (selected)
    label.setFontSize(36);
    label.setStroke('#FFFFFF', 2);

    return { bg: circleBg, label: label, selected: false };
  }


  /**
   * Handle circle click
   */
  onCircleClick(circleIndex) {
    const circle = this.circles[circleIndex];

    if (circle.selected) {
      // Deselect circle
      this.deselectCircle(circleIndex);
    } else {
      // Select circle
      this.selectCircle(circleIndex);
    }

    this.updateSelectionDisplay();
  }

  /**
   * Select a circle
   */
  selectCircle(circleIndex) {
    const circle = this.circles[circleIndex];

    if (!circle.selected) {
      circle.selected = true;
      circle.bg.setFillStyle(0xFACA2A); // Lalela Yellow when selected
      circle.label.setVisible(true);

      this.selectedCircles.push(circleIndex);

      // Play selection sound
      this.playSound('click');

      // Add a subtle bounce animation
      this.tweens.add({
        targets: circle.bg,
        scale: 1.1,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });

      // Check if correct answer is selected and show OK button
      if (this.selectedCircles.length === this.currentAnswer) {
        this.showOKButton();
      } else {
        this.hideOKButton();
      }
    }
  }

  /**
   * Deselect a circle
   */
  deselectCircle(circleIndex) {
    const circle = this.circles[circleIndex];

    if (circle.selected) {
      circle.selected = false;
      circle.bg.setFillStyle(0xFFFFFF); // Back to white
      circle.label.setVisible(false);

      // Remove from selected array
      const index = this.selectedCircles.indexOf(circleIndex);
      if (index > -1) {
        this.selectedCircles.splice(index, 1);
      }

      // Play deselection sound
      this.playSound('click');

      // Hide OK button since selection changed
      this.hideOKButton();
    }
  }

  /**
   * Show OK button when correct answer is selected
   */
  showOKButton() {
    if (this.okButton && this.okButtonText) {
      this.okButton.setVisible(true);
      this.okButtonText.setVisible(true);

      // Pulse animation to draw attention
      this.tweens.add({
        targets: [this.okButton, this.okButtonText],
        scale: 1.1,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Power2'
      });
    }
  }

  /**
   * Hide OK button
   */
  hideOKButton() {
    if (this.okButton && this.okButtonText) {
      this.okButton.setVisible(false);
      this.okButtonText.setVisible(false);

      // Stop pulsing animation
      this.tweens.killTweensOf([this.okButton, this.okButtonText]);
      this.okButton.setScale(1);
      this.okButtonText.setScale(1);
    }
  }

  /**
   * Update the visual display of selection
   */
  updateSelectionDisplay() {
    // Update instruction to show current selection
    const count = this.selectedCircles.length;
    if (count === 0) {
      this.instructionText.setText('Click on the circles to show the answer!');
    } else {
      this.instructionText.setText(`You selected ${count} circle${count !== 1 ? 's' : ''}. Click Check Answer when ready!`);
    }
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selectedCircles.forEach(circleIndex => {
      this.deselectCircle(circleIndex);
    });
    this.selectedCircles = [];
    this.updateSelectionDisplay();

    // Clear feedback
    if (this.feedbackText) {
      this.feedbackText.setVisible(false);
    }

    // Hide OK button
    this.hideOKButton();

    this.playSound('click');
  }

  /**
   * Check the player's answer
   */
  checkAnswer() {
    const selectedCount = this.selectedCircles.length;

    if (selectedCount === this.currentAnswer) {
      // Correct answer!
      this.showSuccessFeedback();
      this.playSound('success');

      // Update progress
      this.currentStreak++;
      this.score += 10;
      this.updateProgressDisplay();

      // Celebrate with animations
      this.celebrateCorrect();

      // Next question after delay
      this.time.delayedCall(2500, () => this.nextQuestion());
    } else {
      // Incorrect answer - encourage correction without clearing selection
      this.showErrorFeedback();
      this.playSound('error');

      // Shake the circles container
      this.tweens.add({
        targets: this.circlesContainer,
        x: '+=20',
        duration: 100,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
    }
  }

  /**
   * Celebrate correct answer
   */
  celebrateCorrect() {
    // Scale up selected circles
    this.selectedCircles.forEach(circleIndex => {
      const circle = this.circles[circleIndex];
      this.tweens.add({
        targets: [circle.bg, circle.label],
        scale: 1.3,
        duration: 400,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    });

    // Create particle effect
    for (let i = 0; i < 15; i++) {
      const particle = this.add.circle(this.circlesContainer.x, this.circlesContainer.y, 4, 0xFACA2A);
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 120;

      this.tweens.add({
        targets: particle,
        x: this.circlesContainer.x + Math.cos(angle) * speed,
        y: this.circlesContainer.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Show success feedback with animation
   */
  showSuccessFeedback() {
    if (this.feedbackText) {
      this.feedbackText.setText('Excellent!');
      this.feedbackText.setColor('#00B378');
      this.feedbackText.setVisible(true);

      // Large popup animation
      this.feedbackText.setScale(0);
      this.tweens.add({
        targets: this.feedbackText,
        scale: 1.5,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.time.delayedCall(2000, () => {
            this.feedbackText.setVisible(false);
          });
        }
      });
    }
  }

  /**
   * Show error feedback without clearing selection
   */
  showErrorFeedback() {
    if (this.feedbackText) {
      this.feedbackText.setText('Try again!');
      this.feedbackText.setColor('#FF6B6B');
      this.feedbackText.setVisible(true);

      // Quick flash animation
      this.tweens.add({
        targets: this.feedbackText,
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          this.time.delayedCall(1500, () => {
            this.feedbackText.setVisible(false);
          });
        }
      });
    }
  }

  /**
   * Update progress display
   */
  updateProgressDisplay() {
    const levelData = this.levels[this.level - 1];
    const currentProgress = Math.min(this.currentStreak, levelData.questions.length);
    if (this.progressText) {
      this.progressText.setText(`${currentProgress}/${levelData.questions.length}`);
    }
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    // Clear current selection
    this.clearSelection();

    // Generate new question
    this.generateQuestion();

    // Clear feedback
    if (this.feedbackText) {
      this.feedbackText.setVisible(false);
    }
  }

  /**
   * Generate a new question
   */
  generateQuestion() {
    const levelData = this.levels[this.level - 1];

    // Pick a random question from current level, avoiding repeats
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * levelData.questions.length);
    } while (randomIndex === this.lastQuestionIndex && levelData.questions.length > 1);

    this.lastQuestionIndex = randomIndex;
    const question = levelData.questions[randomIndex];
    const answer = levelData.answers[randomIndex];

    this.currentQuestion = question;
    this.currentAnswer = answer;

    // Update display
    this.questionText.setText(question + ' = ?');

    // Update level display
    this.levelText.setText(`Level ${this.level}`);
    this.instructionText.setText(`${levelData.objective}\nClick on the circles to show the answer!`);

    // Update progress display
    this.updateProgressDisplay();

    // Hide OK button for new question
    this.hideOKButton();
  }

  /**
   * Advance to next level
   */
  advanceLevel() {
    if (this.level < this.levels.length) {
      this.level++;
      this.recreateCirclesForLevel();
      this.showFeedback(`Level ${this.level}!`, '#FACA2A');
      this.generateQuestion();
    } else {
      this.showFeedback('All levels completed! 🎊', '#00B378');
    }
  }

  /**
   * Recreate circles for new level
   */
  recreateCirclesForLevel() {
    // Destroy existing circles
    if (this.circlesContainer) {
      this.circlesContainer.destroy();
    }

    // Create new circles for the level
    this.createCirclesArea();
  }

  /**
   * Start the game
   */
  create() {
    // Create game UI first before calling super.create()
    this.createGameElements();

    // Now call super.create() which will eventually call startLevel()
    super.create();

    // Start with first level
    this.generateQuestion();
  }

  /**
   * Create game-specific elements
   */
  createGameElements() {
    // Create circles area
    this.createCirclesArea();
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
    super.shutdown();
  }
}