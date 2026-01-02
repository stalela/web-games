/**
 * LearnAdditionsGame - Visual addition learning game
 * Interactive addition problems with clickable circles to represent the sum
 * Based on GCompris learn_additions activity
 */
import { InteractiveGame } from './InteractiveGame.js';

export class LearnAdditionsGame extends InteractiveGame {
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
    this.maxCircles = 4;
    this.level = 1;

    // Level configuration based on GCompris data
    this.levels = [
      {
        objective: "Additions with 1 and 2",
        difficulty: 2,
        questions: ["1 + 1", "1 + 2", "2 + 2"],
        answers: [2, 3, 4],
        circlesModel: 4
      },
      {
        objective: "Additions with 1, 2 and 3",
        difficulty: 3,
        questions: ["1 + 1", "1 + 2", "1 + 3", "2 + 2", "2 + 3", "3 + 3"],
        answers: [2, 3, 4, 4, 5, 6],
        circlesModel: 6
      },
      {
        objective: "Additions with 1, 2, 3 and 4",
        difficulty: 4,
        questions: ["1 + 1", "1 + 2", "1 + 3", "1 + 4", "2 + 2", "2 + 3", "2 + 4", "3 + 3", "3 + 4", "4 + 4"],
        answers: [2, 3, 4, 5, 4, 5, 6, 6, 7, 8],
        circlesModel: 8
      }
    ];
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load background
    this.load.svg('learn_additions_bg', 'assets/game-icons/learn_additions_bg.svg');
  }

  /**
   * Override InteractiveGame methods to prevent conflicts
   */
  startNextObjective() {
    // LearnAdditionsGame handles its own game flow
  }

  onObjectiveStart(objective) {
    // LearnAdditionsGame handles its own game flow
  }

  createInteractiveElements() {
    // LearnAdditionsGame creates its own interactive elements
  }

  /**
   * Override: Create background
   */
  createBackground() {
    const { width, height } = this.scale;

    // Background image with proper depth - ensure nature theme
    this.background = this.add.image(width / 2, height / 2, 'learn_additions_bg');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);
  }

  /**
   * Override: Create UI elements
   */
  createUI() {
    const { width, height } = this.scale;

    // Math problem display (huge, top center)
    this.questionText = this.add.text(width / 2, 80, '1 + 2', {
      fontSize: '100px',
      color: '#FACA2A',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      backgroundColor: '#FFFFFF',
      padding: { left: 40, right: 40, top: 20, bottom: 20 }
    }).setOrigin(0.5).setDepth(10);
    this.questionText.setStroke('#000000', 6);

    // OK button (massive, center-right next to circles)
    this.okButton = this.add.circle(width * 0.75, height / 2, 80, 0x00B378);
    this.okButton.setStrokeStyle(8, 0xFFFFFF);
    this.okButton.setInteractive({ useHandCursor: true });
    this.okButton.setDepth(15);
    this.okButton.setVisible(false); // Initially hidden

    // OK text
    this.okButtonText = this.add.text(width * 0.75, height / 2, 'OK', {
      fontSize: '32px',
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
      icon.setDepth(101);

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
          this.helpSystem.showHelpModal('LearnAdditionsGame');
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

    // Inner white glow effect
    const innerGlow = this.add.graphics();
    innerGlow.lineStyle(10, 0xFFFFFF, 0.8);
    innerGlow.strokeRoundedRect(modalX - modalWidth/2 + 10, modalY - modalHeight/2 + 10, modalWidth - 20, modalHeight - 20, 25);
    innerGlow.setDepth(151);

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

    const levelButtons = [];
    const levelTexts = [];
    const levelLabels = [];
    const glowEffects = [];
    const checkmarks = [];

    for (let level = 0; level < this.levels.length; level++) {
      const x = startX + level * (buttonWidth + buttonSpacing);
      const y = startY;

      // Chunky button background (rounded rectangle - "pill" style)
      const buttonBg = this.add.graphics();
      buttonBg.fillStyle(levelColors[level], 1);
      buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, buttonHeight/2);
      buttonBg.lineStyle(4, 0x101012, 1); // Thick black border
      buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, buttonHeight/2);
      buttonBg.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight),
                             Phaser.Geom.Rectangle.Contains);
      buttonBg.setDepth(153);

      // Level number (large and prominent)
      const levelText = this.add.text(x, y - 15, (level + 1).toString(), {
        fontSize: '40px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(154);

      // Level objective (smaller, below the number)
      const levelLabel = this.add.text(x, y + 25, this.levels[level].objective, {
        fontSize: '14px',
        color: '#101012',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: buttonWidth - 20 }
      }).setOrigin(0.5).setDepth(154);

      // Current level indicator (pulsing glow + checkmark)
      let glowEffect, checkmark;
      if (level + 1 === this.level) {
        // Pulsing white glow for current level
        glowEffect = this.add.graphics();
        glowEffect.lineStyle(6, 0xFFFFFF, 0.8);
        glowEffect.strokeRoundedRect(x - buttonWidth/2 - 5, y - buttonHeight/2 - 5, buttonWidth + 10, buttonHeight + 10, buttonHeight/2 + 5);
        glowEffect.setDepth(152);

        // Pulsing animation
        this.tweens.add({
          targets: glowEffect,
          alpha: 0.3,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Checkmark badge
        checkmark = this.add.text(x + buttonWidth/2 - 20, y - buttonHeight/2 + 20, '✓', {
          fontSize: '20px',
          color: '#FFFFFF',
          fontFamily: 'Fredoka One, cursive',
          fontStyle: 'bold',
          backgroundColor: '#00B378'
        }).setOrigin(0.5).setPadding(4).setDepth(155);
      }

      // Store references
      levelButtons.push(buttonBg);
      levelTexts.push(levelText);
      levelLabels.push(levelLabel);
      if (glowEffect) glowEffects.push(glowEffect);
      if (checkmark) checkmarks.push(checkmark);

      // Interactive effects
      buttonBg.on('pointerdown', () => {
        // Squish animation
        this.tweens.add({
          targets: [buttonBg, levelText, levelLabel],
          scaleY: 0.8,
          duration: 100,
          yoyo: true,
          ease: 'Power2',
          onComplete: () => {
            this.selectLevel(level + 1);
            this.closeLevelSelector();
          }
        });

        this.playSound('click');
      });

      // Hover effects (scale up)
      buttonBg.on('pointerover', () => {
        this.tweens.add({
          targets: [buttonBg, levelText, levelLabel],
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 150,
          ease: 'Back.easeOut'
        });

        this.playSound('click');
      });

      buttonBg.on('pointerout', () => {
        this.tweens.add({
          targets: [buttonBg, levelText, levelLabel],
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 150,
          ease: 'Back.easeOut'
        });
      });
    }

    // Redesigned close button (large red circle popping out)
    const closeBtnRadius = 25;
    const closeBtnX = modalX + modalWidth/2 - closeBtnRadius + 5;
    const closeBtnY = modalY - modalHeight/2 + closeBtnRadius - 5;

    const closeBtn = this.add.circle(closeBtnX, closeBtnY, closeBtnRadius, 0xE32528);
    closeBtn.setStrokeStyle(4, 0xFFFFFF);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setDepth(156);
    closeBtn.on('pointerdown', () => this.closeLevelSelector());

    const closeText = this.add.text(closeBtnX, closeBtnY, '×', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(157);

    // Pop entry animation for the entire modal
    const modalElements = [modalBg, innerGlow, titleText, shadow, closeBtn, closeText, ...levelButtons, ...levelTexts, ...levelLabels, ...glowEffects, ...checkmarks];

    modalElements.forEach(element => {
      element.setScale(0);
      element.setAlpha(0);
    });

    this.tweens.add({
      targets: modalElements,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Settle to normal scale
        this.tweens.add({
          targets: modalElements,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 200,
          ease: 'Back.easeOut'
        });
      }
    });

    // Store modal elements for cleanup
    this.levelSelectorModal = [
      overlay, shadow, modalBg, innerGlow, titleText,
      ...levelButtons, ...levelTexts, ...levelLabels,
      ...glowEffects, ...checkmarks,
      closeBtn, closeText
    ];
  }

  /**
   * Select a level and restart the game
   */
  selectLevel(levelNumber) {
    this.level = levelNumber;
    this.clearSelection();
    this.recreateCirclesForLevel();
    this.generateQuestion();
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
   * Create game-specific elements after UI is created
   */
  createGameElements() {
    const { width, height } = this.scale;

    // Create counting circles in center
    this.createCountingCircles();

    // Generate first question
    this.generateQuestion();
  }

  /**
   * Create the counting circles where players click (GCompris style)
   */
  createCountingCircles() {
    const { width, height } = this.scale;
    const circlesY = height / 2;

    // Container for circles
    this.circlesContainer = this.add.container(width / 2, circlesY);

    // Create circles based on current level
    this.circles = [];
    this.selectedCircles = [];

    const levelData = this.levels[this.level - 1];
    const numCircles = levelData.circlesModel;
    const circleRadius = 50; // Larger circles for better touch targets
    const spacing = 120;

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
    // Circle background (white with very thick border - GCompris "chunky" style)
    const circleBg = this.add.circle(x, y, radius, 0xFFFFFF);
    circleBg.setStrokeStyle(8, 0x000000); // Very thick 8px border for better visibility

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
   * Create control buttons
   */
  createControlButtons() {
    const { width, height } = this.scale;
    const buttonY = height - 80;

    // Clear button
    this.clearButton = this.createButton(width / 2 - 100, buttonY, 'Clear', () => this.clearSelection());

    // Check button
    this.checkButton = this.createButton(width / 2 + 100, buttonY, 'Check Answer', () => this.checkAnswer());
  }

  /**
   * Create a simple button
   */
  createButton(x, y, text, callback) {
    const buttonBg = this.add.rectangle(x, y, 120, 50, 0x0062FF);
    buttonBg.setStrokeStyle(2, 0xFFFFFF);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    // Make interactive
    buttonBg.setInteractive();
    buttonText.setInteractive();

    const handleClick = () => callback();

    buttonBg.on('pointerdown', handleClick);
    buttonText.on('pointerdown', handleClick);

    buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x0044AA));
    buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x0062FF));

    return { bg: buttonBg, text: buttonText };
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
      circle.bg.setFillStyle(0xFACA2A); // Yellow when selected
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
    }
  }

  /**
   * Update the visual display of selection
   */
  updateSelectionDisplay() {
    // Update instruction to show current selection
    const count = this.selectedCircles.length;
    const correctCount = this.currentAnswer;

    if (count === 0) {
      this.instructionText.setText('Click on the circles to show the answer!');
      this.okButton.setVisible(false);
      this.okButtonText.setVisible(false);
      // Stop pulsing if it was active
      this.tweens.killTweensOf([this.okButton, this.okButtonText]);
      this.okButton.setScale(1);
      this.okButtonText.setScale(1);
    } else if (count === correctCount) {
      this.instructionText.setText(`Perfect! You selected ${count} circles. Click OK to continue!`);
      this.okButton.setVisible(true);
      this.okButtonText.setVisible(true);
      // Start pulsing the OK button with glow effect
      this.tweens.add({
        targets: [this.okButton, this.okButtonText],
        scale: 1.3,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      // Add glow effect
      this.okButton.setStrokeStyle(12, 0xFFFFFF);
    } else {
      this.instructionText.setText(`You selected ${count} circle${count !== 1 ? 's' : ''}. Click OK when ready!`);
      this.okButton.setVisible(true);
      this.okButtonText.setVisible(true);
      // Stop pulsing and glow if it was active
      this.tweens.killTweensOf([this.okButton, this.okButtonText]);
      this.okButton.setScale(1);
      this.okButtonText.setScale(1);
      this.okButton.setStrokeStyle(8, 0xFFFFFF);
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
    this.feedbackText.setText('');

    this.playSound('click');
  }

  /**
   * Check the player's answer
   */
  checkAnswer() {
    const selectedCount = this.selectedCircles.length;

    if (selectedCount === this.currentAnswer) {
      // Correct answer!
      this.showFeedback('Excellent! 🎉', '#00B378');
      this.playSound('success');

      // Celebrate with animations
      this.celebrateCorrect();

      // Next question after delay
      this.time.delayedCall(2500, () => this.nextQuestion());
    } else {
      // Incorrect answer - encourage correction without clearing selection
      this.showFeedback(`Not quite! Try counting again - the answer needs ${this.currentAnswer} circles.`, '#FF6B6B');
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

      // Update instruction to encourage correction
      this.instructionText.setText(`You have ${selectedCount} circles. The answer needs ${this.currentAnswer}. Try again!`);
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

    // Create star particle burst
    for (let i = 0; i < 20; i++) {
      const star = this.add.star(this.circlesContainer.x, this.circlesContainer.y, 5, 8, 16, 0xFFD700);
      star.setScale(0.3);
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 150;

      this.tweens.add({
        targets: star,
        x: this.circlesContainer.x + Math.cos(angle) * speed,
        y: this.circlesContainer.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        rotation: Math.PI * 2,
        duration: 800,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }
  }

  /**
   * Show feedback text
   */
  showFeedback(text, color) {
    if (!this.feedbackText) {
      this.feedbackText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, '', {
        fontSize: '48px',
        color: color,
        fontFamily: 'Fredoka One, cursive',
        align: 'center',
        backgroundColor: '#FFFFFF',
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      }).setOrigin(0.5).setDepth(200);
      this.feedbackText.setStroke('#000000', 4);
    }

    this.feedbackText.setText(text);
    this.feedbackText.setColor(color);

    // "Pop" animation with Back.easeOut
    this.feedbackText.setScale(0);
    this.tweens.add({
      targets: this.feedbackText,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut'
    });

    // Clear after delay
    this.time.delayedCall(2000, () => {
      if (this.feedbackText) {
        this.tweens.add({
          targets: this.feedbackText,
          alpha: 0,
          scale: 0.8,
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            this.feedbackText.setText('');
            this.feedbackText.setAlpha(1);
            this.feedbackText.setScale(1);
          }
        });
      }
    });
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
    this.feedbackText.setText('');
  }

  /**
   * Generate a new question
   */
  generateQuestion() {
    // Ensure UI is initialized before proceeding
    if (!this.questionText || !this.levelText || !this.instructionText) {
      console.warn('LearnAdditionsGame: UI not fully initialized, delaying generateQuestion');
      this.time.delayedCall(100, () => this.generateQuestion());
      return;
    }

    const levelData = this.levels[this.level - 1];

    // Pick a random question from current level (avoid repeating current question)
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * levelData.questions.length);
    } while (levelData.questions[randomIndex] === this.currentQuestion && levelData.questions.length > 1);

    const question = levelData.questions[randomIndex];
    const answer = levelData.answers[randomIndex];

    this.currentQuestion = question;
    this.currentAnswer = answer;

    // Update display
    this.questionText.setText(question + ' = ?');

    // Update level display
    this.levelText.setText(`Level ${this.level}`);
    this.instructionText.setText(`${levelData.objective}\nClick on the circles to show the answer!`);
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
    // Call super.create() first to set up base functionality
    super.create();

    // Now create game-specific elements
    this.createGameElements();
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