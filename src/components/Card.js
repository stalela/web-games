/**
 * Card - Interactive card component for memory and matching games
 * Provides flip animations, state management, and customizable appearance
 */
export class Card extends Phaser.GameObjects.Container {
  constructor(scene, config) {
    super(scene, config.x || 0, config.y || 0);

    this.config = {
      width: 80,
      height: 80,
      frontColor: 0xffffff,
      backColor: 0x3498db,
      borderColor: 0x2c3e50,
      borderWidth: 2,
      cornerRadius: 8,
      value: null,
      content: null, // Can be text, image, or custom display
      flipDuration: 300,
      scaleOnHover: 1.05,
      ...config
    };

    this.value = this.config.value;
    this.content = this.config.content;
    this.isFlipped = false;
    this.isMatched = false;
    this.isAnimating = false;

    this.createCardElements();
    this.setupInteractivity();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create the visual elements of the card
   */
  createCardElements() {
    const { width, height, frontColor, backColor, borderColor, borderWidth, cornerRadius } = this.config;

    // Back side of the card (Egyptian style) - Sticker look
      this.backSide = this.scene.add.rectangle(0, 0, width, height, backColor, 1);
      this.backSide.setStrokeStyle(borderWidth + 3, 0xFFFFFF); // Thick white border for sticker look

      // Add drop shadow (offset darker rectangle)
      this.backShadow = this.scene.add.rectangle(3, 3, width, height, 0x000000, 0.3);
      this.add(this.backShadow); // Add shadow first (behind)

      // Add white circle with Lalela "L" in center (60% of card height)
      const circleRadius = Math.min(width, height) * 0.3;
      this.backCircle = this.scene.add.circle(0, 0, circleRadius, 0xFFFFFF, 1);
      this.backCircle.setStrokeStyle(3, 0x0062FF);

      // Add "L" text in the circle (larger)
      this.backText = this.scene.add.text(0, 0, 'L', {
        fontSize: circleRadius * 1.5 + 'px',
        color: '#0062FF',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold'
      }).setOrigin(0.5);

    // Front side of the card (initially hidden) - sticker look with glow
    this.frontSide = this.scene.add.rectangle(0, 0, width, height, frontColor, 1);
    this.frontSide.setStrokeStyle(borderWidth + 4, borderColor); // Very thick border
    this.frontSide.setVisible(false);

    // Add glow effect (semi-transparent larger rectangle)
    this.frontGlow = this.scene.add.rectangle(0, 0, width + 8, height + 8, 0xFACA2A, 0.2);
    this.frontGlow.setVisible(false);

    // Content display (initially hidden)
    this.createContent();

    // Add elements to container (shadow first, then others)
    this.add([this.backShadow, this.backSide, this.frontSide, this.frontGlow]);

    // Add back side decoration
    if (this.backCircle) {
      this.add(this.backCircle);
    }
    if (this.backText) {
      this.add(this.backText);
    }

    if (this.contentDisplay) {
      this.add(this.contentDisplay);
    }
  }

  /**
   * Create rounded rectangle using Graphics (for future use if needed)
   */
  createRoundedRect(x, y, width, height, radius, color) {
    const graphics = this.scene.add.graphics();

    graphics.fillStyle(color, 1);
    graphics.lineStyle(this.config.borderWidth, this.config.borderColor, 1);

    // Draw rounded rectangle
    graphics.beginPath();
    graphics.moveTo(x + radius, y);
    graphics.lineTo(x + width - radius, y);
    graphics.arc(x + width - radius, y + radius, radius, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(360));
    graphics.lineTo(x + width, y + height - radius);
    graphics.arc(x + width - radius, y + height - radius, radius, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(90));
    graphics.lineTo(x + radius, y + height);
    graphics.arc(x + radius, y + height - radius, radius, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(180));
    graphics.lineTo(x, y + radius);
    graphics.arc(x + radius, y + radius, radius, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(270));
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    return graphics;
  }

  /**
   * Create the content display (text, image, etc.)
   */
  createContent() {
    if (!this.content) return;

    const { width, height } = this.config;

    if (typeof this.content === 'string' || typeof this.content === 'number') {
      // Text content
      this.contentDisplay = this.scene.add.text(0, 0, this.content.toString(), {
        fontSize: '24px',
        color: '#2c3e50',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);

    } else if (this.content.texture) {
      // Image/Sprite content (including SVG)
      if (this.scene.textures.exists(this.content.texture)) {
        this.contentDisplay = this.scene.add.sprite(0, 0, this.content.texture);
        if (this.content.scale) {
          this.contentDisplay.setScale(this.content.scale);
        }
      } else {
        // Texture doesn't exist, show a big yellow question mark
        console.warn(`Texture ${this.content.texture} not found, using question mark`);
        this.contentDisplay = this.scene.add.text(0, 0, '?', {
          fontSize: '64px', // Bigger for visibility
          color: '#FACA2A', // Yellow for missing content
          fontFamily: 'Fredoka One, cursive',
          fontStyle: 'bold',
          align: 'center'
        }).setOrigin(0.5);
      }

    } else if (this.content.type === 'shape') {
      // Custom shape
      this.contentDisplay = this.createShape(this.content);

    } else {
      // Default text fallback
      this.contentDisplay = this.scene.add.text(0, 0, this.value?.toString() || '?', {
        fontSize: '24px',
        color: '#2c3e50',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);
    }

    if (this.contentDisplay) {
      this.contentDisplay.setVisible(false);
    }
  }

  /**
   * Create custom shape content
   */
  createShape(shapeConfig) {
    const graphics = this.scene.add.graphics();

    switch (shapeConfig.shape) {
      case 'circle':
        graphics.fillStyle(shapeConfig.color || 0xff0000, 1);
        graphics.fillCircle(0, 0, shapeConfig.radius || 20);
        break;

      case 'triangle':
        graphics.fillStyle(shapeConfig.color || 0x00ff00, 1);
        graphics.beginPath();
        graphics.moveTo(0, -20);
        graphics.lineTo(-17, 10);
        graphics.lineTo(17, 10);
        graphics.closePath();
        graphics.fillPath();
        break;

      case 'square':
        graphics.fillStyle(shapeConfig.color || 0x0000ff, 1);
        graphics.fillRect(-15, -15, 30, 30);
        break;

      default:
        // Default circle
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(0, 0, 20);
    }

    return graphics;
  }

  /**
   * Set up interactivity
   */
  setupInteractivity() {
    // Make the card interactive
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.config.width/2,
        -this.config.height/2,
        this.config.width,
        this.config.height
      ),
      Phaser.Geom.Rectangle.Contains
    );

    // Add event listeners
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
  }

  /**
   * Handle pointer down
   */
  onPointerDown() {
    if (this.isAnimating || this.isMatched) return;

    // Emit custom event for game logic
    this.emit('cardClicked', this);
  }

  /**
   * Handle pointer over (hover effect)
   */
  onPointerOver() {
    if (this.isAnimating || this.isMatched) return;

    const scale = this.config.scaleOnHover;
    this.scene.tweens.add({
      targets: this,
      scaleX: scale,
      scaleY: scale,
      duration: 150,
      ease: 'Power2'
    });
  }

  /**
   * Handle pointer out (remove hover effect)
   */
  onPointerOut() {
    if (this.isAnimating || this.isMatched) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Power2'
    });
  }

  /**
   * Flip the card with animation
   */
  flip(showFront = null) {
    if (this.isAnimating) return;

    const targetState = showFront !== null ? showFront : !this.isFlipped;
    if (targetState === this.isFlipped) return;

    this.isAnimating = true;
    const duration = this.config.flipDuration;

    // Flip animation with spring/bounce effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: duration / 2,
      ease: 'Back.easeIn', // Spring effect when disappearing
      onComplete: () => {
        // Switch card state
        this.setFlippedState(targetState);

        // Flip back with bounce effect
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.1, // More pronounced overshoot
          duration: duration / 2,
          ease: 'Back.easeOut', // Spring effect when appearing
          onComplete: () => {
            // Settle back to normal size with small bounce
            this.scene.tweens.add({
              targets: this,
              scaleX: 1,
              duration: 150,
              ease: 'Bounce.easeOut', // Bouncy settling
              onComplete: () => {
                this.isAnimating = false;
                this.emit('flipComplete', this, targetState);
              }
            });
          }
        });
      }
    });
  }

  /**
   * Set the flipped state without animation
   */
  setFlippedState(isFlipped) {
    this.isFlipped = isFlipped;
    this.backSide.setVisible(!isFlipped);
    this.backShadow.setVisible(!isFlipped);
    this.frontSide.setVisible(isFlipped);
    this.frontGlow.setVisible(isFlipped);

    if (this.contentDisplay) {
      this.contentDisplay.setVisible(isFlipped);
    }

    // Hide back decorations when flipped
    if (this.backCircle) {
      this.backCircle.setVisible(!isFlipped);
    }
    if (this.backText) {
      this.backText.setVisible(!isFlipped);
    }
  }

  /**
   * Mark card as matched
   */
  setMatched(isMatched = true) {
    this.isMatched = isMatched;

    if (isMatched) {
      // Visual feedback for matched cards
      this.frontSide.setStrokeStyle(3, 0x27ae60); // Green border

      // Celebration animation
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });

      // Disable interactivity
      this.disableInteractive();
    }
  }

  /**
   * Shake animation for incorrect matches
   */
  shake() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    this.scene.tweens.add({
      targets: this,
      x: this.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 5,
      ease: 'Power2',
      onComplete: () => {
        this.isAnimating = false;
      }
    });
  }

  /**
   * Pulse animation
   */
  pulse() {
    if (this.isAnimating) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      ease: 'Power2'
    });
  }

  /**
   * Update card configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    // Update visual elements if needed
    if (newConfig.width || newConfig.height) {
      this.updateSize();
    }

    if (newConfig.frontColor !== undefined) {
      this.frontSide.setFillStyle(newConfig.frontColor);
    }

    if (newConfig.backColor !== undefined) {
      this.backSide.setFillStyle(newConfig.backColor);
    }

    if (newConfig.content !== undefined) {
      this.content = newConfig.content;
      if (this.contentDisplay) {
        this.contentDisplay.destroy();
      }
      this.createContent();
      if (this.contentDisplay) {
        this.add(this.contentDisplay);
        this.contentDisplay.setVisible(this.isFlipped);
      }
    }

    if (newConfig.value !== undefined) {
      this.value = newConfig.value;
    }
  }

  /**
   * Update card size
   */
  updateSize() {
    const { width, height } = this.config;

    // Update back side
    this.backSide.setSize(width, height);

    // Update front side
    this.frontSide.setSize(width, height);

    // Update hit area
    this.input.hitArea.setSize(width, height);
    this.input.hitArea.setPosition(-width/2, -height/2);
  }

  /**
   * Reset card to initial state
   */
  reset() {
    this.isFlipped = false;
    this.isMatched = false;
    this.isAnimating = false;
    this.setScale(1);

    // Reset visual state
    this.backSide.setVisible(true);
    this.frontSide.setVisible(false);
    this.frontSide.setStrokeStyle(this.config.borderWidth, this.config.borderColor);

    if (this.contentDisplay) {
      this.contentDisplay.setVisible(false);
    }

    // Re-enable interactivity
    this.setInteractive();
  }

  /**
   * Destroy the card and clean up
   */
  destroy() {
    // Clean up tweens
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.killTweensOf(this);
    }

    // Remove event listeners
    this.off('pointerdown');
    this.off('pointerover');
    this.off('pointerout');
    this.off('cardClicked');
    this.off('flipComplete');

    // Call parent destroy
    super.destroy();
  }
}