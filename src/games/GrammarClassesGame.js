import { LalelaGame } from '../utils/LalelaGame.js';

// Grammar class definitions with colors and symbols
const grammarClasses = [
    { code: 'noun', name: 'Noun', color: 0x8EEB76, symbol: '▲', examples: ['cat', 'house', 'tree'] },
    { code: 'verb', name: 'Verb', color: 0xE65B48, symbol: '●', examples: ['run', 'eat', 'play'] },
    { code: 'adjective', name: 'Adjective', color: 0xECA06F, symbol: '◆', examples: ['big', 'red', 'happy'] },
    { code: 'adverb', name: 'Adverb', color: 0x00B378, symbol: '★', examples: ['quickly', 'slowly', 'well'] },
    { code: 'pronoun', name: 'Pronoun', color: 0xE31BE3, symbol: '■', examples: ['he', 'she', 'they'] },
    { code: 'preposition', name: 'Preposition', color: 0xE8EF48, symbol: '◇', examples: ['on', 'in', 'under'] },
    { code: 'conjunction', name: 'Conjunction', color: 0x42B324, symbol: '○', examples: ['and', 'but', 'or'] },
    { code: 'determiner', name: 'Determiner', color: 0x2760B5, symbol: '□', examples: ['the', 'a', 'some'] }
];

// Word bank with their correct classes
const wordBank = {
    noun: ['cat', 'dog', 'house', 'tree', 'book', 'table', 'chair', 'flower', 'mountain', 'river', 'city', 'friend', 'music', 'food', 'water'],
    verb: ['run', 'jump', 'eat', 'sleep', 'read', 'write', 'play', 'sing', 'dance', 'walk', 'talk', 'think', 'learn', 'teach', 'help'],
    adjective: ['big', 'small', 'red', 'blue', 'happy', 'sad', 'fast', 'slow', 'hot', 'cold', 'new', 'old', 'tall', 'short', 'beautiful'],
    adverb: ['quickly', 'slowly', 'carefully', 'loudly', 'quietly', 'always', 'never', 'often', 'sometimes', 'well', 'badly', 'easily', 'hardly'],
    pronoun: ['I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself'],
    preposition: ['on', 'in', 'under', 'over', 'between', 'beside', 'behind', 'with', 'without', 'from', 'to', 'at', 'by', 'for'],
    conjunction: ['and', 'but', 'or', 'because', 'although', 'if', 'when', 'while', 'since', 'unless', 'until'],
    determiner: ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'some', 'any', 'every']
};

export class GrammarClassesGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'GrammarClassesGame',
            title: 'Grammar Classes',
            description: 'Sort words into their grammatical classes.',
            category: 'reading'
        });
        
        this.currentLevel = 0;
        this.score = 0;
        this.wordsToSort = [];
        this.dropZones = [];
    }

    preload() {
        super.preload();
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        const { width } = this.cameras.main;
        
        this.add.text(width / 2, 30, 'Grammar Classes', {
            fontFamily: 'Nunito, Arial',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.instructionText = this.add.text(width / 2, 70, 'Drag each word to its correct grammar class!', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.scoreText = this.add.text(100, 30, 'Score: 0', {
            fontFamily: 'Nunito, Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(width - 100, 30, 'Level: 1', {
            fontFamily: 'Nunito, Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.clearLevel();
        
        // Determine which classes to use based on level
        const numClasses = Math.min(2 + Math.floor(levelIndex / 2), grammarClasses.length);
        this.activeClasses = grammarClasses.slice(0, numClasses);
        
        this.levelText.setText(`Level: ${levelIndex + 1}`);
        
        this.createDropZones();
        this.createWords();
    }

    createDropZones() {
        const { width, height } = this.cameras.main;
        const zoneWidth = 150;
        const zoneHeight = 120;
        const spacing = 20;
        
        const numZones = this.activeClasses.length;
        const totalWidth = numZones * zoneWidth + (numZones - 1) * spacing;
        const startX = (width - totalWidth) / 2 + zoneWidth / 2;
        const zoneY = height - 150;
        
        this.dropZones = [];
        
        this.activeClasses.forEach((classInfo, i) => {
            const x = startX + i * (zoneWidth + spacing);
            
            // Zone background
            const zone = this.add.rectangle(x, zoneY, zoneWidth, zoneHeight, classInfo.color, 0.3);
            zone.setStrokeStyle(3, classInfo.color);
            zone.classCode = classInfo.code;
            
            // Zone label
            const label = this.add.text(x, zoneY - 40, classInfo.name, {
                fontFamily: 'Nunito, Arial',
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Symbol
            const symbol = this.add.text(x, zoneY, classInfo.symbol, {
                fontFamily: 'Nunito, Arial',
                fontSize: '32px',
                color: '#ffffff'
            }).setOrigin(0.5).setAlpha(0.5);
            
            this.dropZones.push({ zone, label, symbol, classCode: classInfo.code, color: classInfo.color });
        });
    }

    createWords() {
        const { width, height } = this.cameras.main;
        
        // Generate words for each active class
        this.wordsToSort = [];
        const wordsPerClass = 2;
        
        this.activeClasses.forEach(classInfo => {
            const classWords = wordBank[classInfo.code];
            if (!classWords) return;
            
            const shuffled = [...classWords].sort(() => Math.random() - 0.5);
            for (let i = 0; i < wordsPerClass && i < shuffled.length; i++) {
                this.wordsToSort.push({
                    word: shuffled[i],
                    classCode: classInfo.code
                });
            }
        });
        
        // Shuffle all words
        this.wordsToSort.sort(() => Math.random() - 0.5);
        
        // Create draggable word buttons
        const wordY = 150;
        const wordSpacing = 120;
        const totalWidth = this.wordsToSort.length * wordSpacing;
        const startX = (width - totalWidth) / 2 + wordSpacing / 2;
        
        this.wordObjects = [];
        
        this.wordsToSort.forEach((wordData, i) => {
            const x = startX + i * wordSpacing;
            
            const bg = this.add.rectangle(x, wordY, 100, 40, 0x0062FF);
            bg.setStrokeStyle(2, 0xffffff);
            bg.setInteractive({ draggable: true, useHandCursor: true });
            bg.wordData = wordData;
            bg.originalX = x;
            bg.originalY = wordY;
            
            const text = this.add.text(x, wordY, wordData.word, {
                fontFamily: 'Nunito, Arial',
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            this.input.setDraggable(bg);
            
            bg.on('drag', (pointer, dragX, dragY) => {
                bg.x = dragX;
                bg.y = dragY;
                text.x = dragX;
                text.y = dragY;
            });
            
            bg.on('dragend', () => {
                this.checkDrop(bg, text);
            });
            
            this.wordObjects.push({ bg, text });
        });
    }

    checkDrop(wordBg, wordText) {
        const wordData = wordBg.wordData;
        let matched = false;
        
        this.dropZones.forEach(dz => {
            const bounds = dz.zone.getBounds();
            
            if (Phaser.Geom.Rectangle.Contains(bounds, wordBg.x, wordBg.y)) {
                if (wordData.classCode === dz.classCode) {
                    // Correct!
                    wordBg.setFillStyle(dz.color);
                    wordBg.disableInteractive();
                    this.score += 10;
                    this.scoreText.setText(`Score: ${this.score}`);
                    if (this.audioManager) this.audioManager.playSound('success');
                    matched = true;
                    
                    // Check if level complete
                    this.checkLevelComplete();
                } else {
                    // Wrong!
                    if (this.audioManager) this.audioManager.playSound('error');
                    // Flash red
                    wordBg.setFillStyle(0xff0000);
                    this.time.delayedCall(300, () => {
                        wordBg.setFillStyle(0x0062FF);
                    });
                }
            }
        });
        
        if (!matched) {
            // Return to original position
            wordBg.x = wordBg.originalX;
            wordBg.y = wordBg.originalY;
            wordText.x = wordBg.originalX;
            wordText.y = wordBg.originalY;
        }
    }

    checkLevelComplete() {
        const remaining = this.wordObjects.filter(wo => wo.bg.input && wo.bg.input.enabled);
        
        if (remaining.length === 0) {
            this.time.delayedCall(1000, () => {
                if (this.audioManager) this.audioManager.playSound('win');
                this.showLevelComplete();
            });
        }
    }

    showLevelComplete() {
        const { width, height } = this.cameras.main;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(100);
        
        const msg = this.add.text(width / 2, height / 2 - 30, '🎉 Level Complete! 🎉', {
            fontFamily: 'Nunito, Arial',
            fontSize: '40px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);
        
        const nextBtn = this.add.text(width / 2, height / 2 + 50, 'Next Level →', {
            fontFamily: 'Nunito, Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#0062FF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
        
        nextBtn.on('pointerdown', () => {
            overlay.destroy();
            msg.destroy();
            nextBtn.destroy();
            
            if (this.currentLevel < 10) {
                this.startLevel(this.currentLevel + 1);
            } else {
                this.scene.start('GameMenu');
            }
        });
    }

    clearLevel() {
        if (this.wordObjects) {
            this.wordObjects.forEach(wo => {
                wo.bg.destroy();
                wo.text.destroy();
            });
        }
        if (this.dropZones) {
            this.dropZones.forEach(dz => {
                dz.zone.destroy();
                dz.label.destroy();
                dz.symbol.destroy();
            });
        }
        this.wordObjects = [];
        this.dropZones = [];
    }
}
