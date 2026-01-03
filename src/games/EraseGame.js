import { LalelaGame } from '../utils/LalelaGame.js';

export class EraseGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'computer',
      difficulty: 1,
      ...config
    });
    
    this.images = [
        "alpaca.webp", "bee.webp", "butterfly.webp", "calf.webp", "camels.webp",
        "caterpillar.webp", "chamaeleon.webp", "cheetah.webp", "crab.webp",
        "dolphin.webp", "flying_fox.webp", "gibbon.webp", "giraffe.webp",
        "goat.webp", "gorilla.webp", "gosling.webp", "heron.webp", "horse.webp",
        "kingfisher.webp", "kitten.webp", "long_nosed_monkey.webp", "macaque.webp",
        "meerkats.webp", "northern_harrier.webp", "nubian_ibex.webp", "penguin.webp",
        "pika.webp", "red_panda.webp", "rhinoceros.webp", "spoonbills.webp",
        "squirrel.webp", "swans.webp", "toucan.webp"
    ];
    
    this.blockImages = [
        "transparent_square.svg",
        "transparent_square_yellow.svg",
        "transparent_square_green.svg"
    ];
    
    this.currentImageIndex = 0;
    this.blocks = [];
    this.totalBlocks = 0;
    this.erasedBlocks = 0;
  }

  preload() {
    super.preload();
    
    this.images.forEach(img => {
        this.load.image(`erase_${img}`, `assets/erase/${img}`);
    });
    
    this.blockImages.forEach(img => {
        this.load.svg(`erase_block_${img}`, `assets/erase/${img}`);
    });
    
    this.load.audio('eraser1', 'assets/erase/eraser1.wav');
    this.load.audio('eraser2', 'assets/erase/eraser2.wav');
  }

  createGameObjects() {
    // Background image (the one to reveal)
    const imgName = this.images[this.currentImageIndex];
    const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, `erase_${imgName}`);
    
    // Scale to fit
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio? Or fill?
    // GCompris uses PreserveAspectCrop usually, or specific alignment.
    // Let's use contain for now to see the whole image.
    bg.setScale(scale);
    bg.setDepth(-1);
    
    this.createBlocks();
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
                .setDisplaySize(blockWidth + 2, blockHeight + 2) // +2 to overlap slightly
                .setInteractive();
                
            block.on('pointerover', () => this.eraseBlock(block));
            block.on('pointerdown', () => this.eraseBlock(block)); // Also support click/tap
            
            this.blocks.push(block);
        }
    }
    
    this.totalBlocks = this.blocks.length;
  }

  eraseBlock(block) {
      if (!block.active) return;
      
      block.destroy();
      this.erasedBlocks++;
      
      // Play sound occasionally or always?
      // GCompris plays eraser1 or eraser2
      if (Math.random() > 0.5) {
          this.sound.play('eraser1', { volume: 0.5 });
      } else {
          this.sound.play('eraser2', { volume: 0.5 });
      }
      
      if (this.erasedBlocks >= this.totalBlocks) {
          this.completeLevel();
      }
  }
  
  completeLevel() {
      super.completeLevel();
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  createUI() {
    super.createUI();
    this.createNavigationDock();
    
    this.instructionText = this.add.text(this.cameras.main.centerX, 50, 'Move mouse to erase', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  createNavigationDock() {
    const dockY = this.cameras.main.height - 60;
    
    // Back button
    this.add.text(50, dockY, '⬅ Back', { 
        fontSize: '24px', 
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
    })
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.scene.start('GameMenu'));
  }
}
