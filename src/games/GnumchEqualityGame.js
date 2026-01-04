import { GnumchGame } from './GnumchGame.js';

export class GnumchEqualityGame extends GnumchGame {
  constructor(config) {
    super({
      key: 'GnumchEqualityGame',
      title: 'Gnumch Equality',
      description: 'Click the numbers equal to the target.',
      category: 'math',
      ...config
    });
  }

  preload() {
    super.preload();
    this.load.svg('gnumch-equality-icon', 'assets/game-icons/gnumch-equality.svg');
  }

  generateRoundRule(min, max) {
    const targetValue = Phaser.Math.Between(min, max);
    return { targetValue, ruleText: 'Click the numbers equal to the target' };
  }

  isCorrectValue(value, targetValue) {
    return value === targetValue;
  }

  generateCreatureValues(targetValue, count, min, max) {
    const values = [targetValue];
    while (values.length < count) {
      let v = Phaser.Math.Between(min, max);
      if (v === targetValue) v = Phaser.Math.Between(min, max);
      values.push(v);
    }
    return values;
  }
}
