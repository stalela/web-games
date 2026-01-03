import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemoryMathAddGame extends MemoryGame {
    constructor(config) {
        super({
            ...config,
            key: 'MemoryMathAddGame',
            title: 'Memory Addition',
            description: 'Match the addition operation with its result.',
            category: 'memory'
        });
    }

    setupLevel() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        // Generate random additions
        while (operations.length < numPairs) {
            const a = Math.floor(Math.random() * 9) + 1;
            const b = Math.floor(Math.random() * 9) + 1;
            const result = a + b;
            const opString = `${a} + ${b}`;
            
            // Avoid duplicates
            if (!operations.some(op => op.op === opString)) {
                operations.push({ op: opString, res: result });
            }
        }
        
        this.cardPairs = [];
        operations.forEach(op => {
            // Pair 1: Operation
            this.cardPairs.push({
                matchId: op.res, // Match by result
                type: 'operation',
                value: op.op
            });
            // Pair 2: Result
            this.cardPairs.push({
                matchId: op.res,
                type: 'result',
                value: op.res
            });
        });
        
        this.calculateGridDimensions(this.cardPairs.length);
        const { width, height } = this.cameras.main;
        this.calculateOptimalLayout(width, height);
        this.shuffleAndPositionCards();
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
