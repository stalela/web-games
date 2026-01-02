/**
 * DropZone - Target area for drag and drop interactions
 * Validates dropped tiles and provides visual feedback
 */
export class DropZone extends Phaser.GameObjects.Container {
  constructor(scene, config) {
    super(scene, config.x, config.y);

    this.config = config;
    this.expectedValue = config.expectedValue;
    this.acceptedValues = config.acceptedValues || [this.expectedValue];
    this.currentTile = null;
    this.isHighlighted = false;
    this.isOccupied = false;

    // GCompris-style states
    this.tileState = 'NONE'; // NONE, ANSWERED, RIGHT, WRONG

    // Create visual elements
    this.createVisualElements();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create the visual elements of the drop zone
   */
  createVisualElements() {
    const width = this.config.width || 80;
    const height = this.config.height || 80;
    const color = this.config.color || 0xFFFFFF; // White background (GCompris style)
    const borderRadius = height * 0.1; // Rounded corners

    // Main background rectangle (white, rounded - GCompris style)
    this.background = this.scene.add.rectangle(0, 0, width, height, color, 1.0);
    this.background.setStrokeStyle(this.config.borderWidth || 3, this.config.borderColor || 0xCCCCCC, 1);

    // Highlight overlay (for snapping feedback)
    this.highlightOverlay = this.scene.add.rectangle(0, 0, width, height, 0xffeb3b, 0.3);
    this.highlightOverlay.setVisible(false);

    // Label text (if provided) - centered in tile
    if (this.config.label) {
      this.label = this.scene.add.text(0, 0, this.config.label, {
        fontSize: Math.min(width, height) * 0.4,
        color: '#2c3e50',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Expected value display (for debugging - hidden in production)
    if (this.expectedValue !== undefined && this.expectedValue !== null && this.config.showDebug) {
      this.valueText = this.scene.add.text(0, height/2 + 10, this.expectedValue.toString(), {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }

    // Add elements to container
    const elements = [this.background, this.highlightOverlay];
    if (this.label) elements.push(this.label);
    if (this.valueText) elements.push(this.valueText);

    this.add(elements);

    // Set depth for proper layering
    this.setDepth(5);

    // Initialize state
    this.updateStateAppearance();
  }

  /**
   * Update the visual appearance based on current state (GCompris style)
   */
  updateStateAppearance() {
    if (!this.background) return;

    const borderColors = {
      'NONE': this.config.borderColor || 0xCCCCCC,
      'ANSWERED': 0x3498db, // Blue
      'RIGHT': 0x27ae60,    // Green
      'WRONG': 0xe74c3c     // Red
    };

    const borderWidths = {
      'NONE': this.config.borderWidth || 3,
      'ANSWERED': 4,
      'RIGHT': 4,
      'WRONG': 8
    };

    this.background.setStrokeStyle(
      borderWidths[this.tileState] || 3,
      borderColors[this.tileState] || 0xCCCCCC,
      1
    );
  }

  /**
   * Set the tile state and update appearance
   */
  setTileState(state) {
    this.tileState = state;
    this.updateStateAppearance();
  }

  /**
   * Accept a tile in this drop zone
   */
  acceptTile(tile) {
    // Check if tile value is accepted
    const isValidValue = this.acceptedValues.includes(tile.value);

    if (isValidValue && !this.isOccupied) {
      // Accept the tile
      this.placeTile(tile);
      return true;
    }

    return false;
  }

  /**
   * Place a tile in this zone
   */
  placeTile(tile) {
    this.currentTile = tile;
    this.isOccupied = true;

    // Snap tile to zone center
    tile.x = this.x;
    tile.y = this.y;

    // Mark tile as placed
    tile.setPlaced(true, this);

    // Update visual appearance
    this.updateVisualState();

    // Emit event
    this.scene.events.emit('tilePlaced', {
      tile: tile,
      zone: this,
      value: tile.value,
      expectedValue: this.expectedValue
    });

    // Play success sound
    if (this.scene.game.audioManager) {
      this.scene.game.audioManager.playSound('success');
    }
  }

  /**
   * Remove tile from this zone
   */
  removeTile() {
    if (this.currentTile) {
      // Reset tile state
      this.currentTile.setPlaced(false);
      this.currentTile = null;
      this.isOccupied = false;

      // Update visual appearance
      this.updateVisualState();

      // Emit event
      this.scene.events.emit('tileRemoved', {
        zone: this
      });
    }
  }

  /**
   * Check if a point is inside this drop zone
   */
  containsPoint(x, y) {
    const bounds = this.getBounds();
    return bounds.contains(x, y);
  }

  /**
   * Get the bounds of this drop zone
   */
  getBounds() {
    const width = this.config.width || 80;
    const height = this.config.height || 80;

    return new Phaser.Geom.Rectangle(
      this.x - width/2,
      this.y - height/2,
      width,
      height
    );
  }

  /**
   * Set highlight state for visual feedback
   */
  setHighlight(highlighted) {
    this.isHighlighted = highlighted;
    this.highlightOverlay.setVisible(highlighted);

    if (highlighted) {
      // Highlight animation
      this.scene.tweens.add({
        targets: this.background,
        scale: 1.1,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });
    } else {
      this.background.setScale(1);
    }
  }

  /**
   * Update visual state based on occupation
   */
  updateVisualState() {
    if (this.isOccupied) {
      // Occupied appearance - use state-based styling (GCompris style)
      this.setTileState('ANSWERED'); // Blue border when occupied

      // Hide value text when occupied
      if (this.valueText) {
        this.valueText.setVisible(false);
      }

    } else {
      // Empty appearance - reset to NONE state
      this.setTileState('NONE');

      // Show value text when empty
      if (this.valueText) {
        this.valueText.setVisible(true);
      }
    }
  }

  /**
   * Validate if a tile can be accepted
   */
  canAcceptTile(tile) {
    if (this.isOccupied) return false;

    return this.acceptedValues.includes(tile.value);
  }

  /**
   * Get validation feedback for a tile
   */
  getValidationFeedback(tile) {
    if (this.isOccupied) {
      return {
        valid: false,
        reason: 'Zone is already occupied'
      };
    }

    if (!this.acceptedValues.includes(tile.value)) {
      return {
        valid: false,
        reason: `Expected: ${this.acceptedValues.join(' or ')}, Got: ${tile.value}`
      };
    }

    return {
      valid: true,
      reason: 'Valid placement'
    };
  }

  /**
   * Show validation feedback animation
   */
  showValidationFeedback(valid) {
    const color = valid ? 0x00B378 : 0xe74c3c;
    const originalColor = this.config.color || 0x00B378;

    // Flash animation
    this.scene.tweens.add({
      targets: this.background,
      fillColor: color,
      duration: 200,
      yoyo: true,
      repeat: 1,
      ease: 'Power2',
      onComplete: () => {
        this.background.setFillStyle(originalColor, this.isOccupied ? 0.9 : 0.7);
      }
    });
  }

  /**
   * Update zone configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.expectedValue !== undefined) {
      this.expectedValue = newConfig.expectedValue;
      this.acceptedValues = newConfig.acceptedValues || [this.expectedValue];

      if (this.valueText) {
        this.valueText.setText(this.expectedValue !== null ? this.expectedValue.toString() : '');
      }
    }

    if (newConfig.color !== undefined) {
      this.config.color = newConfig.color;
      this.updateVisualState();
    }

    if (newConfig.width || newConfig.height) {
      const width = newConfig.width || this.config.width || 80;
      const height = newConfig.height || this.config.height || 80;

      this.background.setSize(width, height);
      this.highlightOverlay.setSize(width, height);

      this.config.width = width;
      this.config.height = height;
    }
  }

  /**
   * Reset zone to initial state
   */
  reset() {
    this.removeTile();
    this.setHighlight(false);

    // Reset position if needed
    if (this.config.resetPosition) {
      this.x = this.config.x;
      this.y = this.config.y;
    }
  }

  /**
   * Get zone data for serialization
   */
  getData() {
    return {
      position: { x: this.x, y: this.y },
      expectedValue: this.expectedValue,
      acceptedValues: this.acceptedValues,
      isOccupied: this.isOccupied,
      currentTileValue: this.currentTile ? this.currentTile.value : null,
      config: this.config
    };
  }

  /**
   * Set zone data from saved state
   */
  setData(data) {
    this.x = data.position.x;
    this.y = data.position.y;
    this.expectedValue = data.expectedValue;
    this.acceptedValues = data.acceptedValues;
    this.isOccupied = data.isOccupied;

    this.updateConfig(data.config);

    if (data.currentTileValue && this.scene) {
      // Try to find and place the corresponding tile
      // This would need to be handled by the parent game class
      this.scene.events.emit('restoreTilePlacement', {
        zone: this,
        tileValue: data.currentTileValue
      });
    }
  }

  /**
   * Animate zone appearance
   */
  animateIn(delay = 0) {
    this.setAlpha(0);
    this.setScale(0.5);

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      duration: 500,
      delay: delay,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Animate zone disappearance
   */
  animateOut() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.setVisible(false);
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
      duration: 400,
      yoyo: true,
      repeat: 2,
      ease: 'Power2'
    });
  }

  /**
   * Shake animation for invalid drops nearby
   */
  shake() {
    this.scene.tweens.add({
      targets: this,
      x: this.x + 5,
      duration: 100,
      yoyo: true,
      repeat: 3,
      ease: 'Power2',
      onComplete: () => {
        this.x = this.config.x; // Reset to original position
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Destroy child objects
    if (this.background) this.background.destroy();
    if (this.highlightOverlay) this.highlightOverlay.destroy();
    if (this.label) this.label.destroy();
    if (this.valueText) this.valueText.destroy();

    // Call parent destroy
    super.destroy();
  }
}