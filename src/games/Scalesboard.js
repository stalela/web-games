import { DragDropGame } from './DragDropGame.js';

export class Scalesboard extends DragDropGame {
    constructor() {
        super();
        this.leftWeight = 0;
        this.rightWeight = 0;
        this.targetWeight = 0;
        this.weights = [];
        this.slots = [];
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xE0F2F1)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Balance the Scales", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        // Clear previous
        this.weights.forEach(w => w.destroy());
        this.slots.forEach(s => s.destroy());
        this.weights = [];
        this.slots = [];

        this.targetWeight = Phaser.Math.Between(5, 20);
        this.leftWeight = this.targetWeight;
        this.rightWeight = 0;

        // Draw Scales
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Base
        this.add.triangle(centerX, centerY + 100, centerX - 50, centerY + 200, centerX + 50, centerY + 200, 0x795548);
        // Beam
        this.beam = this.add.rectangle(centerX, centerY, 400, 10, 0x5D4037);
        
        // Pans
        this.leftPan = this.add.container(centerX - 180, centerY + 50);
        this.add.line(0, 0, 0, -50, 0, 0, 0x000000).addToContainer(this.leftPan);
        this.add.rectangle(0, 0, 100, 10, 0x000000).addToContainer(this.leftPan);
        
        this.rightPan = this.add.container(centerX + 180, centerY + 50);
        this.add.line(0, 0, 0, -50, 0, 0, 0x000000).addToContainer(this.rightPan);
        this.add.rectangle(0, 0, 100, 10, 0x000000).addToContainer(this.rightPan);

        // Add target weight to left pan (visual only)
        let targetText = this.add.text(centerX - 180, centerY + 30, this.targetWeight.toString(), { fontSize: '32px', color: '#000' }).setOrigin(0.5);
        
        // Right Pan Slot
        let zone = this.add.zone(centerX + 180, centerY + 30, 100, 100).setRectangleDropZone(100, 100);
        this.slots.push(zone);

        // Create Weights
        const weightValues = [1, 2, 5, 10];
        const startX = centerX - 150;
        const startY = centerY + 250;

        weightValues.forEach((val, index) => {
            // Create multiple of each
            for (let i = 0; i < 3; i++) {
                let container = this.add.container(startX + index * 80 + i * 5, startY + i * 5);
                let bg = this.add.circle(0, 0, 25 + val * 1.5, 0x607D8B); // Size based on weight
                let text = this.add.text(0, 0, val.toString(), { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
                
                container.add([bg, text]);
                container.setSize(50, 50);
                
                this.makeDraggable(container);
                container.weightValue = val;
                container.originalX = container.x;
                container.originalY = container.y;
                
                this.weights.push(container);
            }
        });
        
        this.updateBalance();
    }

    onDrop(pointer, gameObject, dropZone) {
        gameObject.x = dropZone.x + Phaser.Math.Between(-20, 20);
        gameObject.y = dropZone.y + Phaser.Math.Between(-20, 20);
        
        // Calculate total weight on right
        this.calculateRightWeight();
        this.updateBalance();
    }

    calculateRightWeight() {
        this.rightWeight = 0;
        this.weights.forEach(w => {
            if (Phaser.Math.Distance.Between(w.x, w.y, this.rightPan.x, this.rightPan.y) < 60) {
                this.rightWeight += w.weightValue;
            }
        });
    }

    updateBalance() {
        let diff = this.rightWeight - this.leftWeight;
        let angle = Phaser.Math.Clamp(diff * 2, -20, 20);
        
        this.tweens.add({
            targets: this.beam,
            angle: angle,
            duration: 500,
            ease: 'Cubic.out'
        });

        this.tweens.add({
            targets: [this.leftPan, this.rightPan],
            y: this.cameras.main.centerY + 50 + angle * 2, // Simple approximation
            duration: 500
        });

        if (this.rightWeight === this.leftWeight) {
            this.audioManager.play('success');
            this.time.delayedCall(1000, () => this.startLevel());
        }
    }
}
