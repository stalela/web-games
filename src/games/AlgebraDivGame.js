/**
 * AlgebraDivGame - Practice division of numbers
 * Educational game teaching mental math division within a time limit
 * Based on GCompris algebra_div activity
 */
import { AlgebraGame } from './AlgebraGame.js';

export class AlgebraDivGame extends AlgebraGame {
  constructor(config) {
    super(config);
    
    // Division-specific configuration
    this.operatorSymbol = '÷';  // Unicode division sign
    this.operatorName = 'division';
    
    // Load division-specific level data
    this.levels = this.loadLevelData();
  }

  /**
   * Load level data matching GCompris algebra_div
   * Division is reverse of multiplication tables
   */
  loadLevelData() {
    return [
      // Levels 1-10: Division tables (products ÷ divisor = quotient)
      { type: 'table', base: 1, operands: this.generateDivisionTable(1) },
      { type: 'table', base: 2, operands: this.generateDivisionTable(2) },
      { type: 'table', base: 3, operands: this.generateDivisionTable(3) },
      { type: 'table', base: 4, operands: this.generateDivisionTable(4) },
      { type: 'table', base: 5, operands: this.generateDivisionTable(5) },
      { type: 'table', base: 6, operands: this.generateDivisionTable(6) },
      { type: 'table', base: 7, operands: this.generateDivisionTable(7) },
      { type: 'table', base: 8, operands: this.generateDivisionTable(8) },
      { type: 'table', base: 9, operands: this.generateDivisionTable(9) },
      { type: 'table', base: 10, operands: this.generateDivisionTable(10) },
      // Level 11: Random divisions
      { type: 'random', min: 2, max: 10, limit: 0 }
    ];
  }

  /**
   * Generate division table: (base * i) ÷ base = i
   * e.g., for base 3: 3÷3=1, 6÷3=2, 9÷3=3, etc.
   */
  generateDivisionTable(base) {
    const operands = [];
    for (let i = 1; i <= 10; i++) {
      operands.push({ first: base * i, second: base });
    }
    return operands;
  }

  /**
   * Generate operands ensuring clean division (no remainder)
   */
  generateOperands(min, max, limit) {
    // Pick divisor first, then multiply to get dividend
    const divisor = this.randomInRange(Math.max(min, 2), max);
    const quotient = this.randomInRange(min, max);
    const dividend = divisor * quotient;
    return [dividend, divisor];
  }

  /**
   * Calculate division result
   */
  calculateAnswer(first, second) {
    return Math.floor(first / second);
  }
}
