import { OrderingGame } from './OrderingGame.js';

export class OrderingChronologyGame extends OrderingGame {
  constructor(config) {
    super({
      key: 'OrderingChronologyGame',
      title: 'Ordering Chronology',
      category: 'discovery',
      description: 'Put the pictures in the correct chronological order.',
      mode: 'chronology',
      levels: [
        {
          items: [
            'garden-01.svg',
            'garden-02.svg',
            'garden-03.svg',
            'garden-04.svg'
          ]
        },
        {
          items: [
            'moon-01.svg',
            'moon-02.svg',
            'moon-03.svg',
            'moon-04.svg'
          ]
        },
        {
          items: [
            'tuxtree-01.svg',
            'tuxtree-02.svg',
            'tuxtree-03.svg',
            'tuxtree-04.svg'
          ]
        }
      ],
      ...config
    });
  }
}
