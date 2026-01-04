import { GnumchGame } from './GnumchGame.js';

export class GnumchMultiplesGame extends GnumchGame {
  constructor(config) {
    super({
      key: 'GnumchMultiplesGame',
      title: 'Gnumch Multiples',
      description: 'Eat the multiples of the target number!',
      category: 'math',
      ...config
    });
  }

  generateRoundRule(min, max) {
    // Logic from gnumch-equality.js:
    // goal = items.currentLevel + 2;
    // But here we use min/max or just level number.
    // Let's map level 1..6 to goals 2, 3, 4, 5, 6, 7...
    
    const goal = this.levelData.number + 1; // Level 1 -> 2, Level 2 -> 3, etc.
    this.targetValue = goal;

    return {
      targetValue: goal,
      ruleText: `Eat multiples of ${goal}`
    };
  }

  checkAnswer(value) {
    // Is value a multiple of targetValue?
    return value % this.targetValue === 0;
  }

  generateNumber() {
    // Generate a number that is either a multiple (good) or not (bad)
    const isGood = Math.random() < 0.5;
    
    if (isGood) {
      // Generate a multiple: goal * random(1..6)
      return this.targetValue * (Math.floor(Math.random() * 6) + 1);
    } else {
      // Generate a non-multiple. 
      // Simple way: generate a multiple and subtract 1 (as in original code)
      // But ensure it's > 0
      const multiple = this.targetValue * (Math.floor(Math.random() * 6) + 1);
      return Math.max(1, multiple - 1);
    }
  }
}
