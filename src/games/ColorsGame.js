/**
 * ColorsGame - Find the colored duck
 * 
 * Adapted from GCompris colors activity
 * 
 * Features:
 * - Colored ducks displayed in grid
 * - Audio/text prompts to find specific color
 * - 3 levels with increasing number of colors
 * - Shuffle presentation for variety
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class ColorsGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'ColorsGame' });
        
        // Level data - each level has array of colors
        this.levelData = [
            // Level 1 - 6 basic colors
            [
                { name: 'yellow', color: 0xFFEB3B, text: 'Find the yellow duck' },
                { name: 'black', color: 0x212121, text: 'Find the black duck' },
                { name: 'green', color: 0x4CAF50, text: 'Find the green duck' },
                { name: 'red', color: 0xF44336, text: 'Find the red duck' },
                { name: 'white', color: 0xFAFAFA, text: 'Find the white duck' },
                { name: 'blue', color: 0x2196F3, text: 'Find the blue duck' }
            ],
            // Level 2 - 8 colors
            [
                { name: 'yellow', color: 0xFFEB3B, text: 'Find the yellow duck' },
                { name: 'black', color: 0x212121, text: 'Find the black duck' },
                { name: 'brown', color: 0x795548, text: 'Find the brown duck' },
                { name: 'green', color: 0x4CAF50, text: 'Find the green duck' },
                { name: 'grey', color: 0x9E9E9E, text: 'Find the grey duck' },
                { name: 'orange', color: 0xFF9800, text: 'Find the orange duck' },
                { name: 'purple', color: 0x9C27B0, text: 'Find the purple duck' },
                { name: 'white', color: 0xFAFAFA, text: 'Find the white duck' }
            ],
            // Level 3 - 8 colors (different mix)
            [
                { name: 'yellow', color: 0xFFEB3B, text: 'Find the yellow duck' },
                { name: 'brown', color: 0x795548, text: 'Find the brown duck' },
                { name: 'green', color: 0x4CAF50, text: 'Find the green duck' },
                { name: 'grey', color: 0x9E9E9E, text: 'Find the grey duck' },
                { name: 'orange', color: 0xFF9800, text: 'Find the orange duck' },
                { name: 'purple', color: 0x9C27B0, text: 'Find the purple duck' },
                { name: 'pink', color: 0xE91E63, text: 'Find the pink duck' },
                { name: 'blue', color: 0x2196F3, text: 'Find the blue duck' }
            ]
        ];
    }

    init(data) {
        super.init(data);
        this.level = data?.level || 1;
        this.maxLevel = this.levelData.length;
    }

    create() {
        this.gameState = 'ready';
        
        if (typeof this.initializePerformanceOptimizations === 'function') {
            this.initializePerformanceOptimizations();
        }
        
        // Game state
        this.currentQuestion = 0;
        this.questions = [];
        this.ducks = [];
        this.gameOver = false;
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Sky blue gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xB0E0E6, 0xE0F7FA, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
        
        // Add some clouds
        this.createCloud(width * 0.15, height * 0.15);
        this.createCloud(width * 0.7, height * 0.1);
        this.createCloud(width * 0.85, height * 0.2);
        
        // Ground/water at bottom
        bg.fillStyle(0x4FC3F7, 0.5);
        bg.fillRect(0, height - 60, width, 60);
    }
    
    createCloud(x, y) {
        const cloud = this.add.graphics();
        cloud.fillStyle(0xFFFFFF, 0.8);
        cloud.fillCircle(x, y, 30);
        cloud.fillCircle(x + 25, y - 10, 25);
        cloud.fillCircle(x + 50, y, 30);
        cloud.fillCircle(x + 25, y + 10, 20);
        cloud.setDepth(0);
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Instruction panel at top
        this.instructionPanel = this.add.graphics();
        this.instructionPanel.fillStyle(0x3d5a5a, 0.9);
        this.instructionPanel.fillRoundedRect(width / 2 - 200, 15, 400, 50, 12);
        this.instructionPanel.setDepth(10);
        
        // Instruction text
        this.instructionText = this.add.text(width / 2, 40, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // Score display
        this.scoreText = this.add.text(width - 20, 20, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#333333'
        }).setOrigin(1, 0).setDepth(10);
        
        // Create GCompris-style navigation bar
        this.createNavigationDock();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const buttonSize = 50;
        const padding = 10;
        const y = height - buttonSize / 2 - 15;
        
        // Calculate positions for navigation
        const totalWidth = buttonSize * 5 + padding * 4 + 40;
        let x = (width - totalWidth) / 2 + buttonSize / 2;
        
        // Home button
        this.createNavButton(x, y, 0x26c6da, '⌂', () => {
            this.scene.start('GameMenu');
        });
        x += buttonSize + padding;
        
        // Previous level
        this.createNavButton(x, y, 0xf57c00, '❮', () => {
            if (this.level > 1) {
                this.level--;
                this.restartLevel();
            }
        });
        x += buttonSize + padding;
        
        // Level indicator
        this.levelText = this.add.text(x, y, String(this.level), {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        x += 40;
        
        // Next level
        this.createNavButton(x, y, 0xeeeeee, '❯', () => {
            if (this.level < this.maxLevel) {
                this.level++;
                this.restartLevel();
            }
        }, '#333333');
        x += buttonSize + padding;
        
        // Restart button
        this.createNavButton(x, y, 0x26c6da, '↻', () => {
            this.restartLevel();
        });
    }
    
    createNavButton(x, y, color, icon, callback, textColor = '#ffffff') {
        const button = this.add.circle(x, y, 24, color)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        
        this.add.circle(x, y + 2, 24, 0x000000, 0.3).setDepth(9);
        
        const text = this.add.text(x, y, icon, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: textColor
        }).setOrigin(0.5).setDepth(11);

        button.on('pointerover', () => {
            button.setScale(1.1);
            text.setScale(1.1);
        });
        button.on('pointerout', () => {
            button.setScale(1);
            text.setScale(1);
        });
        button.on('pointerdown', callback);
        
        return { button, text };
    }

    setupGameLogic() {
        this.initLevel();
    }

    initLevel() {
        // Clear existing ducks
        this.ducks.forEach(d => {
            if (d.shadow) d.shadow.destroy();
            d.destroy();
        });
        this.ducks = [];
        
        // Get level data
        const colors = this.levelData[this.level - 1];
        
        // Shuffle colors for display
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
        
        // Create shuffled question order
        this.questions = [...colors].sort(() => Math.random() - 0.5);
        this.currentQuestion = 0;
        this.gameOver = false;
        
        // Create duck grid
        this.createDucks(shuffledColors);
        
        // Show first question
        this.showQuestion();
        
        // Update score display
        this.updateScore();
    }

    createDucks(colors) {
        const { width, height } = this.scale;
        
        // Calculate grid layout
        const count = colors.length;
        const cols = count <= 6 ? 3 : 4;
        const rows = Math.ceil(count / cols);
        
        const duckSize = Math.min(
            (width - 100) / cols,
            (height - 200) / rows
        ) * 0.8;
        
        const gridWidth = cols * duckSize * 1.2;
        const gridHeight = rows * duckSize * 1.2;
        const startX = (width - gridWidth) / 2 + duckSize * 0.6;
        const startY = (height - gridHeight) / 2 + duckSize * 0.3;
        
        colors.forEach((colorData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = startX + col * duckSize * 1.2;
            const y = startY + row * duckSize * 1.2;
            
            this.createDuck(x, y, duckSize, colorData);
        });
    }

    createDuck(x, y, size, colorData) {
        // Duck body (oval)
        const duck = this.add.graphics();
        
        // Shadow
        const shadow = this.add.ellipse(x + 5, y + size * 0.4, size * 0.7, size * 0.25, 0x000000, 0.2);
        shadow.setDepth(1);
        
        // Body
        duck.fillStyle(colorData.color, 1);
        duck.fillEllipse(x, y, size * 0.6, size * 0.4);
        
        // Head
        duck.fillEllipse(x + size * 0.25, y - size * 0.15, size * 0.3, size * 0.25);
        
        // Beak (orange)
        duck.fillStyle(0xFF9800, 1);
        duck.fillTriangle(
            x + size * 0.4, y - size * 0.15,
            x + size * 0.55, y - size * 0.12,
            x + size * 0.4, y - size * 0.08
        );
        
        // Eye
        duck.fillStyle(0x000000, 1);
        duck.fillCircle(x + size * 0.3, y - size * 0.18, size * 0.04);
        
        // White eye highlight
        duck.fillStyle(0xFFFFFF, 1);
        duck.fillCircle(x + size * 0.28, y - size * 0.2, size * 0.015);
        
        duck.setDepth(2);
        
        // Create hit area
        const hitArea = this.add.ellipse(x, y, size * 0.8, size * 0.6, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(3);
        
        hitArea.setData('colorName', colorData.name);
        hitArea.setData('duck', duck);
        hitArea.setData('shadow', shadow);
        
        hitArea.on('pointerover', () => {
            duck.setScale(1.1);
            duck.setPosition(duck.x - size * 0.03, duck.y - size * 0.02);
        });
        
        hitArea.on('pointerout', () => {
            duck.setScale(1);
            duck.setPosition(duck.x + size * 0.03, duck.y + size * 0.02);
        });
        
        hitArea.on('pointerdown', () => {
            this.checkAnswer(colorData.name, hitArea);
        });
        
        hitArea.shadow = shadow;
        this.ducks.push(hitArea);
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        this.instructionText.setText(question.text);
        
        // Animate instruction panel
        this.tweens.add({
            targets: [this.instructionPanel, this.instructionText],
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Power2'
        });
    }

    checkAnswer(colorName, hitArea) {
        if (this.gameOver) return;
        
        const correctColor = this.questions[this.currentQuestion].name;
        
        if (colorName === correctColor) {
            // Correct!
            this.showFeedback(true, hitArea);
            this.currentQuestion++;
            this.updateScore();
            
            if (this.currentQuestion >= this.questions.length) {
                // Level complete
                this.gameOver = true;
                this.time.delayedCall(800, () => this.handleLevelComplete());
            } else {
                // Next question
                this.time.delayedCall(600, () => this.showQuestion());
            }
        } else {
            // Wrong
            this.showFeedback(false, hitArea);
        }
    }

    showFeedback(correct, hitArea) {
        const duck = hitArea.getData('duck');
        
        if (correct) {
            // Green flash and scale
            this.tweens.add({
                targets: duck,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 150,
                yoyo: true,
                ease: 'Power2'
            });
            
            // Success particle
            const x = hitArea.x;
            const y = hitArea.y;
            
            for (let i = 0; i < 8; i++) {
                const star = this.add.text(x, y, '✓', {
                    fontSize: '20px',
                    color: '#4CAF50'
                }).setOrigin(0.5);
                
                const angle = (i / 8) * Math.PI * 2;
                this.tweens.add({
                    targets: star,
                    x: x + Math.cos(angle) * 50,
                    y: y + Math.sin(angle) * 50,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => star.destroy()
                });
            }
        } else {
            // Shake animation for wrong answer
            const originalX = duck.x;
            this.tweens.add({
                targets: duck,
                x: originalX + 10,
                duration: 50,
                yoyo: true,
                repeat: 3,
                ease: 'Power2',
                onComplete: () => duck.setX(originalX)
            });
            
            // Red X
            const x = hitArea.x;
            const y = hitArea.y;
            const wrongMark = this.add.text(x, y, '✗', {
                fontSize: '40px',
                color: '#F44336'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: wrongMark,
                alpha: 0,
                y: y - 30,
                duration: 500,
                ease: 'Power2',
                onComplete: () => wrongMark.destroy()
            });
        }
    }

    updateScore() {
        const total = this.questions.length;
        const current = this.currentQuestion;
        this.scoreText.setText(`${current}/${total}`);
    }

    handleLevelComplete() {
        const { width, height } = this.scale;
        
        if (this.level < this.maxLevel) {
            // Show level complete message
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setDepth(20);
            
            const message = this.add.text(width / 2, height / 2 - 30, '🎉 Level Complete!', {
                fontFamily: 'Arial Black',
                fontSize: '32px',
                color: '#4CAF50'
            }).setOrigin(0.5).setDepth(21);
            
            const nextBtn = this.add.text(width / 2, height / 2 + 30, 'Next Level →', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#0062FF',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
            
            nextBtn.on('pointerdown', () => {
                overlay.destroy();
                message.destroy();
                nextBtn.destroy();
                this.level++;
                this.levelText.setText(String(this.level));
                this.restartLevel();
            });
        } else {
            // All levels complete!
            this.showVictory();
        }
    }

    showVictory() {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(20);
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 You know all the colors! 🏆', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#FFD700'
        }).setOrigin(0.5).setDepth(21);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 30, 'Back to Menu', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('GameMenu');
        });
    }

    restartLevel() {
        this.levelText?.setText(String(this.level));
        this.initLevel();
    }
}
