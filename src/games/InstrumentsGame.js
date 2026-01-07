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
        
        this.score = 0;
        this.totalQuestions = 4;
        this.currentLevelIndex = 0;
        this.numberOfLevels = 5;
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
        
        // Instruction Text at top center with white background (like GCompris)
        const instructionBg = this.add.graphics().setDepth(10);
        instructionBg.fillStyle(0xFFFFFF, 0.95);
        instructionBg.fillRoundedRect(width / 2 - 200, 20, 400, 50, 10);
        
        this.instructionText = this.add.text(width / 2, 45, '', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#333333',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(11);

        // Score counter at top left (like "0/4" in GCompris)
        const scoreBg = this.add.graphics().setDepth(10);
        scoreBg.fillStyle(0xFFFFFF, 0.9);
        scoreBg.fillRoundedRect(15, 15, 60, 40, 10);
        
        this.scoreText = this.add.text(45, 35, '0/' + this.totalQuestions, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#333333',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(11);

        // Replay Sound Button - Orange circle with lips icon on right side (like GCompris)
        this.createReplayButton(width - 60, height - 60);

        // GCompris-style navigation bar at bottom left
        this.createNavigationBar();
    }

    createReplayButton(x, y) {
        const size = 70;
        
        // Orange circular button
        const bg = this.add.graphics().setDepth(100);
        bg.fillStyle(0xE67E22, 1);
        bg.fillCircle(x, y, size / 2);
        bg.lineStyle(3, 0xFFFFFF, 0.3);
        bg.strokeCircle(x, y, size / 2);
        
        // Lips/speaker icon (using emoji)
        this.add.text(x, y, '👄', {
            fontSize: '32px'
        }).setOrigin(0.5).setDepth(101);
        
        // Make interactive
        const hitArea = this.add.circle(x, y, size / 2).setInteractive({ useHandCursor: true });
        hitArea.setAlpha(0.001);
        hitArea.on('pointerdown', () => {
            this.playQuestionSound();
        });
    }

    createNavigationBar() {
        const { width, height } = this.scale;
        this.navContainer = this.add.container(0, 0).setDepth(200);
        const btnSize = 60;
        const spacing = 8;
        let x = 15;
        const y = height - btnSize / 2 - 12;

        // Brown menu button (hamburger)
        this.createNavButton(x + btnSize / 2, y, btnSize, 0x8B4513, '☰', 'menu');
        x += btnSize + spacing;

        // Green help button
        this.createNavButton(x + btnSize / 2, y, btnSize, 0x2ECC71, '?', 'help');
        x += btnSize + spacing;

        // Cyan home button
        this.createNavButton(x + btnSize / 2, y, btnSize, 0x17A2B8, '⌂', 'home');
        x += btnSize + spacing;

        // Orange left arrow (prev level)
        this.createNavButton(x + btnSize / 2, y, btnSize * 0.7, 0xE67E22, '❮', 'prevLevel');
        x += btnSize * 0.7 + spacing;

        // Level number display
        this.levelText = this.add.text(x + 15, y, (this.currentLevelIndex + 1).toString(), {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(201);
        this.navContainer.add(this.levelText);
        x += 40;

        // Orange right arrow (next level) 
        this.createNavButton(x + btnSize / 2, y, btnSize * 0.7, 0xE67E22, '❯', 'nextLevel');
        x += btnSize * 0.7 + spacing + 20;

        // Dash/underscore (decorative, like in GCompris)
        this.add.text(x, y, '—', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(201);
    }

    createNavButton(x, y, size, color, symbol, action) {
        const btn = this.add.container(x, y).setDepth(200);

        // Circle background
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillCircle(0, 0, size / 2);
        bg.lineStyle(3, 0xFFFFFF, 0.3);
        bg.strokeCircle(0, 0, size / 2);

        // Symbol text
        const text = this.add.text(0, 0, symbol, {
            fontSize: `${size * 0.5}px`,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        btn.add([bg, text]);
        this.navContainer.add(btn);

        // Make interactive
        const hitArea = this.add.circle(x, y, size / 2).setInteractive({ useHandCursor: true });
        hitArea.setAlpha(0.001);
        hitArea.on('pointerdown', () => this.handleNavAction(action));
    }

    handleNavAction(action) {
        switch (action) {
            case 'home':
                this.scene.start('GameMenu');
                break;
            case 'help':
                this.showHelp();
                break;
            case 'menu':
                break;
            case 'prevLevel':
                if (this.currentLevelIndex > 0) {
                    this.currentLevelIndex--;
                    this.updateLevelText();
                    this.startLevel();
                }
                break;
            case 'nextLevel':
                if (this.currentLevelIndex < this.numberOfLevels - 1) {
                    this.currentLevelIndex++;
                    this.updateLevelText();
                    this.startLevel();
                }
                break;
        }
    }

    updateLevelText() {
        if (this.levelText) {
            this.levelText.setText((this.currentLevelIndex + 1).toString());
        }
    }

    showHelp() {
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(300).setInteractive();

        const panel = this.add.graphics().setDepth(301);
        const panelWidth = 500;
        const panelHeight = 280;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = height / 2 - panelHeight / 2;

        panel.fillStyle(0x8B0000, 0.95);
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
        panel.lineStyle(3, 0xFFD700);
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);

        const title = this.add.text(width / 2, panelY + 40, '🎵 Musical Instruments', {
            fontSize: '28px', fontFamily: 'Arial', fontWeight: 'bold', color: '#FFD700'
        }).setOrigin(0.5).setDepth(302);

        const instructions = this.add.text(width / 2, panelY + 130,
            'Listen to the sound and click on the\ncorrect musical instrument!\n\n' +
            'Click the lips button to hear the sound again.',
            { fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF', align: 'center', lineSpacing: 8 }
        ).setOrigin(0.5).setDepth(302);

        const closeBtn = this.add.text(width / 2, panelY + panelHeight - 45, 'Got it!', {
            fontSize: '22px', fontFamily: 'Arial', fontWeight: 'bold', color: '#FFFFFF',
            backgroundColor: '#2ECC71', padding: { x: 30, y: 10 }
        }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            overlay.destroy(); panel.destroy(); title.destroy(); instructions.destroy(); closeBtn.destroy();
        });
    }

    setupGameLogic() {
        this.levels = [
            ['clarinet', 'flute_traversiere', 'guitar', 'harp'],
            ['piano', 'saxophone', 'trombone', 'trumpet', 'violin'],
            ['clarinet', 'flute_traversiere', 'guitar', 'harp', 'piano', 'saxophone', 'trombone', 'trumpet'],
            ['accordion', 'banjo', 'bongo', 'castanets', 'cymbal', 'drum_kit', 'electric_guitar', 'horn'],
            ['maracas', 'organ', 'snare_drum', 'tambourine', 'timpani', 'triangle', 'tuba', 'violin']
        ];
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
        
        // Update UI - GCompris style "Find the [instrument]"
        this.instructionText.setText(`Find the ${this.formatName(this.targetItem)}`);
        
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
            this.score++;
            this.updateScore();
            
            this.instructionText.setText(`Correct! It's a ${this.formatName(selectedKey)}`);
            if (this.audioManager) this.audioManager.playSound('success');
            
            // Celebration tween
            this.tweens.add({
                targets: itemSprite,
                angle: 360,
                duration: 500,
                onComplete: () => {
                    this.time.delayedCall(1000, () => {
                        if (this.score >= this.totalQuestions) {
                            this.levelComplete();
                        } else {
                            this.nextQuestion();
                        }
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

    updateScore() {
        if (this.scoreText) {
            this.scoreText.setText(`${this.score}/${this.totalQuestions}`);
        }
    }

    levelComplete() {
        const { width, height } = this.scale;
        
        this.instructionText.setText('Level Complete! 🎉');
        
        // Auto-advance to next level after delay
        this.time.delayedCall(2000, () => {
            if (this.currentLevelIndex < this.numberOfLevels - 1) {
                this.currentLevelIndex++;
                this.updateLevelText();
                this.score = 0;
                this.updateScore();
                this.startLevel();
            }
        });
    }

    formatName(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    restartLevel() {
        this.score = 0;
        this.updateScore();
        this.startLevel();
    }
}
