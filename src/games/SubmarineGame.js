import { LalelaGame } from '../utils/LalelaGame.js';

export class SubmarineGame extends LalelaGame {
    constructor() {
        super();
        this.waterLevel = 0; // 0 to 100
        this.velocity = 0;
        this.isFilling = false;
        this.isEmptying = false;
    }

    preload() {
        super.preload();
        this.load.image('sub_bg', 'assets/submarine/background.svg');
        this.load.image('sub_ship', 'assets/submarine/submarine.svg');
        this.load.image('sub_up', 'assets/submarine/up.svg');
        this.load.image('sub_down', 'assets/submarine/down.svg');
        this.load.image('sub_crown', 'assets/submarine/crown.svg');
    }

    create() {
        super.create();
        this.createBackground();
        this.createSubmarine();
        this.createControls();
        this.createTarget();
    }

    createBackground() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'sub_bg')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    createSubmarine() {
        this.submarine = this.add.image(this.cameras.main.centerX, 200, 'sub_ship')
            .setDisplaySize(150, 80);
    }

    createControls() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Fill button
        const fillBtn = this.add.image(cx + 300, cy + 100, 'sub_down').setDisplaySize(60, 60).setInteractive();
        fillBtn.on('pointerdown', () => this.isFilling = true);
        fillBtn.on('pointerup', () => this.isFilling = false);
        fillBtn.on('pointerout', () => this.isFilling = false);
        
        // Empty button
        const emptyBtn = this.add.image(cx + 300, cy - 100, 'sub_up').setDisplaySize(60, 60).setInteractive();
        emptyBtn.on('pointerdown', () => this.isEmptying = true);
        emptyBtn.on('pointerup', () => this.isEmptying = false);
        emptyBtn.on('pointerout', () => this.isEmptying = false);
        
        // Water level indicator
        this.waterText = this.add.text(cx + 300, cy, "Water: 0%", { fontSize: '24px', color: '#000' }).setOrigin(0.5);
    }

    createTarget() {
        this.targetDepth = Phaser.Math.Between(200, this.cameras.main.height - 100);
        this.crown = this.add.image(this.cameras.main.centerX, this.targetDepth, 'sub_crown')
            .setDisplaySize(40, 40);
    }

    update(time, delta) {
        if (this.isFilling) {
            this.waterLevel = Math.min(100, this.waterLevel + 0.5);
        }
        if (this.isEmptying) {
            this.waterLevel = Math.max(0, this.waterLevel - 0.5);
        }
        
        this.waterText.setText(`Water: ${Math.floor(this.waterLevel)}%`);
        
        // Physics simulation
        // Buoyancy force depends on displaced water vs weight
        // Weight increases with waterLevel
        // Buoyancy is constant (volume of sub)
        
        // Constants tuned for gameplay
        const gravity = 0.1;
        const buoyancy = 0.15; // Slightly more than gravity when empty
        const weight = 0.1 + (this.waterLevel / 100) * 0.1; // 0.1 to 0.2
        
        const netForce = weight - buoyancy; // Positive = down
        
        this.velocity += netForce;
        this.velocity *= 0.98; // Drag
        
        this.submarine.y += this.velocity;
        
        // Bounds
        if (this.submarine.y < 100) {
            this.submarine.y = 100;
            this.velocity = 0;
        }
        if (this.submarine.y > this.cameras.main.height - 50) {
            this.submarine.y = this.cameras.main.height - 50;
            this.velocity = 0;
        }
        
        // Check win
        if (Math.abs(this.submarine.y - this.targetDepth) < 20 && Math.abs(this.velocity) < 0.5) {
            // Win condition: stable near target
            if (!this.winTimer) {
                this.winTimer = this.time.delayedCall(2000, () => {
                    this.sound.play('success');
                    this.createTarget();
                    this.winTimer = null;
                });
            }
        } else {
            if (this.winTimer) {
                this.winTimer.remove();
                this.winTimer = null;
            }
        }
    }
}
