import { LalelaGame } from '../utils/LalelaGame.js';

export class PathDecoding extends LalelaGame {
    constructor() {
        super();
        this.gridSize = 5;
        this.cellSize = 60;
        this.tuxPos = { x: 0, y: 0 };
        this.targetPos = { x: 4, y: 4 };
        this.path = [];
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xD1C4E9)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Follow the Path", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.generatePath();
        this.drawGrid();
        this.drawPathInstructions();
    }

    generatePath() {
        // Simple path generation: start (0,0) to random target
        this.tuxPos = { x: 0, y: 0 };
        this.targetPos = { x: Phaser.Math.Between(2, 4), y: Phaser.Math.Between(2, 4) };
        
        // BFS or simple random walk to find path
        // For simplicity, let's just move towards target
        let current = { ...this.tuxPos };
        this.path = [];
        
        while (current.x !== this.targetPos.x || current.y !== this.targetPos.y) {
            let moves = [];
            if (current.x < this.targetPos.x) moves.push('right');
            if (current.x > this.targetPos.x) moves.push('left');
            if (current.y < this.targetPos.y) moves.push('down');
            if (current.y > this.targetPos.y) moves.push('up');
            
            let move = Phaser.Math.RND.pick(moves);
            this.path.push(move);
            
            if (move === 'right') current.x++;
            else if (move === 'left') current.x--;
            else if (move === 'down') current.y++;
            else if (move === 'up') current.y--;
        }
    }

    drawGrid() {
        if (this.gridContainer) this.gridContainer.destroy();
        this.gridContainer = this.add.container(this.cameras.main.centerX - 150, this.cameras.main.centerY - 100);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                let cell = this.add.rectangle(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize - 2,
                    this.cellSize - 2,
                    0xffffff
                ).setOrigin(0).setInteractive();
                
                cell.gridX = x;
                cell.gridY = y;
                cell.on('pointerdown', () => this.onCellClick(x, y));
                
                this.gridContainer.add(cell);
            }
        }

        // Draw Tux
        this.tux = this.add.circle(
            this.tuxPos.x * this.cellSize + this.cellSize/2,
            this.tuxPos.y * this.cellSize + this.cellSize/2,
            20, 0x000000
        );
        this.gridContainer.add(this.tux);

        // Draw Target
        this.target = this.add.star(
            this.targetPos.x * this.cellSize + this.cellSize/2,
            this.targetPos.y * this.cellSize + this.cellSize/2,
            5, 10, 20, 0xffd700
        );
        this.gridContainer.add(this.target);
    }

    drawPathInstructions() {
        if (this.instructionsContainer) this.instructionsContainer.destroy();
        this.instructionsContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.height - 100);

        let x = -((this.path.length * 40) / 2);
        this.path.forEach((dir, index) => {
            let text = "";
            if (dir === 'right') text = "→";
            if (dir === 'left') text = "←";
            if (dir === 'up') text = "↑";
            if (dir === 'down') text = "↓";

            let arrow = this.add.text(x + index * 40, 0, text, {
                fontSize: '32px',
                color: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.instructionsContainer.add(arrow);
        });
    }

    onCellClick(x, y) {
        // Check if clicked cell is valid next move
        // This implementation expects user to click the path step by step
        // Or maybe just click the destination?
        // GCompris Path Decoding: "Click on the grid squares following the given directions"
        
        // Let's assume we need to click the next cell in the path
        if (this.path.length === 0) return;

        let nextDir = this.path[0];
        let expectedX = this.tuxPos.x;
        let expectedY = this.tuxPos.y;

        if (nextDir === 'right') expectedX++;
        else if (nextDir === 'left') expectedX--;
        else if (nextDir === 'down') expectedY++;
        else if (nextDir === 'up') expectedY--;

        if (x === expectedX && y === expectedY) {
            this.tuxPos = { x, y };
            this.tweens.add({
                targets: this.tux,
                x: x * this.cellSize + this.cellSize/2,
                y: y * this.cellSize + this.cellSize/2,
                duration: 200
            });
            this.path.shift(); // Remove first instruction
            this.drawPathInstructions(); // Redraw instructions (removing the done one)
            this.audioManager.play('click');

            if (this.path.length === 0) {
                this.audioManager.play('success');
                this.time.delayedCall(1000, () => this.startLevel());
            }
        } else {
            this.audioManager.play('error');
        }
    }
}
