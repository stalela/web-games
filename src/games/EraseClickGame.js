import { EraseGame } from './EraseGame.js';

export class EraseClickGame extends EraseGame {
  constructor(config) {
    super({
      category: 'computer',
      difficulty: 1,
      ...config
    });
  }

  createBlocks() {
    super.createBlocks();
    
    // Modify interaction: remove hover, keep click
    this.blocks.forEach(block => {
        block.off('pointerover');
    });
  }
  
  createUI() {
      super.createUI();
      if (this.instructionText) {
          this.instructionText.setText('Click to erase');
      }
  }
}
