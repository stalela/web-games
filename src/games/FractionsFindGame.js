import { LalelaGame } from '../utils/LalelaGame.js';

export class FractionsFindGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'FractionsFindGame',
            title: 'Find Fractions',
            description: 'Select the fraction that matches the pie chart.',
            category: 'math'
        });
    }

    setupGameLogic() {
        this.denominator = 2 + Math.floor(Math.random() * 8);
        this.numerator = 1 + Math.floor(Math.random() * (this.denominator - 1));
        
        this.createUI();
    }
    
    createUI() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Draw Pie
        this.pieGraphics = this.add.graphics();
        this.drawPie(cx, cy - 100, 100, this.numerator, this.denominator);
        
        // Options
        this.createOptions(cx, cy + 100);
    }
    
    drawPie(x, y, radius, num, den) {
        const anglePerSlice = (Math.PI * 2) / den;
        
        for (let i = 0; i < den; i++) {
            const startAngle = i * anglePerSlice - Math.PI / 2;
            const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
            
            this.pieGraphics.lineStyle(4, 0xFFFFFF);
            this.pieGraphics.fillStyle(i < num ? 0x3498db : 0x2c3e50);
            
            this.pieGraphics.beginPath();
            this.pieGraphics.moveTo(x, y);
            this.pieGraphics.arc(x, y, radius, startAngle, endAngle);
            this.pieGraphics.closePath();
            this.pieGraphics.fillPath();
            this.pieGraphics.strokePath();
        }
    }
    
    createOptions(x, y) {
        const correct = { n: this.numerator, d: this.denominator };
        const options = [correct];
        
        while (options.length < 3) {
            const d = 2 + Math.floor(Math.random() * 8);
            const n = 1 + Math.floor(Math.random() * (d - 1));
            if (!options.some(o => o.n === n && o.d === d)) {
                options.push({ n, d });
            }
        }
        
        // Shuffle
        options.sort(() => Math.random() - 0.5);
        
        const gap = 150;
        const startX = x - gap;
        
        options.forEach((opt, i) => {
            const btnX = startX + i * gap;
            const btn = this.add.container(btnX, y);
            
            const bg = this.add.rectangle(0, 0, 100, 60, 0x95a5a6);
            const txt = this.add.text(0, 0, `${opt.n}/${opt.d}`, {
                fontSize: '32px',
                color: '#FFF'
            }).setOrigin(0.5);
            
            bg.setInteractive();
            bg.on('pointerdown', () => this.checkAnswer(opt, bg));
            
            btn.add([bg, txt]);
        });
    }
    
    checkAnswer(opt, bg) {
        if (opt.n === this.numerator && opt.d === this.denominator) {
            bg.setFillStyle(0x2ecc71);
            this.time.delayedCall(500, () => this.completeLevel());
        } else {
            bg.setFillStyle(0xe74c3c);
        }
    }
}
