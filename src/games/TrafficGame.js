import { LalelaGame } from '../utils/LalelaGame.js';

export class TrafficGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'TrafficGame',
            title: 'Traffic',
            description: 'Slide the cars to let the red car out.',
            category: 'strategy'
        });
    }

    setupGameLogic() {
        this.levels = [
            "XD3,O2F",
            "XD3,A4C,O2F,PD5",
            "XC3,A2E,BE5,O2F,P4B",
            "XB3,AB1,B2E,C2F,D4C,OD1,PD4",
            "XC3,A3F,BE6,O2E,PD5,Q2B",
            "XB3,AE5,O2F,P4D",
            "XB3,A2F,B4C,OD4,PB6,QA1,RD1",
            "XC3,AC2,B3B,C4C,O2F,PD5",
            "XD3,AB2,B4D,CE5,O2F",
            "XC3,A1F,B2E,CD4,DE6,E5D,O3F"
        ];
        
        this.currentLevelIndex = (this.level - 1) % this.levels.length;
        this.gridSize = 6;
        this.cellSize = Math.min(
            (this.cameras.main.width - 100) / this.gridSize,
            (this.cameras.main.height - 150) / this.gridSize
        );
        
        this.offsetX = (this.cameras.main.width - this.gridSize * this.cellSize) / 2;
        this.offsetY = (this.cameras.main.height - this.gridSize * this.cellSize) / 2;
        
        this.loadLevel(this.levels[this.currentLevelIndex]);
    }
    
    loadLevel(levelString) {
        this.cars = [];
        const carDefs = levelString.split(',');
        
        carDefs.forEach(def => {
            const id = def[0];
            const xChar = def[1];
            const yChar = def[2];
            
            let type, size, color, x, y, orientation;
            
            // Determine size and color based on ID
            if (id === 'X') {
                size = 2;
                color = 0xFF0000; // Red
                type = 'goal';
            } else if (id >= 'A' && id <= 'K') {
                size = 2;
                color = this.getColorForId(id);
                type = 'normal';
            } else if (id >= 'O' && id <= 'R') {
                size = 3;
                color = this.getColorForId(id);
                type = 'truck';
            }
            
            // Determine orientation and position
            // X char: 1-6 (Vertical), A-F (Horizontal)
            // Y char: 1-6 (Horizontal), A-F (Vertical)
            
            const isDigit = (c) => c >= '1' && c <= '6';
            const charToVal = (c) => c.charCodeAt(0) - 'A'.charCodeAt(0);
            const digitToVal = (c) => parseInt(c) - 1;
            
            if (isDigit(xChar)) {
                // Vertical
                orientation = 'vertical';
                x = digitToVal(xChar);
                y = charToVal(yChar);
            } else {
                // Horizontal
                orientation = 'horizontal';
                x = charToVal(xChar);
                y = digitToVal(yChar);
            }
            
            this.createCar(x, y, size, orientation, color, type);
        });
        
        this.drawGrid();
    }
    
    getColorForId(id) {
        // Simple hash for color
        const colors = [0x0000FF, 0x00FF00, 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFFA500, 0x800080, 0x008000, 0x000080, 0x808000];
        const index = (id.charCodeAt(0) - 'A'.charCodeAt(0)) % colors.length;
        return colors[index];
    }
    
    createCar(gridX, gridY, size, orientation, color, type) {
        const width = orientation === 'horizontal' ? size * this.cellSize : this.cellSize;
        const height = orientation === 'vertical' ? size * this.cellSize : this.cellSize;
        const x = this.offsetX + gridX * this.cellSize + width / 2;
        const y = this.offsetY + gridY * this.cellSize + height / 2;
        
        const car = this.add.rectangle(x, y, width - 4, height - 4, color);
        car.setInteractive({ draggable: true });
        
        car.gridX = gridX;
        car.gridY = gridY;
        car.size = size;
        car.orientation = orientation;
        car.isGoal = (type === 'goal');
        
        this.input.setDraggable(car);
        this.cars.push(car);
        
        car.on('drag', (pointer, dragX, dragY) => {
            if (car.orientation === 'horizontal') {
                // Constrain to row
                const minX = this.offsetX + (car.size * this.cellSize) / 2;
                const maxX = this.offsetX + (this.gridSize * this.cellSize) - (car.size * this.cellSize) / 2; // Allow moving out if goal? No, goal is exit.
                
                // For goal car, allow moving to exit (right side)
                // But for now, keep inside grid, check win condition separately
                
                // Clamp dragX
                // We need to check collisions with other cars
                // This is tricky with continuous drag.
                // Easier to snap to grid or check bounds dynamically.
                
                // Simple approach: Update position visually, snap on release.
                // Better: Constrain movement based on available space.
                
                car.x = Phaser.Math.Clamp(dragX, this.offsetX + width/2, this.offsetX + this.gridSize * this.cellSize - width/2 + (car.isGoal ? this.cellSize : 0));
                car.y = y; // Lock Y
            } else {
                car.x = x; // Lock X
                car.y = Phaser.Math.Clamp(dragY, this.offsetY + height/2, this.offsetY + this.gridSize * this.cellSize - height/2);
            }
        });
        
        car.on('dragend', () => {
            // Snap to grid
            const relativeX = car.x - this.offsetX - width/2;
            const relativeY = car.y - this.offsetY - height/2;
            
            let newGridX = Math.round(relativeX / this.cellSize);
            let newGridY = Math.round(relativeY / this.cellSize);
            
            // Validate move (check collisions)
            if (this.isValidMove(car, newGridX, newGridY)) {
                car.gridX = newGridX;
                car.gridY = newGridY;
                
                // Animate snap
                this.tweens.add({
                    targets: car,
                    x: this.offsetX + newGridX * this.cellSize + width/2,
                    y: this.offsetY + newGridY * this.cellSize + height/2,
                    duration: 200
                });
                
                if (car.isGoal && car.gridX === this.gridSize - 2) { // Reached edge?
                     // Actually goal is usually to get the red car to the exit on the right.
                     // The exit is usually at row 2 (3rd row).
                     if (car.gridX >= this.gridSize - 2) {
                         this.completeLevel();
                     }
                }
            } else {
                // Revert
                this.tweens.add({
                    targets: car,
                    x: this.offsetX + car.gridX * this.cellSize + width/2,
                    y: this.offsetY + car.gridY * this.cellSize + height/2,
                    duration: 200
                });
            }
        });
    }
    
    isValidMove(movedCar, newX, newY) {
        // Check bounds
        if (newX < 0 || newY < 0) return false;
        if (movedCar.orientation === 'horizontal') {
            if (newX + movedCar.size > this.gridSize) {
                // Allow goal car to exit
                if (movedCar.isGoal && newX + movedCar.size > this.gridSize) return true; 
                return false;
            }
        } else {
            if (newY + movedCar.size > this.gridSize) return false;
        }
        
        // Check collision with other cars
        // We need to check the path from old pos to new pos?
        // Or just the final position?
        // If we drag through another car, that should be invalid.
        // For simplicity, let's just check if the target cells are occupied by OTHER cars.
        // But this allows "teleporting" through cars if we drag fast.
        // Correct way: Check all cells between old and new.
        
        // Let's just check the final position for now.
        // And maybe intermediate cells if distance > 1.
        
        // Get occupied cells by other cars
        const occupied = new Set();
        this.cars.forEach(c => {
            if (c === movedCar) return;
            for (let i = 0; i < c.size; i++) {
                if (c.orientation === 'horizontal') {
                    occupied.add(`${c.gridX + i},${c.gridY}`);
                } else {
                    occupied.add(`${c.gridX},${c.gridY + i}`);
                }
            }
        });
        
        // Check if moved car overlaps
        // Also check path
        const startX = Math.min(movedCar.gridX, newX);
        const endX = Math.max(movedCar.gridX, newX);
        const startY = Math.min(movedCar.gridY, newY);
        const endY = Math.max(movedCar.gridY, newY);
        
        if (movedCar.orientation === 'horizontal') {
            // Check all cells in the swept path
            // The car occupies [x, x+size-1].
            // If moving from x1 to x2.
            // Path covers min(x1, x2) to max(x1, x2) + size - 1.
            for (let x = startX; x < endX + movedCar.size; x++) {
                if (occupied.has(`${x},${movedCar.gridY}`)) return false;
            }
        } else {
            for (let y = startY; y < endY + movedCar.size; y++) {
                if (occupied.has(`${movedCar.gridX},${y}`)) return false;
            }
        }
        
        return true;
    }
    
    drawGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xFFFFFF, 0.5);
        
        for (let i = 0; i <= this.gridSize; i++) {
            graphics.moveTo(this.offsetX + i * this.cellSize, this.offsetY);
            graphics.lineTo(this.offsetX + i * this.cellSize, this.offsetY + this.gridSize * this.cellSize);
            
            graphics.moveTo(this.offsetX, this.offsetY + i * this.cellSize);
            graphics.lineTo(this.offsetX + this.gridSize * this.cellSize, this.offsetY + i * this.cellSize);
        }
        graphics.strokePath();
        
        // Draw exit marker
        // Usually row 2 (3rd row)
        const exitY = this.offsetY + 2 * this.cellSize;
        graphics.lineStyle(4, 0x00FF00);
        graphics.moveTo(this.offsetX + this.gridSize * this.cellSize, exitY);
        graphics.lineTo(this.offsetX + this.gridSize * this.cellSize, exitY + this.cellSize);
        graphics.strokePath();
    }
}
