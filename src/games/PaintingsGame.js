import { DragDropGame } from './DragDropGame.js';
import { paintingsLevels } from './data/paintingsLevels.js';

export class PaintingsGame extends DragDropGame {
  constructor(config) {
    super({
      key: 'PaintingsGame',
      category: 'puzzle',
      difficulty: 1,
      ...config
    });

    this.levels = paintingsLevels;
    this.currentLevelIndex = 0;
    this.boardWidth = 702;
    this.boardHeight = 515;
    this.levelObjects = [];
    this.helpModal = null;
  }

  preload() {
    super.preload();
    
    // Load UI icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach(icon => this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`));
    
    // Load wood background textures
    this.load.svg('wood-bg-main', 'assets/details/resource/backgroundW01.svg');
    this.load.svg('wood-bg-panel', 'assets/details/resource/backgroundW02.svg');
    
    const loadedImages = new Set();
    
    this.levels.forEach(level => {
      level.items.forEach(item => {
        if (item.pixmapfile && !loadedImages.has(item.pixmapfile)) {
          // item.pixmapfile is like "paintings/foo.webp"
          // We load it from "assets/paintings/foo.webp"
          if (item.pixmapfile.endsWith('.svg')) {
            this.load.svg(item.pixmapfile, 'assets/' + item.pixmapfile);
          } else {
            this.load.image(item.pixmapfile, 'assets/' + item.pixmapfile);
          }
          loadedImages.add(item.pixmapfile);
        }
      });
    });
  }

  createBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Wood texture background like GCompris
    this.bgWood = this.add.image(width / 2, height / 2, 'wood-bg-main');
    this.bgWood.setDisplaySize(width, height);
    this.bgWood.setDepth(-2);

    // Left panel for pieces (wood strip)
    this.leftPanel = this.add.image(60, height / 2, 'wood-bg-panel');
    this.leftPanel.setDisplaySize(120, height);
    this.leftPanel.setDepth(2);
  }

  createUI() {
    super.createUI();
    
    // Hide default controls if any
    if (this.uiElements && this.uiElements.controls) {
      Object.values(this.uiElements.controls).forEach(control => {
        if (control && control.setVisible) control.setVisible(false);
      });
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Instruction text with white rounded background like GCompris
    const textBg = this.add.rectangle(width / 2 + 60, 35, 700, 45, 0xffffff, 0.9);
    textBg.setStrokeStyle(2, 0xcccccc, 1);
    textBg.setDepth(10);
    
    this.instructionText = this.add.text(width / 2 + 60, 35, '', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#000000',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(11);
    
    // Navigation dock
    this.createNavigationDock(width, height);
  }

  createNavigationDock(width, height) {
    const dockY = height - 40;
    const iconSize = 45;
    const iconSpacing = 60;
    const icons = ['exit', 'home', 'help'];
    const startX = width / 2 - 30;

    // Dock background
    const dockWidth = 280;
    const dockBg = this.add.rectangle(width / 2 + 60, dockY, dockWidth, 60, 0x4a4a4a, 0.85);
    dockBg.setStrokeStyle(2, 0x666666, 1);
    dockBg.setDepth(10);

    icons.forEach((iconName, i) => {
      const x = startX + i * iconSpacing;
      const iconBtn = this.add.image(x, dockY, iconName);
      iconBtn.setDisplaySize(iconSize, iconSize);
      iconBtn.setDepth(11);
      iconBtn.setInteractive({ useHandCursor: true });
      iconBtn.on('pointerover', () => iconBtn.setScale(1.15));
      iconBtn.on('pointerout', () => iconBtn.setScale(1));
      iconBtn.on('pointerdown', () => {
        if (this.audioManager) this.audioManager.playSound('click');
        switch (iconName) {
          case 'exit':
          case 'home':
            this.scene.start('GameMenu');
            break;
          case 'help':
            this.showHelpModal();
            break;
        }
      });
    });

    // Level navigation arrows
    this.prevBtn = this.add.text(width / 2 - 80, dockY, '❮', {
      fontSize: '40px',
      color: '#FFB800',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
    this.prevBtn.on('pointerdown', () => {
      if (this.currentLevelIndex > 0) {
        this.startLevel(this.currentLevelIndex - 1);
      }
    });

    this.levelNumText = this.add.text(width / 2 + 170, dockY, '1', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    this.nextBtn = this.add.text(width / 2 + 220, dockY, '❯', {
      fontSize: '40px',
      color: '#FFB800',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
    this.nextBtn.on('pointerdown', () => {
      if (this.currentLevelIndex < this.levels.length - 1) {
        this.startLevel(this.currentLevelIndex + 1);
      }
    });
    
    // Expand button on left panel
    this.expandBtn = this.add.text(60, height - 80, '❯', {
      fontSize: '36px',
      color: '#FFB800',
      fontStyle: 'bold',
      backgroundColor: '#5c3317',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(15).setInteractive({ useHandCursor: true });
  }

  showHelpModal() {
    if (this.helpModal) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.helpModal = this.add.container(width / 2, height / 2).setDepth(100);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
    overlay.setInteractive();

    const panel = this.add.rectangle(0, 0, 450, 300, 0xffffff, 1);
    panel.setStrokeStyle(3, 0x8b4513, 1);

    const title = this.add.text(0, -110, '🧩 Paintings Puzzle', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#333',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructions = this.add.text(0, -20, [
      '• Drag puzzle pieces from the left panel',
      '• Drop them onto the matching spots',
      '• Orange circles show where pieces go',
      '• Complete the painting to finish!'
    ].join('\n'), {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#555',
      lineSpacing: 8,
      align: 'left'
    }).setOrigin(0.5);

    const closeBtn = this.add.rectangle(0, 100, 120, 45, 0x8b4513, 1);
    closeBtn.setStrokeStyle(2, 0x654321, 1);
    closeBtn.setInteractive({ useHandCursor: true });
    const closeText = this.add.text(0, 100, 'Got it!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xa0522d));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x8b4513));
    closeBtn.on('pointerdown', () => this.closeHelpModal());

    this.helpModal.add([overlay, panel, title, instructions, closeBtn, closeText]);
  }

  closeHelpModal() {
    if (this.helpModal) {
      this.helpModal.destroy();
      this.helpModal = null;
    }
  }

  setupGameLogic() {
    this.startLevel(this.currentLevelIndex);
  }

  startLevel(index) {
    if (index >= this.levels.length) {
      // Game Complete - return to menu
      this.scene.start('GameMenu');
      return;
    }

    this.currentLevelIndex = index;
    const levelData = this.levels[index];
    
    // Clear previous level
    this.clearLevel();
    
    // Update instructions
    this.instructionText.setText(levelData.instruction);
    
    // Update level number
    if (this.levelNumText) {
      this.levelNumText.setText(`${this.currentLevelIndex + 1}`);
    }
    
    // Parse level items
    const boardConfig = levelData.items[0];
    const pieces = levelData.items.slice(1);
    
    const bWidth = boardConfig.width || 702;
    const bHeight = boardConfig.height || 515;
    
    // Main painting area (right of left panel)
    const paintingAreaX = 140;
    const paintingAreaWidth = this.cameras.main.width - paintingAreaX - 20;
    const paintingAreaHeight = this.cameras.main.height - 140;
    
    // Scale to fit
    const scale = Math.min(paintingAreaWidth / bWidth, paintingAreaHeight / bHeight);
    const scaledWidth = bWidth * scale;
    const scaledHeight = bHeight * scale;
    
    const startX = paintingAreaX + (paintingAreaWidth - scaledWidth) / 2 + scaledWidth / 2;
    const startY = 70 + (paintingAreaHeight - scaledHeight) / 2 + scaledHeight / 2;
    
    // Create board background (the SVG bg)
    if (boardConfig.pixmapfile) {
      const bg = this.add.image(startX, startY, boardConfig.pixmapfile);
      bg.setDisplaySize(scaledWidth, scaledHeight);
      bg.setDepth(-1);
      this.levelObjects.push(bg);
    }
    
    // Create drop zones with orange circles and pieces on left panel
    const pieceSpacing = Math.min(120, (this.cameras.main.height - 180) / pieces.length);
    const pieceStartY = 90;
    
    pieces.forEach((pieceData, i) => {
      const targetX = startX - scaledWidth/2 + (parseFloat(pieceData.x) * scaledWidth);
      const targetY = startY - scaledHeight/2 + (parseFloat(pieceData.y) * scaledHeight);
      
      // Get dimensions from texture
      const texture = this.textures.get(pieceData.pixmapfile);
      const frame = texture.get();
      const width = frame.width * scale;
      const height = frame.height * scale;
      
      const zone = this.createDropZone(targetX, targetY, width, height);
      
      // Orange circle drop indicator like GCompris
      const dropCircle = this.add.circle(targetX, targetY, 8, 0xFF8C00, 1);
      dropCircle.setDepth(1);
      this.levelObjects.push(dropCircle);
      
      // Create Draggable Piece on left panel
      const spawnX = 60;
      const spawnY = pieceStartY + i * pieceSpacing;

      const draggable = this.createDraggable(spawnX, spawnY, pieceData.pixmapfile, scale);
      draggable.targetZone = zone;
      draggable.dropCircle = dropCircle;
      draggable.originalX = spawnX;
      draggable.originalY = spawnY;
    });
  }
  
  createDraggable(x, y, textureKey, pieceScale = 1) {
    const sprite = this.add.sprite(x, y, textureKey);
    sprite.setInteractive({ draggable: true });
    sprite.setDepth(10);
    
    // Scale piece to fit on left panel (max 90px)
    const maxSize = 90;
    const fitScale = Math.min(maxSize / sprite.width, maxSize / sprite.height, 1);
    sprite.setScale(fitScale);
    sprite.gameScale = pieceScale; // Store the target scale for when placed
    
    this.input.setDraggable(sprite);
    
    sprite.on('dragstart', () => {
      sprite.setDepth(20);
      sprite.setScale(sprite.gameScale * 1.05);
      if (this.audioManager) this.audioManager.playSound('click');
    });
    
    sprite.on('drag', (pointer, dragX, dragY) => {
      sprite.x = dragX;
      sprite.y = dragY;
    });
    
    sprite.on('dragend', () => {
      sprite.setDepth(10);
      this.checkDrop(sprite);
    });
    
    this.levelObjects.push(sprite);
    return sprite;
  }
  
  createDropZone(x, y, width, height) {
    const zone = this.add.zone(x, y, width, height).setRectangleDropZone(width, height);
    this.levelObjects.push(zone);
    return zone;
  }
  
  checkDrop(sprite) {
    const zone = sprite.targetZone;
    const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, zone.x, zone.y);
    
    if (distance < 60) {
      sprite.x = zone.x;
      sprite.y = zone.y;
      sprite.setScale(sprite.gameScale);
      sprite.disableInteractive();
      
      // Hide the orange drop circle
      if (sprite.dropCircle) {
        sprite.dropCircle.setVisible(false);
      }
      
      if (this.audioManager) this.audioManager.playSound('success');
      this.checkLevelComplete();
    } else {
      // Return to original position
      this.tweens.add({
        targets: sprite,
        x: sprite.originalX,
        y: sprite.originalY,
        scale: Math.min(90 / sprite.width, 90 / sprite.height, 1),
        duration: 300,
        ease: 'Back.easeOut'
      });
      if (this.audioManager) this.audioManager.playSound('click');
    }
  }
  
  checkLevelComplete() {
    const activeDraggables = this.levelObjects.filter(obj => obj.type === 'Sprite' && obj.input && obj.input.enabled);
    
    if (activeDraggables.length === 0) {
      this.time.delayedCall(1000, () => {
        if (this.audioManager) this.audioManager.playSound('win');
        if (this.currentLevelIndex < this.levels.length - 1) {
          this.startLevel(this.currentLevelIndex + 1);
        } else {
          this.showGameComplete();
        }
      });
    }
  }
  
  showGameComplete() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(150);
    const congratsText = this.add.text(width / 2, height / 2 - 40, '🎉 All Paintings Complete!', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(151);

    const replayBtn = this.add.rectangle(width / 2, height / 2 + 40, 160, 50, 0x8b4513, 1).setDepth(151);
    replayBtn.setStrokeStyle(2, 0x654321, 1);
    replayBtn.setInteractive({ useHandCursor: true });
    const replayText = this.add.text(width / 2, height / 2 + 40, 'Play Again', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(152);

    replayBtn.on('pointerdown', () => {
      overlay.destroy();
      congratsText.destroy();
      replayBtn.destroy();
      replayText.destroy();
      this.startLevel(0);
    });
  }
  
  clearLevel() {
    if (this.levelObjects) {
      this.levelObjects.forEach(obj => obj.destroy());
    }
    this.levelObjects = [];
  }
}
