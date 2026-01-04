import { LalelaGame } from '../utils/LalelaGame.js';

export class BinaryBulbGame extends LalelaGame {
    constructor() {
        super();
        this.currentLevel = 0;
        this.currentSubLevel = 0;
        this.numberSoFar = 0;
        this.numberToConvert = 0;
        this.numberOfBulbs = 0;
        this.bulbs = [];
        this.buttonsBlocked = false;
        
        this.levels = [
            { //level1
                "bulbCount": 2,
                "numbersToBeConverted": [1, 2, 3],
                "enableHelp": true,
                "bulbValueVisible": true
            },
            { //level 2
                "bulbCount": 2,
                "numbersToBeConverted": [1, 2, 3],
                "enableHelp": false,
                "bulbValueVisible": true
            },
            { //level3
                "bulbCount": 4,
                "numbersToBeConverted": [4, 9, 13, 15],
                "enableHelp": true,
                "bulbValueVisible": true
            },
            { //level4
                "bulbCount": 4,
                "numbersToBeConverted": [5, 10, 14, 7],
                "enableHelp": false,
                "bulbValueVisible": true
            },
            { //level5
                "bulbCount": 8,
                "numbersToBeConverted": [57, 152, 248, 239, 89, 101],
                "enableHelp": true,
                "bulbValueVisible": true
            },
            { //level6
                "bulbCount": 8,
                "numbersToBeConverted": [58, 153, 240, 236, 231, 255],
                "enableHelp": false,
                "bulbValueVisible": true
            },
            { //level7
                "bulbCount": 4,
                "numbersToBeConverted": [3, 12, 5, 10, 15, 11],
                "enableHelp": false,
                "bulbValueVisible": false
            },
            { //level8
                "bulbCount": 8,
                "numbersToBeConverted": [57, 152, 248, 239, 89, 101],
                "enableHelp": false,
                "bulbValueVisible": false
            }
        ];
    }

    preload() {
        super.preload();
        this.load.image('bulb_off', 'assets/binary_bulb/bulb_off.svg');
        this.load.image('bulb_on', 'assets/binary_bulb/bulb_on.svg');
    }

    create() {
        super.create();
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x333333)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, "", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.targetNumberText = this.add.text(this.cameras.main.centerX, 150, "", {
            fontFamily: "Arial",
            fontSize: "64px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.currentSumText = this.add.text(this.cameras.main.centerX, 500, "Current Sum: 0", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.checkButton = this.add.rectangle(this.cameras.main.centerX, 600, 200, 60, 0x2ecc71)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.checkAnswer());
        
        this.add.text(this.cameras.main.centerX, 600, "CHECK", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.currentSubLevel = 0;
        this.levelData = this.levels[this.currentLevel];
        // Shuffle numbers
        this.levelData.numbersToBeConverted = this.shuffle(this.levelData.numbersToBeConverted);
        
        this.startSubLevel();
    }

    startSubLevel() {
        if (this.currentSubLevel >= this.levelData.numbersToBeConverted.length) {
            // Level Complete
            this.audioManager.play('level-complete');
            if (this.currentLevel < this.levels.length - 1) {
                this.time.delayedCall(2000, () => this.startLevel(this.currentLevel + 1));
            } else {
                // Game Complete
                this.scene.start('GameMenu');
            }
            return;
        }

        this.numberToConvert = this.levelData.numbersToBeConverted[this.currentSubLevel];
        this.numberOfBulbs = this.levelData.bulbCount;
        this.numberSoFar = 0;
        this.buttonsBlocked = false;

        this.updateUI();
        this.createBulbs();
    }

    createBulbs() {
        if (this.bulbsContainer) this.bulbsContainer.destroy();
        this.bulbsContainer = this.add.container(this.cameras.main.centerX, 300);
        this.bulbs = [];

        const spacing = 100;
        const startX = -((this.numberOfBulbs - 1) * spacing) / 2;

        for (let i = 0; i < this.numberOfBulbs; i++) {
            // Powers of 2: 2^0, 2^1, ... from right to left
            // So index 0 (leftmost) is 2^(n-1)
            const power = this.numberOfBulbs - 1 - i;
            const value = Math.pow(2, power);
            
            const x = startX + i * spacing;
            
            const bulb = this.add.image(x, 0, 'bulb_off').setScale(0.5)
                .setInteractive({ useHandCursor: true });
            
            // Bit display (0 or 1)
            const bitBg = this.add.rectangle(x, 80, 50, 50, 0xffffff, 0.5);
            const bitText = this.add.text(x, 80, "0", {
                fontFamily: "Arial",
                fontSize: "32px",
                color: "#000000"
            }).setOrigin(0.5);
            
            const bulbObj = {
                sprite: bulb,
                bitText: bitText,
                value: value,
                isOn: false
            };

            bulb.on('pointerdown', () => this.toggleBulb(bulbObj));
            bitBg.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.toggleBulb(bulbObj));

            this.bulbsContainer.add([bulb, bitBg, bitText]);

            if (this.levelData.bulbValueVisible) {
                const text = this.add.text(x, -80, value.toString(), {
                    fontFamily: "Arial",
                    fontSize: "20px",
                    color: "#ffffff"
                }).setOrigin(0.5);
                this.bulbsContainer.add(text);
            }

            this.bulbs.push(bulbObj);
        }
    }

    toggleBulb(bulbObj) {
        if (this.buttonsBlocked) return;

        bulbObj.isOn = !bulbObj.isOn;
        bulbObj.sprite.setTexture(bulbObj.isOn ? 'bulb_on' : 'bulb_off');
        bulbObj.bitText.setText(bulbObj.isOn ? "1" : "0");
        
        this.audioManager.play('click');
        this.calculateSum();
    }

    calculateSum() {
        this.numberSoFar = this.bulbs.reduce((sum, bulb) => sum + (bulb.isOn ? bulb.value : 0), 0);
        this.currentSumText.setText("Current Sum: " + this.numberSoFar);
    }

    updateUI() {
        this.instructionText.setText(`Represent the number ${this.numberToConvert} in binary.`);
        this.targetNumberText.setText(this.numberToConvert);
        this.currentSumText.setText("Current Sum: 0");
    }

    checkAnswer() {
        if (this.buttonsBlocked) return;

        if (this.numberSoFar === this.numberToConvert) {
            this.audioManager.play('success');
            this.buttonsBlocked = true;
            this.currentSubLevel++;
            this.time.delayedCall(1500, () => this.startSubLevel());
        } else {
            this.audioManager.play('fail');
            // Shake effect or visual feedback
            this.cameras.main.shake(200, 0.01);
        }
    }

    shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}
