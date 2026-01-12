import { MemoryTuxBaseGame } from './MemoryTuxBaseGame.js';

export class MemoryMathMultTuxGame extends MemoryTuxBaseGame {
    constructor() {
        super({
            key: 'MemoryMathMultTuxGame',
            title: 'Memory Multiplication Tux',
            description: 'Match multiplication operations with results against Tux.',
            category: 'math'
        });
    }

    generateCardPairs() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        while (operations.length < numPairs) {
            const a = Math.floor(Math.random() * 9) + 1;
            const b = Math.floor(Math.random() * 9) + 1;
            const result = a * b;
            const opString = `${a} × ${b}`;
            
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
