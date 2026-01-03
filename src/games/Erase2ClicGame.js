import { EraseGame } from './EraseGame.js';

export class Erase2ClicGame extends EraseGame {
    constructor(config) {
        super({
            ...config,
            key: 'Erase2ClicGame',
            title: 'Erase (Double Click)',
            description: 'Double click the mouse to erase the blocks.',
            category: 'computer',
            difficulty: 2
        });
        
        this.lastClickTime = 0;
        this.doubleClickDelay = 300; // ms
    }

    createBlocks() {
        this.blocks = [];
        this.erasedBlocks = 0;
        
        // Grid size based on level
        const cols = 5 + (this.level - 1) * 2;
        const rows = 5 + (this.level - 1) * 2;
        
        const blockWidth = this.cameras.main.width / cols;
        const blockHeight = this.cameras.main.height / rows;
        
        const blockImg = this.blockImages[this.level % this.blockImages.length];
        const key = `erase_block_${blockImg}`;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * blockWidth + blockWidth / 2;
                const y = r * blockHeight + blockHeight / 2;
                
                const block = this.add.image(x, y, key)
                    .setDisplaySize(blockWidth + 2, blockHeight + 2)
                    .setInteractive();
                    
                // Override interaction for double click
                block.on('pointerdown', () => this.handleBlockClick(block));
                
                this.blocks.push(block);
            }
        }
        
        this.totalBlocks = this.blocks.length;
    }

    handleBlockClick(block) {
        const currentTime = this.time.now;
        if (currentTime - this.lastClickTime < this.doubleClickDelay) {
            this.eraseBlock(block);
            this.lastClickTime = 0; // Reset
        } else {
            this.lastClickTime = currentTime;
        }
    }
    
    createUI() {
        super.createUI();
        this.instructionText.setText('Double click to erase');
    }
}
