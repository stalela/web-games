import { LalelaGame } from '../utils/LalelaGame.js';

export class FriezeGame extends LalelaGame {
    constructor() {
        super({ key: 'FriezeGame' });
        this.shapes = ['square', 'triangle', 'circle', 'star'];
        this.colors = [0xda4343, 0x52d460, 0x48cbdf, 0xf1c43c]; // R, G, B, Y
        this.sizes = [1.0, 0.6]; // Big, Small
        
        this.levels = [
            { patternLength: 2, sequence: [[0,0,0], [1,0,0]] }, // Square Red Big, Triangle Red Big
            { patternLength: 3, sequence: [[0,0,0], [1,1,0], [2,2,0]] },
            { patternLength: 2, sequence: [[0,0,0], [0,1,1]] }, // Square Red Big, Square Green Small
            { patternLength: 4, sequence: [[0,0,0], [1,1,0], [2,2,0], [3,3,0]] }
        ];
    }

    preload() {
        super.preload();
        this.load.svg('square', 'assets/frieze/square.svg');
        this.load.svg('triangle', 'assets/frieze/triangle.svg');
        this.load.svg('circle', 'assets/frieze/circle.svg');
        this.load.svg('star', 'assets/frieze/star.svg');
        this.load.svg('empty', 'assets/frieze/empty.svg');
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x2c3e50).setOrigin(0).setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, "Reproduce the pattern", {
            fontFamily: 'Fredoka One',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.modelContainer = this.add.container(this.cameras.main.centerX, 200);
        this.userContainer = this.add.container(this.cameras.main.centerX, 350);
        this.paletteContainer = this.add.container(this.cameras.main.centerX, 500);
        
        // Check Button
        this.checkButton = this.uiManager.createButton(this, this.cameras.main.width - 100, this.cameras.main.height - 100, 'Check', () => {
            this.checkSolution();
        });
    }

    setupGameLogic() {
        this.currentLevel = 0;
        this.initLevel();
    }

    initLevel() {
        this.userSequence = [];
        this.modelSequence = [];
        
        const levelData = this.levels[this.currentLevel % this.levels.length];
        const pattern = levelData.sequence;
        const totalLength = 8; // Fixed length for now

        // Generate model sequence
        for (let i = 0; i < totalLength; i++) {
            const token = pattern[i % pattern.length];
            this.modelSequence.push(token);
        }

        this.drawModelRow();
        this.drawUserRow();
        this.drawPalette();
    }

    drawModelRow() {
        this.modelContainer.removeAll(true);
        const spacing = 80;
        const startX = -((this.modelSequence.length - 1) * spacing) / 2;

        this.modelSequence.forEach((token, i) => {
            const [shapeIdx, colorIdx, sizeIdx] = token;
            const shape = this.shapes[shapeIdx];
            const color = this.colors[colorIdx];
            const scale = this.sizes[sizeIdx];

            const sprite = this.add.image(startX + i * spacing, 0, shape)
                .setTint(color)
                .setScale(scale * 0.6); // Base scale adjustment
            
            this.modelContainer.add(sprite);
        });
    }

    drawUserRow() {
        this.userContainer.removeAll(true);
        const spacing = 80;
        const startX = -((this.modelSequence.length - 1) * spacing) / 2;

        // Draw slots
        for (let i = 0; i < this.modelSequence.length; i++) {
            const x = startX + i * spacing;
            
            // Slot background
            const slot = this.add.rectangle(x, 0, 70, 70, 0xffffff, 0.1).setInteractive();
            slot.on('pointerdown', () => this.handleSlotClick(i));
            this.userContainer.add(slot);

            // Draw user token if exists
            if (this.userSequence[i]) {
                const [shapeIdx, colorIdx, sizeIdx] = this.userSequence[i];
                const shape = this.shapes[shapeIdx];
                const color = this.colors[colorIdx];
                const scale = this.sizes[sizeIdx];

                const sprite = this.add.image(x, 0, shape)
                    .setTint(color)
                    .setScale(scale * 0.6);
                this.userContainer.add(sprite);
            }
        }
    }

    drawPalette() {
        this.paletteContainer.removeAll(true);
        
        // Current selection state
        if (!this.currentSelection) {
            this.currentSelection = { shape: 0, color: 0, size: 0 };
        }

        // Draw Shape Selectors
        this.shapes.forEach((shape, i) => {
            const btn = this.add.image(-200 + i * 60, -50, shape).setScale(0.4).setInteractive();
            if (i === this.currentSelection.shape) btn.setTint(0xffffff);
            else btn.setTint(0x888888);
            
            btn.on('pointerdown', () => {
                this.currentSelection.shape = i;
                this.drawPalette();
            });
            this.paletteContainer.add(btn);
        });

        // Draw Color Selectors
        this.colors.forEach((color, i) => {
            const btn = this.add.rectangle(-200 + i * 60, 0, 40, 40, color).setInteractive();
            if (i === this.currentSelection.color) btn.setStrokeStyle(4, 0xffffff);
            
            btn.on('pointerdown', () => {
                this.currentSelection.color = i;
                this.drawPalette();
            });
            this.paletteContainer.add(btn);
        });

        // Draw Size Selectors
        this.sizes.forEach((size, i) => {
            const btn = this.add.circle(-200 + i * 60, 50, 20 * size, 0xffffff).setInteractive();
            if (i === this.currentSelection.size) btn.setStrokeStyle(4, 0x00ff00);
            else btn.setStrokeStyle(2, 0x888888);

            btn.on('pointerdown', () => {
                this.currentSelection.size = i;
                this.drawPalette();
            });
            this.paletteContainer.add(btn);
        });

        // Preview
        const previewX = 150;
        const previewShape = this.shapes[this.currentSelection.shape];
        const previewColor = this.colors[this.currentSelection.color];
        const previewScale = this.sizes[this.currentSelection.size];
        
        const preview = this.add.image(previewX, 0, previewShape)
            .setTint(previewColor)
            .setScale(previewScale * 0.8);
        this.paletteContainer.add(preview);
        
        const addBtn = this.uiManager.createButton(this, previewX, 80, 'Add', () => {
            this.addToken();
        });
        this.paletteContainer.add(addBtn);
    }

    addToken() {
        if (this.userSequence.length < this.modelSequence.length) {
            this.userSequence.push([
                this.currentSelection.shape,
                this.currentSelection.color,
                this.currentSelection.size
            ]);
            this.drawUserRow();
        }
    }

    handleSlotClick(index) {
        // Remove token at index
        if (index < this.userSequence.length) {
            this.userSequence.splice(index, 1);
            this.drawUserRow();
        }
    }

    checkSolution() {
        if (this.userSequence.length !== this.modelSequence.length) {
            this.audioManager.play('fail');
            this.showFeedback('Incomplete!');
            return;
        }

        let correct = true;
        for (let i = 0; i < this.modelSequence.length; i++) {
            const u = this.userSequence[i];
            const m = this.modelSequence[i];
            if (u[0] !== m[0] || u[1] !== m[1] || u[2] !== m[2]) {
                correct = false;
                break;
            }
        }

        if (correct) {
            this.audioManager.play('success');
            this.showFeedback('Correct!');
            this.time.delayedCall(1000, () => {
                this.nextLevel();
            });
        } else {
            this.audioManager.play('fail');
            this.showFeedback('Try Again');
        }
    }

    nextLevel() {
        this.currentLevel++;
        this.initLevel();
    }
}
