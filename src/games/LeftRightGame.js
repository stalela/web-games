import { LalelaGame } from '../utils/LalelaGame.js';

export class LeftRightGame extends LalelaGame {
    constructor() {
        super();
        this.currentLevelIndex = 0;
        this.currentSubLevel = 0;
        this.score = 0;
        this.currentHand = null;
        
        // Levels definition based on GCompris leftright.js
        this.levels = [
            { 
                images: [
                    "main_droite_dessus_0.webp",
                    "main_droite_paume_0.webp" ,
                    "main_gauche_dessus_0.webp",
                    "main_gauche_paume_0.webp" 
                ],
                rotations: [-90]
            },
            { 
                images: [
                    "main_droite_dessus_0.webp",
                    "main_droite_paume_0.webp",
                    "main_gauche_dessus_0.webp",
                    "main_gauche_paume_0.webp" 
                ],
                rotations: [0, 180]
            },
            { 
                images: [
                    "main_droite_dessus_0.webp",
                    "main_droite_paume_0.webp",
                    "main_gauche_dessus_0.webp",
                    "main_gauche_paume_0.webp" 
                ],
                rotations: [90]
            },
            { 
                images: [
                    "poing_droit_dessus_0.webp",
                    "poing_droit_paume_0.webp",
                    "poing_gauche_dessus_0.webp",
                    "poing_gauche_paume_0.webp" 
                ],
                rotations: [-90]
            },
            { 
                images: [
                    "poing_droit_dessus_0.webp",
                    "poing_droit_paume_0.webp",
                    "poing_gauche_dessus_0.webp",
                    "poing_gauche_paume_0.webp" 
                ],
                rotations: [0, 180]
            },
            { 
                images: [
                    "poing_droit_dessus_0.webp",
                    "poing_droit_paume_0.webp",
                    "poing_gauche_dessus_0.webp",
                    "poing_gauche_paume_0.webp" 
                ],
                rotations: [90]
            },
        ];
    }

    preload() {
        super.preload();
        
        // Load blackboard and light
        this.load.svg('blackboard', 'assets/leftright/blackboard.svg');
        this.load.svg('light', 'assets/leftright/light.svg');
        
        // Load hand images
        const handImages = [
            "main_droite_dessus_0.webp",
            "main_droite_paume_0.webp",
            "main_gauche_dessus_0.webp",
            "main_gauche_paume_0.webp",
            "poing_droit_dessus_0.webp",
            "poing_droit_paume_0.webp",
            "poing_gauche_dessus_0.webp",
            "poing_gauche_paume_0.webp"
        ];
        
        handImages.forEach(img => {
            this.load.image(img, `assets/leftright/${img}`);
        });
    }

    createBackground() {
        // Add blackboard background
        this.blackboard = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'blackboard');
        
        // Scale blackboard to fit within safe area, leaving space for UI
        const safeArea = this.getSafeArea();
        const scaleX = safeArea.width / this.blackboard.width;
        const scaleY = (safeArea.height * 0.8) / this.blackboard.height;
        const scale = Math.min(scaleX, scaleY);
        
        this.blackboard.setScale(scale);
        this.blackboard.setDepth(-1);
        
        // Add light effect (initially invisible)
        this.light = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'light');
        this.light.setScale(scale);
        this.light.setAlpha(0);
        this.light.setDepth(0);
    }

    createUI() {
        super.createUI();
        
        const safeArea = this.getSafeArea();
        
        // Create Left and Right buttons
        const buttonY = safeArea.bottom - 80;
        const buttonSpacing = 200;
        
        // Left Button
        this.leftButton = this.add.container(this.cameras.main.centerX - buttonSpacing, buttonY);
        
        const leftBg = this.add.circle(0, 0, 50, 0x0062FF);
        const leftText = this.add.text(0, 0, "LEFT", {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Add hand icon to button (optional, using text for now)
        const leftHandIcon = this.add.image(0, -60, 'main_gauche_paume_0.webp').setScale(0.3);
        
        this.leftButton.add([leftBg, leftText, leftHandIcon]);
        this.leftButton.setSize(100, 100);
        this.leftButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.checkAnswer('left'))
            .on('pointerover', () => leftBg.setFillStyle(0x004ecb))
            .on('pointerout', () => leftBg.setFillStyle(0x0062FF));
            
        // Right Button
        this.rightButton = this.add.container(this.cameras.main.centerX + buttonSpacing, buttonY);
        
        const rightBg = this.add.circle(0, 0, 50, 0x0062FF);
        const rightText = this.add.text(0, 0, "RIGHT", {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const rightHandIcon = this.add.image(0, -60, 'main_droite_paume_0.webp').setScale(0.3);
        
        this.rightButton.add([rightBg, rightText, rightHandIcon]);
        this.rightButton.setSize(100, 100);
        this.rightButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.checkAnswer('right'))
            .on('pointerover', () => rightBg.setFillStyle(0x004ecb))
            .on('pointerout', () => rightBg.setFillStyle(0x0062FF));
            
        // Add keyboard controls
        this.input.keyboard.on('keydown-LEFT', () => this.checkAnswer('left'));
        this.input.keyboard.on('keydown-RIGHT', () => this.checkAnswer('right'));
        
        // Instruction text
        this.instructionText = this.add.text(this.cameras.main.centerX, safeArea.top + 50, "Is it a Left or Right hand?", {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        this.currentLevelIndex = levelIndex;
        this.currentSubLevel = 0;
        
        const level = this.levels[levelIndex];
        
        // Generate sequence for this level
        this.levelSequence = [];
        for (let img of level.images) {
            for (let rot of level.rotations) {
                this.levelSequence.push({
                    image: img,
                    rotation: rot,
                    isRight: img.includes('droit')
                });
            }
        }
        
        // Shuffle sequence
        this.shuffleArray(this.levelSequence);
        
        this.showNextHand();
    }

    showNextHand() {
        if (this.currentSubLevel >= this.levelSequence.length) {
            // Level complete
            if (this.currentLevelIndex < this.levels.length - 1) {
                this.uiManager.showFeedback("Level Complete!", () => {
                    this.startLevel(this.currentLevelIndex + 1);
                });
            } else {
                this.uiManager.showWinModal(() => {
                    this.scene.start('GameMenu');
                });
            }
            return;
        }
        
        const item = this.levelSequence[this.currentSubLevel];
        
        if (this.handSprite) {
            this.handSprite.destroy();
        }
        
        this.handSprite = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, item.image);
        this.handSprite.setAngle(item.rotation);
        
        // Scale hand to fit nicely on blackboard
        const scale = this.blackboard.scale * 0.6; // Slightly smaller than blackboard
        this.handSprite.setScale(scale);
        
        // Animate in
        this.handSprite.setAlpha(0);
        this.tweens.add({
            targets: this.handSprite,
            alpha: 1,
            duration: 300
        });
        
        this.currentItem = item;
        this.inputEnabled = true;
    }

    checkAnswer(answer) {
        if (!this.inputEnabled) return;
        
        const isCorrect = (answer === 'right' && this.currentItem.isRight) || 
                          (answer === 'left' && !this.currentItem.isRight);
                          
        if (isCorrect) {
            this.inputEnabled = false;
            this.audioManager.playSound('success');
            
            // Show light effect
            this.tweens.add({
                targets: this.light,
                alpha: 0.5,
                duration: 200,
                yoyo: true
            });
            
            this.time.delayedCall(500, () => {
                this.currentSubLevel++;
                this.showNextHand();
            });
        } else {
            this.audioManager.playSound('error');
            this.cameras.main.shake(200, 0.01);
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
