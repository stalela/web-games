/**
 * AdvancedColorsGame - Find the butterfly with advanced color names
 * 
 * Adapted from GCompris advanced_colors activity
 * 
 * Features:
 * - Butterflies with sophisticated color names (coral, navy, cobalt, etc.)
 * - 10 levels with increasing difficulty
 * - Educational color vocabulary
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class AdvancedColorsGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'AdvancedColorsGame' });
        
        // Advanced color data with hex values from GCompris
        this.allColors = [
            { name: 'coral', color: 0xFF7F50, text: 'Find the coral butterfly' },
            { name: 'claret', color: 0x7F1734, text: 'Find the claret butterfly' },
            { name: 'navy', color: 0x000080, text: 'Find the navy butterfly' },
            { name: 'corn', color: 0xFBEC5D, text: 'Find the corn butterfly' },
            { name: 'cobalt', color: 0x0047AB, text: 'Find the cobalt butterfly' },
            { name: 'cyan', color: 0x00FFFF, text: 'Find the cyan butterfly' },
            { name: 'chestnut', color: 0x954535, text: 'Find the chestnut butterfly' },
            { name: 'almond', color: 0xAB784E, text: 'Find the almond butterfly' },
            { name: 'sapphire', color: 0x0F52BA, text: 'Find the sapphire butterfly' },
            { name: 'ruby', color: 0xE0115F, text: 'Find the ruby butterfly' },
            { name: 'sienna', color: 0x882D17, text: 'Find the sienna butterfly' },
            { name: 'sage', color: 0xBCB88A, text: 'Find the sage butterfly' },
            { name: 'salmon', color: 0xFF8C69, text: 'Find the salmon butterfly' },
            { name: 'sepia', color: 0x704214, text: 'Find the sepia butterfly' },
            { name: 'sulphur', color: 0xE4BB25, text: 'Find the sulfur butterfly' },
            { name: 'tea', color: 0xDB6D7B, text: 'Find the tea butterfly' },
            { name: 'lime', color: 0xBFFF00, text: 'Find the lime butterfly' },
            { name: 'turquoise', color: 0x40E0D0, text: 'Find the turquoise butterfly' },
            { name: 'absinthe', color: 0x73B881, text: 'Find the absinthe butterfly' },
            { name: 'mahogany', color: 0xC04000, text: 'Find the mahogany butterfly' },
            { name: 'aquamarine', color: 0x7FFFD4, text: 'Find the aquamarine butterfly' },
            { name: 'amber', color: 0xFFBF00, text: 'Find the amber butterfly' },
            { name: 'amethyst', color: 0x9966CC, text: 'Find the amethyst butterfly' },
            { name: 'auburn', color: 0xA52A2A, text: 'Find the auburn butterfly' },
            { name: 'azure', color: 0x007FFF, text: 'Find the azure butterfly' },
            { name: 'cerulean', color: 0x007BA7, text: 'Find the cerulean butterfly' },
            { name: 'chartreuse', color: 0x7FFF00, text: 'Find the chartreuse butterfly' },
            { name: 'crimson', color: 0xDC143C, text: 'Find the crimson butterfly' },
            { name: 'emerald', color: 0x50C878, text: 'Find the emerald butterfly' },
            { name: 'fuchsia', color: 0xFF00FF, text: 'Find the fuchsia butterfly' },
            { name: 'indigo', color: 0x4B0082, text: 'Find the indigo butterfly' },
            { name: 'ivory', color: 0xFFFFF0, text: 'Find the ivory butterfly' },
            { name: 'jade', color: 0x00A86B, text: 'Find the jade butterfly' },
            { name: 'lavender', color: 0xE6E6FA, text: 'Find the lavender butterfly' },
            { name: 'lilac', color: 0xC8A2C8, text: 'Find the lilac butterfly' },
            { name: 'magenta', color: 0xFF00FF, text: 'Find the magenta butterfly' },
            { name: 'mauve', color: 0xE0B0FF, text: 'Find the mauve butterfly' },
            { name: 'ochre', color: 0xCC7722, text: 'Find the ochre butterfly' },
            { name: 'olive', color: 0x808000, text: 'Find the olive butterfly' },
            { name: 'platinum', color: 0xE5E4E2, text: 'Find the platinum butterfly' },
            { name: 'plum', color: 0xDDA0DD, text: 'Find the plum butterfly' },
            { name: 'rust', color: 0xB7410E, text: 'Find the rust butterfly' },
            { name: 'saffron', color: 0xF4C430, text: 'Find the saffron butterfly' },
            { name: 'vermilion', color: 0xE34234, text: 'Find the vermilion butterfly' },
            { name: 'wine', color: 0x722F37, text: 'Find the wine butterfly' }
        ];
        
        // Level data - each level uses 8 colors
        this.levelData = this.generateLevels();
    }
    
    generateLevels() {
        const levels = [];
        const shuffled = [...this.allColors].sort(() => Math.random() - 0.5);
        
        // Create 10 levels, 8 colors each
        for (let i = 0; i < 10; i++) {
            const start = (i * 8) % this.allColors.length;
            const levelColors = [];
            for (let j = 0; j < 8; j++) {
                levelColors.push(shuffled[(start + j) % shuffled.length]);
            }
            levels.push(levelColors);
        }
        
        return levels;
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
        this.butterflies = [];
        this.gameOver = false;
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Garden/meadow gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D982, 0x7CB342, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
        
        // Flowers at bottom
        for (let i = 0; i < 20; i++) {
            this.createFlower(
                Math.random() * width,
                height - 30 - Math.random() * 40
            );
        }
    }
    
    createFlower(x, y) {
        const flower = this.add.graphics();
        const colors = [0xFF69B4, 0xFFD700, 0xFF6347, 0x9370DB, 0xFFB6C1];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Stem
        flower.lineStyle(2, 0x228B22);
        flower.lineBetween(x, y, x, y + 30);
        
        // Petals
        flower.fillStyle(color, 0.9);
        const size = 6 + Math.random() * 4;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            flower.fillCircle(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size * 0.7);
        }
        
        // Center
        flower.fillStyle(0xFFD700, 1);
        flower.fillCircle(x, y, size * 0.5);
        
        flower.setDepth(0);
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Instruction panel at top
        this.instructionPanel = this.add.graphics();
        this.instructionPanel.fillStyle(0x3d5a5a, 0.9);
        this.instructionPanel.fillRoundedRect(width / 2 - 220, 15, 440, 50, 12);
        this.instructionPanel.setDepth(10);
        
        // Instruction text
        this.instructionText = this.add.text(width / 2, 40, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // Score display
        this.scoreText = this.add.text(width - 20, 20, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#333333'
        }).setOrigin(1, 0).setDepth(10);
        
        // Create navigation bar
        this.createNavigationDock();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const buttonSize = 50;
        const padding = 10;
        const y = height - buttonSize / 2 - 15;
        
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
        // Clear existing butterflies
        this.butterflies.forEach(b => {
            if (b.graphics) b.graphics.destroy();
            if (b.shadow) b.shadow.destroy();
            b.destroy();
        });
        this.butterflies = [];
        
        // Get level data
        const colors = this.levelData[this.level - 1];
        
        // Shuffle colors for display
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
        
        // Create shuffled question order
        this.questions = [...colors].sort(() => Math.random() - 0.5);
        this.currentQuestion = 0;
        this.gameOver = false;
        
        // Create butterfly grid
        this.createButterflies(shuffledColors);
        
        // Show first question
        this.showQuestion();
        
        // Update score
        this.updateScore();
    }

    createButterflies(colors) {
        const { width, height } = this.scale;
        
        // 4x2 grid for 8 butterflies
        const cols = 4;
        const rows = 2;
        
        const butterflySize = Math.min(
            (width - 100) / cols,
            (height - 220) / rows
        ) * 0.75;
        
        const gridWidth = cols * butterflySize * 1.3;
        const gridHeight = rows * butterflySize * 1.5;
        const startX = (width - gridWidth) / 2 + butterflySize * 0.65;
        const startY = (height - gridHeight) / 2 + butterflySize * 0.4;
        
        colors.forEach((colorData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = startX + col * butterflySize * 1.3;
            const y = startY + row * butterflySize * 1.5;
            
            this.createButterfly(x, y, butterflySize, colorData);
        });
    }

    createButterfly(x, y, size, colorData) {
        const butterfly = this.add.graphics();
        
        // Shadow
        const shadow = this.add.ellipse(x, y + size * 0.35, size * 0.8, size * 0.15, 0x000000, 0.15);
        shadow.setDepth(1);
        
        // Wings
        const wingColor = colorData.color;
        butterfly.fillStyle(wingColor, 1);
        
        // Left upper wing
        butterfly.fillEllipse(x - size * 0.25, y - size * 0.1, size * 0.35, size * 0.25);
        // Left lower wing
        butterfly.fillEllipse(x - size * 0.2, y + size * 0.1, size * 0.25, size * 0.2);
        // Right upper wing
        butterfly.fillEllipse(x + size * 0.25, y - size * 0.1, size * 0.35, size * 0.25);
        // Right lower wing
        butterfly.fillEllipse(x + size * 0.2, y + size * 0.1, size * 0.25, size * 0.2);
        
        // Wing patterns (darker shade)
        const darkerColor = this.darkenColor(wingColor, 0.3);
        butterfly.fillStyle(darkerColor, 0.5);
        butterfly.fillCircle(x - size * 0.25, y - size * 0.1, size * 0.08);
        butterfly.fillCircle(x + size * 0.25, y - size * 0.1, size * 0.08);
        butterfly.fillCircle(x - size * 0.18, y + size * 0.08, size * 0.05);
        butterfly.fillCircle(x + size * 0.18, y + size * 0.08, size * 0.05);
        
        // Body
        butterfly.fillStyle(0x333333, 1);
        butterfly.fillEllipse(x, y, size * 0.06, size * 0.25);
        
        // Antennae
        butterfly.lineStyle(2, 0x333333);
        butterfly.lineBetween(x - size * 0.02, y - size * 0.12, x - size * 0.08, y - size * 0.22);
        butterfly.lineBetween(x + size * 0.02, y - size * 0.12, x + size * 0.08, y - size * 0.22);
        butterfly.fillCircle(x - size * 0.08, y - size * 0.22, size * 0.02);
        butterfly.fillCircle(x + size * 0.08, y - size * 0.22, size * 0.02);
        
        butterfly.setDepth(2);
        
        // Hit area
        const hitArea = this.add.ellipse(x, y, size * 0.8, size * 0.6, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(3);
        
        hitArea.setData('colorName', colorData.name);
        hitArea.graphics = butterfly;
        hitArea.shadow = shadow;
        
        // Hover animation
        hitArea.on('pointerover', () => {
            butterfly.setScale(1.1);
        });
        
        hitArea.on('pointerout', () => {
            butterfly.setScale(1);
        });
        
        hitArea.on('pointerdown', () => {
            this.checkAnswer(colorData.name, hitArea);
        });
        
        // Flutter animation
        this.tweens.add({
            targets: butterfly,
            y: butterfly.y - 5,
            duration: 400 + Math.random() * 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.butterflies.push(hitArea);
    }
    
    darkenColor(color, factor) {
        const r = ((color >> 16) & 0xFF) * (1 - factor);
        const g = ((color >> 8) & 0xFF) * (1 - factor);
        const b = (color & 0xFF) * (1 - factor);
        return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        this.instructionText.setText(question.text);
        
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
            this.showFeedback(true, hitArea);
            this.currentQuestion++;
            this.updateScore();
            
            if (this.currentQuestion >= this.questions.length) {
                this.gameOver = true;
                this.time.delayedCall(800, () => this.handleLevelComplete());
            } else {
                this.time.delayedCall(600, () => this.showQuestion());
            }
        } else {
            this.showFeedback(false, hitArea);
        }
    }

    showFeedback(correct, hitArea) {
        const graphics = hitArea.graphics;
        
        if (correct) {
            this.tweens.add({
                targets: graphics,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 150,
                yoyo: true,
                ease: 'Power2'
            });
            
            // Sparkles
            const x = hitArea.x;
            const y = hitArea.y;
            
            for (let i = 0; i < 8; i++) {
                const star = this.add.text(x, y, '✨', {
                    fontSize: '18px'
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
            // Shake
            const originalX = graphics.x;
            this.tweens.add({
                targets: graphics,
                x: originalX + 10,
                duration: 50,
                yoyo: true,
                repeat: 3,
                ease: 'Power2',
                onComplete: () => graphics.setX(originalX)
            });
            
            const wrongMark = this.add.text(hitArea.x, hitArea.y, '✗', {
                fontSize: '40px',
                color: '#F44336'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: wrongMark,
                alpha: 0,
                y: hitArea.y - 30,
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
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setDepth(20);
            
            const message = this.add.text(width / 2, height / 2 - 30, '🦋 Level Complete!', {
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
            this.showVictory();
        }
    }

    showVictory() {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(20);
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 Color Expert! 🏆', {
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
