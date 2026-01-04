import { DragDropGame } from './DragDropGame.js';

export class OrderingNumbers extends DragDropGame {
    constructor() {
        super();
        this.numbers = [];
        this.slots = [];
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xE0F7FA)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Order the Numbers (Ascending)", {
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
        this.numbers.forEach(n => n.destroy());
        this.slots.forEach(s => s.destroy());
        this.numbers = [];
        this.slots = [];

        // Generate random set of 5 unique numbers
        let set = [];
        while (set.length < 5) {
            let num = Phaser.Math.Between(1, 99);
            if (!set.includes(num)) set.push(num);
        }
        const sortedSet = [...set].sort((a, b) => a - b);

        // Create Slots (Top)
        const startX = this.cameras.main.centerX - (5 * 80) / 2 + 40;
        const slotY = 200;
        
        for (let i = 0; i < 5; i++) {
            let slot = this.add.rectangle(startX + i * 80, slotY, 60, 60, 0xcccccc)
                .setStrokeStyle(2, 0x000000);
            
            // Add zone for drop detection
            let zone = this.add.zone(startX + i * 80, slotY, 60, 60).setRectangleDropZone(60, 60);
            zone.expectedNum = sortedSet[i];
            this.slots.push(zone);
        }

        // Create Draggable Numbers (Bottom, shuffled)
        const numY = 400;
        set.forEach((num, index) => {
            let container = this.add.container(startX + index * 80, numY);
            
            let bg = this.add.rectangle(0, 0, 50, 50, 0xe67e22);
            let text = this.add.text(0, 0, num.toString(), { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
            
            container.add([bg, text]);
            container.setSize(50, 50);
            
            this.makeDraggable(container);
            container.num = num;
            container.originalX = container.x;
            container.originalY = container.y;
            
            this.numbers.push(container);
        });
    }

    onDrop(pointer, gameObject, dropZone) {
        if (gameObject.num === dropZone.expectedNum) {
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            gameObject.input.enabled = false; // Lock in place
            this.audioManager.play('success');
            
            // Check win
            if (this.numbers.every(n => !n.input.enabled)) {
                this.time.delayedCall(1000, () => this.startLevel());
            }
        } else {
            this.audioManager.play('error');
            this.tweens.add({
                targets: gameObject,
                x: gameObject.originalX,
                y: gameObject.originalY,
                duration: 300,
                ease: 'Back.out'
            });
        }
    }
}
