import { GnumchGame } from './GnumchGame.js';

export class GnumchPrimesGame extends GnumchGame {
  constructor(config) {
    super({
      key: 'GnumchPrimesGame',
      title: 'Gnumch Primes',
      description: 'Eat the prime numbers!',
      category: 'math',
      ...config
    });

    this.primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
    this.badNumbers = [1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30];
  }

  generateRoundRule(min, max) {
    // Logic from gnumch-equality.js:
    // goal = primeNumbers[items.currentLevel + 1] + 1;
    // This goal acts as an upper bound for the numbers generated.
    
    // Level 1 -> primeNumbers[2] + 1 = 5 + 1 = 6
    // Level 2 -> primeNumbers[3] + 1 = 7 + 1 = 8
    
    const levelIndex = Math.min(this.levelData.number, this.primeNumbers.length - 2);
    const goal = this.primeNumbers[levelIndex + 1] + 1;
    this.targetValue = goal; // Used as max value

    return {
      targetValue: goal,
      ruleText: `Eat only prime numbers`
    };
  }

  checkAnswer(value) {
    return this.isPrime(value);
  }

  isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  generateNumber() {
    const isGood = Math.random() < 0.5;
    const max = this.targetValue;

    if (isGood) {
      // Choose a prime < max
      const validPrimes = this.primeNumbers.filter(p => p < max);
      if (validPrimes.length === 0) return 2;
      return validPrimes[Math.floor(Math.random() * validPrimes.length)];
    } else {
      // Choose a non-prime < max
      // We can use the badNumbers list or generate one
      const validBad = this.badNumbers.filter(n => n < max);
      if (validBad.length > 0) {
        return validBad[Math.floor(Math.random() * validBad.length)];
      } else {
        // Fallback if list is exhausted (shouldn't happen with correct max)
        return 4; 
      }
    }
  }
}
