import { LalelaGame } from '../utils/LalelaGame.js';

export class MelodyGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'MelodyGame',
            title: 'Melody',
            description: 'Listen to the sound sequence and repeat it.',
            category: 'discovery'
        });
    }

    preload() {
        super.preload();
        this.load.svg('melody-xylofon', 'assets/melody/xylofon.svg');
        this.load.svg('melody-part1', 'assets/melody/xylofon_part1.svg');
        this.load.svg('melody-part2', 'assets/melody/xylofon_part2.svg');
        this.load.svg('melody-part3', 'assets/melody/xylofon_part3.svg');
        this.load.svg('melody-part4', 'assets/melody/xylofon_part4.svg');
        
        this.load.audio('melody-son1', 'assets/melody/xylofon_son1.wav');
        this.load.audio('melody-son2', 'assets/melody/xylofon_son2.wav');
        this.load.audio('melody-son3', 'assets/melody/xylofon_son3.wav');
        this.load.audio('melody-son4', 'assets/melody/xylofon_son4.wav');
        this.load.audio('melody-knock', 'assets/melody/knock.wav');
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.rectangle(0, 0, width, height, 0xABCDEF).setOrigin(0).setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, 'Listen and repeat', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create Xylophone
        // The base image
        const xylofon = this.add.image(width/2, height/2, 'melody-xylofon');
        const scale = Math.min((width - 100) / xylofon.width, (height - 200) / xylofon.height);
        xylofon.setScale(scale);
        
        // Create interactive parts (keys)
        // We need to position them over the base image.
        // Since they are parts of the same SVG, they should align if placed at same center.
        
        this.keys = [];
        for (let i = 1; i <= 4; i++) {
            const key = this.add.image(width/2, height/2, `melody-part1`); // Placeholder texture
            key.setTexture(`melody-part${i}`);
            key.setScale(scale);
            key.setInteractive({ pixelPerfect: true }); // Use pixel perfect if possible, or just bounding box
            // Actually, pixel perfect might be expensive or not supported for SVG in Phaser without extra work.
            // Let's assume standard hit area for now.
            
            // To make it look like it's lighting up, we can toggle alpha or tint.
            // But these are separate images.
            // Let's assume they are the "highlighted" versions or just the keys themselves.
            // If they are the keys, we should hide the base xylofon keys?
            // Or maybe the base xylofon has everything and these are overlays?
            // Let's assume overlays.
            
            key.setAlpha(0.01); // Invisible but interactive
            
            key.on('pointerdown', () => this.handleInput(i));
            
            this.keys.push({
                sprite: key,
                id: i,
                sound: `melody-son${i}`
            });
        }
        
        this.sequence = [];
        this.playerSequence = [];
        this.isPlayingSequence = false;
        this.level = 1;
        
        this.time.delayedCall(1000, () => this.startLevel());
    }
    
    startLevel() {
        this.sequence = [];
        this.playerSequence = [];
        this.instructionText.setText(`Level ${this.level}`);
        
        // Generate sequence
        for (let i = 0; i < this.level; i++) {
            this.sequence.push(Phaser.Math.Between(1, 4));
        }
        
        this.playSequence();
    }
    
    playSequence() {
        this.isPlayingSequence = true;
        this.input.enabled = false; // Disable input
        
        let delay = 500;
        this.sequence.forEach((noteId, index) => {
            this.time.delayedCall(delay, () => {
                this.playNote(noteId);
            });
            delay += 800;
        });
        
        this.time.delayedCall(delay, () => {
            this.isPlayingSequence = false;
            this.input.enabled = true;
            this.instructionText.setText('Your turn!');
        });
    }
    
    playNote(noteId) {
        const keyObj = this.keys[noteId - 1];
        
        // Visual feedback
        keyObj.sprite.setAlpha(1);
        keyObj.sprite.setTint(0xFFFF00); // Highlight
        
        // Audio
        this.audioManager.playSound(keyObj.sound);
        
        this.time.delayedCall(300, () => {
            keyObj.sprite.setAlpha(0.01);
            keyObj.sprite.clearTint();
        });
    }
    
    handleInput(noteId) {
        if (this.isPlayingSequence) return;
        
        this.playNote(noteId);
        this.playerSequence.push(noteId);
        
        // Check correctness
        const currentIndex = this.playerSequence.length - 1;
        if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
            // Wrong note
            this.audioManager.playSound('error');
            this.instructionText.setText('Wrong! Try again.');
            this.time.delayedCall(1000, () => {
                this.playerSequence = [];
                this.playSequence();
            });
        } else {
            // Correct so far
            if (this.playerSequence.length === this.sequence.length) {
                // Level complete
                this.audioManager.playSound('success');
                this.instructionText.setText('Good job!');
                this.level++;
                this.time.delayedCall(1500, () => this.startLevel());
            }
        }
    }
}
