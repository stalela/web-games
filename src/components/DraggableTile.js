/**
 * DraggableTile - Interactive tile component for drag and drop games
 * Represents a draggable number, letter, or object in educational games
 */
export class DraggableTile extends Phaser.GameObjects.Container {
  constructor(scene, config) {
    super(scene, config.x, config.y);

    this.config = config;
    this.value = config.value;
    this.originalPosition = { x: config.x, y: config.y };
    this.isDragging = false;
    this.isPlaced = false;
    this.isInteractive = true;

    // Create visual elements
    this.createVisualElements();

    // Enable input
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-config.size/2, -config.size/2, config.size, config.size),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      draggable: true
    });

    // Add input event listeners
    this.setupInputEvents();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create the visual elements of the tile
   */
  createVisualElements() {
    const size = this.config.size || 60;
    const color = this.config.color || 0xFFFFFF; // White background (GCompris style)
    const borderRadius = size * 0.1; // Rounded corners

    // Main background rectangle (white, rounded - GCompris style)
    this.background = this.scene.add.rectangle(0, 0, size, size, color, 1);
    this.background.setStrokeStyle(this.config.borderWidth || 3, this.config.borderColor || 0xCCCCCC, 1);

    // Subtle shadow effect (GCompris style)
    this.shadow = this.scene.add.rectangle(1, 1, size, size, 0x000000, 0.1);
    this.shadow.setStrokeStyle(2, 0x000000, 0.1);

    // Text content (dark text for white background - GCompris style)
    this.text = this.scene.add.text(0, 0, this.config.text || this.value.toString(), {
      fontSize: this.config.fontSize || 24,
      color: '#2c3e50',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add elements to container
    this.add([this.shadow, this.background, this.text]);

    // Set depth for proper layering
    this.setDepth(10);
  }

  /**
   * Setup input event handlers
   */
  setupInputEvents() {
    // Pointer events
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', this.onPointerUp, this);
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);

    // Drag events
    this.on('dragstart', this.onDragStart, this);
    this.on('drag', this.onDrag, this);
    this.on('dragend', this.onDragEnd, this);
  }

  /**
   * Handle pointer down
   */
  onPointerDown(pointer, localX, localY, event) {
    // Prevent event bubbling if needed
    if (this.config.onPointerDown) {
      this.config.onPointerDown(pointer, this);
    }

    // Visual feedback
    this.setScale(0.95);
  }

  /**
   * Handle pointer up
   */
  onPointerUp(pointer, localX, localY, event) {
    // Reset scale
    this.setScale(1);

    if (this.config.onPointerUp) {
      this.config.onPointerUp(pointer, this);
    }
  }

  /**
   * Handle pointer over
   */
  onPointerOver(pointer, localX, localY, event) {
    if (!this.isDragging && this.isInteractive) {
      // Hover effect
      this.setScale(1.05);

      // Color change
      this.background.setFillStyle(this.adjustColorBrightness(this.config.color, 20));

      if (this.config.onPointerOver) {
        this.config.onPointerOver(pointer, this);
      }
    }
  }

  /**
   * Handle pointer out
   */
  onPointerOut(pointer, event) {
    if (!this.isDragging) {
      // Reset hover effect
      this.setScale(1);
      this.background.setFillStyle(this.config.color);

      if (this.config.onPointerOut) {
        this.config.onPointerOut(pointer, this);
      }
    }
  }

  /**
   * Handle drag start
   */
  onDragStart(pointer, dragX, dragY) {
    if (!this.isInteractive) return;

    this.isDragging = true;
    this.setDepth(100); // Bring to front

    // Disable hover effects during drag
    this.setScale(1.1);
    this.background.setFillStyle(this.adjustColorBrightness(this.config.color, 30));

    // Shadow effect for dragging
    this.shadow.setVisible(true);
    this.shadow.setPosition(4, 4);

    if (this.config.onDragStart) {
      this.config.onDragStart(pointer, this);
    }

    // Play drag sound
    if (this.scene.game.audioManager) {
      this.scene.game.audioManager.playSound('click');
    }
  }

  /**
   * Handle drag
   */
  onDrag(pointer, dragX, dragY) {
    if (!this.isDragging) return;

    // Update position
    this.x = dragX;
    this.y = dragY;

    if (this.config.onDrag) {
      this.config.onDrag(pointer, this);
    }
  }

  /**
   * Handle drag end
   */
  onDragEnd(pointer, dragX, dragY, dropped) {
    this.isDragging = false;
    this.setDepth(10); // Return to normal depth

    // Reset visual effects
    this.setScale(1);
    this.background.setFillStyle(this.config.color);
    this.shadow.setPosition(2, 2);

    if (this.config.onDragEnd) {
      this.config.onDragEnd(pointer, this, dropped);
    }
  }

  /**
   * Set dragging state (for programmatic control)
   */
  setDragging(isDragging) {
    this.isDragging = isDragging;

    if (isDragging) {
      this.setDepth(100);
      this.setScale(1.1);
      this.shadow.setPosition(4, 4);
    } else {
      this.setDepth(10);
      this.setScale(1);
      this.shadow.setPosition(2, 2);
    }
  }

  /**
   * Set placed state (when successfully dropped)
   */
  setPlaced(isPlaced, targetZone = null) {
    this.isPlaced = isPlaced;

    if (isPlaced) {
      // Visual feedback for successful placement
      this.background.setStrokeStyle(3, 0x27ae60, 1); // Green border
      this.isInteractive = false; // Disable further interaction

      // Success animation
      this.scene.tweens.add({
        targets: this,
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          if (targetZone) {
            // Snap to zone center if specified
            this.snapToZone(targetZone);
          }
        }
      });

    } else {
      // Reset placement state
      this.background.setStrokeStyle(3, this.adjustColorBrightness(this.config.color, -30), 1);
      this.isInteractive = true;
    }
  }

  /**
   * Snap to a drop zone position
   */
  snapToZone(zone) {
    this.scene.tweens.add({
      targets: this,
      x: zone.x,
      y: zone.y,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Return to original position
   */
  returnToOriginalPosition() {
    this.scene.tweens.add({
      targets: this,
      x: this.originalPosition.x,
      y: this.originalPosition.y,
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Update tile content
   */
  setContent(value, text = null) {
    this.value = value;
    this.text.setText(text || value.toString());
  }

  /**
   * Update tile appearance
   */
  setAppearance(config) {
    if (config.color !== undefined) {
      this.config.color = config.color;
      this.background.setFillStyle(config.color);
      this.background.setStrokeStyle(3, this.adjustColorBrightness(config.color, -30), 1);
    }

    if (config.size !== undefined) {
      const size = config.size;
      this.background.setSize(size, size);
      this.shadow.setSize(size, size);
      this.config.size = size;
    }

    if (config.fontSize !== undefined) {
      this.text.setFontSize(config.fontSize);
    }
  }

  /**
   * Enable/disable interaction
   */
  setInteractiveState(interactive) {
    this.isInteractive = interactive;

    if (interactive) {
      this.setAlpha(1);
    } else {
      this.setAlpha(0.6);
    }
  }

  /**
   * Show/hide tile with animation
   */
  setVisibleWithAnimation(visible, duration = 300) {
    const targetAlpha = visible ? 1 : 0;

    this.scene.tweens.add({
      targets: this,
      alpha: targetAlpha,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        this.setVisible(visible);
      }
    });
  }

  /**
   * Pulse animation for hints
   */
  pulse() {
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
      ease: 'Power2'
    });
  }

  /**
   * Shake animation for invalid actions
   */
  shake() {
    this.scene.tweens.add({
      targets: this,
      x: this.x + 10,
      duration: 100,
      yoyo: true,
      repeat: 3,
      ease: 'Power2',
      onComplete: () => {
        this.x = this.originalPosition.x; // Reset position
      }
    });
  }

  /**
   * Get tile bounds for collision detection
   */
  getBounds() {
    const size = this.config.size || 60;
    return new Phaser.Geom.Rectangle(
      this.x - size/2,
      this.y - size/2,
      size,
      size
    );
  }

  /**
   * Check if point is inside tile
   */
  containsPoint(x, y) {
    return this.getBounds().contains(x, y);
  }

  /**
   * Adjust color brightness
   */
  adjustColorBrightness(color, amount) {
    const usePound = color.toString(16).length === 6;
    const col = usePound ? color : color;

    const r = ((col >> 16) + amount).clamp(0, 255);
    const g = (((col >> 8) & 0x00FF) + amount).clamp(0, 255);
    const b = ((col & 0x0000FF) + amount).clamp(0, 255);

    return (r << 16) | (g << 8) | b;
  }

  /**
   * Get tile data for serialization
   */
  getData() {
    return {
      value: this.value,
      position: { x: this.x, y: this.y },
      originalPosition: this.originalPosition,
      isPlaced: this.isPlaced,
      isDragging: this.isDragging,
      config: this.config
    };
  }

  /**
   * Set tile data from saved state
   */
  setData(data) {
    this.value = data.value;
    this.x = data.position.x;
    this.y = data.position.y;
    this.originalPosition = data.originalPosition;
    this.isPlaced = data.isPlaced;
    this.isDragging = data.isDragging;

    if (data.config) {
      this.setAppearance(data.config);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listeners
    this.off('pointerdown');
    this.off('pointerup');
    this.off('pointerover');
    this.off('pointerout');
    this.off('dragstart');
    this.off('drag');
    this.off('dragend');

    // Destroy child objects
    if (this.background) this.background.destroy();
    if (this.shadow) this.shadow.destroy();
    if (this.text) this.text.destroy();

    // Call parent destroy
    super.destroy();
  }
}

// Add clamp method to Number prototype if not available
if (!Number.prototype.clamp) {
  Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
  };
}