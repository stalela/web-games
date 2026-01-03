import { LalelaGame } from '../utils/LalelaGame.js';

export class SudokuGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'SudokuGame',
            title: 'Sudoku',
            description: 'Fill the grid so that every row, column, and 2x2 box contains the digits 1-4.',
            category: 'math'
        });
    }

    setupGameLogic() {
        this.gridSize = 4;
        this.boxSize = 2;
        this.cellSize = 80;
        this.offsetX = (this.cameras.main.width - this.gridSize * this.cellSize) / 2;
        this.offsetY = (this.cameras.main.height - this.gridSize * this.cellSize) / 2;
        
        // Simple 4x4 puzzle
        // Solution:
        // 1 2 3 4
        // 3 4 1 2
        // 2 1 4 3
        // 4 3 2 1
        
        // Initial state (0 = empty)
        this.initialGrid = [
            1, 0, 0, 4,
            0, 4, 1, 0,
            0, 1, 4, 0,
            4, 0, 0, 1
        ];
        
        this.grid = [...this.initialGrid];
        this.selectedCell = -1;
        
        this.drawGrid();
        this.createNumberPad();
    }
    
    drawGrid() {
        if (this.gridContainer) this.gridContainer.destroy();
        this.gridContainer = this.add.container(0, 0);
        
        const g = this.add.graphics();
        
        for (let i = 0; i < 16; i++) {
            const r = Math.floor(i / this.gridSize);
            const c = i % this.gridSize;
            const x = this.offsetX + c * this.cellSize;
            const y = this.offsetY + r * this.cellSize;
            
            const isFixed = this.initialGrid[i] !== 0;
            
            // Cell bg
            const bg = this.add.rectangle(x + this.cellSize/2, y + this.cellSize/2, this.cellSize - 2, this.cellSize - 2, isFixed ? 0x7f8c8d : 0x34495e);
            if (!isFixed) {
                bg.setInteractive();
                bg.on('pointerdown', () => this.selectCell(i));
            }
            this.gridContainer.add(bg);
            
            // Value
            if (this.grid[i] !== 0) {
                const txt = this.add.text(x + this.cellSize/2, y + this.cellSize/2, this.grid[i], {
                    fontSize: '32px',
                    color: isFixed ? '#000000' : '#FFFFFF'
                }).setOrigin(0.5);
                this.gridContainer.add(txt);
            }
            
            // Selection
            if (this.selectedCell === i) {
                g.lineStyle(4, 0x3498db);
                g.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
        
        // Draw thick lines for boxes
        g.lineStyle(4, 0xFFFFFF);
        g.moveTo(this.offsetX + 2 * this.cellSize, this.offsetY);
        g.lineTo(this.offsetX + 2 * this.cellSize, this.offsetY + 4 * this.cellSize);
        
        g.moveTo(this.offsetX, this.offsetY + 2 * this.cellSize);
        g.lineTo(this.offsetX + 4 * this.cellSize, this.offsetY + 2 * this.cellSize);
        
        g.strokePath();
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
        
        const clearBtn = this.add.text(startX, startY + this.gridSize * 60 + 20, 'X', {
            fontSize: '32px', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive();
        clearBtn.on('pointerdown', () => this.fillNumber(0));
        
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
        // Check rows, cols, boxes
        for (let i = 0; i < 4; i++) {
            const row = new Set();
            const col = new Set();
            const box = new Set();
            
            for (let j = 0; j < 4; j++) {
                // Row
                const rVal = this.grid[i * 4 + j];
                if (rVal === 0 || row.has(rVal)) return this.showError();
                row.add(rVal);
                
                // Col
                const cVal = this.grid[j * 4 + i];
                if (cVal === 0 || col.has(cVal)) return this.showError();
                col.add(cVal);
                
                // Box
                const br = Math.floor(i / 2) * 2 + Math.floor(j / 2);
                const bc = (i % 2) * 2 + (j % 2);
                const bVal = this.grid[br * 4 + bc];
                if (bVal === 0 || box.has(bVal)) return this.showError();
                box.add(bVal);
            }
        }
        
        this.completeLevel();
    }
    
    showError() {
        this.cameras.main.shake(200, 0.01);
    }
}
