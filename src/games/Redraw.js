import { LalelaGame } from '../utils/LalelaGame.js';

export class Redraw extends LalelaGame {
    constructor() {
        super();
        this.gridSize = 5;
        this.cellSize = 50;
        this.colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x000000, 0xffffff];
        this.selectedColorIndex = 0;
        this.modelGrid = [];
        this.playerGrid = [];
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x424242)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Redraw the Image", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.createPalette();
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.generateModel();
        this.createGrids();
    }

    generateModel() {
        this.modelGrid = [];
        for (let y = 0; y < this.gridSize; y++) {
            let row = [];
            for (let x = 0; x < this.gridSize; x++) {
                // 50% chance of color, 50% white
                if (Math.random() > 0.5) {
                    row.push(Phaser.Math.RND.pick(this.colors));
                } else {
                    row.push(0xffffff);
                }
            }
            this.modelGrid.push(row);
        }
        
        this.playerGrid = [];
        for (let y = 0; y < this.gridSize; y++) {
            let row = [];
            for (let x = 0; x < this.gridSize; x++) {
                row.push(0xffffff);
            }
            this.playerGrid.push(row);
        }
    }

    createGrids() {
        if (this.gridsContainer) this.gridsContainer.destroy();
        this.gridsContainer = this.add.container(0, 0);

        const startX = this.cameras.main.centerX - 300;
        const startY = this.cameras.main.centerY - 100;
        const gap = 2;

        // Model Grid
        this.add.text(startX + (this.gridSize * this.cellSize) / 2, startY - 40, "Model", { fontSize: '24px', color: '#fff' }).setOrigin(0.5).addToContainer(this.gridsContainer);
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.add.rectangle(
                    startX + x * (this.cellSize + gap),
                    startY + y * (this.cellSize + gap),
                    this.cellSize,
                    this.cellSize,
                    this.modelGrid[y][x]
                ).setOrigin(0).addToContainer(this.gridsContainer);
            }
        }

        // Player Grid
        const playerStartX = this.cameras.main.centerX + 50;
        this.add.text(playerStartX + (this.gridSize * this.cellSize) / 2, startY - 40, "Your Drawing", { fontSize: '24px', color: '#fff' }).setOrigin(0.5).addToContainer(this.gridsContainer);
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                let cell = this.add.rectangle(
                    playerStartX + x * (this.cellSize + gap),
                    startY + y * (this.cellSize + gap),
                    this.cellSize,
                    this.cellSize,
                    this.playerGrid[y][x]
                ).setOrigin(0).setInteractive();

                cell.on('pointerdown', () => {
                    const color = this.colors[this.selectedColorIndex];
                    cell.fillColor = color;
                    this.playerGrid[y][x] = color;
                    this.checkWinCondition();
                });
                
                // Drag to paint
                cell.on('pointerover', () => {
                    if (this.input.activePointer.isDown) {
                        const color = this.colors[this.selectedColorIndex];
                        cell.fillColor = color;
                        this.playerGrid[y][x] = color;
                        this.checkWinCondition();
                    }
                });

                this.gridsContainer.add(cell);
            }
        }
    }

    createPalette() {
        const startX = this.cameras.main.centerX - (this.colors.length * 60) / 2;
        const startY = this.cameras.main.height - 100;

        this.paletteSelection = this.add.graphics();
        
        this.colors.forEach((color, index) => {
            let swatch = this.add.rectangle(startX + index * 60, startY, 50, 50, color)
                .setInteractive();
            
            swatch.on('pointerdown', () => {
                this.selectedColorIndex = index;
                this.updatePaletteSelection(startX + index * 60, startY);
            });

            if (index === 0) {
                this.updatePaletteSelection(startX, startY);
            }
        });
    }

    updatePaletteSelection(x, y) {
        this.paletteSelection.clear();
        this.paletteSelection.lineStyle(4, 0xffffff);
        this.paletteSelection.strokeRect(x - 27, y - 27, 54, 54);
    }

    checkWinCondition() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.playerGrid[y][x] !== this.modelGrid[y][x]) {
                    return;
                }
            }
        }
        
        this.audioManager.play('success');
        this.time.delayedCall(1000, () => {
            this.startLevel();
        });
    }
}
