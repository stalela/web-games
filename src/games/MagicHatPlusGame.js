import { LalelaGame } from '../utils/LalelaGame.js';

export class MagicHatPlusGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'MagicHatPlusGame',
            title: 'Magic Hat Addition',
            description: 'Count how many stars are under the magic hat.',
            category: 'math'
        });
    }

    setupGameLogic() {
        this.num1 = 1 + Math.floor(Math.random() * 5);
        this.num2 = 1 + Math.floor(Math.random() * 5);
        this.total = this.num1 + this.num2;
        
        this.createScene();
        this.startAnimation();
    }
    
    createScene() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Hat
        this.hat = this.add.triangle(cx, cy, 0, 100, 100, 100, 50, 0, 0x8e44ad);
        this.hat.setDepth(10);
        
        // Stars container
        this.stars = [];
    }
    
    startAnimation() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        // Lift hat
        this.tweens.add({
            targets: this.hat,
            y: cy - 100,
            duration: 1000,
            onComplete: () => {
                // Move first batch
                this.spawnStars(this.num1, -200, () => {
                    // Move second batch
                    this.spawnStars(this.num2, 200, () => {
                        // Lower hat
                        this.tweens.add({
                            targets: this.hat,
                            y: cy,
                            duration: 1000,
                            onComplete: () => this.askQuestion()
                        });
                    });
                });
            }
        });
    }
    
    spawnStars(count, startOffset, onComplete) {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        let completed = 0;
        
        for (let i = 0; i < count; i++) {
            const star = this.add.star(cx + startOffset, cy + 50, 5, 10, 20, 0xF1C40F);
            this.stars.push(star);
            
            this.tweens.add({
                targets: star,
                x: cx + (Math.random() * 60 - 30),
                y: cy + 50 + (Math.random() * 20 - 10),
                duration: 1000,
                delay: i * 200,
                onComplete: () => {
                    completed++;
                    if (completed === count && onComplete) onComplete();
                }
            });
        }
    }
    
    askQuestion() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        this.add.text(cx, 100, 'How many stars are under the hat?', {
            fontSize: '32px',
            fontFamily: 'Fredoka One',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Number pad
        const startX = cx - 150;
        const startY = cy + 150;
        
        for (let i = 1; i <= 10; i++) {
            const x = startX + ((i-1) % 5) * 70;
            const y = startY + Math.floor((i-1) / 5) * 70;
            
            const btn = this.add.container(x, y);
            const bg = this.add.circle(0, 0, 30, 0x3498db);
            const txt = this.add.text(0, 0, i, { fontSize: '24px', color: '#FFF' }).setOrigin(0.5);
            
            bg.setInteractive();
            bg.on('pointerdown', () => this.checkAnswer(i));
            
            btn.add([bg, txt]);
        }
    }
    
    checkAnswer(ans) {
        if (ans === this.total) {
            // Lift hat to show
            this.tweens.add({
                targets: this.hat,
                y: this.cameras.main.centerY - 100,
                duration: 1000,
                onComplete: () => {
                    this.time.delayedCall(1000, () => this.completeLevel());
                }
            });
        } else {
            this.cameras.main.shake(200, 0.01);
        }
    }
}
