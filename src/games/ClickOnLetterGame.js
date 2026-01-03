/**
 * ClickOnLetterGame - Click on a letter (lowercase)
 * 
 * Converted from GCompris click_on_letter activity.
 * Original authors: Pascal Georges, Bruno Coudoin, Holger Kaelberer
 * 
 * Game description:
 * - Letters are displayed on train carriages
 * - A letter is shown/spoken, player clicks the matching carriage
 * - Supports lowercase and uppercase modes
 * - 11 levels with progressively more letters
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class ClickOnLetterGame extends LalelaGame {
    constructor(config = { key: 'ClickOnLetterGame' }) {
        super(config);
        
        // Mode: 'lowercase' or 'uppercase'
        this.mode = 'lowercase';
    }
    
    init(data) {
        super.init(data);
        
        // Level data based on GCompris levels-en.json
        this.levelData = [
            { questions: 'a|e|i|o|u|y', answers: 'a|e|i|o|u|y' },
            { questions: 'a|e|i|o|u|y', answers: 'a|e|i|o|u|y|c|s' },
            { questions: 'a|e|i|o|u|y', answers: 'a|e|i|o|u|y|c|k|s|v|x|z' },
            { questions: 'c|k|p|s|v|x|w|z', answers: 'c|k|p|s|v|x|w|z' },
            { questions: 'b|f|g|l|m|n|q|t', answers: 'b|f|g|l|m|n|q|t' },
            { questions: 'b|d|g|q|p|n|m|u', answers: 'b|d|g|q|p|n|m|u' },
            { questions: 'i|l|t|h|w|v|a|e', answers: 'i|l|t|h|w|v|a|e' },
            { questions: 'a|b|c|d|e|f|g|h', answers: 'a|b|c|d|e|f|g|h' },
            { questions: 'i|j|k|l|m|n|o|p', answers: 'i|j|k|l|m|n|o|p' },
            { questions: 'q|r|s|t|u|v|w|x|y|z', answers: 'q|r|s|t|u|v|w|x|y|z' },
            { questions: 'b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|w|x|z', answers: 'b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|w|x|z' }
        ];
        
        this.currentLevel = 0;
        this.currentSubLevel = 0;
        this.questions = [];
        this.answers = [];
        this.currentLetter = '';
        this.carriages = [];
        this.selectedIndex = -1;
        this.buttonsBlocked = false;
    }
    
    preload() {
        super.preload();
        // No external assets needed - all graphics are programmatic
    }
    
    createBackground() {
        const { width, height } = this.scale;
        
        // Sky gradient background
        const skyGraphics = this.add.graphics();
        skyGraphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
        skyGraphics.fillRect(0, 0, width, height);
        skyGraphics.setDepth(-1);
        
        // Ground
        const groundHeight = height * 0.2;
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x8B7355, 1);
        groundGraphics.fillRect(0, height - groundHeight, width, groundHeight);
        groundGraphics.setDepth(0);
        
        // Grass strip
        groundGraphics.fillStyle(0x4CAF50, 1);
        groundGraphics.fillRect(0, height - groundHeight, width, 15);
        
        // Railway tracks
        this.drawRailway();
    }
    
    drawRailway() {
        const { width, height } = this.scale;
        const railY = height - height * 0.2 - 30;
        
        const railway = this.add.graphics();
        railway.setDepth(1);
        
        // Rails
        railway.lineStyle(8, 0x555555, 1);
        railway.lineBetween(0, railY, width, railY);
        railway.lineBetween(0, railY + 25, width, railY + 25);
        
        // Sleepers
        railway.fillStyle(0x8B4513, 1);
        for (let x = 0; x < width; x += 40) {
            railway.fillRect(x, railY - 5, 20, 35);
        }
    }
    
    createUI() {
        const { width, height } = this.scale;
        
        // Title with mode indication
        const title = this.mode === 'lowercase' 
            ? 'Click on a Lowercase Letter' 
            : 'Click on an Uppercase Letter';
        
        this.titleText = this.add.text(width / 2, 30, title, {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#2c3e50',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        
        // Question display box
        this.questionBox = this.add.graphics();
        this.questionBox.fillStyle(0x2881C3, 1);
        this.questionBox.lineStyle(3, 0xffffff, 1);
        this.questionBox.fillRoundedRect(width - 100, 70, 80, 80, 10);
        this.questionBox.strokeRoundedRect(width - 100, 70, 80, 80, 10);
        this.questionBox.setDepth(10);
        
        this.questionText = this.add.text(width - 60, 110, '', {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11);
        
        // Repeat button (speaker icon)
        this.repeatButton = this.createRepeatButton(width - 60, 180);
        
        // Score display
        this.scoreText = this.add.text(20, 70, 'Level: 1 | Score: 0/0', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#2c3e50'
        }).setDepth(10);
        
        // Create navigation dock
        this.createNavigationDock();
    }
    
    createRepeatButton(x, y) {
        const button = this.add.container(x, y).setDepth(10);
        
        const bg = this.add.graphics();
        bg.fillStyle(0x4CAF50, 1);
        bg.fillCircle(0, 0, 25);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeCircle(0, 0, 25);
        button.add(bg);
        
        // Speaker icon
        const speaker = this.add.graphics();
        speaker.fillStyle(0xffffff, 1);
        speaker.fillRect(-10, -6, 8, 12);
        speaker.fillTriangle(-2, -10, -2, 10, 10, 0);
        button.add(speaker);
        
        button.setSize(50, 50);
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => this.playLetterSound());
        
        return button;
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
            
            const icons = {
                exit: '✕',
                settings: '⚙',
                help: '?',
                home: '⌂'
            };
            
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
        switch(action) {
            case 'exit':
            case 'home':
                this.scene.start('GameMenu');
                break;
            case 'help':
                this.showHelpModal();
                break;
            case 'settings':
                // Settings modal placeholder
                break;
        }
    }
    
    showHelpModal() {
        const { width, height } = this.scale;
        
        // Semi-transparent overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(50);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        
        // Modal box
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
            color: '#2c3e50'
        }).setOrigin(0.5).setDepth(52);
        
        const helpText = this.add.text(width / 2, modalY + 100, 
            'Look at the letter shown in the blue box.\n\n' +
            'Click on the train carriage showing the same letter.\n\n' +
            'Use arrow keys or click to navigate.\n' +
            'Press the speaker button to hear the letter again.', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
            align: 'center',
            wordWrap: { width: modalWidth - 40 }
        }).setOrigin(0.5).setDepth(52);
        
        // Close button
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
        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
        
        // Start first level
        this.initLevel();
    }
    
    initLevel() {
        const levelConfig = this.levelData[this.currentLevel];
        
        // Apply mode transformation
        if (this.mode === 'uppercase') {
            this.questions = this.shuffleArray(levelConfig.questions.toUpperCase().split('|'));
            this.answers = this.shuffleArray(levelConfig.answers.toUpperCase().split('|'));
        } else {
            this.questions = this.shuffleArray(levelConfig.questions.toLowerCase().split('|'));
            this.answers = this.shuffleArray(levelConfig.answers.toLowerCase().split('|'));
        }
        
        this.currentSubLevel = 0;
        this.selectedIndex = -1;
        
        // Create train with carriages
        this.createTrain();
        
        // Start first sub-level
        this.initSubLevel();
    }
    
    initSubLevel() {
        this.currentLetter = this.questions[this.currentSubLevel];
        this.questionText.setText(this.currentLetter);
        this.buttonsBlocked = false;
        
        // Update score display
        this.updateScoreDisplay();
        
        // Play letter sound (simulated with visual cue)
        this.playLetterSound();
    }
    
    updateScoreDisplay() {
        const levelNum = this.currentLevel + 1;
        const subLevel = this.currentSubLevel;
        const totalSubs = this.questions.length;
        this.scoreText.setText(`Level: ${levelNum}/${this.levelData.length} | Progress: ${subLevel}/${totalSubs}`);
    }
    
    playLetterSound() {
        // Flash the question box to indicate the letter
        this.tweens.add({
            targets: this.questionText,
            scale: { from: 1, to: 1.3 },
            duration: 200,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });
        
        // In a real implementation, we'd play audio here
        // For now we just visually highlight the letter
        if (this.audioManager && this.audioManager.sounds.has('click')) {
            this.audioManager.play('click');
        }
    }
    
    createTrain() {
        // Clear existing carriages
        this.carriages.forEach(c => c.container.destroy());
        this.carriages = [];
        
        const { width, height } = this.scale;
        const railY = height - height * 0.2 - 30;
        
        // Calculate carriage size based on number of letters
        const numLetters = this.answers.length;
        const maxCarriagesPerRow = 8;
        const carriageSize = Math.min(80, (width - 150) / Math.min(numLetters, maxCarriagesPerRow));
        
        // Engine
        this.createEngine(50, railY - carriageSize / 2 - 10, carriageSize);
        
        // Calculate rows needed
        const rows = Math.ceil(numLetters / maxCarriagesPerRow);
        const carriageSpacing = carriageSize + 10;
        
        // Create carriages
        this.answers.forEach((letter, index) => {
            const row = Math.floor(index / maxCarriagesPerRow);
            const col = index % maxCarriagesPerRow;
            
            const x = 50 + carriageSize + 20 + col * carriageSpacing;
            const y = railY - carriageSize / 2 - 10 - row * (carriageSize + 20);
            
            this.createCarriage(x, y, carriageSize, letter, index);
        });
    }
    
    createEngine(x, y, size) {
        const engine = this.add.container(x, y).setDepth(5);
        
        // Engine body
        const body = this.add.graphics();
        body.fillStyle(0x333333, 1);
        body.fillRoundedRect(-size * 0.4, -size * 0.4, size * 0.8, size * 0.6, 5);
        engine.add(body);
        
        // Chimney
        const chimney = this.add.graphics();
        chimney.fillStyle(0x222222, 1);
        chimney.fillRect(-size * 0.15, -size * 0.6, size * 0.2, size * 0.25);
        engine.add(chimney);
        
        // Cabin
        const cabin = this.add.graphics();
        cabin.fillStyle(0xD32F2F, 1);
        cabin.fillRoundedRect(size * 0.1, -size * 0.5, size * 0.3, size * 0.35, 3);
        engine.add(cabin);
        
        // Wheels
        const wheelRadius = size * 0.15;
        [-size * 0.25, size * 0.15].forEach(wx => {
            const wheel = this.add.graphics();
            wheel.fillStyle(0x222222, 1);
            wheel.fillCircle(wx, size * 0.25, wheelRadius);
            wheel.lineStyle(2, 0x888888, 1);
            wheel.strokeCircle(wx, size * 0.25, wheelRadius);
            engine.add(wheel);
        });
        
        // Smoke puffs
        this.time.addEvent({
            delay: 500,
            callback: () => this.createSmoke(x, y - size * 0.5),
            loop: true
        });
    }
    
    createSmoke(x, y) {
        const smoke = this.add.circle(x, y, 10, 0xcccccc, 0.7).setDepth(4);
        
        this.tweens.add({
            targets: smoke,
            x: x + Phaser.Math.Between(-30, 30),
            y: y - 60,
            scale: 2,
            alpha: 0,
            duration: 1500,
            onComplete: () => smoke.destroy()
        });
    }
    
    createCarriage(x, y, size, letter, index) {
        const container = this.add.container(x, y).setDepth(5);
        
        // Carriage body
        const body = this.add.graphics();
        body.fillStyle(0xFFEB3B, 1);
        body.lineStyle(3, 0xF57C00, 1);
        body.fillRoundedRect(-size * 0.45, -size * 0.4, size * 0.9, size * 0.6, 8);
        body.strokeRoundedRect(-size * 0.45, -size * 0.4, size * 0.9, size * 0.6, 8);
        container.add(body);
        
        // Roof
        const roof = this.add.graphics();
        roof.fillStyle(0xF57C00, 1);
        roof.fillRoundedRect(-size * 0.4, -size * 0.45, size * 0.8, size * 0.1, 3);
        container.add(roof);
        
        // Window with letter
        const window = this.add.graphics();
        window.fillStyle(0xffffff, 1);
        window.lineStyle(2, 0x333333, 1);
        window.fillRoundedRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.45, 5);
        window.strokeRoundedRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.45, 5);
        container.add(window);
        
        // Letter
        const letterText = this.add.text(0, -size * 0.1, letter, {
            fontSize: `${size * 0.4}px`,
            fontFamily: 'Arial Black, sans-serif',
            color: '#2c3e50'
        }).setOrigin(0.5);
        container.add(letterText);
        
        // Wheels
        const wheelRadius = size * 0.12;
        [-size * 0.25, size * 0.25].forEach(wx => {
            const wheel = this.add.graphics();
            wheel.fillStyle(0x333333, 1);
            wheel.fillCircle(wx, size * 0.3, wheelRadius);
            wheel.lineStyle(2, 0x666666, 1);
            wheel.strokeCircle(wx, size * 0.3, wheelRadius);
            container.add(wheel);
        });
        
        // Coupling
        const coupling = this.add.graphics();
        coupling.fillStyle(0x666666, 1);
        coupling.fillRect(size * 0.45, -size * 0.05, size * 0.15, size * 0.1);
        container.add(coupling);
        
        // Selection highlight (initially invisible)
        const highlight = this.add.graphics();
        highlight.lineStyle(4, 0x0062FF, 1);
        highlight.strokeRoundedRect(-size * 0.5, -size * 0.5, size, size * 0.9, 10);
        highlight.setVisible(false);
        container.add(highlight);
        
        // Make interactive
        const hitArea = this.add.rectangle(0, 0, size * 0.9, size * 0.8, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);
        
        hitArea.on('pointerdown', () => this.onCarriageClick(index));
        hitArea.on('pointerover', () => {
            if (!this.buttonsBlocked) {
                container.setScale(1.05);
            }
        });
        hitArea.on('pointerout', () => {
            container.setScale(1);
        });
        
        this.carriages.push({
            container,
            letter,
            letterText,
            highlight,
            index
        });
    }
    
    onCarriageClick(index) {
        if (this.buttonsBlocked) return;
        
        this.buttonsBlocked = true;
        const carriage = this.carriages[index];
        
        if (carriage.letter === this.currentLetter) {
            // Correct answer
            this.showCorrectFeedback(carriage);
        } else {
            // Wrong answer
            this.showWrongFeedback(carriage);
        }
    }
    
    showCorrectFeedback(carriage) {
        // Flash green
        const flash = this.add.graphics();
        flash.fillStyle(0x4CAF50, 0.5);
        flash.fillRoundedRect(
            carriage.container.x - 45,
            carriage.container.y - 45,
            90, 80, 10
        );
        flash.setDepth(10);
        
        // Success animation
        this.tweens.add({
            targets: carriage.container,
            scale: { from: 1, to: 1.2 },
            duration: 200,
            yoyo: true,
            onComplete: () => {
                flash.destroy();
                this.currentSubLevel++;
                
                if (this.currentSubLevel >= this.questions.length) {
                    // Level complete
                    this.onLevelComplete();
                } else {
                    this.initSubLevel();
                }
            }
        });
        
        // Play success sound
        if (this.audioManager && this.audioManager.sounds.has('success')) {
            this.audioManager.play('success');
        }
        
        // Particle burst
        this.createParticleBurst(carriage.container.x, carriage.container.y);
    }
    
    showWrongFeedback(carriage) {
        // Flash red
        const flash = this.add.graphics();
        flash.fillStyle(0xF44336, 0.5);
        flash.fillRoundedRect(
            carriage.container.x - 45,
            carriage.container.y - 45,
            90, 80, 10
        );
        flash.setDepth(10);
        
        // Shake animation
        const originalX = carriage.container.x;
        this.tweens.add({
            targets: carriage.container,
            x: originalX + 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                carriage.container.x = originalX;
                flash.destroy();
                this.buttonsBlocked = false;
            }
        });
        
        // Play error sound
        if (this.audioManager && this.audioManager.sounds.has('error')) {
            this.audioManager.play('error');
        }
    }
    
    createParticleBurst(x, y) {
        const colors = [0xFFD700, 0x4CAF50, 0x2196F3, 0xFF5722];
        
        for (let i = 0; i < 15; i++) {
            const particle = this.add.circle(
                x, y, 
                Phaser.Math.Between(4, 8),
                Phaser.Math.RND.pick(colors),
                1
            ).setDepth(20);
            
            const angle = (i / 15) * Math.PI * 2;
            const distance = Phaser.Math.Between(50, 100);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0,
                duration: 600,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    onLevelComplete() {
        this.currentLevel++;
        
        if (this.currentLevel >= this.levelData.length) {
            // Game complete
            this.showGameComplete();
        } else {
            // Show level complete message and continue
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
        
        const subText = this.add.text(width / 2, height / 2 + 30, `Moving to Level ${this.currentLevel + 1}...`, {
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
        
        const text = this.add.text(width / 2, height / 2 - 50, '🏆 Congratulations! 🏆', {
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
    
    update(time, delta) {
        super.update(time, delta);
        
        if (this.buttonsBlocked) return;
        
        // Keyboard navigation
        if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
            this.playLetterSound();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.navigateCarriage(1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.navigateCarriage(-1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (this.selectedIndex >= 0) {
                this.onCarriageClick(this.selectedIndex);
            }
        }
    }
    
    navigateCarriage(direction) {
        // Update selected index
        if (this.selectedIndex < 0) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex += direction;
            if (this.selectedIndex < 0) this.selectedIndex = this.carriages.length - 1;
            if (this.selectedIndex >= this.carriages.length) this.selectedIndex = 0;
        }
        
        // Update highlights
        this.carriages.forEach((c, i) => {
            c.highlight.setVisible(i === this.selectedIndex);
        });
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
