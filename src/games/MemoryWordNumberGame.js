import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

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

    generateCardPairs() {
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
        
        this.totalPairs = numPairs;
    }

    createCard(x, y, cardData, index) {
        const content = cardData.value.toString();
        
        const card = new Card(this, {
            x: x,
            y: y,
            width: this.cardSize,
            height: this.cardSize,
            value: cardData.matchId,
            content: content,
            backColor: 0x0062FF,
            frontColor: 0xFFFFFF,
            flipDuration: this.flipDuration
        });

        card.on('cardClicked', (clickedCard) => {
            this.onCardClicked(clickedCard);
        });

        card.on('flipComplete', (flippedCard, isFlipped) => {
            this.onCardFlipComplete(flippedCard, isFlipped);
        });

        return card;
    }
}
