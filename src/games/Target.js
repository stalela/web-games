import { LalelaGame } from '../utils/LalelaGame.js';

export class Target extends LalelaGame {
    constructor() {
        super();
        this.score = 0;
        this.dartsLeft = 5;
        this.targetSpeed = 2;
        this.targetDirection = 1;
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x81D4FA)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.scoreText = this.add.text(20, 20, "Score: 0", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        });
        
        this.dartsText = this.add.text(20, 60, "Darts: 5", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        });
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.score = 0;
        this.dartsLeft = 5;
        this.updateUI();

        if (this.target) this.target.destroy();
        
        this.target = this.add.container(this.cameras.main.centerX, 200);
        
        // Target Rings
        this.add.circle(0, 0, 60, 0xffffff).setStrokeStyle(2, 0x000000).addToContainer(this.target); // 10 pts
        this.add.circle(0, 0, 40, 0xff0000).addToContainer(this.target); // 20 pts
        this.add.circle(0, 0, 20, 0xffff00).addToContainer(this.target); // 50 pts
        
        this.target.setSize(120, 120);
        this.target.setInteractive();
        
        this.target.on('pointerdown', (pointer) => this.throwDart(pointer));
    }

    update() {
        if (this.target) {
            this.target.x += this.targetSpeed * this.targetDirection;
            
            if (this.target.x > this.cameras.main.width - 60 || this.target.x < 60) {
                this.targetDirection *= -1;
            }
        }
    }

    throwDart(pointer) {
        if (this.dartsLeft <= 0) return;

        this.dartsLeft--;
        this.updateUI();
        this.audioManager.play('click'); // Dart sound

        // Calculate score based on distance from center
        // Note: pointer is world coordinates, target is moving
        // We need relative position
        const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.target.x, this.target.y);
        
        let points = 0;
        if (dist < 20) points = 50;
        else if (dist < 40) points = 20;
        else if (dist < 60) points = 10;

        if (points > 0) {
            this.score += points;
            this.updateUI();
            this.audioManager.play('success');
            
            // Visual marker
            let marker = this.add.circle(pointer.x, pointer.y, 5, 0x000000);
            // Make marker move with target? No, dart sticks to it.
            // To stick, add to container, but need to adjust coordinates
            this.target.add(this.add.circle(pointer.x - this.target.x, pointer.y - this.target.y, 5, 0x000000));
        }

        if (this.dartsLeft === 0) {
            this.time.delayedCall(2000, () => this.startLevel());
        }
    }

    updateUI() {
        this.scoreText.setText("Score: " + this.score);
        this.dartsText.setText("Darts: " + this.dartsLeft);
    }
}
