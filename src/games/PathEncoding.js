import { LalelaGame } from '../utils/LalelaGame.js';

export class PathEncoding extends LalelaGame {
    constructor() {
        super();
        this.gridSize = 5;
        this.cellSize = 60;
        this.tuxPos = { x: 0, y: 0 };
        this.targetPos = { x: 4, y: 4 };
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xC5CAE9)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Guide Tux to the Target", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);

        // Create controls
        this.createControls();
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.tuxPos = { x: 0, y: 0 };
        this.targetPos = { 
            x: Phaser.Math.Between(2, 4), 
            y: Phaser.Math.Between(2, 4) 
        };
        this.drawGrid();
    }

    drawGrid() {
        if (this.gridContainer) this.gridContainer.destroy();
        this.gridContainer = this.add.container(this.cameras.main.centerX - 150, this.cameras.main.centerY - 100);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.add.rectangle(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize - 2,
                    this.cellSize - 2,
                    0xffffff
                ).setOrigin(0).addToContainer(this.gridContainer);
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

    createControls() {
        const startX = this.cameras.main.centerX;
        const startY = this.cameras.main.height - 100;
        const size = 60;
        const gap = 10;

        // Up
        this.createButton(startX, startY - size - gap, '↑', () => this.moveTux(0, -1));
        // Down
        this.createButton(startX, startY + size + gap, '↓', () => this.moveTux(0, 1));
        // Left
        this.createButton(startX - size - gap, startY, '←', () => this.moveTux(-1, 0));
        // Right
        this.createButton(startX + size + gap, startY, '→', () => this.moveTux(1, 0));
    }

    createButton(x, y, label, callback) {
        let btn = this.add.container(x, y);
        let bg = this.add.circle(0, 0, 30, 0x3f51b5).setInteractive();
        let text = this.add.text(0, 0, label, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
        
        btn.add([bg, text]);
        
        bg.on('pointerdown', () => {
            bg.setFillStyle(0x303f9f);
            callback();
        });
        bg.on('pointerup', () => bg.setFillStyle(0x3f51b5));
        bg.on('pointerout', () => bg.setFillStyle(0x3f51b5));
    }

    moveTux(dx, dy) {
        let newX = this.tuxPos.x + dx;
        let newY = this.tuxPos.y + dy;

        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            this.tuxPos.x = newX;
            this.tuxPos.y = newY;
            
            this.tweens.add({
                targets: this.tux,
                x: newX * this.cellSize + this.cellSize/2,
                y: newY * this.cellSize + this.cellSize/2,
                duration: 200
            });
            
            this.audioManager.play('click');

            if (newX === this.targetPos.x && newY === this.targetPos.y) {
                this.audioManager.play('success');
                this.time.delayedCall(1000, () => this.startLevel());
            }
        } else {
            this.audioManager.play('error');
        }
    }
}
