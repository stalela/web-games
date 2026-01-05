import { MemoryTuxBaseGame } from './MemoryTuxBaseGame.js';

export class MemoryMathMultDivTuxGame extends MemoryTuxBaseGame {
    constructor() {
        super({
            key: 'MemoryMathMultDivTuxGame',
            title: 'Memory Mult/Div Tux',
            description: 'Match multiplication and division operations with results against Tux.',
            category: 'math'
        });
    }

    setupLevel() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        while (operations.length < numPairs) {
            const isMult = Math.random() > 0.5;
            let opString, result;

            if (isMult) {
                const a = Math.floor(Math.random() * 9) + 1;
                const b = Math.floor(Math.random() * 9) + 1;
                result = a * b;
                opString = `${a} × ${b}`;
            } else {
                const b = Math.floor(Math.random() * 9) + 1;
                result = Math.floor(Math.random() * 9) + 1;
                const a = b * result;
                opString = `${a} ÷ ${b}`;
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
        
        super.setupLevel();
    }
}
