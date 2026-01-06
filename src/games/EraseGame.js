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

    // Navigation icons
    this.load.svg('home', 'assets/game-icons/bar_home.svg');
    this.load.svg('help', 'assets/game-icons/bar_help.svg');
    this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
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

  createBackground() {
    const { width, height } = this.scale;
    // Fallback solid background behind the hidden image
    this.cameras.main.setBackgroundColor(0x1f2a35);

    // Optional: add a subtle backdrop rectangle for contrast
    this.add.rectangle(width / 2, height / 2, width, height, 0x1f2a35).setDepth(-2);
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
    const { width, height } = this.scale;
    const barY = height - 55;
    const buttonSize = 72;
    const spacing = 95;
    const buttonRadius = 10;

    const controls = [
      { icon: 'home', action: 'home', color: 0x0062FF },
      { icon: 'reload', action: 'reload', color: 0x00B378 },
      { icon: 'help', action: 'help', color: 0xF08A00 }
    ];

    const totalWidth = (controls.length * buttonSize) + ((controls.length - 1) * (spacing - buttonSize));
    const startX = (width - totalWidth) / 2;

    this.navButtons = [];

    controls.forEach((control, index) => {
      const x = startX + index * spacing;
      
      // Button background
      const button = this.add.graphics();
      button.fillStyle(control.color);
      button.fillRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
      button.lineStyle(2, 0xFFFFFF, 0.8);
      button.strokeRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
      button.setInteractive(
        new Phaser.Geom.Rectangle(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize),
        Phaser.Geom.Rectangle.Contains
      );

      // Create icon
      const icon = this.add.sprite(x, barY, control.icon);
      icon.setScale((buttonSize * 0.6) / Math.max(icon.width, icon.height));
      icon.setTint(0xFFFFFF);

      // Button interactions
      button.on('pointerdown', () => {
        icon.y += 2;
        this.handleNavAction(control.action);
        this.time.delayedCall(100, () => {
          icon.y -= 2;
        });
      });

      button.on('pointerover', () => {
        this.tweens.add({ targets: icon, scale: (buttonSize * 0.65) / Math.max(icon.width, icon.height), duration: 100 });
      });

      button.on('pointerout', () => {
        this.tweens.add({ targets: icon, scale: (buttonSize * 0.6) / Math.max(icon.width, icon.height), duration: 100 });
      });

      button.setDepth(100);
      icon.setDepth(101);

      this.navButtons.push({ button, icon });
    });
  }

  handleNavAction(action) {
    switch (action) {
      case 'home':
        this.scene.start('GameMenu');
        break;
      case 'reload':
        this.scene.restart();
        break;
      case 'help':
        this.showHelpModal();
        break;
    }
  }

  showHelpModal() {
    const { width, height } = this.scale;
    
    this.helpOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);
    this.helpOverlay.setDepth(200).setInteractive();

    const panelWidth = Math.min(520, width * 0.85);
    const panelHeight = 260;
    this.helpPanel = this.add.graphics();
    this.helpPanel.fillStyle(0xFFFFFF, 1);
    this.helpPanel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 20);
    this.helpPanel.setDepth(201);

    this.helpTitle = this.add.text(width / 2, height / 2 - 90, 'How to Play', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#0062FF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(202);

    this.helpText = this.add.text(width / 2, height / 2, 'Move your mouse to erase the blocks and reveal the picture.', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#333333',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(202);

    this.closeBtn = this.add.text(width / 2, height / 2 + 90, 'Close', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#0062FF',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    this.closeBtn.on('pointerdown', () => this.closeHelpModal());
    this.helpOverlay.on('pointerdown', () => this.closeHelpModal());
  }

  closeHelpModal() {
    if (this.helpOverlay) this.helpOverlay.destroy();
    if (this.helpPanel) this.helpPanel.destroy();
    if (this.helpTitle) this.helpTitle.destroy();
    if (this.helpText) this.helpText.destroy();
    if (this.closeBtn) this.closeBtn.destroy();
  }
}
