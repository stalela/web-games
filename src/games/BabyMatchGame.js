/**
 * BabyMatchGame - Drag and drop matching game for young children
 * Based on GCompris babymatch activity - drag items from sidebar to match with targets
 */
import { LalelaGame } from '../utils/LalelaGame.js';

export class BabyMatchGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'reading',
      difficulty: 1,
      ...config
    });

    // Game state
    this.currentLevel = 1;
    this.maxLevels = 7;
    this.currentSubLevel = 0;
    this.matchedCount = 0;
    this.totalMatches = 0;

    // UI elements
    this.sidebarItems = [];
    this.dropZones = [];
    this.backgroundItems = [];
    this.draggedItem = null;

    // Level data - matching pairs (sidebar item -> target position)
    this.levels = this.loadLevelData();
  }

  /**
   * Load level data for all levels
   */
  loadLevelData() {
    return [
      // Level 1: Simple household items
      {
        instruction: "Drag and drop the items to match them.",
        pairs: [
          { sidebar: 'lamp', target: 'light', label: 'Lamp' },
          { sidebar: 'mailbox', target: 'postcard', label: 'Mail' },
          { sidebar: 'sailingboat', target: 'fishingboat', label: 'Boat' }
        ]
      },
      // Level 2: Animals
      {
        instruction: "Match the animals with their homes.",
        pairs: [
          { sidebar: 'bird', target: 'nest', label: 'Bird' },
          { sidebar: 'fish', target: 'fishbowl', label: 'Fish' },
          { sidebar: 'dog', target: 'doghouse', label: 'Dog' }
        ]
      },
      // Level 3: Food
      {
        instruction: "Match the foods with their containers.",
        pairs: [
          { sidebar: 'apple', target: 'basket', label: 'Apple' },
          { sidebar: 'milk', target: 'bottle', label: 'Milk' },
          { sidebar: 'bread', target: 'plate', label: 'Bread' }
        ]
      },
      // Level 4: Vehicles
      {
        instruction: "Match the vehicles.",
        pairs: [
          { sidebar: 'car', target: 'garage', label: 'Car' },
          { sidebar: 'plane', target: 'airport', label: 'Plane' },
          { sidebar: 'train', target: 'station', label: 'Train' },
          { sidebar: 'ship', target: 'harbor', label: 'Ship' }
        ]
      },
      // Level 5: Colors and shapes
      {
        instruction: "Match the colored shapes.",
        pairs: [
          { sidebar: 'red_circle', target: 'circle_outline', label: 'Circle', color: 0xE32528 },
          { sidebar: 'blue_square', target: 'square_outline', label: 'Square', color: 0x0062FF },
          { sidebar: 'green_triangle', target: 'triangle_outline', label: 'Triangle', color: 0x00B378 },
          { sidebar: 'yellow_star', target: 'star_outline', label: 'Star', color: 0xFACA2A }
        ]
      },
      // Level 6: Numbers
      {
        instruction: "Match the numbers with the quantities.",
        pairs: [
          { sidebar: 'one', target: 'one_dot', label: '1' },
          { sidebar: 'two', target: 'two_dots', label: '2' },
          { sidebar: 'three', target: 'three_dots', label: '3' },
          { sidebar: 'four', target: 'four_dots', label: '4' }
        ]
      },
      // Level 7: Letters
      {
        instruction: "Match the uppercase and lowercase letters.",
        pairs: [
          { sidebar: 'A', target: 'a', label: 'A' },
          { sidebar: 'B', target: 'b', label: 'B' },
          { sidebar: 'C', target: 'c', label: 'C' },
          { sidebar: 'D', target: 'd', label: 'D' }
        ]
      }
    ];
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load wood background
    this.load.svg('background-wood', 'assets/game-icons/background-wood.svg');

    // Load navigation icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach(icon => {
      this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  /**
   * Create background - GCompris wood texture
   */
  createBackground() {
    const { width, height } = this.scale;

    // Main wood background
    try {
      this.background = this.add.image(width / 2, height / 2, 'background-wood');
      this.background.setDisplaySize(width, height);
      this.background.setDepth(-2);
    } catch (e) {
      // Fallback to solid color
      this.add.rectangle(width / 2, height / 2, width, height, 0x8B4513).setDepth(-2);
    }
  }

  /**
   * Create game UI elements
   */
  createUI() {
    const { width, height } = this.scale;

    // Create sidebar
    this.createSidebar();

    // Create instruction panel at top
    this.createInstructionPanel();

    // Create navigation bar
    this.createGComprisNavBar(width, height);

    // Create progress indicator
    this.createProgressIndicator();
  }

  /**
   * Create left sidebar with draggable items
   */
  createSidebar() {
    const { width, height } = this.scale;
    const sidebarWidth = 90;

    // Sidebar background - darker wood panel
    this.sidebarBg = this.add.rectangle(sidebarWidth / 2, height / 2, sidebarWidth, height, 0x5D4037);
    this.sidebarBg.setDepth(5);

    // Sidebar border
    const sidebarBorder = this.add.graphics();
    sidebarBorder.lineStyle(3, 0x3E2723);
    sidebarBorder.strokeRect(0, 0, sidebarWidth, height);
    sidebarBorder.setDepth(6);
  }

  /**
   * Create instruction panel at top
   */
  createInstructionPanel() {
    const { width, height } = this.scale;
    const sidebarWidth = 90;
    const panelWidth = width - sidebarWidth - 40;

    // Panel container
    this.instructionPanel = this.add.container(sidebarWidth + panelWidth / 2 + 20, 40);
    this.instructionPanel.setDepth(50);

    // Panel background - light blue/white rounded rectangle
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xE3F2FD, 0.95);
    panelBg.fillRoundedRect(-panelWidth / 2, -25, panelWidth, 50, 10);
    panelBg.lineStyle(3, 0x42A5F5);
    panelBg.strokeRoundedRect(-panelWidth / 2, -25, panelWidth, 50, 10);

    // Instruction text
    this.instructionText = this.add.text(0, 0, 'Drag and drop the items to match them.', {
      fontSize: '22px',
      color: '#1565C0',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    this.instructionPanel.add([panelBg, this.instructionText]);
  }

  /**
   * Create progress indicator
   */
  createProgressIndicator() {
    const { width, height } = this.scale;

    // Progress badge - bottom right area
    this.progressContainer = this.add.container(width - 60, height - 140);
    this.progressContainer.setDepth(50);

    // Badge background
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0xF57C00);
    badgeBg.fillRoundedRect(-40, -20, 80, 40, 8);
    badgeBg.lineStyle(2, 0xFFFFFF);
    badgeBg.strokeRoundedRect(-40, -20, 80, 40, 8);

    // Progress text
    this.progressText = this.add.text(0, 0, '0/3', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    this.progressContainer.add([badgeBg, this.progressText]);
  }

  /**
   * Create GCompris-style navigation bar
   */
  createGComprisNavBar(width, height) {
    const navY = height - 60;
    const buttonSize = 70;
    const spacing = 85;
    const startX = 50;

    // Navigation container
    this.navContainer = this.add.container(0, 0);
    this.navContainer.setDepth(100);

    // Config/Menu button (hamburger)
    this.createNavButton(startX, navY, 'menu', 0x5D4037, '☰', () => this.showMenu());

    // Help button (green with ?)
    this.createNavButton(startX + spacing, navY, 'help', 0x4CAF50, '?', () => this.showHelp());

    // Home button (cyan with house)
    this.createNavButton(startX + spacing * 2, navY, 'home', 0x4FC3F7, '⌂', () => this.goHome());

    // Previous level (orange <)
    this.createNavButton(startX + spacing * 3, navY, 'prev', 0xF57C00, '❮', () => this.previousLevel());

    // Level number display
    this.levelText = this.add.text(startX + spacing * 4, navY, '1', {
      fontSize: '32px',
      color: '#5D4037',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101);

    // Next level (orange >)
    this.createNavButton(startX + spacing * 5, navY, 'next', 0xF57C00, '❯', () => this.nextLevel());

    // Sublevel indicator (purple bar)
    this.createSubLevelIndicator(startX + spacing * 6 + 20, navY);
  }

  /**
   * Create a navigation button
   */
  createNavButton(x, y, id, color, symbol, callback) {
    const buttonSize = 60;

    // Button shadow
    const shadow = this.add.circle(x + 3, y + 3, buttonSize / 2, 0x000000, 0.3);
    shadow.setDepth(99);
    this.navContainer.add(shadow);

    // Button circle
    const button = this.add.circle(x, y, buttonSize / 2, color);
    button.setStrokeStyle(3, 0xFFFFFF);
    button.setInteractive({ useHandCursor: true });
    button.setDepth(100);
    this.navContainer.add(button);

    // Button icon
    const icon = this.add.text(x, y, symbol, {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101);
    this.navContainer.add(icon);

    // Click handler
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: [button, icon],
        scale: 0.9,
        duration: 100,
        yoyo: true
      });
      callback();
    });

    return { button, icon };
  }

  /**
   * Create sublevel indicator
   */
  createSubLevelIndicator(x, y) {
    this.subLevelDots = this.add.graphics();
    this.subLevelDots.setDepth(101);
    this.updateSubLevelIndicator();
  }

  /**
   * Update sublevel dots
   */
  updateSubLevelIndicator() {
    if (!this.subLevelDots) return;

    this.subLevelDots.clear();
    // Draw a simple line for now
    this.subLevelDots.lineStyle(4, 0x5D4037);
    this.subLevelDots.lineBetween(450, this.scale.height - 60, 480, this.scale.height - 60);
  }

  /**
   * Setup game logic - create game elements
   */
  setupGameLogic() {
    this.startLevel(this.currentLevel);
  }

  /**
   * Start a level
   */
  startLevel(level) {
    this.currentLevel = level;
    this.matchedCount = 0;

    // Clear existing game elements
    this.clearGameElements();

    // Get level data
    const levelData = this.levels[level - 1] || this.levels[0];
    this.totalMatches = levelData.pairs.length;

    // Update instruction
    if (this.instructionText) {
      this.instructionText.setText(levelData.instruction);
    }

    // Update level display
    if (this.levelText) {
      this.levelText.setText(level.toString());
    }

    // Create sidebar items and drop zones
    this.createLevelItems(levelData);

    // Update progress
    this.updateProgressDisplay();
  }

  /**
   * Clear existing game elements
   */
  clearGameElements() {
    // Destroy sidebar items
    this.sidebarItems.forEach(item => {
      if (item && item.destroy) item.destroy();
    });
    this.sidebarItems = [];

    // Destroy drop zones
    this.dropZones.forEach(zone => {
      if (zone && zone.destroy) zone.destroy();
    });
    this.dropZones = [];

    // Destroy background items
    this.backgroundItems.forEach(item => {
      if (item && item.destroy) item.destroy();
    });
    this.backgroundItems = [];
  }

  /**
   * Create level items (sidebar and drop zones)
   */
  createLevelItems(levelData) {
    const { width, height } = this.scale;
    const sidebarWidth = 90;
    const gameAreaWidth = width - sidebarWidth;
    const gameAreaX = sidebarWidth;

    // Calculate positions for drop zones
    const pairs = levelData.pairs;
    const numPairs = pairs.length;

    // Create drop zones and background images in main area
    pairs.forEach((pair, index) => {
      // Calculate position (spread across the game area)
      const col = index % 3;
      const row = Math.floor(index / 3);
      const xSpacing = gameAreaWidth / (Math.min(numPairs, 3) + 1);
      const x = gameAreaX + xSpacing * (col + 1);
      const y = 200 + row * 200;

      // Create background/target image (what we're matching TO)
      this.createBackgroundItem(x, y, pair, index);

      // Create drop zone (orange circle)
      this.createDropZone(x, y + 120, pair, index);
    });

    // Create sidebar items (what we drag FROM)
    const shuffledPairs = this.shuffleArray([...pairs]);
    shuffledPairs.forEach((pair, index) => {
      this.createSidebarItem(pair, index, pairs.length);
    });
  }

  /**
   * Create a background/target image
   */
  createBackgroundItem(x, y, pair, index) {
    const size = 100;

    if (pair.color) {
      // Create colored shape for shape-matching levels
      const graphics = this.add.graphics();
      graphics.fillStyle(pair.color, 0.3);
      graphics.lineStyle(3, pair.color);

      if (pair.target.includes('circle')) {
        graphics.strokeCircle(x, y, size / 2);
      } else if (pair.target.includes('square')) {
        graphics.strokeRect(x - size / 2, y - size / 2, size, size);
      } else if (pair.target.includes('triangle')) {
        graphics.strokeTriangle(x, y - size / 2, x - size / 2, y + size / 2, x + size / 2, y + size / 2);
      } else if (pair.target.includes('star')) {
        graphics.strokeCircle(x, y, size / 2);
      }
      graphics.setDepth(5);
      this.backgroundItems.push(graphics);
    } else {
      // Create a placeholder rectangle with label
      const placeholder = this.add.rectangle(x, y, size, size, 0xFFFFFF, 0.8);
      placeholder.setStrokeStyle(3, 0x888888);
      placeholder.setDepth(5);

      const label = this.add.text(x, y, pair.label || '?', {
        fontSize: '20px',
        color: '#333333',
        fontFamily: 'Fredoka One, cursive'
      }).setOrigin(0.5).setDepth(6);

      this.backgroundItems.push(placeholder);
      this.backgroundItems.push(label);
    }
  }

  /**
   * Create a drop zone (orange circle)
   */
  createDropZone(x, y, pair, index) {
    const radius = 12;

    // Orange drop circle
    const dropZone = this.add.circle(x, y, radius, 0xF57C00);
    dropZone.setStrokeStyle(2, 0xE65100);
    dropZone.setDepth(10);
    dropZone.pairData = pair;
    dropZone.matched = false;
    dropZone.originalX = x;
    dropZone.originalY = y;

    this.dropZones.push(dropZone);
  }

  /**
   * Create a draggable sidebar item
   */
  createSidebarItem(pair, index, total) {
    const sidebarWidth = 90;
    const itemSize = 60;
    const spacing = 80;
    const startY = 80;

    const x = sidebarWidth / 2;
    const y = startY + index * spacing;

    // Container for the sidebar item
    const container = this.add.container(x, y);
    container.setDepth(20);

    if (pair.color) {
      // Colored shape
      const graphics = this.add.graphics();
      graphics.fillStyle(pair.color);

      if (pair.sidebar.includes('circle')) {
        graphics.fillCircle(0, 0, itemSize / 2);
      } else if (pair.sidebar.includes('square')) {
        graphics.fillRect(-itemSize / 2, -itemSize / 2, itemSize, itemSize);
      } else if (pair.sidebar.includes('triangle')) {
        graphics.fillTriangle(0, -itemSize / 2, -itemSize / 2, itemSize / 2, itemSize / 2, itemSize / 2);
      } else if (pair.sidebar.includes('star')) {
        graphics.fillCircle(0, 0, itemSize / 2);
      }
      container.add(graphics);
    } else {
      // Colored rectangle with label
      const rect = this.add.rectangle(0, 0, itemSize, itemSize, 0xFACA2A);
      rect.setStrokeStyle(2, 0xF57C00);
      const label = this.add.text(0, 0, pair.label?.charAt(0) || '?', {
        fontSize: '28px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive'
      }).setOrigin(0.5);
      container.add([rect, label]);
    }

    // Store pair data
    container.pairData = pair;
    container.originalX = x;
    container.originalY = y;
    container.matched = false;

    // Make interactive
    container.setSize(itemSize, itemSize);
    container.setInteractive({ draggable: true, useHandCursor: true });

    // Drag events
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === container && !container.matched) {
        container.x = dragX;
        container.y = dragY;
        container.setDepth(100);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      if (gameObject === container && !container.matched) {
        this.handleDrop(container);
      }
    });

    this.sidebarItems.push(container);
  }

  /**
   * Handle dropping an item
   */
  handleDrop(item) {
    // Check if dropped on matching drop zone
    const matchingZone = this.dropZones.find(zone => {
      if (zone.matched) return false;

      const distance = Phaser.Math.Distance.Between(item.x, item.y, zone.x, zone.y);
      const isMatch = item.pairData.sidebar === zone.pairData.sidebar;

      return distance < 50 && isMatch;
    });

    if (matchingZone) {
      this.handleCorrectMatch(item, matchingZone);
    } else {
      this.handleIncorrectDrop(item);
    }
  }

  /**
   * Handle correct match
   */
  handleCorrectMatch(item, zone) {
    item.matched = true;
    zone.matched = true;
    this.matchedCount++;

    // Animate item to zone position
    this.tweens.add({
      targets: item,
      x: zone.x,
      y: zone.y,
      scale: 0.8,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Hide drop zone
    this.tweens.add({
      targets: zone,
      alpha: 0,
      duration: 200
    });

    // Disable dragging
    item.disableInteractive();
    item.setDepth(15);

    // Play success sound
    if (this.audioManager) {
      this.audioManager.playSound('success');
    }

    // Celebration effect
    this.createMatchCelebration(item.x, item.y);

    // Check for level completion
    if (this.matchedCount >= this.totalMatches) {
      this.time.delayedCall(500, () => this.onLevelComplete());
    }

    // Update progress
    this.updateProgressDisplay();
  }

  /**
   * Handle incorrect drop
   */
  handleIncorrectDrop(item) {
    // Animate back to original position
    this.tweens.add({
      targets: item,
      x: item.originalX,
      y: item.originalY,
      duration: 300,
      ease: 'Back.easeOut'
    });

    item.setDepth(20);
  }

  /**
   * Create celebration effect for correct match
   */
  createMatchCelebration(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const star = this.add.text(x, y, '✨', { fontSize: '20px' }).setOrigin(0.5).setDepth(200);

      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }
  }

  /**
   * Handle level completion
   */
  onLevelComplete() {
    const { width, height } = this.scale;

    const completeText = this.add.text(width / 2, height / 2, '🎉 Great Job! 🎉', {
      fontSize: '48px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(500);

    this.tweens.add({
      targets: completeText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: 2,
      ease: 'Bounce',
      onComplete: () => {
        completeText.destroy();
        if (this.currentLevel < this.maxLevels) {
          this.nextLevel();
        }
      }
    });

    if (this.audioManager) {
      this.audioManager.playSound('levelComplete');
    }
  }

  /**
   * Update progress display
   */
  updateProgressDisplay() {
    if (this.progressText) {
      this.progressText.setText(`${this.matchedCount}/${this.totalMatches}`);
    }
  }

  /**
   * Navigation handlers
   */
  previousLevel() {
    if (this.currentLevel > 1) {
      this.startLevel(this.currentLevel - 1);
    }
  }

  nextLevel() {
    if (this.currentLevel < this.maxLevels) {
      this.startLevel(this.currentLevel + 1);
    }
  }

  goHome() {
    this.scene.start('GameMenu');
  }

  showHelp() {
    if (this.helpSystem) {
      this.helpSystem.showHelpModal('BabyMatchGame');
    }
  }

  showMenu() {
    this.scene.start('GameMenu');
  }

  /**
   * Shuffle array helper
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
