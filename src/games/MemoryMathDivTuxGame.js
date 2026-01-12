import { MemoryTuxBaseGame } from './MemoryTuxBaseGame.js';

export class MemoryMathDivTuxGame extends MemoryTuxBaseGame {
    constructor() {
        super({
            key: 'MemoryMathDivTuxGame',
            title: 'Memory Division Tux',
            description: 'Match division operations with results against Tux.',
            category: 'math'
        });
    }

    generateCardPairs() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        while (operations.length < numPairs) {
            const b = Math.floor(Math.random() * 9) + 1; // Divisor
            const result = Math.floor(Math.random() * 9) + 1; // Quotient
            const a = b * result; // Dividend
            const opString = `${a} ÷ ${b}`;
            
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
