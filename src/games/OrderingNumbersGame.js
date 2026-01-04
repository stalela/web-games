import { OrderingGame } from './OrderingGame.js';

export class OrderingNumbersGame extends OrderingGame {
  constructor(config) {
    super({
      key: 'OrderingNumbersGame',
      title: 'Ordering Numbers',
      category: 'math',
      description: 'Order the numbers from smallest to largest.',
      mode: 'numbers',
      levels: [
        { min: 1, max: 10, count: 5, order: 'ascending' },
        { min: 1, max: 20, count: 5, order: 'ascending' },
        { min: 10, max: 50, count: 6, order: 'ascending' },
        { min: 1, max: 10, count: 5, order: 'descending' },
        { min: 10, max: 100, count: 6, order: 'descending' }
      ],
      ...config
    });
  }
}
