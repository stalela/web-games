import Phaser from 'phaser';

export class CheckersGame extends Phaser.Scene {
  constructor() {
    super({ key: 'CheckersGame' });
    this.gameConfig = {
        rows: 8,
        cols: 8,
        tileSize: 0, // Will be calculated in create
    };
  }

  init(data) {
    this.app = data.app;
  }

  preload() {
    // Load assets for the board
    this.load.svg('checkers-board', 'assets/game-icons/checkers.svg');
    // Note: Piece textures will be created dynamically in create() method
  }

  create() {
    const { width, height } = this.game.config;

    // Calculate tile size
    this.gameConfig.tileSize = Math.min(width, height) / this.gameConfig.rows;

    // Create piece textures dynamically
    this.createPieceTextures();

    // Create the checkerboard
    this.createBoard();

    // Add initial pieces
    this.addInitialPieces();

    // Add back button
    const backButton = this.add.text(50, 50, '← Back to Menu', {
        fontSize: '18px',
        color: '#3498db',
        backgroundColor: '#2c3e50',
        padding: { x: 10, y: 5 }
    }).setInteractive();

    backButton.on('pointerdown', () => {
        if (this.app?.audioManager) {
            this.app.audioManager.playClickSound();
        }
        this.scene.stop('CheckersGame');
        this.app.showGameMenu();
    });
  }

  createPieceTextures() {
    // Create circular textures for checkers pieces
    const pieceSize = 60; // Size of the texture
    const radius = pieceSize / 2 - 5; // Leave some padding

    // Create red piece texture
    const redGraphics = this.add.graphics();
    redGraphics.fillStyle(0xFF0000);
    redGraphics.fillCircle(pieceSize / 2, pieceSize / 2, radius);
    redGraphics.generateTexture('red-piece', pieceSize, pieceSize);
    redGraphics.destroy();

    // Create black piece texture
    const blackGraphics = this.add.graphics();
    blackGraphics.fillStyle(0x000000);
    blackGraphics.fillCircle(pieceSize / 2, pieceSize / 2, radius);
    blackGraphics.generateTexture('black-piece', pieceSize, pieceSize);
    blackGraphics.destroy();
  }

  createBoard() {
    const { rows, cols, tileSize } = this.gameConfig;
    const boardStartX = (this.game.config.width - (cols * tileSize)) / 2;
    const boardStartY = (this.game.config.height - (rows * tileSize)) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = boardStartX + col * tileSize + tileSize / 2;
        const y = boardStartY + row * tileSize + tileSize / 2;
        const isBlack = (row + col) % 2 === 1;
        
        this.add.rectangle(x, y, tileSize, tileSize, isBlack ? 0x663300 : 0xFFCC66); // Dark brown and light brown
      }
    }
  }

  addInitialPieces() {
    const { rows, cols, tileSize } = this.gameConfig;
    const boardStartX = (this.game.config.width - (cols * tileSize)) / 2;
    const boardStartY = (this.game.config.height - (rows * tileSize)) / 2;
    const pieceRadius = tileSize * 0.4;

    // Red pieces (player)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < cols; col++) {
        if ((row + col) % 2 === 1) { // Pieces only on black squares
          const x = boardStartX + col * tileSize + tileSize / 2;
          const y = boardStartY + row * tileSize + tileSize / 2;
          this.add.circle(x, y, pieceRadius, 0xFF0000);
        }
      }
    }

    // Black pieces (Tux/AI)
    for (let row = rows - 3; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if ((row + col) % 2 === 1) { // Pieces only on black squares
          const x = boardStartX + col * tileSize + tileSize / 2;
          const y = boardStartY + row * tileSize + tileSize / 2;
          this.add.circle(x, y, pieceRadius, 0x000000);
        }
      }
    }
  }
}
