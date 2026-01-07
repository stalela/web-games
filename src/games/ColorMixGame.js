/**
 * ColorMixGame - Mixing light colors (additive RGB)
 * 
 * Adapted from GCompris color_mix activity (RGB mode)
 * 
 * Features:
 * - Additive color mixing (RGB - Red, Green, Blue)
 * - Flashlight controls with +/- buttons and sliders
 * - Target color matching
 * - 6 levels with increasing precision (1-6 steps)
 * - GCompris-style UI with dark background
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class ColorMixGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'ColorMixGame' });
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
        
        // Load color_mix assets (RGB flashlight mode)
        this.load.svg('bg-light', 'assets/color_mix/background.svg');
        this.load.svg('flashlight-red', 'assets/color_mix/flashlight-red.svg');
        this.load.svg('flashlight-green', 'assets/color_mix/flashlight-green.svg');
        this.load.svg('flashlight-blue', 'assets/color_mix/flashlight-blue.svg');
        this.load.svg('light-r', 'assets/color_mix/light-r.svg');
        this.load.svg('light-g', 'assets/color_mix/light-g.svg');
        this.load.svg('light-b', 'assets/color_mix/light-b.svg');
        this.load.svg('flashlight2-r', 'assets/color_mix/flashlight2-r.svg');
        this.load.svg('flashlight2-g', 'assets/color_mix/flashlight2-g.svg');
        this.load.svg('flashlight2-b', 'assets/color_mix/flashlight2-b.svg');
    }

    create() {
        this.gameState = 'ready';
        
        if (typeof this.initializePerformanceOptimizations === 'function') {
            this.initializePerformanceOptimizations();
        }
        
        // Color values (0 to maxSteps)
        this.maxSteps = this.level; // Level 1 = 1 step, Level 6 = 6 steps
        this.targetRed = 0;
        this.targetGreen = 0;
        this.targetBlue = 0;
        this.currentRed = 0;
        this.currentGreen = 0;
        this.currentBlue = 0;
        
        // Store flashlight containers
        this.flashlights = {};
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // GCompris dark background for light mixing
        if (this.textures.exists('bg-light')) {
            const bg = this.add.image(width / 2, height / 2, 'bg-light');
            bg.setDisplaySize(width, height);
            bg.setDepth(-1);
        } else {
            // Fallback: dark gradient
            const bg = this.add.graphics();
            bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
            bg.fillRect(0, 0, width, height);
            bg.setDepth(-1);
        }
    }

    createUI() {
        const { width, height } = this.scale;
        
        // "Match the color" text with target swatch
        this.createTargetDisplay();
        
        // Score badge (top right)
        this.createScoreBadge();
        
        // Central mixing result circle (where lights converge)
        this.createMixingCircle();
        
        // Flashlights around the mixing circle
        this.createFlashlights();
        
        // OK button (right side)
        this.createOkButton();
        
        // Help message area
        this.createHelpMessage();
        
        // GCompris navigation bar
        this.createGComprisNavBar();
    }

    createTargetDisplay() {
        const { width } = this.scale;
        const y = 35;
        
        // "Match the color" text
        this.add.text(width / 2 - 80, y, 'Match the color', {
            fontFamily: 'Fredoka One, Arial Black, sans-serif',
            fontSize: '22px',
            color: '#FFFFFF'
        }).setOrigin(1, 0.5).setDepth(10);
        
        // Target color swatch (rounded rectangle)
        this.targetColorBox = this.add.graphics();
        this.targetColorBox.setDepth(10);
    }

    createScoreBadge() {
        const { width } = this.scale;
        
        // Score background
        const badgeBg = this.add.graphics();
        badgeBg.fillStyle(0xFFFFFF, 0.9);
        badgeBg.lineStyle(2, 0x888888);
        badgeBg.fillRoundedRect(width - 70, 15, 55, 35, 8);
        badgeBg.strokeRoundedRect(width - 70, 15, 55, 35, 8);
        badgeBg.setDepth(10);
        
        // Score text
        this.scoreText = this.add.text(width - 42, 32, '0/6', {
            fontFamily: 'Fredoka One, Arial Black, sans-serif',
            fontSize: '20px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(11);
    }

    createMixingCircle() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height * 0.42;
        const radius = Math.min(width, height) * 0.12;
        
        this.mixCenterX = centerX;
        this.mixCenterY = centerY;
        this.mixRadius = radius;
        
        // Dark circle (where lights mix)
        this.mixColorCircle = this.add.graphics();
        this.mixColorCircle.setDepth(5);
        
        // Light beam graphics (will be updated based on color values)
        this.lightBeams = this.add.graphics();
        this.lightBeams.setDepth(4);
        
        this.updateMixColorDisplay();
    }

    createFlashlights() {
        const { width, height } = this.scale;
        const centerX = this.mixCenterX;
        const centerY = this.mixCenterY;
        const radius = this.mixRadius;
        
        // Flashlight dimensions
        const flashlightHeight = radius * 1.2;
        const flashlightWidth = flashlightHeight * 2;
        
        // Red flashlight (left, pointing right)
        this.flashlights.red = this.createFlashlight(
            centerX - radius - flashlightWidth * 0.6, centerY,
            'flashlight-red', 'light-r', 0xFF0000,
            0, // rotation: pointing right
            (value) => {
                this.currentRed = value;
                this.updateMixColorDisplay();
            }
        );
        
        // Blue flashlight (right, pointing left - rotated 180)
        this.flashlights.blue = this.createFlashlight(
            centerX + radius + flashlightWidth * 0.6, centerY,
            'flashlight-blue', 'light-b', 0x0000FF,
            180, // rotation: pointing left
            (value) => {
                this.currentBlue = value;
                this.updateMixColorDisplay();
            }
        );
        
        // Green flashlight (bottom, pointing up - rotated -90)
        this.flashlights.green = this.createFlashlight(
            centerX, centerY + radius + flashlightHeight * 0.8,
            'flashlight-green', 'light-g', 0x00FF00,
            -90, // rotation: pointing up
            (value) => {
                this.currentGreen = value;
                this.updateMixColorDisplay();
            }
        );
    }

    createFlashlight(x, y, flashlightKey, lightKey, color, rotation, onChange) {
        const flashlightHeight = this.mixRadius * 1.2;
        const flashlightWidth = flashlightHeight * 2;
        
        // Container for the flashlight
        const container = this.add.container(x, y);
        container.setDepth(10);
        
        // Flashlight image or fallback graphic
        let flashlightGraphic;
        if (this.textures.exists(flashlightKey)) {
            flashlightGraphic = this.add.image(0, 0, flashlightKey);
            flashlightGraphic.setDisplaySize(flashlightWidth, flashlightHeight);
        } else {
            // Fallback: draw flashlight programmatically
            flashlightGraphic = this.add.graphics();
            flashlightGraphic.fillStyle(0x444444, 1);
            flashlightGraphic.fillRoundedRect(-flashlightWidth / 2, -flashlightHeight / 2, flashlightWidth, flashlightHeight, 10);
            // Lens
            flashlightGraphic.fillStyle(color, 0.7);
            flashlightGraphic.fillCircle(flashlightWidth / 2 - 10, 0, flashlightHeight / 3);
            flashlightGraphic.lineStyle(3, 0x333333);
            flashlightGraphic.strokeRoundedRect(-flashlightWidth / 2, -flashlightHeight / 2, flashlightWidth, flashlightHeight, 10);
        }
        container.add(flashlightGraphic);
        
        // Slider area (inside flashlight body)
        const sliderWidth = flashlightWidth * 0.5;
        const sliderHeight = flashlightHeight * 0.4;
        const sliderX = -sliderWidth / 2 - flashlightWidth * 0.1;
        const sliderY = -sliderHeight / 2;
        
        // Slider track background
        const sliderTrack = this.add.graphics();
        sliderTrack.fillStyle(0x222222, 0.8);
        sliderTrack.lineStyle(2, 0x555555);
        sliderTrack.fillRoundedRect(sliderX, sliderY, sliderWidth, sliderHeight, 5);
        sliderTrack.strokeRoundedRect(sliderX, sliderY, sliderWidth, sliderHeight, 5);
        container.add(sliderTrack);
        
        // Slider fill (shows current level)
        const sliderFill = this.add.graphics();
        container.add(sliderFill);
        
        // Slider handle
        const handleWidth = sliderWidth * 0.12;
        const handle = this.add.graphics();
        handle.fillStyle(0x888888, 1);
        handle.fillRoundedRect(-handleWidth / 2, sliderY, handleWidth, sliderHeight, 3);
        container.add(handle);
        
        // Minus button (left side)
        const btnSize = flashlightHeight * 0.35;
        const minusBtn = this.add.circle(-flashlightWidth * 0.38, 0, btnSize / 2, 0x333333);
        minusBtn.setStrokeStyle(2, 0x666666);
        container.add(minusBtn);
        
        const minusText = this.add.text(-flashlightWidth * 0.38, 0, '−', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        container.add(minusText);
        
        // Plus button (right side)  
        const plusBtn = this.add.circle(flashlightWidth * 0.38, 0, btnSize / 2, 0x333333);
        plusBtn.setStrokeStyle(2, 0x666666);
        container.add(plusBtn);
        
        const plusText = this.add.text(flashlightWidth * 0.38, 0, '+', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        container.add(plusText);
        
        // Rotate entire container
        container.setAngle(rotation);
        
        // State
        let currentValue = 0;
        
        const updateSlider = (value) => {
            currentValue = Math.max(0, Math.min(this.maxSteps, value));
            
            // Update slider fill
            const fillRatio = currentValue / this.maxSteps;
            sliderFill.clear();
            if (fillRatio > 0) {
                sliderFill.fillStyle(color, 0.6);
                const fillWidth = sliderWidth * fillRatio;
                sliderFill.fillRoundedRect(sliderX + sliderWidth - fillWidth, sliderY + 2, fillWidth - 2, sliderHeight - 4, 3);
            }
            
            // Update handle position
            const handleX = sliderX + sliderWidth - (sliderWidth * fillRatio) - handleWidth / 2;
            handle.clear();
            handle.fillStyle(0x888888, 1);
            handle.fillRoundedRect(handleX, sliderY, handleWidth, sliderHeight, 3);
            
            onChange(currentValue);
        };
        
        // Create invisible hit areas at screen positions (accounting for rotation)
        const screenMinus = this.getRotatedPosition(x, y, -flashlightWidth * 0.38, 0, rotation);
        const screenPlus = this.getRotatedPosition(x, y, flashlightWidth * 0.38, 0, rotation);
        
        const minusHit = this.add.circle(screenMinus.x, screenMinus.y, btnSize / 2, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(15);
        
        const plusHit = this.add.circle(screenPlus.x, screenPlus.y, btnSize / 2, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(15);
        
        minusHit.on('pointerdown', () => {
            updateSlider(currentValue - 1);
            this.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 50,
                yoyo: true
            });
        });
        
        plusHit.on('pointerdown', () => {
            updateSlider(currentValue + 1);
            this.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 50,
                yoyo: true
            });
        });
        
        return {
            container,
            setValue: updateSlider,
            getValue: () => currentValue,
            minusHit,
            plusHit
        };
    }

    getRotatedPosition(cx, cy, localX, localY, angleDeg) {
        const angleRad = Phaser.Math.DegToRad(angleDeg);
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        return {
            x: cx + localX * cos - localY * sin,
            y: cy + localX * sin + localY * cos
        };
    }

    createOkButton() {
        const { width, height } = this.scale;
        const x = width - 60;
        const y = height * 0.45;
        const radius = 35;
        
        // Green OK circle
        const okBtn = this.add.circle(x, y, radius, 0x4CAF50);
        okBtn.setStrokeStyle(4, 0xFFFFFF);
        okBtn.setInteractive({ useHandCursor: true });
        okBtn.setDepth(10);
        
        // Shadow
        this.add.circle(x + 2, y + 3, radius, 0x000000, 0.3).setDepth(9);
        
        // OK text
        const okText = this.add.text(x, y, 'OK', {
            fontFamily: 'Fredoka One, Arial Black, sans-serif',
            fontSize: '28px',
            color: '#FFFFFF',
            stroke: '#2E7D32',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(11);
        
        okBtn.on('pointerover', () => {
            okBtn.setScale(1.1);
            okText.setScale(1.1);
        });
        
        okBtn.on('pointerout', () => {
            okBtn.setScale(1);
            okText.setScale(1);
        });
        
        okBtn.on('pointerdown', () => {
            this.tweens.add({
                targets: [okBtn, okText],
                scale: 0.9,
                duration: 100,
                yoyo: true
            });
            this.checkAnswer();
        });
    }

    createHelpMessage() {
        const { width, height } = this.scale;
        
        // Help message background
        this.helpBg = this.add.graphics();
        this.helpBg.setDepth(14);
        this.helpBg.setVisible(false);
        
        // Help message text
        this.helpText = this.add.text(width / 2, height * 0.72, '', {
            fontFamily: 'Fredoka One, Arial, sans-serif',
            fontSize: '18px',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: width * 0.5 }
        }).setOrigin(0.5).setDepth(15);
    }

    showHelpMessage(message) {
        const { width, height } = this.scale;
        
        if (message) {
            this.helpText.setText(message);
            const padding = 15;
            const bgWidth = this.helpText.width + padding * 2;
            const bgHeight = this.helpText.height + padding;
            
            this.helpBg.clear();
            this.helpBg.fillStyle(0x000000, 0.7);
            this.helpBg.fillRoundedRect(
                width / 2 - bgWidth / 2,
                height * 0.72 - bgHeight / 2,
                bgWidth, bgHeight, 8
            );
            this.helpBg.setVisible(true);
        } else {
            this.helpText.setText('');
            this.helpBg.setVisible(false);
        }
    }

    createGComprisNavBar() {
        const { width, height } = this.scale;
        const navY = height - 45;
        const spacing = 65;
        let x = 40;
        
        // Menu button (brown)
        this.createGComprisNavButton(x, navY, 0x5D4037, '☰', () => {});
        x += spacing;
        
        // Help button (green)
        this.createGComprisNavButton(x, navY, 0x4CAF50, '?', () => this.showHelp());
        x += spacing;
        
        // Home button (orange)
        this.createGComprisNavButton(x, navY, 0xF57C00, '⌂', () => this.scene.start('GameMenu'));
        x += spacing;
        
        // Previous level
        this.createGComprisNavButton(x, navY, 0xF57C00, '❮', () => {
            if (this.level > 1) {
                this.level--;
                this.restartLevel();
            }
        });
        x += spacing;
        
        // Level number
        this.levelText = this.add.text(x, navY, String(this.level), {
            fontFamily: 'Fredoka One, Arial Black, sans-serif',
            fontSize: '32px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(101);
        x += 50;
        
        // Next level
        this.createGComprisNavButton(x, navY, 0xF57C00, '❯', () => {
            if (this.level < this.maxLevel) {
                this.level++;
                this.restartLevel();
            }
        });
    }

    createGComprisNavButton(x, y, color, symbol, callback) {
        const radius = 25;
        
        // Shadow
        this.add.circle(x + 2, y + 3, radius, 0x000000, 0.3).setDepth(99);
        
        // Button
        const btn = this.add.circle(x, y, radius, color);
        btn.setStrokeStyle(3, 0xFFFFFF);
        btn.setInteractive({ useHandCursor: true });
        btn.setDepth(100);
        
        // Icon
        const icon = this.add.text(x, y, symbol, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(101);
        
        btn.on('pointerover', () => {
            btn.setScale(1.1);
            icon.setScale(1.1);
        });
        
        btn.on('pointerout', () => {
            btn.setScale(1);
            icon.setScale(1);
        });
        
        btn.on('pointerdown', () => {
            this.tweens.add({
                targets: [btn, icon],
                scale: 0.9,
                duration: 100,
                yoyo: true
            });
            callback();
        });
        
        return { btn, icon };
    }

    showHelp() {
        this.showHelpMessage('Adjust the flashlights using + and − buttons to mix light and match the target color!');
        this.time.delayedCall(3000, () => this.showHelpMessage(''));
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
        
        // Reset flashlights
        if (this.flashlights.red) this.flashlights.red.setValue(0);
        if (this.flashlights.green) this.flashlights.green.setValue(0);
        if (this.flashlights.blue) this.flashlights.blue.setValue(0);
        
        // Clear help message
        this.showHelpMessage('');
        
        this.updateTargetColorDisplay();
        this.updateMixColorDisplay();
    }

    // RGB additive color mixing
    rgbToColor(r, g, b) {
        // GCompris formula for RGB additive: direct mapping
        const red = Math.floor((r / this.maxSteps) * 255);
        const green = Math.floor((g / this.maxSteps) * 255);
        const blue = Math.floor((b / this.maxSteps) * 255);
        
        return (red << 16) | (green << 8) | blue;
    }

    updateTargetColorDisplay() {
        const { width } = this.scale;
        const color = this.rgbToColor(this.targetRed, this.targetGreen, this.targetBlue);
        
        // Target swatch next to "Match the color" text
        const swatchX = width / 2 - 60;
        const swatchY = 20;
        const swatchW = 90;
        const swatchH = 30;
        
        this.targetColorBox.clear();
        this.targetColorBox.fillStyle(color, 1);
        this.targetColorBox.lineStyle(2, 0xFFFFFF);
        this.targetColorBox.fillRoundedRect(swatchX, swatchY, swatchW, swatchH, 6);
        this.targetColorBox.strokeRoundedRect(swatchX, swatchY, swatchW, swatchH, 6);
    }

    updateMixColorDisplay() {
        const color = this.rgbToColor(this.currentRed, this.currentGreen, this.currentBlue);
        
        // Draw light beams from flashlights to center
        this.drawLightBeams();
        
        this.mixColorCircle.clear();
        
        // Circle border
        this.mixColorCircle.lineStyle(3, 0x666666);
        this.mixColorCircle.strokeCircle(this.mixCenterX, this.mixCenterY, this.mixRadius);
        
        // Mixed color fill
        this.mixColorCircle.fillStyle(color, 1);
        this.mixColorCircle.fillCircle(this.mixCenterX, this.mixCenterY, this.mixRadius - 3);
    }

    drawLightBeams() {
        this.lightBeams.clear();
        
        const centerX = this.mixCenterX;
        const centerY = this.mixCenterY;
        const radius = this.mixRadius;
        
        // Red beam from left
        if (this.currentRed > 0) {
            const intensity = this.currentRed / this.maxSteps;
            this.lightBeams.fillStyle(0xFF0000, intensity * 0.5);
            this.lightBeams.fillTriangle(
                centerX - radius * 2, centerY - radius * 0.5,
                centerX - radius * 2, centerY + radius * 0.5,
                centerX, centerY
            );
        }
        
        // Blue beam from right
        if (this.currentBlue > 0) {
            const intensity = this.currentBlue / this.maxSteps;
            this.lightBeams.fillStyle(0x0000FF, intensity * 0.5);
            this.lightBeams.fillTriangle(
                centerX + radius * 2, centerY - radius * 0.5,
                centerX + radius * 2, centerY + radius * 0.5,
                centerX, centerY
            );
        }
        
        // Green beam from bottom
        if (this.currentGreen > 0) {
            const intensity = this.currentGreen / this.maxSteps;
            this.lightBeams.fillStyle(0x00FF00, intensity * 0.5);
            this.lightBeams.fillTriangle(
                centerX - radius * 0.5, centerY + radius * 2,
                centerX + radius * 0.5, centerY + radius * 2,
                centerX, centerY
            );
        }
    }

    checkAnswer() {
        const isCorrect = 
            this.currentRed === this.targetRed &&
            this.currentGreen === this.targetGreen &&
            this.currentBlue === this.targetBlue;
        
        if (isCorrect) {
            this.showHelpMessage('');
            this.showFeedback(true);
            this.subLevel++;
            this.updateScore();
            
            if (this.subLevel >= this.maxSubLevels) {
                this.time.delayedCall(800, () => this.handleLevelComplete());
            } else {
                this.time.delayedCall(800, () => {
                    this.generateTargetColor();
                });
            }
        } else {
            this.showFeedback(false);
            this.showColorHints();
        }
    }

    showColorHints() {
        const hints = [];
        
        if (this.currentRed < this.targetRed) {
            hints.push('Not enough red');
        } else if (this.currentRed > this.targetRed) {
            hints.push('Too much red');
        }
        
        if (this.currentGreen < this.targetGreen) {
            hints.push('Not enough green');
        } else if (this.currentGreen > this.targetGreen) {
            hints.push('Too much green');
        }
        
        if (this.currentBlue < this.targetBlue) {
            hints.push('Not enough blue');
        } else if (this.currentBlue > this.targetBlue) {
            hints.push('Too much blue');
        }
        
        this.showHelpMessage(hints.join('\n'));
    }

    showFeedback(correct) {
        if (correct) {
            const check = this.add.text(this.mixCenterX, this.mixCenterY, '✓', {
                fontSize: '60px',
                color: '#4CAF50',
                stroke: '#FFFFFF',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(20);
            
            this.tweens.add({
                targets: check,
                scale: { from: 0.5, to: 1.3 },
                alpha: { from: 1, to: 0 },
                duration: 600,
                ease: 'Power2',
                onComplete: () => check.destroy()
            });
            
            if (this.audioManager) {
                this.audioManager.playSound('correct');
            }
        } else {
            const wrong = this.add.text(this.mixCenterX, this.mixCenterY, '✗', {
                fontSize: '50px',
                color: '#F44336',
                stroke: '#FFFFFF',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(20);
            
            this.tweens.add({
                targets: wrong,
                alpha: { from: 1, to: 0 },
                duration: 600,
                ease: 'Power2',
                onComplete: () => wrong.destroy()
            });
        }
    }

    updateScore() {
        this.scoreText.setText(`${this.subLevel}/${this.maxSubLevels}`);
    }

    handleLevelComplete() {
        const { width, height } = this.scale;
        
        if (this.level < this.maxLevel) {
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setDepth(50);
            
            const message = this.add.text(width / 2, height / 2 - 30, '💡 Level Complete!', {
                fontFamily: 'Fredoka One, Arial Black, sans-serif',
                fontSize: '36px',
                color: '#4CAF50',
                stroke: '#FFFFFF',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(51);
            
            const nextBtn = this.add.text(width / 2, height / 2 + 40, 'Next Level →', {
                fontFamily: 'Fredoka One, Arial, sans-serif',
                fontSize: '24px',
                color: '#FFFFFF',
                backgroundColor: '#0062FF',
                padding: { x: 25, y: 12 }
            }).setOrigin(0.5).setDepth(51).setInteractive({ useHandCursor: true });
            
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
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
            .setDepth(50);
        
        const message = this.add.text(width / 2, height / 2 - 40, '🏆 Light Mixing Master! 🏆', {
            fontFamily: 'Fredoka One, Arial Black, sans-serif',
            fontSize: '32px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(51);
        
        const subText = this.add.text(width / 2, height / 2 + 10, 'You completed all levels!', {
            fontFamily: 'Fredoka One, Arial, sans-serif',
            fontSize: '22px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(51);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 70, 'Back to Menu', {
            fontFamily: 'Fredoka One, Arial, sans-serif',
            fontSize: '22px',
            color: '#FFFFFF',
            backgroundColor: '#5D4037',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5).setDepth(51).setInteractive({ useHandCursor: true });
        
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
