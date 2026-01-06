/**
 * LearnQuantitiesGame - Quantity matching educational game
 * Drag oranges to represent requested quantities and learn number concepts
 * Based on GCompris learn_quantities activity
 */
import { DragDropGame } from './DragDropGame.js';

export class LearnQuantitiesGame extends DragDropGame {
  constructor(config) {
    super({
      category: 'math',
      difficulty: 1,
      ...config
    });

    // Game configuration
    this.targetQuantity = 0;
    this.currentQuantity = 0;
    this.orangesSelected = 0;
    this.level = 1;
    this.currentStreak = 0;
    this.score = 0;

    // Level configuration based on GCompris data
    this.levels = [
      {
        objective: "Learn quantities between 1 and 3",
        difficulty: 1,
        minValue: 1,
        maxValue: 3,
        sublevels: 3
      },
      {
        objective: "Learn quantities between 1 and 4",
        difficulty: 1,
        minValue: 1,
        maxValue: 4,
        sublevels: 4
      },
      {
        objective: "Learn quantities between 1 and 5",
        difficulty: 2,
        minValue: 1,
        maxValue: 5,
        sublevels: 5
      },
      {
        objective: "Learn quantities between 1 and 6",
        difficulty: 2,
        minValue: 1,
        maxValue: 6,
        sublevels: 6
      },
      {
        objective: "Learn quantities between 1 and 7",
        difficulty: 3,
        minValue: 1,
        maxValue: 7,
        sublevels: 7
      },
      {
        objective: "Learn quantities between 1 and 8",
        difficulty: 3,
        minValue: 1,
        maxValue: 8,
        sublevels: 8
      },
      {
        objective: "Learn quantities between 1 and 10",
        difficulty: 4,
        minValue: 1,
        maxValue: 10,
        sublevels: 10
      }
    ];
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load game assets
    this.load.svg('orange', 'assets/game-icons/orange.svg');
    this.load.svg('hillside_bg', 'assets/learn_quantities/hillside.svg');
    this.load.svg('arrow_selector', 'assets/game-icons/arrow_selector.svg');
    
    // Load navigation icons
    this.load.svg('home', 'assets/game-icons/bar_home.svg');
    this.load.svg('help', 'assets/game-icons/bar_help.svg');
    this.load.svg('bar_next', 'assets/game-icons/bar_next.svg');
    this.load.svg('bar_prev', 'assets/game-icons/bar_previous.svg');
    this.load.svg('config', 'assets/game-icons/bar_config.svg');
    this.load.svg('bar_hint', 'assets/game-icons/bar_hint.svg');
    this.load.svg('bar_ok', 'assets/game-icons/bar_ok.svg');
  }

  /**
   * Override: Create the background first so it is at the bottom
   */
  createBackground() {
    const { width, height } = this.scale;

    // GCompris hillside background (sky blue top, green hills bottom)
    this.background = this.add.image(width / 2, height / 2, 'hillside_bg');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);
  }

  /**
   * Override: Create UI elements
   */
  createUI() {
    const { width, height } = this.scale;

    // Instruction panel at top (GCompris style - dark rounded rectangle)
    const instructionPanelWidth = Math.min(500, width * 0.5);
    const instructionPanelBg = this.add.graphics();
    instructionPanelBg.fillStyle(0x333333, 0.95);
    instructionPanelBg.fillRoundedRect(width / 2 - instructionPanelWidth / 2, 15, instructionPanelWidth, 50, 10);
    instructionPanelBg.setDepth(9);

    this.instructionText = this.add.text(width / 2, 40, 'Represent the quantity: ?', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(10);

    // Create navigation dock
    this.createNavigationDock(width, height);

    // Sublevel progress indicator (0/3 format on left)
    const progressBg = this.add.rectangle(50, height - 150, 60, 40, 0xFFFFFF, 0.9);
    progressBg.setStrokeStyle(2, 0x333333);
    progressBg.setDepth(100);
    
    this.progressText = this.add.text(50, height - 150, '0/3', {
      fontSize: '20px',
      color: '#333333',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(101);
  }

  /**
   * Override DragDropGame methods to prevent conflicts
   */
  startNextObjective() {
    // LearnQuantitiesGame handles its own game flow
  }

  onObjectiveStart(objective) {
    // LearnQuantitiesGame handles its own game flow
  }

  createDragDropElements() {
    // LearnQuantitiesGame creates its own drag-drop elements
  }

  /**
   * Create game-specific elements after UI is created
   */
  createGameElements() {
    const { width, height } = this.scale;

    // Create the basket (large white rounded rectangle in center)
    this.createBasket();

    // Create the horizontal orange selector (bottom)
    this.createHorizontalSelector();

    // OK button and Hint button (circular, on the right)
    this.createOKButton();
  }

  /**
   * Create the basket (large white rounded rectangle in center)
   */
  createBasket() {
    const { width, height } = this.scale;
    const basketWidth = Math.min(700, width * 0.7);
    const basketHeight = Math.min(200, height * 0.28);
    const basketX = width / 2;
    const basketY = height * 0.35;

    // Basket background (white with gray border - GCompris style)
    this.basketBg = this.add.graphics();
    this.basketBg.fillStyle(0xFAFAFA, 1);
    this.basketBg.fillRoundedRect(basketX - basketWidth/2, basketY - basketHeight/2, basketWidth, basketHeight, 10);
    this.basketBg.lineStyle(3, 0x888888, 1);
    this.basketBg.strokeRoundedRect(basketX - basketWidth/2, basketY - basketHeight/2, basketWidth, basketHeight, 10);
    this.basketBg.setDepth(5);

    // Store basket bounds for drop detection
    this.basketBounds = {
      x: basketX - basketWidth/2,
      y: basketY - basketHeight/2,
      width: basketWidth,
      height: basketHeight
    };

    // Container for dropped oranges
    this.droppedOranges = [];
  }

  /**
   * Create the horizontal orange selector (GCompris style)
   */
  createHorizontalSelector() {
    const { width, height } = this.scale;
    const selectorY = height * 0.62;
    const selectorWidth = Math.min(700, width * 0.7);
    const selectorX = width / 2;

    // Selector background (white with gray border - GCompris style)
    this.selectorBg = this.add.graphics();
    this.selectorBg.fillStyle(0xFAFAFA, 1);
    this.selectorBg.fillRoundedRect(selectorX - selectorWidth/2, selectorY - 30, selectorWidth, 60, 10);
    this.selectorBg.lineStyle(3, 0x888888, 1);
    this.selectorBg.strokeRoundedRect(selectorX - selectorWidth/2, selectorY - 30, selectorWidth, 60, 10);
    this.selectorBg.setDepth(4);

    // Display 10 small oranges in a row (GCompris style - outlined when empty, filled when selected)
    this.selectorOranges = [];
    const orangeSpacing = selectorWidth / 11; // Space for 10 oranges + margins

    for (let i = 0; i < 10; i++) {
      const orangeX = selectorX - selectorWidth/2 + 30 + (i * orangeSpacing);
      
      // Create orange circle (empty outline style initially)
      const orangeCircle = this.add.circle(orangeX, selectorY, 15, 0xFFFFFF);
      orangeCircle.setStrokeStyle(3, 0xF08A00); // Orange outline
      orangeCircle.setDepth(5);
      orangeCircle.index = i;
      orangeCircle.filled = false;

      // Make oranges clickable
      orangeCircle.setInteractive({ useHandCursor: true });
      orangeCircle.on('pointerdown', () => {
        if (orangeCircle.filled) {
          this.createDraggableOrangeFromSelector(i);
        }
      });

      this.selectorOranges.push(orangeCircle);
    }

    // Triangle selector (draggable) - GCompris style orange triangle pointing up
    const triangleX = selectorX - selectorWidth/2 + 30;
    const triangleY = selectorY + 40;
    
    this.selectorTriangle = this.add.graphics();
    this.selectorTriangle.fillStyle(0xF08A00, 1); // Orange
    this.selectorTriangle.beginPath();
    this.selectorTriangle.moveTo(0, -20); // Top point
    this.selectorTriangle.lineTo(15, 15); // Bottom right
    this.selectorTriangle.lineTo(-15, 15); // Bottom left
    this.selectorTriangle.closePath();
    this.selectorTriangle.fillPath();
    this.selectorTriangle.lineStyle(2, 0xFFFFFF, 1);
    this.selectorTriangle.strokePath();
    this.selectorTriangle.setPosition(triangleX, triangleY);
    this.selectorTriangle.setDepth(6);
    
    // Make triangle draggable with hit area
    this.selectorTriangle.setInteractive(
      new Phaser.Geom.Circle(0, 0, 25),
      Phaser.Geom.Circle.Contains
    );
    this.input.setDraggable(this.selectorTriangle);

    // Store selector bounds for reference
    this.selectorBounds = {
      minX: selectorX - selectorWidth/2 + 30,
      maxX: selectorX + selectorWidth/2 - 30,
      y: selectorY,
      width: selectorWidth
    };

    // Setup triangle dragging
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === this.selectorTriangle) {
        // Constrain triangle movement horizontally
        const constrainedX = Phaser.Math.Clamp(dragX, this.selectorBounds.minX, this.selectorBounds.maxX);
        gameObject.x = constrainedX;

        // Calculate selected oranges based on triangle position
        const progress = (constrainedX - this.selectorBounds.minX) / (this.selectorBounds.maxX - this.selectorBounds.minX);
        const selected = Math.round(progress * 10);
        this.setSelectedOranges(selected);
      }
    });

    // Selection count display removed - GCompris doesn't show it
  }

  /**
   * Create a draggable orange from the selector
   */
  createDraggableOrangeFromSelector(index) {
    const circle = this.selectorOranges[index];
    if (!circle || !circle.filled) {
      return null; // Only allow dragging filled oranges
    }

    // Create a copy for dragging (orange circle)
    const dragOrange = this.add.circle(circle.x, circle.y, 18, 0xF08A00);
    dragOrange.setStrokeStyle(2, 0xFFFFFF);
    dragOrange.setInteractive({ draggable: true });
    dragOrange.setDepth(20);

    // Setup orange dragging
    this.input.on('dragstart', (pointer, gameObject) => {
      if (gameObject === dragOrange) {
        gameObject.setFillStyle(0xD07800); // Darker when dragging
      }
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === dragOrange) {
        gameObject.x = dragX;
        gameObject.y = dragY;
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      if (gameObject === dragOrange) {
        gameObject.setFillStyle(0xF08A00);
        this.checkOrangeDrop(gameObject);
      }
    });

    return dragOrange;
  }

  /**
   * Create OK button and Hint button (GCompris style - bottom right)
   */
  createOKButton() {
    const { width, height } = this.scale;
    const buttonY = height - 150;
    
    // Hint button (orange circle with lightbulb)
    const hintX = width - 150;
    this.hintButton = this.add.circle(hintX, buttonY, 40, 0xF08A00);
    this.hintButton.setStrokeStyle(4, 0xFFFFFF);
    this.hintButton.setInteractive({ useHandCursor: true });
    this.hintButton.setDepth(150);
    
    // Hint icon (lightbulb symbol)
    this.hintIcon = this.add.text(hintX, buttonY, '💡', {
      fontSize: '32px'
    }).setOrigin(0.5).setDepth(151);
    
    this.hintButton.on('pointerdown', () => this.showHint());
    
    // OK button (green circle with OK text)
    const okX = width - 60;
    this.okButton = this.add.circle(okX, buttonY, 40, 0x44AA44);
    this.okButton.setStrokeStyle(4, 0xFFFFFF);
    this.okButton.setInteractive({ useHandCursor: true });
    this.okButton.setDepth(150);

    // OK text
    this.okButtonText = this.add.text(okX, buttonY, 'OK', {
      fontSize: '22px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(151);

    // Click handler
    this.okButton.on('pointerdown', () => this.checkAnswer());

    // Hover effects
    this.okButton.on('pointerover', () => {
      this.okButton.setFillStyle(0x338833);
    });
    this.okButton.on('pointerout', () => {
      this.okButton.setFillStyle(0x44AA44);
    });
  }
  
  /**
   * Show hint for current question
   */
  showHint() {
    // Flash the target quantity
    this.tweens.add({
      targets: this.instructionText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
    this.playSound('click');
  }

  /**
   * Create a simple button
   */
  createButton(x, y, text, callback) {
    const buttonBg = this.add.rectangle(x, y, 80, 50, 0x0062FF);
    buttonBg.setStrokeStyle(2, 0xFFFFFF);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '20px',
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
   * Set selected oranges count
   */
  setSelectedOranges(count) {
    this.orangesSelected = Phaser.Math.Clamp(count, 0, 10);

    // Update selector oranges (fill with orange color based on selection)
    this.selectorOranges.forEach((circle, index) => {
      if (index < this.orangesSelected) {
        circle.setFillStyle(0xF08A00); // Filled orange
        circle.filled = true;
      } else {
        circle.setFillStyle(0xFFFFFF); // White/empty
        circle.filled = false;
      }
    });
  }

  /**
   * Adjust oranges by delta
   */
  adjustOranges(delta) {
    this.setSelectedOranges(this.orangesSelected + delta);
  }

  /**
   * Check if an orange was dropped in the basket
   */
  checkOrangeDrop(orange) {
    const bounds = this.basketBounds;
    if (orange.x >= bounds.x && orange.x <= bounds.x + bounds.width &&
        orange.y >= bounds.y && orange.y <= bounds.y + bounds.height) {
      // Orange dropped in basket - add to dropped oranges
      this.addDroppedOrange(orange);
    } else {
      // Orange dropped outside - return to selector
      this.returnOrangeToSelector(orange);
    }
  }

  /**
   * Add an orange to the dropped collection
   */
  addDroppedOrange(orange) {
    // Play pop sound
    this.playSound('pop');

    // Hide the original orange
    orange.setVisible(false);

    // Create a new orange in the basket with random position
    const basket = this.basketBounds;
    const orangeX = basket.x + 50 + Math.random() * (basket.width - 100);
    const orangeY = basket.y + 50 + Math.random() * (basket.height - 100);

    const droppedOrange = this.add.image(orangeX, orangeY, 'orange');
    droppedOrange.setDisplaySize(50, 50);
    droppedOrange.setDepth(10); // Updated depth for strict depth management

    // Add bounce animation
    this.tweens.add({
      targets: droppedOrange,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    this.droppedOranges.push(droppedOrange);
    this.currentQuantity++;

    this.updateQuantityDisplay();

    // Make OK button fully visible and interactive when oranges are added
    if (this.currentQuantity > 0) {
      this.okButton.setAlpha(1);
      this.okButtonText.setAlpha(1);
      this.okButton.setInteractive(true);
    }

    // Check if correct quantity reached - show feedback automatically
    if (this.currentQuantity === this.targetQuantity) {
      this.showCorrectQuantityFeedback();
      // Automatically show correct feedback after a short delay
      this.time.delayedCall(1500, () => {
        this.checkAnswer();
      });
    }
  }

  /**
   * Show feedback when correct quantity is reached (before OK click)
   */
  showCorrectQuantityFeedback() {
    // Pulse the OK button
    this.tweens.add({
      targets: [this.okButton, this.okButtonText],
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add glow effect to basket border
    if (!this.basketGlow) {
      this.basketGlow = this.add.graphics();
      this.basketGlow.lineStyle(6, 0x00FF00, 0.8); // Green glow
      this.basketGlow.strokeRoundedRect(
        this.basketBounds.x - 3,
        this.basketBounds.y - 3,
        this.basketBounds.width + 6,
        this.basketBounds.height + 6,
        20
      );
      this.basketGlow.setDepth(4);
    }

    // Pulse the glow
    this.tweens.add({
      targets: this.basketGlow,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Return orange to selector area (fade it out)
   */
  returnOrangeToSelector(orange) {
    // Fade out the dragged orange since it wasn't dropped in basket
    this.tweens.add({
      targets: orange,
      alpha: 0,
      scale: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => orange.destroy()
    });
  }

  /**
   * Update quantity display (updates instruction text to show current count)
   */
  updateQuantityDisplay() {
    // No separate display - instruction panel shows target
  }

  /**
   * Check player's answer
   */
  checkAnswer() {
    if (this.currentQuantity === this.targetQuantity) {
      // Update streak and score
      this.currentStreak++;
      this.score += 10 * this.currentStreak;

      // Stop pulsing animations
      this.tweens.killTweensOf([this.okButton, this.okButtonText]);
      this.okButton.setScale(1);
      this.okButtonText.setScale(1);

      if (this.basketGlow) {
        this.tweens.killTweensOf(this.basketGlow);
        this.basketGlow.destroy();
        this.basketGlow = null;
      }

      // Change basket label to "Perfect!" in bright green
      if (this.basketLabel) {
        this.basketLabel.setText('Perfect!');
        this.basketLabel.setColor('#00FF00');
        this.tweens.add({
          targets: this.basketLabel,
          scale: 1.2,
          duration: 300,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      }

      // Correct! - larger text with pulsing
      this.showFeedback('Correct!', '#00B378');
      this.playSound('success');

      // Celebrate with animation
      this.celebrateCorrect();

      // Next question after delay
      this.time.delayedCall(2000, () => this.nextQuestion());
    } else {
      // Reset streak on incorrect answer
      this.currentStreak = 0;

      // Stop pulsing animations for incorrect answers
      this.tweens.killTweensOf([this.okButton, this.okButtonText]);
      this.okButton.setScale(1);
      this.okButtonText.setScale(1);

      if (this.basketGlow) {
        this.tweens.killTweensOf(this.basketGlow);
        this.basketGlow.destroy();
        this.basketGlow = null;
      }

      // Incorrect
      this.showFeedback(`Try again! You have ${this.currentQuantity} oranges but need ${this.targetQuantity}`, '#FF6B6B');
      this.playSound('error');

      // Shake the drop zone
      this.tweens.add({
        targets: this.dropZone,
        x: '+=10',
        duration: 50,
        yoyo: true,
        repeat: 5,
        ease: 'Power2'
      });
    }
  }

  /**
   * Celebrate correct answer
   */
  celebrateCorrect() {
    const basketCenterX = this.basketBounds.x + this.basketBounds.width / 2;
    const basketCenterY = this.basketBounds.y + this.basketBounds.height / 2;

    // Create particle burst of small orange circles
    for (let i = 0; i < 25; i++) {
      const particle = this.add.image(basketCenterX, basketCenterY, 'orange');
      particle.setDisplaySize(8, 8);
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 250;

      this.tweens.add({
        targets: particle,
        x: basketCenterX + Math.cos(angle) * speed,
        y: basketCenterY + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    // Scale up dropped oranges
    this.droppedOranges.forEach(orange => {
      this.tweens.add({
        targets: orange,
        scale: 1.3,
        duration: 300,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    });

    // Shake the basket slightly
    this.tweens.add({
      targets: [this.basketBg, this.basketShadow],
      x: '+=5',
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power2'
    });
  }

  /**
   * Show feedback text
   */
  showFeedback(text, color) {
    if (!this.feedbackText) {
      this.feedbackText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
        fontSize: text === 'Correct!' ? '96px' : '64px',
        color: color,
        fontFamily: 'Fredoka One, cursive',
        align: 'center',
        backgroundColor: '#FFFFFF',
        padding: { left: 30, right: 30, top: 15, bottom: 15 }
      }).setOrigin(0.5).setDepth(200);
      this.feedbackText.setStroke('#000000', 4);
    }

    this.feedbackText.setText(text);
    this.feedbackText.setColor(color);
    this.feedbackText.setFontSize(text === 'Correct!' ? '96px' : '64px');

    // "Pop" animation with Back.easeOut
    this.feedbackText.setScale(0);
    this.tweens.add({
      targets: this.feedbackText,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut'
    });

    // Add pulsing animation for "Correct!"
    if (text === 'Correct!') {
      this.tweens.add({
        targets: this.feedbackText,
        scale: 1.5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Clear after 3 seconds with fade out
    this.time.delayedCall(2500, () => {
      if (this.feedbackText) {
        this.tweens.killTweensOf(this.feedbackText);
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
    // Stop any pulsing animations
    this.tweens.killTweensOf([this.okButton, this.okButtonText]);
    this.okButton.setScale(1);
    this.okButtonText.setScale(1);

    if (this.basketGlow) {
      this.tweens.killTweensOf(this.basketGlow);
      this.basketGlow.destroy();
      this.basketGlow = null;
    }

    // Reset basket label
    if (this.basketLabel) {
      this.basketLabel.setText('Basket');
      this.basketLabel.setColor('#00B378');
      this.basketLabel.setScale(1);
    }

    // Clear current state
    this.clearDroppedOranges();
    this.setSelectedOranges(0);

    // Generate new target
    this.generateTargetQuantity();

    // Update instruction
    this.instructionText.setText('Drag oranges to match this number!');

    // Keep OK button visible but dimmed and non-interactive until oranges are added
    this.okButton.setVisible(true);
    this.okButtonText.setVisible(true);
    this.okButton.setAlpha(0.5); // Dimmed appearance
    this.okButtonText.setAlpha(0.5);
    this.okButton.disableInteractive(); // Disable until oranges are added

    // Clear feedback
    if (this.feedbackText) {
      this.feedbackText.setText('');
    }
  }

  /**
   * Clear all dropped oranges
   */
  clearDroppedOranges() {
    this.droppedOranges.forEach(orange => orange.destroy());
    this.droppedOranges = [];
    this.currentQuantity = 0;
    this.updateQuantityDisplay();
  }

  /**
   * Generate target quantity for current level
   */
  generateTargetQuantity() {
    const currentLevelData = this.levels[this.level - 1];
    this.targetQuantity = Phaser.Math.Between(currentLevelData.minValue, currentLevelData.maxValue);
    this.instructionText.setText(`Represent the quantity: ${this.targetQuantity}`);
  }

  /**
   * Start the game
   */
  create() {
    // Call super.create() first to set up base functionality
    super.create();

    // Now create game-specific elements
    this.createGameElements();

    // Generate first question
    this.generateTargetQuantity();
  }

  /**
   * Start current level
   */
  startLevel() {
    const currentLevelData = this.levels[this.level - 1];
    if (this.instructionText) {
      this.instructionText.setText(`Represent the quantity: ${currentLevelData.objective}`);
    }

    // Update progress indicator
    const currentSublevel = 1; // This would need to be tracked properly
    if (this.progressText) {
      this.progressText.setText(`${currentSublevel}/${currentLevelData.sublevels}`);
    }
  }

  /**
   * Show level up overlay with dark transparent background
   */
  showLevelUpOverlay(callback) {
    const { width, height } = this.scale;

    // Dark transparent overlay
    this.levelUpOverlay = this.add.graphics();
    this.levelUpOverlay.fillStyle(0x000000, 0.7);
    this.levelUpOverlay.fillRect(0, 0, width, height);
    this.levelUpOverlay.setDepth(190);

    // Golden star
    this.levelUpStar = this.add.star(width / 2, height / 2 - 50, 5, 50, 100, 0xFFD700);
    this.levelUpStar.setDepth(200);
    this.levelUpStar.setScale(0);

    // Level up text
    this.levelUpText = this.add.text(width / 2, height / 2 + 50, 'Level Up!', {
      fontSize: '80px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);
    this.levelUpText.setScale(0);

    // Animate in with Back.easeOut
    this.tweens.add({
      targets: [this.levelUpStar, this.levelUpText],
      scale: 1,
      duration: 800,
      ease: 'Back.easeOut'
    });

    // Fade out after 2 seconds
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [this.levelUpOverlay, this.levelUpStar, this.levelUpText],
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.levelUpOverlay.destroy();
          this.levelUpStar.destroy();
          this.levelUpText.destroy();
          if (callback) callback();
        }
      });
    });
  }

  /**
   * Advance to next level
   */
  advanceLevel() {
    if (this.level < this.levels.length) {
      this.level++;
      this.showLevelUpOverlay(() => {
        this.startLevel();
      });
    } else {
      this.showFeedback('All levels completed!', '#00B378');
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
    const helpText = this.add.text(width / 2, height / 2, '🍊 Orange Quantity Game Help! 🍊\n\n' +
      '• Use the triangle slider to select how many oranges you want\n' +
      '• Click on the filled oranges to drag them into the basket\n' +
      '• Fill the basket with exactly the right number of oranges\n' +
      '• Click OK when you think you have the correct amount\n\n' +
      'Practice counting and quantity representation!', {
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
        `Current Level: ${this.level} of ${this.levels.length}`,
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
    // Close any open modals
    this.closeHelpModal();
    this.scene.start('GameMenu');
  }

  /**
   * Clean up when game ends
   */
  shutdown() {
    super.shutdown();
  }
}