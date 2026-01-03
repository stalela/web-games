/**
 * MoneyCentsGame - Practice money usage with cents
 * Educational game teaching money counting with coins including cents
 * Based on GCompris money_cents activity
 */
import { MoneyGame } from './MoneyGame.js';

export class MoneyCentsGame extends MoneyGame {
  constructor(config) {
    super(config);
    
    // Enable cents mode
    this.centsMode = true;
    this.backMode = false;
    this.gameName = 'Money with Cents';
    
    // Load cents-specific level data
    this.levels = this.loadLevelData();
  }

  /**
   * Load level data for cents mode
   * Includes smaller denominations and decimal prices
   */
  loadLevelData() {
    return [
      // Level 1: Simple cents (10c, 20c, 50c)
      {
        numberOfItem: 1,
        minPrice: 0.30,
        maxPrice: 0.90,
        pocket: ['c50c', 'c20c', 'c20c', 'c10c']
      },
      // Level 2: All cents
      {
        numberOfItem: 1,
        minPrice: 0.15,
        maxPrice: 0.80,
        pocket: ['c50c', 'c20c', 'c10c', 'c5c', 'c2c', 'c1c']
      },
      // Level 3: Mix of cents and euros
      {
        numberOfItem: 1,
        minPrice: 1.20,
        maxPrice: 2.50,
        pocket: ['c2e', 'c1e', 'c50c', 'c20c', 'c10c', 'c5c']
      },
      // Level 4: Multiple items with cents
      {
        numberOfItem: 2,
        minPrice: 2.00,
        maxPrice: 5.00,
        pocket: ['n5e', 'c2e', 'c1e', 'c50c', 'c20c', 'c10c', 'c5c', 'c2c', 'c1c']
      },
      // Level 5: Complex cents calculations
      {
        numberOfItem: 2,
        minPrice: 3.50,
        maxPrice: 8.00,
        pocket: ['n5e', 'n5e', 'c2e', 'c1e', 'c50c', 'c50c', 'c20c', 'c10c', 'c5c', 'c2c', 'c1c']
      },
      // Level 6: Challenging amounts
      {
        numberOfItem: 3,
        minPrice: 5.00,
        maxPrice: 12.00,
        pocket: ['n10e', 'n5e', 'c2e', 'c2e', 'c1e', 'c50c', 'c50c', 'c20c', 'c20c', 'c10c', 'c5c', 'c2c', 'c1c']
      }
    ];
  }
}
