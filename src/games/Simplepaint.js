import { LalelaGame } from '../utils/LalelaGame.js';

export class Simplepaint extends LalelaGame {
    constructor() {
        super();
        this.gridSize = 10;
        this.cellSize = 40;
        this.colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff, 0x000000, 0xffffff];
        this.selectedColorIndex = 0;
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x333333)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 30, "Simple Paint", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.createPalette();
    }

    setupGameLogic() {
        this.createGrid();
    }

    createGrid() {
        const startX = this.cameras.main.centerX - (this.gridSize * this.cellSize) / 2;
        const startY = this.cameras.main.centerY - (this.gridSize * this.cellSize) / 2;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                let cell = this.add.rectangle(
                    startX + x * this.cellSize,
                    startY + y * this.cellSize,
                    this.cellSize - 1,
                    this.cellSize - 1,
                    0xffffff
                ).setOrigin(0).setInteractive();

                cell.on('pointerdown', () => {
                    cell.fillColor = this.colors[this.selectedColorIndex];
                });
                
                cell.on('pointerover', () => {
                    if (this.input.activePointer.isDown) {
                        cell.fillColor = this.colors[this.selectedColorIndex];
                    }
                });
            }
        }
    }

    createPalette() {
        const startX = this.cameras.main.centerX - (this.colors.length * 50) / 2;
        const startY = this.cameras.main.height - 80;

        this.paletteSelection = this.add.graphics();
        
        this.colors.forEach((color, index) => {
            let swatch = this.add.rectangle(startX + index * 50, startY, 40, 40, color)
                .setInteractive();
            
            swatch.on('pointerdown', () => {
                this.selectedColorIndex = index;
                this.updatePaletteSelection(startX + index * 50, startY);
            });

            if (index === 0) {
                this.updatePaletteSelection(startX, startY);
            }
        });
    }

    updatePaletteSelection(x, y) {
        this.paletteSelection.clear();
        this.paletteSelection.lineStyle(4, 0xffffff);
        this.paletteSelection.strokeRect(x - 22, y - 22, 44, 44);
    }
}
