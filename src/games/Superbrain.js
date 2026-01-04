import { LalelaGame } from '../utils/LalelaGame.js';

export class Superbrain extends LalelaGame {
    constructor() {
        super();
        this.colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        this.secretCode = [];
        this.currentRow = 0;
        this.maxRows = 10;
        this.codeLength = 4;
        this.guesses = [];
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x263238)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 30, "Super Brain (Mastermind)", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.secretCode = [];
        for (let i = 0; i < this.codeLength; i++) {
            this.secretCode.push(Phaser.Math.RND.pick(this.colors));
        }
        this.currentRow = 0;
        this.guesses = [];
        
        this.createBoard();
        this.createColorPicker();
    }

    createBoard() {
        if (this.boardContainer) this.boardContainer.destroy();
        this.boardContainer = this.add.container(this.cameras.main.centerX - 150, 100);

        for (let r = 0; r < this.maxRows; r++) {
            for (let c = 0; c < this.codeLength; c++) {
                let peg = this.add.circle(c * 50, r * 50, 20, 0x546E7A);
                peg.row = r;
                peg.col = c;
                peg.setInteractive();
                peg.on('pointerdown', () => this.onPegClick(r, c, peg));
                this.boardContainer.add(peg);
            }
            
            // Feedback pegs
            for (let f = 0; f < this.codeLength; f++) {
                let feed = this.add.circle(this.codeLength * 50 + 30 + (f % 2) * 20, r * 50 + Math.floor(f / 2) * 20 - 10, 5, 0x000000);
                this.boardContainer.add(feed);
            }
        }
        
        // Check Button
        this.checkBtn = this.add.rectangle(this.codeLength * 50 + 100, 0, 80, 40, 0x4CAF50).setInteractive();
        this.checkBtnText = this.add.text(this.codeLength * 50 + 100, 0, "Check", { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
        this.boardContainer.add([this.checkBtn, this.checkBtnText]);
        
        this.checkBtn.on('pointerdown', () => this.checkGuess());
        this.updateCheckButtonPos();
    }

    createColorPicker() {
        this.selectedColor = this.colors[0];
        const startX = this.cameras.main.centerX - (this.colors.length * 50) / 2;
        const startY = this.cameras.main.height - 80;

        this.pickerSelection = this.add.graphics();
        
        this.colors.forEach((color, index) => {
            let swatch = this.add.circle(startX + index * 50, startY, 20, color).setInteractive();
            swatch.on('pointerdown', () => {
                this.selectedColor = color;
                this.updatePickerSelection(startX + index * 50, startY);
            });
            if (index === 0) this.updatePickerSelection(startX, startY);
        });
    }

    updatePickerSelection(x, y) {
        this.pickerSelection.clear();
        this.pickerSelection.lineStyle(3, 0xffffff);
        this.pickerSelection.strokeCircle(x, y, 25);
    }

    onPegClick(r, c, peg) {
        if (r === this.currentRow) {
            peg.fillColor = this.selectedColor;
            // Store guess
            if (!this.guesses[r]) this.guesses[r] = [];
            this.guesses[r][c] = this.selectedColor;
        }
    }

    updateCheckButtonPos() {
        this.checkBtn.y = this.currentRow * 50;
        this.checkBtnText.y = this.currentRow * 50;
    }

    checkGuess() {
        let currentGuess = this.guesses[this.currentRow];
        if (!currentGuess || currentGuess.length < this.codeLength || currentGuess.includes(undefined)) {
            return; // Incomplete guess
        }

        // Calculate feedback
        let blackPegs = 0; // Correct color and position
        let whitePegs = 0; // Correct color wrong position
        
        let codeCopy = [...this.secretCode];
        let guessCopy = [...currentGuess];

        // Check blacks
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] === codeCopy[i]) {
                blackPegs++;
                guessCopy[i] = null;
                codeCopy[i] = null;
            }
        }

        // Check whites
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] !== null) {
                let index = codeCopy.indexOf(guessCopy[i]);
                if (index !== -1) {
                    whitePegs++;
                    codeCopy[index] = null;
                }
            }
        }

        // Display feedback
        for (let i = 0; i < blackPegs; i++) {
            this.add.circle(this.cameras.main.centerX - 150 + this.codeLength * 50 + 30 + (i % 2) * 20, 100 + this.currentRow * 50 + Math.floor(i / 2) * 20 - 10, 8, 0x000000).addToContainer(this.boardContainer); // Black
        }
        for (let i = 0; i < whitePegs; i++) {
            let idx = blackPegs + i;
            this.add.circle(this.cameras.main.centerX - 150 + this.codeLength * 50 + 30 + (idx % 2) * 20, 100 + this.currentRow * 50 + Math.floor(idx / 2) * 20 - 10, 8, 0xffffff).addToContainer(this.boardContainer); // White
        }

        if (blackPegs === this.codeLength) {
            this.audioManager.play('success');
            this.time.delayedCall(1000, () => this.startLevel());
        } else {
            this.currentRow++;
            if (this.currentRow >= this.maxRows) {
                // Game Over
                this.audioManager.play('error');
                this.time.delayedCall(1000, () => this.startLevel());
            } else {
                this.updateCheckButtonPos();
            }
        }
    }
}
