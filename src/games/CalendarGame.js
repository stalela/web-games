import { LalelaGame } from '../utils/LalelaGame.js';

export class CalendarGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'CalendarGame',
            title: 'Calendar',
            description: 'Learn to use a calendar. Find the requested date.',
            category: 'math'
        });
    }

    setupGameLogic() {
        // Random month/year
        this.year = 2025;
        this.month = Math.floor(Math.random() * 12); // 0-11
        this.daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
        this.targetDay = 1 + Math.floor(Math.random() * this.daysInMonth);
        
        this.createUI();
    }
    
    createUI() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        // Instruction
        this.add.text(cx, 50, `Find: ${monthNames[this.month]} ${this.targetDay}`, {
            fontSize: '48px',
            fontFamily: 'Fredoka One',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Calendar Grid
        this.drawCalendar(cx, cy + 50);
    }
    
    drawCalendar(x, y) {
        const startX = x - 300;
        const startY = y - 200;
        const cellW = 80;
        const cellH = 60;
        
        // Header (Days)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        days.forEach((day, i) => {
            this.add.text(startX + i * cellW + cellW/2, startY, day, {
                fontSize: '24px',
                color: '#f1c40f'
            }).setOrigin(0.5);
        });
        
        // Days
        const firstDay = new Date(this.year, this.month, 1).getDay();
        
        for (let d = 1; d <= this.daysInMonth; d++) {
            const pos = firstDay + d - 1;
            const col = pos % 7;
            const row = Math.floor(pos / 7);
            
            const cx = startX + col * cellW + cellW/2;
            const cy = startY + (row + 1) * cellH + cellH/2;
            
            const bg = this.add.rectangle(cx, cy, cellW - 4, cellH - 4, 0x34495e);
            const txt = this.add.text(cx, cy, d, { fontSize: '24px', color: '#FFF' }).setOrigin(0.5);
            
            bg.setInteractive();
            bg.on('pointerdown', () => this.checkAnswer(d, bg));
        }
    }
    
    checkAnswer(day, bg) {
        if (day === this.targetDay) {
            bg.setFillStyle(0x2ecc71);
            this.time.delayedCall(500, () => this.completeLevel());
        } else {
            bg.setFillStyle(0xe74c3c);
            this.cameras.main.shake(200, 0.01);
        }
    }
}
