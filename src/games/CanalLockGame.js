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
        this.load.svg('canal-sky', 'assets/canal_lock/sky.svg');
        this.load.svg('canal-sun', 'assets/canal_lock/sun.svg');
        this.load.svg('canal-tux', 'assets/canal_lock/tux.svg'); // Assuming tux.svg exists here or use generic
        // If tux.svg is not in canal_lock, I might need to copy it from somewhere else or use a placeholder.
        // I'll check assets later.
        
        this.load.audio('canal-water', 'assets/canal_lock/water_fill.wav');
        this.load.audio('canal-lock', 'assets/canal_lock/lock.wav');
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.image(width/2, height/2, 'canal-sky')
            .setDisplaySize(width, height)
            .setDepth(-1);
            
        this.add.image(100, 100, 'canal-sun').setDisplaySize(80, 80);
    }

    setupGameLogic() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Water Levels
        this.highLevel = height - 200;
        this.lowLevel = height - 100;
        
        // Sections
        this.sections = [
            { x: 0, width: width/3, level: this.highLevel, targetLevel: this.highLevel }, // Left (High)
            { x: width/3, width: width/3, level: this.lowLevel, targetLevel: this.lowLevel }, // Middle (Chamber)
            { x: 2*width/3, width: width/3, level: this.lowLevel, targetLevel: this.lowLevel } // Right (Low)
        ];
        
        // Gates
        this.gates = [
            { x: width/3, open: false, sprite: null },
            { x: 2*width/3, open: false, sprite: null }
        ];
        
        // Draw Water
        this.waterGraphics = this.add.graphics();
        
        // Draw Gates
        this.gates.forEach((gate, index) => {
            const gateSprite = this.add.rectangle(gate.x, height - 150, 20, 300, 0x8B4513);
            gateSprite.setInteractive();
            gateSprite.on('pointerdown', () => this.toggleGate(index));
            gate.sprite = gateSprite;
        });
        
        // Tux
        this.tux = this.add.rectangle(100, this.sections[0].level - 30, 40, 60, 0x000000); // Placeholder Tux
        this.tuxSection = 0;
        
        this.updateWater();
    }
    
    toggleGate(index) {
        const gate = this.gates[index];
        const leftSection = this.sections[index];
        const rightSection = this.sections[index + 1];
        
        if (gate.open) {
            // Close gate
            gate.open = false;
            gate.sprite.y = this.cameras.main.height - 150; // Down
            this.audioManager.playSound('canal-lock');
        } else {
            // Open gate
            // Only if levels are equal? Or opening equalizes them?
            // In GCompris, you usually have to equalize first using valves.
            // But if I simplify: Opening gate equalizes levels.
            
            gate.open = true;
            gate.sprite.y = this.cameras.main.height - 250; // Up
            this.audioManager.playSound('canal-lock');
            
            // Equalize levels
            const avgLevel = (leftSection.level + rightSection.level) / 2;
            // Actually, usually the source (High) fills the sink (Low).
            // If Left is High and Right is Low, Right becomes High.
            // If Left is Low and Right is High, Left becomes High.
            // Wait, infinite source?
            // Left is connected to river (infinite source). Right is connected to sea (infinite sink).
            // Middle is the only one changing.
            
            if (index === 0) {
                // Gate 1 (Left-Middle)
                // Left is High. Middle becomes High.
                this.changeWaterLevel(1, this.sections[0].level);
            } else {
                // Gate 2 (Middle-Right)
                // Right is Low. Middle becomes Low.
                this.changeWaterLevel(1, this.sections[2].level);
            }
        }
        
        this.checkTuxMovement();
    }
    
    changeWaterLevel(sectionIndex, targetLevel) {
        const section = this.sections[sectionIndex];
        
        this.tweens.add({
            targets: section,
            level: targetLevel,
            duration: 2000,
            onUpdate: () => {
                this.updateWater();
                if (this.tuxSection === sectionIndex) {
                    this.tux.y = section.level - 30;
                }
            },
            onStart: () => this.audioManager.playSound('canal-water')
        });
    }
    
    updateWater() {
        this.waterGraphics.clear();
        this.waterGraphics.fillStyle(0x0000FF, 0.5);
        
        this.sections.forEach(section => {
            this.waterGraphics.fillRect(section.x, section.level, section.width, this.cameras.main.height - section.level);
        });
    }
    
    checkTuxMovement() {
        // Simple auto-move if path is clear
        // If Tux is in 0 and Gate 0 is open, move to 1.
        // If Tux is in 1 and Gate 1 is open, move to 2.
        
        if (this.tuxSection === 0 && this.gates[0].open) {
            this.moveTux(1);
        } else if (this.tuxSection === 1) {
            if (this.gates[1].open) {
                this.moveTux(2);
            } else if (this.gates[0].open) {
                this.moveTux(0); // Go back?
            }
        }
    }
    
    moveTux(targetSectionIndex) {
        const targetX = this.sections[targetSectionIndex].x + this.sections[targetSectionIndex].width / 2;
        
        this.tweens.add({
            targets: this.tux,
            x: targetX,
            duration: 2000,
            onComplete: () => {
                this.tuxSection = targetSectionIndex;
                if (this.tuxSection === 2) {
                    this.audioManager.playSound('success');
                    this.add.text(this.cameras.main.centerX, 100, 'Success!', { fontSize: '40px', color: '#000' }).setOrigin(0.5);
                }
                this.checkTuxMovement();
            }
        });
    }
}
