import { LalelaGame } from '../utils/LalelaGame.js';

export class MazeGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'MazeGame',
            title: 'Maze',
            description: 'Find your way out of the maze.',
            category: 'strategy'
        });
    }

    setupGameLogic() {
        this.cols = 10 + (this.level * 2);
        this.rows = 8 + (this.level * 2);
        this.cellSize = Math.min(
            (this.cameras.main.width - 100) / this.cols,
            (this.cameras.main.height - 150) / this.rows
        );
        
        this.offsetX = (this.cameras.main.width - this.cols * this.cellSize) / 2;
        this.offsetY = (this.cameras.main.height - this.rows * this.cellSize) / 2;
        
        this.generateMaze();
        this.drawMaze();
        this.createPlayer();
        this.createControls();
    }
    
    generateMaze() {
        // Simple DFS maze generation
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = {
                    visited: false,
                    walls: { top: true, right: true, bottom: true, left: true }
                };
            }
        }
        
        const stack = [];
        const start = { r: 0, c: 0 };
        this.grid[0][0].visited = true;
        stack.push(start);
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.r, current.c);
            
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWalls(current, next);
                this.grid[next.r][next.c].visited = true;
                stack.push(next);
            } else {
                stack.pop();
            }
        }
    }
    
    getUnvisitedNeighbors(r, c) {
        const neighbors = [];
        if (r > 0 && !this.grid[r - 1][c].visited) neighbors.push({ r: r - 1, c: c });
        if (r < this.rows - 1 && !this.grid[r + 1][c].visited) neighbors.push({ r: r + 1, c: c });
        if (c > 0 && !this.grid[r][c - 1].visited) neighbors.push({ r: r, c: c - 1 });
        if (c < this.cols - 1 && !this.grid[r][c + 1].visited) neighbors.push({ r: r, c: c + 1 });
        return neighbors;
    }
    
    removeWalls(curr, next) {
        const dr = next.r - curr.r;
        const dc = next.c - curr.c;
        
        if (dr === 1) {
            this.grid[curr.r][curr.c].walls.bottom = false;
            this.grid[next.r][next.c].walls.top = false;
        } else if (dr === -1) {
            this.grid[curr.r][curr.c].walls.top = false;
            this.grid[next.r][next.c].walls.bottom = false;
        } else if (dc === 1) {
            this.grid[curr.r][curr.c].walls.right = false;
            this.grid[next.r][next.c].walls.left = false;
        } else if (dc === -1) {
            this.grid[curr.r][curr.c].walls.left = false;
            this.grid[next.r][next.c].walls.right = false;
        }
    }
    
    drawMaze() {
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(4, 0xFFFFFF);
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = this.offsetX + c * this.cellSize;
                const y = this.offsetY + r * this.cellSize;
                const cell = this.grid[r][c];
                
                if (cell.walls.top) {
                    this.graphics.moveTo(x, y);
                    this.graphics.lineTo(x + this.cellSize, y);
                }
                if (cell.walls.right) {
                    this.graphics.moveTo(x + this.cellSize, y);
                    this.graphics.lineTo(x + this.cellSize, y + this.cellSize);
                }
                if (cell.walls.bottom) {
                    this.graphics.moveTo(x, y + this.cellSize);
                    this.graphics.lineTo(x + this.cellSize, y + this.cellSize);
                }
                if (cell.walls.left) {
                    this.graphics.moveTo(x, y);
                    this.graphics.lineTo(x, y + this.cellSize);
                }
            }
        }
        this.graphics.strokePath();
        
        // Exit
        const exitX = this.offsetX + (this.cols - 1) * this.cellSize + this.cellSize / 2;
        const exitY = this.offsetY + (this.rows - 1) * this.cellSize + this.cellSize / 2;
        this.add.circle(exitX, exitY, this.cellSize / 3, 0x00FF00);
    }
    
    createPlayer() {
        const x = this.offsetX + this.cellSize / 2;
        const y = this.offsetY + this.cellSize / 2;
        this.player = this.add.circle(x, y, this.cellSize / 3, 0xFF0000);
        this.playerPos = { r: 0, c: 0 };
    }
    
    createControls() {
        this.input.keyboard.on('keydown', (event) => {
            switch (event.code) {
                case 'ArrowUp': this.movePlayer(-1, 0); break;
                case 'ArrowDown': this.movePlayer(1, 0); break;
                case 'ArrowLeft': this.movePlayer(0, -1); break;
                case 'ArrowRight': this.movePlayer(0, 1); break;
            }
        });
        
        // Add mobile controls (simple buttons)
        this.createMobileControls();
    }
    
    movePlayer(dr, dc) {
        const curr = this.playerPos;
        const nextR = curr.r + dr;
        const nextC = curr.c + dc;
        
        // Check bounds
        if (nextR < 0 || nextR >= this.rows || nextC < 0 || nextC >= this.cols) return;
        
        // Check walls
        const cell = this.grid[curr.r][curr.c];
        if (dr === -1 && cell.walls.top) return;
        if (dr === 1 && cell.walls.bottom) return;
        if (dc === -1 && cell.walls.left) return;
        if (dc === 1 && cell.walls.right) return;
        
        // Move
        this.playerPos = { r: nextR, c: nextC };
        this.player.x = this.offsetX + nextC * this.cellSize + this.cellSize / 2;
        this.player.y = this.offsetY + nextR * this.cellSize + this.cellSize / 2;
        
        // Check win
        if (nextR === this.rows - 1 && nextC === this.cols - 1) {
            this.completeLevel();
        }
    }
}
