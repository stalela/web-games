import { LalelaGame } from '../utils/LalelaGame.js';

export class MagicHatMinusGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'MagicHatMinusGame',
            title: 'Magic Hat Subtraction',
            description: 'Count how many stars are left under the magic hat.',
            category: 'math'
        });
    }

    setupGameLogic() {
        this.total = 2 + Math.floor(Math.random() * 8); // 2 to 9
        this.removed = 1 + Math.floor(Math.random() * (this.total - 1));
        this.remaining = this.total - this.removed;
        
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
                // Spawn all stars under hat
                this.spawnStars(this.total, () => {
                    // Lower hat
                    this.tweens.add({
                        targets: this.hat,
                        y: cy,
                        duration: 1000,
                        onComplete: () => {
                            // Remove stars
                            this.removeStars(this.removed, () => {
                                this.askQuestion();
                            });
                        }
                    });
                });
            }
        });
    }
    
    spawnStars(count, onComplete) {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        for (let i = 0; i < count; i++) {
            const star = this.add.star(cx + (Math.random() * 60 - 30), cy + 50 + (Math.random() * 20 - 10), 5, 10, 20, 0xF1C40F);
            this.stars.push(star);
        }
        if (onComplete) onComplete();
    }
    
    removeStars(count, onComplete) {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        
        let completed = 0;
        
        // Pick random stars to remove
        // Actually just pick the last ones
        for (let i = 0; i < count; i++) {
            const star = this.stars.pop();
            star.setDepth(11); // Above hat
            
            this.tweens.add({
                targets: star,
                x: cx + 200,
                y: cy + 50,
                duration: 1000,
                delay: i * 500,
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
        
        this.add.text(cx, 100, 'How many stars are left under the hat?', {
            fontSize: '32px',
            fontFamily: 'Fredoka One',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Number pad
        const startX = cx - 150;
        const startY = cy + 150;
        
        for (let i = 0; i <= 9; i++) {
            const x = startX + (i % 5) * 70;
            const y = startY + Math.floor(i / 5) * 70;
            
            const btn = this.add.container(x, y);
            const bg = this.add.circle(0, 0, 30, 0x3498db);
            const txt = this.add.text(0, 0, i, { fontSize: '24px', color: '#FFF' }).setOrigin(0.5);
            
            bg.setInteractive();
            bg.on('pointerdown', () => this.checkAnswer(i));
            
            btn.add([bg, txt]);
        }
    }
    
    checkAnswer(ans) {
        if (ans === this.remaining) {
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
