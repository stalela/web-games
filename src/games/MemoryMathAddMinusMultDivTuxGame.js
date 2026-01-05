import { MemoryTuxBaseGame } from './MemoryTuxBaseGame.js';

export class MemoryMathAddMinusMultDivTuxGame extends MemoryTuxBaseGame {
    constructor() {
        super({
            key: 'MemoryMathAddMinusMultDivTuxGame',
            title: 'Memory All Ops Tux',
            description: 'Match all math operations with results against Tux.',
            category: 'math'
        });
    }

    setupLevel() {
        const numPairs = Math.min(3 + this.level, 8);
        const operations = [];
        
        while (operations.length < numPairs) {
            const type = Math.floor(Math.random() * 4); // 0: +, 1: -, 2: *, 3: /
            let opString, result;

            if (type === 0) { // Add
                const a = Math.floor(Math.random() * 9) + 1;
                const b = Math.floor(Math.random() * 9) + 1;
                result = a + b;
                opString = `${a} + ${b}`;
            } else if (type === 1) { // Sub
                const a = Math.floor(Math.random() * 18) + 2;
                const b = Math.floor(Math.random() * (a - 1)) + 1;
                result = a - b;
                opString = `${a} - ${b}`;
            } else if (type === 2) { // Mult
                const a = Math.floor(Math.random() * 9) + 1;
                const b = Math.floor(Math.random() * 9) + 1;
                result = a * b;
                opString = `${a} × ${b}`;
            } else { // Div
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
