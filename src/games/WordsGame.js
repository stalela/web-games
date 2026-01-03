/**
 * WordsGame - Falling Words
 * 
 * Converted from GCompris wordsgame activity.
 * Original authors: Bruno Coudoin, Holger Kaelberer
 * 
 * Game description:
 * - Words fall from the top of the screen
 * - Player must type the complete word before it reaches the ground
 * - Typing starts matching from any falling word
 * - Speed increases as levels progress
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class WordsGame extends LalelaGame {
    constructor(config = { key: 'WordsGame' }) {
        super(config);
    }
    
    init(data) {
        super.init(data);
        
        // Word lists by difficulty level
        this.wordLists = [
            // Level 1: 3-letter words
            ['cat', 'dog', 'run', 'sun', 'hat', 'bat', 'cup', 'red', 'big', 'sit', 'hot', 'top', 'hop', 'map', 'pan', 'can', 'fan', 'van', 'man', 'tan'],
            // Level 2: 4-letter words  
            ['tree', 'bird', 'fish', 'book', 'hand', 'foot', 'door', 'ball', 'star', 'moon', 'rain', 'snow', 'wind', 'lake', 'rock', 'hill', 'road', 'jump', 'walk', 'swim'],
            // Level 3: 5-letter words
            ['apple', 'table', 'chair', 'house', 'mouse', 'plant', 'bread', 'green', 'brown', 'black', 'white', 'light', 'night', 'water', 'river', 'cloud', 'storm', 'ocean', 'earth', 'space'],
            // Level 4: 6-letter words
            ['flower', 'garden', 'window', 'basket', 'pencil', 'yellow', 'purple', 'orange', 'silver', 'golden', 'rabbit', 'turtle', 'monkey', 'giraffe', 'school', 'friend', 'family', 'summer', 'winter', 'spring'],
            // Level 5: 7+ letter words
            ['elephant', 'butterfly', 'computer', 'umbrella', 'kangaroo', 'dinosaur', 'beautiful', 'wonderful', 'adventure', 'chocolate', 'fantastic', 'delicious', 'excellent', 'important', 'different']
        ];
        
        this.currentLevel = 0;
        this.score = 0;
        this.wordsCompleted = 0;
        this.wordsPerLevel = 10;
        
        // Falling words
        this.fallingWords = [];
        this.currentWord = null; // Word currently being typed
        this.typedText = '';
        
        // Speed settings (ms per pixel)
        this.baseFallDuration = 8000;
        this.minFallDuration = 3000;
        this.dropInterval = 3000;
        this.maxFallingWords = 3;
        
        // Timers
        this.dropTimer = null;
        this.gameActive = false;
    }
    
    preload() {
        super.preload();
    }
    
    createBackground() {
        const { width, height } = this.scale;
        
        // Sky gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4169E1, 0x4169E1, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
        
        // Ground
        const groundHeight = 80;
        const ground = this.add.graphics();
        ground.fillStyle(0x8B4513, 1);
        ground.fillRect(0, height - groundHeight, width, groundHeight);
        ground.setDepth(0);
        
        // Grass on top of ground
        const grass = this.add.graphics();
        grass.fillStyle(0x228B22, 1);
        grass.fillRect(0, height - groundHeight, width, 15);
        grass.setDepth(1);
        
        this.groundY = height - groundHeight;
    }
    
    createUI() {
        const { width, height } = this.scale;
        
        // Title
        this.titleText = this.add.text(width / 2, 25, 'Falling Words', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            stroke: '#1a1a2e',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);
        
        // Instructions
        this.instructionText = this.add.text(width / 2, 55, 
            'Type the falling words before they hit the ground!', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        // Score and level display
        this.scoreText = this.add.text(20, 80, 'Score: 0', {
            fontSize: '20px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(10);
        
        this.levelText = this.add.text(width - 20, 80, `Level: 1/${this.wordLists.length}`, {
            fontSize: '20px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0).setDepth(10);
        
        this.progressText = this.add.text(width / 2, 80, `0/${this.wordsPerLevel}`, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        // Typing display area (shows what user is typing)
        this.createTypingDisplay();
        
        // Virtual keyboard hint
        this.createKeyboardHint();
        
        // Navigation dock
        this.createNavigationDock();
    }
    
    createTypingDisplay() {
        const { width, height } = this.scale;
        
        // Typing box at bottom above ground
        const boxY = this.groundY - 50;
        const boxWidth = 300;
        const boxHeight = 50;
        
        const typingBox = this.add.graphics();
        typingBox.fillStyle(0x000000, 0.7);
        typingBox.fillRoundedRect(width / 2 - boxWidth / 2, boxY - boxHeight / 2, boxWidth, boxHeight, 10);
        typingBox.lineStyle(3, 0xFFD700, 1);
        typingBox.strokeRoundedRect(width / 2 - boxWidth / 2, boxY - boxHeight / 2, boxWidth, boxHeight, 10);
        typingBox.setDepth(10);
        
        this.typingDisplayText = this.add.text(width / 2, boxY, '', {
            fontSize: '28px',
            fontFamily: 'Courier New, monospace',
            color: '#00FF00'
        }).setOrigin(0.5).setDepth(11);
        
        // Cursor blink
        this.cursor = this.add.text(width / 2, boxY, '|', {
            fontSize: '28px',
            fontFamily: 'Courier New, monospace',
            color: '#00FF00'
        }).setOrigin(0.5).setDepth(11);
        
        this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    createKeyboardHint() {
        const { width, height } = this.scale;
        
        this.keyboardHint = this.add.text(width / 2, this.groundY - 90, 
            '⌨️ Use your keyboard to type!', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
    }
    
    createNavigationDock() {
        const { width, height } = this.scale;
        const dockY = height - 40;
        const buttonSize = 50;
        const buttons = ['exit', 'settings', 'help', 'home'];
        const startX = width / 2 - (buttons.length * (buttonSize + 20)) / 2 + buttonSize / 2;
        
        buttons.forEach((btn, i) => {
            const x = startX + i * (buttonSize + 20);
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(0x333333, 0.8);
            buttonBg.fillCircle(x, dockY, buttonSize / 2);
            buttonBg.setDepth(15);
            
            const icons = { exit: '✕', settings: '⚙', help: '?', home: '⌂' };
            
            const icon = this.add.text(x, dockY, icons[btn], {
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(16);
            
            const hitArea = this.add.circle(x, dockY, buttonSize / 2, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            hitArea.on('pointerdown', () => this.handleNavigation(btn));
        });
    }
    
    handleNavigation(action) {
        if (action === 'exit' || action === 'home') {
            this.gameActive = false;
            this.scene.start('GameMenu');
        } else if (action === 'help') {
            this.showHelpModal();
        }
    }
    
    showHelpModal() {
        const { width, height } = this.scale;
        
        // Pause game
        this.gameActive = false;
        if (this.dropTimer) this.dropTimer.paused = true;
        
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(50);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        
        const modalWidth = Math.min(500, width - 40);
        const modalHeight = 300;
        const modalX = (width - modalWidth) / 2;
        const modalY = (height - modalHeight) / 2;
        
        const modal = this.add.graphics();
        modal.fillStyle(0xffffff, 1);
        modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);
        modal.setDepth(51);
        
        const helpTitle = this.add.text(width / 2, modalY + 30, 'How to Play', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#4169E1'
        }).setOrigin(0.5).setDepth(52);
        
        const helpText = this.add.text(width / 2, modalY + 130, 
            `Words fall from the sky!\n\n` +
            `Type each word on your keyboard\n` +
            `before it hits the ground.\n\n` +
            `Start typing any visible word -\n` +
            `the game will match it automatically.`, {
            fontSize: '17px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
            align: 'center'
        }).setOrigin(0.5).setDepth(52);
        
        const closeBtn = this.add.text(width / 2, modalY + modalHeight - 40, 'Continue', {
            fontSize: '22px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 25, y: 10 }
        }).setOrigin(0.5).setDepth(52);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            modal.destroy();
            helpTitle.destroy();
            helpText.destroy();
            closeBtn.destroy();
            this.gameActive = true;
            if (this.dropTimer) this.dropTimer.paused = false;
        });
    }
    
    setupGameLogic() {
        // Setup keyboard input
        this.input.keyboard.on('keydown', this.handleKeyPress, this);
        
        // Start the game
        this.startLevel();
    }
    
    startLevel() {
        this.wordsCompleted = 0;
        this.typedText = '';
        this.currentWord = null;
        this.gameActive = true;
        
        // Calculate speed based on level
        const speedReduction = this.currentLevel * 800;
        this.currentFallDuration = Math.max(
            this.baseFallDuration - speedReduction,
            this.minFallDuration
        );
        
        // Drop interval decreases with level
        const intervalReduction = this.currentLevel * 400;
        this.currentDropInterval = Math.max(
            this.dropInterval - intervalReduction,
            1500
        );
        
        this.updateUI();
        
        // Drop first word immediately
        this.dropWord();
        
        // Start drop timer
        this.dropTimer = this.time.addEvent({
            delay: this.currentDropInterval,
            callback: this.dropWord,
            callbackScope: this,
            loop: true
        });
    }
    
    dropWord() {
        if (!this.gameActive) return;
        
        // Don't drop too many words at once
        if (this.fallingWords.length >= this.maxFallingWords) return;
        
        const { width } = this.scale;
        const levelWords = this.wordLists[Math.min(this.currentLevel, this.wordLists.length - 1)];
        
        // Pick a random word
        const word = levelWords[Math.floor(Math.random() * levelWords.length)];
        
        // Create falling word object
        const wordObj = this.createFallingWord(word);
        this.fallingWords.push(wordObj);
    }
    
    createFallingWord(word) {
        const { width } = this.scale;
        
        // Random x position (ensuring word fits on screen)
        const padding = 100;
        const x = padding + Math.random() * (width - padding * 2);
        const y = -30;
        
        // Container for word
        const container = this.add.container(x, y);
        container.setDepth(5);
        
        // Background bubble
        const textMetrics = this.add.text(0, 0, word.toUpperCase(), {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif'
        });
        const textWidth = textMetrics.width;
        textMetrics.destroy();
        
        const bg = this.add.graphics();
        bg.fillStyle(0xFFFFFF, 0.95);
        bg.fillRoundedRect(-textWidth / 2 - 15, -20, textWidth + 30, 45, 10);
        bg.lineStyle(3, 0x4169E1, 1);
        bg.strokeRoundedRect(-textWidth / 2 - 15, -20, textWidth + 30, 45, 10);
        container.add(bg);
        
        // Word text
        const text = this.add.text(0, 0, word.toUpperCase(), {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#333333'
        }).setOrigin(0.5);
        container.add(text);
        
        // Typed portion highlight (initially empty)
        const typedHighlight = this.add.text(0, 0, '', {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#4CAF50'
        }).setOrigin(0.5);
        container.add(typedHighlight);
        
        // Create word object
        const wordObj = {
            word: word.toUpperCase(),
            container: container,
            text: text,
            typedHighlight: typedHighlight,
            typedCount: 0,
            isActive: true
        };
        
        // Start falling animation
        this.tweens.add({
            targets: container,
            y: this.groundY - 30,
            duration: this.currentFallDuration,
            ease: 'Linear',
            onComplete: () => this.onWordHitGround(wordObj)
        });
        
        return wordObj;
    }
    
    handleKeyPress(event) {
        if (!this.gameActive) return;
        
        // Only process letter keys
        const key = event.key.toUpperCase();
        if (!/^[A-Z]$/.test(key)) {
            // Handle backspace
            if (event.key === 'Backspace' && this.typedText.length > 0) {
                this.typedText = this.typedText.slice(0, -1);
                this.updateTypedDisplay();
                
                // Update current word highlight
                if (this.currentWord) {
                    this.currentWord.typedCount = this.typedText.length;
                    this.updateWordHighlight(this.currentWord);
                    
                    // If we've backspaced all, clear current word
                    if (this.typedText.length === 0) {
                        this.currentWord = null;
                    }
                }
            }
            return;
        }
        
        // Add to typed text
        const newTypedText = this.typedText + key;
        
        if (this.currentWord) {
            // Check if this key matches the current word's next character
            const expectedChar = this.currentWord.word[this.currentWord.typedCount];
            if (key === expectedChar) {
                this.typedText = newTypedText;
                this.currentWord.typedCount++;
                this.updateWordHighlight(this.currentWord);
                this.updateTypedDisplay();
                
                // Check if word is complete
                if (this.currentWord.typedCount >= this.currentWord.word.length) {
                    this.onWordComplete(this.currentWord);
                }
            } else {
                // Wrong key - show error flash
                this.showTypingError();
            }
        } else {
            // No current word - try to match against any falling word
            let matched = false;
            for (const wordObj of this.fallingWords) {
                if (wordObj.isActive && wordObj.word.startsWith(newTypedText)) {
                    this.currentWord = wordObj;
                    this.typedText = newTypedText;
                    this.currentWord.typedCount = newTypedText.length;
                    this.updateWordHighlight(this.currentWord);
                    this.updateTypedDisplay();
                    matched = true;
                    
                    // Check if word is complete (single letter word)
                    if (this.currentWord.typedCount >= this.currentWord.word.length) {
                        this.onWordComplete(this.currentWord);
                    }
                    break;
                }
            }
            
            if (!matched) {
                this.showTypingError();
            }
        }
    }
    
    updateWordHighlight(wordObj) {
        const typedPortion = wordObj.word.substring(0, wordObj.typedCount);
        const remainingPortion = wordObj.word.substring(wordObj.typedCount);
        
        // Update the display
        wordObj.text.setText(remainingPortion);
        wordObj.typedHighlight.setText(typedPortion);
        
        // Adjust positions (typed portion on left, remaining on right)
        const fullWidth = wordObj.word.length * 14; // Approximate character width
        const typedWidth = typedPortion.length * 14;
        
        wordObj.typedHighlight.setX(-fullWidth / 2 + typedWidth / 2);
        wordObj.text.setX(-fullWidth / 2 + typedWidth + remainingPortion.length * 7);
    }
    
    updateTypedDisplay() {
        this.typingDisplayText.setText(this.typedText);
        
        // Update cursor position
        const textWidth = this.typingDisplayText.width;
        this.cursor.setX(this.scale.width / 2 + textWidth / 2 + 5);
    }
    
    showTypingError() {
        // Flash the typing display red
        this.typingDisplayText.setColor('#FF0000');
        this.time.delayedCall(150, () => {
            this.typingDisplayText.setColor('#00FF00');
        });
    }
    
    onWordComplete(wordObj) {
        wordObj.isActive = false;
        
        // Remove from falling words
        const index = this.fallingWords.indexOf(wordObj);
        if (index > -1) {
            this.fallingWords.splice(index, 1);
        }
        
        // Stop the falling tween
        this.tweens.killTweensOf(wordObj.container);
        
        // Success animation
        this.tweens.add({
            targets: wordObj.container,
            scale: 1.5,
            alpha: 0,
            y: wordObj.container.y - 50,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
                wordObj.container.destroy();
            }
        });
        
        // Update score
        this.score += wordObj.word.length * 10;
        this.wordsCompleted++;
        
        // Reset typing state
        this.typedText = '';
        this.currentWord = null;
        this.updateTypedDisplay();
        this.updateUI();
        
        // Check for level complete
        if (this.wordsCompleted >= this.wordsPerLevel) {
            this.onLevelComplete();
        }
    }
    
    onWordHitGround(wordObj) {
        if (!wordObj.isActive) return;
        
        wordObj.isActive = false;
        
        // Remove from falling words
        const index = this.fallingWords.indexOf(wordObj);
        if (index > -1) {
            this.fallingWords.splice(index, 1);
        }
        
        // If this was the current word being typed, clear it
        if (this.currentWord === wordObj) {
            this.currentWord = null;
            this.typedText = '';
            this.updateTypedDisplay();
        }
        
        // Crash animation
        wordObj.text.setColor('#FF0000');
        this.tweens.add({
            targets: wordObj.container,
            scale: 0.5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                wordObj.container.destroy();
            }
        });
        
        // Screen shake
        this.cameras.main.shake(100, 0.01);
    }
    
    updateUI() {
        this.scoreText.setText(`Score: ${this.score}`);
        this.levelText.setText(`Level: ${this.currentLevel + 1}/${this.wordLists.length}`);
        this.progressText.setText(`${this.wordsCompleted}/${this.wordsPerLevel}`);
    }
    
    onLevelComplete() {
        this.gameActive = false;
        if (this.dropTimer) {
            this.dropTimer.remove();
        }
        
        // Clear remaining words
        this.fallingWords.forEach(w => {
            this.tweens.killTweensOf(w.container);
            w.container.destroy();
        });
        this.fallingWords = [];
        
        this.currentLevel++;
        
        if (this.currentLevel >= this.wordLists.length) {
            this.showGameComplete();
        } else {
            this.showLevelComplete();
        }
    }
    
    showLevelComplete() {
        const { width, height } = this.scale;
        
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.6);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(50);
        
        const text = this.add.text(width / 2, height / 2 - 30, 'Level Complete! 🎉', {
            fontSize: '40px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(51);
        
        const scoreDisplay = this.add.text(width / 2, height / 2 + 20, `Score: ${this.score}`, {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(51);
        
        const subText = this.add.text(width / 2, height / 2 + 60, `Starting Level ${this.currentLevel + 1}...`, {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(51);
        
        this.time.delayedCall(2500, () => {
            overlay.destroy();
            text.destroy();
            scoreDisplay.destroy();
            subText.destroy();
            this.startLevel();
        });
    }
    
    showGameComplete() {
        const { width, height } = this.scale;
        
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(50);
        
        const text = this.add.text(width / 2, height / 2 - 60, '🏆 Typing Master! 🏆', {
            fontSize: '44px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(51);
        
        const finalScore = this.add.text(width / 2, height / 2, `Final Score: ${this.score}`, {
            fontSize: '32px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(51);
        
        const subText = this.add.text(width / 2, height / 2 + 50, 'You completed all levels!', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(51);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 120, 'Back to Menu', {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setDepth(51);
        
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => this.scene.start('GameMenu'));
    }
    
    shutdown() {
        if (this.dropTimer) {
            this.dropTimer.remove();
        }
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
        super.shutdown();
    }
}
