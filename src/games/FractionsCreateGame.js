import { LalelaGame } from '../utils/LalelaGame.js';

export class FractionsCreateGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'FractionsCreateGame',
            title: 'Create Fractions',
            description: 'Create the fraction shown.',
            category: 'math'
        });
    }

    setupGameLogic() {
        this.denominator = 2 + Math.floor(Math.random() * 8); // 2 to 9
        this.targetNumerator = 1 + Math.floor(Math.random() * (this.denominator - 1));
        this.currentNumerator = 0;
        
        this.createUI();
    }
    
    createUI() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Instruction
        this.add.text(cx, 100, `Create the fraction: ${this.targetNumerator}/${this.denominator}`, {
            fontSize: '48px',
            fontFamily: 'Fredoka One',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Pie Chart Container
        this.pieGraphics = this.add.graphics();
        this.drawPie();
        
        // Interaction
        // Create invisible click zones for each slice?
        // Or just click anywhere to increment?
        // GCompris usually lets you click slices to toggle them.
        
        // Let's make a circle interactive
        const hitArea = new Phaser.Geom.Circle(cx, cy, 150);
        
        this.input.on('pointerdown', (pointer) => {
            if (hitArea.contains(pointer.x, pointer.y)) {
                this.currentNumerator = (this.currentNumerator + 1) % (this.denominator + 1);
                this.drawPie();
                this.checkAnswer();
            }
        });
        
        // Reset button
        const resetBtn = this.add.text(cx, cy + 200, 'Reset', {
            fontSize: '32px',
            backgroundColor: '#e74c3c',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        resetBtn.on('pointerdown', () => {
            this.currentNumerator = 0;
            this.drawPie();
        });
    }
    
    drawPie() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const radius = 150;
        
        this.pieGraphics.clear();
        
        // Draw slices
        const anglePerSlice = (Math.PI * 2) / this.denominator;
        
        for (let i = 0; i < this.denominator; i++) {
            const startAngle = i * anglePerSlice - Math.PI / 2;
            const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
            
            this.pieGraphics.lineStyle(4, 0xFFFFFF);
            this.pieGraphics.fillStyle(i < this.currentNumerator ? 0x3498db : 0x2c3e50);
            
            this.pieGraphics.beginPath();
            this.pieGraphics.moveTo(cx, cy);
            this.pieGraphics.arc(cx, cy, radius, startAngle, endAngle);
            this.pieGraphics.closePath();
            this.pieGraphics.fillPath();
            this.pieGraphics.strokePath();
        }
    }
    
    checkAnswer() {
        if (this.currentNumerator === this.targetNumerator) {
            this.time.delayedCall(500, () => this.completeLevel());
        }
    }
}
