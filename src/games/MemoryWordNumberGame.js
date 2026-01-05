import { MemoryGame } from './MemoryGame.js';

export class MemoryWordNumberGame extends MemoryGame {
    constructor() {
        super({
            key: 'MemoryWordNumberGame',
            title: 'Memory Word Number',
            description: 'Match the number with its written name.',
            category: 'memory'
        });
        
        this.numberWords = [
            { num: 1, word: 'one' },
            { num: 2, word: 'two' },
            { num: 3, word: 'three' },
            { num: 4, word: 'four' },
            { num: 5, word: 'five' },
            { num: 6, word: 'six' },
            { num: 7, word: 'seven' },
            { num: 8, word: 'eight' },
            { num: 9, word: 'nine' },
            { num: 10, word: 'ten' }
        ];
    }

    setupLevel() {
        const numPairs = Math.min(3 + this.level, 10);
        
        // Shuffle
        const shuffled = [...this.numberWords].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numPairs);
        
        this.cardPairs = [];
        selected.forEach(item => {
            this.cardPairs.push({
                matchId: item.num,
                type: 'number',
                value: item.num
            });
            this.cardPairs.push({
                matchId: item.num,
                type: 'word',
                value: item.word
            });
        });
        
        super.setupLevel();
    }
}
