import { GnumchGame } from './GnumchGame.js';

export class GnumchFactorsGame extends GnumchGame {
  constructor(config) {
    super({
      key: 'GnumchFactorsGame',
      title: 'Gnumch Factors',
      description: 'Click the factors of the target number.',
      category: 'math',
      ...config
    });

    this.roundsPerLevel = 4;
  }

  preload() {
    super.preload();
    this.load.svg('gnumch-factors-icon', 'assets/game-icons/gnumch-factors.svg');
  }

  generateRoundRule(min, max) {
    // Factors work better with a not-too-small composite
    const targetValue = this.pickComposite(min, max);
    return { targetValue, ruleText: 'Click all numbers that are factors of the target' };
  }

  isCorrectValue(value, targetValue) {
    return value !== 0 && targetValue % value === 0;
  }

  generateCreatureValues(targetValue, count, min, max) {
    const factorCandidates = this.listFactors(targetValue);

    const correct = Phaser.Utils.Array.Shuffle(factorCandidates).slice(0, Phaser.Math.Between(2, 4));
    const values = [...correct];

    while (values.length < count) {
      let v = Phaser.Math.Between(min, Math.min(max, targetValue + 20));
      if (v === 0) continue;
      if (this.isCorrectValue(v, targetValue)) continue;
      values.push(v);
    }

    return Phaser.Utils.Array.Shuffle(values);
  }

  listFactors(n) {
    const factors = [];
    for (let i = 1; i <= Math.min(n, 50); i++) {
      if (n % i === 0) factors.push(i);
    }
    return factors.length ? factors : [1];
  }

  pickComposite(min, max) {
    for (let tries = 0; tries < 40; tries++) {
      const n = Phaser.Math.Between(Math.max(6, min), Math.min(120, max));
      if (n % 2 === 0 || n % 3 === 0 || n % 5 === 0) return n;
    }
    return Phaser.Math.Between(Math.max(6, min), Math.min(120, max));
  }
}
