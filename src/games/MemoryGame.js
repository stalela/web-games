/**
 * MemoryGame - Base class for all memory and matching games
 * Provides common functionality for card-flipping, matching, and memory game mechanics
 */
import { LalelaGame } from '../utils/LalelaGame.js';
import { Card } from '../components/Card.js';
import { GameObjectPool } from '../utils/ObjectPool.js';

export class MemoryGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'memory',
      ...config
    });

    // Memory game specific properties
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.totalPairs = 0;
    this.canFlip = true; // Prevent multiple flips during animations
    this.flipDelay = 1000; // Delay before flipping cards back (ms)

    // Grid layout
    this.gridRows = 4;
    this.gridCols = 4;
    this.cardSpacing = 15; // Slightly more spacing for larger cards
    this.cardSize = 120; // Larger default size

    // Advanced grid options
    this.gridLayout = 'rectangular'; // 'rectangular', 'hexagonal', 'circular', 'spiral'

    // Performance optimization: Card object pool
    this.cardPool = null;
    this.gridPadding = 20; // Padding around the grid
    this.autoResizeGrid = true; // Automatically adjust grid size based on content
    this.minCardSize = 100; // Increased for toddlers
    this.maxCardSize = 200; // Much larger for better visibility

    // Animation settings
    this.flipDuration = 300;
    this.matchAnimationDuration = 500;

    // Game state
    this.gameStarted = false;
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.hintsUsed = 0;
    this.maxHints = 3;

    // Matching configuration
    this.matchType = 'exact'; // 'exact', 'sound', 'color', 'shape', 'category'
    this.matchRules = {
      exact: (card1, card2) => card1.value === card2.value,
      sound: (card1, card2) => this.compareSound(card1.value, card2.value),
      color: (card1, card2) => this.compareColor(card1.value, card2.value),
      shape: (card1, card2) => this.compareShape(card1.value, card2.value),
      category: (card1, card2) => this.compareCategory(card1.value, card2.value)
    };
  }

  /**
   * Create game-specific object pools
   */
  createGameSpecificPools() {
    // Skip creating pools for now to avoid initialization issues
    // We'll create them when needed in the game
    console.log('Memory game pools creation skipped to avoid initialization issues');
  }


  /**
   * Initialize the memory game
   */
  init(data) {
    super.init(data);

    // Set up input handling
    if (data.inputManager) {
      this.inputManager = data.inputManager;
      this.setupInputHandling();
    }
  }

  /**
   * Set up input handling for memory games
   */
  setupInputHandling() {
    // Memory games typically use pointer events for card flipping
    this.input.on('pointerdown', this.onPointerDown, this);
  }

  /**
   * Preload assets for the memory game
   */
  preload() {
    super.preload();

    // Load background image
    this.load.svg('background.svg', 'assets/game-icons/background.svg');

    // Load Egyptian background assets
    this.load.svg('child.svg', 'assets/game-icons/child.svg');

    // Load animal icons for memory cards (these will be loaded by subclasses)
    // MemoryImageGame will load: memory_cat, memory_turtle, memory_lion, memory_elephant

    // Load UI control icons for navigation dock
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach(icon => {
      this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });

    // Load card flip sound
    this.load.audio('cardFlip', 'assets/sounds/card_flip.wav');
  }

  /**
   * Create the game scene
   */
  create() {
    // Create UI elements first before calling super.create()
    this.createUI();

    // Now call super.create() which will eventually call startLevel()
    super.create();

    // Initialize game state
    this.initializeGame();
  }

  /**
   * Create UI elements for the memory game
   */
  createUI() {
    const { width, height } = this.scale;

    // Create GCompris background
    this.createGComprisBackground(width, height);

    // Create character badge for score (right side)
    this.createCharacterBadge(width, height);

    // Create navigation dock (bottom)
    this.createNavigationDock(width, height);

    // Level display (top center)
    this.levelText = this.add.text(width / 2, 20, `Level: ${this.level}`, {
      fontSize: '24px',
      color: '#101012',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);
  }

  /**
   * Create GCompris background
   */
  createGComprisBackground(width, height) {
    // Use the GCompris background image
    this.background = this.add.image(width / 2, height / 2, 'background.svg');
    this.background.setDisplaySize(width, height);
    this.background.setAlpha(0.8); // Slight transparency for better text readability
  }

  /**
   * Create character badge for score display (with better contrast)
   */
  createCharacterBadge(width, height) {
    const badgeX = width - 180; // Moved left to accommodate larger size
    const badgeY = height * 0.15;
    const badgeWidth = 220; // MASSIVE increase
    const badgeHeight = 130; // MASSIVE increase

    // Badge background (grand white box with deep shadow for contrast)
    const badgeShadow = this.add.rectangle(badgeX + 4, badgeY + 4, badgeWidth, badgeHeight, 0x000000, 0.4); // Deeper shadow
    const badgeBg = this.add.rectangle(badgeX, badgeY, badgeWidth, badgeHeight, 0xFFFFFF, 1.0);
    badgeBg.setStrokeStyle(6, 0x0062FF); // Very thick River Blue border

    // Character icon (much larger - looks like it's "holding" the score box)
    const character = this.add.sprite(badgeX - 50, badgeY, 'child.svg'.replace('.svg', ''));
    character.setScale(0.8); // Much larger scale

    // Score text (HUGE and bold)
    this.scoreText = this.add.text(badgeX + 30, badgeY - 30, `Score: ${this.score}`, {
      fontSize: '24px', // MASSIVE increase
      color: '#101012',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'left'
    }).setOrigin(0, 0.5);

    // Moves text (larger and using Fredoka One)
    this.movesText = this.add.text(badgeX + 30, badgeY, 'Moves: 0', {
      fontSize: '18px', // Larger
      color: '#101012',
      fontFamily: 'Fredoka One, cursive', // Changed to Fredoka One
      fontStyle: 'bold',
      align: 'left'
    }).setOrigin(0, 0.5);

    // Streak display (larger and using Fredoka One)
    this.streakText = this.add.text(badgeX + 30, badgeY + 30, 'Streak: 0', {
      fontSize: '18px', // Larger
      color: '#101012',
      fontFamily: 'Fredoka One, cursive', // Changed to Fredoka One
      fontStyle: 'bold',
      align: 'left'
    }).setOrigin(0, 0.5);
  }

  /**
   * Create bottom navigation dock
   */
  createNavigationDock(width, height) {
    const dockY = height - 80; // Lower dock position for more prominence
    const buttonSize = 90; // MASSIVE increase for toddler fingers
    const spacing = 130; // Much wider spacing for the larger buttons

    // Dock background (prominent "bubbly" white pill shape)
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.95); // More opaque for prominence
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60); // Much taller and wider

    // Deep drop shadow for 3D toy effect
    const dockShadow = this.add.graphics();
    dockShadow.fillStyle(0x000000, 0.3); // Much darker shadow
    dockShadow.fillRoundedRect(width / 2 - (width - 60) / 2 + 4, dockY - 56, width - 60, 120, 60);

    // Thick River Blue border for the dock
    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(5, 0x0062FF, 1); // 5px River Blue border
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);

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

      // Button background with enhanced 3D toy effect
      const buttonShadow = this.add.circle(x + 4, dockY + 4, buttonSize / 2, 0x000000, 0.4); // Deeper shadow
      const button = this.add.circle(x, dockY, buttonSize / 2, control.color);
      button.setStrokeStyle(5, 0xFFFFFF); // Thick white border for toy look
      button.setInteractive({ useHandCursor: true });

      // Icon (scaled proportionally to much larger button)
      const icon = this.add.sprite(x, dockY, control.icon.replace('.svg', ''));
      icon.setScale((buttonSize * 0.7) / 100); // Larger relative scaling
      icon.setTint(0xFFFFFF);

      // Label below button (much larger font for toddler readability)
      const label = this.add.text(x, dockY + buttonSize / 2 + 25, control.label, {
        fontSize: '20px', // MASSIVE increase for visibility
        color: '#101012',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);

      // Enhanced hover effects (more dramatic for toddlers)
      button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scale: 1.2, // Much more dramatic scale
          duration: 150,
          ease: 'Back.easeOut'
        });
        button.setStrokeStyle(6, 0x000000); // Even thicker black border on hover
        icon.setScale((buttonSize * 0.8) / 100); // Icon scales with button
      });

      button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scale: 1.0,
          duration: 150,
          ease: 'Back.easeOut'
        });
        button.setStrokeStyle(5, 0xFFFFFF); // Back to thick white border
        icon.setScale((buttonSize * 0.7) / 100); // Icon back to normal
      });

      button.on('pointerdown', () => {
        this.handleDockAction(control.action);
      });

      // Store references for cleanup
      this.dockElements = this.dockElements || [];
      this.dockElements.push(button, buttonShadow, icon, label);
    });
  }

  /**
   * Handle navigation dock actions
   */
  handleDockAction(action) {
    switch (action) {
      case 'help':
        this.showEgyptianHelp();
        break;
      case 'home':
        this.scene.start('GameMenu');
        break;
      case 'levels':
        this.showLevelSelector();
        break;
      case 'menu':
        this.scene.start('GameMenu');
        break;
    }
  }

  /**
   * Show help modal
   */
  showEgyptianHelp() {
    const { width, height } = this.scale;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.closeEgyptianHelp());

    // Modal background
    const modalBg = this.add.rectangle(width / 2, height / 2, 500, 400, 0xFDFAED, 1);
    modalBg.setStrokeStyle(4, 0xFACA2A);

    // Help content
    const helpText = this.add.text(width / 2, height / 2, '🧠 Memory Game Help! 🧠\n\n' +
      '• Click cards to flip them and reveal images\n' +
      '• Find matching pairs of the same image\n' +
      '• Build your streak for bonus points\n' +
      '• Use hints wisely to discover matches\n\n' +
      'Find all the pairs to complete the level!', {
      fontSize: '18px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    // Close button
    const closeBtn = this.add.circle(width / 2 + 220, height / 2 - 180, 20, 0xE32528);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeEgyptianHelp());

    const closeText = this.add.text(width / 2 + 220, height / 2 - 180, '×', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5);

    this.helpModal = [overlay, modalBg, helpText, closeBtn, closeText];
  }

  /**
   * Close help modal
   */
  closeEgyptianHelp() {
    if (this.helpModal) {
      this.helpModal.forEach(element => element.destroy());
      this.helpModal = null;
    }
  }

  /**
   * Show level selector
   */
  showLevelSelector() {
    // Simple level selector for now
    if (this.uiManager) {
      this.uiManager.showNotification('Level selection coming soon!', 'info', 2000);
    }
  }

  /**
   * Initialize game state and create cards
   */
  initializeGame() {
    this.gameStarted = false;
    this.gameCompleted = false;
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;

    // Generate card pairs based on level
    this.generateCardPairs();

    // Create the card grid
    this.createCardGrid();

    // Shuffle and position cards
    this.shuffleAndPositionCards();

    this.gameStarted = true;
    this.updateUI();
  }

  /**
   * Generate card pairs for the current level
   * Override in subclasses to customize card generation
   */
  generateCardPairs() {
    // Egyptian-themed animal pairs
    const animalPairs = [
      'memory_cat.svg',
      'memory_turtle.svg',
      'memory_lion.svg',
      'memory_elephant.svg'
    ];

    const pairCount = Math.min(animalPairs.length, (this.gridRows * this.gridCols) / 2);
    this.cardPairs = [];

    // Use available animals for this level
    for (let i = 0; i < pairCount; i++) {
      const animal = animalPairs[i % animalPairs.length];
      this.cardPairs.push(animal, animal); // Add two of each animal
    }

    this.totalPairs = pairCount;
  }

  /**
   * Create the card grid layout with advanced positioning
   */
  createCardGrid() {
    const { width, height } = this.scale;
    const availableWidth = width - (this.gridPadding * 2);
    const availableHeight = height - (this.gridPadding * 2) - 200; // Much more space for the massive dock

    // Auto-resize grid if enabled
    if (this.autoResizeGrid) {
      this.optimizeGridSize(availableWidth, availableHeight);
    }

    // Calculate optimal card size and spacing
    this.calculateOptimalLayout(availableWidth, availableHeight);

    // Generate grid positions based on layout type
    this.gridPositions = this.generateGridPositions();

    // Set grid bounds for collision detection
    this.updateGridBounds();
  }

  /**
   * Optimize grid dimensions based on content
   */
  optimizeGridSize(availableWidth, availableHeight) {
    const totalCards = this.cardPairs.length;

    // Try different grid configurations to find the best fit
    const configurations = this.calculateGridConfigurations(totalCards);

    let bestConfig = configurations[0];
    let bestScore = this.evaluateGridConfiguration(bestConfig, availableWidth, availableHeight);

    for (let i = 1; i < configurations.length; i++) {
      const score = this.evaluateGridConfiguration(configurations[i], availableWidth, availableHeight);
      if (score > bestScore) {
        bestScore = score;
        bestConfig = configurations[i];
      }
    }

    this.gridRows = bestConfig.rows;
    this.gridCols = bestConfig.cols;
  }

  /**
   * Calculate possible grid configurations for a given number of cards
   */
  calculateGridConfigurations(totalCards) {
    const configurations = [];

    // Generate possible row/column combinations
    for (let rows = 2; rows <= Math.ceil(Math.sqrt(totalCards)); rows++) {
      for (let cols = 2; cols <= Math.ceil(totalCards / rows); cols++) {
        if (rows * cols >= totalCards) {
          configurations.push({ rows, cols, total: rows * cols });
        }
      }
    }

    // Sort by how closely the configuration matches the card count
    return configurations.sort((a, b) => {
      const aWaste = a.total - totalCards;
      const bWaste = b.total - totalCards;
      return aWaste - bWaste;
    });
  }

  /**
   * Evaluate how well a grid configuration fits the available space
   */
  evaluateGridConfiguration(config, availableWidth, availableHeight) {
    const { rows, cols } = config;

    // Calculate required space
    const minCardSize = this.minCardSize;
    const spacing = this.cardSpacing;

    const requiredWidth = (cols * minCardSize) + ((cols - 1) * spacing);
    const requiredHeight = (rows * minCardSize) + ((rows - 1) * spacing);

    // Check if it fits
    if (requiredWidth > availableWidth || requiredHeight > availableHeight) {
      return 0; // Doesn't fit
    }

    // Calculate how much space is used vs available
    const widthUtilization = requiredWidth / availableWidth;
    const heightUtilization = requiredHeight / availableHeight;
    const utilization = Math.min(widthUtilization, heightUtilization);

    // Prefer configurations that use space efficiently
    const efficiency = 1 - Math.abs(widthUtilization - heightUtilization);

    // Prefer square-like grids
    const aspectRatio = Math.max(rows / cols, cols / rows);
    const squareness = 1 / aspectRatio;

    return utilization * 0.5 + efficiency * 0.3 + squareness * 0.2;
  }

  /**
   * Calculate optimal card size and spacing for the current grid
   */
  calculateOptimalLayout(availableWidth, availableHeight) {
    const { gridRows, gridCols } = this;

    // Calculate maximum possible card size
    const maxWidthPerCard = (availableWidth - ((gridCols - 1) * this.cardSpacing)) / gridCols;
    const maxHeightPerCard = (availableHeight - ((gridRows - 1) * this.cardSpacing)) / gridRows;

    const optimalSize = Math.min(maxWidthPerCard, maxHeightPerCard, this.maxCardSize);

    // Ensure minimum size
    this.cardSize = Math.max(optimalSize, this.minCardSize);

    // Adjust spacing proportionally
    const totalWidth = (gridCols * this.cardSize) + ((gridCols - 1) * this.cardSpacing);
    const totalHeight = (gridRows * this.cardSize) + ((gridRows - 1) * this.cardSpacing);

    // Center the grid
    this.gridStartX = this.gridPadding + (availableWidth - totalWidth) / 2;
    this.gridStartY = this.gridPadding + 60 + (availableHeight - totalHeight) / 2; // Account for UI
  }

  /**
   * Generate grid positions based on layout type
   */
  generateGridPositions() {
    const positions = [];

    switch (this.gridLayout) {
      case 'rectangular':
        positions.push(...this.generateRectangularGrid());
        break;
      case 'hexagonal':
        positions.push(...this.generateHexagonalGrid());
        break;
      case 'circular':
        positions.push(...this.generateCircularGrid());
        break;
      case 'spiral':
        positions.push(...this.generateSpiralGrid());
        break;
      default:
        positions.push(...this.generateRectangularGrid());
    }

    return positions;
  }

  /**
   * Generate positions for a rectangular grid
   */
  generateRectangularGrid() {
    const positions = [];

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const x = this.gridStartX + (col * (this.cardSize + this.cardSpacing)) + this.cardSize / 2;
        const y = this.gridStartY + (row * (this.cardSize + this.cardSpacing)) + this.cardSize / 2;

        positions.push({ x, y, row, col });
      }
    }

    return positions;
  }

  /**
   * Generate positions for a hexagonal grid (offset rows)
   */
  generateHexagonalGrid() {
    const positions = [];
    const hexOffset = this.cardSize * 0.25; // Horizontal offset for hex pattern

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        let x = this.gridStartX + (col * (this.cardSize + this.cardSpacing)) + this.cardSize / 2;
        const y = this.gridStartY + (row * (this.cardSize * 0.75 + this.cardSpacing)) + this.cardSize / 2;

        // Offset every other row
        if (row % 2 === 1) {
          x += hexOffset;
        }

        positions.push({ x, y, row, col });
      }
    }

    return positions;
  }

  /**
   * Generate positions in a circular pattern
   */
  generateCircularGrid() {
    const positions = [];
    const centerX = this.gridStartX + (this.gridCols * (this.cardSize + this.cardSpacing)) / 2;
    const centerY = this.gridStartY + (this.gridRows * (this.cardSize + this.cardSpacing)) / 2;
    const maxRadius = Math.min(
      (this.gridCols * (this.cardSize + this.cardSpacing)) / 2,
      (this.gridRows * (this.cardSize + this.cardSpacing)) / 2
    ) * 0.8;

    const totalCards = this.gridRows * this.gridCols;

    for (let i = 0; i < totalCards; i++) {
      const angle = (i / totalCards) * Math.PI * 2;
      const radius = maxRadius * (0.3 + 0.7 * (i / totalCards)); // Spiral outward

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      positions.push({ x, y, index: i });
    }

    return positions;
  }

  /**
   * Generate positions in a spiral pattern
   */
  generateSpiralGrid() {
    const positions = [];
    const centerX = this.gridStartX + (this.gridCols * (this.cardSize + this.cardSpacing)) / 2;
    const centerY = this.gridStartY + (this.gridRows * (this.cardSize + this.cardSpacing)) / 2;

    // Simple spiral algorithm
    let angle = 0;
    let radius = 0;
    const angleStep = Math.PI / 8;
    const radiusStep = (this.cardSize + this.cardSpacing) / 4;

    for (let i = 0; i < this.gridRows * this.gridCols; i++) {
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      positions.push({ x, y, index: i });

      angle += angleStep;
      radius += radiusStep;
    }

    return positions;
  }

  /**
   * Update grid bounds for collision detection and layout
   */
  updateGridBounds() {
    if (this.gridPositions.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    this.gridPositions.forEach(pos => {
      minX = Math.min(minX, pos.x - this.cardSize / 2);
      maxX = Math.max(maxX, pos.x + this.cardSize / 2);
      minY = Math.min(minY, pos.y - this.cardSize / 2);
      maxY = Math.max(maxY, pos.y + this.cardSize / 2);
    });

    this.gridBounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }

  /**
   * Shuffle cards and position them in the grid
   */
  shuffleAndPositionCards() {
    // Shuffle the card pairs
    this.shuffleArray(this.cardPairs);

    // Clear existing cards
    this.cards.forEach(card => card.destroy());
    this.cards = [];

    // Create cards in grid positions
    this.cardPairs.forEach((cardValue, index) => {
      let x, y;

      if (this.gridPositions && this.gridPositions[index]) {
        // Use pre-calculated grid positions
        const pos = this.gridPositions[index];
        x = pos.x;
        y = pos.y;
      } else {
        // Fallback to rectangular calculation
        const row = Math.floor(index / this.gridCols);
        const col = index % this.gridCols;
        x = this.gridStartX + (col * (this.cardSize + this.cardSpacing)) + this.cardSize / 2;
        y = this.gridStartY + (row * (this.cardSize + this.cardSpacing)) + this.cardSize / 2;
      }

      const card = this.createCard(x, y, cardValue, index);
      this.cards.push(card);
    });
  }

  /**
   * Create a single card
   * Override in subclasses for custom card appearance
   */
  createCard(x, y, value, index) {
    // Create SVG icon content for the card front
    const iconContent = {
      texture: value.replace('.svg', ''),
      scale: (this.cardSize * 0.6) / 100 // Scale to 60% of card size
    };

    const card = new Card(this, {
      x: x,
      y: y,
      width: this.cardSize,
      height: this.cardSize,
      value: value,
      content: iconContent,
      backColor: 0x0062FF, // River Blue - Egyptian card back
      frontColor: 0xFFFFFF, // Pure White - card front
      flipDuration: this.flipDuration
    });

    // Set up card event listeners
    card.on('cardClicked', (clickedCard) => {
      this.onCardClicked(clickedCard);
    });

    card.on('flipComplete', (flippedCard, isFlipped) => {
      this.onCardFlipComplete(flippedCard, isFlipped);
    });

    return card;
  }

  /**
   * Handle card click
   */
  onCardClicked(card) {
    if (!this.canFlip || card.isFlipped || card.isMatched || !this.gameStarted || this.gameCompleted) {
      return;
    }

    card.flip(true); // Flip to show front
    this.flippedCards.push(card);

    // Check for matches when 2 cards are flipped
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkForMatch();
    }
  }

  /**
   * Flip a card with animation (legacy method for compatibility)
   */
  flipCard(card, showFront = true) {
    card.flip(showFront);
  }

  /**
   * Handle card flip completion
   */
  onCardFlipComplete(card, isFlipped) {
    this.canFlip = true;

    // If flipping back to hide, remove from flipped cards
    if (!isFlipped && this.flippedCards.includes(card)) {
      const index = this.flippedCards.indexOf(card);
      if (index > -1) {
        this.flippedCards.splice(index, 1);
      }
    }
  }

  /**
   * Check if the two flipped cards match
   */
  checkForMatch() {
    const [card1, card2] = this.flippedCards;

    // Use configurable matching logic
    const matchRule = this.matchRules[this.matchType];
    const isMatch = matchRule ? matchRule(card1, card2) : (card1.value === card2.value);

    if (isMatch) {
      // Match found!
      this.onMatchFound(card1, card2);
    } else {
      // No match - handle mismatch
      this.onMatchFailed(card1, card2);
    }
  }

  /**
   * Handle failed match attempt
   */
  onMatchFailed(card1, card2) {
    // Reset streak on failed match
    this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
    this.currentStreak = 0;

    // Shake cards to indicate error (with sound sync)
    card1.shake();
    card2.shake();

    // Play error sound (uh-oh sound for toddlers)
    if (this.game.audioManager) {
      this.game.audioManager.playSound('error');
    }

    // Show appropriate error message based on match type
    const errorMessages = {
      exact: 'No match! Try again!',
      sound: 'Those sounds don\'t match! Try again!',
      color: 'Those colors don\'t match! Try again!',
      shape: 'Those shapes don\'t match! Try again!',
      category: 'Those don\'t belong together! Try again!'
    };

    const message = errorMessages[this.matchType] || 'No match! Try again!';
    if (this.uiManager) {
      this.uiManager.showNotification(message, 'error', 2000);
    }

    // Flip cards back after delay
    this.time.delayedCall(this.flipDelay, () => {
      card1.flip(false);
      card2.flip(false);
      this.flippedCards = [];
    });
  }

  /**
   * Handle successful match
   */
  onMatchFound(card1, card2) {
    card1.setMatched(true);
    card2.setMatched(true);
    this.matchedPairs++;
    this.flippedCards = [];

    // Update score
    this.addScore(10);

    // Check if game is complete
    if (this.matchedPairs === this.totalPairs) {
      this.onGameComplete();
    }

    this.updateUI();
  }


  /**
   * Handle game completion
   */
  onGameComplete() {
    this.gameCompleted = true;

    // Calculate final score with bonus for efficiency
    const efficiencyBonus = Math.max(0, (this.totalPairs * 2 - this.moves) * 5);
    this.addScore(efficiencyBonus);

    // Show completion message
    this.showCompletionMessage();

    // Play completion sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('success');
    }
  }

  /**
   * Show completion message
   */
  showCompletionMessage() {
    const { width, height } = this.scale;

    // Clear game state
    this.flippedCards = [];
    this.canFlip = false; // Prevent further interactions

    // Play celebration sound
    if (this.audioManager) {
      this.audioManager.playSound('success');
    }

    // Full-screen overlay (semi-transparent River Blue)
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x0062FF, 0.5);
    overlay.setDepth(100);

    // The "Certificate" Card - Large white sticker
    const cardWidth = 600;
    const cardHeight = 450;
    const cardX = width / 2;
    const cardY = height / 2;

    // Card shadow (deeper for 3D effect)
    const cardShadow = this.add.rectangle(cardX + 6, cardY + 6, cardWidth, cardHeight, 0x000000, 0.4);
    cardShadow.setDepth(101);

    // Main card background (white with thick Ink Black border)
    const cardBg = this.add.rectangle(cardX, cardY, cardWidth, cardHeight, 0xFFFFFF, 1);
    cardBg.setStrokeStyle(8, 0x101012); // Very thick border
    cardBg.setDepth(102);

    // Animate card entrance (scale from 0 to 1.1 then settle at 1.0)
    cardBg.setScale(0);
    cardShadow.setScale(0);

    this.tweens.add({
      targets: [cardBg, cardShadow],
      scale: 1.1,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: [cardBg, cardShadow],
          scale: 1.0,
          duration: 200,
          ease: 'Power2'
        });
      }
    });

    // Particle burst effect
    this.createParticleBurst(cardX, cardY);

    // "GREAT JOB!" Header (Fredoka One, Aloe Green)
    const headerText = this.add.text(cardX, cardY - 180, 'GREAT JOB!', {
      fontSize: '48px',
      color: '#00B378', // Aloe Green
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(103);

    // Animate header entrance
    headerText.setAlpha(0);
    this.tweens.add({
      targets: headerText,
      alpha: 1,
      duration: 400,
      delay: 300,
      ease: 'Power2'
    });

    // Character peeking over the card (child.svg)
    const character = this.add.sprite(cardX + cardWidth / 2 - 50, cardY - cardHeight / 2 - 30, 'child.svg');
    character.setScale(0.6);
    character.setDepth(103);

    // Character "jumping" animation
    this.tweens.add({
      targets: character,
      y: character.y - 20,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Sticker Stats Badges
    this.createStatsBadges(cardX, cardY, cardWidth, cardHeight);

    // Massive Action Button (Bead Orange)
    this.createActionButton(cardX, cardY + cardHeight / 2 + 60);
  }

  /**
   * Create particle burst effect for celebration
   */
  createParticleBurst(centerX, centerY) {
    // Create particles radiating from center
    const particleCount = 20;
    const colors = [0xFACA2A, 0x0062FF, 0x00B378, 0xFD5E1A, 0xE32528]; // Lalela palette

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 200 + Math.random() * 100;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      // Create particle (small circle)
      const particle = this.add.circle(centerX, centerY, 8, colors[i % colors.length]);
      particle.setDepth(99);

      // Animate particle burst
      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        scale: 0,
        alpha: 0,
        duration: 1000 + Math.random() * 500,
        delay: Math.random() * 200,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Create circular sticker badges for stats
   */
  createStatsBadges(cardX, cardY, cardWidth, cardHeight) {
    const badgeRadius = 60;
    const badgeY = cardY - 50;

    // Score Badge (Lalela Yellow)
    const scoreBadge = this.add.circle(cardX - cardWidth / 4, badgeY, badgeRadius, 0xFACA2A);
    scoreBadge.setStrokeStyle(4, 0x101012);
    scoreBadge.setDepth(103);

    const scoreText = this.add.text(cardX - cardWidth / 4, badgeY - 15, 'SCORE', {
      fontSize: '16px',
      color: '#101012',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(104);

    const scoreValue = this.add.text(cardX - cardWidth / 4, badgeY + 10, this.score.toString(), {
      fontSize: '24px',
      color: '#101012',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(104);

    // Moves Badge (River Blue)
    const movesBadge = this.add.circle(cardX + cardWidth / 4, badgeY, badgeRadius, 0x0062FF);
    movesBadge.setStrokeStyle(4, 0xFFFFFF);
    movesBadge.setDepth(103);

    const movesText = this.add.text(cardX + cardWidth / 4, badgeY - 15, 'MOVES', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(104);

    const movesValue = this.add.text(cardX + cardWidth / 4, badgeY + 10, this.moves.toString(), {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(104);

    // Animate badges dropping in with bounce
    [scoreBadge, scoreText, scoreValue, movesBadge, movesText, movesValue].forEach((element, index) => {
      element.setAlpha(0);
      element.setY(element.y + 50);

      this.tweens.add({
        targets: element,
        alpha: 1,
        y: element.y - 50,
        duration: 500,
        delay: 800 + index * 100,
        ease: 'Back.easeOut'
      });
    });
  }

  /**
   * Create the massive action button
   */
  createActionButton(cardX, buttonY) {
    const buttonWidth = 200;
    const buttonHeight = 60;

    // Button shadow (3D effect)
    const buttonShadow = this.add.rectangle(cardX + 3, buttonY + 3, buttonWidth, buttonHeight, 0x000000, 0.5);
    buttonShadow.setDepth(103);

    // Main button (Bead Orange)
    const button = this.add.rectangle(cardX, buttonY, buttonWidth, buttonHeight, 0xFD5E1A, 1);
    button.setStrokeStyle(4, 0x101012);
    button.setInteractive();
    button.setDepth(104);

    // Button text
    const buttonText = this.add.text(cardX, buttonY, 'PLAY AGAIN', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(105);

    // Gentle pulse animation
    this.tweens.add({
      targets: [button, buttonShadow],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Button interactions
    button.on('pointerover', () => {
      this.tweens.killTweensOf([button, buttonShadow]);
      this.tweens.add({
        targets: [button, buttonShadow],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: [button, buttonShadow],
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    button.on('pointerdown', () => {
      // Comprehensive cleanup of ALL celebration elements
      this.children.each(child => {
        child.destroy();
      });

      // Kill any remaining tweens to prevent conflicts
      if (this.tweens) {
        this.tweens.killAll();
      }

      // Reset game state
      this.gameState = 'ready';
      this.canFlip = true;

      // Use a timeout to ensure all destruction is complete before recreation
      this.time.delayedCall(100, () => {
        // Recreate the essential UI elements
        const { width, height } = this.game.config;
        this.createUI();

        // Restart the game
        this.restartGame();
      });
    });
  }

  /**
   * Update UI elements
   */
  updateUI() {
    // Safely update score text
    if (this.scoreText && typeof this.scoreText.setText === 'function') {
      this.scoreText.setText(`Score: ${this.score}`);
    }

    // Safely update moves text
    if (this.movesText && typeof this.movesText.setText === 'function') {
      this.movesText.setText(`Moves: ${this.moves}`);
    }

    // Safely update level text
    if (this.levelText && typeof this.levelText.setText === 'function') {
      this.levelText.setText(`Level: ${this.level}`);
    }

    // Safely update streak text
    if (this.streakText && typeof this.streakText.setText === 'function' && typeof this.streakText.setColor === 'function' && typeof this.currentStreak === 'number') {
      this.streakText.setText(`Streak: ${this.currentStreak}`);
      // Change color based on streak length
      if (this.currentStreak >= 5) {
        this.streakText.setColor('#27ae60'); // Green for good streaks
      } else if (this.currentStreak >= 3) {
        this.streakText.setColor('#f39c12'); // Orange for decent streaks
      } else {
        this.streakText.setColor('#e74c3c'); // Red for low streaks
      }
    }

    // Safely update hint button
    if (this.hintButton && typeof this.hintButton.setText === 'function') {
      this.hintButton.setText(`Hints: ${this.maxHints - this.hintsUsed}`);
      // Disable hint button if no hints left
      if (this.hintsUsed >= this.maxHints) {
        this.hintButton.setAlpha(0.5);
        this.hintButton.disableInteractive();
      }
    }
  }

  /**
   * Use a hint to reveal a card pair
   */
  useHint() {
    if (this.hintsUsed >= this.maxHints) {
      if (this.uiManager) {
        this.uiManager.showNotification('No hints remaining!', 'warning', 2000);
      }
      return;
    }

    // Find an unmatched pair
    const unmatchedCards = this.cards.filter(card => !card.isMatched);
    if (unmatchedCards.length < 2) return;

    // Find cards with the same value
    const valueGroups = {};
    unmatchedCards.forEach(card => {
      if (!valueGroups[card.value]) {
        valueGroups[card.value] = [];
      }
      valueGroups[card.value].push(card);
    });

    // Find a group with exactly 2 cards (a complete pair)
    const pairValues = Object.keys(valueGroups).filter(value => valueGroups[value].length === 2);
    if (pairValues.length === 0) return;

    // Pick a random pair
    const randomValue = pairValues[Math.floor(Math.random() * pairValues.length)];
    const [card1, card2] = valueGroups[randomValue];

    // Temporarily reveal the pair
    this.hintsUsed++;

    // Pulse animation to highlight the hint
    card1.pulse();
    card2.pulse();

    if (this.uiManager) {
      this.uiManager.showNotification('Hint: These cards match!', 'info', 3000);
    }

    // Play hint sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('click');
    }

    this.updateUI();
  }

  /**
   * Handle pointer down events
   */
  onPointerDown(pointer) {
    // Override in subclasses if needed
  }

  /**
   * Add to score with optional sound
   */
  addScore(points) {
    this.score += points;

    // Visual feedback for score increase
    if (this.scoreText) {
      this.tweens.add({
        targets: this.scoreText,
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }

  /**
   * Shuffle array utility
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Restart the current level
   */
  restartGame() {
    // Reset game state
    this.gameStarted = false;
    this.gameCompleted = false;

    // Clear existing elements
    this.cards.forEach(card => card.destroy());
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 0;
    this.currentStreak = 0;
    this.hintsUsed = 0;

    // Clear completion UI if present (safely check if elements still exist)
    this.children.each(child => {
      if (child.type === 'Text' &&
          child !== this.scoreText &&
          child !== this.movesText &&
          child !== this.levelText &&
          child !== this.instructionText) {
        child.destroy();
      }
    });

    // Reinitialize
    this.initializeGame();
  }

  /**
   * Comparison methods for different match types
   */
  compareSound(value1, value2) {
    // Override in subclasses for sound-based matching
    // Default to exact match
    return value1 === value2;
  }

  compareColor(value1, value2) {
    // Override in subclasses for color-based matching
    // Default to exact match
    return value1 === value2;
  }

  compareShape(value1, value2) {
    // Override in subclasses for shape-based matching
    // Default to exact match
    return value1 === value2;
  }

  compareCategory(value1, value2) {
    // Override in subclasses for category-based matching
    // Default to exact match
    return value1 === value2;
  }

  /**
   * Set the match type for this game
   */
  setMatchType(matchType) {
    if (this.matchRules[matchType]) {
      this.matchType = matchType;
    } else {
      console.warn(`Unknown match type: ${matchType}. Using 'exact' instead.`);
      this.matchType = 'exact';
    }
  }

  /**
   * Advanced scoring system based on match difficulty and speed
   */
  calculateMatchScore(card1, card2, timeElapsed = 0) {
    let baseScore = 10;

    // Bonus points for different match types
    const typeMultipliers = {
      exact: 1,
      sound: 1.5,
      color: 1.2,
      shape: 1.3,
      category: 1.4
    };

    baseScore *= typeMultipliers[this.matchType] || 1;

    // Speed bonus (faster matches get more points)
    if (timeElapsed > 0 && timeElapsed < 2000) {
      baseScore *= 1.5; // Bonus for quick matches
    }

    // Difficulty bonus based on level
    const levelBonus = 1 + (this.level * 0.1);
    baseScore *= levelBonus;

    return Math.round(baseScore);
  }

  /**
   * Get match feedback message based on match type
   */
  getMatchFeedbackMessage(card1, card2) {
    const feedbackMessages = {
      exact: 'Perfect match!',
      sound: 'Great sound match!',
      color: 'Beautiful color match!',
      shape: 'Excellent shape match!',
      category: 'Perfect category match!'
    };

    return feedbackMessages[this.matchType] || 'Great match!';
  }

  /**
   * Enhanced match found handler with advanced scoring
   */
  onMatchFound(card1, card2) {
    // Update streak
    this.currentStreak++;
    this.longestStreak = Math.max(this.longestStreak, this.currentStreak);

    // Calculate score with bonuses (including streak bonus)
    const matchScore = this.calculateMatchScore(card1, card2);
    const streakBonus = Math.floor(this.currentStreak / 3) * 5; // Bonus every 3 matches
    this.addScore(matchScore + streakBonus);

    // Pulse animation for matched cards (3 times as requested)
    const pulseCards = (card, count = 0) => {
      if (count < 3) {
        this.time.delayedCall(count * 200, () => {
          card.pulse();
          pulseCards(card, count + 1);
        });
      }
    };

    pulseCards(card1);
    pulseCards(card2);

    // Mark cards as matched with longer delay to show all pulses
    this.time.delayedCall(800, () => {
      card1.setMatched(true);
      card2.setMatched(true);
    });

    // Update game state
    this.matchedPairs++;
    this.flippedCards = [];

    // Show success feedback
    let feedbackMessage = this.getMatchFeedbackMessage(card1, card2);
    if (this.currentStreak > 1) {
      feedbackMessage += ` (${this.currentStreak} in a row!)`;
    }

    if (this.uiManager) {
      this.uiManager.showNotification(feedbackMessage, 'success', 1500);
    }

    // Play success sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('success');
    }

    // Check if game is complete
    if (this.matchedPairs === this.totalPairs) {
      this.onGameComplete();
    }

    this.updateUI();
  }

  /**
   * Set the grid layout type
   */
  setGridLayout(layoutType) {
    const validLayouts = ['rectangular', 'hexagonal', 'circular', 'spiral'];
    if (validLayouts.includes(layoutType)) {
      this.gridLayout = layoutType;

      // Recreate grid if game is running
      if (this.gameStarted && !this.gameCompleted) {
        this.createCardGrid();
        this.shuffleAndPositionCards();
      }
    } else {
      console.warn(`Invalid grid layout: ${layoutType}. Valid options:`, validLayouts);
    }
  }

  /**
   * Set grid dimensions manually
   */
  setGridDimensions(rows, cols) {
    this.gridRows = Math.max(2, rows);
    this.gridCols = Math.max(2, cols);

    // Recreate grid if game is running
    if (this.gameStarted && !this.gameCompleted) {
      this.createCardGrid();
      this.shuffleAndPositionCards();
    }
  }

  /**
   * Enable or disable auto-resize grid
   */
  setAutoResizeGrid(enabled) {
    this.autoResizeGrid = enabled;

    // Recreate grid if game is running
    if (this.gameStarted && !this.gameCompleted) {
      this.createCardGrid();
      this.shuffleAndPositionCards();
    }
  }

  /**
   * Set card size constraints
   */
  setCardSizeConstraints(minSize, maxSize) {
    this.minCardSize = Math.max(40, minSize);
    this.maxCardSize = Math.min(200, maxSize);
    this.cardSize = Math.max(this.minCardSize, Math.min(this.maxCardSize, this.cardSize));

    // Recreate grid if game is running
    if (this.gameStarted && !this.gameCompleted) {
      this.createCardGrid();
      this.shuffleAndPositionCards();
    }
  }

  /**
   * Get grid layout information
   */
  getGridInfo() {
    return {
      layout: this.gridLayout,
      rows: this.gridRows,
      cols: this.gridCols,
      cardSize: this.cardSize,
      cardSpacing: this.cardSpacing,
      autoResize: this.autoResizeGrid,
      bounds: this.gridBounds,
      positions: this.gridPositions?.length || 0
    };
  }

  /**
   * Animate cards to new positions (for layout changes)
   */
  animateCardsToPositions(newPositions, duration = 500) {
    if (!newPositions || newPositions.length !== this.cards.length) {
      console.warn('Invalid positions array for card animation');
      return;
    }

    this.cards.forEach((card, index) => {
      const newPos = newPositions[index];
      if (newPos) {
        this.tweens.add({
          targets: card,
          x: newPos.x,
          y: newPos.y,
          duration: duration,
          ease: 'Power2'
        });
      }
    });
  }

  /**
   * Validate that the current grid configuration can accommodate all cards
   */
  validateGridConfiguration() {
    const totalGridCells = this.gridRows * this.gridCols;
    const totalCardsNeeded = this.cardPairs.length;

    if (totalGridCells < totalCardsNeeded) {
      console.warn(`Grid too small: ${totalGridCells} cells for ${totalCardsNeeded} cards`);
      return false;
    }

    if (totalGridCells > totalCardsNeeded * 2) {
      console.warn(`Grid too large: ${totalGridCells} cells for ${totalCardsNeeded} cards`);
      return false;
    }

    return true;
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      moves: this.moves,
      matchedPairs: this.matchedPairs,
      totalPairs: this.totalPairs,
      gameCompleted: this.gameCompleted,
      matchType: this.matchType,
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak,
      hintsUsed: this.hintsUsed,
      hintsRemaining: this.maxHints - this.hintsUsed,
      gridLayout: this.gridLayout,
      gridDimensions: `${this.gridRows}x${this.gridCols}`,
      cardSize: this.cardSize,
      efficiency: this.totalPairs > 0 ? (this.matchedPairs / this.totalPairs) * 100 : 0,
      averageScorePerMatch: this.matchedPairs > 0 ? Math.round(this.score / this.matchedPairs) : 0
    };
  }
}