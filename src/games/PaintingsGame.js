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
  }

  preload() {
    super.preload();
    
    const loadedImages = new Set();
    
    this.levels.forEach(level => {
      level.items.forEach(item => {
        if (item.pixmapfile && !loadedImages.has(item.pixmapfile)) {
          // item.pixmapfile is like "paintings/foo.webp"
          // We load it from "assets/paintings/foo.webp"
          this.load.image(item.pixmapfile, 'assets/' + item.pixmapfile);
          loadedImages.add(item.pixmapfile);
        }
      });
    });
  }

  createBackground() {
    // Generic background
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
      .setDepth(-2);
  }

  createUI() {
    super.createUI();
    
    this.instructionText = this.add.text(this.cameras.main.centerX, 50, '', {
      fontFamily: 'Nunito, Arial',
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 800 }
    }).setOrigin(0.5);
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
    
    // Parse level items
    const boardConfig = levelData.items[0];
    const pieces = levelData.items.slice(1);
    
    const bWidth = boardConfig.width || 702;
    const bHeight = boardConfig.height || 515;
    
    const startX = this.cameras.main.centerX - bWidth / 2;
    const startY = this.cameras.main.centerY - bHeight / 2 + 30;
    
    // Create board background
    if (boardConfig.pixmapfile) {
      const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 30, boardConfig.pixmapfile);
      bg.setDepth(-1);
      this.levelObjects.push(bg);
    }
    
    // Create drop zones and pieces
    pieces.forEach((pieceData, i) => {
      const targetX = startX + (parseFloat(pieceData.x) * bWidth);
      const targetY = startY + (parseFloat(pieceData.y) * bHeight);
      
      // Get dimensions from texture
      const texture = this.textures.get(pieceData.pixmapfile);
      const frame = texture.get();
      const width = frame.width;
      const height = frame.height;
      
      const zone = this.createDropZone(targetX, targetY, width, height);
      
      // Visual hint (faint image)
      const hint = this.add.image(targetX, targetY, pieceData.pixmapfile);
      hint.setAlpha(0.2);
      hint.setDepth(0);
      this.levelObjects.push(hint);
      
      // Create Draggable Piece
      // Spawn randomly on the sides
      const side = Math.random() > 0.5 ? 'left' : 'right';
      const spawnX = side === 'left' 
        ? Phaser.Math.Between(100, startX - 100) 
        : Phaser.Math.Between(startX + bWidth + 100, this.cameras.main.width - 100);
      const spawnY = Phaser.Math.Between(150, this.cameras.main.height - 150);
      
      // Clamp to screen
      const safeSpawnX = Phaser.Math.Clamp(spawnX, width/2 + 20, this.cameras.main.width - width/2 - 20);
      const safeSpawnY = Phaser.Math.Clamp(spawnY, height/2 + 20, this.cameras.main.height - height/2 - 20);

      const draggable = this.createDraggable(safeSpawnX, safeSpawnY, pieceData.pixmapfile);
      draggable.targetZone = zone;
      draggable.originalX = safeSpawnX;
      draggable.originalY = safeSpawnY;
    });
  }
  
  createDraggable(x, y, textureKey) {
    const sprite = this.add.sprite(x, y, textureKey);
    sprite.setInteractive({ draggable: true });
    sprite.setDepth(10);
    
    this.input.setDraggable(sprite);
    
    sprite.on('dragstart', () => {
      sprite.setDepth(20);
      sprite.setScale(1.1);
      if (this.audioManager) this.audioManager.playSound('click');
    });
    
    sprite.on('drag', (pointer, dragX, dragY) => {
      sprite.x = dragX;
      sprite.y = dragY;
    });
    
    sprite.on('dragend', () => {
      sprite.setDepth(10);
      sprite.setScale(1.0);
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
    
    if (distance < 50) {
      sprite.x = zone.x;
      sprite.y = zone.y;
      sprite.disableInteractive();
      if (this.audioManager) this.audioManager.playSound('success');
      this.checkLevelComplete();
    } else {
      if (this.audioManager) this.audioManager.playSound('click');
    }
  }
  
  checkLevelComplete() {
    const activeDraggables = this.levelObjects.filter(obj => obj.type === 'Sprite' && obj.input && obj.input.enabled);
    
    if (activeDraggables.length === 0) {
      this.time.delayedCall(1000, () => {
        if (this.audioManager) this.audioManager.playSound('win');
        this.nextLevel();
      });
    }
  }
  
  nextLevel() {
    this.currentLevelIndex++;
    this.startLevel(this.currentLevelIndex);
  }
  
  clearLevel() {
    if (this.levelObjects) {
      this.levelObjects.forEach(obj => obj.destroy());
    }
    this.levelObjects = [];
  }
}
