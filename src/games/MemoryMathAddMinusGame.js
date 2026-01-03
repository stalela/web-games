import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemoryMathAddMinusGame extends MemoryGame {
    constructor(config) {
        super({
            ...config,
            key: 'MemoryMathAddMinusGame',
            title: 'Memory Add/Minus',
            description: 'Match the addition or subtraction with its result.',
            category: 'memory'
        });
    }

    setupLevel() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        while (operations.length < numPairs) {
            const isAdd = Math.random() > 0.5;
            let a, b, result, opString;
            
            if (isAdd) {
                a = Math.floor(Math.random() * 9) + 1;
                b = Math.floor(Math.random() * 9) + 1;
                result = a + b;
                opString = `${a} + ${b}`;
            } else {
                a = Math.floor(Math.random() * 18) + 2;
                b = Math.floor(Math.random() * (a - 1)) + 1;
                result = a - b;
                opString = `${a} - ${b}`;
            }
            
            if (!operations.some(op => op.op === opString)) {
                operations.push({ op: opString, res: result });
            }
        }
        
        this.cardPairs = [];
        operations.forEach(op => {
            this.cardPairs.push({
                matchId: op.res,
                type: 'operation',
                value: op.op
            });
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
