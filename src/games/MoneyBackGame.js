/**
 * MoneyBackGame - Practice giving change
 * Educational game teaching how to give back correct change
 * Based on GCompris money_back activity
 */
import { MoneyGame } from './MoneyGame.js';

export class MoneyBackGame extends MoneyGame {
  constructor(config) {
    super(config);
    
    // Enable back (change) mode
    this.centsMode = false;
    this.backMode = true;
    this.gameName = 'Give Change';
    
    // Load change-specific level data
    this.levels = this.loadLevelData();
  }

  /**
   * Load level data for giving change mode
   * Player must give back the correct change from Tux's payment
   */
  loadLevelData() {
    return [
      // Level 1: Simple change from €5
      {
        numberOfItem: 1,
        minPrice: 1,
        maxPrice: 3,
        tuxPaid: 5,
        pocket: ['c2e', 'c2e', 'c1e', 'c1e']
      },
      // Level 2: Change from €10
      {
        numberOfItem: 1,
        minPrice: 3,
        maxPrice: 7,
        tuxPaid: 10,
        pocket: ['n5e', 'c2e', 'c2e', 'c1e']
      },
      // Level 3: Multiple items, change from €10
      {
        numberOfItem: 2,
        minPrice: 4,
        maxPrice: 8,
        tuxPaid: 10,
        pocket: ['n5e', 'c2e', 'c2e', 'c1e', 'c1e']
      },
      // Level 4: Change from €20
      {
        numberOfItem: 2,
        minPrice: 8,
        maxPrice: 15,
        tuxPaid: 20,
        pocket: ['n10e', 'n5e', 'c2e', 'c2e', 'c1e']
      },
      // Level 5: Change from €50
      {
        numberOfItem: 3,
        minPrice: 20,
        maxPrice: 40,
        tuxPaid: 50,
        pocket: ['n20e', 'n10e', 'n5e', 'c2e', 'c2e', 'c1e']
      },
      // Level 6: Change from €100
      {
        numberOfItem: 3,
        minPrice: 40,
        maxPrice: 80,
        tuxPaid: 100,
        pocket: ['n50e', 'n20e', 'n10e', 'n5e', 'c2e', 'c2e', 'c1e']
      }
    ];
  }

  /**
   * Override initLevel for change mode
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
    
    // Setup pocket with level's money (what we can give as change)
    levelData.pocket.forEach(key => {
      const item = { ...this.moneyItems[key], id: this.generateId() };
      this.pocket.push(item);
    });
    
    // Generate store items and calculate total
    this.generateStoreItems(levelData);
    
    // Set Tux's payment
    this.tuxPaid = levelData.tuxPaid;
    
    // Update instructions for change mode
    this.instructionsText.setText(
      `Tux paid €${this.tuxPaid} for items totaling ${this.formatPrice(this.priceTotal)}.\nGive back the correct change!`
    );
    
    // Render everything
    this.renderPocket();
    this.renderStore();
    this.renderTuxPayment();
    this.updatePaidAmount();
    
    // Update level text
    this.levelText.setText(`Level ${this.currentLevel + 1}`);
  }

  /**
   * Render Tux's payment area
   */
  renderTuxPayment() {
    const { width, height } = this.scale;
    
    // Show what Tux paid
    const tuxPaymentText = this.add.text(width - 150, this.storeAreaY + 15, 
      `🐧 Tux paid: €${this.tuxPaid}`, {
      fontSize: '18px',
      color: '#0062FF',
      fontFamily: 'Fredoka One, cursive'
    }).setDepth(10);
    
    this.storeContainer.add(tuxPaymentText);
  }

  /**
   * Calculate required change
   */
  getRequiredChange() {
    return this.tuxPaid - this.priceTotal;
  }

  /**
   * Override checkAnswer for change mode
   */
  checkAnswer() {
    const given = this.answer.reduce((sum, item) => sum + item.val, 0);
    const givenRounded = Math.round(given * 100);
    const requiredRounded = Math.round(this.getRequiredChange() * 100);
    
    if (givenRounded === requiredRounded) {
      this.onCorrect();
    } else {
      this.onWrong();
    }
  }

  /**
   * Override updatePaidAmount for change mode
   */
  updatePaidAmount() {
    const given = this.answer.reduce((sum, item) => sum + item.val, 0);
    const required = this.getRequiredChange();
    
    this.paidAmountText.setText(`Change: ${this.formatPrice(given)} / ${this.formatPrice(required)}`);
  }

  /**
   * Override auto-check for change mode
   */
  autoCheck() {
    const given = this.answer.reduce((sum, item) => sum + item.val, 0);
    const givenRounded = Math.round(given * 100);
    const requiredRounded = Math.round(this.getRequiredChange() * 100);
    
    if (givenRounded === requiredRounded) {
      this.time.delayedCall(300, () => this.checkAnswer());
    }
  }
}
