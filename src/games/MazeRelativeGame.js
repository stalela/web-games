import { MazeGame } from './MazeGame.js';

export class MazeRelativeGame extends MazeGame {
    constructor(config) {
        super({
            ...config,
            key: 'MazeRelativeGame',
            title: 'Relative Maze',
            description: 'Navigate the maze using relative controls (Forward, Turn Left, Turn Right).',
            category: 'strategy'
        });
    }

    createPlayer() {
        const x = this.offsetX + this.cellSize / 2;
        const y = this.offsetY + this.cellSize / 2;
        
        // Player is a triangle to show direction
        this.player = this.add.triangle(x, y, 0, 10, 10, 10, 5, 0, 0xFF0000);
        this.playerPos = { r: 0, c: 0 };
        this.direction = 0; // 0: Up, 1: Right, 2: Down, 3: Left
        this.updatePlayerRotation();
    }
    
    updatePlayerRotation() {
        this.player.setRotation(this.direction * (Math.PI / 2));
    }

    createControls() {
        this.input.keyboard.on('keydown', (event) => {
            switch (event.code) {
                case 'ArrowUp': this.moveForward(); break;
                case 'ArrowLeft': this.turnLeft(); break;
                case 'ArrowRight': this.turnRight(); break;
            }
        });
        
        // Mobile controls need to be adapted for relative movement
        // For now, we'll rely on the keyboard or implement custom UI buttons later
    }
    
    turnLeft() {
        this.direction = (this.direction + 3) % 4;
        this.updatePlayerRotation();
    }
    
    turnRight() {
        this.direction = (this.direction + 1) % 4;
        this.updatePlayerRotation();
    }
    
    moveForward() {
        let dr = 0;
        let dc = 0;
        
        switch (this.direction) {
            case 0: dr = -1; break; // Up
            case 1: dc = 1; break;  // Right
            case 2: dr = 1; break;  // Down
            case 3: dc = -1; break; // Left
        }
        
        this.movePlayer(dr, dc);
    }
}
