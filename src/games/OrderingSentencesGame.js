import { OrderingGame } from './OrderingGame.js';

export class OrderingSentencesGame extends OrderingGame {
  constructor(config) {
    super({
      key: 'OrderingSentencesGame',
      title: 'Ordering Sentences',
      category: 'reading',
      description: 'Reorder the words to form a correct sentence.',
      mode: 'sentences',
      levels: [
        { items: ['The', 'dog', 'barks.'] },
        { items: ['The', 'house', 'is', 'red.'] },
        { items: ['The', 'boy', 'reads', 'a', 'book.'] },
        { items: ['My', 'friend', 'is', 'nice.'] },
        { items: ['What', 'a', 'beautiful', 'sight!'] },
        { items: ['Steve', 'jumps', 'into', 'the', 'pool.'] },
        { items: ['Jessica', 'wants', 'a', 'new', 'book.'] },
        { items: ['Mom', 'made', 'me', 'a', 'sandwich.'] },
        { items: ['Tigers', 'live', 'in', 'forests.'] },
        { items: ['Football', 'is', 'a', 'team', 'game.'] }
      ],
      ...config
    });
  }
}
