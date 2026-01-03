/**
 * AlphabetSequenceGame - Catch letters in alphabetical order
 * 
 * Converted from GCompris alphabet-sequence activity (uses planegame base).
 * Original authors: Bruno Coudoin, Johnny Jazeix
 * 
 * Game description:
 * - Move a helicopter to catch clouds containing letters
 * - Letters must be caught in alphabetical order
 * - 4 levels: lowercase/uppercase, with/without next letter hint
 * - Arrow keys or touch/click to move helicopter
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class AlphabetSequenceGame extends LalelaGame {
    constructor() {
        super({ key: 'AlphabetSequenceGame' });
    }
    
    init(data) {
        super.init(data);
        
        // Alphabet sequence
        this.alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        
        // Level configurations
        this.levels = [
            { data: this.alphabet.slice(), showNext: true },                           // Level 1: lowercase, show hint
            { data: this.alphabet.map(l => l.toUpperCase()), showNext: true },         // Level 2: uppercase, show hint
            { data: this.alphabet.slice(), showNext: false },                          // Level 3: lowercase, no hint
            { data: this.alphabet.map(l => l.toUpperCase()), showNext: false }         // Level 4: uppercase, no hint
        ];
        
        this.currentLevel = 0;
        this.currentLetterIndex = 0;
        this.clouds = [];
        this.helicopter = null;
        this.velocity = { x: 0, y: 0 };
        this.maxVelocity = 8;
        this.acceleration = 0.8;
        this.friction = 0.92;
        
        // Keyboard state
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Touch target position
        this.targetPos = null;
    }
    
    preload() {
        super.preload();
        // No external assets - all programmatic graphics
    }
    
    createBackground() {
        const { width, height } = this.scale;
        
        // Desert/sky gradient background
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xF4D03F, 0xE67E22, 1);
        bgGraphics.fillRect(0, 0, width, height);
        bgGraphics.setDepth(-1);
        
        // Desert ground
        const groundHeight = height * 0.15;
        const ground = this.add.graphics();
        ground.fillStyle(0xD4A76A, 1);
        ground.fillRect(0, height - groundHeight, width, groundHeight);
        ground.setDepth(0);
        
        // Sand dunes
        this.drawDunes(ground, width, height - groundHeight);
        
        // Cacti decorations
        this.drawCacti(width, height - groundHeight);
        
        // Sun
        this.sun = this.add.circle(width - 80, 80, 40, 0xFFD700, 1).setDepth(0);
    }
    
    drawDunes(graphics, width, groundY) {
        graphics.fillStyle(0xC4986A, 1);
        
        // Draw some dune shapes
        for (let i = 0; i < 5; i++) {
            const x = i * width / 4;
            const duneWidth = width / 3;
            graphics.fillEllipse(x + duneWidth / 2, groundY + 20, duneWidth, 40);
        }
    }
    
    drawCacti(width, groundY) {
        const cactiPositions = [
            { x: width * 0.1, scale: 0.8 },
            { x: width * 0.35, scale: 1 },
            { x: width * 0.7, scale: 0.7 },
            { x: width * 0.9, scale: 0.9 }
        ];
        
        cactiPositions.forEach(pos => {
            this.createCactus(pos.x, groundY - 10, pos.scale);
        });
    }
    
    createCactus(x, y, scale) {
        const cactus = this.add.graphics();
        cactus.setDepth(1);
        
        const height = 60 * scale;
        const width = 20 * scale;
        
        // Main body
        cactus.fillStyle(0x228B22, 1);
        cactus.fillRoundedRect(x - width / 2, y - height, width, height, 5);
        
        // Arms
        cactus.fillRoundedRect(x - width * 1.5, y - height * 0.7, width * 0.8, width * 0.5, 3);
        cactus.fillRoundedRect(x - width * 1.5, y - height * 0.9, width * 0.5, height * 0.3, 3);
        
        cactus.fillRoundedRect(x + width * 0.7, y - height * 0.5, width * 0.8, width * 0.5, 3);
        cactus.fillRoundedRect(x + width, y - height * 0.75, width * 0.5, height * 0.35, 3);
    }
    
    createUI() {
        const { width, height } = this.scale;
        
        // Title
        this.titleText = this.add.text(width / 2, 25, 'Alphabet Sequence', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#2c3e50',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        
        // Next letter hint (bottom right)
        this.hintBox = this.add.graphics();
        this.hintBox.fillStyle(0x0062FF, 0.9);
        this.hintBox.fillRoundedRect(width - 90, height - 130, 70, 70, 10);
        this.hintBox.setDepth(10);
        
        this.hintLabel = this.add.text(width - 55, height - 155, 'Next:', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11);
        
        this.hintText = this.add.text(width - 55, height - 95, '', {
            fontSize: '36px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11);
        
        // Score/progress
        this.progressText = this.add.text(20, 60, 'Level 1 | Progress: 0/26', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#2c3e50'
        }).setDepth(10);
        
        // Instructions
        this.instructionText = this.add.text(width / 2, height - 160, 
            'Use arrow keys or tap to move the helicopter. Catch letters in order!', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(10);
        
        // Navigation dock
        this.createNavigationDock();
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
            color: '#2c3e50'
        }).setOrigin(0.5).setDepth(52);
        
        const helpText = this.add.text(width / 2, modalY + 100, 
            'Move the helicopter to catch clouds with letters.\n\n' +
            'Catch letters in alphabetical order (A, B, C...).\n\n' +
            'Use arrow keys or click/tap where you want to go.', {
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
        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Setup pointer input for touch/click
        this.input.on('pointerdown', (pointer) => {
            this.targetPos = { x: pointer.x, y: pointer.y };
        });
        
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.targetPos = { x: pointer.x, y: pointer.y };
            }
        });
        
        this.input.on('pointerup', () => {
            this.targetPos = null;
        });
        
        // Create helicopter
        this.createHelicopter();
        
        // Start the level
        this.initLevel();
        
        // Start cloud spawning timer
        this.cloudSpawnTimer = this.time.addEvent({
            delay: 2500,
            callback: this.spawnCloud,
            callbackScope: this,
            loop: true
        });
    }
    
    createHelicopter() {
        const { width, height } = this.scale;
        
        this.helicopter = this.add.container(100, height / 2);
        this.helicopter.setDepth(8);
        
        const bodyWidth = 80;
        const bodyHeight = 40;
        
        // Tail boom
        const tailBoom = this.add.graphics();
        tailBoom.fillStyle(0x1565C0, 1);
        tailBoom.fillRect(30, -5, 40, 10);
        this.helicopter.add(tailBoom);
        
        // Tail rotor
        const tailRotor = this.add.graphics();
        tailRotor.fillStyle(0x333333, 1);
        tailRotor.fillRect(65, -15, 5, 30);
        this.helicopter.add(tailRotor);
        
        // Main body
        const body = this.add.graphics();
        body.fillStyle(0x1976D2, 1);
        body.fillEllipse(0, 0, bodyWidth, bodyHeight);
        this.helicopter.add(body);
        
        // Cockpit window
        const cockpit = this.add.graphics();
        cockpit.fillStyle(0x87CEEB, 1);
        cockpit.lineStyle(2, 0x0D47A1, 1);
        cockpit.fillEllipse(-15, 0, 25, 20);
        cockpit.strokeEllipse(-15, 0, 25, 20);
        this.helicopter.add(cockpit);
        
        // Skids
        const skids = this.add.graphics();
        skids.lineStyle(4, 0x333333, 1);
        skids.lineBetween(-25, 25, 25, 25);
        skids.lineBetween(-20, 20, -20, 25);
        skids.lineBetween(15, 20, 15, 25);
        this.helicopter.add(skids);
        
        // Main rotor hub
        const rotorHub = this.add.graphics();
        rotorHub.fillStyle(0x333333, 1);
        rotorHub.fillCircle(0, -22, 6);
        this.helicopter.add(rotorHub);
        
        // Main rotor blades (will be animated)
        this.rotorBlades = this.add.graphics();
        this.rotorBlades.fillStyle(0x555555, 1);
        this.rotorBlades.fillRect(-50, -24, 100, 4);
        this.helicopter.add(this.rotorBlades);
        
        // Rotor animation
        this.rotorAngle = 0;
        
        // Set physics body size for collisions
        this.helicopter.setSize(bodyWidth, bodyHeight);
    }
    
    initLevel() {
        // Clear existing clouds
        this.clouds.forEach(cloud => cloud.container.destroy());
        this.clouds = [];
        
        // Reset letter index
        this.currentLetterIndex = 0;
        
        // Reset helicopter position
        const { height } = this.scale;
        this.helicopter.x = 100;
        this.helicopter.y = height / 2;
        this.velocity = { x: 0, y: 0 };
        
        // Update hint visibility
        const level = this.levels[this.currentLevel];
        this.hintBox.setVisible(level.showNext);
        this.hintLabel.setVisible(level.showNext);
        this.hintText.setVisible(level.showNext);
        
        // Update hint text
        this.updateHint();
        
        // Update progress
        this.updateProgress();
        
        // Spawn initial clouds
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 500, () => this.spawnCloud());
        }
    }
    
    updateHint() {
        const level = this.levels[this.currentLevel];
        if (level.showNext && this.currentLetterIndex < level.data.length) {
            this.hintText.setText(level.data[this.currentLetterIndex]);
        }
    }
    
    updateProgress() {
        const level = this.levels[this.currentLevel];
        const progress = this.currentLetterIndex;
        const total = level.data.length;
        this.progressText.setText(`Level ${this.currentLevel + 1}/${this.levels.length} | Progress: ${progress}/${total}`);
    }
    
    spawnCloud() {
        const { width, height } = this.scale;
        const level = this.levels[this.currentLevel];
        
        // Determine which letter to put on cloud
        let cloudLetter;
        
        // Ensure at least one in 3 clouds has the target letter
        if (Math.random() < 0.4 && this.currentLetterIndex < level.data.length) {
            cloudLetter = level.data[this.currentLetterIndex];
        } else {
            // Random letter from around the current position
            const minIdx = Math.max(0, this.currentLetterIndex - 2);
            const maxIdx = Math.min(level.data.length - 1, this.currentLetterIndex + 5);
            const randomIdx = Phaser.Math.Between(minIdx, maxIdx);
            cloudLetter = level.data[randomIdx];
        }
        
        // Create cloud at right edge, random height
        const cloudY = Phaser.Math.Between(80, height - 200);
        const cloud = this.createCloud(width + 80, cloudY, cloudLetter);
        this.clouds.push(cloud);
    }
    
    createCloud(x, y, letter) {
        const container = this.add.container(x, y);
        container.setDepth(5);
        
        // Cloud shape using multiple ellipses
        const cloudGraphics = this.add.graphics();
        cloudGraphics.fillStyle(0xffffff, 0.95);
        
        // Main cloud body
        cloudGraphics.fillEllipse(0, 0, 80, 50);
        cloudGraphics.fillEllipse(-30, -10, 45, 35);
        cloudGraphics.fillEllipse(25, -5, 50, 40);
        cloudGraphics.fillEllipse(-20, 10, 40, 30);
        cloudGraphics.fillEllipse(15, 8, 45, 35);
        
        container.add(cloudGraphics);
        
        // Letter on cloud
        const letterText = this.add.text(0, 0, letter, {
            fontSize: '32px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#2c3e50'
        }).setOrigin(0.5);
        container.add(letterText);
        
        // Movement speed (increases with level)
        const speed = 1.5 + this.currentLevel * 0.3;
        
        return {
            container,
            letter,
            letterText,
            speed,
            caught: false
        };
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Animate rotor
        this.rotorAngle += 0.5;
        if (this.rotorBlades) {
            this.rotorBlades.clear();
            this.rotorBlades.fillStyle(0x555555, 1);
            
            const bladeLength = 50;
            const angle1 = this.rotorAngle;
            const angle2 = this.rotorAngle + Math.PI / 2;
            
            // Draw two blades
            this.rotorBlades.fillRect(-bladeLength * Math.abs(Math.cos(angle1)), -24, 
                bladeLength * 2 * Math.abs(Math.cos(angle1)), 4);
        }
        
        // Handle input
        this.handleInput();
        
        // Move helicopter
        this.moveHelicopter();
        
        // Move clouds
        this.moveClouds();
        
        // Check collisions
        this.checkCollisions();
    }
    
    handleInput() {
        // Reset key states
        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;
        
        // Keyboard input
        if (this.cursors.up.isDown) this.keys.up = true;
        if (this.cursors.down.isDown) this.keys.down = true;
        if (this.cursors.left.isDown) this.keys.left = true;
        if (this.cursors.right.isDown) this.keys.right = true;
        
        // Touch/mouse input - move towards target
        if (this.targetPos) {
            const dx = this.targetPos.x - this.helicopter.x;
            const dy = this.targetPos.y - this.helicopter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 20) {
                if (dx > 0) this.keys.right = true;
                if (dx < 0) this.keys.left = true;
                if (dy > 0) this.keys.down = true;
                if (dy < 0) this.keys.up = true;
            }
        }
    }
    
    moveHelicopter() {
        const { width, height } = this.scale;
        
        // Apply acceleration
        if (this.keys.right) this.velocity.x += this.acceleration;
        if (this.keys.left) this.velocity.x -= this.acceleration;
        if (this.keys.down) this.velocity.y += this.acceleration;
        if (this.keys.up) this.velocity.y -= this.acceleration;
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Clamp velocity
        this.velocity.x = Phaser.Math.Clamp(this.velocity.x, -this.maxVelocity, this.maxVelocity);
        this.velocity.y = Phaser.Math.Clamp(this.velocity.y, -this.maxVelocity, this.maxVelocity);
        
        // Update position
        this.helicopter.x += this.velocity.x;
        this.helicopter.y += this.velocity.y;
        
        // Keep in bounds
        this.helicopter.x = Phaser.Math.Clamp(this.helicopter.x, 50, width - 50);
        this.helicopter.y = Phaser.Math.Clamp(this.helicopter.y, 50, height - 180);
        
        // Tilt based on horizontal velocity
        this.helicopter.rotation = this.velocity.x * 0.02;
    }
    
    moveClouds() {
        const toRemove = [];
        
        this.clouds.forEach((cloud, index) => {
            if (cloud.caught) return;
            
            // Move cloud left
            cloud.container.x -= cloud.speed;
            
            // Remove if off screen
            if (cloud.container.x < -100) {
                toRemove.push(index);
                cloud.container.destroy();
            }
        });
        
        // Remove off-screen clouds
        toRemove.reverse().forEach(idx => {
            this.clouds.splice(idx, 1);
        });
    }
    
    checkCollisions() {
        const heliX = this.helicopter.x;
        const heliY = this.helicopter.y;
        const heliRadius = 40;
        
        this.clouds.forEach(cloud => {
            if (cloud.caught) return;
            
            const cloudX = cloud.container.x;
            const cloudY = cloud.container.y;
            const cloudRadius = 40;
            
            // Simple circle collision
            const dx = heliX - cloudX;
            const dy = heliY - cloudY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < heliRadius + cloudRadius) {
                // Collision detected
                this.catchCloud(cloud);
            }
        });
    }
    
    catchCloud(cloud) {
        cloud.caught = true;
        
        const level = this.levels[this.currentLevel];
        const expectedLetter = level.data[this.currentLetterIndex];
        
        if (cloud.letter === expectedLetter) {
            // Correct letter caught
            this.showCatchSuccess(cloud);
            this.currentLetterIndex++;
            this.updateProgress();
            this.updateHint();
            
            if (this.currentLetterIndex >= level.data.length) {
                // Level complete
                this.time.delayedCall(500, () => this.onLevelComplete());
            }
        } else {
            // Wrong letter
            this.showCatchFail(cloud);
        }
    }
    
    showCatchSuccess(cloud) {
        // Green flash
        this.tweens.add({
            targets: cloud.container,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => cloud.container.destroy()
        });
        
        // Change letter color to green
        cloud.letterText.setColor('#4CAF50');
        
        // Particles
        this.createCatchParticles(cloud.container.x, cloud.container.y, 0x4CAF50);
        
        // Sound
        if (this.audioManager && this.audioManager.sounds.has('success')) {
            this.audioManager.play('success');
        }
    }
    
    showCatchFail(cloud) {
        // Red flash and shake
        const originalX = cloud.container.x;
        
        cloud.letterText.setColor('#F44336');
        
        this.tweens.add({
            targets: cloud.container,
            x: originalX + 15,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                cloud.caught = false; // Allow re-catching attempts
                cloud.letterText.setColor('#2c3e50');
            }
        });
        
        // Sound
        if (this.audioManager && this.audioManager.sounds.has('error')) {
            this.audioManager.play('error');
        }
    }
    
    createCatchParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const particle = this.add.circle(x, y, Phaser.Math.Between(4, 8), color, 1);
            particle.setDepth(15);
            
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
        // Stop cloud spawning
        this.cloudSpawnTimer.paused = true;
        
        // Clear remaining clouds
        this.clouds.forEach(cloud => cloud.container.destroy());
        this.clouds = [];
        
        this.currentLevel++;
        
        if (this.currentLevel >= this.levels.length) {
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
        
        this.time.delayedCall(2500, () => {
            overlay.destroy();
            text.destroy();
            subText.destroy();
            this.cloudSpawnTimer.paused = false;
            this.initLevel();
        });
    }
    
    showGameComplete() {
        const { width, height } = this.scale;
        
        // Stop cloud spawning
        this.cloudSpawnTimer.remove();
        
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(50);
        
        const text = this.add.text(width / 2, height / 2 - 50, '🏆 Amazing! 🏆', {
            fontSize: '44px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(51);
        
        const subText = this.add.text(width / 2, height / 2 + 20, 'You know the whole alphabet!', {
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
        // Clean up timers
        if (this.cloudSpawnTimer) {
            this.cloudSpawnTimer.remove();
        }
        super.shutdown();
    }
}
