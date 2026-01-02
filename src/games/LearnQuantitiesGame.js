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
    this.load.svg('learn_quantities_bg', 'assets/game-icons/learn_quantities_bg.svg');
    this.load.svg('arrow_selector', 'assets/game-icons/arrow_selector.svg');
  }

  /**
   * Override: Create the background first so it is at the bottom
   */
  createBackground() {
    const { width, height } = this.scale;

    // Background image with proper depth - ensure sky/grass theme
    this.background = this.add.image(width / 2, height / 2, 'learn_quantities_bg');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);
  }

  /**
   * Override: Create UI elements
   */
  createUI() {
    const { width, height } = this.scale;

    // Title
    this.titleText = this.add.text(width / 2, 50, 'Learn Quantities', {
      fontSize: '32px',
      color: '#0062FF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(10);

    // Level display
    this.levelText = this.add.text(width - 50, 50, 'Level 1', {
      fontSize: '24px',
      color: '#101012',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(1, 0).setDepth(10);

    // Instruction panel (GCompris style - dark grey rounded rectangle at top)
    const instructionPanelBg = this.add.graphics();
    instructionPanelBg.fillStyle(0x000000, 0.7);
    instructionPanelBg.fillRoundedRect(width / 2 - 250, 90, 500, 80, 20);
    instructionPanelBg.setDepth(9);

    this.instructionText = this.add.text(width / 2, 130, 'Represent the quantity: ?', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(10);

    // Create navigation dock
    this.createNavigationDock(width, height);

    // Sublevel progress indicator (0/3 format on left) - in navigation dock area
    this.progressText = this.add.text(80, height - 80, '0/3', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0, 0.5).setDepth(110); // Above navigation dock
    this.progressText.setStroke('#000000', 3);
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

    // Target quantity display (large, prominent in basket)
    this.targetText = this.add.text(width / 2, height / 2 - 50, '?', {
      fontSize: '72px',
      color: '#FACA2A',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      backgroundColor: '#FFFFFF',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setDepth(5);
    this.targetText.setStroke('#000000', 4);

    // Create the basket (large white rounded rectangle in center)
    this.createBasket();

    // Create the horizontal orange selector (bottom)
    this.createHorizontalSelector();

    // OK button (circular, green, on the right)
    this.createOKButton();

    // Current quantity display
    this.currentQuantityText = this.add.text(width / 2, height - 120, 'Oranges: 0', {
      fontSize: '28px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(15);
  }

  /**
   * Create the basket (large white rounded rectangle in center)
   */
  createBasket() {
    const { width, height } = this.scale;
    const basketWidth = 500;
    const basketHeight = 350;
    const basketX = width / 2;
    // Center basket perfectly in the middle of the screen
    const basketY = height / 2;

    // Basket background (white with thick border - sticker style)
    this.basketBg = this.add.graphics();
    this.basketBg.fillStyle(0xFFFFFF, 1);
    this.basketBg.fillRoundedRect(basketX - basketWidth/2, basketY - basketHeight/2, basketWidth, basketHeight, 20);
    this.basketBg.lineStyle(5, 0x101012, 1);
    this.basketBg.strokeRoundedRect(basketX - basketWidth/2, basketY - basketHeight/2, basketWidth, basketHeight, 20);
    this.basketBg.setDepth(5);

    // Basket drop shadow
    this.basketShadow = this.add.graphics();
    this.basketShadow.fillStyle(0x000000, 0.2);
    this.basketShadow.fillRoundedRect(basketX - basketWidth/2 + 3, basketY - basketHeight/2 + 3, basketWidth, basketHeight, 20);
    this.basketShadow.setDepth(4);

    // Basket label
    this.basketLabel = this.add.text(basketX, basketY - basketHeight/2 - 25, 'Basket', {
      fontSize: '24px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(5);

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
    const selectorY = height - 220;
    const selectorWidth = 500;
    const selectorX = width / 2;

    // Selector background (sticker style)
    this.selectorBg = this.add.graphics();
    this.selectorBg.fillStyle(0xFFFFFF, 0.9);
    this.selectorBg.fillRoundedRect(selectorX - selectorWidth/2, selectorY - 30, selectorWidth, 60, 15);
    this.selectorBg.lineStyle(4, 0x0062FF, 1);
    this.selectorBg.strokeRoundedRect(selectorX - selectorWidth/2, selectorY - 30, selectorWidth, 60, 15);
    this.selectorBg.setDepth(4);

    // Display 10 small faded oranges in a row
    this.selectorOranges = [];
    const orangeSpacing = selectorWidth / 11; // Space for 10 oranges + margins

    for (let i = 0; i < 10; i++) {
      const orangeX = selectorX - selectorWidth/2 + 30 + (i * orangeSpacing);
      const orange = this.add.image(orangeX, selectorY, 'orange');
      orange.setDisplaySize(25, 25);
      orange.setTint(0xCCCCCC); // Start faded
      orange.setInteractive({ useHandCursor: true });
      orange.setDepth(5);

      // Make oranges clickable to drag
      orange.on('pointerdown', () => {
        if (orange.tintTopLeft !== 0xCCCCCC) { // Only if filled
          this.createDraggableOrangeFromSelector(i);
        }
      });

      this.selectorOranges.push(orange);
    }

    // Triangle selector (draggable) - Much larger for visibility
    this.selectorTriangle = this.add.image(selectorX - selectorWidth/2 + 30, selectorY + 40, 'arrow_selector');
    this.selectorTriangle.setDisplaySize(60, 60);
    this.selectorTriangle.setTint(0xFACA2A); // Lalela Yellow
    this.selectorTriangle.setInteractive({ draggable: true, hitArea: new Phaser.Geom.Circle(30, 30, 30), hitAreaCallback: Phaser.Geom.Circle.Contains });
    this.selectorTriangle.setDepth(6);

    // Add white border to selector triangle
    this.selectorTriangleBorder = this.add.graphics();
    this.selectorTriangleBorder.lineStyle(4, 0xFFFFFF, 1);
    this.selectorTriangleBorder.strokeCircle(this.selectorTriangle.x, this.selectorTriangle.y, 30);
    this.selectorTriangleBorder.setDepth(7);

    // Add drop shadow
    this.selectorTriangleShadow = this.add.graphics();
    this.selectorTriangleShadow.fillStyle(0x000000, 0.3);
    this.selectorTriangleShadow.fillCircle(this.selectorTriangle.x + 2, this.selectorTriangle.y + 2, 30);
    this.selectorTriangleShadow.setDepth(5);

    // Selection indicator line
    this.selectionLine = this.add.graphics();
    this.selectionLine.lineStyle(3, 0xFF6B6B, 1);
    this.selectionLine.moveTo(selectorX - selectorWidth/2 + 30, selectorY - 35);
    this.selectionLine.lineTo(selectorX - selectorWidth/2 + 30, selectorY + 35);
    this.selectionLine.setDepth(5);

    // Setup triangle dragging
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === this.selectorTriangle) {
        // Constrain triangle movement horizontally
        const constrainedX = Phaser.Math.Clamp(dragX, selectorX - selectorWidth/2 + 30, selectorX + selectorWidth/2 - 30);
        gameObject.x = constrainedX;

        // Update border position
        this.selectorTriangleBorder.x = constrainedX;
        this.selectorTriangleBorder.y = gameObject.y;

        // Update shadow position
        this.selectorTriangleShadow.x = constrainedX + 2;
        this.selectorTriangleShadow.y = gameObject.y + 2;

        // Update selection line position
        this.selectionLine.clear();
        this.selectionLine.lineStyle(3, 0xFF6B6B, 1);
        this.selectionLine.moveTo(constrainedX, selectorY - 35);
        this.selectionLine.lineTo(constrainedX, selectorY + 35);

        // Calculate selected oranges based on triangle position
        const progress = (constrainedX - (selectorX - selectorWidth/2 + 30)) / (selectorWidth - 60);
        const selected = Math.round(progress * 10);
        this.setSelectedOranges(selected);
      }
    });

    // Selection count display
    this.selectedOrangesText = this.add.text(selectorX, selectorY - 50, '0', {
      fontSize: '32px',
      color: '#FF6B6B',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(5);
  }

  /**
   * Create a draggable orange from the selector
   */
  createDraggableOrangeFromSelector(index) {
    const orange = this.selectorOranges[index];
    if (!orange || orange.tintTopLeft !== 0xFFFFFF) {
      return null; // Only allow dragging filled oranges
    }

    // Create a copy for dragging
    const dragOrange = this.add.image(orange.x, orange.y, 'orange');
    dragOrange.setDisplaySize(30, 30);
    dragOrange.setInteractive({ draggable: true });
    dragOrange.setDepth(20);

    // Setup orange dragging
    this.input.on('dragstart', (pointer, gameObject) => {
      if (gameObject === dragOrange) {
        gameObject.setTint(0xAAAAAA);
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
        gameObject.clearTint();
        this.checkOrangeDrop(gameObject);
      }
    });

    return dragOrange;
  }

  /**
   * Create OK button (circular, green, on the right)
   */
  createOKButton() {
    const { width, height } = this.scale;
    // Position OK button clearly on the right side, above the basket
    const buttonX = width - 150;
    const buttonY = height / 2 - 100; // Position above the basket center

    // Larger circular OK button (green with white border)
    this.okButton = this.add.circle(buttonX, buttonY, 60, 0x00B378);
    this.okButton.setStrokeStyle(6, 0xFFFFFF);
    this.okButton.setInteractive({ useHandCursor: true });
    this.okButton.setDepth(150); // Above all game elements
    this.okButton.setVisible(false); // Initially hidden

    // OK text
    this.okButtonText = this.add.text(buttonX, buttonY, 'OK', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(151);
    this.okButtonText.setVisible(false); // Initially hidden

    // Click handler
    this.okButton.on('pointerdown', () => this.checkAnswer());

    // Hover effects
    this.okButton.on('pointerover', () => {
      this.okButton.setFillStyle(0x008844);
    });
    this.okButton.on('pointerout', () => {
      this.okButton.setFillStyle(0x00B378);
    });
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
    this.selectedOrangesText.setText(this.orangesSelected.toString());

    // Update selector oranges (fill with color based on selection)
    this.selectorOranges.forEach((orange, index) => {
      if (index < this.orangesSelected) {
        orange.clearTint(); // Full color
      } else {
        orange.setTint(0xCCCCCC); // Faded
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
   * Update quantity display
   */
  updateQuantityDisplay() {
    this.currentQuantityText.setText(`Oranges: ${this.currentQuantity}`);
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
    this.targetText.setText(this.targetQuantity.toString());
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
    this.levelText.setText(`Level ${this.level}`);
    this.instructionText.setText(`${currentLevelData.objective}`);

    // Update progress indicator
    const currentSublevel = 1; // This would need to be tracked properly
    this.progressText.setText(`${currentSublevel}/${currentLevelData.sublevels}`);
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