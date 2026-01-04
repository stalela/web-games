import { LalelaGame } from '../utils/LalelaGame.js';

export class PenaltyGame extends LalelaGame {
    constructor() {
        super();
        this.key = 'PenaltyGame';
        this.lvl = 1;
    }

    preload() {
        super.preload();
        this.load.svg('penalty-bg', 'assets/penalty/background.svg');
        this.load.svg('penalty-ball', 'assets/penalty/ball.svg');
        this.load.svg('penalty-tux', 'assets/penalty/tux.svg');
    }

    createBackground() {
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'penalty-bg')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(20, 20, 'Double Click to Score!', { fontSize: '32px', fill: '#fff' });
    }

    setupGameLogic() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Tux (Goalkeeper)
        this.tux = this.add.image(width / 2, height * 0.3, 'penalty-tux');
        this.tux.setDisplaySize(100, 120);
        
        // Ball
        this.ball = this.add.image(width / 2, height * 0.8, 'penalty-ball');
        this.ball.setDisplaySize(60, 60);

        // Tux Motion
        this.startTuxMotion();

        // Input
        this.lastClickTime = 0;
        this.input.on('pointerdown', (pointer) => {
            const now = this.time.now;
            if (now - this.lastClickTime < 300) {
                // Double click!
                this.shoot(pointer);
            }
            this.lastClickTime = now;
        });
    }

    startTuxMotion() {
        const width = this.cameras.main.width;
        this.tweens.add({
            targets: this.tux,
            x: { from: width * 0.3, to: width * 0.7 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    shoot(pointer) {
        if (this.isShooting) return;
        this.isShooting = true;

        // Move ball to pointer x, goal y
        const goalY = this.cameras.main.height * 0.3;
        
        this.tweens.add({
            targets: this.ball,
            x: pointer.x,
            y: goalY,
            duration: 500,
            onComplete: () => {
                this.checkGoal();
            }
        });
        
        this.audioManager.playSound('click');
    }

    checkGoal() {
        // Check collision with Tux
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.ball.getBounds(), this.tux.getBounds())) {
            this.audioManager.playSound('fail');
            this.uiManager.showFeedback("Saved by Tux!");
        } else {
            // Check if within goal posts (approx)
            const width = this.cameras.main.width;
            if (this.ball.x > width * 0.2 && this.ball.x < width * 0.8) {
                this.audioManager.playSound('success');
                this.uiManager.showFeedback("GOAL!");
            } else {
                this.audioManager.playSound('fail');
                this.uiManager.showFeedback("Missed!");
            }
        }

        this.time.delayedCall(1000, () => {
            this.resetBall();
        });
    }

    resetBall() {
        this.isShooting = false;
        this.ball.setPosition(this.cameras.main.width / 2, this.cameras.main.height * 0.8);
    }
}
