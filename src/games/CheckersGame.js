/**
 * CheckersGame - Strategic board game implementation
 * Interactive checkers/draughts game with AI opponent
 * Based on GCompris checkers activity
 */
import { InteractiveGame } from './InteractiveGame.js';

export class CheckersGame extends InteractiveGame {
  constructor(config) {
    super({
      category: 'strategy',
      difficulty: 4,
      ...config
    });

    // Game configuration
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.gameState = null;
    this.selectedPiece = null;
    this.validMoves = [];
    this.gameOver = false;
    this.currentPlayer = 'white'; // 'white' or 'black'
    this.aiEnabled = true;

    // Board configuration
    this.boardSize = 8; // 8x8 board
    this.cellSize = 60;
    this.boardOffset = { x: 0, y: 0 };

    // Piece tracking
    this.pieces = [];
    this.board = [];

    // UI elements
    this.boardContainer = null;
    this.piecesContainer = null;
    this.uiContainer = null;
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load GCompris wood background
    this.load.svg('background-wood', 'assets/game-icons/background-wood.svg');

    // Load board assets
    this.load.svg('checkers-black', 'assets/game-icons/checkers-black.svg');
    this.load.svg('checkers-white', 'assets/game-icons/checkers-white.svg');
    this.load.svg('checkers', 'assets/game-icons/checkers.svg');

    // Note: Piece assets will be created programmatically using graphics
  }

  /**
   * Override InteractiveGame methods to prevent conflicts
   */
  startNextObjective() {
    // CheckersGame handles its own game flow
  }

  onObjectiveStart(objective) {
    // CheckersGame handles its own game flow
  }

  createInteractiveElements() {
    // CheckersGame creates its own interactive elements
  }

  /**
   * Override createBackground to use GCompris wood texture
   */
  createBackground() {
    const { width, height } = this.game.config;

    // Use GCompris wood background - absolute base layer
    this.background = this.add.image(width / 2, height / 2, 'background-wood');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);
  }

  /**
   * Create game UI
   */
  createGameUI() {
    // Create background first
    this.createBackground();

    const { width, height } = this.game.config;

    // Instruction Panel (GCTextPanel equivalent)
    const panelWidth = width - 120; // Leave space for score/progress
    const panelHeight = 60;
    this.instructionPanel = this.add.container(width / 2 - 60, 30); // Offset for score space

    // Panel background - dark semi-transparent rounded rectangle
    const panelBg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.7);
    panelBg.setStrokeStyle(2, 0xFFFFFF, 0.3);
    panelBg.setOrigin(0.5);

    // Panel text - white text
    this.headerText = this.add.text(0, 0, 'Checkers - White\'s turn', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    this.instructionPanel.add([panelBg, this.headerText]);
    this.instructionPanel.setDepth(10);

    // Progress badge in top-right
    this.progressBadge = this.add.container(width - 60, 30);
    this.progressBadge.setDepth(10);
    const badgeBg = this.add.circle(0, 0, 25, 0x4CAF50);
    this.progressText = this.add.text(0, 0, '1/5', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.progressBadge.add([badgeBg, this.progressText]);

    // Create the game board area
    this.createBoard();

    // Create navigation dock
    this.createNavigationDock(width, height);
  }

  /**
   * Create the 8x8 checkers board
   */
  createBoard() {
    const { width, height } = this.game.config;

    // Center the board in safe area between top panel and navigation dock
    const safeTopY = 90; // Top panel bottom
    const safeBottomY = height - 140; // Navigation dock top
    const safeAreaHeight = safeBottomY - safeTopY;

    // Calculate board dimensions
    const boardPixelSize = this.boardSize * this.cellSize;
    const startX = (width - boardPixelSize) / 2;
    const startY = safeTopY + (safeAreaHeight - boardPixelSize) / 2;

    this.boardOffset = { x: startX, y: startY };

    // Create board container
    this.boardContainer = this.add.container(startX, startY);
    this.boardContainer.setDepth(10);

    // Initialize board array
    this.board = [];
    for (let row = 0; row < this.boardSize; row++) {
      this.board[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // Determine square color (alternating pattern)
        const isBlackSquare = (row + col) % 2 === 1;

        // Create square background
        const squareBg = this.add.graphics();
        squareBg.fillStyle(isBlackSquare ? 0x000000 : 0xFFFFFF);
        squareBg.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);

        // Add subtle border
        squareBg.lineStyle(1, 0x333333);
        squareBg.strokeRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);

        this.boardContainer.add(squareBg);

        // Store board square info
        this.board[row][col] = {
          row: row,
          col: col,
          isPlayable: isBlackSquare,
          piece: null,
          graphics: squareBg
        };
      }
    }

    // Create pieces container (on top of board)
    this.piecesContainer = this.add.container(startX, startY);
    this.piecesContainer.setDepth(15);

    // Initialize the game
    this.initializeGame();
  }

  /**
   * Initialize the checkers game state
   */
  initializeGame() {
    // Clear any existing pieces
    this.clearPieces();

    // Standard checkers starting position
    // White pieces (player) on rows 0-2
    // Black pieces (AI) on rows 5-7
    // Row 3-4 are empty

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col].isPlayable) {
          let piece = null;

          if (row >= 0 && row <= 2) {
            // White pieces (bottom rows in display, but white moves "up" in game logic)
            piece = this.createPiece(row, col, 'white');
          } else if (row >= 5 && row <= 7) {
            // Black pieces (top rows in display)
            piece = this.createPiece(row, col, 'black');
          }

          this.board[row][col].piece = piece;
          if (piece) {
            this.pieces.push(piece);
          }
        }
      }
    }

    // Set initial game state
    this.gameOver = false;
    this.currentPlayer = 'white';
    this.selectedPiece = null;
    this.validMoves = [];

    this.updateUI();
  }

  /**
   * Create a game piece
   */
  createPiece(row, col, color) {
    const piece = {
      row: row,
      col: col,
      color: color,
      isKing: false,
      graphics: null
    };

    // Create piece graphics (circle with border)
    const graphics = this.add.graphics();
    const centerX = col * this.cellSize + this.cellSize / 2;
    const centerY = row * this.cellSize + this.cellSize / 2;
    const radius = (this.cellSize * 0.35);

    // Piece color
    const pieceColor = color === 'white' ? 0xFF6B6B : 0x333333; // Red for white pieces, dark gray for black pieces
    const borderColor = 0x000000;

    // Draw piece
    graphics.fillStyle(pieceColor);
    graphics.fillCircle(centerX, centerY, radius);
    graphics.lineStyle(3, borderColor);
    graphics.strokeCircle(centerX, centerY, radius);

    // Add king crown if king
    if (piece.isKing) {
      graphics.lineStyle(2, 0xFFD700); // Gold color
      // Simple crown shape
      graphics.strokeTriangle(
        centerX - radius * 0.3, centerY - radius * 0.7,
        centerX, centerY - radius * 1.1,
        centerX + radius * 0.3, centerY - radius * 0.7
      );
    }

    // Make piece interactive
    graphics.setInteractive(new Phaser.Geom.Circle(centerX, centerY, radius), Phaser.Geom.Circle.Contains);
    graphics.on('pointerdown', () => this.onPieceClick(piece));

    this.piecesContainer.add(graphics);
    piece.graphics = graphics;

    return piece;
  }

  /**
   * Clear all pieces from the board
   */
  clearPieces() {
    this.pieces.forEach(piece => {
      if (piece.graphics) {
        piece.graphics.destroy();
      }
    });
    this.pieces = [];

    // Clear board piece references
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        this.board[row][col].piece = null;
      }
    }
  }

  /**
   * Handle piece click
   */
  onPieceClick(piece) {
    if (this.gameOver || piece.color !== this.currentPlayer) {
      return;
    }

    // If clicking the same piece, deselect it
    if (this.selectedPiece === piece) {
      this.deselectPiece();
      return;
    }

    // Select the new piece
    this.selectPiece(piece);
  }

  /**
   * Select a piece and show valid moves
   */
  selectPiece(piece) {
    // Deselect previous piece
    this.deselectPiece();

    // Select new piece
    this.selectedPiece = piece;

    // Highlight the selected piece (redraw with highlight color)
    if (piece.graphics) {
      // Clear and redraw with highlight
      piece.graphics.clear();
      const centerX = piece.col * this.cellSize + this.cellSize / 2;
      const centerY = piece.row * this.cellSize + this.cellSize / 2;
      const radius = (this.cellSize * 0.35);

      // Highlight color (yellow)
      const highlightColor = 0xFFFF00;
      const borderColor = 0x000000;

      piece.graphics.fillStyle(highlightColor);
      piece.graphics.fillCircle(centerX, centerY, radius);
      piece.graphics.lineStyle(3, borderColor);
      piece.graphics.strokeCircle(centerX, centerY, radius);

      // Add king crown if king
      if (piece.isKing) {
        piece.graphics.lineStyle(2, 0xFFD700);
        piece.graphics.strokeTriangle(
          centerX - radius * 0.3, centerY - radius * 0.7,
          centerX, centerY - radius * 1.1,
          centerX + radius * 0.3, centerY - radius * 0.7
        );
      }
    }

    // Calculate and show valid moves
    this.calculateValidMoves(piece);
    this.showValidMoves();
  }

  /**
   * Deselect the currently selected piece
   */
  deselectPiece() {
    if (this.selectedPiece && this.selectedPiece.graphics) {
      // Redraw piece in normal color
      this.selectedPiece.graphics.clear();
      const centerX = this.selectedPiece.col * this.cellSize + this.cellSize / 2;
      const centerY = this.selectedPiece.row * this.cellSize + this.cellSize / 2;
      const radius = (this.cellSize * 0.35);

      const pieceColor = this.selectedPiece.color === 'white' ? 0xFF6B6B : 0x333333;
      const borderColor = 0x000000;

      this.selectedPiece.graphics.fillStyle(pieceColor);
      this.selectedPiece.graphics.fillCircle(centerX, centerY, radius);
      this.selectedPiece.graphics.lineStyle(3, borderColor);
      this.selectedPiece.graphics.strokeCircle(centerX, centerY, radius);

      // Add king crown if king
      if (this.selectedPiece.isKing) {
        this.selectedPiece.graphics.lineStyle(2, 0xFFD700);
        this.selectedPiece.graphics.strokeTriangle(
          centerX - radius * 0.3, centerY - radius * 0.7,
          centerX, centerY - radius * 1.1,
          centerX + radius * 0.3, centerY - radius * 0.7
        );
      }
    }

    this.selectedPiece = null;
    this.clearValidMoves();
  }

  /**
   * Calculate valid moves for a piece
   */
  calculateValidMoves(piece) {
    this.validMoves = [];

    // For now, implement basic diagonal movement
    // TODO: Implement full checkers rules with captures
    const directions = piece.isKing ?
      [[-1, -1], [-1, 1], [1, -1], [1, 1]] : // Kings can move in all directions
      piece.color === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]; // Regular pieces move forward

    directions.forEach(([dRow, dCol]) => {
      const newRow = piece.row + dRow;
      const newCol = piece.col + dCol;

      // Check bounds
      if (newRow >= 0 && newRow < this.boardSize && newCol >= 0 && newCol < this.boardSize) {
        const targetSquare = this.board[newRow][newCol];

        // Can move to empty black squares
        if (targetSquare.isPlayable && !targetSquare.piece) {
          this.validMoves.push({
            row: newRow,
            col: newCol,
            type: 'move'
          });
        }
      }
    });
  }

  /**
   * Show valid moves on the board
   */
  showValidMoves() {
    this.clearValidMoves();

    this.validMoves.forEach(move => {
      const square = this.board[move.row][move.col];
      const centerX = this.boardOffset.x + move.col * this.cellSize + this.cellSize / 2;
      const centerY = this.boardOffset.y + move.row * this.cellSize + this.cellSize / 2;

      // Create highlight circle
      const highlight = this.add.graphics();
      highlight.fillStyle(0x00FF00, 0.5); // Semi-transparent green
      highlight.fillCircle(centerX, centerY, this.cellSize * 0.3);

      // Make it interactive
      highlight.setInteractive(new Phaser.Geom.Circle(centerX, centerY, this.cellSize * 0.3), Phaser.Geom.Circle.Contains);
      highlight.on('pointerdown', () => {
        this.movePiece(this.selectedPiece, move.row, move.col);
      });

      highlight.setDepth(12);
      this.validMovesHighlights = this.validMovesHighlights || [];
      this.validMovesHighlights.push(highlight);
    });
  }

  /**
   * Clear valid moves highlights
   */
  clearValidMoves() {
    if (this.validMovesHighlights) {
      this.validMovesHighlights.forEach(highlight => highlight.destroy());
      this.validMovesHighlights = [];
    }
    this.validMoves = [];
  }

  /**
   * Move a piece to a new position
   */
  movePiece(piece, newRow, newCol) {
    // Remove piece from old position
    this.board[piece.row][piece.col].piece = null;

    // Update piece position
    piece.row = newRow;
    piece.col = newCol;

    // Place piece in new position
    this.board[newRow][newCol].piece = piece;

    // Update piece graphics position
    if (piece.graphics) {
      piece.graphics.clear();
      const centerX = newCol * this.cellSize + this.cellSize / 2;
      const centerY = newRow * this.cellSize + this.cellSize / 2;
      const radius = (this.cellSize * 0.35);

      const pieceColor = piece.color === 'white' ? 0xFF6B6B : 0x333333;
      const borderColor = 0x000000;

      piece.graphics.fillStyle(pieceColor);
      piece.graphics.fillCircle(centerX, centerY, radius);
      piece.graphics.lineStyle(3, borderColor);
      piece.graphics.strokeCircle(centerX, centerY, radius);

      // Add king crown if king
      if (piece.isKing) {
        piece.graphics.lineStyle(2, 0xFFD700);
        piece.graphics.strokeTriangle(
          centerX - radius * 0.3, centerY - radius * 0.7,
          centerX, centerY - radius * 1.1,
          centerX + radius * 0.3, centerY - radius * 0.7
        );
      }

      // Update interactivity
      piece.graphics.setInteractive(new Phaser.Geom.Circle(centerX, centerY, radius), Phaser.Geom.Circle.Contains);
    }

    // Check for king promotion
    if (!piece.isKing) {
      if ((piece.color === 'white' && newRow === 0) ||
          (piece.color === 'black' && newRow === this.boardSize - 1)) {
        piece.isKing = true;
        // Redraw with king crown
        this.movePiece(piece, newRow, newCol);
      }
    }

    // Switch turns
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    this.updateUI();

    // Deselect piece
    this.deselectPiece();

    this.playSound('move');
  }

  /**
   * Update UI elements
   */
  updateUI() {
    if (this.headerText) {
      const playerName = this.currentPlayer === 'white' ? 'White' : 'Black';
      const status = this.gameOver ? 'Game Over' : `${playerName}'s turn`;
      this.headerText.setText(`Checkers - ${status}`);
    }

    if (this.progressText) {
      this.progressText.setText(`${this.currentLevel}/${this.maxLevel}`);
    }
  }

  /**
   * Create navigation dock (GCompris style bottom dock)
   */
  createNavigationDock(width, height) {
    const dockY = height - 80;
    const buttonSize = 90;
    const spacing = 130;

    // Dock background
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.95);
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);
    dockBg.setDepth(100);

    // Dock shadow
    const dockShadow = this.add.graphics();
    dockShadow.fillStyle(0x000000, 0.3);
    dockShadow.fillRoundedRect(width / 2 - (width - 60) / 2 + 4, dockY - 56, width - 60, 120, 60);
    dockShadow.setDepth(99);

    // Dock border
    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(5, 0x0062FF, 1);
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);
    dockBorder.setDepth(100);

    const controls = [
      { icon: 'help.svg', action: 'help', color: 0x00B378, label: 'Help' },
      { icon: 'home.svg', action: 'home', color: 0x0062FF, label: 'Home' },
      { icon: 'settings.svg', action: 'levels', color: 0xFACA2A, label: 'Levels' },
      { icon: 'exit.svg', action: 'menu', color: 0xAB47BC, label: 'Menu' }
    ];

    const totalWidth = (controls.length - 1) * spacing + buttonSize;
    const startX = (width - totalWidth) / 2 + buttonSize / 2;

    controls.forEach((control, index) => {
      const x = startX + index * spacing;

      // Button shadow
      const buttonShadow = this.add.circle(x + 4, dockY + 4, buttonSize / 2, 0x000000, 0.4);
      buttonShadow.setDepth(100);

      // Button
      const button = this.add.circle(x, dockY, buttonSize / 2, control.color);
      button.setStrokeStyle(5, 0xFFFFFF);
      button.setInteractive({ useHandCursor: true });
      button.setDepth(100);

      // Icon
      const icon = this.add.sprite(x, dockY, control.icon.replace('.svg', ''));
      icon.setScale((buttonSize * 0.7) / 100);
      icon.setTint(0xFFFFFF);
      icon.setDepth(101);

      // Label
      const label = this.add.text(x, dockY + buttonSize / 2 + 20, control.label, {
        fontSize: '14px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }).setOrigin(0.5).setDepth(101);

      // Click handler
      button.on('pointerdown', () => this.onNavigationClick(control.action));
    });
  }

  /**
   * Handle navigation dock clicks
   */
  onNavigationClick(action) {
    switch (action) {
      case 'help':
        // Show help modal using HelpSystem
        if (this.helpSystem) {
          this.helpSystem.showHelpModal('CheckersGame');
        }
        break;
      case 'home':
      case 'menu':
        // Go to main menu
        this.scene.start('GameMenu');
        break;
      case 'levels':
        // Show level selection (TODO: implement)
        console.log('Levels clicked');
        break;
    }
  }

  /**
   * Start the game
   */
  create() {
    // Call super.create() first to ensure parent class sets up the base world
    super.create();

    // Create game UI after parent setup
    this.createGameUI();
  }

  /**
   * Setup game logic - called from parent class create() method
   */
  setupGameLogic() {
    // Game logic is already set up in createGameUI
    // TODO: Initialize draughts.js engine when available
  }

  /**
   * Play sound effect
   */
  playSound(soundName) {
    // For now, just log - we'll implement proper audio later
    console.log(`Playing sound: ${soundName}`);
  }

  /**
   * Update method - called every frame
   */
  update(time, delta) {
    // Game logic updates if needed
  }

  /**
   * Clean up when game ends
   */
  shutdown() {
    super.shutdown();
  }
}