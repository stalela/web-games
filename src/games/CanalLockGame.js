import { LalelaGame } from '../utils/LalelaGame.js';

export class CanalLockGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'CanalLockGame',
            title: 'Canal Lock',
            description: 'Help Tux cross the canal by operating the locks.',
            category: 'discovery'
        });
    }

    preload() {
        super.preload();
        // Load all canal lock assets
        this.load.svg('canal-sky', 'assets/canal_lock/sky.svg');
        this.load.svg('canal-sun', 'assets/canal_lock/sun.svg');
        this.load.svg('canal-cloud1', 'assets/canal_lock/cloud1.svg');
        this.load.svg('canal-cloud2', 'assets/canal_lock/cloud2.svg');
        this.load.svg('canal-lock', 'assets/canal_lock/canal_lock.svg');
        this.load.svg('canal-left', 'assets/canal_lock/canal_left.svg');
        this.load.svg('canal-right', 'assets/canal_lock/canal_right.svg');
        this.load.svg('canal-boat1', 'assets/canal_lock/boat1.svg');
        this.load.svg('canal-boat2', 'assets/canal_lock/boat2.svg');
        this.load.svg('light-green', 'assets/canal_lock/light_green.svg');
        this.load.svg('light-red', 'assets/canal_lock/light_red.svg');
        
        // Load audio
        this.load.audio('water-fill', 'assets/canal_lock/water_fill.wav');
        this.load.audio('lock-sound', 'assets/canal_lock/lock.wav');
        this.load.audio('door-open', 'assets/canal_lock/door_open.wav');
        this.load.audio('door-close', 'assets/canal_lock/door_close.wav');
        
        // Load navigation icons
        this.load.svg('home', 'assets/game-icons/bar_home.svg');
        this.load.svg('help', 'assets/game-icons/bar_help.svg');
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Sky background
        this.add.image(width / 2, height / 2, 'canal-sky')
            .setDisplaySize(width, height)
            .setDepth(-1);
        
        // Sun
        this.add.image(80, 80, 'canal-sun')
            .setDisplaySize(120, 120)
            .setDepth(0);
        
        // Clouds
        this.add.image(width * 0.25, height * 0.08, 'canal-cloud2')
            .setDisplaySize(150, 80)
            .setDepth(0);
        
        this.add.image(width * 0.22, height * 0.12, 'canal-cloud1')
            .setDisplaySize(130, 70)
            .setDepth(0);
    }

    createUI() {
        super.createUI();
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

        let startX = 80;
        controls.forEach((control, index) => {
            const x = startX + index * spacing;
            this.createNavButton(x, barY, buttonSize, buttonRadius, control);
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
        button.setDepth(100);

        const icon = this.add.sprite(x, y, control.icon);
        icon.setScale((buttonSize * 0.6) / Math.max(icon.width, icon.height));
        icon.setTint(0xFFFFFF);
        icon.setDepth(101);

        button.on('pointerdown', () => {
            icon.y += 2;
            this.handleNavAction(control.action);
            this.time.delayedCall(100, () => { icon.y -= 2; });
        });
    }

    handleNavAction(action) {
        switch (action) {
            case 'home':
                this.scene.start('GameMenu');
                break;
            case 'help':
                this.showHelpModal();
                break;
        }
    }

    showHelpModal() {
        if (this.helpModal) return;

        const { width, height } = this.scale;
        this.helpModal = this.add.container(width / 2, height / 2).setDepth(200);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        overlay.setInteractive();

        const panel = this.add.rectangle(0, 0, 550, 350, 0xffffff, 1);
        panel.setStrokeStyle(3, 0x00B378);

        const title = this.add.text(0, -140, 'How to Play', {
            fontSize: '32px', color: '#2c3e50', fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(0, 10,
            'Help Tux cross the canal lock!\n\n' +
            '• Click on the GREEN doors to open/close them\n' +
            '• Click on the YELLOW locks to fill/empty water\n' +
            '• Click on the BOAT to move Tux when a door is open\n' +
            '• Match water levels to open doors safely\n\n' +
            'Get Tux to the right side to collect the logs!',
            { fontSize: '18px', color: '#333333', align: 'center', lineSpacing: 6 }
        ).setOrigin(0.5);

        const closeBtn = this.add.text(0, 145, 'Got it!', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#00B378', padding: { x: 30, y: 12 }
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
        const layoutHeight = height - 110;
        
        // Canal lock structure - centered
        const canalWidth = width * 0.7;
        const canalHeight = layoutHeight * 0.85;
        const canalX = width / 2;
        const canalY = layoutHeight / 2 + 20;
        
        // Main canal lock image
        this.canalLock = this.add.image(canalX, canalY, 'canal-lock');
        this.canalLock.setDisplaySize(canalWidth, canalHeight);
        this.canalLock.setDepth(1);
        
        // Store dimensions for positioning
        this.canalBounds = {
            x: canalX,
            y: canalY,
            width: canalWidth,
            height: canalHeight
        };
        
        // Left canal extension (tiles to fill left side)
        const leftExtWidth = (width - canalWidth) / 2 + 20;
        this.canalLeft = this.add.image(leftExtWidth / 2, canalY, 'canal-left');
        this.canalLeft.setDisplaySize(leftExtWidth, canalHeight);
        this.canalLeft.setDepth(1);
        
        // Right canal extension
        const rightExtX = width - leftExtWidth / 2;
        this.canalRight = this.add.image(rightExtX, canalY, 'canal-right');
        this.canalRight.setDisplaySize(leftExtWidth, canalHeight);
        this.canalRight.setDepth(1);
        
        // Brown ground below canal
        const groundY = canalY + canalHeight * 0.35;
        this.add.rectangle(width / 2, groundY + 100, width, 200, 0x805451).setDepth(0);
        
        // Water in the lock chamber
        this.waterMinHeight = canalHeight * 0.15;
        this.waterMaxHeight = canalHeight * 0.33;
        this.waterHeight = this.waterMinHeight;
        this.waterState = 'down'; // 'up' or 'down'
        
        const waterX = canalX + canalWidth * 0.035;
        const waterWidth = canalWidth * 0.205;
        const waterBottomY = canalY + canalHeight * 0.27;
        
        this.water = this.add.rectangle(waterX, waterBottomY - this.waterHeight / 2, waterWidth, this.waterHeight, 0x4f76d6);
        this.water.setDepth(2);
        this.waterBottomY = waterBottomY;
        this.waterWidth = waterWidth;
        
        // Create locks and doors
        this.createLocks();
        
        // Create traffic lights
        this.createLights();
        
        // Create boat with Tux
        this.createBoat();
        
        // State tracking
        this.running = false;
    }
    
    createLocks() {
        const { x, y, width, height } = this.canalBounds;
        
        // Yellow locks (water control valves) - bottom ones
        // Lock 1 (left side - drains water)
        this.lock1 = this.createLock(
            x - width * 0.16,
            y + height * 0.47,
            width * 0.05,
            height * 0.18,
            height * 0.05,
            0xdfb625,
            'lock1'
        );
        
        // Lock 2 (right side - fills water)
        this.lock2 = this.createLock(
            x + width * 0.22,
            y + height * 0.47,
            width * 0.05,
            height * 0.18,
            height * 0.05,
            0xdfb625,
            'lock2'
        );
        
        // Green doors (boat passage)
        // Door 1 (left side)
        this.door1 = this.createLock(
            x - width * 0.07,
            y + height * 0.30,
            width * 0.05,
            height * 0.40,
            height * 0.05,
            0x31cb25,
            'door1'
        );
        
        // Door 2 (right side)
        this.door2 = this.createLock(
            x + width * 0.14,
            y + height * 0.30,
            width * 0.05,
            height * 0.40,
            height * 0.15,
            0x31cb25,
            'door2'
        );
    }
    
    createLock(x, bottomY, lockWidth, maxHeight, minHeight, color, name) {
        const lock = {
            name,
            x,
            bottomY,
            width: lockWidth,
            maxHeight,
            minHeight,
            currentHeight: maxHeight,
            state: 'close',
            color
        };
        
        // Create the lock rectangle
        lock.sprite = this.add.rectangle(x, bottomY - maxHeight / 2, lockWidth, maxHeight, color);
        lock.sprite.setDepth(5);
        lock.sprite.setInteractive({ useHandCursor: true });
        
        // Handle clicks
        lock.sprite.on('pointerdown', () => this.handleLockClick(lock));
        
        return lock;
    }
    
    handleLockClick(lock) {
        if (this.running) return;
        
        const playSound = (soundName) => {
            if (this.audioManager) {
                this.audioManager.playSound(soundName);
            } else {
                this.sound.play(soundName);
            }
        };
        
        if (lock.name === 'lock1') {
            // Left valve - drains water
            if (lock.state === 'close' && this.door2.state === 'close' && this.lock2.state === 'close') {
                playSound('lock-sound');
                this.openLock(lock);
                this.changeWaterLevel('down');
            } else if (lock.state === 'open') {
                playSound('lock-sound');
                this.closeLock(lock);
            } else {
                // Can't operate - play error
                if (this.audioManager) this.audioManager.playSound('error');
            }
        } else if (lock.name === 'lock2') {
            // Right valve - fills water
            if (lock.state === 'close' && this.door1.state === 'close' && this.lock1.state === 'close') {
                playSound('lock-sound');
                this.openLock(lock);
                this.changeWaterLevel('up');
            } else if (lock.state === 'open') {
                playSound('lock-sound');
                this.closeLock(lock);
            } else {
                if (this.audioManager) this.audioManager.playSound('error');
            }
        } else if (lock.name === 'door1') {
            // Left door
            if (lock.state === 'close' && this.waterState === 'down') {
                playSound('door-open');
                this.openLock(lock);
                this.leftLight.setTexture('light-green');
            } else if (lock.state === 'open') {
                playSound('door-close');
                this.closeLock(lock);
                this.leftLight.setTexture('light-red');
            } else {
                if (this.audioManager) this.audioManager.playSound('error');
            }
        } else if (lock.name === 'door2') {
            // Right door
            if (lock.state === 'close' && this.waterState === 'up') {
                playSound('door-open');
                this.openLock(lock);
                this.rightLight.setTexture('light-green');
            } else if (lock.state === 'open') {
                playSound('door-close');
                this.closeLock(lock);
                this.rightLight.setTexture('light-red');
            } else {
                if (this.audioManager) this.audioManager.playSound('error');
            }
        }
    }
    
    openLock(lock) {
        lock.state = 'open';
        const duration = lock.name.startsWith('door') ? 3500 : 400;
        
        this.tweens.add({
            targets: lock.sprite,
            displayHeight: lock.minHeight,
            y: lock.bottomY - lock.minHeight / 2,
            duration
        });
    }
    
    closeLock(lock) {
        lock.state = 'close';
        const duration = lock.name.startsWith('door') ? 3500 : 400;
        
        this.tweens.add({
            targets: lock.sprite,
            displayHeight: lock.maxHeight,
            y: lock.bottomY - lock.maxHeight / 2,
            duration
        });
    }
    
    changeWaterLevel(state) {
        this.waterState = state;
        const targetHeight = state === 'up' ? this.waterMaxHeight : this.waterMinHeight;
        
        // Play water sound
        if (this.audioManager) {
            this.audioManager.playSound('water-fill');
        } else {
            this.sound.play('water-fill');
        }
        
        this.running = true;
        
        this.tweens.add({
            targets: this.water,
            displayHeight: targetHeight,
            y: this.waterBottomY - targetHeight / 2,
            duration: 3500,
            onUpdate: () => {
                // Move boat with water if in middle
                if (this.boatState === 'middleDown' && state === 'up') {
                    this.boatState = 'middleUp';
                    this.updateBoatPosition();
                } else if (this.boatState === 'middleUp' && state === 'down') {
                    this.boatState = 'middleDown';
                    this.updateBoatPosition();
                }
            },
            onComplete: () => {
                this.running = false;
            }
        });
    }
    
    createLights() {
        const { x, y, width, height } = this.canalBounds;
        
        // Left traffic light
        this.leftLight = this.add.image(x - width * 0.18, y - height * 0.04, 'light-red');
        this.leftLight.setDisplaySize(height * 0.08, height * 0.1);
        this.leftLight.setDepth(6);
        
        // Right traffic light (mirrored)
        this.rightLight = this.add.image(x + width * 0.20, y - height * 0.18, 'light-red');
        this.rightLight.setDisplaySize(height * 0.08, height * 0.1);
        this.rightLight.setFlipX(true);
        this.rightLight.setDepth(6);
    }
    
    createBoat() {
        const { x, y, width, height } = this.canalBounds;
        
        // Boat positions
        this.boatPositions = {
            left: { x: x - width * 0.40, y: y + height * 0.13 },
            middleDown: { x: x + width * 0.035, y: y + height * 0.13 },
            middleUp: { x: x + width * 0.035, y: y - height * 0.05 },
            right: { x: x + width * 0.35, y: y - height * 0.05 }
        };
        
        this.boatState = 'left';
        
        // Create boat
        this.boat = this.add.image(
            this.boatPositions.left.x,
            this.boatPositions.left.y,
            'canal-boat1'
        );
        this.boat.setDisplaySize(this.waterWidth * 0.74, this.waterWidth * 0.5);
        this.boat.setDepth(10);
        this.boat.setInteractive({ useHandCursor: true });
        
        this.boat.on('pointerdown', () => this.handleBoatClick());
    }
    
    handleBoatClick() {
        if (this.running) return;
        
        const prevState = this.boatState;
        
        if (this.boatState === 'left' && this.door1.state === 'open') {
            this.boatState = 'middleDown';
        } else if (this.boatState === 'middleUp' && this.door2.state === 'open') {
            this.boatState = 'right';
        } else if (this.boatState === 'right' && this.door2.state === 'open') {
            this.boatState = 'middleUp';
        } else if (this.boatState === 'middleDown' && this.door1.state === 'open') {
            this.boatState = 'left';
        }
        
        if (prevState !== this.boatState) {
            if (this.audioManager) {
                this.audioManager.playSound('water-fill');
            } else {
                this.sound.play('water-fill');
            }
            this.updateBoatPosition();
        }
    }
    
    updateBoatPosition() {
        const targetPos = this.boatPositions[this.boatState];
        
        this.running = true;
        
        this.tweens.add({
            targets: this.boat,
            x: targetPos.x,
            y: targetPos.y,
            duration: 3500,
            onComplete: () => {
                this.running = false;
                
                // Check if reached right side
                if (this.boatState === 'right' && this.boat.texture.key === 'canal-boat1') {
                    // Success! Change to boat with logs
                    this.boat.setTexture('canal-boat2');
                    if (this.audioManager) this.audioManager.playSound('success');
                    
                    // Show success message
                    const { width, height } = this.scale;
                    const successText = this.add.text(width / 2, 60, '🎉 Tux got the logs! 🎉', {
                        fontSize: '32px',
                        color: '#2c3e50',
                        fontStyle: 'bold',
                        backgroundColor: '#ffffff',
                        padding: { x: 20, y: 10 }
                    }).setOrigin(0.5).setDepth(50);
                    
                    this.tweens.add({
                        targets: successText,
                        alpha: 0,
                        delay: 3000,
                        duration: 1000,
                        onComplete: () => successText.destroy()
                    });
                } else if (this.boatState === 'left') {
                    // Reset boat image when returning
                    this.boat.setTexture('canal-boat1');
                }
            }
        });
    }
}
