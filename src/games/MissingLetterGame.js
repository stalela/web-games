/**
 * MissingLetterGame - Find the missing letter to complete a word
 * 
 * Converted from GCompris missing-letter activity.
 * Original authors: Amit Tomar, Pascal Georges
 * 
 * Game description:
 * - A picture is shown with an incomplete word below
 * - Player clicks on the correct missing letter from choices
 * - Supports keyboard input
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class MissingLetterGame extends LalelaGame {
    constructor() {
        super({ key: 'MissingLetterGame' });
    }
    
    init(data) {
        super.init(data);
        
        // Word data with simple words and emoji representations
        this.wordLists = [
            // Level 1: Simple 3-4 letter words
            [
                { word: 'cat', emoji: '🐱' },
                { word: 'dog', emoji: '🐕' },
                { word: 'sun', emoji: '☀️' },
                { word: 'hat', emoji: '🎩' },
                { word: 'cup', emoji: '🥤' },
                { word: 'bed', emoji: '🛏️' },
                { word: 'bus', emoji: '🚌' },
                { word: 'car', emoji: '🚗' }
            ],
            // Level 2: 4-5 letter words
            [
                { word: 'apple', emoji: '🍎' },
                { word: 'house', emoji: '🏠' },
                { word: 'mouse', emoji: '🐭' },
                { word: 'bread', emoji: '🍞' },
                { word: 'chair', emoji: '🪑' },
                { word: 'train', emoji: '🚂' },
                { word: 'plane', emoji: '✈️' },
                { word: 'pizza', emoji: '🍕' }
            ],
            // Level 3: 5-6 letter words
            [
                { word: 'flower', emoji: '🌸' },
                { word: 'banana', emoji: '🍌' },
                { word: 'orange', emoji: '🍊' },
                { word: 'rabbit', emoji: '🐰' },
                { word: 'turtle', emoji: '🐢' },
                { word: 'rocket', emoji: '🚀' },
                { word: 'guitar', emoji: '🎸' },
                { word: 'camera', emoji: '📷' }
            ],
            // Level 4: More challenging words
            [
                { word: 'elephant', emoji: '🐘' },
                { word: 'butterfly', emoji: '🦋' },
                { word: 'umbrella', emoji: '☂️' },
                { word: 'computer', emoji: '💻' },
                { word: 'dinosaur', emoji: '🦕' },
                { word: 'kangaroo', emoji: '🦘' },
                { word: 'penguin', emoji: '🐧' },
                { word: 'rainbow', emoji: '🌈' }
            ]
        ];
        
        this.currentLevel = 0;
        this.currentSubLevel = 0;
        this.questions = [];
        this.currentQuestion = null;
        this.letterButtons = [];
        this.buttonsBlocked = false;
    }
    
    preload() {
        super.preload();
    }
    
    createBackground() {
        const { width, height } = this.scale;
        
        // Gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xE8F5E9, 0xE8F5E9, 0xC8E6C9, 0xC8E6C9, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
    }
    
    createUI() {
        const { width, height } = this.scale;
        
        // Title
        this.titleText = this.add.text(width / 2, 25, 'Missing Letter', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#2c3e50',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        
        // Instructions
        this.instructionText = this.add.text(width / 2, 55, 
            'Find the missing letter to complete the word', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#555555'
        }).setOrigin(0.5).setDepth(10);
        
        // Score display
        this.scoreText = this.add.text(20, 80, 'Level: 1 | Progress: 0/0', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#2c3e50'
        }).setDepth(10);
        
        // Repeat button (speaker icon for word audio)
        this.createRepeatButton();
        
        // Navigation dock
        this.createNavigationDock();
    }
    
    createRepeatButton() {
        const { width } = this.scale;
        
        const button = this.add.container(width - 50, 80).setDepth(10);
        
        const bg = this.add.graphics();
        bg.fillStyle(0x2196F3, 1);
        bg.fillCircle(0, 0, 22);
        bg.lineStyle(2, 0x1976D2, 1);
        bg.strokeCircle(0, 0, 22);
        button.add(bg);
        
        const icon = this.add.text(0, 0, '🔊', {
            fontSize: '20px'
        }).setOrigin(0.5);
        button.add(icon);
        
        button.setSize(44, 44);
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => this.speakWord());
        
        this.repeatButton = button;
    }
    
    speakWord() {
        // Visual feedback since we don't have actual audio
        if (this.currentQuestion) {
            // Flash the word display
            this.tweens.add({
                targets: this.wordText,
                scale: { from: 1, to: 1.1 },
                duration: 150,
                yoyo: true
            });
        }
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
            this.scene.start('GameMenu');
        } else if (action === 'help') {
            this.showHelpModal();
        }
    }
    
    showHelpModal() {
        const { width, height } = this.scale;
        
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(50);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        
        const modalWidth = Math.min(500, width - 40);
        const modalHeight = 260;
        const modalX = (width - modalWidth) / 2;
        const modalY = (height - modalHeight) / 2;
        
        const modal = this.add.graphics();
        modal.fillStyle(0xffffff, 1);
        modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);
        modal.setDepth(51);
        
        const helpTitle = this.add.text(width / 2, modalY + 30, 'How to Play', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#2c3e50'
        }).setOrigin(0.5).setDepth(52);
        
        const helpText = this.add.text(width / 2, modalY + 100, 
            'Look at the picture and the incomplete word.\n\n' +
            'Click on the correct letter to complete the word.\n\n' +
            'You can also type the letter on your keyboard.', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
            align: 'center',
            wordWrap: { width: modalWidth - 40 }
        }).setOrigin(0.5).setDepth(52);
        
        const closeBtn = this.add.text(width / 2, modalY + modalHeight - 40, 'Got it!', {
            fontSize: '22px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(52);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            modal.destroy();
            helpTitle.destroy();
            helpText.destroy();
            closeBtn.destroy();
        });
    }
    
    setupGameLogic() {
        // Keyboard input for letter selection
        this.input.keyboard.on('keydown', (event) => {
            if (this.buttonsBlocked) return;
            
            const key = event.key.toLowerCase();
            if (key.match(/^[a-z]$/)) {
                this.checkLetterAnswer(key);
            }
        });
        
        // Tab to repeat word
        this.input.keyboard.on('keydown-TAB', (event) => {
            event.preventDefault();
            this.speakWord();
        });
        
        this.initLevel();
    }
    
    initLevel() {
        const words = this.wordLists[Math.min(this.currentLevel, this.wordLists.length - 1)];
        
        // Shuffle and prepare questions
        this.questions = Phaser.Utils.Array.Shuffle([...words]).slice(0, 6);
        this.currentSubLevel = 0;
        
        this.initSubLevel();
    }
    
    initSubLevel() {
        // Clear previous elements
        if (this.questionContainer) {
            this.questionContainer.destroy();
        }
        this.letterButtons.forEach(btn => btn.container.destroy());
        this.letterButtons = [];
        
        if (this.currentSubLevel >= this.questions.length) {
            this.onLevelComplete();
            return;
        }
        
        const question = this.questions[this.currentSubLevel];
        this.currentQuestion = this.generateMaskedQuestion(question);
        
        // Update score display
        this.updateScoreDisplay();
        
        // Create question display
        this.createQuestionDisplay();
        
        // Create letter choices
        this.createLetterChoices();
        
        this.buttonsBlocked = false;
    }
    
    generateMaskedQuestion(question) {
        const word = question.word.toLowerCase();
        
        // Pick a random letter to mask (not spaces or special chars)
        const letters = word.split('').filter(c => c.match(/[a-z]/));
        const letterToMask = letters[Math.floor(Math.random() * letters.length)];
        
        // Find positions of this letter
        const positions = [];
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letterToMask) {
                positions.push(i);
            }
        }
        
        // Pick one position to mask
        const maskPosition = positions[Math.floor(Math.random() * positions.length)];
        
        // Create masked word
        const maskedWord = word.split('');
        maskedWord[maskPosition] = '_';
        
        // Generate wrong choices
        const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const wrongChoices = allLetters
            .filter(l => l !== letterToMask)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
        
        // Combine correct answer with wrong choices
        const choices = Phaser.Utils.Array.Shuffle([letterToMask, ...wrongChoices.slice(0, 4)]);
        
        return {
            emoji: question.emoji,
            fullWord: word,
            maskedWord: maskedWord.join(''),
            correctLetter: letterToMask,
            choices: choices
        };
    }
    
    updateScoreDisplay() {
        this.scoreText.setText(
            `Level: ${this.currentLevel + 1}/${this.wordLists.length} | Progress: ${this.currentSubLevel}/${this.questions.length}`
        );
    }
    
    createQuestionDisplay() {
        const { width, height } = this.scale;
        
        this.questionContainer = this.add.container(width / 2, height * 0.35);
        this.questionContainer.setDepth(5);
        
        // Picture frame
        const frameSize = 150;
        const frame = this.add.graphics();
        frame.fillStyle(0xffffff, 1);
        frame.lineStyle(5, 0x8B4513, 1);
        frame.fillRoundedRect(-frameSize / 2, -frameSize / 2 - 30, frameSize, frameSize, 10);
        frame.strokeRoundedRect(-frameSize / 2, -frameSize / 2 - 30, frameSize, frameSize, 10);
        this.questionContainer.add(frame);
        
        // Emoji as picture
        const emoji = this.add.text(0, -30, this.currentQuestion.emoji, {
            fontSize: '80px'
        }).setOrigin(0.5);
        this.questionContainer.add(emoji);
        
        // Word display with underscore for missing letter
        this.wordText = this.add.text(0, frameSize / 2 + 30, this.currentQuestion.maskedWord.toUpperCase(), {
            fontSize: '48px',
            fontFamily: 'Courier New, monospace',
            color: '#2c3e50',
            letterSpacing: 8
        }).setOrigin(0.5);
        this.questionContainer.add(this.wordText);
    }
    
    createLetterChoices() {
        const { width, height } = this.scale;
        
        const buttonSize = 60;
        const padding = 15;
        const choices = this.currentQuestion.choices;
        const totalWidth = choices.length * (buttonSize + padding) - padding;
        const startX = (width - totalWidth) / 2 + buttonSize / 2;
        const y = height * 0.7;
        
        choices.forEach((letter, index) => {
            const x = startX + index * (buttonSize + padding);
            this.createLetterButton(x, y, buttonSize, letter);
        });
    }
    
    createLetterButton(x, y, size, letter) {
        const container = this.add.container(x, y);
        container.setDepth(5);
        
        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0x3498db, 1);
        bg.lineStyle(3, 0x2980b9, 1);
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
        bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
        container.add(bg);
        
        // Letter
        const text = this.add.text(0, 0, letter.toUpperCase(), {
            fontSize: '32px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(text);
        
        // Make interactive
        container.setSize(size, size);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerdown', () => this.checkLetterAnswer(letter));
        container.on('pointerover', () => container.setScale(1.1));
        container.on('pointerout', () => container.setScale(1));
        
        this.letterButtons.push({
            container,
            letter,
            bg,
            text,
            size
        });
    }
    
    checkLetterAnswer(letter) {
        if (this.buttonsBlocked) return;
        
        // Find the button for this letter
        const button = this.letterButtons.find(btn => btn.letter === letter);
        
        if (letter === this.currentQuestion.correctLetter) {
            this.showCorrectFeedback(button);
        } else if (button) {
            this.showWrongFeedback(button);
        }
    }
    
    showCorrectFeedback(button) {
        this.buttonsBlocked = true;
        
        // Update word display
        this.wordText.setText(this.currentQuestion.fullWord.toUpperCase());
        this.wordText.setColor('#4CAF50');
        
        // Green flash on button
        if (button) {
            button.bg.clear();
            button.bg.fillStyle(0x4CAF50, 1);
            button.bg.lineStyle(3, 0x388E3C, 1);
            button.bg.fillRoundedRect(-button.size / 2, -button.size / 2, button.size, button.size, 10);
            button.bg.strokeRoundedRect(-button.size / 2, -button.size / 2, button.size, button.size, 10);
            
            // Scale animation
            this.tweens.add({
                targets: button.container,
                scale: { from: 1, to: 1.3 },
                duration: 200,
                yoyo: true
            });
        }
        
        // Particle burst
        this.createParticleBurst(this.wordText.x + this.scale.width / 2 - this.wordText.width / 2, 
            this.questionContainer.y + 100, 0x4CAF50);
        
        this.time.delayedCall(1000, () => {
            this.currentSubLevel++;
            this.initSubLevel();
        });
    }
    
    showWrongFeedback(button) {
        this.buttonsBlocked = true;
        
        // Red flash on button
        button.bg.clear();
        button.bg.fillStyle(0xF44336, 1);
        button.bg.lineStyle(3, 0xD32F2F, 1);
        button.bg.fillRoundedRect(-button.size / 2, -button.size / 2, button.size, button.size, 10);
        button.bg.strokeRoundedRect(-button.size / 2, -button.size / 2, button.size, button.size, 10);
        
        // Shake animation
        const originalX = button.container.x;
        this.tweens.add({
            targets: button.container,
            x: originalX + 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                button.container.x = originalX;
                
                // Reset button color
                button.bg.clear();
                button.bg.fillStyle(0x3498db, 1);
                button.bg.lineStyle(3, 0x2980b9, 1);
                button.bg.fillRoundedRect(-button.size / 2, -button.size / 2, button.size, button.size, 10);
                button.bg.strokeRoundedRect(-button.size / 2, -button.size / 2, button.size, button.size, 10);
                
                this.buttonsBlocked = false;
            }
        });
    }
    
    createParticleBurst(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const particle = this.add.circle(x, y, Phaser.Math.Between(4, 8), color, 1);
            particle.setDepth(30);
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = Phaser.Math.Between(40, 80);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.5,
                duration: 500,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    onLevelComplete() {
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
        
        const subText = this.add.text(width / 2, height / 2 + 30, `Starting Level ${this.currentLevel + 1}...`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(51);
        
        this.time.delayedCall(2000, () => {
            overlay.destroy();
            text.destroy();
            subText.destroy();
            this.initLevel();
        });
    }
    
    showGameComplete() {
        const { width, height } = this.scale;
        
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(50);
        
        const text = this.add.text(width / 2, height / 2 - 50, '🏆 Wonderful! 🏆', {
            fontSize: '44px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(51);
        
        const subText = this.add.text(width / 2, height / 2 + 20, 'You completed all levels!', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(51);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 100, 'Back to Menu', {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setDepth(51);
        
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => this.scene.start('GameMenu'));
    }
}
