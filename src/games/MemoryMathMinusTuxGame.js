import { MemoryTuxBaseGame } from './MemoryTuxBaseGame.js';

export class MemoryMathMinusTuxGame extends MemoryTuxBaseGame {
    constructor() {
        super({
            key: 'MemoryMathMinusTuxGame',
            title: 'Memory Subtraction Tux',
            description: 'Match subtraction operations with results against Tux.',
            category: 'math'
        });
    }

    generateCardPairs() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        while (operations.length < numPairs) {
            const a = Math.floor(Math.random() * 18) + 2;
            const b = Math.floor(Math.random() * (a - 1)) + 1;
            const result = a - b;
            const opString = `${a} - ${b}`;
            
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
        
        this.totalPairs = numPairs;
    }
}
