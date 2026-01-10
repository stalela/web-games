import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemoryMathDivGame extends MemoryGame {
    constructor(config) {
        super({
            ...config,
            key: 'MemoryMathDivGame',
            title: 'Memory Division',
            description: 'Match the division operation with its result.',
            category: 'memory'
        });
    }

    generateCardPairs() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        while (operations.length < numPairs) {
            // Generate division that results in whole number
            const b = Math.floor(Math.random() * 9) + 1;
            const result = Math.floor(Math.random() * 9) + 1;
            const a = b * result;
            const opString = `${a} ÷ ${b}`;
            
            if (!operations.some(op => op.op === opString)) {
                operations.push({ op: opString, res: result });
            }
        }
        
        this.cardPairs = [];
        operations.forEach(op => {
            this.cardPairs.push({
                matchId: op.op,
                type: 'operation',
                value: op.op
            });
            this.cardPairs.push({
                matchId: op.op,
                type: 'result',
                value: op.res
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
            backColor: 0xF08A00,
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
