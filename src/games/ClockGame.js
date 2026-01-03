import { LalelaGame } from '../utils/LalelaGame.js';

export class ClockGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'ClockGame',
            title: 'Clock',
            description: 'Learn to tell time. Set the clock to the given time.',
            category: 'math'
        });
    }

    setupGameLogic() {
        this.targetHour = Math.floor(Math.random() * 12);
        this.targetMinute = Math.floor(Math.random() * 12) * 5;
        if (this.targetHour === 0) this.targetHour = 12;
        
        this.currentHour = 12;
        this.currentMinute = 0;
        
        this.createUI();
    }
    
    createUI() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Instruction
        const timeStr = `${this.targetHour}:${this.targetMinute.toString().padStart(2, '0')}`;
        this.add.text(cx, 50, `Set the clock to: ${timeStr}`, {
            fontSize: '48px',
            fontFamily: 'Fredoka One',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Clock Face
        this.clockContainer = this.add.container(cx, cy);
        const face = this.add.circle(0, 0, 200, 0xFFFFFF);
        face.setStrokeStyle(4, 0x000000);
        this.clockContainer.add(face);
        
        // Numbers
        for (let i = 1; i <= 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const r = 170;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            const txt = this.add.text(x, y, i, {
                fontSize: '32px',
                color: '#000000',
                fontFamily: 'Fredoka One'
            }).setOrigin(0.5);
            this.clockContainer.add(txt);
        }
        
        // Hands
        this.hourHand = this.add.rectangle(0, 0, 10, 100, 0x000000);
        this.hourHand.setOrigin(0.5, 1);
        this.clockContainer.add(this.hourHand);
        
        this.minuteHand = this.add.rectangle(0, 0, 6, 150, 0xFF0000);
        this.minuteHand.setOrigin(0.5, 1);
        this.clockContainer.add(this.minuteHand);
        
        // Center pin
        this.clockContainer.add(this.add.circle(0, 0, 10, 0x000000));
        
        // Controls
        this.createControls();
        this.updateClock();
    }
    
    createControls() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Minute +
        this.createButton(cx + 250, cy - 50, '+ 5 min', () => {
            this.currentMinute = (this.currentMinute + 5) % 60;
            if (this.currentMinute === 0) this.currentHour = (this.currentHour % 12) + 1;
            this.updateClock();
        });
        
        // Minute -
        this.createButton(cx + 250, cy + 50, '- 5 min', () => {
            this.currentMinute = (this.currentMinute - 5 + 60) % 60;
            if (this.currentMinute === 55) this.currentHour = (this.currentHour - 2 + 12) % 12 + 1;
            this.updateClock();
        });
        
        // Check
        this.createButton(cx, cy + 250, 'Check', () => this.checkAnswer(), 0x2ecc71);
    }
    
    createButton(x, y, text, callback, color = 0x3498db) {
        const btn = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 120, 50, color);
        const txt = this.add.text(0, 0, text, { fontSize: '20px', color: '#FFF' }).setOrigin(0.5);
        
        bg.setInteractive();
        bg.on('pointerdown', callback);
        
        btn.add([bg, txt]);
    }
    
    updateClock() {
        // Hour hand moves with minutes
        const hourAngle = ((this.currentHour % 12) * 30 + this.currentMinute * 0.5);
        const minuteAngle = this.currentMinute * 6;
        
        this.hourHand.setRotation(hourAngle * (Math.PI / 180));
        this.minuteHand.setRotation(minuteAngle * (Math.PI / 180));
    }
    
    checkAnswer() {
        if (this.currentHour === this.targetHour && this.currentMinute === this.targetMinute) {
            this.completeLevel();
        } else {
            this.cameras.main.shake(200, 0.01);
        }
    }
}
