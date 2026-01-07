/**
 * ColorMixLightGame - Mixing light colors (additive RGB)
 * 
 * Adapted from GCompris color_mix_light activity
 * 
 * Features:
 * - Additive color mixing (RGB - Red, Green, Blue)
 * - Flashlight controls with +/- buttons
 * - Target color matching
 * - 6 levels with increasing precision
 * - Underwater aquarium background (matches GCompris)
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class ColorMixLightGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'ColorMixLightGame' });
    }

    init(data) {
        super.init(data);
        this.level = data?.level || 1;
        this.maxLevel = 6;
        this.subLevel = 0;
        this.maxSubLevels = 6;
    }

    preload() {
        super.preload();
        // Load underwater background
        this.load.svg('bg-underwater', 'assets/color_mix/background2.svg', { width: 1400, height: 800 });
        // Load flashlight SVGs
        this.load.svg('flashlight-red', 'assets/color_mix/flashlight2-r.svg');
        this.load.svg('flashlight-green', 'assets/color_mix/flashlight2-g.svg');
        this.load.svg('flashlight-blue', 'assets/color_mix/flashlight2-b.svg');
    }

    create() {
        this.gameState = 'ready';
        
        if (typeof this.initializePerformanceOptimizations === 'function') {
            this.initializePerformanceOptimizations();
        }
        
        // Color values (0 to maxSteps)
        this.maxSteps = this.level;
        this.targetRed = 0;
        this.targetGreen = 0;
        this.targetBlue = 0;
        this.currentRed = 0;
        this.currentGreen = 0;
        this.currentBlue = 0;
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Underwater aquarium background (like GCompris)
        if (this.textures.exists('bg-underwater')) {
            const bg = this.add.image(width / 2, height / 2, 'bg-underwater');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            bg.setScale(Math.max(scaleX, scaleY));
            bg.setDepth(-1);
        } else {
            // Fallback gradient
            const bg = this.add.graphics();
            bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4682B4, 0x4682B4, 1);
            bg.fillRect(0, 0, width, height);
            bg.setDepth(-1);
        }
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Instruction text at top center with target color swatch (like GCompris)
        this.add.text(width / 2 - 80, 30, 'Match the color', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000',
            fontWeight: 'bold'
        }).setOrigin(0.5, 0.5).setDepth(10);
        
        // Small target color swatch next to instruction
        this.targetSwatchSmall = this.add.graphics().setDepth(10);
        
        // Score display at top right (like "0/6" in GCompris)
        const scoreBg = this.add.graphics().setDepth(10);
        scoreBg.fillStyle(0xFFFFFF, 0.9);
        scoreBg.fillRoundedRect(width - 80, 15, 65, 40, 8);
        
        this.scoreText = this.add.text(width - 48, 35, '0/6', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(11);
        
        // Create central mixing circle
        this.createMixingCircle();
        
        // Create flashlight controls (GCompris style)
        this.createFlashlights();
        
        // Create OK button on the right side (GCompris style)
        this.createOkButton();
        
        // Create GCompris navigation bar
        this.createNavigationBar();
    }

    createMixingCircle() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height * 0.35;
        const radius = 70;
        
        // Central mixing circle (black when no light)
        this.mixCircle = this.add.graphics().setDepth(5);
        this.updateMixCircle();
        
        // Light beam graphics (will show colored beams)
        this.redBeam = this.add.graphics().setDepth(3);
        this.greenBeam = this.add.graphics().setDepth(3);
        this.blueBeam = this.add.graphics().setDepth(3);
    }

    createFlashlights() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height * 0.35;
        
        // Red flashlight - Left side pointing right
        this.redFlashlight = this.createFlashlightControl(
            width * 0.22, centerY, 0xFF0000, 'red', 'horizontal-right',
            (value) => {
                this.currentRed = value;
                this.updateMixCircle();
                this.updateBeams();
            }
        );
        
        // Blue flashlight - Right side pointing left
        this.blueFlashlight = this.createFlashlightControl(
            width * 0.78, centerY, 0x0000FF, 'blue', 'horizontal-left',
            (value) => {
                this.currentBlue = value;
                this.updateMixCircle();
                this.updateBeams();
            }
        );
        
        // Green flashlight - Bottom center pointing up
        this.greenFlashlight = this.createFlashlightControl(
            centerX, height * 0.7, 0x00FF00, 'green', 'vertical-up',
            (value) => {
                this.currentGreen = value;
                this.updateMixCircle();
                this.updateBeams();
            }
        );
    }

    createFlashlightControl(x, y, color, name, orientation, onChange) {
        const isHorizontal = orientation.startsWith('horizontal');
        const isRight = orientation === 'horizontal-right';
        const isUp = orientation === 'vertical-up';
        
        const container = this.add.container(x, y).setDepth(10);
        
        // Flashlight body (oval head + rectangular body)
        const flashlight = this.add.graphics();
        
        // Colors for flashlight parts
        const bodyColor = color;
        const darkColor = this.darkenColor(color, 0.4);
        
        if (isHorizontal) {
            // Horizontal flashlight
            const headX = isRight ? -60 : 60;
            const bodyEndX = isRight ? 80 : -80;
            
            // Flashlight head (oval)
            flashlight.fillStyle(bodyColor, 1);
            flashlight.lineStyle(3, darkColor, 1);
            flashlight.fillEllipse(headX, 0, 50, 70);
            flashlight.strokeEllipse(headX, 0, 50, 70);
            
            // Light meter inside head (shows current value)
            flashlight.fillStyle(this.lightenColor(color, 0.7), 1);
            flashlight.fillRect(headX - 15, -25, 30, 50);
            
            // Flashlight body (handle)
            flashlight.fillStyle(0x888888, 1);
            flashlight.fillRect(isRight ? -30 : -50, -20, 80, 40);
            
            // +/- buttons
            const minusX = isRight ? 50 : -50;
            const plusX = isRight ? -30 : 30;
            
            // Minus button
            this.createControlButton(container, minusX, 0, '-', () => {
                this.updateFlashlightValue(name, -1);
                onChange(this.getFlashlightValue(name));
            });
            
            // Plus button  
            this.createControlButton(container, plusX, 0, '+', () => {
                this.updateFlashlightValue(name, 1);
                onChange(this.getFlashlightValue(name));
            });
            
        } else {
            // Vertical flashlight (green at bottom)
            // Flashlight head (oval at top)
            flashlight.fillStyle(bodyColor, 1);
            flashlight.lineStyle(3, darkColor, 1);
            flashlight.fillEllipse(0, -60, 70, 50);
            flashlight.strokeEllipse(0, -60, 70, 50);
            
            // Light meter
            flashlight.fillStyle(this.lightenColor(color, 0.7), 1);
            flashlight.fillRect(-15, -85, 30, 50);
            
            // Flashlight body (handle)
            flashlight.fillStyle(0x888888, 1);
            flashlight.fillRect(-20, -30, 40, 80);
            
            // +/- buttons
            this.createControlButton(container, 0, -100, '+', () => {
                this.updateFlashlightValue(name, 1);
                onChange(this.getFlashlightValue(name));
            });
            
            this.createControlButton(container, 0, 60, '-', () => {
                this.updateFlashlightValue(name, -1);
                onChange(this.getFlashlightValue(name));
            });
        }
        
        container.add(flashlight);
        
        return { container, name };
    }

    createControlButton(container, x, y, symbol, onClick) {
        const btn = this.add.circle(x, y, 18, 0xCCCCCC)
            .setInteractive({ useHandCursor: true })
            .setDepth(11);
        btn.setStrokeStyle(2, 0x666666);
        
        const text = this.add.text(x, y, symbol, {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#333333'
        }).setOrigin(0.5).setDepth(12);
        
        btn.on('pointerdown', onClick);
        btn.on('pointerover', () => btn.setFillStyle(0xEEEEEE));
        btn.on('pointerout', () => btn.setFillStyle(0xCCCCCC));
        
        container.add([btn, text]);
    }

    getFlashlightValue(name) {
        if (name === 'red') return this.currentRed;
        if (name === 'green') return this.currentGreen;
        if (name === 'blue') return this.currentBlue;
        return 0;
    }

    updateFlashlightValue(name, delta) {
        if (name === 'red') {
            this.currentRed = Math.max(0, Math.min(this.maxSteps, this.currentRed + delta));
        } else if (name === 'green') {
            this.currentGreen = Math.max(0, Math.min(this.maxSteps, this.currentGreen + delta));
        } else if (name === 'blue') {
            this.currentBlue = Math.max(0, Math.min(this.maxSteps, this.currentBlue + delta));
        }
    }

    updateMixCircle() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height * 0.35;
        const radius = 60;
        
        const color = this.rgbToColor(this.currentRed, this.currentGreen, this.currentBlue);
        
        this.mixCircle.clear();
        this.mixCircle.fillStyle(color, 1);
        this.mixCircle.lineStyle(4, 0x333333, 1);
        this.mixCircle.fillCircle(centerX, centerY, radius);
        this.mixCircle.strokeCircle(centerX, centerY, radius);
    }

    updateBeams() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height * 0.35;
        
        // Clear beams
        this.redBeam.clear();
        this.greenBeam.clear();
        this.blueBeam.clear();
        
        // Draw light beams based on current values
        if (this.currentRed > 0) {
            const alpha = (this.currentRed / this.maxSteps) * 0.4;
            this.redBeam.fillStyle(0xFF0000, alpha);
            this.redBeam.fillTriangle(
                width * 0.22 - 30, centerY - 30,
                width * 0.22 - 30, centerY + 30,
                centerX - 60, centerY
            );
        }
        
        if (this.currentBlue > 0) {
            const alpha = (this.currentBlue / this.maxSteps) * 0.4;
            this.blueBeam.fillStyle(0x0000FF, alpha);
            this.blueBeam.fillTriangle(
                width * 0.78 + 30, centerY - 30,
                width * 0.78 + 30, centerY + 30,
                centerX + 60, centerY
            );
        }
        
        if (this.currentGreen > 0) {
            const alpha = (this.currentGreen / this.maxSteps) * 0.4;
            this.greenBeam.fillStyle(0x00FF00, alpha);
            this.greenBeam.fillTriangle(
                centerX - 30, height * 0.7 - 80,
                centerX + 30, height * 0.7 - 80,
                centerX, centerY + 60
            );
        }
    }

    createOkButton() {
        const { width, height } = this.scale;
        const btnX = width - 80;
        const btnY = height * 0.45;
        const radius = 40;
        
        // Large green circular OK button (like GCompris)
        const okBg = this.add.graphics().setDepth(100);
        okBg.fillStyle(0x4CAF50, 1);
        okBg.lineStyle(4, 0x2E7D32, 1);
        okBg.fillCircle(btnX, btnY, radius);
        okBg.strokeCircle(btnX, btnY, radius);
        
        this.add.text(btnX, btnY, 'OK', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(101);
        
        const hitArea = this.add.circle(btnX, btnY, radius)
            .setInteractive({ useHandCursor: true })
            .setAlpha(0.001);
        
        hitArea.on('pointerdown', () => this.checkAnswer());
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
        this.levelText = this.add.text(x + 15, y, this.level.toString(), {
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

        // Decorative dash
        this.add.text(x, y, '—', {
            fontSize: '32px', fontFamily: 'Arial', color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(201);
    }

    createNavButton(x, y, size, color, symbol, action) {
        const btn = this.add.container(x, y).setDepth(200);

        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillCircle(0, 0, size / 2);
        bg.lineStyle(3, 0xFFFFFF, 0.3);
        bg.strokeCircle(0, 0, size / 2);

        const text = this.add.text(0, 0, symbol, {
            fontSize: `${size * 0.5}px`,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        btn.add([bg, text]);
        this.navContainer.add(btn);

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
                if (this.level > 1) {
                    this.level--;
                    this.restartLevel();
                }
                break;
            case 'nextLevel':
                if (this.level < this.maxLevel) {
                    this.level++;
                    this.restartLevel();
                }
                break;
        }
    }

    showHelp() {
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(300).setInteractive();

        const panel = this.add.graphics().setDepth(301);
        const panelWidth = 500;
        const panelHeight = 300;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = height / 2 - panelHeight / 2;

        panel.fillStyle(0x1a5276, 0.95);
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
        panel.lineStyle(3, 0x3498db);
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);

        const title = this.add.text(width / 2, panelY + 40, '💡 Mix Light Colors', {
            fontSize: '28px', fontFamily: 'Arial', fontWeight: 'bold', color: '#FFD700'
        }).setOrigin(0.5).setDepth(302);

        const instructions = this.add.text(width / 2, panelY + 140,
            'Use the flashlights to mix light colors!\n\n' +
            'Red + Green = Yellow\n' +
            'Red + Blue = Magenta\n' +
            'Green + Blue = Cyan\n' +
            'All three = White',
            { fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF', align: 'center', lineSpacing: 6 }
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
        this.generateTargetColor();
        this.updateScore();
    }

    generateTargetColor() {
        // Generate random target color
        this.targetRed = Math.floor(Math.random() * (this.maxSteps + 1));
        this.targetGreen = Math.floor(Math.random() * (this.maxSteps + 1));
        this.targetBlue = Math.floor(Math.random() * (this.maxSteps + 1));
        
        // Reset current values
        this.currentRed = 0;
        this.currentGreen = 0;
        this.currentBlue = 0;
        
        this.updateMixCircle();
        this.updateBeams();
        this.updateTargetSwatch();
    }

    updateTargetSwatch() {
        const { width } = this.scale;
        const color = this.rgbToColor(this.targetRed, this.targetGreen, this.targetBlue);
        
        if (!this.targetSwatchSmall) return;
        
        this.targetSwatchSmall.clear();
        this.targetSwatchSmall.fillStyle(color, 1);
        this.targetSwatchSmall.lineStyle(2, 0x333333, 1);
        this.targetSwatchSmall.fillRect(width / 2 + 30, 15, 40, 30);
        this.targetSwatchSmall.strokeRect(width / 2 + 30, 15, 40, 30);
    }

    rgbToColor(r, g, b) {
        const red = Math.floor((r / this.maxSteps) * 255);
        const green = Math.floor((g / this.maxSteps) * 255);
        const blue = Math.floor((b / this.maxSteps) * 255);
        return (red << 16) | (green << 8) | blue;
    }

    darkenColor(color, factor) {
        const r = ((color >> 16) & 0xFF) * factor;
        const g = ((color >> 8) & 0xFF) * factor;
        const b = (color & 0xFF) * factor;
        return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
    }

    lightenColor(color, factor) {
        const r = Math.min(255, ((color >> 16) & 0xFF) + (255 - ((color >> 16) & 0xFF)) * factor);
        const g = Math.min(255, ((color >> 8) & 0xFF) + (255 - ((color >> 8) & 0xFF)) * factor);
        const b = Math.min(255, (color & 0xFF) + (255 - (color & 0xFF)) * factor);
        return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
    }

    checkAnswer() {
        const isCorrect = 
            this.currentRed === this.targetRed &&
            this.currentGreen === this.targetGreen &&
            this.currentBlue === this.targetBlue;
        
        if (isCorrect) {
            this.showFeedback(true);
            this.subLevel++;
            
            if (this.subLevel >= this.maxSubLevels) {
                this.time.delayedCall(800, () => this.handleLevelComplete());
            } else {
                this.time.delayedCall(800, () => {
                    this.generateTargetColor();
                    this.updateScore();
                });
            }
        } else {
            this.showFeedback(false);
        }
    }

    showFeedback(correct) {
        const { width, height } = this.scale;
        
        if (correct) {
            const check = this.add.text(width / 2, height * 0.35, '✓', {
                fontSize: '80px', color: '#4CAF50'
            }).setOrigin(0.5).setDepth(20);
            
            this.tweens.add({
                targets: check,
                scale: { from: 0.5, to: 1.2 },
                alpha: { from: 1, to: 0 },
                duration: 600,
                onComplete: () => check.destroy()
            });
            
            if (this.audioManager) this.audioManager.playSound('success');
        } else {
            const wrong = this.add.text(width / 2, height * 0.35, '✗', {
                fontSize: '60px', color: '#F44336'
            }).setOrigin(0.5).setDepth(20);
            
            this.tweens.add({
                targets: wrong,
                alpha: { from: 1, to: 0 },
                duration: 600,
                onComplete: () => wrong.destroy()
            });
            
            if (this.audioManager) this.audioManager.playSound('fail');
        }
    }

    updateScore() {
        if (this.scoreText) {
            this.scoreText.setText(`${this.subLevel}/${this.maxSubLevels}`);
        }
    }

    handleLevelComplete() {
        const { width, height } = this.scale;
        
        if (this.level < this.maxLevel) {
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setDepth(250);
            
            const message = this.add.text(width / 2, height / 2 - 30, '💡 Level Complete!', {
                fontFamily: 'Arial Black', fontSize: '32px', color: '#4CAF50'
            }).setOrigin(0.5).setDepth(251);
            
            const nextBtn = this.add.text(width / 2, height / 2 + 30, 'Next Level →', {
                fontFamily: 'Arial', fontSize: '24px', color: '#ffffff',
                backgroundColor: '#0062FF', padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(251).setInteractive({ useHandCursor: true });
            
            nextBtn.on('pointerdown', () => {
                overlay.destroy();
                message.destroy();
                nextBtn.destroy();
                this.level++;
                this.subLevel = 0;
                this.scene.restart({ level: this.level });
            });
        } else {
            this.showVictory();
        }
    }

    showVictory() {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(250);
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 Light Mixing Expert! 🏆', {
            fontFamily: 'Arial Black', fontSize: '28px', color: '#FFD700'
        }).setOrigin(0.5).setDepth(251);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 30, 'Back to Menu', {
            fontFamily: 'Arial', fontSize: '24px', color: '#ffffff',
            backgroundColor: '#333333', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(251).setInteractive({ useHandCursor: true });
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('GameMenu');
        });
    }

    restartLevel() {
        this.subLevel = 0;
        this.maxSteps = this.level;
        this.scene.restart({ level: this.level });
    }
}
