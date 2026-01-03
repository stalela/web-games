import { LalelaGame } from '../utils/LalelaGame.js';

export class FifteenGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'FifteenGame',
            title: '15 Puzzle',
            description: 'Order the numbers by sliding the tiles.',
            category: 'strategy'
        });
    }

    setupGameLogic() {
        this.gridSize = 4;
        this.tileSize = 100;
        this.tiles = [];
        this.emptyPos = { r: 3, c: 3 };
        
        const startX = this.cameras.main.centerX - (this.gridSize * this.tileSize) / 2 + this.tileSize / 2;
        const startY = this.cameras.main.centerY - (this.gridSize * this.tileSize) / 2 + this.tileSize / 2;
        this.gridOrigin = { x: startX, y: startY };
        
        // Create tiles 1-15
        for (let i = 0; i < 15; i++) {
            const val = i + 1;
            const r = Math.floor(i / 4);
            const c = i % 4;
            
            const tile = this.createTile(r, c, val);
            this.tiles.push(tile);
        }
        
        this.shuffle();
    }
    
    createTile(r, c, val) {
        const x = this.gridOrigin.x + c * this.tileSize;
        const y = this.gridOrigin.y + r * this.tileSize;
        
        const container = this.add.container(x, y);
        container.r = r;
        container.c = c;
        container.val = val;
        
        const bg = this.add.rectangle(0, 0, this.tileSize - 5, this.tileSize - 5, 0x3498db);
        const text = this.add.text(0, 0, val.toString(), { fontSize: '40px', color: '#fff' }).setOrigin(0.5);
        
        container.add([bg, text]);
        container.setSize(this.tileSize, this.tileSize);
        container.setInteractive();
        
        container.on('pointerdown', () => this.tryMove(container));
        
        return container;
    }
    
    tryMove(tile) {
        const dr = Math.abs(tile.r - this.emptyPos.r);
        const dc = Math.abs(tile.c - this.emptyPos.c);
        
        if (dr + dc === 1) {
            // Valid move
            const newR = this.emptyPos.r;
            const newC = this.emptyPos.c;
            
            this.emptyPos = { r: tile.r, c: tile.c };
            tile.r = newR;
            tile.c = newC;
            
            this.tweens.add({
                targets: tile,
                x: this.gridOrigin.x + newC * this.tileSize,
                y: this.gridOrigin.y + newR * this.tileSize,
                duration: 200,
                onComplete: () => this.checkWin()
            });
        }
    }
    
    shuffle() {
        // Simple shuffle by making random valid moves
        for (let i = 0; i < 100; i++) {
            const neighbors = [];
            this.tiles.forEach(t => {
                const dr = Math.abs(t.r - this.emptyPos.r);
                const dc = Math.abs(t.c - this.emptyPos.c);
                if (dr + dc === 1) neighbors.push(t);
            });
            
            const randomTile = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Swap logic without animation for shuffle
            const newR = this.emptyPos.r;
            const newC = this.emptyPos.c;
            this.emptyPos = { r: randomTile.r, c: randomTile.c };
            randomTile.r = newR;
            randomTile.c = newC;
            randomTile.x = this.gridOrigin.x + newC * this.tileSize;
            randomTile.y = this.gridOrigin.y + newR * this.tileSize;
        }
    }
    
    checkWin() {
        let correct = 0;
        this.tiles.forEach(t => {
            const targetR = Math.floor((t.val - 1) / 4);
            const targetC = (t.val - 1) % 4;
            if (t.r === targetR && t.c === targetC) correct++;
        });
        
        if (correct === 15) {
            this.completeLevel();
        }
    }
}
