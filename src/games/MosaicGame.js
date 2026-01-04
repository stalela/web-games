import { LalelaGame } from '../utils/LalelaGame.js';

export class MosaicGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'MosaicGame',
      title: 'Mosaic',
      category: 'discovery',
      description: 'Reproduce the model pattern.',
      ...config
    });

    this.levels = [
      {
        cols: 3,
        rows: 1,
        images: ['oil_paint', 'tux', 'pencil', 'banana', 'mushroom'],
        model: ['oil_paint', 'tux', 'pencil']
      },
      {
        cols: 2,
        rows: 2,
        images: ['dice_1', 'dice_2', 'dice_3', 'dice_4'],
        model: ['dice_1', 'dice_2', 'dice_3', 'dice_4']
      },
      {
        cols: 3,
        rows: 2,
        images: ['orange', 'banana', 'mushroom', 'pencil', 'tux', 'oil_paint'],
        model: ['orange', 'banana', 'mushroom', 'pencil', 'tux', 'oil_paint']
      }
    ];
    
    this.currentLevelIndex = 0;
    this.selectedImage = null;
    this.userGrid = [];
  }

  preload() {
    super.preload();
    this.load.image('mosaic_bg', 'assets/mosaic/background.svg');
    
    // Load all potential assets
    const assets = [
      'oil_paint', 'tux', 'pencil', 'banana', 'mushroom', 'pencils_paper', 'pencils', 'orange',
      'dice_0', 'dice_1', 'dice_2', 'dice_3', 'dice_4', 'dice_5', 'dice_6', 'dice_7'
    ];
    
    assets.forEach(asset => {
      this.load.image(asset, `assets/mosaic/${asset}.svg`);
    });
  }

  create() {
    super.create();
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'mosaic_bg')
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.createUI();
    this.startLevel();
  }

  createUI() {
    this.add.text(this.cameras.main.centerX, 50, 'Reproduce the pattern', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Fredoka One'
    }).setOrigin(0.5);
  }

  startLevel() {
    const level = this.levels[this.currentLevelIndex];
    this.userGrid = new Array(level.cols * level.rows).fill(null);
    this.selectedImage = null;

    // Clear previous
    if (this.gameContainer) this.gameContainer.destroy();
    this.gameContainer = this.add.container(0, 0);

    const cellSize = 80;
    const spacing = 10;
    
    // Model Grid (Left)
    const modelStartX = this.cameras.main.width * 0.25 - ((level.cols * cellSize) / 2);
    const modelStartY = this.cameras.main.centerY - ((level.rows * cellSize) / 2);

    this.add.text(this.cameras.main.width * 0.25, modelStartY - 40, 'Model', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setParent(this.gameContainer);

    level.model.forEach((imgKey, index) => {
      const col = index % level.cols;
      const row = Math.floor(index / level.cols);
      const x = modelStartX + col * (cellSize + spacing);
      const y = modelStartY + row * (cellSize + spacing);

      const bg = this.add.rectangle(x, y, cellSize, cellSize, 0xffffff, 0.5).setOrigin(0);
      const img = this.add.image(x + cellSize/2, y + cellSize/2, imgKey).setDisplaySize(cellSize-10, cellSize-10);
      this.gameContainer.add([bg, img]);
    });

    // User Grid (Right)
    const userStartX = this.cameras.main.width * 0.75 - ((level.cols * cellSize) / 2);
    const userStartY = modelStartY;

    this.add.text(this.cameras.main.width * 0.75, userStartY - 40, 'Your Turn', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setParent(this.gameContainer);

    for (let i = 0; i < level.cols * level.rows; i++) {
      const col = i % level.cols;
      const row = Math.floor(i / level.cols);
      const x = userStartX + col * (cellSize + spacing);
      const y = userStartY + row * (cellSize + spacing);

      const bg = this.add.rectangle(x, y, cellSize, cellSize, 0xffffff, 0.8).setOrigin(0);
      bg.setInteractive();
      bg.on('pointerdown', () => this.handleCellClick(i, x + cellSize/2, y + cellSize/2));
      
      this.gameContainer.add(bg);
    }

    // Palette (Bottom)
    const paletteY = this.cameras.main.height - 100;
    const paletteStartX = this.cameras.main.centerX - ((level.images.length * cellSize) / 2);

    level.images.forEach((imgKey, index) => {
      const x = paletteStartX + index * (cellSize + spacing);
      const bg = this.add.rectangle(x, paletteY, cellSize, cellSize, 0xffffff, 0.5);
      const img = this.add.image(x, paletteY, imgKey).setDisplaySize(cellSize-10, cellSize-10);
      
      bg.setInteractive();
      bg.on('pointerdown', () => {
        this.selectedImage = imgKey;
        // Highlight selection
        if (this.selectionHighlight) this.selectionHighlight.destroy();
        this.selectionHighlight = this.add.rectangle(x, paletteY, cellSize + 4, cellSize + 4, 0xffff00).setStrokeStyle(4, 0xffff00);
        this.gameContainer.add(this.selectionHighlight);
        this.gameContainer.moveBelow(this.selectionHighlight, bg);
      });

      this.gameContainer.add([bg, img]);
    });
  }

  handleCellClick(index, x, y) {
    if (!this.selectedImage) return;

    // Place image
    // Remove existing if any
    if (this.userGrid[index]) {
      this.userGrid[index].destroy();
    }

    const img = this.add.image(x, y, this.selectedImage).setDisplaySize(70, 70);
    this.gameContainer.add(img);
    this.userGrid[index] = img;
    this.userGrid[index].key = this.selectedImage; // Store key for checking

    this.checkWin();
  }

  checkWin() {
    const level = this.levels[this.currentLevelIndex];
    let correct = true;
    
    for (let i = 0; i < level.model.length; i++) {
      if (!this.userGrid[i] || this.userGrid[i].key !== level.model[i]) {
        correct = false;
        break;
      }
    }

    if (correct) {
      this.audioManager.play('success');
      this.time.delayedCall(1000, () => {
        this.currentLevelIndex = (this.currentLevelIndex + 1) % this.levels.length;
        this.startLevel();
      });
    }
  }
}
