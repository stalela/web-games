import { MemoryTuxBaseGame } from './MemoryTuxBaseGame.js';

export class MemoryMathAddMinusTuxGame extends MemoryTuxBaseGame {
    constructor() {
        super({
            key: 'MemoryMathAddMinusTuxGame',
            title: 'Memory Addition/Subtraction Tux',
            description: 'Match operations (+ and -) with results against Tux.',
            category: 'math'
        });
    }

    setupLevel() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        while (operations.length < numPairs) {
            const isAdd = Math.random() > 0.5;
            let opString, result;

            if (isAdd) {
                const a = Math.floor(Math.random() * 9) + 1;
                const b = Math.floor(Math.random() * 9) + 1;
                result = a + b;
                opString = `${a} + ${b}`;
            } else {
                const a = Math.floor(Math.random() * 18) + 2;
                const b = Math.floor(Math.random() * (a - 1)) + 1;
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
        
        super.setupLevel();
    }
}
