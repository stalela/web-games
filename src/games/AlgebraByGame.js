/**
 * AlgebraByGame - Practice multiplication of numbers
 * Educational game teaching mental math multiplication within a time limit
 * Based on GCompris algebra_by activity
 */
import { AlgebraGame } from './AlgebraGame.js';

export class AlgebraByGame extends AlgebraGame {
  constructor(config) {
    super(config);
    
    // Multiplication-specific configuration
    this.operatorSymbol = '×';  // Unicode multiplication sign
    this.operatorName = 'multiplication';
    
    // Load multiplication-specific level data
    this.levels = this.loadLevelData();
  }

  /**
   * Load level data matching GCompris algebra_by
   * Multiplication tables 1-10, then random
   */
  loadLevelData() {
    return [
      // Levels 1-10: Multiplication tables
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
      // Level 11: Random multiplications with small numbers
      { type: 'random', min: 2, max: 10, limit: 0 }
    ];
  }

  /**
   * Calculate multiplication result
   */
  calculateAnswer(first, second) {
    return first * second;
  }
}
