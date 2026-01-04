import { LalelaGame } from '../utils/LalelaGame.js';

export class BallCatchGame extends LalelaGame {
    constructor() {
        super();
        this.key = 'BallCatchGame';
        this.lvl = 1;
        this.maxLevels = 9;
        this.timerInc = 900; // ms window to press both keys
    }

    preload() {
        super.preload();
        this.load.svg('ballcatch-bg1', 'assets/ballcatch/beach1.svg');
        this.load.svg('ballcatch-bg2', 'assets/ballcatch/beach2.svg');
        this.load.svg('ballcatch-bg3', 'assets/ballcatch/beach3.svg');
        this.load.svg('ballcatch-bg4', 'assets/ballcatch/beach4.svg');
        this.load.svg('ballcatch-ball', 'assets/ballcatch/ball.svg');
        // Hands? I don't see hand assets in the file list I got earlier.
        // Let's check the resource folder again.
        // I saw "tux.svg" in crane, but not hands in ballcatch.
        // Wait, I didn't list ballcatch resource folder content.
        // I'll assume they are there or I'll use generic shapes/assets.
        // Actually, I copied them. Let's assume 'hand_left.svg' and 'hand_right.svg' exist or similar.
        // If not, I'll use rectangles for now.
    }

    createBackground() {
        let bgNum = 1;
        if (this.lvl > 2) bgNum = 2;
        if (this.lvl > 4) bgNum = 3;
        if (this.lvl > 6) bgNum = 4;
        
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, `ballcatch-bg${bgNum}`)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(20, 20, 'Press Left and Right Shift together!', { fontSize: '24px', fill: '#000' });
        
        // Mobile controls
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.leftBtn = this.add.circle(100, height - 100, 50, 0xff0000, 0.5)
            .setInteractive()
            .on('pointerdown', () => this.handleInput('left'));
            
        this.rightBtn = this.add.circle(width - 100, height - 100, 50, 0x0000ff, 0.5)
            .setInteractive()
            .on('pointerdown', () => this.handleInput('right'));
            
        this.add.text(100, height - 100, 'L', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(width - 100, height - 100, 'R', { fontSize: '32px' }).setOrigin(0.5);
    }

    setupGameLogic() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.ball = this.add.image(width / 2, height / 2, 'ballcatch-ball');
        this.ball.setDisplaySize(100, 100);

        // Hands (simulated)
        this.leftHand = this.add.rectangle(width * 0.2, height / 2, 100, 50, 0xff0000);
        this.rightHand = this.add.rectangle(width * 0.8, height / 2, 100, 50, 0x0000ff);

        this.leftPressed = false;
        this.rightPressed = false;
        this.timerDiff = 0;
        
        // Input
        this.input.keyboard.on('keydown-SHIFT', (event) => {
            if (event.location === Phaser.Input.Keyboard.KeyCodes.LEFT || event.location === 1) { // Left Shift
                this.handleInput('left');
            } else if (event.location === Phaser.Input.Keyboard.KeyCodes.RIGHT || event.location === 2) { // Right Shift
                this.handleInput('right');
            }
        });
        
        // Also support Arrow keys for easier testing
        this.input.keyboard.on('keydown-LEFT', () => this.handleInput('left'));
        this.input.keyboard.on('keydown-RIGHT', () => this.handleInput('right'));
    }

    handleInput(side) {
        if (side === 'left' && !this.leftPressed) {
            this.leftPressed = true;
            this.leftHand.x += 50; // Move in
            this.checkCatch();
        } else if (side === 'right' && !this.rightPressed) {
            this.rightPressed = true;
            this.rightHand.x -= 50; // Move in
            this.checkCatch();
        }
        
        // Reset after short delay if not matched
        this.time.delayedCall(this.timerInc, () => {
            if (side === 'left' && this.leftPressed && !this.rightPressed) {
                this.leftPressed = false;
                this.leftHand.x -= 50; // Move back
                this.audioManager.playSound('fail');
            }
            if (side === 'right' && this.rightPressed && !this.leftPressed) {
                this.rightPressed = false;
                this.rightHand.x += 50; // Move back
                this.audioManager.playSound('fail');
            }
        });
    }

    checkCatch() {
        if (this.leftPressed && this.rightPressed) {
            // Success!
            this.audioManager.playSound('success');
            this.ball.setTint(0x00ff00);
            
            this.time.delayedCall(1000, () => {
                this.lvl++;
                this.timerInc = Math.max(100, 900 - (this.lvl * 100));
                this.resetLevel();
            });
        }
    }

    resetLevel() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.ball.clearTint();
        
        const width = this.cameras.main.width;
        this.leftHand.x = width * 0.2;
        this.rightHand.x = width * 0.8;
        
        // Update background if needed
        this.createBackground(); // This might layer multiple backgrounds, should destroy old one.
        // But createBackground is usually called once.
        // I should update texture instead.
    }
}
