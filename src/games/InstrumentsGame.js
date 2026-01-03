import { LalelaGame } from '../utils/LalelaGame.js';

export class InstrumentsGame extends LalelaGame {
    constructor() {
        super({
            key: 'InstrumentsGame',
            name: 'Instruments',
            category: 'discovery',
            difficulty: 2,
            description: 'Learn to recognize musical instruments.'
        });
    }

    preload() {
        super.preload();
        
        // Load background
        this.load.svg('instruments-bg', 'assets/instruments/background.svg', { width: 1024, height: 600 });
        
        // Load all instrument assets
        const instruments = [
            'accordion', 'banjo', 'bongo', 'castanets', 'cello', 'clarinet', 'cymbal', 
            'drum_kit', 'electric_guitar', 'flute_traversiere', 'guitar', 'harmonica', 
            'harp', 'horn', 'maracas', 'organ', 'piano', 'saxophone', 'snare_drum', 
            'tambourine', 'timpani', 'triangle', 'trombone', 'trumpet', 'tuba', 'violin'
        ];
        
        instruments.forEach(inst => {
            this.load.svg(inst, `assets/instruments/${inst}.svg`);
            this.load.audio(inst + '-sound', `assets/instruments/${inst}.ogg`);
        });
    }

    create() {
        super.create();
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'instruments-bg');
        
        // Scale to cover
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
        bg.setDepth(-1);
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Title
        this.add.text(width / 2, 30, 'Instruments', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);
        
        // Instruction Text
        this.instructionText = this.add.text(width / 2, height - 80, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(10);

        // Replay Sound Button
        this.replayButton = this.add.circle(width / 2, height - 140, 30, 0x00B378)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        this.add.image(width / 2, height - 140, 'ui-sound-on') // Assuming this icon exists or use text
            .setScale(0.5).setDepth(11);
        
        // Fallback icon if image doesn't exist
        this.add.text(width / 2, height - 140, '🔊', { fontSize: '24px' }).setOrigin(0.5).setDepth(11);

        this.replayButton.on('pointerdown', () => {
            this.playQuestionSound();
        });

        this.createNavigationDock();
    }

    setupGameLogic() {
        this.levels = [
            // Level 1
            ['clarinet', 'flute_traversiere', 'guitar', 'harp'],
            // Level 2
            ['piano', 'saxophone', 'trombone', 'trumpet', 'violin'],
            // Level 3
            ['clarinet', 'flute_traversiere', 'guitar', 'harp', 'piano', 'saxophone', 'trombone', 'trumpet'],
            // Level 4
            ['accordion', 'banjo', 'bongo', 'castanets', 'cymbal', 'drum_kit', 'electric_guitar', 'horn'],
            // Level 5
            ['maracas', 'organ', 'snare_drum', 'tambourine', 'timpani', 'triangle', 'tuba', 'violin']
        ];
        
        this.currentLevelIndex = 0;
        this.startLevel();
    }

    startLevel() {
        this.currentItems = this.levels[this.currentLevelIndex];
        this.createGrid();
        this.nextQuestion();
    }

    createGrid() {
        // Clear existing
        if (this.itemContainer) this.itemContainer.destroy();
        this.itemContainer = this.add.container(0, 0);
        
        const { width, height } = this.scale;
        const cols = Math.ceil(Math.sqrt(this.currentItems.length));
        const rows = Math.ceil(this.currentItems.length / cols);
        
        const padding = 20;
        const availableWidth = width - 100;
        const availableHeight = height - 200;
        
        const cellWidth = availableWidth / cols;
        const cellHeight = availableHeight / rows;
        
        this.items = [];
        
        this.currentItems.forEach((itemKey, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = 50 + col * cellWidth + cellWidth / 2;
            const y = 100 + row * cellHeight + cellHeight / 2;
            
            const item = this.add.image(x, y, itemKey);
            
            // Scale to fit cell
            const scale = Math.min((cellWidth - padding) / item.width, (cellHeight - padding) / item.height);
            item.setScale(scale);
            
            item.setInteractive({ useHandCursor: true });
            item.setData('key', itemKey);
            
            item.on('pointerdown', () => {
                this.checkAnswer(itemKey, item);
            });
            
            // Hover effect
            item.on('pointerover', () => {
                this.tweens.add({
                    targets: item,
                    scale: scale * 1.1,
                    duration: 100
                });
            });
            
            item.on('pointerout', () => {
                this.tweens.add({
                    targets: item,
                    scale: scale,
                    duration: 100
                });
            });
            
            this.itemContainer.add(item);
            this.items.push(item);
        });
    }

    nextQuestion() {
        // Pick random item
        this.targetItem = this.currentItems[Math.floor(Math.random() * this.currentItems.length)];
        
        // Update UI
        this.instructionText.setText('Click on the instrument you hear');
        
        // Play sound
        this.playQuestionSound();
    }

    playQuestionSound() {
        if (this.targetItem) {
            // Stop any playing sound
            this.sound.stopAll();
            this.sound.play(this.targetItem + '-sound');
        }
    }

    checkAnswer(selectedKey, itemSprite) {
        if (selectedKey === this.targetItem) {
            // Correct
            this.instructionText.setText(`Correct! It's a ${this.formatName(selectedKey)}`);
            if (this.audioManager) this.audioManager.playSound('success');
            
            // Celebration tween
            this.tweens.add({
                targets: itemSprite,
                angle: 360,
                duration: 500,
                onComplete: () => {
                    this.time.delayedCall(1000, () => {
                        this.nextQuestion();
                    });
                }
            });
        } else {
            // Incorrect
            this.instructionText.setText('Try again!');
            if (this.audioManager) this.audioManager.playSound('fail');
            
            // Shake tween
            this.tweens.add({
                targets: itemSprite,
                x: itemSprite.x + 10,
                duration: 50,
                yoyo: true,
                repeat: 3
            });
        }
    }

    formatName(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    restartLevel() {
        this.startLevel();
    }
}
