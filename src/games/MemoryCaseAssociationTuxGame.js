import { MemoryCaseAssociationGame } from './MemoryCaseAssociationGame.js';

export class MemoryCaseAssociationTuxGame extends MemoryCaseAssociationGame {
    constructor(config) {
        super({
            ...config,
            key: 'MemoryCaseAssociationTuxGame',
            title: 'Case Association (Tux)',
            description: 'Match uppercase and lowercase letters with Tux.',
            category: 'memory'
        });
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Use a Tux-themed background if available, or just a color
        // GCompris uses 'background.svg' from memory resource
        // We can try to load that or use a default
        if (this.textures.exists('memory-bg')) {
             this.add.image(width/2, height/2, 'memory-bg')
                .setDisplaySize(width, height)
                .setDepth(-1);
        } else {
            this.add.rectangle(0, 0, width, height, 0x336699).setOrigin(0).setDepth(-1);
        }
        
        // Add Tux image if we have one
        // this.add.image(width - 100, height - 100, 'tux').setDepth(-1);
    }
}
