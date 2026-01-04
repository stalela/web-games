import { LalelaGame } from '../utils/LalelaGame.js';

export class Target extends LalelaGame {
    constructor() {
        super();
        this.currentLevel = 0;
        this.scores = [];
        this.dartsThrown = 0;
        this.totalDarts = 3;
        this.userInput = "";
        this.isInputActive = false;
        
        // Data from GCompris Data.qml
        this.levels = [
            [ // Level 1
                {size: 50, color: 0xee7f7f, score: 5},
                {size: 100, color: 0xeebf7f, score: 4},
                {size: 150, color: 0xe0ee7f, score: 3},
                {size: 200, color: 0x7fee8f, score: 2},
                {size: 250, color: 0x7fcbee, score: 1}
            ],
            [ // Level 2
                {size: 50, color: 0xee7f7f, score: 7},
                {size: 100, color: 0xeebf7f, score: 5},
                {size: 150, color: 0xe0ee7f, score: 3},
                {size: 200, color: 0x7fee8f, score: 2},
                {size: 250, color: 0x7fcbee, score: 1}
            ],
            [ // Level 3
                {size: 50, color: 0xee7f7f, score: 10},
                {size: 100, color: 0xeebf7f, score: 7},
                {size: 150, color: 0xe0ee7f, score: 5},
                {size: 200, color: 0x7fee8f, score: 3},
                {size: 250, color: 0x7fcbee, score: 2}
            ]
        ];
    }

    preload() {
        super.preload();
        this.load.image('target_bg', 'assets/target/target_background.svg');
    }

    create() {
        super.create();
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x81D4FA)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        // Equation display
        this.equationText = this.add.text(this.cameras.main.centerX, 100, "", {
            fontFamily: "Arial",
            fontSize: "48px",
            color: "#000000",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Input display
        this.inputText = this.add.text(this.cameras.main.centerX, 160, "?", {
            fontFamily: "Arial",
            fontSize: "48px",
            color: "#000066",
            fontStyle: "bold"
        }).setOrigin(0.5);
        
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, "Watch the darts, then calculate the total score.", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#000000"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.scores = [];
        this.dartsThrown = 0;
        this.totalDarts = Math.min(this.currentLevel + 3, 6);
        this.userInput = "";
        this.isInputActive = false;
        this.equationText.setText("");
        this.inputText.setText("");
        this.instructionText.setText("Watch the darts...");

        if (this.targetContainer) {
            this.targetContainer.destroy();
        }
        if (this.keypadContainer) {
            this.keypadContainer.destroy();
        }

        this.createTarget();
        this.startDartSequence();
    }

    createTarget() {
        this.targetContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
        
        // Background image
        const bg = this.add.image(0, 0, 'target_bg');
        // Scale background to fit largest ring + padding
        // Assuming largest ring is 250 radius (500 diameter)
        bg.setDisplaySize(600, 600);
        this.targetContainer.add(bg);

        // Draw rings from largest to smallest
        const levelData = this.levels[this.currentLevel % this.levels.length];
        // Sort by size descending to draw largest first
        const sortedRings = [...levelData].sort((a, b) => b.size - a.size);

        sortedRings.forEach(ring => {
            const circle = this.add.circle(0, 0, ring.size, ring.color);
            circle.setStrokeStyle(2, 0x000000, 0.5);
            this.targetContainer.add(circle);
            
            // Score label on the ring
            const text = this.add.text(0, ring.size - 20, ring.score.toString(), {
                fontFamily: "Arial",
                fontSize: "20px",
                color: "#000000"
            }).setOrigin(0.5);
            this.targetContainer.add(text);
        });

        // Animate target
        this.moveTarget();
    }

    moveTarget() {
        if (this.isInputActive) return;

        const rangeX = 200;
        const rangeY = 100;
        const targetX = this.cameras.main.centerX + Phaser.Math.Between(-rangeX, rangeX);
        const targetY = this.cameras.main.centerY + Phaser.Math.Between(-rangeY, rangeY);

        this.tweens.add({
            targets: this.targetContainer,
            x: targetX,
            y: targetY,
            duration: 2000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (!this.isInputActive) {
                    this.moveTarget();
                } else {
                    // Return to center when input is active
                    this.tweens.add({
                        targets: this.targetContainer,
                        x: this.cameras.main.centerX,
                        y: this.cameras.main.centerY,
                        duration: 1000,
                        ease: 'Power2'
                    });
                }
            }
        });
    }

    startDartSequence() {
        this.time.addEvent({
            delay: 2000,
            callback: this.throwDart,
            callbackScope: this,
            repeat: this.totalDarts - 1
        });
    }

    throwDart() {
        // Create dart at center screen, large
        const dart = this.add.circle(this.cameras.main.centerX, this.cameras.main.centerY, 20, 0x555555);
        dart.setStrokeStyle(2, 0x000000);
        dart.setScale(3);
        dart.setAlpha(0);

        this.tweens.add({
            targets: dart,
            scale: 0.5,
            alpha: 1,
            duration: 1000,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.handleDartHit(dart);
            }
        });
    }

    handleDartHit(dart) {
        this.audioManager.play('click');

        // Calculate position relative to target
        const relX = dart.x - this.targetContainer.x;
        const relY = dart.y - this.targetContainer.y;
        const dist = Math.sqrt(relX * relX + relY * relY);

        // Determine score
        let score = 0;
        const levelData = this.levels[this.currentLevel % this.levels.length];
        const sortedRings = [...levelData].sort((a, b) => a.size - b.size);
        
        for (const ring of sortedRings) {
            if (dist <= ring.size) {
                score = ring.score;
                break;
            }
        }

        if (score > 0) {
            this.scores.push(score);
            this.updateEquation();
            
            // Stick dart to target
            dart.destroy();
            const stuckDart = this.add.circle(relX, relY, 10, 0x555555);
            stuckDart.setStrokeStyle(2, 0x000000);
            this.targetContainer.add(stuckDart);
        } else {
            // Missed
            dart.destroy();
        }

        this.dartsThrown++;
        if (this.dartsThrown >= this.totalDarts) {
            this.time.delayedCall(1000, this.showInput, [], this);
        }
    }

    updateEquation() {
        this.equationText.setText(this.scores.join(" + ") + " = ");
    }

    showInput() {
        this.isInputActive = true;
        this.instructionText.setText("Calculate the sum and enter the answer.");
        this.inputText.setText("?");
        
        // Create Keypad
        this.createKeypad();
    }

    createKeypad() {
        this.keypadContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.height - 150);
        
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
        const size = 60;
        const gap = 10;
        
        keys.forEach((key, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const x = (col - 1) * (size + gap);
            const y = (row - 1.5) * (size + gap);

            const btn = this.add.rectangle(x, y, size, size, 0xeeeeee)
                .setStrokeStyle(2, 0x999999)
                .setInteractive({ useHandCursor: true });
            
            const text = this.add.text(x, y, key, {
                fontFamily: "Arial",
                fontSize: "24px",
                color: "#000000"
            }).setOrigin(0.5);

            btn.on('pointerdown', () => this.handleKeyInput(key));
            btn.on('pointerover', () => btn.setFillStyle(0xdddddd));
            btn.on('pointerout', () => btn.setFillStyle(0xeeeeee));

            this.keypadContainer.add([btn, text]);
        });
    }

    handleKeyInput(key) {
        if (key === 'C') {
            this.userInput = "";
        } else if (key === 'OK') {
            this.checkAnswer();
            return;
        } else {
            if (this.userInput.length < 5) {
                this.userInput += key;
            }
        }
        this.inputText.setText(this.userInput);
    }

    checkAnswer() {
        const totalScore = this.scores.reduce((a, b) => a + b, 0);
        const userSum = parseInt(this.userInput);

        if (userSum === totalScore) {
            this.audioManager.play('success');
            this.instructionText.setText("Correct!");
            this.time.delayedCall(1500, () => {
                this.startLevel(this.currentLevel + 1);
            });
        } else {
            this.audioManager.play('fail');
            this.instructionText.setText("Try again!");
            this.userInput = "";
            this.inputText.setText("?");
        }
    }
}
