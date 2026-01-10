import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemoryMathAddMinusMultDivGame extends MemoryGame {
    constructor(config) {
        super({
            ...config,
            key: 'MemoryMathAddMinusMultDivGame',
            title: 'Memory All Operations',
            description: 'Match the math operation with its result (all 4 operations).',
            category: 'memory'
        });
    }

    generateCardPairs() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        const operationTypes = ['+', '-', '×', '÷'];
        
        while (operations.length < numPairs) {
            const opType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
            let a, b, result, opString;
            
            switch (opType) {
                case '+':
                    a = Math.floor(Math.random() * 9) + 1;
                    b = Math.floor(Math.random() * 9) + 1;
                    result = a + b;
                    opString = `${a} + ${b}`;
                    break;
                case '-':
                    a = Math.floor(Math.random() * 18) + 2;
                    b = Math.floor(Math.random() * (a - 1)) + 1;
                    result = a - b;
                    opString = `${a} - ${b}`;
                    break;
                case '×':
                    a = Math.floor(Math.random() * 9) + 1;
                    b = Math.floor(Math.random() * 9) + 1;
                    result = a * b;
                    opString = `${a} × ${b}`;
                    break;
                case '÷':
                    b = Math.floor(Math.random() * 9) + 1;
                    result = Math.floor(Math.random() * 9) + 1;
                    a = b * result;
                    opString = `${a} ÷ ${b}`;
                    break;
            }
            
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
            backColor: 0xA74BFF,
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
