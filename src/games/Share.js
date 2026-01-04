import { DragDropGame } from './DragDropGame.js';

export class Share extends DragDropGame {
    constructor() {
        super();
        this.candies = [];
        this.children = [];
        this.slots = [];
        this.candyCount = 0;
        this.childCount = 0;
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xFFECB3)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Share the Candy Equally", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        // Clear
        this.candies.forEach(c => c.destroy());
        this.slots.forEach(s => s.destroy());
        this.children.forEach(c => c.destroy()); // Visuals
        this.candies = [];
        this.slots = [];
        this.children = [];

        this.childCount = Phaser.Math.Between(2, 4);
        const sharePerChild = Phaser.Math.Between(2, 4);
        this.candyCount = this.childCount * sharePerChild;

        // Create Children (Slots)
        const startX = this.cameras.main.centerX - (this.childCount * 150) / 2 + 75;
        const childY = 200;

        for (let i = 0; i < this.childCount; i++) {
            // Visual Child
            let child = this.add.circle(startX + i * 150, childY - 50, 30, 0xFFCC80);
            this.children.push(child);
            
            // Plate/Slot
            let plate = this.add.ellipse(startX + i * 150, childY + 50, 120, 60, 0xffffff).setStrokeStyle(2, 0x000000);
            
            let zone = this.add.zone(startX + i * 150, childY + 50, 120, 60).setRectangleDropZone(120, 60);
            zone.childIndex = i;
            zone.currentCandies = 0;
            this.slots.push(zone);
        }

        // Create Candies
        const candyY = 450;
        for (let i = 0; i < this.candyCount; i++) {
            let x = this.cameras.main.centerX + Phaser.Math.Between(-200, 200);
            let y = candyY + Phaser.Math.Between(-50, 50);
            
            let candy = this.add.circle(x, y, 15, 0xE91E63).setInteractive();
            this.makeDraggable(candy);
            candy.originalX = x;
            candy.originalY = y;
            this.candies.push(candy);
        }
    }

    onDrop(pointer, gameObject, dropZone) {
        gameObject.x = dropZone.x + Phaser.Math.Between(-30, 30);
        gameObject.y = dropZone.y + Phaser.Math.Between(-15, 15);
        
        this.checkWinCondition();
    }

    checkWinCondition() {
        // Count candies in each zone
        let counts = new Array(this.childCount).fill(0);
        
        this.candies.forEach(candy => {
            this.slots.forEach((slot, index) => {
                if (Phaser.Math.Distance.Between(candy.x, candy.y, slot.x, slot.y) < 60) {
                    counts[index]++;
                }
            });
        });

        // Check if all equal and sum equals total
        const expected = this.candyCount / this.childCount;
        if (counts.every(c => c === expected)) {
            this.audioManager.play('success');
            this.time.delayedCall(1000, () => this.startLevel());
        }
    }
}
