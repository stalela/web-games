/**
 * LearnSubtractionsGame - Visual subtraction learning game
 * Interactive subtraction problems with clickable circles to represent the difference
 * Based on GCompris learn_subtractions activity (uses learn_digits with operationMode)
 */
import { LalelaGame } from '../utils/LalelaGame.js';

export class LearnSubtractionsGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'LearnSubtractionsGame',
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
    this.questionsPerLevel = 3;
    this.lastQuestionIndex = -1;

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

    // Load GCompris hillside background (nature theme)
    this.load.svg('hillside_bg', 'assets/learn_quantities/hillside.svg');

    // Load navigation icons
    const icons = ['help', 'home', 'exit', 'settings'];
    icons.forEach(icon => {
      this.load.svg(icon, `assets/category-icons/${icon}.svg`);
    });
  }

  /**
   * Override: Create background - GCompris hillside nature theme
   */
  createBackground() {
    const { width, height } = this.scale;

    // Hillside background (sky gradient + green hills)
    this.background = this.add.image(width / 2, height / 2, 'hillside_bg');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);
  }

  /**
   * Override: Create UI elements - GCompris style
   */
  createUI() {
    const { width, height } = this.scale;

    // Question text (large orange, top-left area) - GCompris style without "= ?"
    this.questionText = this.add.text(width * 0.35, 120, '2 - 1', {
      fontSize: '96px',
      color: '#d2611d',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(10);
    this.questionText.setStroke('#FFFFFF', 8);

    // OK button (green circle, right of question) - always visible in GCompris
    const okX = width * 0.55;
    const okY = 120;
    this.okButton = this.add.circle(okX, okY, 50, 0x00B378);
    this.okButton.setStrokeStyle(4, 0xFFFFFF);
    this.okButton.setInteractive({ useHandCursor: true });
    this.okButton.setDepth(15);

    this.okButtonText = this.add.text(okX, okY, 'OK', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(16);

    this.okButton.on('pointerdown', () => this.checkAnswer());

    // Progress badge (cloud-like, top-right) - GCompris style
    this.createProgressBadge(width, height);

    // Circles area (white rounded rectangle, bottom half)
    this.createCirclesArea();

    // Navigation bar (GCompris style - left-aligned circular buttons)
    this.createGComprisNavBar(width, height);

    // Feedback text (center, initially hidden)
    this.feedbackText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      color: '#00B378',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);
    this.feedbackText.setStroke('#FFFFFF', 6);
    this.feedbackText.setVisible(false);
  }

  /**
   * Create progress badge - GCompris cloud style
   */
  createProgressBadge(width, height) {
    // Cloud-like background
    const cloudGraphics = this.add.graphics();
    cloudGraphics.fillStyle(0xFFFFFF, 0.9);
    
    // Draw cloud shape
    const cloudX = width - 120;
    const cloudY = 80;
    cloudGraphics.fillCircle(cloudX - 30, cloudY, 35);
    cloudGraphics.fillCircle(cloudX + 30, cloudY, 35);
    cloudGraphics.fillCircle(cloudX, cloudY - 15, 40);
    cloudGraphics.fillCircle(cloudX, cloudY + 15, 35);
    cloudGraphics.setDepth(10);

    this.progressText = this.add.text(cloudX, cloudY, '0/3', {
      fontSize: '28px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(11);
  }

  /**
   * Create GCompris-style navigation bar (bottom-left circular buttons)
   */
  createGComprisNavBar(width, height) {
    const navY = height - 60;
    const buttonRadius = 35;
    const startX = 60;
    const spacing = 90;

    // Left pill background for nav buttons
    const pillWidth = 500;
    const pillHeight = 80;
    const navBg = this.add.graphics();
    navBg.fillStyle(0xD2B48C, 0.7); // Tan/beige color like GCompris
    navBg.fillRoundedRect(10, navY - pillHeight/2, pillWidth, pillHeight, 40);
    navBg.setDepth(99);

    const controls = [
      { icon: '≡', action: 'config', color: 0x8B7355, textColor: '#FFFFFF' },
      { icon: '?', action: 'help', color: 0x4FC3F7, textColor: '#FFFFFF' },
      { icon: '⌂', action: 'home', color: 0xF08A00, textColor: '#FFFFFF' },
      { icon: '◀', action: 'prev', color: 0xF08A00, textColor: '#FFFFFF' },
      { text: '1', action: 'level', color: null, textColor: '#FFFFFF' },
      { icon: '▶', action: 'next', color: 0xF08A00, textColor: '#FFFFFF' },
      { icon: '☰', action: 'menu', color: 0x9C6ADE, textColor: '#FFFFFF' }
    ];

    controls.forEach((control, index) => {
      const x = startX + index * spacing;

      if (control.color) {
        // Circular button
        const button = this.add.circle(x, navY, buttonRadius, control.color);
        button.setStrokeStyle(3, 0xFFFFFF);
        button.setInteractive({ useHandCursor: true });
        button.setDepth(100);

        // Icon
        const iconText = this.add.text(x, navY, control.icon || control.text, {
          fontSize: '28px',
          color: control.textColor,
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          align: 'center'
        }).setOrigin(0.5).setDepth(101);

        button.on('pointerdown', () => this.onNavAction(control.action));
      } else {
        // Level number (no background circle)
        this.levelText = this.add.text(x, navY, control.text, {
          fontSize: '32px',
          color: '#FFFFFF',
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          align: 'center'
        }).setOrigin(0.5).setDepth(101);
        this.levelText.setStroke('#000000', 2);
      }
    });
  }

  /**
   * Handle navigation actions
   */
  onNavAction(action) {
    switch (action) {
      case 'help':
        this.showHelpModal();
        break;
      case 'home':
      case 'menu':
        this.scene.start('GameMenu');
        break;
      case 'prev':
        if (this.level > 1) {
          this.level--;
          this.recreateCirclesForLevel();
          this.generateQuestion();
          this.updateLevelDisplay();
        }
        break;
      case 'next':
        if (this.level < this.levels.length) {
          this.level++;
          this.recreateCirclesForLevel();
          this.generateQuestion();
          this.updateLevelDisplay();
        }
        break;
      case 'config':
        this.showLevelSelector();
        break;
    }
  }

  /**
   * Update level display in nav bar
   */
  updateLevelDisplay() {
    if (this.levelText) {
      this.levelText.setText(this.level.toString());
    }
  }

  /**
   * Show help modal
   */
  showHelpModal() {
    const { width, height } = this.scale;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.setDepth(300);

    // Modal
    const modalWidth = 500;
    const modalHeight = 300;
    const modal = this.add.graphics();
    modal.fillStyle(0xFFFFFF, 1);
    modal.fillRoundedRect(width/2 - modalWidth/2, height/2 - modalHeight/2, modalWidth, modalHeight, 20);
    modal.lineStyle(4, 0x00B378, 1);
    modal.strokeRoundedRect(width/2 - modalWidth/2, height/2 - modalHeight/2, modalWidth, modalHeight, 20);
    modal.setDepth(301);

    // Title
    const title = this.add.text(width / 2, height / 2 - 100, 'How to Play', {
      fontSize: '32px',
      color: '#00B378',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(302);

    // Instructions
    const instructions = this.add.text(width / 2, height / 2, 
      'Click on the circles to show\nthe answer to the subtraction.\n\nClick OK when ready!', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
      align: 'center'
    }).setOrigin(0.5).setDepth(302);

    // Close button
    const closeBtn = this.add.circle(width/2 + modalWidth/2 - 30, height/2 - modalHeight/2 + 30, 20, 0xFF6B6B);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setDepth(303);
    
    const closeX = this.add.text(width/2 + modalWidth/2 - 30, height/2 - modalHeight/2 + 30, '×', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setDepth(304);

    const closeModal = () => {
      overlay.destroy();
      modal.destroy();
      title.destroy();
      instructions.destroy();
      closeBtn.destroy();
      closeX.destroy();
    };

    overlay.on('pointerdown', closeModal);
    closeBtn.on('pointerdown', closeModal);
  }

  /**
   * Show level selector modal
   */
  showLevelSelector() {
    const { width, height } = this.scale;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.setDepth(300);

    // Modal
    const modalWidth = 600;
    const modalHeight = 200;
    const modal = this.add.graphics();
    modal.fillStyle(0xFFFFFF, 1);
    modal.fillRoundedRect(width/2 - modalWidth/2, height/2 - modalHeight/2, modalWidth, modalHeight, 20);
    modal.setDepth(301);

    // Title
    const title = this.add.text(width / 2, height / 2 - 60, 'Select Level', {
      fontSize: '28px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(302);

    // Level buttons
    const levelButtons = [];
    const btnWidth = 80;
    const btnSpacing = 20;
    const totalBtnWidth = this.levels.length * btnWidth + (this.levels.length - 1) * btnSpacing;
    const startBtnX = width / 2 - totalBtnWidth / 2 + btnWidth / 2;

    this.levels.forEach((_, index) => {
      const btnX = startBtnX + index * (btnWidth + btnSpacing);
      const btn = this.add.circle(btnX, height / 2 + 20, 35, index < this.level ? 0x00B378 : 0xCCCCCC);
      btn.setStrokeStyle(3, 0xFFFFFF);
      btn.setInteractive({ useHandCursor: true });
      btn.setDepth(302);

      const btnText = this.add.text(btnX, height / 2 + 20, (index + 1).toString(), {
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(303);

      btn.on('pointerdown', () => {
        this.level = index + 1;
        closeModal();
        this.recreateCirclesForLevel();
        this.generateQuestion();
        this.updateLevelDisplay();
      });

      levelButtons.push(btn, btnText);
    });

    const closeModal = () => {
      overlay.destroy();
      modal.destroy();
      title.destroy();
      levelButtons.forEach(el => el.destroy());
    };

    overlay.on('pointerdown', closeModal);
  }

  /**
   * Create the circles area - GCompris style (white panel with outlined circles)
   */
  createCirclesArea() {
    const { width, height } = this.scale;
    
    // White rounded rectangle background for circles (GCompris style)
    const panelWidth = Math.min(width - 80, 800);
    const panelHeight = 200;
    const panelY = height * 0.55;
    
    this.circlesPanelBg = this.add.graphics();
    this.circlesPanelBg.fillStyle(0xFFFFFF, 0.85);
    this.circlesPanelBg.fillRoundedRect(
      width / 2 - panelWidth / 2, 
      panelY - panelHeight / 2, 
      panelWidth, 
      panelHeight, 
      15
    );
    this.circlesPanelBg.setDepth(5);

    // Create circles
    this.circles = [];
    this.selectedCircles = [];

    const levelData = this.levels[this.level - 1];
    const numCircles = levelData.circlesModel;
    const circleRadius = Math.min(60, (panelWidth - 100) / (numCircles * 2.5));
    const spacing = circleRadius * 2.5;

    const totalWidth = (numCircles - 1) * spacing;
    const startX = width / 2 - totalWidth / 2;

    for (let i = 0; i < numCircles; i++) {
      const x = startX + (i * spacing);
      const circle = this.createClickableCircle(x, panelY, circleRadius, i);
      this.circles.push(circle);
    }
  }

  /**
   * Create a clickable circle - GCompris style (outlined, fills with orange when clicked)
   */
  createClickableCircle(x, y, radius, index) {
    // Circle - outlined style (transparent with dark border)
    const circleGraphics = this.add.graphics();
    circleGraphics.lineStyle(4, 0x333333, 1);
    circleGraphics.strokeCircle(x, y, radius);
    circleGraphics.setDepth(6);

    // Fill graphics (separate for animation)
    const fillGraphics = this.add.graphics();
    fillGraphics.setDepth(5);

    // Interactive zone
    const hitArea = this.add.circle(x, y, radius, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.setDepth(7);

    hitArea.on('pointerdown', () => this.onCircleClick(index));

    return { 
      outline: circleGraphics, 
      fill: fillGraphics, 
      hitArea: hitArea,
      x: x, 
      y: y, 
      radius: radius,
      selected: false 
    };
  }

  /**
   * Handle circle click - GCompris toggle behavior
   */
  onCircleClick(circleIndex) {
    const circle = this.circles[circleIndex];

    if (circle.selected) {
      this.deselectCircle(circleIndex);
    } else {
      this.selectCircle(circleIndex);
    }
  }

  /**
   * Select a circle - fill with orange (GCompris color: #d2611d)
   */
  selectCircle(circleIndex) {
    const circle = this.circles[circleIndex];

    if (!circle.selected) {
      circle.selected = true;
      
      // Fill with orange
      circle.fill.clear();
      circle.fill.fillStyle(0xd2611d, 1);
      circle.fill.fillCircle(circle.x, circle.y, circle.radius - 2);

      this.selectedCircles.push(circleIndex);

      // Play click sound
      this.playSound('click');
    }
  }

  /**
   * Deselect a circle - remove fill
   */
  deselectCircle(circleIndex) {
    const circle = this.circles[circleIndex];

    if (circle.selected) {
      circle.selected = false;
      
      // Clear fill
      circle.fill.clear();

      const idx = this.selectedCircles.indexOf(circleIndex);
      if (idx > -1) {
        this.selectedCircles.splice(idx, 1);
      }

      this.playSound('click');
    }
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.circles.forEach((circle, index) => {
      if (circle.selected) {
        circle.selected = false;
        circle.fill.clear();
      }
    });
    this.selectedCircles = [];
  }

  /**
   * Check the player's answer
   */
  checkAnswer() {
    const selectedCount = this.selectedCircles.length;

    if (selectedCount === this.currentAnswer) {
      // Correct!
      this.playSound('success');
      this.currentStreak++;
      this.updateProgressDisplay();
      this.showSuccessFeedback();

      // Celebrate
      this.celebrateCorrect();

      // Next question after delay
      this.time.delayedCall(1500, () => {
        if (this.currentStreak >= this.questionsPerLevel) {
          // Level complete
          if (this.level < this.levels.length) {
            this.level++;
            this.currentStreak = 0;
            this.recreateCirclesForLevel();
            this.updateLevelDisplay();
          } else {
            this.showFeedback('All levels complete! 🎉', '#00B378');
          }
        }
        this.nextQuestion();
      });
    } else {
      // Wrong
      this.playSound('error');
      this.showErrorFeedback();

      // Shake animation
      this.circles.forEach(circle => {
        this.tweens.add({
          targets: circle.hitArea,
          x: circle.x + 10,
          duration: 50,
          yoyo: true,
          repeat: 3,
          ease: 'Power2'
        });
      });
    }
  }

  /**
   * Show success feedback
   */
  showSuccessFeedback() {
    this.feedbackText.setText('✓');
    this.feedbackText.setColor('#00B378');
    this.feedbackText.setVisible(true);
    this.feedbackText.setScale(0);

    this.tweens.add({
      targets: this.feedbackText,
      scale: 2,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(800, () => {
          this.feedbackText.setVisible(false);
        });
      }
    });
  }

  /**
   * Show error feedback
   */
  showErrorFeedback() {
    this.feedbackText.setText('✗');
    this.feedbackText.setColor('#FF6B6B');
    this.feedbackText.setVisible(true);

    this.tweens.add({
      targets: this.feedbackText,
      scale: 1.5,
      duration: 200,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(500, () => {
          this.feedbackText.setVisible(false);
          this.feedbackText.setScale(1);
        });
      }
    });
  }

  /**
   * Celebrate correct answer
   */
  celebrateCorrect() {
    // Scale up selected circles
    this.selectedCircles.forEach(idx => {
      const circle = this.circles[idx];
      this.tweens.add({
        targets: circle.hitArea,
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    });
  }

  /**
   * Show feedback message
   */
  showFeedback(message, color) {
    this.feedbackText.setText(message);
    this.feedbackText.setColor(color);
    this.feedbackText.setVisible(true);
    this.feedbackText.setScale(0);

    this.tweens.add({
      targets: this.feedbackText,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Update progress display
   */
  updateProgressDisplay() {
    if (this.progressText) {
      this.progressText.setText(`${this.currentStreak}/${this.questionsPerLevel}`);
    }
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    this.clearSelection();
    this.generateQuestion();
  }

  /**
   * Generate a new question
   */
  generateQuestion() {
    const levelData = this.levels[this.level - 1];

    // Pick random question, avoid repeats
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * levelData.questions.length);
    } while (randomIndex === this.lastQuestionIndex && levelData.questions.length > 1);

    this.lastQuestionIndex = randomIndex;
    this.currentQuestion = levelData.questions[randomIndex];
    this.currentAnswer = levelData.answers[randomIndex];

    // Update display - GCompris shows without "= ?"
    this.questionText.setText(this.currentQuestion);
    this.updateProgressDisplay();
  }

  /**
   * Recreate circles for new level
   */
  recreateCirclesForLevel() {
    // Destroy existing circles
    if (this.circles) {
      this.circles.forEach(circle => {
        circle.outline.destroy();
        circle.fill.destroy();
        circle.hitArea.destroy();
      });
    }
    if (this.circlesPanelBg) {
      this.circlesPanelBg.destroy();
    }

    this.createCirclesArea();
  }

  /**
   * Setup game logic - called after UI is created
   */
  setupGameLogic() {
    this.currentStreak = 0;
    this.generateQuestion();
    this.updateLevelDisplay();
  }

  /**
   * Play sound effect
   */
  playSound(soundName) {
    if (this.audioManager) {
      try {
        this.audioManager.playSound(soundName);
      } catch (e) {
        console.log(`Sound: ${soundName}`);
      }
    }
  }

  /**
   * Update method
   */
  update(time, delta) {
    // Game logic updates if needed
  }

  /**
   * Clean up
   */
  shutdown() {
    if (this.circles) {
      this.circles.forEach(circle => {
        if (circle.outline) circle.outline.destroy();
        if (circle.fill) circle.fill.destroy();
        if (circle.hitArea) circle.hitArea.destroy();
      });
    }
    super.shutdown();
  }
}