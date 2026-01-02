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
    this.load.svg('checkers-black', 'assets/game-icons/checkers_black.svg');
    this.load.svg('checkers-white', 'assets/game-icons/checkers_white.svg');
    // Placeholder piece assets
    this.load.circle('red-piece', 0, 0, 30, 0xFF0000); // Red piece
    this.load.circle('black-piece', 0, 0, 30, 0x000000); // Black piece
  }

  create() {
    const { width, height } = this.game.config;

    // Calculate tile size
    this.gameConfig.tileSize = Math.min(width, height) / this.gameConfig.rows;

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
