/**
 * ColorMixLightGame - Mixing light colors (additive)
 * 
 * Adapted from GCompris color_mix_light activity
 * 
 * Features:
 * - Additive color mixing (RGB - Red, Green, Blue)
 * - Slider controls for each primary color
 * - Target color matching
 * - 6 levels with increasing precision
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
        
        // Dark background (like a dark room for light mixing)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
        
        // Screen/projection area
        bg.fillStyle(0x0f0f0f, 1);
        bg.fillRoundedRect(width * 0.3, height * 0.08, width * 0.4, height * 0.35, 10);
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Title
        this.add.text(width / 2, 25, 'Mix Light Colors', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);
        
        // Instructions
        this.instructionText = this.add.text(width / 2, height * 0.48, 'Match the target color!', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ecf0f1'
        }).setOrigin(0.5).setDepth(10);
        
        // Score display
        this.scoreText = this.add.text(width - 20, 20, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(1, 0).setDepth(10);
        
        // Create color displays
        this.createColorDisplays();
        
        // Create sliders
        this.createSliders();
        
        // Create OK button
        this.createOkButton();
        
        // Create navigation
        this.createNavigationDock();
    }

    createColorDisplays() {
        const { width, height } = this.scale;
        
        // Target color display
        this.add.text(width * 0.35, height * 0.12, 'Target', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);
        
        this.targetColorBox = this.add.graphics();
        this.targetColorBox.setDepth(5);
        this.updateTargetColorDisplay();
        
        // Your mix display
        this.add.text(width * 0.65, height * 0.12, 'Your Mix', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);
        
        this.mixColorBox = this.add.graphics();
        this.mixColorBox.setDepth(5);
        this.updateMixColorDisplay();
    }

    createSliders() {
        const { width, height } = this.scale;
        const sliderY = height * 0.58;
        const sliderSpacing = width * 0.28;
        const startX = width * 0.22;
        
        // Red slider (flashlight style)
        this.redSlider = this.createFlashlightSlider(
            startX, sliderY, 0xF44336, 'Red',
            (value) => {
                this.currentRed = value;
                this.updateMixColorDisplay();
            }
        );
        
        // Green slider
        this.greenSlider = this.createFlashlightSlider(
            startX + sliderSpacing, sliderY, 0x4CAF50, 'Green',
            (value) => {
                this.currentGreen = value;
                this.updateMixColorDisplay();
            }
        );
        
        // Blue slider
        this.blueSlider = this.createFlashlightSlider(
            startX + sliderSpacing * 2, sliderY, 0x2196F3, 'Blue',
            (value) => {
                this.currentBlue = value;
                this.updateMixColorDisplay();
            }
        );
    }

    createFlashlightSlider(x, y, color, label, onChange) {
        const sliderHeight = 150;
        const flashlightWidth = 45;
        
        // Flashlight body
        const flashlight = this.add.graphics();
        flashlight.fillStyle(0x424242, 1);
        flashlight.fillRoundedRect(x - flashlightWidth / 2, y - 30, flashlightWidth, sliderHeight + 60, 8);
        
        // Flashlight lens (colored glow area)
        flashlight.fillStyle(color, 0.3);
        flashlight.fillCircle(x, y - 15, flashlightWidth / 2 - 2);
        flashlight.setDepth(2);
        
        // Light beam effect
        const beam = this.add.graphics();
        beam.setDepth(1);
        
        // Label
        this.add.text(x, y + sliderHeight + 45, label, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);
        
        // Slider track
        const track = this.add.graphics();
        track.fillStyle(0x333333, 0.8);
        track.fillRect(x - 4, y + 10, 8, sliderHeight - 20);
        track.setDepth(3);
        
        // Value display
        const valueText = this.add.text(x, y + sliderHeight + 20, '0', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);
        
        // Slider handle (light intensity control)
        const handle = this.add.circle(x, y + sliderHeight - 10, 15, 0xffffff)
            .setInteractive({ useHandCursor: true, draggable: true })
            .setDepth(5);
        
        handle.setStrokeStyle(2, color);
        
        // Plus/Minus buttons
        const minusBtn = this.add.circle(x - 28, y + sliderHeight / 2, 14, 0xf44336)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);
        this.add.text(x - 28, y + sliderHeight / 2, '-', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(6);
        
        const plusBtn = this.add.circle(x + 28, y + sliderHeight / 2, 14, 0x4CAF50)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);
        this.add.text(x + 28, y + sliderHeight / 2, '+', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(6);
        
        let currentValue = 0;
        
        const updateSlider = (value) => {
            currentValue = Math.max(0, Math.min(this.maxSteps, value));
            const handleY = y + sliderHeight - 10 - (currentValue / this.maxSteps) * (sliderHeight - 30);
            handle.setY(handleY);
            valueText.setText(String(currentValue));
            
            // Update beam brightness
            beam.clear();
            if (currentValue > 0) {
                const alpha = currentValue / this.maxSteps * 0.4;
                beam.fillStyle(color, alpha);
                beam.fillTriangle(
                    x - 30, y - 10,
                    x + 30, y - 10,
                    x, y - 80
                );
            }
            
            onChange(currentValue);
        };
        
        // Drag handling
        handle.on('drag', (pointer, dragX, dragY) => {
            const minY = y + 20;
            const maxY = y + sliderHeight - 10;
            const clampedY = Math.max(minY, Math.min(maxY, dragY));
            const value = Math.round((1 - (clampedY - minY) / (maxY - minY)) * this.maxSteps);
            updateSlider(value);
        });
        
        // Button clicks
        minusBtn.on('pointerdown', () => updateSlider(currentValue - 1));
        plusBtn.on('pointerdown', () => updateSlider(currentValue + 1));
        
        return {
            setValue: updateSlider,
            getValue: () => currentValue
        };
    }

    createOkButton() {
        const { width, height } = this.scale;
        
        const okBtn = this.add.graphics();
        okBtn.fillStyle(0x4CAF50, 1);
        okBtn.fillRoundedRect(width / 2 - 60, height * 0.82, 120, 50, 12);
        okBtn.setDepth(10);
        
        const okText = this.add.text(width / 2, height * 0.82 + 25, 'OK ✓', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11);
        
        const hitArea = this.add.rectangle(width / 2, height * 0.82 + 25, 120, 50, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(12);
        
        hitArea.on('pointerover', () => {
            okBtn.clear();
            okBtn.fillStyle(0x66BB6A, 1);
            okBtn.fillRoundedRect(width / 2 - 60, height * 0.82, 120, 50, 12);
        });
        
        hitArea.on('pointerout', () => {
            okBtn.clear();
            okBtn.fillStyle(0x4CAF50, 1);
            okBtn.fillRoundedRect(width / 2 - 60, height * 0.82, 120, 50, 12);
        });
        
        hitArea.on('pointerdown', () => this.checkAnswer());
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const buttonSize = 45;
        const padding = 10;
        const y = height - buttonSize / 2 - 10;
        
        let x = 40;
        
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
        this.levelText = this.add.text(x + 15, y, String(this.level), {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        x += 45;
        
        // Next level
        this.createNavButton(x, y, 0xeeeeee, '❯', () => {
            if (this.level < this.maxLevel) {
                this.level++;
                this.restartLevel();
            }
        }, '#333333');
        x += buttonSize + padding;
        
        // Restart
        this.createNavButton(x, y, 0x26c6da, '↻', () => {
            this.restartLevel();
        });
    }
    
    createNavButton(x, y, color, icon, callback, textColor = '#ffffff') {
        const button = this.add.circle(x, y, 20, color)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        
        this.add.circle(x, y + 2, 20, 0x000000, 0.3).setDepth(9);
        
        const text = this.add.text(x, y, icon, {
            fontFamily: 'Arial',
            fontSize: '18px',
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
        
        // Reset sliders
        if (this.redSlider) this.redSlider.setValue(0);
        if (this.greenSlider) this.greenSlider.setValue(0);
        if (this.blueSlider) this.blueSlider.setValue(0);
        
        this.updateTargetColorDisplay();
        this.updateMixColorDisplay();
    }

    // RGB additive color mixing
    rgbToColor(r, g, b) {
        // Normalize to 0-255 range
        const red = Math.floor((r / this.maxSteps) * 255);
        const green = Math.floor((g / this.maxSteps) * 255);
        const blue = Math.floor((b / this.maxSteps) * 255);
        
        return (red << 16) | (green << 8) | blue;
    }

    updateTargetColorDisplay() {
        const { width, height } = this.scale;
        const color = this.rgbToColor(this.targetRed, this.targetGreen, this.targetBlue);
        
        this.targetColorBox.clear();
        this.targetColorBox.fillStyle(color, 1);
        this.targetColorBox.lineStyle(3, 0xffffff, 1);
        this.targetColorBox.fillRoundedRect(width * 0.35 - 50, height * 0.18, 100, 100, 10);
        this.targetColorBox.strokeRoundedRect(width * 0.35 - 50, height * 0.18, 100, 100, 10);
        
        // Add glow effect for light
        this.targetColorBox.lineStyle(8, color, 0.3);
        this.targetColorBox.strokeRoundedRect(width * 0.35 - 54, height * 0.18 - 4, 108, 108, 12);
    }

    updateMixColorDisplay() {
        const { width, height } = this.scale;
        const color = this.rgbToColor(this.currentRed, this.currentGreen, this.currentBlue);
        
        this.mixColorBox.clear();
        this.mixColorBox.fillStyle(color, 1);
        this.mixColorBox.lineStyle(3, 0xffffff, 1);
        this.mixColorBox.fillRoundedRect(width * 0.65 - 50, height * 0.18, 100, 100, 10);
        this.mixColorBox.strokeRoundedRect(width * 0.65 - 50, height * 0.18, 100, 100, 10);
        
        // Add glow effect
        this.mixColorBox.lineStyle(8, color, 0.3);
        this.mixColorBox.strokeRoundedRect(width * 0.65 - 54, height * 0.18 - 4, 108, 108, 12);
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
            const check = this.add.text(width / 2, height * 0.3, '✓', {
                fontSize: '80px',
                color: '#4CAF50'
            }).setOrigin(0.5).setDepth(20);
            
            this.tweens.add({
                targets: check,
                scale: { from: 0.5, to: 1.2 },
                alpha: { from: 1, to: 0 },
                duration: 600,
                ease: 'Power2',
                onComplete: () => check.destroy()
            });
        } else {
            const wrong = this.add.text(width / 2, height * 0.3, '✗', {
                fontSize: '60px',
                color: '#F44336'
            }).setOrigin(0.5).setDepth(20);
            
            this.tweens.add({
                targets: wrong,
                alpha: { from: 1, to: 0 },
                duration: 600,
                ease: 'Power2',
                onComplete: () => wrong.destroy()
            });
            
            this.instructionText.setText('Adjust the light intensity!');
            this.time.delayedCall(1500, () => {
                this.instructionText.setText('Match the target color!');
            });
        }
    }

    updateScore() {
        this.scoreText.setText(`${this.subLevel + 1}/${this.maxSubLevels}`);
    }

    handleLevelComplete() {
        const { width, height } = this.scale;
        
        if (this.level < this.maxLevel) {
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setDepth(20);
            
            const message = this.add.text(width / 2, height / 2 - 30, '💡 Level Complete!', {
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
            .setDepth(20);
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 Light Mixing Expert! 🏆', {
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
        this.subLevel = 0;
        this.maxSteps = this.level;
        this.scene.restart({ level: this.level });
    }
}
