/**
 * ColorMixPaintGame - Mixing paint colors (subtractive)
 * 
 * Adapted from GCompris color_mix activity
 * 
 * Features:
 * - Subtractive color mixing (CMY - Cyan, Magenta, Yellow)
 * - Paint tube controls with +/- buttons and sliders
 * - Target color matching
 * - 6 levels with increasing precision (1-6 steps)
 * - GCompris-style UI with icy background
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class ColorMixPaintGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'ColorMixPaintGame' });
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
        
        // Load color_mix assets
        this.load.svg('bg-paint', 'assets/color_mix/background2.svg');
        this.load.svg('tube-magenta', 'assets/color_mix/tube-magenta.svg');
        this.load.svg('tube-yellow', 'assets/color_mix/tube-yellow.svg');
        this.load.svg('tube-cyan', 'assets/color_mix/tube-cyan.svg');
        this.load.svg('brush-m', 'assets/color_mix/brush-m.svg');
        this.load.svg('brush-y', 'assets/color_mix/brush-y.svg');
        this.load.svg('brush-c', 'assets/color_mix/brush-c.svg');
        this.load.svg('plus', 'assets/color_mix/plus.svg');
        this.load.svg('minus', 'assets/color_mix/minus.svg');
    }

    create() {
        this.gameState = 'ready';
        
        if (typeof this.initializePerformanceOptimizations === 'function') {
            this.initializePerformanceOptimizations();
        }
        
        // Color values (0 to maxSteps)
        this.maxSteps = this.level; // Level 1 = 1 step, Level 6 = 6 steps
        this.targetMagenta = 0;
        this.targetYellow = 0;
        this.targetCyan = 0;
        this.currentMagenta = 0;
        this.currentYellow = 0;
        this.currentCyan = 0;
        
        // Store tube containers for updates
        this.tubes = {};
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // GCompris icy background
        if (this.textures.exists('bg-paint')) {
            const bg = this.add.image(width / 2, height / 2, 'bg-paint');
            bg.setDisplaySize(width, height);
            bg.setDepth(-1);
        } else {
            // Fallback: light blue gradient
            const bg = this.add.graphics();
            bg.fillGradientStyle(0xB3E5FC, 0xB3E5FC, 0xE1F5FE, 0xE1F5FE, 1);
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
        
        // Central mixing result circle
        this.createMixingCircle();
        
        // Paint tubes around the mixing circle
        this.createPaintTubes();
        
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
            color: '#333333'
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
        
        // White circle with border (mixing result)
        this.mixColorCircle = this.add.graphics();
        this.mixColorCircle.setDepth(5);
        this.updateMixColorDisplay();
    }

    createPaintTubes() {
        const { width, height } = this.scale;
        const centerX = this.mixCenterX;
        const centerY = this.mixCenterY;
        const radius = this.mixRadius;
        
        // Tube dimensions
        const tubeHeight = radius * 1.5;
        const tubeWidth = tubeHeight * 2;
        
        // Magenta tube (left, pointing right)
        this.tubes.magenta = this.createPaintTube(
            centerX - radius - tubeWidth * 0.6, centerY,
            'tube-magenta', 'brush-m', 0xE91E63,
            0, // rotation: pointing right
            (value) => {
                this.currentMagenta = value;
                this.updateMixColorDisplay();
                this.updateBrushDisplay('magenta');
            }
        );
        
        // Cyan tube (right, pointing left - rotated 180)
        this.tubes.cyan = this.createPaintTube(
            centerX + radius + tubeWidth * 0.6, centerY,
            'tube-cyan', 'brush-c', 0x00BCD4,
            180, // rotation: pointing left
            (value) => {
                this.currentCyan = value;
                this.updateMixColorDisplay();
                this.updateBrushDisplay('cyan');
            }
        );
        
        // Yellow tube (bottom, pointing up - rotated -90)
        this.tubes.yellow = this.createPaintTube(
            centerX, centerY + radius + tubeHeight * 0.8,
            'tube-yellow', 'brush-y', 0xFFEB3B,
            -90, // rotation: pointing up
            (value) => {
                this.currentYellow = value;
                this.updateMixColorDisplay();
                this.updateBrushDisplay('yellow');
            }
        );
    }

    createPaintTube(x, y, tubeKey, brushKey, color, rotation, onChange) {
        const { width, height } = this.scale;
        const tubeHeight = this.mixRadius * 1.2;
        const tubeWidth = tubeHeight * 2;
        
        // Container for the tube
        const container = this.add.container(x, y);
        container.setDepth(10);
        
        // Tube image or fallback graphic
        let tubeGraphic;
        if (this.textures.exists(tubeKey)) {
            tubeGraphic = this.add.image(0, 0, tubeKey);
            tubeGraphic.setDisplaySize(tubeWidth, tubeHeight);
        } else {
            // Fallback: draw tube programmatically
            tubeGraphic = this.add.graphics();
            tubeGraphic.fillStyle(color, 1);
            tubeGraphic.fillRoundedRect(-tubeWidth / 2, -tubeHeight / 2, tubeWidth, tubeHeight, 10);
            tubeGraphic.lineStyle(3, 0x333333);
            tubeGraphic.strokeRoundedRect(-tubeWidth / 2, -tubeHeight / 2, tubeWidth, tubeHeight, 10);
        }
        container.add(tubeGraphic);
        
        // Slider area (inside tube)
        const sliderWidth = tubeWidth * 0.5;
        const sliderHeight = tubeHeight * 0.4;
        const sliderX = -sliderWidth / 2;
        const sliderY = -sliderHeight / 2;
        
        // Slider track background
        const sliderTrack = this.add.graphics();
        sliderTrack.fillStyle(0xFFFFFF, 0.8);
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
        handle.fillStyle(0x535353, 1);
        handle.fillRoundedRect(-handleWidth / 2, sliderY, handleWidth, sliderHeight, 3);
        container.add(handle);
        
        // Minus button (left side)
        const btnSize = tubeHeight * 0.35;
        const minusBtn = this.add.circle(-tubeWidth * 0.38, 0, btnSize / 2, 0xFFFFFF);
        minusBtn.setStrokeStyle(2, 0x555555);
        container.add(minusBtn);
        
        const minusText = this.add.text(-tubeWidth * 0.38, 0, '−', {
            fontSize: '24px',
            color: '#333333',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        container.add(minusText);
        
        // Plus button (right side)
        const plusBtn = this.add.circle(tubeWidth * 0.38, 0, btnSize / 2, 0xFFFFFF);
        plusBtn.setStrokeStyle(2, 0x555555);
        container.add(plusBtn);
        
        const plusText = this.add.text(tubeWidth * 0.38, 0, '+', {
            fontSize: '24px',
            color: '#333333',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        container.add(plusText);
        
        // Brush (paint coming out) - starts invisible
        let brush = null;
        if (this.textures.exists(brushKey)) {
            brush = this.add.image(tubeWidth * 0.55, 0, brushKey);
            brush.setDisplaySize(tubeHeight * 0.4, tubeHeight * 0.4);
            brush.setVisible(false);
            container.add(brush);
        }
        
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
            handle.fillStyle(0x535353, 1);
            handle.fillRoundedRect(handleX, sliderY, handleWidth, sliderHeight, 3);
            
            // Update brush visibility
            if (brush) {
                brush.setVisible(currentValue > 0);
                const brushScale = 0.3 + (fillRatio * 0.7);
                brush.setScale(brushScale);
            }
            
            onChange(currentValue);
        };
        
        // Make buttons interactive (need to account for rotation)
        // Create invisible hit areas at screen positions
        const screenMinus = this.getRotatedPosition(x, y, -tubeWidth * 0.38, 0, rotation);
        const screenPlus = this.getRotatedPosition(x, y, tubeWidth * 0.38, 0, rotation);
        
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

    updateBrushDisplay(color) {
        // Brush visibility is handled in createPaintTube
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
            color: '#333333',
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
            this.helpBg.fillStyle(0xFFFFFF, 0.85);
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
        const buttonSize = 55;
        const spacing = 65;
        let x = 40;
        
        // Menu/hamburger button (brown)
        this.createGComprisNavButton(x, navY, 0x5D4037, '☰', () => {});
        x += spacing;
        
        // Help button (green with ?)
        this.createGComprisNavButton(x, navY, 0x4CAF50, '?', () => this.showHelp());
        x += spacing;
        
        // Home button (orange with house)
        this.createGComprisNavButton(x, navY, 0xF57C00, '⌂', () => this.scene.start('GameMenu'));
        x += spacing;
        
        // Previous level (orange <)
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
            color: '#5D4037'
        }).setOrigin(0.5).setDepth(101);
        x += 50;
        
        // Next level (orange >)
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
        this.showHelpMessage('Adjust the paint tubes using + and − buttons to match the target color!');
        this.time.delayedCall(3000, () => this.showHelpMessage(''));
    }

    setupGameLogic() {
        this.generateTargetColor();
        this.updateScore();
    }

    generateTargetColor() {
        // Generate random target color
        this.targetMagenta = Math.floor(Math.random() * (this.maxSteps + 1));
        this.targetYellow = Math.floor(Math.random() * (this.maxSteps + 1));
        this.targetCyan = Math.floor(Math.random() * (this.maxSteps + 1));
        
        // Reset current values
        this.currentMagenta = 0;
        this.currentYellow = 0;
        this.currentCyan = 0;
        
        // Reset tubes
        if (this.tubes.magenta) this.tubes.magenta.setValue(0);
        if (this.tubes.yellow) this.tubes.yellow.setValue(0);
        if (this.tubes.cyan) this.tubes.cyan.setValue(0);
        
        // Clear help message
        this.showHelpMessage('');
        
        this.updateTargetColorDisplay();
        this.updateMixColorDisplay();
    }

    // CMY to RGB conversion (subtractive color mixing)
    cmyToRgb(m, y, c) {
        // GCompris formula: RGB = (1-C, 1-M, 1-Y)
        // Note: In GCompris, color1=magenta, color2=yellow, color3=cyan
        const magenta = m / this.maxSteps;
        const yellow = y / this.maxSteps;
        const cyan = c / this.maxSteps;
        
        // Subtractive mixing
        const r = Math.floor((1 - cyan) * 255);
        const g = Math.floor((1 - magenta) * 255);
        const b = Math.floor((1 - yellow) * 255);
        
        return (r << 16) | (g << 8) | b;
    }

    updateTargetColorDisplay() {
        const { width } = this.scale;
        const color = this.cmyToRgb(this.targetMagenta, this.targetYellow, this.targetCyan);
        
        // Target swatch next to "Match the color" text
        const swatchX = width / 2 - 60;
        const swatchY = 20;
        const swatchW = 90;
        const swatchH = 30;
        
        this.targetColorBox.clear();
        this.targetColorBox.fillStyle(color, 1);
        this.targetColorBox.lineStyle(2, 0x888888);
        this.targetColorBox.fillRoundedRect(swatchX, swatchY, swatchW, swatchH, 6);
        this.targetColorBox.strokeRoundedRect(swatchX, swatchY, swatchW, swatchH, 6);
    }

    updateMixColorDisplay() {
        const color = this.cmyToRgb(this.currentMagenta, this.currentYellow, this.currentCyan);
        
        this.mixColorCircle.clear();
        
        // White background circle
        this.mixColorCircle.fillStyle(0xFFFFFF, 1);
        this.mixColorCircle.lineStyle(3, 0x888888);
        this.mixColorCircle.fillCircle(this.mixCenterX, this.mixCenterY, this.mixRadius);
        this.mixColorCircle.strokeCircle(this.mixCenterX, this.mixCenterY, this.mixRadius);
        
        // Color overlay
        this.mixColorCircle.fillStyle(color, 1);
        this.mixColorCircle.fillCircle(this.mixCenterX, this.mixCenterY, this.mixRadius - 3);
    }

    checkAnswer() {
        const isCorrect = 
            this.currentMagenta === this.targetMagenta &&
            this.currentYellow === this.targetYellow &&
            this.currentCyan === this.targetCyan;
        
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
        
        if (this.currentMagenta < this.targetMagenta) {
            hints.push('Not enough magenta');
        } else if (this.currentMagenta > this.targetMagenta) {
            hints.push('Too much magenta');
        }
        
        if (this.currentYellow < this.targetYellow) {
            hints.push('Not enough yellow');
        } else if (this.currentYellow > this.targetYellow) {
            hints.push('Too much yellow');
        }
        
        if (this.currentCyan < this.targetCyan) {
            hints.push('Not enough cyan');
        } else if (this.currentCyan > this.targetCyan) {
            hints.push('Too much cyan');
        }
        
        this.showHelpMessage(hints.join('\n'));
    }

    showFeedback(correct) {
        const { width, height } = this.scale;
        
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
            
            // Play success sound if available
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
            
            const message = this.add.text(width / 2, height / 2 - 30, '🎨 Level Complete!', {
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
        
        const message = this.add.text(width / 2, height / 2 - 40, '🏆 Color Mixing Master! 🏆', {
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
