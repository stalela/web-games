import { DragDropGame } from './DragDropGame.js';

export class OrderingSentences extends DragDropGame {
    constructor() {
        super();
        this.words = [];
        this.slots = [];
        this.sentences = [
            "THE CAT IS ON THE MAT",
            "I LIKE TO PLAY GAMES",
            "THE SUN IS SHINING BRIGHT",
            "READING IS FUN TO DO",
            "APPLES ARE RED AND SWEET"
        ];
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xFFE0B2)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Form a Meaningful Sentence", {
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
        this.words.forEach(w => w.destroy());
        this.slots.forEach(s => s.destroy());
        this.words = [];
        this.slots = [];

        // Pick random sentence
        const sentence = Phaser.Math.RND.pick(this.sentences);
        const words = sentence.split(' ');
        const shuffledWords = [...words];
        // Simple shuffle
        for (let i = shuffledWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
        }

        // Create Slots (Top)
        const totalWidth = words.length * 120;
        const startX = this.cameras.main.centerX - totalWidth / 2 + 60;
        const slotY = 200;
        
        for (let i = 0; i < words.length; i++) {
            let slot = this.add.rectangle(startX + i * 120, slotY, 100, 60, 0xcccccc)
                .setStrokeStyle(2, 0x000000);
            
            // Add zone for drop detection
            let zone = this.add.zone(startX + i * 120, slotY, 100, 60).setRectangleDropZone(100, 60);
            zone.expectedWord = words[i];
            zone.index = i;
            this.slots.push(zone);
        }

        // Create Draggable Words (Bottom)
        const wordY = 400;
        shuffledWords.forEach((word, index) => {
            // Randomize position slightly
            const x = startX + index * 120 + Phaser.Math.Between(-20, 20);
            const y = wordY + Phaser.Math.Between(-20, 20);

            let container = this.add.container(x, y);
            
            let bg = this.add.rectangle(0, 0, 100, 50, 0x8e44ad);
            let text = this.add.text(0, 0, word, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
            
            container.add([bg, text]);
            container.setSize(100, 50);
            
            this.makeDraggable(container);
            container.word = word;
            container.originalX = x;
            container.originalY = y;
            
            this.words.push(container);
        });
    }

    onDrop(pointer, gameObject, dropZone) {
        // Allow dropping any word in any slot, check correctness later or immediately?
        // Let's check immediately for simplicity in this version, or allow placement and check at end.
        // GCompris usually allows placement anywhere.
        
        // For this implementation, let's enforce correct placement for immediate feedback
        if (gameObject.word === dropZone.expectedWord) {
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            gameObject.input.enabled = false; // Lock
            this.audioManager.play('success');
            
            // Check win
            if (this.words.every(w => !w.input.enabled)) {
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
