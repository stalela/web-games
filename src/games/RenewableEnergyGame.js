import { LalelaGame } from '../utils/LalelaGame.js';

// Energy sources and consumers
const energySystem = {
    producers: [
        { id: 'sun', name: 'Sun', emoji: '☀️', x: 0.15, y: 0.15, type: 'source' },
        { id: 'wind', name: 'Wind Farm', emoji: '🌬️', x: 0.35, y: 0.2, type: 'producer', requires: 'sun' },
        { id: 'solar', name: 'Solar Panels', emoji: '🔆', x: 0.55, y: 0.15, type: 'producer', requires: 'sun' },
        { id: 'dam', name: 'Hydro Dam', emoji: '🌊', x: 0.75, y: 0.2, type: 'producer', requires: 'cloud' },
        { id: 'cloud', name: 'Rain Cloud', emoji: '🌧️', x: 0.85, y: 0.1, type: 'source' }
    ],
    transformers: [
        { id: 'trans1', name: 'Transformer 1', emoji: '⚡', x: 0.35, y: 0.45, requires: 'wind' },
        { id: 'trans2', name: 'Transformer 2', emoji: '⚡', x: 0.55, y: 0.45, requires: 'solar' },
        { id: 'trans3', name: 'Transformer 3', emoji: '⚡', x: 0.75, y: 0.45, requires: 'dam' }
    ],
    consumers: [
        { id: 'house', name: 'Tux House', emoji: '🏠', x: 0.5, y: 0.75, requiresAny: ['trans1', 'trans2', 'trans3'] },
        { id: 'light', name: 'Light', emoji: '💡', x: 0.5, y: 0.75, requiresAll: ['house'], interactive: true }
    ]
};

export class RenewableEnergyGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'RenewableEnergyGame',
            title: 'Renewable Energy',
            description: 'Learn about renewable energy by powering Tux\'s house.',
            category: 'sciences'
        });
        
        this.activeElements = new Set();
        this.elements = {};
        this.powerLines = [];
    }

    preload() {
        super.preload();
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        // Sky gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D8E8, 0x98D8E8, 1);
        graphics.fillRect(0, 0, width, height * 0.6);
        
        // Ground
        graphics.fillGradientStyle(0x228B22, 0x228B22, 0x32CD32, 0x32CD32, 1);
        graphics.fillRect(0, height * 0.6, width, height * 0.4);
        
        // Mountains
        graphics.fillStyle(0x556B2F, 1);
        graphics.beginPath();
        graphics.moveTo(0, height * 0.6);
        graphics.lineTo(width * 0.2, height * 0.35);
        graphics.lineTo(width * 0.4, height * 0.6);
        graphics.closePath();
        graphics.fill();
        
        graphics.beginPath();
        graphics.moveTo(width * 0.5, height * 0.6);
        graphics.lineTo(width * 0.7, height * 0.4);
        graphics.lineTo(width * 0.9, height * 0.6);
        graphics.closePath();
        graphics.fill();
        
        graphics.setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        const { width } = this.cameras.main;
        
        this.add.text(width / 2, 25, 'Renewable Energy', {
            fontFamily: 'Nunito, Arial',
            fontSize: '28px',
            color: '#1a5276',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.instructionText = this.add.text(width / 2, 55, 
            'Click on elements to activate them and power Tux\'s house!', {
            fontFamily: 'Nunito, Arial',
            fontSize: '16px',
            color: '#2c3e50'
        }).setOrigin(0.5);
        
        this.statusText = this.add.text(width / 2, 85, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#e74c3c'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.createEnergyElements();
        this.createPowerLines();
    }

    createEnergyElements() {
        const { width, height } = this.cameras.main;
        const workArea = { x: 50, y: 100, w: width - 100, h: height - 180 };
        
        // Create all elements
        [...energySystem.producers, ...energySystem.transformers, ...energySystem.consumers]
            .forEach(def => {
                const x = workArea.x + def.x * workArea.w;
                const y = workArea.y + def.y * workArea.h;
                
                this.createEnergyElement(def, x, y);
            });
    }

    createEnergyElement(def, x, y) {
        const size = 70;
        
        // Background circle
        const bg = this.add.circle(x, y, size / 2, 0x333333, 0.3);
        bg.setStrokeStyle(3, 0x666666);
        
        // Emoji
        const emoji = this.add.text(x, y - 10, def.emoji, {
            fontSize: '32px'
        }).setOrigin(0.5);
        
        // Label
        const label = this.add.text(x, y + 25, def.name, {
            fontFamily: 'Nunito, Arial',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Make interactive if not a base source with requirements
        if (def.type !== 'source' || !def.requires) {
            bg.setInteractive({ useHandCursor: true });
            
            bg.on('pointerdown', () => {
                this.toggleElement(def.id);
            });
            
            bg.on('pointerover', () => {
                bg.setScale(1.1);
                emoji.setScale(1.1);
            });
            
            bg.on('pointerout', () => {
                bg.setScale(1);
                emoji.setScale(1);
            });
        }
        
        this.elements[def.id] = {
            def,
            bg,
            emoji,
            label,
            x,
            y,
            active: false
        };
    }

    toggleElement(id) {
        const element = this.elements[id];
        if (!element) return;
        
        const def = element.def;
        
        // Check requirements
        if (def.requires && !this.activeElements.has(def.requires)) {
            this.statusText.setText(`${def.name} needs ${this.elements[def.requires]?.def.name || def.requires} first!`);
            if (this.audioManager) this.audioManager.playSound('error');
            return;
        }
        
        if (def.requiresAny && !def.requiresAny.some(r => this.activeElements.has(r))) {
            this.statusText.setText(`${def.name} needs power from a transformer!`);
            if (this.audioManager) this.audioManager.playSound('error');
            return;
        }
        
        if (def.requiresAll && !def.requiresAll.every(r => this.activeElements.has(r))) {
            const missing = def.requiresAll.find(r => !this.activeElements.has(r));
            this.statusText.setText(`${def.name} needs ${this.elements[missing]?.def.name || missing} first!`);
            if (this.audioManager) this.audioManager.playSound('error');
            return;
        }
        
        // Toggle element
        if (this.activeElements.has(id)) {
            this.deactivateElement(id);
        } else {
            this.activateElement(id);
        }
        
        this.updatePowerLines();
        this.checkWinCondition();
    }

    activateElement(id) {
        const element = this.elements[id];
        if (!element || element.active) return;
        
        element.active = true;
        this.activeElements.add(id);
        
        element.bg.setFillStyle(0x27ae60, 0.8);
        element.bg.setStrokeStyle(4, 0x2ecc71);
        
        if (this.audioManager) this.audioManager.playSound('click');
        
        // Auto-activate sources
        if (element.def.type === 'source') {
            // Sources are always active once clicked
        }
        
        this.statusText.setText(`${element.def.name} activated!`);
    }

    deactivateElement(id) {
        const element = this.elements[id];
        if (!element || !element.active) return;
        
        element.active = false;
        this.activeElements.delete(id);
        
        element.bg.setFillStyle(0x333333, 0.3);
        element.bg.setStrokeStyle(3, 0x666666);
        
        // Deactivate dependents
        Object.values(this.elements).forEach(el => {
            if (el.def.requires === id && el.active) {
                this.deactivateElement(el.def.id);
            }
        });
    }

    createPowerLines() {
        const connections = [
            ['sun', 'wind'],
            ['sun', 'solar'],
            ['cloud', 'dam'],
            ['wind', 'trans1'],
            ['solar', 'trans2'],
            ['dam', 'trans3'],
            ['trans1', 'house'],
            ['trans2', 'house'],
            ['trans3', 'house']
        ];
        
        connections.forEach(([from, to]) => {
            const e1 = this.elements[from];
            const e2 = this.elements[to];
            
            if (e1 && e2) {
                const line = this.add.line(0, 0, e1.x, e1.y, e2.x, e2.y, 0x666666);
                line.setOrigin(0);
                line.setLineWidth(2);
                line.setDepth(-0.5);
                
                this.powerLines.push({ line, from, to, active: false });
            }
        });
    }

    updatePowerLines() {
        this.powerLines.forEach(pl => {
            const fromActive = this.activeElements.has(pl.from);
            const toActive = this.activeElements.has(pl.to);
            
            if (fromActive && toActive) {
                pl.line.setStrokeStyle(4, 0xf1c40f);
                pl.active = true;
            } else {
                pl.line.setStrokeStyle(2, 0x666666);
                pl.active = false;
            }
        });
    }

    checkWinCondition() {
        // Win when house is powered and light is on
        if (this.activeElements.has('house') && this.activeElements.has('light')) {
            this.showWin();
        } else if (this.activeElements.has('house')) {
            this.statusText.setText('House is powered! Now turn on the light! 💡');
            this.statusText.setColor('#27ae60');
        }
    }

    showWin() {
        if (this.audioManager) this.audioManager.playSound('win');
        
        const { width, height } = this.cameras.main;
        
        // Tux celebration
        const tux = this.add.text(this.elements['house'].x + 50, this.elements['house'].y, '🐧', {
            fontSize: '48px'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: tux,
            y: tux.y - 30,
            duration: 500,
            yoyo: true,
            repeat: 2
        });
        
        this.time.delayedCall(1500, () => {
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
            overlay.setDepth(100);
            
            this.add.text(width / 2, height / 2 - 50, '🌍 Renewable Energy Success! 🌱', {
                fontFamily: 'Nunito, Arial',
                fontSize: '32px',
                color: '#2ecc71',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(101);
            
            this.add.text(width / 2, height / 2, 'Tux\'s house is now powered by clean energy!', {
                fontFamily: 'Nunito, Arial',
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(101);
            
            const backBtn = this.add.text(width / 2, height / 2 + 80, 'Back to Menu', {
                fontFamily: 'Nunito, Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#27ae60',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
            
            backBtn.on('pointerdown', () => {
                this.scene.start('GameMenu');
            });
        });
    }
}
