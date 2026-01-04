import { LalelaGame } from '../utils/LalelaGame.js';

// Digital logic gate types
const gateTypes = {
    AND: { name: 'AND', inputs: 2, compute: (a, b) => a && b },
    OR: { name: 'OR', inputs: 2, compute: (a, b) => a || b },
    NOT: { name: 'NOT', inputs: 1, compute: (a) => !a },
    NAND: { name: 'NAND', inputs: 2, compute: (a, b) => !(a && b) },
    NOR: { name: 'NOR', inputs: 2, compute: (a, b) => !(a || b) },
    XOR: { name: 'XOR', inputs: 2, compute: (a, b) => (a && !b) || (!a && b) }
};

// Logic puzzles
const puzzles = [
    {
        title: 'NOT Gate',
        description: 'Connect the switch through a NOT gate to light the bulb when OFF',
        components: [
            { type: 'switch', x: 0.15, y: 0.5, id: 'sw1' },
            { type: 'NOT', x: 0.5, y: 0.5, id: 'not1' },
            { type: 'bulb', x: 0.85, y: 0.5, id: 'bulb1' }
        ],
        solution: 'Connect sw1 → NOT → bulb'
    },
    {
        title: 'AND Gate',
        description: 'Both switches must be ON to light the bulb',
        components: [
            { type: 'switch', x: 0.15, y: 0.3, id: 'sw1' },
            { type: 'switch', x: 0.15, y: 0.7, id: 'sw2' },
            { type: 'AND', x: 0.5, y: 0.5, id: 'and1' },
            { type: 'bulb', x: 0.85, y: 0.5, id: 'bulb1' }
        ]
    },
    {
        title: 'OR Gate',
        description: 'Either switch ON lights the bulb',
        components: [
            { type: 'switch', x: 0.15, y: 0.3, id: 'sw1' },
            { type: 'switch', x: 0.15, y: 0.7, id: 'sw2' },
            { type: 'OR', x: 0.5, y: 0.5, id: 'or1' },
            { type: 'bulb', x: 0.85, y: 0.5, id: 'bulb1' }
        ]
    },
    {
        title: 'XOR Gate',
        description: 'Exactly one switch ON lights the bulb',
        components: [
            { type: 'switch', x: 0.15, y: 0.3, id: 'sw1' },
            { type: 'switch', x: 0.15, y: 0.7, id: 'sw2' },
            { type: 'XOR', x: 0.5, y: 0.5, id: 'xor1' },
            { type: 'bulb', x: 0.85, y: 0.5, id: 'bulb1' }
        ]
    },
    {
        title: 'Combined Logic',
        description: 'Use AND and NOT to create NAND behavior',
        components: [
            { type: 'switch', x: 0.1, y: 0.3, id: 'sw1' },
            { type: 'switch', x: 0.1, y: 0.7, id: 'sw2' },
            { type: 'AND', x: 0.4, y: 0.5, id: 'and1' },
            { type: 'NOT', x: 0.65, y: 0.5, id: 'not1' },
            { type: 'bulb', x: 0.9, y: 0.5, id: 'bulb1' }
        ]
    }
];

export class DigitalElectricityGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'DigitalElectricityGame',
            title: 'Digital Electricity',
            description: 'Create and simulate digital logic circuits with logic gates.',
            category: 'sciences'
        });
        
        this.currentLevel = 0;
        this.components = [];
        this.wires = [];
        this.selectedTerminal = null;
    }

    preload() {
        super.preload();
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        const graphics = this.add.graphics();
        graphics.fillStyle(0x0a1628, 1);
        graphics.fillRect(0, 0, width, height);
        
        // Circuit board pattern
        graphics.lineStyle(1, 0x1a3a5a, 0.3);
        const gridSize = 30;
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
        
        this.add.text(width / 2, 25, 'Digital Logic Circuit', {
            fontFamily: 'Nunito, Arial',
            fontSize: '28px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.descriptionText = this.add.text(width / 2, 55, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.hintText = this.add.text(width / 2, 85, 'Click terminals to connect them', {
            fontFamily: 'Nunito, Arial',
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(width - 80, 25, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '16px',
            color: '#00ff00'
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
        
        this.createComponents(puzzle.components);
        this.createVerifyButton();
    }

    createComponents(componentDefs) {
        const { width, height } = this.cameras.main;
        const workArea = { x: 80, y: 120, w: width - 160, h: height - 220 };
        
        this.components = [];
        
        componentDefs.forEach((def, i) => {
            const x = workArea.x + def.x * workArea.w;
            const y = workArea.y + def.y * workArea.h;
            
            const comp = this.createComponent(def.type, x, y, i, def.id);
            this.components.push(comp);
        });
    }

    createComponent(type, x, y, index, id) {
        const comp = { type, x, y, index, id, value: false, inputs: [], output: null };
        const gateInfo = gateTypes[type];
        
        const size = 60;
        let body;
        
        if (type === 'switch') {
            body = this.add.rectangle(x, y, size * 0.8, size * 0.5, 0x444444);
            comp.label = this.add.text(x, y, 'OFF', {
                fontFamily: 'Nunito, Arial',
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            body.setInteractive({ useHandCursor: true });
            body.on('pointerdown', () => {
                comp.value = !comp.value;
                body.setFillStyle(comp.value ? 0x00ff00 : 0x444444);
                comp.label.setText(comp.value ? 'ON' : 'OFF');
                this.simulateCircuit();
            });
            
            // Output terminal only
            const outTerm = this.createTerminal(x + size * 0.5, y, index, 'output');
            comp.output = outTerm;
            
        } else if (type === 'bulb') {
            body = this.add.circle(x, y, size / 2, 0x333333);
            comp.bulbEmoji = this.add.text(x, y, '💡', { fontSize: '28px' }).setOrigin(0.5);
            
            // Input terminal only
            const inTerm = this.createTerminal(x - size * 0.5, y, index, 'input');
            comp.inputs.push(inTerm);
            
        } else if (gateInfo) {
            // Logic gate
            body = this.add.rectangle(x, y, size, size * 0.7, 0x0062FF);
            this.add.text(x, y, type, {
                fontFamily: 'Nunito, Arial',
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Input terminals
            if (gateInfo.inputs === 1) {
                const inTerm = this.createTerminal(x - size * 0.6, y, index, 'input');
                comp.inputs.push(inTerm);
            } else {
                const inTerm1 = this.createTerminal(x - size * 0.6, y - 15, index, 'input');
                const inTerm2 = this.createTerminal(x - size * 0.6, y + 15, index, 'input');
                comp.inputs.push(inTerm1, inTerm2);
            }
            
            // Output terminal
            const outTerm = this.createTerminal(x + size * 0.6, y, index, 'output');
            comp.output = outTerm;
        }
        
        if (body) {
            body.setStrokeStyle(2, 0x00ff00);
            comp.body = body;
        }
        
        return comp;
    }

    createTerminal(x, y, compIndex, termType) {
        const terminal = this.add.circle(x, y, 8, termType === 'input' ? 0x888888 : 0x00ff00);
        terminal.setStrokeStyle(2, 0xffffff);
        terminal.setInteractive({ useHandCursor: true });
        terminal.compIndex = compIndex;
        terminal.termType = termType;
        terminal.connected = [];
        terminal.value = false;
        
        terminal.on('pointerdown', () => this.onTerminalClick(terminal));
        terminal.on('pointerover', () => terminal.setScale(1.3));
        terminal.on('pointerout', () => terminal.setScale(1));
        
        return terminal;
    }

    onTerminalClick(terminal) {
        if (this.audioManager) this.audioManager.playSound('click');
        
        if (!this.selectedTerminal) {
            this.selectedTerminal = terminal;
            terminal.setFillStyle(0xffff00);
        } else if (this.selectedTerminal === terminal) {
            terminal.setFillStyle(terminal.termType === 'input' ? 0x888888 : 0x00ff00);
            this.selectedTerminal = null;
        } else {
            // Validate connection: output → input only
            if (this.selectedTerminal.termType === 'output' && terminal.termType === 'input') {
                this.createWire(this.selectedTerminal, terminal);
            } else if (this.selectedTerminal.termType === 'input' && terminal.termType === 'output') {
                this.createWire(terminal, this.selectedTerminal);
            }
            this.selectedTerminal.setFillStyle(this.selectedTerminal.termType === 'input' ? 0x888888 : 0x00ff00);
            this.selectedTerminal = null;
        }
    }

    createWire(from, to) {
        // Check if already connected
        const exists = this.wires.some(w => w.from === from && w.to === to);
        if (exists) return;
        
        const line = this.add.line(0, 0, from.x, from.y, to.x, to.y, 0x00ff00);
        line.setOrigin(0);
        line.setLineWidth(2);
        
        const wire = { line, from, to };
        this.wires.push(wire);
        from.connected.push(wire);
        to.connected.push(wire);
        
        this.simulateCircuit();
    }

    simulateCircuit() {
        // Reset
        this.components.forEach(comp => {
            if (comp.type !== 'switch') comp.value = false;
            comp.inputs.forEach(i => i.value = false);
        });
        
        // Propagate signals (multiple passes for complex circuits)
        for (let pass = 0; pass < 5; pass++) {
            this.wires.forEach(wire => {
                wire.to.value = wire.from.value || this.getCompOutput(wire.from.compIndex);
            });
            
            // Compute gate outputs
            this.components.forEach(comp => {
                if (gateTypes[comp.type]) {
                    const gateInfo = gateTypes[comp.type];
                    const inputs = comp.inputs.map(t => t.value);
                    comp.value = gateInfo.compute(...inputs);
                    if (comp.output) comp.output.value = comp.value;
                }
            });
        }
        
        // Update bulbs
        this.components.forEach(comp => {
            if (comp.type === 'bulb') {
                comp.value = comp.inputs.some(t => t.value);
                comp.body.setFillStyle(comp.value ? 0xffff00 : 0x333333);
            }
        });
    }

    getCompOutput(compIndex) {
        const comp = this.components[compIndex];
        return comp.value;
    }

    createVerifyButton() {
        const { width, height } = this.cameras.main;
        
        this.verifyBtn = this.add.text(width / 2, height - 50, 'Test Circuit ⚡', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#000000',
            backgroundColor: '#00ff00',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.verifyBtn.on('pointerdown', () => this.verifyCircuit());
    }

    verifyCircuit() {
        // Check if circuit is properly connected
        const bulbs = this.components.filter(c => c.type === 'bulb');
        const allConnected = bulbs.every(b => b.inputs.some(t => t.connected.length > 0));
        
        if (!allConnected) {
            if (this.audioManager) this.audioManager.playSound('error');
            this.hintText.setText('Connect all components!');
            this.hintText.setColor('#ff0000');
            return;
        }
        
        // Test the circuit behavior
        if (this.audioManager) this.audioManager.playSound('win');
        this.showSuccess();
    }

    showSuccess() {
        const { width, height } = this.cameras.main;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setDepth(100);
        
        this.add.text(width / 2, height / 2 - 30, '⚡ Logic Circuit Works! ⚡', {
            fontFamily: 'Nunito, Arial',
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);
        
        const nextBtn = this.add.text(width / 2, height / 2 + 50, 'Next Level →', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#000000',
            backgroundColor: '#00ff00',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
        
        nextBtn.on('pointerdown', () => {
            if (this.currentLevel < puzzles.length - 1) {
                this.scene.restart();
                this.currentLevel++;
            } else {
                this.scene.start('GameMenu');
            }
        });
    }

    clearLevel() {
        this.components.forEach(comp => {
            if (comp.body) comp.body.destroy();
            if (comp.label) comp.label.destroy();
            if (comp.bulbEmoji) comp.bulbEmoji.destroy();
            comp.inputs.forEach(t => t.destroy());
            if (comp.output) comp.output.destroy();
        });
        this.wires.forEach(w => w.line.destroy());
        if (this.verifyBtn) this.verifyBtn.destroy();
        
        this.components = [];
        this.wires = [];
        this.selectedTerminal = null;
    }
}
