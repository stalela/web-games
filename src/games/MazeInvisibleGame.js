import { MazeGame } from './MazeGame.js';

export class MazeInvisibleGame extends MazeGame {
    constructor(config) {
        super({
            ...config,
            key: 'MazeInvisibleGame',
            title: 'Invisible Maze',
            description: 'Navigate the invisible maze. Walls appear when you hit them.',
            category: 'strategy'
        });
    }

    drawMaze() {
        // Initialize graphics but don't draw walls yet
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(4, 0xFFFFFF);
        
        // Draw exit
        const exitX = this.offsetX + (this.cols - 1) * this.cellSize + this.cellSize / 2;
        const exitY = this.offsetY + (this.rows - 1) * this.cellSize + this.cellSize / 2;
        this.add.circle(exitX, exitY, this.cellSize / 3, 0x00FF00);
        
        // Store wall lines for on-demand drawing
        this.wallLines = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = this.offsetX + c * this.cellSize;
                const y = this.offsetY + r * this.cellSize;
                const cell = this.grid[r][c];
                
                if (cell.walls.top) this.wallLines.push({ x1: x, y1: y, x2: x + this.cellSize, y2: y, key: `${r},${c},top` });
                if (cell.walls.right) this.wallLines.push({ x1: x + this.cellSize, y1: y, x2: x + this.cellSize, y2: y + this.cellSize, key: `${r},${c},right` });
                if (cell.walls.bottom) this.wallLines.push({ x1: x, y1: y + this.cellSize, x2: x + this.cellSize, y2: y + this.cellSize, key: `${r},${c},bottom` });
                if (cell.walls.left) this.wallLines.push({ x1: x, y1: y, x2: x, y2: y + this.cellSize, key: `${r},${c},left` });
            }
        }
    }

    movePlayer(dr, dc) {
        const curr = this.playerPos;
        const nextR = curr.r + dr;
        const nextC = curr.c + dc;
        
        // Check bounds
        if (nextR < 0 || nextR >= this.rows || nextC < 0 || nextC >= this.cols) return;
        
        // Check walls
        const cell = this.grid[curr.r][curr.c];
        let hitWall = false;
        let wallKey = '';
        
        if (dr === -1 && cell.walls.top) { hitWall = true; wallKey = `${curr.r},${curr.c},top`; }
        else if (dr === 1 && cell.walls.bottom) { hitWall = true; wallKey = `${curr.r},${curr.c},bottom`; }
        else if (dc === -1 && cell.walls.left) { hitWall = true; wallKey = `${curr.r},${curr.c},left`; }
        else if (dc === 1 && cell.walls.right) { hitWall = true; wallKey = `${curr.r},${curr.c},right`; }
        
        if (hitWall) {
            this.showWall(wallKey);
            return;
        }
        
        // Move
        this.playerPos = { r: nextR, c: nextC };
        this.player.x = this.offsetX + nextC * this.cellSize + this.cellSize / 2;
        this.player.y = this.offsetY + nextR * this.cellSize + this.cellSize / 2;
        
        // Check win
        if (nextR === this.rows - 1 && nextC === this.cols - 1) {
            this.completeLevel();
        }
    }
    
    showWall(key) {
        const wall = this.wallLines.find(w => w.key === key);
        if (wall) {
            const g = this.add.graphics();
            g.lineStyle(4, 0xFF0000);
            g.moveTo(wall.x1, wall.y1);
            g.lineTo(wall.x2, wall.y2);
            g.strokePath();
            
            this.tweens.add({
                targets: g,
                alpha: 0,
                duration: 1000,
                onComplete: () => g.destroy()
            });
        }
    }
}
