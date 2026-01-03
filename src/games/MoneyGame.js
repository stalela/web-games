/**
 * MoneyGame - Base class for money counting games
 * Educational game teaching money counting and usage
 * Based on GCompris money activity
 * 
 * Game: Select coins/notes to pay for items in a store!
 * Extended by: MoneyGame (main), MoneyBackGame, MoneyCentsGame
 */
import { LalelaGame } from '../utils/LalelaGame.js';

export class MoneyGame extends LalelaGame {
  constructor(config) {
    super({
      ...config,
      category: 'mathematics',
      difficulty: 2
    });

    // Game mode configuration (set by subclass)
    this.centsMode = false;    // Include cents (0.01, 0.02, etc.)
    this.backMode = false;     // Give change mode (money_back)
    this.gameName = 'Money';
    
    // Money items definition (Euro currency)
    this.moneyItems = {
      // Cents
      c1c:   { img: 'c1c',   val: 0.01, type: 'coin', label: '1c' },
      c2c:   { img: 'c2c',   val: 0.02, type: 'coin', label: '2c' },
      c5c:   { img: 'c5c',   val: 0.05, type: 'coin', label: '5c' },
      c10c:  { img: 'c10c',  val: 0.10, type: 'coin', label: '10c' },
      c20c:  { img: 'c20c',  val: 0.20, type: 'coin', label: '20c' },
      c50c:  { img: 'c50c',  val: 0.50, type: 'coin', label: '50c' },
      // Euro coins
      c1e:   { img: 'c1e',   val: 1.00, type: 'coin', label: '€1' },
      c2e:   { img: 'c2e',   val: 2.00, type: 'coin', label: '€2' },
      // Euro notes
      n5e:   { img: 'n5e',   val: 5.00,   type: 'note', label: '€5' },
      n10e:  { img: 'n10e',  val: 10.00,  type: 'note', label: '€10' },
      n20e:  { img: 'n20e',  val: 20.00,  type: 'note', label: '€20' },
      n50e:  { img: 'n50e',  val: 50.00,  type: 'note', label: '€50' },
      n100e: { img: 'n100e', val: 100.00, type: 'note', label: '€100' },
      n200e: { img: 'n200e', val: 200.00, type: 'note', label: '€200' },
      n500e: { img: 'n500e', val: 500.00, type: 'note', label: '€500' }
    };

    // Store objects (items to buy)
    this.cheapObjects = ['🍎', '🍊', '🍌', '🍇', '🥕', '🌸', '🍰'];
    this.normalObjects = ['🪴', '✏️', '🍾', '💡', '🥚'];
    this.expensiveObjects = ['🪔', '🚐', '🚲'];
    
    // Game state
    this.currentLevel = 0;
    this.pocket = [];        // Available money
    this.answer = [];        // Money paid/given
    this.storeItems = [];    // Items in store with prices
    this.priceTotal = 0;     // Total price to pay
    this.tuxPaid = 0;        // Amount Tux paid (for back mode)
    
    // UI elements
    this.pocketArea = null;
    this.answerArea = null;
    this.storeArea = null;
    
    // Level data (to be set by subclass via loadLevelData)
    this.levels = [];
  }

  /**
   * Load level data - override in subclass
   */
  loadLevelData() {
    return [
      // Level 1: Simple amounts up to 5€
      {
        numberOfItem: 1,
        minPrice: 1,
        maxPrice: 4,
        pocket: ['c2e', 'c1e', 'c2e']
      },
      // Level 2: Amounts up to 10€
      {
        numberOfItem: 1,
        minPrice: 2,
        maxPrice: 8,
        pocket: ['n5e', 'c2e', 'c2e', 'c1e']
      },
      // Level 3: Multiple items up to 10€
      {
        numberOfItem: 2,
        minPrice: 3,
        maxPrice: 10,
        pocket: ['n5e', 'n5e', 'c2e', 'c2e', 'c1e']
      },
      // Level 4: Amounts up to 20€
      {
        numberOfItem: 2,
        minPrice: 5,
        maxPrice: 15,
        pocket: ['n10e', 'n5e', 'c2e', 'c2e', 'c1e']
      },
      // Level 5: Amounts up to 30€
      {
        numberOfItem: 3,
        minPrice: 8,
        maxPrice: 25,
        pocket: ['n20e', 'n10e', 'n5e', 'c2e', 'c2e', 'c1e']
      },
      // Level 6: Larger amounts
      {
        numberOfItem: 3,
        minPrice: 15,
        maxPrice: 50,
        pocket: ['n50e', 'n20e', 'n10e', 'n5e', 'c2e', 'c1e']
      }
    ];
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();
    
    // Load coin and note SVGs
    const moneyAssets = [
      'c1c', 'c2c', 'c5c', 'c10c', 'c20c', 'c50c',
      'c1e', 'c2e',
      'n5e', 'n10e', 'n20e', 'n50e', 'n100e', 'n200e', 'n500e'
    ];
    
    moneyAssets.forEach(asset => {
      this.load.svg(asset, `assets/money/${asset}.svg`);
    });
    
    // Load sounds
    this.load.audio('money-pay', 'assets/sounds/money1.wav');
    this.load.audio('money-unpay', 'assets/sounds/money2.wav');
  }

  /**
   * Initialize game state
   */
  init(data) {
    super.init(data);
    this.currentLevel = 0;
    this.pocket = [];
    this.answer = [];
    this.levels = this.loadLevelData();
  }

  /**
   * Create background
   */
  createBackground() {
    const { width, height } = this.scale;
    
    // Warm shop background gradient
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xFFF8E7, 0xFFF8E7, 0xFFE4B5, 0xFFE4B5, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.setDepth(-1);
    
    // Decorative wood-grain counter at bottom
    graphics.fillStyle(0x8B4513, 0.3);
    graphics.fillRect(0, height * 0.75, width, height * 0.25);
  }

  /**
   * Create UI elements
   */
  createUI() {
    const { width, height } = this.scale;
    
    // Instructions text
    this.createInstructions(width, height);
    
    // Store area (top - shows items to buy)
    this.createStoreArea(width, height);
    
    // Answer area (middle - money being paid)
    this.createAnswerArea(width, height);
    
    // Pocket area (bottom - available money)
    this.createPocketArea(width, height);
    
    // Navigation dock
    this.createNavigationDock(width, height);
    
    // OK button for manual check mode
    this.createOkButton(width, height);
  }

  /**
   * Create instructions text
   */
  createInstructions(width, height) {
    const text = this.backMode 
      ? 'Give back the correct change!'
      : 'Click on coins/notes to pay for the items.';
    
    this.instructionsText = this.add.text(width / 2, 30, text, {
      fontSize: '22px',
      color: '#333333',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      wordWrap: { width: width * 0.9 }
    }).setOrigin(0.5, 0).setDepth(10);
  }

  /**
   * Create the store area showing items to buy
   */
  createStoreArea(width, height) {
    const storeY = height * 0.12;
    const storeHeight = height * 0.22;
    
    // Store background
    const storeBg = this.add.graphics();
    storeBg.fillStyle(0xFFFFFF, 0.9);
    storeBg.fillRoundedRect(20, storeY, width - 40, storeHeight, 15);
    storeBg.lineStyle(3, 0x8B4513);
    storeBg.strokeRoundedRect(20, storeY, width - 40, storeHeight, 15);
    storeBg.setDepth(5);
    
    // Store label
    this.add.text(30, storeY + 10, '🏪 Store', {
      fontSize: '18px',
      color: '#8B4513',
      fontFamily: 'Fredoka One, cursive'
    }).setDepth(10);
    
    // Container for store items
    this.storeContainer = this.add.container(0, 0).setDepth(10);
    this.storeAreaY = storeY;
    this.storeAreaHeight = storeHeight;
    
    // Total price display
    this.totalPriceText = this.add.text(width - 40, storeY + storeHeight / 2, '', {
      fontSize: '32px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(1, 0.5).setDepth(10);
  }

  /**
   * Create the answer area (money being paid)
   */
  createAnswerArea(width, height) {
    const answerY = height * 0.36;
    const answerHeight = height * 0.22;
    
    // Answer area background
    const answerBg = this.add.graphics();
    answerBg.fillStyle(0xE8F5E9, 0.9);
    answerBg.fillRoundedRect(20, answerY, width - 40, answerHeight, 15);
    answerBg.lineStyle(3, 0x00B378);
    answerBg.strokeRoundedRect(20, answerY, width - 40, answerHeight, 15);
    answerBg.setDepth(5);
    
    // Label
    const label = this.backMode ? '💰 Change' : '💳 Payment';
    this.add.text(30, answerY + 10, label, {
      fontSize: '18px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive'
    }).setDepth(10);
    
    // Amount paid display
    this.paidAmountText = this.add.text(width - 40, answerY + 15, '€0.00', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(1, 0).setDepth(10);
    
    // Container for answer money
    this.answerContainer = this.add.container(0, 0).setDepth(10);
    this.answerAreaY = answerY;
    this.answerAreaHeight = answerHeight;
  }

  /**
   * Create the pocket area (available money)
   */
  createPocketArea(width, height) {
    const pocketY = height * 0.60;
    const pocketHeight = height * 0.28;
    
    // Pocket background
    const pocketBg = this.add.graphics();
    pocketBg.fillStyle(0xFFF3E0, 0.9);
    pocketBg.fillRoundedRect(20, pocketY, width - 40, pocketHeight, 15);
    pocketBg.lineStyle(3, 0xF08A00);
    pocketBg.strokeRoundedRect(20, pocketY, width - 40, pocketHeight, 15);
    pocketBg.setDepth(5);
    
    // Label
    this.add.text(30, pocketY + 10, '👛 Your Pocket', {
      fontSize: '18px',
      color: '#F08A00',
      fontFamily: 'Fredoka One, cursive'
    }).setDepth(10);
    
    // Container for pocket money
    this.pocketContainer = this.add.container(0, 0).setDepth(10);
    this.pocketAreaY = pocketY;
    this.pocketAreaHeight = pocketHeight;
  }

  /**
   * Create OK button for checking answer
   */
  createOkButton(width, height) {
    const btnX = width - 60;
    const btnY = height * 0.47;
    
    this.okButton = this.add.rectangle(btnX, btnY, 70, 50, 0x00B378);
    this.okButton.setStrokeStyle(3, 0xFFFFFF);
    this.okButton.setInteractive({ useHandCursor: true });
    this.okButton.setDepth(15);
    
    this.okButtonText = this.add.text(btnX, btnY, 'OK', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(16);
    
    this.okButton.on('pointerover', () => this.okButton.setScale(1.1));
    this.okButton.on('pointerout', () => this.okButton.setScale(1));
    this.okButton.on('pointerdown', () => this.checkAnswer());
  }

  /**
   * Create navigation dock
   */
  createNavigationDock(width, height) {
    const dockY = height - 35;
    const buttonSize = 40;
    const spacing = 55;
    
    // Dock background
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.9);
    dockBg.fillRoundedRect(10, dockY - 25, 240, 50, 25);
    dockBg.setDepth(100);
    
    const controls = [
      { label: '❓', color: 0x00B378, action: () => this.showHelp() },
      { label: '🏠', color: 0x0062FF, action: () => this.goHome() },
      { label: '🔄', color: 0xFACA2A, action: () => this.restartLevel() },
      { label: '❌', color: 0xAB47BC, action: () => this.exitGame() }
    ];
    
    controls.forEach((ctrl, index) => {
      const x = 40 + index * spacing;
      
      const circle = this.add.circle(x, dockY, buttonSize / 2 - 5, ctrl.color);
      circle.setStrokeStyle(2, 0xFFFFFF);
      circle.setInteractive({ useHandCursor: true });
      circle.setDepth(101);
      
      this.add.text(x, dockY, ctrl.label, {
        fontSize: '20px'
      }).setOrigin(0.5).setDepth(102);
      
      circle.on('pointerdown', ctrl.action);
    });
    
    // Level indicator
    this.levelText = this.add.text(width - 20, dockY, 'Level 1', {
      fontSize: '20px',
      color: '#333333',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(1, 0.5).setDepth(100);
  }

  /**
   * Setup game logic
   */
  setupGameLogic() {
    this.initLevel();
  }

  /**
   * Initialize current level
   */
  initLevel() {
    const levelData = this.levels[this.currentLevel];
    
    // Clear previous state
    this.pocket = [];
    this.answer = [];
    this.storeItems = [];
    this.pocketContainer.removeAll(true);
    this.answerContainer.removeAll(true);
    this.storeContainer.removeAll(true);
    
    // Setup pocket with level's money
    levelData.pocket.forEach(key => {
      const item = { ...this.moneyItems[key], id: this.generateId() };
      this.pocket.push(item);
    });
    
    // Generate store items and calculate total
    this.generateStoreItems(levelData);
    
    // Render everything
    this.renderPocket();
    this.renderStore();
    this.updatePaidAmount();
    
    // Update level text
    this.levelText.setText(`Level ${this.currentLevel + 1}`);
  }

  /**
   * Generate store items with random prices
   */
  generateStoreItems(levelData) {
    const { numberOfItem, minPrice, maxPrice } = levelData;
    
    this.priceTotal = 0;
    this.storeItems = [];
    
    for (let i = 0; i < numberOfItem; i++) {
      let price;
      
      if (i < numberOfItem - 1) {
        // Random price for non-last items
        const remaining = maxPrice - this.priceTotal - (numberOfItem - i - 1);
        price = this.randomInRange(1, Math.min(remaining, maxPrice / numberOfItem * 1.5));
      } else {
        // Last item gets remaining to reach target
        price = this.randomInRange(minPrice - this.priceTotal, maxPrice - this.priceTotal);
      }
      
      // Add cents if in cents mode
      if (this.centsMode && price >= 1) {
        const cents = Math.floor(Math.random() * 99) / 100;
        price = Math.floor(price) + cents;
      }
      
      price = Math.max(1, Math.round(price * 100) / 100);
      this.priceTotal += price;
      
      // Get random object emoji based on price
      const emoji = this.getRandomObject(price);
      
      this.storeItems.push({
        emoji,
        price,
        priceText: this.formatPrice(price)
      });
    }
    
    // Update total display
    this.totalPriceText.setText(`Total: ${this.formatPrice(this.priceTotal)}`);
  }

  /**
   * Get random object emoji based on price
   */
  getRandomObject(price) {
    let list;
    if (price < 5) list = this.cheapObjects;
    else if (price < 15) list = this.normalObjects;
    else list = this.expensiveObjects;
    
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Format price as currency string
   */
  formatPrice(amount) {
    if (this.centsMode) {
      return `€${amount.toFixed(2)}`;
    }
    return `€${Math.round(amount)}`;
  }

  /**
   * Render store items
   */
  renderStore() {
    const { width } = this.scale;
    const startX = 50;
    const itemWidth = 100;
    const y = this.storeAreaY + this.storeAreaHeight / 2 + 10;
    
    this.storeItems.forEach((item, index) => {
      const x = startX + index * (itemWidth + 20);
      
      // Item card
      const card = this.add.rectangle(x + itemWidth / 2, y, itemWidth, 80, 0xFFFDE7);
      card.setStrokeStyle(2, 0xDDD);
      
      // Emoji
      this.add.text(x + itemWidth / 2, y - 15, item.emoji, {
        fontSize: '36px'
      }).setOrigin(0.5);
      
      // Price tag
      this.add.text(x + itemWidth / 2, y + 25, item.priceText, {
        fontSize: '18px',
        color: '#333333',
        fontFamily: 'Fredoka One, cursive'
      }).setOrigin(0.5);
      
      this.storeContainer.add([card]);
    });
  }

  /**
   * Render pocket money
   */
  renderPocket() {
    const { width } = this.scale;
    this.pocketContainer.removeAll(true);
    
    const startX = 40;
    const y = this.pocketAreaY + this.pocketAreaHeight / 2 + 15;
    const spacing = 70;
    
    this.pocket.forEach((item, index) => {
      const x = startX + (index % 10) * spacing;
      const yOffset = Math.floor(index / 10) * 60;
      
      this.createMoneySprite(item, x, y + yOffset, true);
    });
  }

  /**
   * Render answer money
   */
  renderAnswer() {
    const { width } = this.scale;
    this.answerContainer.removeAll(true);
    
    const startX = 40;
    const y = this.answerAreaY + this.answerAreaHeight / 2 + 15;
    const spacing = 70;
    
    this.answer.forEach((item, index) => {
      const x = startX + (index % 10) * spacing;
      const yOffset = Math.floor(index / 10) * 60;
      
      this.createMoneySprite(item, x, y + yOffset, false);
    });
  }

  /**
   * Create interactive money sprite
   */
  createMoneySprite(item, x, y, inPocket) {
    const container = inPocket ? this.pocketContainer : this.answerContainer;
    
    // Try to load SVG, fallback to text
    let sprite;
    if (this.textures.exists(item.img)) {
      sprite = this.add.image(x, y, item.img);
      sprite.setDisplaySize(item.type === 'note' ? 80 : 55, item.type === 'note' ? 45 : 55);
    } else {
      // Fallback: Draw coin/note programmatically
      const size = item.type === 'note' ? 60 : 45;
      sprite = this.add.circle(x, y, size / 2, item.type === 'note' ? 0x90EE90 : 0xFFD700);
      sprite.setStrokeStyle(2, item.type === 'note' ? 0x228B22 : 0xDAA520);
      
      this.add.text(x, y, item.label, {
        fontSize: '14px',
        color: '#333',
        fontFamily: 'Fredoka One, cursive'
      }).setOrigin(0.5).setDepth(12);
    }
    
    sprite.setInteractive({ useHandCursor: true });
    sprite.setDepth(11);
    sprite.setData('item', item);
    sprite.setData('inPocket', inPocket);
    
    sprite.on('pointerover', () => sprite.setScale(1.1));
    sprite.on('pointerout', () => sprite.setScale(1));
    sprite.on('pointerdown', () => {
      if (inPocket) {
        this.pay(item);
      } else {
        this.unpay(item);
      }
    });
    
    container.add(sprite);
  }

  /**
   * Pay with a money item (move from pocket to answer)
   */
  pay(item) {
    // Find and remove from pocket
    const index = this.pocket.findIndex(p => p.id === item.id);
    if (index === -1) return;
    
    this.pocket.splice(index, 1);
    this.answer.push(item);
    
    // Play sound
    if (this.sound.get('money-pay')) {
      this.sound.play('money-pay');
    }
    
    // Re-render
    this.renderPocket();
    this.renderAnswer();
    this.updatePaidAmount();
    
    // Auto-check if exact amount
    this.autoCheck();
  }

  /**
   * Unpay (move from answer back to pocket)
   */
  unpay(item) {
    // Find and remove from answer
    const index = this.answer.findIndex(a => a.id === item.id);
    if (index === -1) return;
    
    this.answer.splice(index, 1);
    this.pocket.push(item);
    
    // Play sound
    if (this.sound.get('money-unpay')) {
      this.sound.play('money-unpay');
    }
    
    // Re-render
    this.renderPocket();
    this.renderAnswer();
    this.updatePaidAmount();
  }

  /**
   * Update the paid amount display
   */
  updatePaidAmount() {
    const paid = this.answer.reduce((sum, item) => sum + item.val, 0);
    this.paidAmountText.setText(this.formatPrice(paid));
  }

  /**
   * Auto-check when exact amount is paid
   */
  autoCheck() {
    const paid = this.answer.reduce((sum, item) => sum + item.val, 0);
    const paidRounded = Math.round(paid * 100);
    const totalRounded = Math.round(this.priceTotal * 100);
    
    if (paidRounded === totalRounded) {
      this.time.delayedCall(300, () => this.checkAnswer());
    }
  }

  /**
   * Check if answer is correct
   */
  checkAnswer() {
    const paid = this.answer.reduce((sum, item) => sum + item.val, 0);
    const paidRounded = Math.round(paid * 100);
    const totalRounded = Math.round(this.priceTotal * 100);
    
    if (paidRounded === totalRounded) {
      this.onCorrect();
    } else {
      this.onWrong();
    }
  }

  /**
   * Handle correct answer
   */
  onCorrect() {
    const { width, height } = this.scale;
    
    // Show success overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x00B378, 0.9);
    overlay.setDepth(200);
    
    const successText = this.add.text(width / 2, height / 2 - 30, '✅ Correct!', {
      fontSize: '48px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(201);
    
    // Next level or victory
    this.time.delayedCall(1500, () => {
      overlay.destroy();
      successText.destroy();
      this.nextLevel();
    });
  }

  /**
   * Handle wrong answer
   */
  onWrong() {
    const { width, height } = this.scale;
    
    // Flash red
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0xFF0000, 0.3);
    overlay.setDepth(200);
    
    const wrongText = this.add.text(width / 2, height / 2, '❌ Try again!', {
      fontSize: '36px',
      color: '#FF0000',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(201);
    
    this.time.delayedCall(1000, () => {
      overlay.destroy();
      wrongText.destroy();
    });
  }

  /**
   * Advance to next level
   */
  nextLevel() {
    this.currentLevel++;
    
    if (this.currentLevel >= this.levels.length) {
      this.showVictory();
    } else {
      this.initLevel();
    }
  }

  /**
   * Restart current level
   */
  restartLevel() {
    this.initLevel();
  }

  /**
   * Show victory screen
   */
  showVictory() {
    const { width, height } = this.scale;
    
    const victoryBg = this.add.rectangle(width / 2, height / 2, width, height, 0x0062FF, 0.95);
    victoryBg.setDepth(250);
    
    this.add.text(width / 2, height / 2 - 50, '🏆 YOU WIN! 🏆', {
      fontSize: '48px',
      color: '#FACA2A',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(251);
    
    this.add.text(width / 2, height / 2 + 20, `You mastered ${this.gameName}!`, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(251);
    
    const menuBtn = this.add.rectangle(width / 2, height / 2 + 100, 180, 50, 0x00B378);
    menuBtn.setStrokeStyle(3, 0xFFFFFF);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(251);
    
    this.add.text(width / 2, height / 2 + 100, 'Menu', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5).setDepth(252);
    
    menuBtn.on('pointerdown', () => this.scene.start('GameMenu'));
  }

  /**
   * Navigation actions
   */
  showHelp() {
    if (this.uiManager) {
      const helpText = this.backMode
        ? 'Tux paid for items. Give back the correct change by clicking on coins and notes!'
        : 'Click on coins and notes from your pocket to pay for the items in the store. Click on paid money to remove it.';
      
      this.uiManager.showModal(this, 'How to Play', helpText, () => {});
    }
  }

  goHome() {
    this.scene.start('GameMenu');
  }

  exitGame() {
    this.scene.start('GameMenu');
  }

  /**
   * Utility functions
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  randomInRange(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
}
