import { LalelaGame } from '../utils/LalelaGame.js';

export class NumberSequence extends LalelaGame {
    constructor() {
        super();
        this.points = [];
        this.currentNumber = 1;
        this.maxNumber = 10;
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x2c3e50)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Connect the Numbers in Order", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.currentNumber = 1;
        this.points = [];
        
        // Generate random points
        for (let i = 1; i <= this.maxNumber; i++) {
            let x = Phaser.Math.Between(100, this.cameras.main.width - 100);
            let y = Phaser.Math.Between(150, this.cameras.main.height - 150);
            
            // Ensure points aren't too close (simple check)
            let tooClose = false;
            for (let p of this.points) {
                if (Phaser.Math.Distance.Between(x, y, p.x, p.y) < 60) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) {
                i--;
                continue;
            }

            let point = this.add.circle(x, y, 20, 0x3498db).setInteractive();
            let text = this.add.text(x, y, i.toString(), { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
            
            point.number = i;
            point.on('pointerdown', () => this.onPointClick(point));
            
            this.points.push({ circle: point, text: text, x: x, y: y, number: i });
        }

        this.graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xf1c40f } });
    }

    onPointClick(point) {
        if (point.number === this.currentNumber) {
            point.setFillStyle(0x2ecc71); // Green for correct
            this.audioManager.play('click');

            if (this.currentNumber > 1) {
                // Draw line from previous
                let prev = this.points[this.currentNumber - 2];
                this.graphics.lineBetween(prev.x, prev.y, point.x, point.y);
            }

            this.currentNumber++;

            if (this.currentNumber > this.maxNumber) {
                this.audioManager.play('success');
                this.time.delayedCall(1500, () => {
                    this.scene.restart();
                });
            }
        } else {
            this.audioManager.play('error');
            // Flash red
            this.tweens.add({
                targets: point,
                fillColor: 0xe74c3c,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    point.fillColor = 0x3498db;
                }
            });
        }
    }
}
