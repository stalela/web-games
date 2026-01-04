import { LalelaGame } from '../utils/LalelaGame.js';

export class CategorizationGame extends LalelaGame {
    constructor() {
        super();
        this.currentLevel = 0;
        this.currentSubLevel = 0;
        this.score = 0;
        this.items = [];
        this.leftZone = null;
        this.rightZone = null;
        
        this.levels = [
            {
                name: "Numbers vs Letters",
                instruction: "Drag Numbers to the Left, Letters to the Right",
                leftCategory: "Numbers",
                rightCategory: "Letters",
                leftItems: ["01.svg", "02.svg", "03.svg", "04.svg", "05.svg"],
                rightItems: ["upperA.svg", "upperB.svg", "upperC.svg", "upperD.svg", "upperE.svg"],
                leftPath: "assets/categorization/numbers/",
                rightPath: "assets/categorization/alphabets/"
            },
            {
                name: "Uppercase vs Lowercase",
                instruction: "Drag Uppercase to the Left, Lowercase to the Right",
                leftCategory: "Uppercase",
                rightCategory: "Lowercase",
                leftItems: ["upperF.svg", "upperG.svg", "upperH.svg", "upperI.svg", "upperJ.svg"],
                rightItems: ["lowerF.svg", "lowerG.svg", "lowerH.svg", "lowerI.svg", "lowerJ.svg"],
                leftPath: "assets/categorization/alphabets/",
                rightPath: "assets/categorization/alphabets/"
            }
        ];
    }

    preload() {
        super.preload();
        // Load assets for all levels
        this.levels.forEach(level => {
            level.leftItems.forEach(item => {
                this.load.image(item, level.leftPath + item);
            });
            level.rightItems.forEach(item => {
                this.load.image(item, level.rightPath + item);
            });
        });
    }

    create() {
        super.create();
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xFFFFFF)
            .setOrigin(0, 0)
            .setDepth(-1);
            
        // Draw zones
        this.leftZone = this.add.rectangle(0, 100, this.cameras.main.width / 2, this.cameras.main.height - 100, 0xE0F7FA)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0x000000);
            
        this.rightZone = this.add.rectangle(this.cameras.main.width / 2, 100, this.cameras.main.width / 2, this.cameras.main.height - 100, 0xFFEBEE)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0x000000);
            
        // Zone labels
        this.leftLabel = this.add.text(this.cameras.main.width / 4, 150, "", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000",
            fontStyle: "bold"
        }).setOrigin(0.5);
        
        this.rightLabel = this.add.text(this.cameras.main.width * 3 / 4, 150, "", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000",
            fontStyle: "bold"
        }).setOrigin(0.5);
    }

    createUI() {
        super.createUI();
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, "", {
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
        const levelData = this.levels[this.currentLevel];
        
        this.instructionText.setText(levelData.instruction);
        this.leftLabel.setText(levelData.leftCategory);
        this.rightLabel.setText(levelData.rightCategory);
        
        // Clear existing items
        this.items.forEach(item => item.destroy());
        this.items = [];
        
        // Create items
        const allItems = [];
        levelData.leftItems.forEach(img => allItems.push({ key: img, type: 'left' }));
        levelData.rightItems.forEach(img => allItems.push({ key: img, type: 'right' }));
        
        // Shuffle
        this.shuffle(allItems);
        
        // Place items in the center bottom area initially
        const startX = this.cameras.main.centerX;
        const startY = this.cameras.main.height - 100;
        
        allItems.forEach((itemData, index) => {
            const item = this.add.image(startX, startY, itemData.key)
                .setInteractive({ draggable: true })
                .setScale(0.8);
            
            item.categoryType = itemData.type;
            item.originalX = startX;
            item.originalY = startY;
            
            // Stack them slightly offset so they are visible
            item.x += (Math.random() - 0.5) * 50;
            item.y += (Math.random() - 0.5) * 50;
            
            this.input.setDraggable(item);
            
            item.on('drag', (pointer, dragX, dragY) => {
                item.x = dragX;
                item.y = dragY;
            });
            
            item.on('dragend', (pointer) => {
                this.checkDrop(item);
            });
            
            this.items.push(item);
        });
        
        this.itemsRemaining = allItems.length;
    }

    checkDrop(item) {
        const isLeft = item.x < this.cameras.main.width / 2;
        const correct = (isLeft && item.categoryType === 'left') || (!isLeft && item.categoryType === 'right');
        
        if (correct) {
            this.audioManager.play('success');
            item.disableInteractive();
            // Move to a neat position in the zone
            // For simplicity, just leave it where dropped but maybe scale down
            this.tweens.add({
                targets: item,
                scale: 0.5,
                duration: 200,
                ease: 'Back'
            });
            
            this.itemsRemaining--;
            if (this.itemsRemaining === 0) {
                this.audioManager.play('level-complete');
                if (this.currentLevel < this.levels.length - 1) {
                    this.time.delayedCall(2000, () => this.startLevel(this.currentLevel + 1));
                } else {
                    this.scene.start('GameMenu');
                }
            }
        } else {
            this.audioManager.play('fail');
            // Return to start
            this.tweens.add({
                targets: item,
                x: item.originalX,
                y: item.originalY,
                duration: 500,
                ease: 'Power2'
            });
        }
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
