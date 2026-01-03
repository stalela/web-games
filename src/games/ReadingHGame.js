/**
 * ReadingHGame - Horizontal reading practice
 * 
 * Converted from GCompris readingh activity.
 * Original authors: Bruno Coudoin, Johnny Jazeix, Timothée Giet
 * 
 * Game description:
 * - A target word is shown on a board
 * - Words scroll horizontally across the screen
 * - Player must decide if the target word appeared in the list
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class ReadingHGame extends LalelaGame {
    constructor(config = { key: 'ReadingHGame' }) {
        super(config);
        
        // Can be overridden for vertical mode
        this.mode = 'horizontal';
    }
    
    init(data) {
        super.init(data);
        
        // Word lists by difficulty
        this.wordLists = [
            // Level 1: Very simple words
            ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out'],
            // Level 2: Simple words
            ['cat', 'dog', 'run', 'sun', 'hat', 'bat', 'cup', 'red', 'big', 'sit', 'hot', 'top', 'hop', 'map', 'pan'],
            // Level 3: Common words
            ['apple', 'table', 'chair', 'house', 'mouse', 'plant', 'bread', 'green', 'brown', 'black', 'white', 'light'],
            // Level 4: Longer words
            ['flower', 'garden', 'window', 'basket', 'pencil', 'yellow', 'purple', 'orange', 'silver', 'golden', 'rabbit'],
            // Level 5: Challenging words
            ['elephant', 'butterfly', 'computer', 'umbrella', 'kangaroo', 'dinosaur', 'beautiful', 'wonderful']
        ];
        
        this.currentLevel = 0;
        this.currentSubLevel = 0;
        this.totalSubLevels = 10;
        this.targetWord = '';
        this.wordList = [];
        this.targetInList = false;
        this.displayedWords = [];
        this.wordDisplayTimer = null;
        this.currentWordIndex = 0;
        this.buttonsBlocked = true;
        this.gameStarted = false;
    }
    
    preload() {
        super.preload();
    }
    
    createBackground() {
        const { width, height } = this.scale;
        
        // Gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xFFF8E1, 0xFFF8E1, 0xFFECB3, 0xFFECB3, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
    }
    
    createUI() {
        const { width, height } = this.scale;
        
        // Title
        const title = this.mode === 'horizontal' 
            ? 'Horizontal Reading Practice' 
            : 'Vertical Reading Practice';
        
        this.titleText = this.add.text(width / 2, 25, title, {
            fontSize: '26px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#5D4037',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        
        // Instructions
        this.instructionText = this.add.text(width / 2, 55, 
            'Did the word on the board appear in the list?', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#795548'
        }).setOrigin(0.5).setDepth(10);
        
        // Score display
        this.scoreText = this.add.text(20, 80, 'Level: 1 | Progress: 0/10', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#5D4037'
        }).setDepth(10);
        
        // Target word board (chalkboard style)
        this.createTargetBoard();
        
        // Word display area
        this.createWordDisplayArea();
        
        // Answer buttons (Yes/No)
        this.createAnswerButtons();
        
        // "I am ready" button
        this.createReadyButton();
        
        // Navigation dock
        this.createNavigationDock();
    }
    
    createTargetBoard() {
        const { width } = this.scale;
        
        const boardX = width / 2;
        const boardY = 140;
        const boardWidth = 250;
        const boardHeight = 80;
        
        // Chalkboard frame
        const frame = this.add.graphics();
        frame.fillStyle(0x5D4037, 1);
        frame.fillRoundedRect(boardX - boardWidth / 2 - 8, boardY - boardHeight / 2 - 8, 
            boardWidth + 16, boardHeight + 16, 8);
        frame.setDepth(4);
        
        // Chalkboard
        const board = this.add.graphics();
        board.fillStyle(0x2E7D32, 1);
        board.fillRoundedRect(boardX - boardWidth / 2, boardY - boardHeight / 2, 
            boardWidth, boardHeight, 5);
        board.setDepth(5);
        
        // Target word text
        this.targetWordText = this.add.text(boardX, boardY, '', {
            fontSize: '36px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(6);
    }
    
    createWordDisplayArea() {
        const { width, height } = this.scale;
        
        // Background for word display area
        const areaY = height * 0.45;
        const areaHeight = 100;
        
        const areaBg = this.add.graphics();
        areaBg.fillStyle(0xFFFFFF, 0.8);
        areaBg.fillRoundedRect(20, areaY - areaHeight / 2, width - 40, areaHeight, 10);
        areaBg.lineStyle(3, 0xBDBDBD, 1);
        areaBg.strokeRoundedRect(20, areaY - areaHeight / 2, width - 40, areaHeight, 10);
        areaBg.setDepth(3);
        
        this.wordDisplayY = areaY;
        this.wordDisplayHeight = areaHeight;
        
        // Container for words
        this.wordsContainer = this.add.container(0, 0);
        this.wordsContainer.setDepth(5);
    }
    
    createAnswerButtons() {
        const { width, height } = this.scale;
        const buttonY = height * 0.7;
        
        // YES button
        this.yesButton = this.createAnswerButton(width / 2 - 100, buttonY, 'YES ✓', 0x4CAF50, true);
        
        // NO button  
        this.noButton = this.createAnswerButton(width / 2 + 100, buttonY, 'NO ✗', 0xF44336, false);
        
        // Initially hidden
        this.yesButton.setVisible(false);
        this.noButton.setVisible(false);
    }
    
    createAnswerButton(x, y, text, color, isYes) {
        const container = this.add.container(x, y);
        container.setDepth(10);
        
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-70, -30, 140, 60, 12);
        bg.lineStyle(3, isYes ? 0x388E3C : 0xD32F2F, 1);
        bg.strokeRoundedRect(-70, -30, 140, 60, 12);
        container.add(bg);
        
        const btnText = this.add.text(0, 0, text, {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(btnText);
        
        container.setSize(140, 60);
        container.setInteractive({ useHandCursor: true });
        container.on('pointerdown', () => this.checkAnswer(isYes));
        container.on('pointerover', () => container.setScale(1.05));
        container.on('pointerout', () => container.setScale(1));
        
        return container;
    }
    
    createReadyButton() {
        const { width, height } = this.scale;
        
        this.readyButton = this.add.container(width / 2, height * 0.65);
        this.readyButton.setDepth(10);
        
        const bg = this.add.graphics();
        bg.fillStyle(0x2196F3, 1);
        bg.fillRoundedRect(-100, -30, 200, 60, 12);
        bg.lineStyle(3, 0x1976D2, 1);
        bg.strokeRoundedRect(-100, -30, 200, 60, 12);
        this.readyButton.add(bg);
        
        const text = this.add.text(0, 0, "I'm Ready!", {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.readyButton.add(text);
        
        this.readyButton.setSize(200, 60);
        this.readyButton.setInteractive({ useHandCursor: true });
        this.readyButton.on('pointerdown', () => this.startWordDisplay());
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
        const modalHeight = 280;
        const modalX = (width - modalWidth) / 2;
        const modalY = (height - modalHeight) / 2;
        
        const modal = this.add.graphics();
        modal.fillStyle(0xffffff, 1);
        modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);
        modal.setDepth(51);
        
        const helpTitle = this.add.text(width / 2, modalY + 30, 'How to Play', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#5D4037'
        }).setOrigin(0.5).setDepth(52);
        
        const direction = this.mode === 'horizontal' ? 'horizontally' : 'vertically';
        const helpText = this.add.text(width / 2, modalY + 110, 
            `A target word is shown on the green board.\n\n` +
            `Words will appear ${direction} one by one.\n\n` +
            `After viewing, click YES if the target word\nappeared, or NO if it didn't.`, {
            fontSize: '17px',
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
        this.initLevel();
    }
    
    initLevel() {
        this.currentSubLevel = 0;
        this.initSubLevel();
    }
    
    initSubLevel() {
        // Clear previous words
        this.wordsContainer.removeAll(true);
        this.displayedWords = [];
        this.currentWordIndex = 0;
        this.gameStarted = false;
        
        if (this.currentSubLevel >= this.totalSubLevels) {
            this.onLevelComplete();
            return;
        }
        
        // Get words for this level
        const levelWords = this.wordLists[Math.min(this.currentLevel, this.wordLists.length - 1)];
        
        // Pick target word
        this.targetWord = levelWords[Math.floor(Math.random() * levelWords.length)];
        this.targetWordText.setText(this.targetWord.toUpperCase());
        
        // Create word list (6-10 words)
        const wordCount = 6 + Math.min(this.currentLevel, 4);
        const shuffled = Phaser.Utils.Array.Shuffle([...levelWords]);
        this.wordList = shuffled.filter(w => w !== this.targetWord).slice(0, wordCount);
        
        // 50% chance target is in list
        this.targetInList = Math.random() > 0.5;
        if (this.targetInList) {
            // Replace a random word with target
            const insertPos = Math.floor(Math.random() * this.wordList.length);
            this.wordList[insertPos] = this.targetWord;
        }
        
        // Update score
        this.updateScoreDisplay();
        
        // Show ready button, hide answer buttons
        this.readyButton.setVisible(true);
        this.yesButton.setVisible(false);
        this.noButton.setVisible(false);
        this.buttonsBlocked = true;
    }
    
    updateScoreDisplay() {
        this.scoreText.setText(
            `Level: ${this.currentLevel + 1}/${this.wordLists.length} | Progress: ${this.currentSubLevel}/${this.totalSubLevels}`
        );
    }
    
    startWordDisplay() {
        this.readyButton.setVisible(false);
        this.gameStarted = true;
        this.currentWordIndex = 0;
        
        // Start displaying words
        const displayInterval = 1000 - (this.currentLevel * 100); // Faster at higher levels
        
        this.wordDisplayTimer = this.time.addEvent({
            delay: Math.max(displayInterval, 500),
            callback: this.displayNextWord,
            callbackScope: this,
            loop: true
        });
        
        // Display first word immediately
        this.displayNextWord();
    }
    
    displayNextWord() {
        const { width } = this.scale;
        
        if (this.currentWordIndex >= this.wordList.length) {
            // All words displayed
            this.wordDisplayTimer.remove();
            this.showAnswerButtons();
            return;
        }
        
        const word = this.wordList[this.currentWordIndex];
        
        // Clear previous word if in horizontal mode
        if (this.mode === 'horizontal') {
            this.wordsContainer.removeAll(true);
        }
        
        // Create word text
        const wordText = this.add.text(0, 0, word.toUpperCase(), {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333'
        }).setOrigin(0.5);
        
        if (this.mode === 'horizontal') {
            // Horizontal: word appears and fades
            wordText.setPosition(width / 2, this.wordDisplayY);
            this.wordsContainer.add(wordText);
            
            // Fade out animation
            this.tweens.add({
                targets: wordText,
                alpha: { from: 1, to: 0.3 },
                duration: 800
            });
        } else {
            // Vertical: words stack
            const yPos = this.wordDisplayY - 30 + (this.currentWordIndex * 35);
            wordText.setPosition(width / 2, yPos);
            this.wordsContainer.add(wordText);
            
            // Scale in animation
            wordText.setScale(0);
            this.tweens.add({
                targets: wordText,
                scale: 1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        }
        
        this.displayedWords.push(wordText);
        this.currentWordIndex++;
    }
    
    showAnswerButtons() {
        // Clear word display
        if (this.mode === 'horizontal') {
            this.wordsContainer.removeAll(true);
        }
        
        // Show answer buttons
        this.yesButton.setVisible(true);
        this.noButton.setVisible(true);
        this.buttonsBlocked = false;
    }
    
    checkAnswer(isYes) {
        if (this.buttonsBlocked) return;
        this.buttonsBlocked = true;
        
        const isCorrect = (isYes === this.targetInList);
        
        if (isCorrect) {
            this.showCorrectFeedback();
        } else {
            this.showWrongFeedback();
        }
    }
    
    showCorrectFeedback() {
        const { width, height } = this.scale;
        
        // Green flash
        const flash = this.add.graphics();
        flash.fillStyle(0x4CAF50, 0.3);
        flash.fillRect(0, 0, width, height);
        flash.setDepth(40);
        
        this.time.delayedCall(800, () => {
            flash.destroy();
            this.currentSubLevel++;
            this.initSubLevel();
        });
    }
    
    showWrongFeedback() {
        const { width, height } = this.scale;
        
        // Red flash
        const flash = this.add.graphics();
        flash.fillStyle(0xF44336, 0.3);
        flash.fillRect(0, 0, width, height);
        flash.setDepth(40);
        
        // Show correct answer
        const correctText = this.targetInList ? 'The word WAS in the list!' : 'The word was NOT in the list.';
        const feedback = this.add.text(width / 2, height * 0.55, correctText, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#D32F2F',
            backgroundColor: '#FFFFFF',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(41);
        
        this.time.delayedCall(1500, () => {
            flash.destroy();
            feedback.destroy();
            // Retry same question
            this.initSubLevel();
        });
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
        
        const text = this.add.text(width / 2, height / 2 - 50, '🏆 Great Reading! 🏆', {
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
    
    shutdown() {
        if (this.wordDisplayTimer) {
            this.wordDisplayTimer.remove();
        }
        super.shutdown();
    }
}
