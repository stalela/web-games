import { LalelaGame } from '../utils/LalelaGame.js';

export class PhotoHunter extends LalelaGame {
    constructor() {
        super();
        this.differences = [];
        this.foundDifferences = 0;
        this.totalDifferences = 3;
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xFFCCBC)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Find 3 Differences", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.foundDifferences = 0;
        this.differences = [];
        
        // Create two identical scenes
        const leftX = this.cameras.main.centerX - 200;
        const rightX = this.cameras.main.centerX + 200;
        const centerY = this.cameras.main.centerY;

        // Backgrounds for images
        this.add.rectangle(leftX, centerY, 350, 300, 0xffffff).setStrokeStyle(2, 0x000000);
        this.add.rectangle(rightX, centerY, 350, 300, 0xffffff).setStrokeStyle(2, 0x000000);

        // Generate random shapes
        for (let i = 0; i < 10; i++) {
            let x = Phaser.Math.Between(-150, 150);
            let y = Phaser.Math.Between(-130, 130);
            let color = Phaser.Math.RND.pick([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]);
            let size = Phaser.Math.Between(20, 50);
            let type = Phaser.Math.Between(0, 2); // 0: rect, 1: circle, 2: triangle

            // Left Image
            this.drawShape(leftX + x, centerY + y, size, color, type);

            // Right Image (mostly same)
            if (this.differences.length < this.totalDifferences && Math.random() < 0.3) {
                // Create difference
                let diffType = Phaser.Math.Between(0, 2); // 0: missing, 1: color change, 2: size change
                
                if (diffType === 0) {
                    // Missing in right image
                    // Add invisible interactive zone to detect click
                    let zone = this.add.zone(rightX + x, centerY + y, size, size).setInteractive();
                    zone.on('pointerdown', () => this.foundDifference(zone, leftX + x, centerY + y, size, color, type));
                    this.differences.push(zone);
                } else if (diffType === 1) {
                    // Color change
                    let newColor = 0x000000; // Different color
                    let shape = this.drawShape(rightX + x, centerY + y, size, newColor, type);
                    shape.setInteractive();
                    shape.on('pointerdown', () => this.foundDifference(shape));
                    this.differences.push(shape);
                } else {
                    // Size change
                    let shape = this.drawShape(rightX + x, centerY + y, size / 2, color, type);
                    shape.setInteractive();
                    shape.on('pointerdown', () => this.foundDifference(shape));
                    this.differences.push(shape);
                }
            } else {
                // Identical
                this.drawShape(rightX + x, centerY + y, size, color, type);
            }
        }
        
        // Ensure we have enough differences, if not, restart (lazy fix)
        if (this.differences.length < this.totalDifferences) {
            this.startLevel();
        }
    }

    drawShape(x, y, size, color, type) {
        if (type === 0) {
            return this.add.rectangle(x, y, size, size, color);
        } else if (type === 1) {
            return this.add.circle(x, y, size / 2, color);
        } else {
            return this.add.triangle(x, y, 0, -size/2, size/2, size/2, -size/2, size/2, color);
        }
    }

    foundDifference(target, x, y, size, color, type) {
        if (!target.found) {
            target.found = true;
            this.foundDifferences++;
            this.audioManager.play('success');
            
            // Mark it
            this.add.circle(target.x, target.y, 20).setStrokeStyle(3, 0xff0000);

            if (this.foundDifferences >= this.totalDifferences) {
                this.time.delayedCall(1000, () => this.startLevel());
            }
        }
    }
}
