/**
 * ColorMixGame - Interactive color mixing educational game
 * Players learn about color theory by mixing primary colors to create secondary colors
 */
import { InteractiveGame } from './InteractiveGame.js';

export class ColorMixGame extends InteractiveGame {
  constructor(config) {
    super({
      category: 'interactive',
      difficulty: 1,
      ...config
    });

    // Color mixing specific properties - using Lalela brand colors
    this.primaryColors = {
      red: 0xE32528,       // Rooibos Red from brand guide
      blue: 0x0062FF,      // River Blue from brand guide
      yellow: 0xFACA2A     // Lalela Yellow from brand guide
    };

    this.secondaryColors = {
      orange: 0xFD5E1A,    // Bead Orange (red + yellow approximation)
      green: 0x00B378,     // Aloe Green (blue + yellow approximation)
      purple: 0x8000ff     // Custom purple (red + blue)
    };

    this.currentMixture = {
      red: 0,
      blue: 0,
      yellow: 0
    };

    this.mixedColor = 0xffffff; // Start with white
    this.mixingArea = null;
    this.colorPalette = [];
    this.resultDisplay = null;
    this.colorNameDisplay = null;
  }

  /**
   * Initialize learning objectives for color mixing
   */
  initializeLearningObjectives() {
    // Primary color identification
    this.addLearningObjective(
      'identify_primary',
      'Identify Primary Colors',
      'Learn that red, blue, and yellow are the primary colors',
      'Look for the three main colors in the palette',
      15,
      3 // Need to identify all 3
    );

    // Basic color mixing
    this.addLearningObjective(
      'mix_secondary',
      'Create Secondary Colors',
      'Mix primary colors to create orange, green, and purple',
      'Drag colors from the palette to the mixing area',
      25,
      3 // Need to create all 3 secondary colors
    );

    // Color theory understanding
    this.addLearningObjective(
      'color_theory',
      'Understand Color Relationships',
      'Learn which primary colors combine to make each secondary color',
      'Try different combinations to see the results',
      30,
      5 // Need to demonstrate understanding through multiple mixes
    );

    // Set up validation rules
    this.setupValidationRules();
  }

  /**
   * Set up validation rules for color mixing objectives
   */
  setupValidationRules() {
    // Validate primary color identification
    this.addValidationRule('identify_primary', (interaction) => {
      return interaction.type === 'click' &&
             interaction.elementId?.startsWith('primary_');
    });

    // Validate secondary color creation
    this.addValidationRule('mix_secondary', (interaction) => {
      return interaction.type === 'mix_complete' &&
             this.isSecondaryColor(this.mixedColor);
    });

    // Validate color theory understanding
    this.addValidationRule('color_theory', (interaction) => {
      return interaction.type === 'mix_complete' &&
             this.validateColorTheory();
    });
  }

  /**
   * Create interactive elements for color mixing
   */
  createInteractiveElements() {
    this.createColorPalette();
    this.createMixingArea();
    this.createResultDisplay();
    this.createInstructions();
  }

  /**
   * Create the color palette with primary colors
   */
  createColorPalette() {
    const { width, height } = this.scale;
    const paletteY = height * 0.3;
    const spacing = 120;
    const startX = width / 2 - spacing;

    // Create primary color containers
    Object.entries(this.primaryColors).forEach(([colorName, colorValue], index) => {
      const x = startX + (index * spacing);

      // Color container
      const colorContainer = this.add.container(x, paletteY);

      // Color circle
      const colorCircle = this.add.circle(0, 0, 40, colorValue, 1);
      colorCircle.setStrokeStyle(3, 0x2c3e50);

      // Color label
      const colorLabel = this.add.text(0, 60, colorName.charAt(0).toUpperCase() + colorName.slice(1), {
        fontSize: '16px',
        color: '#2c3e50',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);

      colorContainer.add([colorCircle, colorLabel]);

      // Make draggable
      colorContainer.setSize(80, 120);
      colorContainer.setInteractive({ draggable: true });
      colorContainer.colorName = colorName;
      colorContainer.colorValue = colorValue;

      // Register as interactive element
      this.registerInteractiveElement(`primary_${colorName}`, colorContainer, 'drag');

      // Add drag event handlers
      this.input.setDraggable(colorContainer);
      colorContainer.on('dragstart', () => {
        this.onColorDragStart(colorContainer);
      });
      colorContainer.on('drag', (pointer, dragX, dragY) => {
        this.onColorDrag(colorContainer, dragX, dragY);
      });
      colorContainer.on('dragend', () => {
        this.onColorDragEnd(colorContainer);
      });

      this.colorPalette.push(colorContainer);
    });
  }

  /**
   * Create the mixing area where colors are combined
   */
  createMixingArea() {
    const { width, height } = this.scale;
    const mixingAreaY = height * 0.6;

    // Mixing area background - Warm Cream with Ink Black border
    this.mixingArea = this.add.circle(width / 2, mixingAreaY, 80, 0xFDFAED, 0.8);
    this.mixingArea.setStrokeStyle(4, 0x101012);

    // Mixing area label
    const mixingLabel = this.add.text(width / 2, mixingAreaY + 120, 'Drop colors here to mix!', {
      fontSize: '18px',
      color: '#34495e',
      align: 'center'
    }).setOrigin(0.5);

    // Register mixing area as drop zone
    this.registerInteractiveElement('mixing_area', this.mixingArea, 'drop');
  }

  /**
   * Create the result display showing the mixed color
   */
  createResultDisplay() {
    const { width, height } = this.scale;
    const resultY = height * 0.8;

    // Result color circle
    this.resultDisplay = this.add.circle(width / 2, resultY, 50, this.mixedColor, 1);
    this.resultDisplay.setStrokeStyle(3, 0x101012); // Ink Black border

    // Color name display
    this.colorNameDisplay = this.add.text(width / 2, resultY + 80, 'White (no colors mixed)', {
      fontSize: '20px',
      color: '#101012', // Ink Black text
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Create game instructions
   */
  createInstructions() {
    const { width } = this.scale;

    // Main instructions - Lalela Yellow display text
    this.add.text(width / 2, 50, 'Color Mixing Adventure!', {
      fontSize: '28px',
      color: '#FACA2A',
      fontFamily: 'Milkyway Demo, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Sub-instructions - Ink Black body text
    this.add.text(width / 2, 90, 'Drag colors from the palette to the mixing area to create new colors!', {
      fontSize: '16px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Handle color drag start
   */
  onColorDragStart(colorContainer) {
    // Visual feedback - make slightly transparent
    colorContainer.setAlpha(0.8);

    // Bring to front
    this.children.bringToTop(colorContainer);

    this.showFeedback(`Dragging ${colorContainer.colorName}!`, 'info', 1000);
  }

  /**
   * Handle color dragging
   */
  onColorDrag(colorContainer, dragX, dragY) {
    colorContainer.setPosition(dragX, dragY);
  }

  /**
   * Handle color drag end - check if dropped in mixing area
   */
  onColorDragEnd(colorContainer) {
    // Reset visual state
    colorContainer.setAlpha(1);

    // Check if dropped in mixing area
    const bounds = this.mixingArea.getBounds();
    const colorBounds = colorContainer.getBounds();

    if (Phaser.Geom.Rectangle.Overlaps(bounds, colorBounds)) {
      // Successfully dropped in mixing area
      this.addColorToMix(colorContainer.colorName, colorContainer.colorValue);

      // Return color to original position
      this.returnColorToPalette(colorContainer);

      // Trigger interaction validation
      this.onElementInteraction('mixing_area', 'drop', {
        colorName: colorContainer.colorName,
        colorValue: colorContainer.colorValue
      });
    } else {
      // Return to original position
      this.returnColorToPalette(colorContainer);
    }
  }

  /**
   * Add a color to the current mixture
   */
  addColorToMix(colorName, colorValue) {
    // Increment the color component
    this.currentMixture[colorName]++;

    // Calculate the new mixed color
    this.updateMixedColor();

    // Update the display
    this.updateResultDisplay();

    // Provide feedback
    this.showFeedback(`Added ${colorName}!`, 'success', 1500);

    // Play sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('click');
    }

    // Check for color completion
    this.checkMixingResult();
  }

  /**
   * Calculate the mixed color based on current mixture
   */
  updateMixedColor() {
    const { red, blue, yellow } = this.currentMixture;

    // Simple color mixing logic
    let r = 255, g = 255, b = 255; // Start with white

    // Red component
    if (red > 0) r = Math.min(255, 128 + (red * 32));

    // Blue component
    if (blue > 0) b = Math.min(255, 128 + (blue * 32));

    // Green component (yellow contributes to green)
    if (yellow > 0) g = Math.min(255, 128 + (yellow * 32));

    // Special secondary color combinations
    if (red > 0 && yellow > 0 && blue === 0) {
      // Red + Yellow = Orange
      r = 255; g = 128; b = 0;
    } else if (blue > 0 && yellow > 0 && red === 0) {
      // Blue + Yellow = Green
      r = 0; g = 255; b = 0;
    } else if (red > 0 && blue > 0 && yellow === 0) {
      // Red + Blue = Purple
      r = 128; g = 0; b = 255;
    }

    this.mixedColor = (r << 16) | (g << 8) | b;
  }

  /**
   * Update the result display with the current mixed color
   */
  updateResultDisplay() {
    if (this.resultDisplay) {
      this.resultDisplay.setFillStyle(this.mixedColor);
    }

    if (this.colorNameDisplay) {
      const colorName = this.identifyColor(this.mixedColor);
      this.colorNameDisplay.setText(colorName);
    }
  }

  /**
   * Identify the color name based on RGB value
   */
  identifyColor(colorValue) {
    // Check for exact secondary colors first
    for (const [name, value] of Object.entries(this.secondaryColors)) {
      if (colorValue === value) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }

    // Check for primary colors
    for (const [name, value] of Object.entries(this.primaryColors)) {
      if (colorValue === value) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }

    // Check mixture descriptions
    const { red, blue, yellow } = this.currentMixture;
    const total = red + blue + yellow;

    if (total === 0) return 'White (no colors mixed)';
    if (total === 1) return `Light ${Object.keys(this.currentMixture).find(k => this.currentMixture[k] > 0)}`;
    if (total > 1) return 'Mixed Color (try different combinations!)';

    return 'Unknown Color';
  }

  /**
   * Check the result of the current color mixing
   */
  checkMixingResult() {
    const isSecondary = this.isSecondaryColor(this.mixedColor);

    if (isSecondary) {
      // Successfully created a secondary color!
      const colorName = this.identifyColor(this.mixedColor);
      this.showFeedback(`🎨 You made ${colorName}!`, 'success', 3000);

      // Trigger mix completion interaction
      this.onElementInteraction('mixing_area', 'mix_complete', {
        mixedColor: this.mixedColor,
        colorName: colorName,
        mixture: { ...this.currentMixture }
      });

      // Reset mixture for next mix
      this.time.delayedCall(2000, () => {
        this.resetMixture();
      });
    }
  }

  /**
   * Check if the current mixed color is a secondary color
   */
  isSecondaryColor(colorValue) {
    return Object.values(this.secondaryColors).includes(colorValue);
  }

  /**
   * Validate understanding of color theory
   */
  validateColorTheory() {
    const { red, blue, yellow } = this.currentMixture;

    // Check if the mixture matches expected secondary color combinations
    if (red > 0 && yellow > 0 && blue === 0) return true; // Orange
    if (blue > 0 && yellow > 0 && red === 0) return true; // Green
    if (red > 0 && blue > 0 && yellow === 0) return true; // Purple

    return false;
  }

  /**
   * Reset the current color mixture
   */
  resetMixture() {
    this.currentMixture = { red: 0, blue: 0, yellow: 0 };
    this.mixedColor = 0xffffff; // Back to white
    this.updateResultDisplay();
  }

  /**
   * Return a color back to its original position in the palette
   */
  returnColorToPalette(colorContainer) {
    // Find the original position in palette
    const paletteIndex = this.colorPalette.indexOf(colorContainer);
    if (paletteIndex >= 0) {
      const { width } = this.scale;
      const spacing = 120;
      const startX = width / 2 - spacing;
      const originalX = startX + (paletteIndex * spacing);
      const originalY = this.scale.height * 0.3;

      // Animate back to position
      this.tweens.add({
        targets: colorContainer,
        x: originalX,
        y: originalY,
        duration: 500,
        ease: 'Power2'
      });
    }
  }

  /**
   * Create tutorial steps for color mixing
   */
  createTutorialSteps() {
    return [
      {
        message: "Welcome to Color Mixing! 🎨",
        highlightElement: null
      },
      {
        message: "These are the primary colors: Red, Blue, and Yellow",
        highlightElement: this.colorPalette[0] // Highlight red
      },
      {
        message: "Drag a color to the mixing area to start mixing!",
        highlightElement: this.mixingArea
      },
      {
        message: "Try mixing Red + Yellow to make Orange! 🍊",
        highlightElement: null
      }
    ];
  }

  /**
   * Override to provide color-specific feedback
   */
  onCorrectInteraction(interaction) {
    if (interaction.type === 'mix_complete') {
      const colorName = this.identifyColor(interaction.mixedColor);
      this.showFeedback(`🎨 Perfect! You made ${colorName}!`, 'success', 3000);
    } else {
      super.onCorrectInteraction(interaction);
    }
  }

  /**
   * Get color mixing specific statistics
   */
  getGameStats() {
    const secondaryColorsCreated = this.interactionHistory.filter(
      h => h.type === 'mix_complete' && this.isSecondaryColor(h.interaction?.mixedColor)
    ).length;

    return {
      ...super.getGameStats(),
      secondaryColorsCreated,
      currentMixture: { ...this.currentMixture },
      mixedColor: this.mixedColor,
      colorName: this.identifyColor(this.mixedColor)
    };
  }

  /**
   * Override restart to reset color mixing state
   */
  restartGame() {
    // Reset color mixture
    this.resetMixture();

    // Reset palette positions
    this.colorPalette.forEach((colorContainer, index) => {
      const { width } = this.scale;
      const spacing = 120;
      const startX = width / 2 - spacing;
      const x = startX + (index * spacing);
      const y = this.scale.height * 0.3;

      colorContainer.setPosition(x, y);
      colorContainer.setAlpha(1);
    });

    super.restartGame();
  }
}