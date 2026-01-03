/**
 * AlgebraPlusGame - Practice addition of numbers
 * Educational game teaching mental math addition within a time limit
 * Based on GCompris algebra_plus activity
 */
import { AlgebraGame } from './AlgebraGame.js';

export class AlgebraPlusGame extends AlgebraGame {
  constructor(config) {
    super(config);
    
    // Addition-specific configuration
    this.operatorSymbol = '+';
    this.operatorName = 'addition';
    
    // Load addition-specific level data
    this.levels = this.loadLevelData();
  }

  /**
   * Load level data matching GCompris algebra_plus
   */
  loadLevelData() {
    return [
      // Levels 1-10: Addition tables
      { type: 'table', base: 1, operands: this.generateTable(1) },
      { type: 'table', base: 2, operands: this.generateTable(2) },
      { type: 'table', base: 3, operands: this.generateTable(3) },
      { type: 'table', base: 4, operands: this.generateTable(4) },
      { type: 'table', base: 5, operands: this.generateTable(5) },
      { type: 'table', base: 6, operands: this.generateTable(6) },
      { type: 'table', base: 7, operands: this.generateTable(7) },
      { type: 'table', base: 8, operands: this.generateTable(8) },
      { type: 'table', base: 9, operands: this.generateTable(9) },
      { type: 'table', base: 10, operands: this.generateTable(10) },
      // Levels 11-13: Random additions
      { type: 'random', min: 0, max: 10, limit: 0 },
      { type: 'random', min: 0, max: 15, limit: 0 },
      { type: 'random', min: 0, max: 100, limit: 100 }
    ];
  }

  /**
   * Calculate addition result
   */
  calculateAnswer(first, second) {
    return first + second;
  }
}
