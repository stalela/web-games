import { LalelaGame } from '../utils/LalelaGame.js';

export class FindTheDayGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'FindTheDayGame',
            title: 'Find the Day',
            description: 'What day of the week is the given date?',
            category: 'math'
        });
    }

    setupGameLogic() {
        this.year = 2025;
        this.month = Math.floor(Math.random() * 12);
        this.daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
        this.targetDay = 1 + Math.floor(Math.random() * this.daysInMonth);
        
        const date = new Date(this.year, this.month, this.targetDay);
        this.correctDayIndex = date.getDay(); // 0 = Sun
        
        this.createUI();
    }
    
    createUI() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        // Instruction
        this.add.text(cx, 100, `What day is: ${monthNames[this.month]} ${this.targetDay}?`, {
            fontSize: '40px',
            fontFamily: 'Fredoka One',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Show Calendar for reference
        this.drawCalendar(cx, cy);
        
        // Options (Days of week)
        this.createOptions(cx, cy + 250);
    }
    
    drawCalendar(x, y) {
        const startX = x - 250;
        const startY = y - 150;
        const cellW = 70;
        const cellH = 50;
        
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        days.forEach((day, i) => {
            this.add.text(startX + i * cellW + cellW/2, startY, day, {
                fontSize: '20px',
                color: '#f1c40f'
            }).setOrigin(0.5);
        });
        
        const firstDay = new Date(this.year, this.month, 1).getDay();
        
        for (let d = 1; d <= this.daysInMonth; d++) {
            const pos = firstDay + d - 1;
            const col = pos % 7;
            const row = Math.floor(pos / 7);
            
            const cx = startX + col * cellW + cellW/2;
            const cy = startY + (row + 1) * cellH + cellH/2;
            
            // Highlight target day
            if (d === this.targetDay) {
                this.add.rectangle(cx, cy, cellW - 4, cellH - 4, 0xe67e22);
            } else {
                this.add.rectangle(cx, cy, cellW - 4, cellH - 4, 0x34495e);
            }
            
            this.add.text(cx, cy, d, { fontSize: '20px', color: '#FFF' }).setOrigin(0.5);
        }
    }
    
    createOptions(x, y) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const startX = x - 400;
        
        days.forEach((day, i) => {
            const btnX = startX + i * 130;
            const btn = this.add.container(btnX, y);
            
            const bg = this.add.rectangle(0, 0, 120, 60, 0x3498db);
            const txt = this.add.text(0, 0, day.substring(0, 3), { fontSize: '24px', color: '#FFF' }).setOrigin(0.5);
            
            bg.setInteractive();
            bg.on('pointerdown', () => this.checkAnswer(i, bg));
            
            btn.add([bg, txt]);
        });
    }
    
    checkAnswer(dayIndex, bg) {
        if (dayIndex === this.correctDayIndex) {
            bg.setFillStyle(0x2ecc71);
            this.time.delayedCall(500, () => this.completeLevel());
        } else {
            bg.setFillStyle(0xe74c3c);
            this.cameras.main.shake(200, 0.01);
        }
    }
}
