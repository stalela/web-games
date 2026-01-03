import { LalelaGame } from '../utils/LalelaGame.js';

export class CalcudokuGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'CalcudokuGame',
            title: 'Calcudoku',
            description: 'Fill the grid so that every row and column contains the digits. Follow the math rules in the cages.',
            category: 'math'
        });
    }

    setupGameLogic() {
        this.gridSize = 4;
        this.cellSize = 80;
        this.offsetX = (this.cameras.main.width - this.gridSize * this.cellSize) / 2;
        this.offsetY = (this.cameras.main.height - this.gridSize * this.cellSize) / 2;
        
        // Level data from GCompris asset (simplified)
        this.cages = [
            { indexes: [0, 4, 5], result: 6, operator: "*" },
            { indexes: [8, 12], result: 1, operator: "-" },
            { indexes: [1, 2, 6], result: 16, operator: "*" },
            { indexes: [9, 10], result: 1, operator: "-" },
            { indexes: [13], result: 1, operator: "" }, // Single cell
            { indexes: [14, 15], result: 2, operator: "/" }, // : is /
            { indexes: [3, 7, 11], result: 12, operator: "+" }
        ];
        
        this.grid = Array(16).fill(0);
        this.selectedCell = -1;
        
        this.drawGrid();
        this.createNumberPad();
    }
    
    drawGrid() {
        if (this.gridContainer) this.gridContainer.destroy();
        this.gridContainer = this.add.container(0, 0);
        
        // Draw Cages
        const g = this.add.graphics();
        g.lineStyle(4, 0xFFFFFF);
        
        this.cages.forEach(cage => {
            // Draw cage borders (simplified: just outline the cells)
            // A proper implementation would merge borders.
            // For now, draw a rectangle for each cell, but maybe color coded?
            // Or just draw the text in the top-left of the first cell.
            
            const firstIdx = cage.indexes[0];
            const r = Math.floor(firstIdx / this.gridSize);
            const c = firstIdx % this.gridSize;
            const x = this.offsetX + c * this.cellSize;
            const y = this.offsetY + r * this.cellSize;
            
            const op = cage.operator === ':' ? '/' : cage.operator;
            const label = `${cage.result}${op}`;
            
            const txt = this.add.text(x + 5, y + 5, label, {
                fontSize: '16px',
                color: '#FFFF00'
            });
            this.gridContainer.add(txt);
            
            // Highlight cage cells slightly
            cage.indexes.forEach(idx => {
                const cr = Math.floor(idx / this.gridSize);
                const cc = idx % this.gridSize;
                const cx = this.offsetX + cc * this.cellSize;
                const cy = this.offsetY + cr * this.cellSize;
                
                const bg = this.add.rectangle(cx + this.cellSize/2, cy + this.cellSize/2, this.cellSize - 4, this.cellSize - 4, 0x34495e);
                bg.setInteractive();
                bg.on('pointerdown', () => this.selectCell(idx));
                this.gridContainer.add(bg);
                
                // Draw value if set
                if (this.grid[idx] !== 0) {
                    const valTxt = this.add.text(cx + this.cellSize/2, cy + this.cellSize/2, this.grid[idx], {
                        fontSize: '32px',
                        color: '#FFFFFF'
                    }).setOrigin(0.5);
                    this.gridContainer.add(valTxt);
                }
                
                // Highlight selection
                if (this.selectedCell === idx) {
                    g.lineStyle(4, 0x3498db);
                    g.strokeRect(cx, cy, this.cellSize, this.cellSize);
                } else {
                    g.lineStyle(2, 0x7f8c8d);
                    g.strokeRect(cx, cy, this.cellSize, this.cellSize);
                }
            });
        });
        
        this.gridContainer.add(g);
    }
    
    selectCell(idx) {
        this.selectedCell = idx;
        this.drawGrid();
    }
    
    createNumberPad() {
        const startX = this.offsetX + this.gridSize * this.cellSize + 50;
        const startY = this.offsetY;
        
        for (let i = 1; i <= this.gridSize; i++) {
            const btn = this.add.container(startX, startY + (i-1) * 60);
            const bg = this.add.rectangle(0, 0, 50, 50, 0x95a5a6);
            const txt = this.add.text(0, 0, i, { fontSize: '24px', color: '#FFF' }).setOrigin(0.5);
            
            bg.setInteractive();
            bg.on('pointerdown', () => this.fillNumber(i));
            
            btn.add([bg, txt]);
        }
        
        // Clear button
        const clearBtn = this.add.text(startX, startY + this.gridSize * 60 + 20, 'X', {
            fontSize: '32px', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive();
        clearBtn.on('pointerdown', () => this.fillNumber(0));
        
        // Check button
        const checkBtn = this.add.text(this.cameras.main.centerX, this.offsetY + this.gridSize * this.cellSize + 50, 'Check', {
            fontSize: '32px', backgroundColor: '#2ecc71', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        checkBtn.on('pointerdown', () => this.checkSolution());
    }
    
    fillNumber(num) {
        if (this.selectedCell !== -1) {
            this.grid[this.selectedCell] = num;
            this.drawGrid();
        }
    }
    
    checkSolution() {
        // 1. Check row/col uniqueness
        for (let i = 0; i < this.gridSize; i++) {
            const row = new Set();
            const col = new Set();
            for (let j = 0; j < this.gridSize; j++) {
                const rVal = this.grid[i * this.gridSize + j];
                const cVal = this.grid[j * this.gridSize + i];
                if (rVal === 0 || row.has(rVal)) return this.showError();
                if (cVal === 0 || col.has(cVal)) return this.showError();
                row.add(rVal);
                col.add(cVal);
            }
        }
        
        // 2. Check cages
        for (const cage of this.cages) {
            const values = cage.indexes.map(idx => this.grid[idx]);
            if (values.includes(0)) return this.showError();
            
            // Sort values descending for subtraction/division
            values.sort((a, b) => b - a);
            
            let result = values[0];
            if (cage.operator === '+') {
                result = values.reduce((a, b) => a + b, 0);
            } else if (cage.operator === '*') {
                result = values.reduce((a, b) => a * b, 1);
            } else if (cage.operator === '-') {
                result = values.reduce((a, b) => a - b); // b-a since sorted? No, subtraction is usually 2 numbers.
                // If more than 2, it's tricky. But usually 2.
                // For 2: a-b = target OR b-a = target.
                // Since sorted, a-b.
            } else if (cage.operator === '/' || cage.operator === ':') {
                result = values.reduce((a, b) => a / b);
            } else if (cage.operator === '') {
                result = values[0];
            }
            
            if (result !== cage.result) return this.showError();
        }
        
        this.completeLevel();
    }
    
    showError() {
        this.cameras.main.shake(200, 0.01);
    }
}
