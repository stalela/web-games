import { LalelaGame } from '../utils/LalelaGame.js';

export class MelodyGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'MelodyGame',
            title: 'Melody',
            description: 'Listen to the sound sequence and repeat it.',
            category: 'discovery'
        });
    }

    preload() {
        super.preload();
        // Load xylophone assets
        this.load.svg('melody-xylofon', 'assets/melody/xylofon.svg');
        this.load.svg('melody-part1', 'assets/melody/xylofon_part1.svg');
        this.load.svg('melody-part2', 'assets/melody/xylofon_part2.svg');
        this.load.svg('melody-part3', 'assets/melody/xylofon_part3.svg');
        this.load.svg('melody-part4', 'assets/melody/xylofon_part4.svg');
        
        this.load.audio('melody-son1', 'assets/melody/xylofon_son1.wav');
        this.load.audio('melody-son2', 'assets/melody/xylofon_son2.wav');
        this.load.audio('melody-son3', 'assets/melody/xylofon_son3.wav');
        this.load.audio('melody-son4', 'assets/melody/xylofon_son4.wav');
        this.load.audio('melody-knock', 'assets/melody/knock.wav');
        
        // Load navigation icons
        this.load.svg('home', 'assets/game-icons/bar_home.svg');
        this.load.svg('help', 'assets/game-icons/bar_help.svg');
        this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
        this.load.svg('repeat', 'assets/game-icons/bar_repeat.svg');
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // GCompris uses #ABCDEF background
        this.add.rectangle(0, 0, width, height, 0xABCDEF).setOrigin(0).setDepth(-1);
    }

    createUI() {
        super.createUI();
        const { width, height } = this.scale;
        
        // Score display (top right) - shows subLevel/totalSubLevels
        this.scoreBox = this.add.graphics();
        this.scoreBox.fillStyle(0xffffff, 0.9);
        this.scoreBox.fillRoundedRect(width - 90, 15, 70, 50, 10);
        this.scoreBox.setDepth(10);
        
        this.scoreText = this.add.text(width - 55, 40, '0/5', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // Instruction text
        this.instructionText = this.add.text(width / 2, 50, 'Listen...', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);
        
        // Navigation dock
        this.createNavigationDock();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const barY = height - 55;
        const buttonSize = 72;
        const spacing = 95;
        const buttonRadius = 10;

        const controls = [
            { icon: 'help', action: 'help', color: 0x00B378 },
            { icon: 'home', action: 'home', color: 0x00B378 }
        ];

        // Left side controls
        let startX = 80;
        controls.forEach((control, index) => {
            const x = startX + index * spacing;
            this.createNavButton(x, barY, buttonSize, buttonRadius, control);
        });

        // Level arrows in center
        // Previous level arrow
        this.prevBtn = this.add.text(width / 2 - 60, barY, '❮', {
            fontSize: '48px',
            color: '#D97706',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });
        this.prevBtn.on('pointerdown', () => {
            if (this.level > 1) {
                this.level--;
                this.subLevel = 0;
                this.startLevel();
            }
        });

        // Level number
        this.levelText = this.add.text(width / 2, barY, '1', {
            fontSize: '36px',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Next level arrow
        this.nextBtn = this.add.text(width / 2 + 60, barY, '❯', {
            fontSize: '48px',
            color: '#D97706',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });
        this.nextBtn.on('pointerdown', () => {
            if (this.level < 10) {
                this.level++;
                this.subLevel = 0;
                this.startLevel();
            }
        });

        // Repeat button (right side) - plays the sequence again
        this.createNavButton(width / 2 + 150, barY, buttonSize, buttonRadius, {
            icon: 'repeat',
            action: 'repeat',
            color: 0xF08A00
        });
    }

    createNavButton(x, y, buttonSize, buttonRadius, control) {
        const button = this.add.graphics();
        button.fillStyle(control.color);
        button.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
        button.lineStyle(2, 0xFFFFFF, 0.8);
        button.strokeRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
        button.setInteractive(
            new Phaser.Geom.Rectangle(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize),
            Phaser.Geom.Rectangle.Contains
        );

        const icon = this.add.sprite(x, y, control.icon);
        icon.setScale((buttonSize * 0.6) / Math.max(icon.width, icon.height));
        icon.setTint(0xFFFFFF);

        button.on('pointerdown', () => {
            icon.y += 2;
            this.handleNavAction(control.action);
            this.time.delayedCall(100, () => {
                icon.y -= 2;
            });
        });

        button.on('pointerover', () => {
            this.tweens.add({ targets: icon, scale: (buttonSize * 0.65) / Math.max(icon.width, icon.height), duration: 100 });
        });

        button.on('pointerout', () => {
            this.tweens.add({ targets: icon, scale: (buttonSize * 0.6) / Math.max(icon.width, icon.height), duration: 100 });
        });

        button.setDepth(100);
        icon.setDepth(101);

        return { button, icon };
    }

    handleNavAction(action) {
        switch (action) {
            case 'home':
                this.scene.start('GameMenu');
                break;
            case 'help':
                this.showHelpModal();
                break;
            case 'repeat':
                if (!this.isPlayingSequence) {
                    this.playSequence();
                }
                break;
        }
    }

    showHelpModal() {
        if (this.helpModal) return;

        const { width, height } = this.scale;

        this.helpModal = this.add.container(width / 2, height / 2).setDepth(200);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        overlay.setInteractive();

        const panel = this.add.rectangle(0, 0, 500, 320, 0xffffff, 1);
        panel.setStrokeStyle(3, 0x00B378);

        const title = this.add.text(0, -120, 'How to Play', {
            fontSize: '32px',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(0, 0, 
            'Listen to the melody played by the xylophone,\n' +
            'then click on the colored keys to repeat it.\n\n' +
            'The sequence gets longer as you progress!\n\n' +
            'Use the repeat button to hear the melody again.',
            {
                fontSize: '20px',
                color: '#333333',
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5);

        const closeBtn = this.add.text(0, 130, 'Got it!', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#00B378',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.helpModal.destroy();
            this.helpModal = null;
        });

        this.helpModal.add([overlay, panel, title, instructions, closeBtn]);
    }

    setupGameLogic() {
        const { width, height } = this.scale;
        
        // Layout area (above nav bar)
        const layoutHeight = height - 130;
        const layoutCenterY = layoutHeight / 2 + 30;
        
        // Create Xylophone base
        const xylofon = this.add.image(width / 2, layoutCenterY, 'melody-xylofon');
        const scale = Math.min((width - 100) / xylofon.width, (layoutHeight - 100) / xylofon.height);
        xylofon.setScale(scale);
        xylofon.setDepth(1);
        
        // Store for key positioning
        this.xylofonRef = xylofon;
        
        // Create interactive colored keys
        // Position them over the base like GCompris does with rotation and offsets
        this.keys = [];
        
        for (let i = 0; i < 4; i++) {
            const key = this.add.image(width / 2, layoutCenterY, `melody-part${i + 1}`);
            key.setScale(scale);
            key.setDepth(2 + i);
            
            // Position keys with offset like GCompris:
            // anchors.horizontalCenterOffset: (- xylofon.paintedWidth) * 0.3 + xylofon.paintedWidth * index * 0.22
            // anchors.verticalCenterOffset: - xylofon.paintedHeight * 0.1
            const paintedWidth = xylofon.displayWidth;
            const paintedHeight = xylofon.displayHeight;
            
            key.x = width / 2 + (-paintedWidth * 0.3 + paintedWidth * i * 0.22);
            key.y = layoutCenterY - paintedHeight * 0.1;
            key.setRotation(Phaser.Math.DegToRad(-80));
            
            // Store original scale for animation
            key.originalScaleX = key.scaleX;
            key.originalScaleY = key.scaleY;
            
            // Make interactive
            key.setInteractive({ useHandCursor: true });
            
            const keyIndex = i;
            key.on('pointerdown', () => {
                if (!this.isPlayingSequence && !this.buttonsBlocked) {
                    this.handleInput(keyIndex);
                }
            });
            
            this.keys.push({
                sprite: key,
                id: i,
                sound: `melody-son${i + 1}`
            });
        }
        
        // Game state
        this.sequence = [];
        this.playerSequence = [];
        this.isPlayingSequence = false;
        this.buttonsBlocked = false;
        this.level = 1;
        this.subLevel = 0;
        this.maxSubLevels = 5;
        
        // Start first level after delay
        this.time.delayedCall(1000, () => this.startLevel());
    }
    
    startLevel() {
        this.sequence = [];
        this.playerSequence = [];
        this.buttonsBlocked = false;
        
        // Update UI
        this.levelText.setText(this.level.toString());
        this.scoreText.setText(`${this.subLevel}/${this.maxSubLevels}`);
        this.instructionText.setText('Listen...');
        
        // Number of parts depends on level (like GCompris)
        let numberOfParts = 4;
        if (this.level < 3) numberOfParts = 2;
        else if (this.level < 5) numberOfParts = 3;
        
        // Sequence length = level + 2 (like GCompris: level + 3 but 0-indexed)
        const sequenceLength = this.level + 2;
        
        for (let i = 0; i < sequenceLength; i++) {
            this.sequence.push(Phaser.Math.Between(0, numberOfParts - 1));
        }
        
        // Play sequence after short delay
        this.time.delayedCall(500, () => this.playSequence());
    }
    
    playSequence() {
        this.isPlayingSequence = true;
        this.instructionText.setText('Listen...');
        
        // Calculate interval based on level (faster at higher levels)
        const interval = Math.max(700, 1200 - (this.level * 50));
        
        let delay = 500;
        this.sequence.forEach((noteIndex) => {
            this.time.delayedCall(delay, () => {
                this.playNote(noteIndex);
            });
            delay += interval;
        });
        
        this.time.delayedCall(delay, () => {
            this.isPlayingSequence = false;
            this.instructionText.setText('Your turn!');
        });
    }
    
    playNote(noteIndex) {
        const keyObj = this.keys[noteIndex];
        
        // Scale animation like GCompris
        this.tweens.add({
            targets: keyObj.sprite,
            scaleX: keyObj.sprite.originalScaleX * 0.95,
            scaleY: keyObj.sprite.originalScaleY * 0.95,
            duration: 150,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });
        
        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound(keyObj.sound);
        } else {
            // Fallback to Phaser audio
            this.sound.play(keyObj.sound);
        }
    }
    
    handleInput(noteIndex) {
        this.playNote(noteIndex);
        this.playerSequence.push(noteIndex);
        
        // Check correctness
        const currentIndex = this.playerSequence.length - 1;
        
        if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
            // Wrong note
            this.buttonsBlocked = true;
            if (this.audioManager) this.audioManager.playSound('error');
            this.instructionText.setText('Wrong! Try again.');
            
            // Flash error indicator
            this.showErrorFlash();
            
            this.time.delayedCall(1500, () => {
                this.playerSequence = [];
                this.buttonsBlocked = false;
                this.playSequence();
            });
        } else if (this.playerSequence.length === this.sequence.length) {
            // Correct sequence complete!
            this.buttonsBlocked = true;
            if (this.audioManager) this.audioManager.playSound('success');
            this.instructionText.setText('Good job!');
            
            this.subLevel++;
            this.scoreText.setText(`${this.subLevel}/${this.maxSubLevels}`);
            
            if (this.subLevel >= this.maxSubLevels) {
                // Level complete, go to next level
                this.time.delayedCall(1500, () => {
                    this.level++;
                    if (this.level > 10) this.level = 10;
                    this.subLevel = 0;
                    this.startLevel();
                });
            } else {
                // Next sub-level
                this.time.delayedCall(1500, () => this.startLevel());
            }
        }
    }
    
    showErrorFlash() {
        const { width, height } = this.scale;
        const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.3);
        flash.setDepth(50);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => flash.destroy()
        });
    }
}
