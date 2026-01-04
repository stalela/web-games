import { LalelaGame } from '../utils/LalelaGame.js';

// Circuit component types
const componentTypes = {
    WIRE: 'wire',
    BATTERY: 'battery',
    BULB: 'bulb',
    SWITCH: 'switch',
    RESISTOR: 'resistor',
    LED: 'led'
};

// Pre-defined circuit puzzles
const puzzles = [
    {
        title: 'Simple Circuit',
        description: 'Connect the battery to the bulb to make it light up!',
        components: [
            { type: 'battery', x: 0.2, y: 0.5, fixed: true },
            { type: 'bulb', x: 0.8, y: 0.5, fixed: true }
        ],
        solution: [[0, 1]] // Connect battery to bulb
    },
    {
        title: 'Switch Control',
        description: 'Add a switch to control the bulb.',
        components: [
            { type: 'battery', x: 0.2, y: 0.5, fixed: true },
            { type: 'switch', x: 0.5, y: 0.5, fixed: true },
            { type: 'bulb', x: 0.8, y: 0.5, fixed: true }
        ],
        solution: [[0, 1], [1, 2]]
    },
    {
        title: 'Series Circuit',
        description: 'Connect two bulbs in series.',
        components: [
            { type: 'battery', x: 0.2, y: 0.5, fixed: true },
            { type: 'bulb', x: 0.5, y: 0.3, fixed: true },
            { type: 'bulb', x: 0.5, y: 0.7, fixed: true }
        ],
        solution: [[0, 1], [1, 2], [2, 0]]
    },
    {
        title: 'Parallel Circuit',
        description: 'Connect two bulbs in parallel.',
        components: [
            { type: 'battery', x: 0.2, y: 0.5, fixed: true },
            { type: 'bulb', x: 0.7, y: 0.3, fixed: true },
            { type: 'bulb', x: 0.7, y: 0.7, fixed: true }
        ],
        solution: [[0, 1], [0, 2], [1, 0], [2, 0]] // Multiple valid paths
    }
];

export class AnalogElectricityGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'AnalogElectricityGame',
            title: 'Analog Electricity',
            description: 'Create and simulate analog electric circuits.',
            category: 'sciences'
        });
        
        this.currentLevel = 0;
        this.components = [];
        this.wires = [];
        this.selectedTerminal = null;
        this.circuitPowered = false;
    }

    preload() {
        super.preload();
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        // Grid background
        const graphics = this.add.graphics();
        graphics.fillStyle(0x1a2a3a, 1);
        graphics.fillRect(0, 0, width, height);
        
        // Draw grid
        graphics.lineStyle(1, 0x2a3a4a, 0.5);
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
            graphics.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
            graphics.lineBetween(0, y, width, y);
        }
        graphics.setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        const { width } = this.cameras.main;
        
        this.add.text(width / 2, 25, 'Analog Electricity', {
            fontFamily: 'Nunito, Arial',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.descriptionText = this.add.text(width / 2, 55, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.statusText = this.add.text(width / 2, 85, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#FACA2A'
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(width - 80, 25, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.clearLevel();
        
        const puzzle = puzzles[levelIndex];
        this.descriptionText.setText(puzzle.description);
        this.levelText.setText(`Level: ${levelIndex + 1}/${puzzles.length}`);
        this.statusText.setText('Connect the components!');
        
        this.createComponents(puzzle.components);
        this.createTestButton();
    }

    createComponents(componentDefs) {
        const { width, height } = this.cameras.main;
        const workArea = { x: 100, y: 120, w: width - 200, h: height - 200 };
        
        this.components = [];
        
        componentDefs.forEach((def, i) => {
            const x = workArea.x + def.x * workArea.w;
            const y = workArea.y + def.y * workArea.h;
            
            const comp = this.createComponent(def.type, x, y, i);
            this.components.push(comp);
        });
    }

    createComponent(type, x, y, index) {
        const comp = { type, x, y, index, terminals: [], powered: false };
        
        // Component body
        let body;
        const size = 60;
        
        switch (type) {
            case 'battery':
                body = this.add.rectangle(x, y, size, size * 0.6, 0x00B378);
                this.add.text(x, y, '🔋', { fontSize: '28px' }).setOrigin(0.5);
                break;
            case 'bulb':
                body = this.add.circle(x, y, size / 2, 0x888888);
                comp.bulbGlow = this.add.circle(x, y, size / 2 + 5, 0xffff00, 0);
                this.add.text(x, y, '💡', { fontSize: '28px' }).setOrigin(0.5);
                break;
            case 'switch':
                body = this.add.rectangle(x, y, size, size * 0.4, 0xF08A00);
                this.add.text(x, y, '🔌', { fontSize: '24px' }).setOrigin(0.5);
                comp.closed = true;
                body.setInteractive({ useHandCursor: true });
                body.on('pointerdown', () => {
                    comp.closed = !comp.closed;
                    body.setFillStyle(comp.closed ? 0xF08A00 : 0x444444);
                    this.simulateCircuit();
                });
                break;
            case 'resistor':
                body = this.add.rectangle(x, y, size, size * 0.3, 0xA74BFF);
                this.add.text(x, y, 'R', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
                break;
            case 'led':
                body = this.add.triangle(x, y, 0, 30, 15, 0, 30, 30, 0xE65B48);
                comp.ledGlow = this.add.circle(x, y, 20, 0xff0000, 0);
                break;
            default:
                body = this.add.rectangle(x, y, size, size, 0x666666);
        }
        
        body.setStrokeStyle(2, 0xffffff);
        comp.body = body;
        
        // Create terminals (connection points)
        const terminalOffsets = [
            { dx: -size / 2 - 10, dy: 0 },
            { dx: size / 2 + 10, dy: 0 }
        ];
        
        terminalOffsets.forEach((offset, ti) => {
            const tx = x + offset.dx;
            const ty = y + offset.dy;
            
            const terminal = this.add.circle(tx, ty, 8, 0x0062FF);
            terminal.setStrokeStyle(2, 0xffffff);
            terminal.setInteractive({ useHandCursor: true });
            terminal.compIndex = index;
            terminal.termIndex = ti;
            
            terminal.on('pointerdown', () => {
                this.onTerminalClick(terminal);
            });
            
            terminal.on('pointerover', () => {
                terminal.setScale(1.3);
            });
            
            terminal.on('pointerout', () => {
                terminal.setScale(1);
            });
            
            comp.terminals.push({ circle: terminal, x: tx, y: ty, connected: [] });
        });
        
        return comp;
    }

    onTerminalClick(terminal) {
        if (this.audioManager) this.audioManager.playSound('click');
        
        if (this.selectedTerminal === null) {
            // Select this terminal
            this.selectedTerminal = terminal;
            terminal.setFillStyle(0xffff00);
        } else if (this.selectedTerminal === terminal) {
            // Deselect
            this.selectedTerminal.setFillStyle(0x0062FF);
            this.selectedTerminal = null;
        } else {
            // Create wire between terminals
            this.createWire(this.selectedTerminal, terminal);
            this.selectedTerminal.setFillStyle(0x0062FF);
            this.selectedTerminal = null;
        }
    }

    createWire(t1, t2) {
        const comp1 = this.components[t1.compIndex];
        const comp2 = this.components[t2.compIndex];
        const term1 = comp1.terminals[t1.termIndex];
        const term2 = comp2.terminals[t2.termIndex];
        
        // Check if wire already exists
        const exists = this.wires.some(w => 
            (w.from.compIndex === t1.compIndex && w.from.termIndex === t1.termIndex &&
             w.to.compIndex === t2.compIndex && w.to.termIndex === t2.termIndex) ||
            (w.from.compIndex === t2.compIndex && w.from.termIndex === t2.termIndex &&
             w.to.compIndex === t1.compIndex && w.to.termIndex === t1.termIndex)
        );
        
        if (exists) return;
        
        const line = this.add.line(0, 0, term1.x, term1.y, term2.x, term2.y, 0x00ff00);
        line.setOrigin(0, 0);
        line.setLineWidth(3);
        
        const wire = {
            line,
            from: { compIndex: t1.compIndex, termIndex: t1.termIndex },
            to: { compIndex: t2.compIndex, termIndex: t2.termIndex }
        };
        
        this.wires.push(wire);
        term1.connected.push(wire);
        term2.connected.push(wire);
        
        this.simulateCircuit();
    }

    simulateCircuit() {
        // Reset all components
        this.components.forEach(comp => {
            comp.powered = false;
            if (comp.bulbGlow) comp.bulbGlow.setAlpha(0);
            if (comp.ledGlow) comp.ledGlow.setAlpha(0);
        });
        
        // Find battery
        const battery = this.components.find(c => c.type === 'battery');
        if (!battery) return;
        
        // Simple circuit simulation - trace from battery
        const visited = new Set();
        const queue = [battery.index];
        
        while (queue.length > 0) {
            const compIdx = queue.shift();
            if (visited.has(compIdx)) continue;
            visited.add(compIdx);
            
            const comp = this.components[compIdx];
            
            // Check if switch blocks current
            if (comp.type === 'switch' && !comp.closed) continue;
            
            comp.powered = true;
            
            // Light up bulbs/LEDs
            if (comp.type === 'bulb' && comp.bulbGlow) {
                comp.bulbGlow.setAlpha(0.8);
            }
            if (comp.type === 'led' && comp.ledGlow) {
                comp.ledGlow.setAlpha(0.8);
            }
            
            // Find connected components
            comp.terminals.forEach(term => {
                term.connected.forEach(wire => {
                    const nextIdx = wire.from.compIndex === compIdx ? wire.to.compIndex : wire.from.compIndex;
                    if (!visited.has(nextIdx)) {
                        queue.push(nextIdx);
                    }
                });
            });
        }
        
        // Check if circuit is complete (returns to battery)
        this.circuitPowered = visited.size > 1 && battery.terminals.some(t => 
            t.connected.some(w => {
                const otherIdx = w.from.compIndex === battery.index ? w.to.compIndex : w.from.compIndex;
                return visited.has(otherIdx) && otherIdx !== battery.index;
            })
        );
        
        this.updateStatus();
    }

    updateStatus() {
        const allBulbsLit = this.components
            .filter(c => c.type === 'bulb' || c.type === 'led')
            .every(c => c.powered);
        
        if (allBulbsLit && this.components.filter(c => c.type === 'bulb' || c.type === 'led').length > 0) {
            this.statusText.setText('✓ Circuit working!');
            this.statusText.setColor('#00ff00');
        } else {
            this.statusText.setText('Connect the components!');
            this.statusText.setColor('#FACA2A');
        }
    }

    createTestButton() {
        const { width, height } = this.cameras.main;
        
        this.testBtn = this.add.text(width / 2, height - 50, 'Check Solution ✓', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0062FF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.testBtn.on('pointerdown', () => this.checkSolution());
    }

    checkSolution() {
        const allBulbsLit = this.components
            .filter(c => c.type === 'bulb' || c.type === 'led')
            .every(c => c.powered);
        
        if (allBulbsLit) {
            if (this.audioManager) this.audioManager.playSound('win');
            this.showWin();
        } else {
            if (this.audioManager) this.audioManager.playSound('error');
            this.statusText.setText('Not all components are connected!');
        }
    }

    showWin() {
        const { width, height } = this.cameras.main;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(100);
        
        this.add.text(width / 2, height / 2 - 30, '⚡ Circuit Complete! ⚡', {
            fontFamily: 'Nunito, Arial',
            fontSize: '36px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);
        
        const nextBtn = this.add.text(width / 2, height / 2 + 50, 'Next Puzzle →', {
            fontFamily: 'Nunito, Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#0062FF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
        
        nextBtn.on('pointerdown', () => {
            if (this.currentLevel < puzzles.length - 1) {
                overlay.destroy();
                nextBtn.destroy();
                this.startLevel(this.currentLevel + 1);
            } else {
                this.scene.start('GameMenu');
            }
        });
    }

    clearLevel() {
        this.components.forEach(comp => {
            comp.body.destroy();
            if (comp.bulbGlow) comp.bulbGlow.destroy();
            if (comp.ledGlow) comp.ledGlow.destroy();
            comp.terminals.forEach(t => t.circle.destroy());
        });
        this.wires.forEach(w => w.line.destroy());
        if (this.testBtn) this.testBtn.destroy();
        
        this.components = [];
        this.wires = [];
        this.selectedTerminal = null;
    }
}
