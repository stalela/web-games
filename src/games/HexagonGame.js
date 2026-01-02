/**
 * HexagonGame - Find the hidden strawberry by clicking hexagons
 * GCompris-style "hot and cold" logic game with perfect honeycomb grid geometry
 * Educational game teaching spatial reasoning and logical deduction
 */
import { InteractiveGame } from './InteractiveGame.js';
import { InputManager } from '../utils/InputManager.js';

export class HexagonGame extends InteractiveGame {
  constructor(config) {
    super({
      id: 'HexagonGame',
      name: 'Hexagon',
      category: 'fun',
      difficulty: 2,
      description: 'Find the strawberry by clicking on the blue fields.',
      ...config
    });

    // Game-specific properties
    this.hexagons = [];
    this.strawberryX = 0;
    this.strawberryY = 0;
    this.nbx = 10; // Number of hexagons horizontally
    this.nby = 10; // Number of hexagons vertically
    this.currentLevel = 0;
    this.numberOfLevels = 12;
    this.inputLocked = false;
    this.strawberryFound = false;
    this.hexagonRadius = 0;
    this.hexagonWidth = 0;
    this.hexagonHeight = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load hexagon border (GCompris style)
    this.load.svg('hexagon_border', 'assets/game-icons/hexagon_border.svg');
    
    // Load strawberry
    this.load.svg('strawberry', 'assets/game-icons/strawberry.svg');
    
    // Load GCompris nature background
    this.load.svg('background', 'assets/game-icons/background.svg');

    console.log("HexagonGame assets loaded");
  }

  /**
   * Initialize the game
   */
  init(data) {
    super.init(data);

    if (data.inputManager) {
      this.inputManager = data.inputManager;
    } else {
      this.inputManager = new InputManager(this);
    }

    // Initialize level
    this.currentLevel = data?.level || 0;
  }

  /**
   * OVERRIDE: Create the background first so it is at the bottom
   */
  createBackground() {
    const { width, height } = this.scale;
    this.background = this.add.image(width / 2, height / 2, 'background');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-5);
  }

  /**
   * OVERRIDE: Create UI elements
   */
  createUI() {
    // Hide base class UI elements to prevent "ghost" completion screen
    if (this.progressText) this.progressText.setVisible(false);
    if (this.objectiveText) this.objectiveText.setVisible(false);
    if (this.hintButton) this.hintButton.setVisible(false);

    // Instruction panel background (GCompris style) - responsive width
    // Measure text width to create appropriately sized background
    const tempText = this.add.text(0, 0, 'Find the strawberry by clicking on the hexagons!', {
      fontSize: '24px',
      fontFamily: 'Fredoka One, cursive'
    });
    const textWidth = tempText.width;
    tempText.destroy(); // Clean up temp text

    const instructionPanelBg = this.add.rectangle(
      this.scale.width / 2,
      50,
      Math.min(textWidth + 40, this.scale.width - 40), // Responsive width with minimum margins
      60,
      0x000000,
      0.7
    ).setOrigin(0.5).setDepth(50);

    // Instruction text
    this.instructionText = this.add.text(
      this.scale.width / 2,
      50,
      'Find the strawberry by clicking on the hexagons!',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(50);

    // Level display
    this.levelDisplay = this.add.text(
      this.scale.width - 20,
      20,
      `Level ${this.currentLevel + 1}`,
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold'
      }
    ).setOrigin(1, 0).setDepth(50);

    // Create navigation dock
    this.createNavigationDock(this.scale.width, this.scale.height);
  }

  /**
   * OVERRIDE: Prevent base class from showing completion screen prematurely
   */
  initializeLearningObjectives() {
    // Add a dummy objective that never gets completed
    // This prevents the base class from thinking all objectives are done
    this.learningObjectives = [
      {
        id: 'find_strawberry',
        description: 'Find the hidden strawberry',
        completed: false
      }
    ];
  }

  /**
   * OVERRIDE: Prevent base class completion screen from showing
   */
  onAllObjectivesComplete() {
    // Empty override - we handle completion ourselves
  }

  /**
   * OVERRIDE: Prevent base class completion screen
   */
  showCompletionScreen() {
    // Empty override - we handle completion ourselves
  }

  /**
   * OVERRIDE: Prevent base class from starting objectives automatically
   */
  startNextObjective() {
    // HexagonGame doesn't use the objective system
    // Don't call super - we handle our own game flow
  }

  /**
   * OVERRIDE: This is where the game logic starts after UI/Background are ready
   */
  setupGameLogic() {
    this.initLevel();
  }

  /**
   * Initialize level (GCompris style)
   */
  initLevel() {
    // Clear existing hexagons
    this.clearHexagons();

    // Calculate grid size based on level (GCompris formula)
    this.nbx = 10 + this.currentLevel;
    this.nby = Math.floor(this.nbx * (this.scale.height / this.scale.width));

    // Calculate hexagon radius using GCompris formula
    // r = Math.min(width / nbx / 2, (height - margin) / nby / 2)
    const margin = 200; // Space for UI
    const availableHeight = this.scale.height - margin;
    this.hexagonRadius = Math.min(
      this.scale.width / this.nbx / 2,
      availableHeight / this.nby / 2
    );

    // Calculate hexagon dimensions (GCompris formula)
    // width = Math.cos(Math.PI / 6) * r * 2
    this.hexagonWidth = Math.cos(Math.PI / 6) * this.hexagonRadius * 2;
    this.hexagonHeight = this.hexagonRadius * 2;

    // Calculate total grid bounding box for perfect centering
    // Account for staggered rows: every second row has half-hexagon offset
    const totalGridWidth = (this.nbx * this.hexagonWidth) + (this.hexagonWidth * 0.5);
    // Account for overlapping rows: vertical spacing is radius * 1.5
    const totalGridHeight = ((this.nby - 1) * (this.hexagonRadius * 1.5)) + this.hexagonHeight;

    // Calculate offsets for perfect centering using safe areas
    this.offsetX = (this.scale.width - totalGridWidth) / 2;
    const safeAreaTop = 110; // Below instructions
    const safeAreaBottom = this.scale.height - 150; // Above dock
    const availableAreaHeight = safeAreaBottom - safeAreaTop;
    this.offsetY = safeAreaTop + (availableAreaHeight - totalGridHeight) / 2;

    // Select random position for strawberry (GCompris formula)
    this.strawberryX = Math.floor(Math.random() * (this.nbx - 1));
    this.strawberryY = Math.floor(Math.random() * this.nby);

    console.log(`Level ${this.currentLevel + 1}: Strawberry at (${this.strawberryX}, ${this.strawberryY})`);

    // Create hexagon grid
    this.createHexagonGrid();

    // Reset game state
    this.inputLocked = false;
    this.strawberryFound = false;

    // Update level display
    if (this.levelDisplay) {
      this.levelDisplay.setText(`Level ${this.currentLevel + 1}`);
    }
  }

  /**
   * Create hexagon grid (GCompris style)
   */
  createHexagonGrid() {
    this.hexagons = [];

    for (let ix = 0; ix < this.nbx; ix++) {
      for (let iy = 0; iy < this.nby; iy++) {
        // Skip hexagons in odd rows that would be outside bounds (GCompris logic)
        if ((iy % 2 && ix < this.nbx - 1) || iy % 2 === 0) {
          const hexagon = this.createHexagon(ix, iy);
          this.hexagons.push(hexagon);
        }
      }
    }
  }

  /**
   * Create a single hexagon (GCompris geometry)
   */
  createHexagon(ix, iy) {
    // Calculate position using refined centering
    // x: (iy % 2 ? width * ix + width / 2 : width * ix) + offsetX
    // y: offsetY + (iy * verticalSpacing) - no additional arbitrary adjustments
    const x = (iy % 2 ? this.hexagonWidth * ix + this.hexagonWidth / 2 : this.hexagonWidth * ix) + this.offsetX;
    const verticalSpacing = this.hexagonRadius * 1.5; // Proper vertical spacing for overlapping hexagons
    const y = this.offsetY + (iy * verticalSpacing);

    // Create container for hexagon components
    const hexagonContainer = this.add.container(x, y);
    hexagonContainer.setDepth(10);

    // Create hexagon graphics (colored fill)
    const hexagonGraphics = this.add.graphics();
    // Graphics depth is relative to container, so set to 0

    // Draw hexagon shape (GCompris style - matches border shape)
    const points = this.getHexagonPoints(0, 0, this.hexagonRadius);
    hexagonGraphics.fillStyle(0x0099FF, 1); // Blue default color
    hexagonGraphics.fillPoints(points, true);

    // Add border image overlay (GCompris style)
    const border = this.add.image(0, 0, 'hexagon_border');
    border.setDisplaySize(this.hexagonWidth, this.hexagonHeight);
    // Border depth is relative to container, so set to 1 (above graphics)
    border.setOrigin(0.5);

    // Add to container
    hexagonContainer.add([hexagonGraphics, border]);

    // Make interactive using hexagon shape
    hexagonContainer.setInteractive(new Phaser.Geom.Polygon(points), Phaser.Geom.Polygon.Contains);

    // Store hexagon data
    hexagonContainer.ix = ix;
    hexagonContainer.iy = iy;
    hexagonContainer.centerX = x;
    hexagonContainer.centerY = y;
    hexagonContainer.isTouched = false;
    hexagonContainer.hasStrawberry = (this.strawberryX === ix && this.strawberryY === iy);
    hexagonContainer.hexagonGraphics = hexagonGraphics;
    hexagonContainer.border = border;
    hexagonContainer.points = points;

    // Add click handler
    hexagonContainer.on('pointerdown', () => {
      if (!this.inputLocked && !hexagonContainer.isTouched) {
        this.onHexagonClick(hexagonContainer);
      }
    });

    // Add hover effect
    hexagonContainer.on('pointerover', () => {
      if (!this.inputLocked && !hexagonContainer.isTouched) {
        hexagonContainer.setAlpha(0.8);
      }
    });

    hexagonContainer.on('pointerout', () => {
      if (!this.inputLocked && !hexagonContainer.isTouched) {
        hexagonContainer.setAlpha(1.0);
      }
    });

    return hexagonContainer;
  }

  /**
   * Get hexagon points for drawing (GCompris style)
   */
  getHexagonPoints(centerX, centerY, radius) {
    const points = [];
    // GCompris uses 6 points for hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6; // Start at -30 degrees for proper orientation
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(new Phaser.Geom.Point(x, y));
    }
    return points;
  }

  /**
   * Handle hexagon click
   */
  onHexagonClick(hexagon) {
    if (hexagon.isTouched) {
      return;
    }

    hexagon.isTouched = true;

    if (hexagon.hasStrawberry) {
      // Found the strawberry!
      this.foundStrawberry(hexagon);
    } else {
      // Show distance-based color
      const distance = this.getDistance(hexagon.ix, hexagon.iy);
      const color = this.getColor(distance);
      this.updateHexagonColor(hexagon, color);
    }
  }

  /**
   * Calculate distance from hexagon to strawberry (GCompris formula)
   */
  getDistance(ix, iy) {
    return Math.sqrt(Math.pow((ix - this.strawberryX), 2) + Math.pow((iy - this.strawberryY), 2));
  }

  /**
   * Get color based on distance (GCompris exact formula)
   */
  getColor(distance) {
    let r = 0, g = 0, b = 0;

    if (distance < 5) {
      // Very close - Red (interpolate Green from 0 to 255)
      r = 0xFF;
      g = Math.floor(0xFF * (distance / 5));
      b = 0;
    } else if (distance < 10) {
      // Close - Yellow to Green (interpolate Red from 255 down to 0)
      g = 0xFF;
      r = Math.floor(0xFF - 0xFF * ((distance - 5) / 5));
      b = 0;
    } else if (distance < 15) {
      // Medium - Green to Blue (interpolate Blue from 0 up to 255)
      g = Math.floor(0xFF - 0xFF * ((distance - 10) / 5));
      b = Math.floor(0xFF * ((distance - 10) / 5));
      r = 0;
    } else {
      // Far - Blue (interpolate Red slightly based on maxSize)
      const maxSize = Math.sqrt(Math.pow(this.nbx, 2) + Math.pow(this.nby, 2));
      b = 0xFF;
      r = Math.floor(0xFF * ((distance - 15) / maxSize));
      g = 0;
    }

    return Phaser.Display.Color.GetColor(r, g, b);
  }

  /**
   * Update hexagon color
   */
  updateHexagonColor(hexagon, color) {
    const points = hexagon.points;
    hexagon.hexagonGraphics.clear();
    hexagon.hexagonGraphics.fillStyle(color, 1);
    hexagon.hexagonGraphics.fillPoints(points, true);
  }

  /**
   * Handle finding the strawberry (GCompris style)
   */
  foundStrawberry(hexagon) {
    this.inputLocked = true;
    this.strawberryFound = true;

    // Make hexagon transparent and hide border (GCompris style)
    hexagon.hexagonGraphics.clear();
    hexagon.hexagonGraphics.fillStyle(0xFFFFFF, 0); // Transparent
    hexagon.border.setAlpha(0);

    // Add strawberry image
    const strawberry = this.add.image(hexagon.centerX, hexagon.centerY, 'strawberry');
    strawberry.setDisplaySize(this.hexagonWidth, this.hexagonHeight);
    strawberry.setDepth(20);
    strawberry.setAlpha(0);
    
    // Fade in strawberry with scale animation (GCompris style)
    this.tweens.add({
      targets: strawberry,
      alpha: 1,
      scale: 1.2,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: strawberry,
          scale: 1.0,
          duration: 200
        });
      }
    });

    // Create particle burst effect (GCompris style)
    this.createParticleBurst(hexagon.centerX, hexagon.centerY);

    // Play success sound immediately
    if (this.game && this.game.audioManager) {
      this.game.audioManager.playSound('win');
    }

    // Show bonus animation (GCompris style)
    this.showBonusAnimation();

    // Check if this is the final level
    if (this.currentLevel === this.numberOfLevels - 1) {
      // Game complete - show completion screen after delay
      this.time.delayedCall(2000, () => {
        this.showGameComplete();
      });
    } else {
      // Move to next level after delay
      this.time.delayedCall(2000, () => {
        this.nextLevel();
      });
    }
  }

  /**
   * Show game completion screen (only when all levels are done)
   */
  showGameComplete() {
    // Close any open modals
    this.closeHelpModal();
    this.closeLevelSelector();

    const { width, height } = this.scale;

    // Create completion overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setDepth(200);

    // Completion message
    const titleText = this.add.text(width / 2, height / 2 - 100, '🎉 Game Complete! 🎉', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);

    const statsText = this.add.text(width / 2, height / 2, `You completed all ${this.numberOfLevels} levels!\nGreat job finding all the strawberries!`, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(200);

    // Restart button
    const restartButton = this.add.text(width / 2, height / 2 + 150, 'Play Again', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#27ae60',
      padding: { x: 30, y: 15 },
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(200);

    restartButton.on('pointerdown', () => {
      this.currentLevel = 0;
      overlay.destroy();
      titleText.destroy();
      statsText.destroy();
      restartButton.destroy();
      this.initLevel();
    });

    // Home button
    const homeButton = this.add.text(width / 2, height / 2 + 220, 'Return to Menu', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#0062FF',
      padding: { x: 25, y: 12 },
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(200);

    homeButton.on('pointerdown', () => {
      this.returnToMenu();
    });
  }

  /**
   * Create particle burst effect (GCompris style star particles)
   */
  createParticleBurst(x, y) {
    const particleCount = 40;
    const colors = [0xFFD700, 0xFFA500, 0xFF6347, 0xFF69B4, 0xFF1493]; // Gold, Orange, Tomato, Hot Pink, Deep Pink

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const distance = 50 + Math.random() * 100;
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Create star particle (5-pointed star)
      const particle = this.add.graphics();
      particle.fillStyle(color, 1);
      
      // Draw 5-pointed star
      const starPoints = this.getStarPoints(0, 0, 5, 2.5, 5);
      particle.fillPoints(starPoints, true);
      
      particle.setPosition(x, y);
      particle.setDepth(20); // Above hexagons but below completion overlay

      // Animate particle
      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0,
        duration: 800 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Get star points for drawing
   */
  getStarPoints(centerX, centerY, outerRadius, innerRadius, points) {
    const starPoints = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      starPoints.push(new Phaser.Geom.Point(x, y));
    }
    return starPoints;
  }

  /**
   * Show bonus animation (GCompris style flower/smiley)
   */
  showBonusAnimation() {
    // Create a large flower/smiley emoji as bonus
    const bonus = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      '🌸',
      {
        fontSize: '120px',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setDepth(20).setAlpha(0);

    // Scale and fade in with bouncy Back.easeOut
    this.tweens.add({
      targets: bonus,
      alpha: 1,
      scale: 1.5,
      duration: 400,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: bonus,
          alpha: 0,
          scale: 0.5,
          duration: 300,
          onComplete: () => {
            bonus.destroy();
          }
        });
      }
    });
  }

  /**
   * OVERRIDE: Prevent base class from creating interactive elements automatically
   */
  createInteractiveElements() {
    // HexagonGame creates its own hexagon elements in createHexagonGrid
    // Don't call super - we handle our own elements
  }

  /**
   * Move to next level
   */
  nextLevel() {
    this.currentLevel++;
    
    if (this.currentLevel >= this.numberOfLevels) {
      // Game complete - restart from beginning
      this.currentLevel = 0;
    }

    this.initLevel();
  }

  /**
   * Move to previous level
   */
  previousLevel() {
    this.currentLevel--;
    
    if (this.currentLevel < 0) {
      this.currentLevel = this.numberOfLevels - 1;
    }

    this.initLevel();
  }

  /**
   * Clear all hexagons
   */
  clearHexagons() {
    this.hexagons.forEach(hex => hex.destroy());
    this.hexagons = [];
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

      // Label (Fredoka One font as specified)
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
    // Close any open modals before performing actions
    this.closeHelpModal();
    this.closeLevelSelector();

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
    const helpText = this.add.text(width / 2, height / 2, '🍓 Hexagon Game Help! 🍓\n\n' +
      '• Click on hexagons to reveal their colors\n' +
      '• The colors get redder as you get closer to the strawberry\n' +
      '• Blue means you\'re far away\n' +
      '• Red means you\'re very close!\n' +
      '• Yellow and green are in between\n\n' +
      'Find the hidden strawberry in the honeycomb!', {
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
   * Show level selector modal
   */
  showLevelSelector() {
    const { width, height } = this.scale;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.setDepth(150);
    overlay.on('pointerdown', () => this.closeLevelSelector());

    // Modal background
    const modalBg = this.add.rectangle(width / 2, height / 2, 600, 500, 0xFDFAED, 1);
    modalBg.setStrokeStyle(4, 0xFACA2A);
    modalBg.setDepth(151);

    // Title
    const titleText = this.add.text(width / 2, height / 2 - 220, '🎯 Select Level', {
      fontSize: '28px',
      color: '#101012',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(152);

    // Current level indicator
    const currentLevelText = this.add.text(width / 2, height / 2 - 180, `Current: Level ${this.currentLevel + 1}`, {
      fontSize: '18px',
      color: '#0062FF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(152);

    // Create level buttons in a grid
    const levelsPerRow = 5;
    const buttonSize = 50;
    const buttonSpacing = 15;
    const startY = height / 2 - 130;
    const totalWidth = (levelsPerRow - 1) * (buttonSize + buttonSpacing);
    const startX = width / 2 - totalWidth / 2 + buttonSize / 2;

    const levelButtons = [];
    const levelTexts = [];

    for (let level = 0; level < this.numberOfLevels; level++) {
      const row = Math.floor(level / levelsPerRow);
      const col = level % levelsPerRow;
      const x = startX + col * (buttonSize + buttonSpacing);
      const y = startY + row * (buttonSize + buttonSpacing);

      // Button background
      const buttonBg = this.add.circle(x, y, buttonSize / 2, level <= this.currentLevel ? 0x27ae60 : 0xcccccc);
      buttonBg.setInteractive({ useHandCursor: true });
      buttonBg.setDepth(153);

      // Level number
      const levelText = this.add.text(x, y, (level + 1).toString(), {
        fontSize: '20px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(154);

      // Store references
      levelButtons.push(buttonBg);
      levelTexts.push(levelText);

      // Only make clickable levels interactive
      if (level <= this.currentLevel) {
        buttonBg.on('pointerdown', () => {
          this.selectLevel(level);
          this.closeLevelSelector();
        });

        // Hover effects
        buttonBg.on('pointerover', () => {
          buttonBg.setScale(1.1);
        });
        buttonBg.on('pointerout', () => {
          buttonBg.setScale(1.0);
        });
      } else {
        // Locked levels - gray and non-interactive
        buttonBg.setAlpha(0.6);
        levelText.setAlpha(0.6);
      }
    }

    // Close button
    const closeBtn = this.add.circle(width / 2 + 280, height / 2 - 240, 20, 0xE32528);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setDepth(155);
    closeBtn.on('pointerdown', () => this.closeLevelSelector());

    const closeText = this.add.text(width / 2 + 280, height / 2 - 240, '×', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(156);

    // Store modal elements for cleanup
    this.levelSelectorModal = [
      overlay, modalBg, titleText, currentLevelText,
      closeBtn, closeText,
      ...levelButtons, ...levelTexts
    ];
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
   * Select and jump to a specific level
   */
  selectLevel(levelIndex) {
    // Close any open help modal
    this.closeHelpModal();

    this.currentLevel = levelIndex;
    this.initLevel();

    // Update level display
    if (this.levelDisplay) {
      this.levelDisplay.setText(`Level ${this.currentLevel + 1}`);
    }
  }

  /**
   * Show menu
   */
  showMenu() {
    if (this.uiManager) {
      this.uiManager.showNotification(
        'Menu: Use the buttons to navigate levels or return home.',
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
    this.closeLevelSelector();
    this.scene.start('GameMenu');
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clean up modals if open
    if (this.helpModal) {
      this.helpModal.forEach(element => element.destroy());
      this.helpModal = null;
    }
    if (this.levelSelectorModal) {
      this.levelSelectorModal.forEach(element => element.destroy());
      this.levelSelectorModal = null;
    }

    this.clearHexagons();
    super.destroy();
  }
}
