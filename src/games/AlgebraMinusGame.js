/**
 * AlgebraMinusGame - Practice subtraction of numbers
 * Educational game teaching mental math subtraction within a time limit
 * Based on GCompris algebra_minus activity
 */
import { AlgebraGame } from './AlgebraGame.js';

export class AlgebraMinusGame extends AlgebraGame {
  constructor(config) {
    super(config);
    
    // Subtraction-specific configuration
    this.operatorSymbol = '−';  // Unicode minus sign
    this.operatorName = 'subtraction';
    
    // Load subtraction-specific level data
    this.levels = this.loadLevelData();
  }

  /**
   * Load level data matching GCompris algebra_minus
   * For subtraction: first operand is always >= second (no negative results)
   */
  loadLevelData() {
    return [
      // Levels 1-10: Subtraction tables (reverse of addition)
      { type: 'table', base: 1, operands: this.generateSubtractionTable(1) },
      { type: 'table', base: 2, operands: this.generateSubtractionTable(2) },
      { type: 'table', base: 3, operands: this.generateSubtractionTable(3) },
      { type: 'table', base: 4, operands: this.generateSubtractionTable(4) },
      { type: 'table', base: 5, operands: this.generateSubtractionTable(5) },
      { type: 'table', base: 6, operands: this.generateSubtractionTable(6) },
      { type: 'table', base: 7, operands: this.generateSubtractionTable(7) },
      { type: 'table', base: 8, operands: this.generateSubtractionTable(8) },
      { type: 'table', base: 9, operands: this.generateSubtractionTable(9) },
      { type: 'table', base: 10, operands: this.generateSubtractionTable(10) },
      // Levels 11-13: Random subtractions
      { type: 'random', min: 0, max: 10, limit: 0 },
      { type: 'random', min: 0, max: 20, limit: 0 },
      { type: 'random', min: 0, max: 100, limit: 0 }
    ];
  }

  /**
   * Generate subtraction table: (base + i) - i = base
   * e.g., for base 3: 4-1=3, 5-2=3, 6-3=3, etc.
   */
  generateSubtractionTable(base) {
    const operands = [];
    for (let i = 1; i <= 10; i++) {
      operands.push({ first: base + i, second: i });
    }
    return operands;
  }

  /**
   * Generate operands ensuring first >= second (no negative results)
   */
  generateOperands(min, max, limit) {
    const first = this.randomInRange(min, max);
    const second = this.randomInRange(min, first); // second <= first
    return [first, second];
  }

  /**
   * Calculate subtraction result
   */
  calculateAnswer(first, second) {
    return first - second;
  }
}
