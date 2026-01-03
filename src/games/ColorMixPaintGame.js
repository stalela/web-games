/**
 * ColorMixPaintGame - Mixing paint colors (subtractive)
 * 
 * Adapted from GCompris color_mix activity
 * 
 * Features:
 * - Subtractive color mixing (CMY - Cyan, Magenta, Yellow)
 * - Slider controls for each primary color
 * - Target color matching
 * - 6 levels with increasing precision
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

    create() {
        this.gameState = 'ready';
        
        if (typeof this.initializePerformanceOptimizations === 'function') {
            this.initializePerformanceOptimizations();
        }
        
        // Color values (0 to maxSteps)
        this.maxSteps = this.level; // Level 1 = 1 step (0 or 1), Level 6 = 6 steps
        this.targetCyan = 0;
        this.targetMagenta = 0;
        this.targetYellow = 0;
        this.currentCyan = 0;
        this.currentMagenta = 0;
        this.currentYellow = 0;
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Dark gradient background like a painter's studio
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x2d3436, 0x2d3436, 0x636e72, 0x636e72, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
        
        // Easel/canvas area
        bg.fillStyle(0x4a3728, 1);
        bg.fillRoundedRect(width * 0.3, height * 0.08, width * 0.4, height * 0.35, 10);
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Title
        this.add.text(width / 2, 25, 'Mix Paint Colors', {
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
        
        // Score/sublevel display
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
        
        // Cyan slider (paint tube style)
        this.cyanSlider = this.createPaintTubeSlider(
            startX, sliderY, 0x00BCD4, 'Cyan',
            (value) => {
                this.currentCyan = value;
                this.updateMixColorDisplay();
            }
        );
        
        // Magenta slider
        this.magentaSlider = this.createPaintTubeSlider(
            startX + sliderSpacing, sliderY, 0xE91E63, 'Magenta',
            (value) => {
                this.currentMagenta = value;
                this.updateMixColorDisplay();
            }
        );
        
        // Yellow slider
        this.yellowSlider = this.createPaintTubeSlider(
            startX + sliderSpacing * 2, sliderY, 0xFFEB3B, 'Yellow',
            (value) => {
                this.currentYellow = value;
                this.updateMixColorDisplay();
            }
        );
    }

    createPaintTubeSlider(x, y, color, label, onChange) {
        const sliderHeight = 150;
        const tubeWidth = 50;
        
        // Paint tube body
        const tube = this.add.graphics();
        tube.fillStyle(0x757575, 1);
        tube.fillRoundedRect(x - tubeWidth / 2, y - 20, tubeWidth, sliderHeight + 40, 10);
        
        // Color fill area
        tube.fillStyle(color, 1);
        tube.fillRoundedRect(x - tubeWidth / 2 + 5, y, tubeWidth - 10, sliderHeight, 8);
        tube.setDepth(2);
        
        // Label
        this.add.text(x, y + sliderHeight + 35, label, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);
        
        // Slider track (darker area)
        const track = this.add.graphics();
        track.fillStyle(0x424242, 0.5);
        track.fillRect(x - 5, y, 10, sliderHeight);
        track.setDepth(3);
        
        // Value display
        const valueText = this.add.text(x, y - 35, '0', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);
        
        // Slider handle
        const handle = this.add.circle(x, y + sliderHeight, 18, 0xffffff)
            .setInteractive({ useHandCursor: true, draggable: true })
            .setDepth(5);
        
        handle.setStrokeStyle(3, 0x333333);
        
        // Plus/Minus buttons
        const minusBtn = this.add.circle(x - 30, y + sliderHeight / 2, 15, 0xf44336)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);
        this.add.text(x - 30, y + sliderHeight / 2, '-', {
            fontSize: '24px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(6);
        
        const plusBtn = this.add.circle(x + 30, y + sliderHeight / 2, 15, 0x4CAF50)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);
        this.add.text(x + 30, y + sliderHeight / 2, '+', {
            fontSize: '24px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(6);
        
        let currentValue = 0;
        
        const updateSlider = (value) => {
            currentValue = Math.max(0, Math.min(this.maxSteps, value));
            const handleY = y + sliderHeight - (currentValue / this.maxSteps) * sliderHeight;
            handle.setY(handleY);
            valueText.setText(String(currentValue));
            onChange(currentValue);
        };
        
        // Drag handling
        handle.on('drag', (pointer, dragX, dragY) => {
            const clampedY = Math.max(y, Math.min(y + sliderHeight, dragY));
            const value = Math.round((1 - (clampedY - y) / sliderHeight) * this.maxSteps);
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
        this.targetCyan = Math.floor(Math.random() * (this.maxSteps + 1));
        this.targetMagenta = Math.floor(Math.random() * (this.maxSteps + 1));
        this.targetYellow = Math.floor(Math.random() * (this.maxSteps + 1));
        
        // Reset current values
        this.currentCyan = 0;
        this.currentMagenta = 0;
        this.currentYellow = 0;
        
        // Reset sliders
        if (this.cyanSlider) this.cyanSlider.setValue(0);
        if (this.magentaSlider) this.magentaSlider.setValue(0);
        if (this.yellowSlider) this.yellowSlider.setValue(0);
        
        this.updateTargetColorDisplay();
        this.updateMixColorDisplay();
    }

    // CMY to RGB conversion (subtractive color mixing)
    cmyToRgb(c, m, y) {
        // Normalize to 0-1 range
        const cyan = c / this.maxSteps;
        const magenta = m / this.maxSteps;
        const yellow = y / this.maxSteps;
        
        // Subtractive mixing: more paint = darker
        const r = Math.floor((1 - cyan) * 255);
        const g = Math.floor((1 - magenta) * 255);
        const b = Math.floor((1 - yellow) * 255);
        
        return (r << 16) | (g << 8) | b;
    }

    updateTargetColorDisplay() {
        const { width, height } = this.scale;
        const color = this.cmyToRgb(this.targetCyan, this.targetMagenta, this.targetYellow);
        
        this.targetColorBox.clear();
        this.targetColorBox.fillStyle(color, 1);
        this.targetColorBox.lineStyle(3, 0xffffff, 1);
        this.targetColorBox.fillRoundedRect(width * 0.35 - 50, height * 0.18, 100, 100, 10);
        this.targetColorBox.strokeRoundedRect(width * 0.35 - 50, height * 0.18, 100, 100, 10);
    }

    updateMixColorDisplay() {
        const { width, height } = this.scale;
        const color = this.cmyToRgb(this.currentCyan, this.currentMagenta, this.currentYellow);
        
        this.mixColorBox.clear();
        this.mixColorBox.fillStyle(color, 1);
        this.mixColorBox.lineStyle(3, 0xffffff, 1);
        this.mixColorBox.fillRoundedRect(width * 0.65 - 50, height * 0.18, 100, 100, 10);
        this.mixColorBox.strokeRoundedRect(width * 0.65 - 50, height * 0.18, 100, 100, 10);
    }

    checkAnswer() {
        const isCorrect = 
            this.currentCyan === this.targetCyan &&
            this.currentMagenta === this.targetMagenta &&
            this.currentYellow === this.targetYellow;
        
        if (isCorrect) {
            this.showFeedback(true);
            this.subLevel++;
            
            if (this.subLevel >= this.maxSubLevels) {
                // Level complete
                this.time.delayedCall(800, () => this.handleLevelComplete());
            } else {
                // Next sub-level
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
            // Green checkmark
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
            // Red X with hint
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
            
            // Show hint
            this.instructionText.setText('Try adjusting the sliders!');
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
            
            const message = this.add.text(width / 2, height / 2 - 30, '🎨 Level Complete!', {
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
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 Color Mixing Master! 🏆', {
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
