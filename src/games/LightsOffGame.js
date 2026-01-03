import { LalelaGame } from '../utils/LalelaGame.js';

export class LightsOffGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'LightsOffGame',
            title: 'Lights Off',
            description: 'Turn off all the lights.',
            category: 'strategy'
        });
    }

    setupGameLogic() {
        this.gridSize = 5;
        this.tileSize = 80;
        this.lights = [];
        
        const startX = this.cameras.main.centerX - (this.gridSize * this.tileSize) / 2 + this.tileSize / 2;
        const startY = this.cameras.main.centerY - (this.gridSize * this.tileSize) / 2 + this.tileSize / 2;
        
        for (let r = 0; r < this.gridSize; r++) {
            this.lights[r] = [];
            for (let c = 0; c < this.gridSize; c++) {
                const x = startX + c * this.tileSize;
                const y = startY + r * this.tileSize;
                
                const light = this.add.rectangle(x, y, this.tileSize - 5, this.tileSize - 5, 0x333333);
                light.setInteractive();
                light.isOn = false;
                light.r = r;
                light.c = c;
                
                light.on('pointerdown', () => this.toggleLight(r, c));
                
                this.lights[r][c] = light;
            }
        }
        
        this.randomize();
    }
    
    toggleLight(r, c) {
        this.flip(r, c);
        if (r > 0) this.flip(r - 1, c);
        if (r < this.gridSize - 1) this.flip(r + 1, c);
        if (c > 0) this.flip(r, c - 1);
        if (c < this.gridSize - 1) this.flip(r, c + 1);
        
        this.checkWin();
    }
    
    flip(r, c) {
        const light = this.lights[r][c];
        light.isOn = !light.isOn;
        light.setFillStyle(light.isOn ? 0xFFFF00 : 0x333333);
    }
    
    randomize() {
        // Simulate clicks to ensure solvable state
        for (let i = 0; i < 20; i++) {
            const r = Math.floor(Math.random() * this.gridSize);
            const c = Math.floor(Math.random() * this.gridSize);
            this.toggleLight(r, c);
        }
    }
    
    checkWin() {
        let allOff = true;
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.lights[r][c].isOn) {
                    allOff = false;
                    break;
                }
            }
        }
        
        if (allOff) {
            this.completeLevel();
        }
    }
}
