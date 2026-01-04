import { DragDropGame } from './DragDropGame.js';

export class OrderingAlphabets extends DragDropGame {
    constructor() {
        super();
        this.letters = [];
        this.slots = [];
        this.currentSet = [];
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xFFF0F5)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Order the Letters Alphabetically", {
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
        this.letters.forEach(l => l.destroy());
        this.slots.forEach(s => s.destroy());
        this.letters = [];
        this.slots = [];

        // Generate random set of 5 unique letters
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let set = [];
        while (set.length < 5) {
            let char = alphabet[Phaser.Math.Between(0, 25)];
            if (!set.includes(char)) set.push(char);
        }
        this.currentSet = [...set]; // Keep original for checking? No, we need sorted.
        const sortedSet = [...set].sort();

        // Create Slots (Top)
        const startX = this.cameras.main.centerX - (5 * 80) / 2 + 40;
        const slotY = 200;
        
        for (let i = 0; i < 5; i++) {
            let slot = this.add.rectangle(startX + i * 80, slotY, 60, 60, 0xcccccc)
                .setStrokeStyle(2, 0x000000);
            
            // Add zone for drop detection
            let zone = this.add.zone(startX + i * 80, slotY, 60, 60).setRectangleDropZone(60, 60);
            zone.expectedChar = sortedSet[i];
            this.slots.push(zone);
        }

        // Create Draggable Letters (Bottom, shuffled)
        const letterY = 400;
        set.forEach((char, index) => {
            let container = this.add.container(startX + index * 80, letterY);
            
            let bg = this.add.rectangle(0, 0, 50, 50, 0x3498db);
            let text = this.add.text(0, 0, char, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
            
            container.add([bg, text]);
            container.setSize(50, 50);
            
            this.makeDraggable(container);
            container.char = char;
            container.originalX = container.x;
            container.originalY = container.y;
            
            this.letters.push(container);
        });
    }

    onDrop(pointer, gameObject, dropZone) {
        if (gameObject.char === dropZone.expectedChar) {
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            gameObject.input.enabled = false; // Lock in place
            this.audioManager.play('success');
            
            // Check win
            if (this.letters.every(l => !l.input.enabled)) {
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
