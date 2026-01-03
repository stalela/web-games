import { DragDropGame } from './DragDropGame.js';
import { DraggableTile } from '../components/DraggableTile.js';
import { DropZone } from '../components/DropZone.js';

class TangramPiece extends DraggableTile {
    createVisualElements() {
        const size = this.config.size || 100;
        
        this.image = this.scene.add.image(0, 0, this.config.imageKey);
        
        // Initial rotation
        if (this.config.rotation) {
            this.image.setAngle(this.config.rotation);
        }

        // Scale
        const scale = Math.min(size / this.image.width, size / this.image.height);
        this.image.setScale(scale);
        
        this.add(this.image);
        
        this.glow = this.scene.add.rectangle(0, 0, size + 10, size + 10, 0xFFFFFF, 0);
        this.glow.setStrokeStyle(4, 0xFFFF00, 0);
        this.addAt(this.glow, 0);
        
        // Add rotation hint
        this.rotationHint = this.scene.add.text(0, 0, '↻', { fontSize: '20px', color: '#000' }).setOrigin(0.5);
        this.rotationHint.setVisible(false);
        this.add(this.rotationHint);
    }
    
    setDragging(isDragging) {
        super.setDragging(isDragging);
        if (this.glow) {
            this.glow.setAlpha(isDragging ? 0.5 : 0);
            this.glow.strokeAlpha = isDragging ? 1 : 0;
        }
        if (this.rotationHint) {
            this.rotationHint.setVisible(isDragging);
        }
    }
    
    rotate() {
        this.image.angle += 45;
    }
}

export class TangramGame extends DragDropGame {
    constructor(config) {
        super({
            ...config,
            key: 'TangramGame',
            title: 'Tangram',
            description: 'Form the shape using the seven pieces. Double click to rotate.',
            category: 'fun'
        });
        
        // Standard Tangram Set
        this.pieces = [
            { id: 'p0', image: 'tangram/p0.svg' }, // Large Triangle 1
            { id: 'p1', image: 'tangram/p1.svg' }, // Large Triangle 2
            { id: 'p2', image: 'tangram/p2.svg' }, // Medium Triangle
            { id: 'p3', image: 'tangram/p3.svg' }, // Small Triangle 1
            { id: 'p4', image: 'tangram/p4.svg' }, // Small Triangle 2
            { id: 'p5', image: 'tangram/p5.svg' }, // Square
            { id: 'p6', image: 'tangram/p6.svg' }  // Parallelogram
        ];
    }
    
    preload() {
        super.preload();
        this.pieces.forEach(p => {
            this.load.svg(`tangram-${p.id}`, `assets/tangram/${p.image}`);
        });
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xEEEEEE, 0xEEEEEE, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-1);
    }

    setupGameLogic() {
        // Spawn pieces scattered
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.pieces.forEach((p, i) => {
            const tile = new TangramPiece(this, {
                x: 100 + (i % 4) * 150,
                y: 100 + Math.floor(i / 4) * 150,
                value: p.id,
                imageKey: `tangram-${p.id}`,
                size: 100
            });
            
            // Add double click handler for rotation
            tile.setInteractive();
            tile.on('pointerdown', () => {
                const now = new Date().getTime();
                if (tile.lastClickTime && now - tile.lastClickTime < 300) {
                    tile.rotate();
                }
                tile.lastClickTime = now;
            });

            this.draggableTiles.push(tile);
            this.add.existing(tile);
        });
        
        // Add instruction
        this.add.text(width/2, height - 50, 'Arrange the pieces to form shapes. Double click to rotate.', { fontSize: '24px', color: '#000' }).setOrigin(0.5);
    }
}
