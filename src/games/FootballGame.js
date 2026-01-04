import { LalelaGame } from '../utils/LalelaGame.js';

export class FootballGame extends LalelaGame {
    constructor() {
        super();
        this.key = 'FootballGame';
        this.lvl = 1;
        this.maxLevels = 6;
    }

    preload() {
        super.preload();
        this.load.svg('football-bg', 'assets/football/background.svg');
        this.load.svg('football-ball', 'assets/football/ball.svg');
        this.load.svg('football-tux', 'assets/football/tux.svg');
        // Goal is part of background? No, let's check.
        // In Football.qml: Image { id: field ... }
        // It seems the goal is drawn on the background or is a separate item?
        // "source: activity.resourceUrl + "background.svg""
        // Let's assume background has the goal.
    }

    createBackground() {
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'football-bg')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(20, 20, 'Score a Goal!', { fontSize: '32px', fill: '#fff' });
    }

    setupGameLogic() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Tux (Goalkeeper)
        this.tux = this.add.image(width / 2, height * 0.2, 'football-tux');
        this.tux.setDisplaySize(80, 100);
        
        // Ball
        this.ball = this.add.image(width / 2, height * 0.8, 'football-ball');
        this.ball.setDisplaySize(40, 40);
        this.ball.setInteractive();

        // Physics state
        this.ballVelocity = { x: 0, y: 0 };
        this.isBallMoving = false;
        this.friction = 0.98;

        // Input
        this.input.on('pointerdown', (pointer) => {
            if (!this.isBallMoving && this.ball.getBounds().contains(pointer.x, pointer.y)) {
                this.isDragging = true;
                this.dragStart = { x: pointer.x, y: pointer.y };
                this.line = this.add.line(0, 0, 0, 0, 0, 0, 0xffffff).setOrigin(0);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                this.line.setTo(this.ball.x, this.ball.y, pointer.x, pointer.y);
                this.line.setStrokeStyle(4, 0xffffff);
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.line.destroy();
                this.shoot(this.dragStart, { x: pointer.x, y: pointer.y });
            }
        });

        this.startLevel();
    }

    startLevel() {
        this.resetBall();
        this.startTuxMotion();
    }

    startTuxMotion() {
        if (this.tuxTween) this.tuxTween.stop();
        
        const width = this.cameras.main.width;
        const duration = 2000 - (this.lvl * 200);
        
        this.tuxTween = this.tweens.add({
            targets: this.tux,
            x: { from: width * 0.2, to: width * 0.8 },
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    shoot(start, end) {
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        
        // Limit power
        const power = Math.min(20, Math.sqrt(dx*dx + dy*dy) * 0.1);
        const angle = Math.atan2(dy, dx);

        this.ballVelocity.x = Math.cos(angle) * power * 15;
        this.ballVelocity.y = Math.sin(angle) * power * 15;
        this.isBallMoving = true;
        this.audioManager.playSound('click');
    }

    update() {
        if (this.isBallMoving) {
            this.ball.x += this.ballVelocity.x;
            this.ball.y += this.ballVelocity.y;
            
            this.ballVelocity.x *= this.friction;
            this.ballVelocity.y *= this.friction;

            // Bounce off walls
            if (this.ball.x < 0 || this.ball.x > this.cameras.main.width) {
                this.ballVelocity.x *= -1;
                this.ball.x = Phaser.Math.Clamp(this.ball.x, 0, this.cameras.main.width);
            }
            if (this.ball.y > this.cameras.main.height) {
                this.ballVelocity.y *= -1;
                this.ball.y = this.cameras.main.height;
            }

            // Check Goal (Top of screen)
            if (this.ball.y < 50) {
                // Check if inside goal posts (assuming goal is central 60% of screen)
                const width = this.cameras.main.width;
                if (this.ball.x > width * 0.2 && this.ball.x < width * 0.8) {
                    this.goalScored();
                } else {
                    this.missed();
                }
            }

            // Check Tux Collision
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.ball.getBounds(), this.tux.getBounds())) {
                // Bounce back
                this.ballVelocity.y *= -1;
                this.ballVelocity.y += 5; // Add some speed
                this.audioManager.playSound('fail');
            }

            // Stop if too slow
            if (Math.abs(this.ballVelocity.x) < 0.1 && Math.abs(this.ballVelocity.y) < 0.1) {
                this.isBallMoving = false;
                this.resetBall();
            }
        }
    }

    goalScored() {
        this.isBallMoving = false;
        this.audioManager.playSound('success');
        this.uiManager.showFeedback("GOAL!");
        this.time.delayedCall(1000, () => {
            this.lvl++;
            if (this.lvl > this.maxLevels) this.lvl = 1;
            this.startLevel();
        });
    }

    missed() {
        this.isBallMoving = false;
        this.audioManager.playSound('fail');
        this.resetBall();
    }

    resetBall() {
        this.ball.setPosition(this.cameras.main.width / 2, this.cameras.main.height * 0.8);
        this.ballVelocity = { x: 0, y: 0 };
        this.isBallMoving = false;
    }
}
