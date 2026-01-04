import { GnumchGame } from './GnumchGame.js';

export class GnumchInequalityGame extends GnumchGame {
  constructor(config) {
    super({
      key: 'GnumchInequalityGame',
      title: 'Gnumch Inequality',
      description: 'Click the numbers greater than or less than the target.',
      category: 'math',
      ...config
    });

    this.mode = 'gt';
  }

  preload() {
    super.preload();
    this.load.svg('gnumch-inequality-icon', 'assets/game-icons/gnumch-inequality.svg');
  }

  generateRoundRule(min, max) {
    const targetValue = Phaser.Math.Between(min, max);
    this.mode = Phaser.Math.Between(0, 1) === 0 ? 'gt' : 'lt';
    const ruleText = this.mode === 'gt'
      ? 'Click all numbers greater than the target'
      : 'Click all numbers less than the target';
    return { targetValue, ruleText };
  }

  isCorrectValue(value, targetValue) {
    if (this.mode === 'gt') return value > targetValue;
    return value < targetValue;
  }

  generateCreatureValues(targetValue, count, min, max) {
    const values = [];

    // Ensure at least 2 correct values
    const correctNeeded = 3;
    while (values.filter(v => this.isCorrectValue(v, targetValue)).length < correctNeeded) {
      const v = Phaser.Math.Between(min, max);
      if (v === targetValue) continue;
      values.push(v);
      if (values.length > count * 2) break;
    }

    while (values.length < count) {
      const v = Phaser.Math.Between(min, max);
      if (v === targetValue) continue;
      values.push(v);
    }

    return Phaser.Utils.Array.Shuffle(values);
  }
}
