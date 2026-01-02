import Phaser from 'phaser';
import { Draughts } from '../utils/engine.js';

export class CheckersGame extends Phaser.Scene {
  constructor() {
    super({ key: 'CheckersGame' });

    // Game configuration matching GCompris
    this.gameConfig = {
      numberOfCases: 10, // 10x10 board instead of 8x8
      tileSize: 0,
      boardStartX: 0,
      boardStartY: 0,
      currentLevel: 1,
      numberOfLevel: 5,
    };

    // Game state
    this.state = null;
    this.from = -1;
    this.gameOver = false;
    this.redo_stack = [];
    this.pieces = [];
    this.tiles = [];
    this.selectedPiece = null;
    this.possibleMoves = [];
    this.moveIndicators = [];
    this.currentPlayer = 'W'; // W for White, B for Black
  }

  init(data) {
    this.app = data.app;
  }

  preload() {
    // Load background
    this.load.svg('background-wood', 'assets/game-icons/background-wood.svg');

    // Load board tiles
    this.load.svg('checkers-white', 'assets/game-icons/checkers-white.svg');
    this.load.svg('checkers-black', 'assets/game-icons/checkers-black.svg');

    // Load pieces
    this.load.svg('w', 'assets/game-icons/w.svg');   // White pawn
    this.load.svg('wk', 'assets/game-icons/wk.svg'); // White king
    this.load.svg('b', 'assets/game-icons/b.svg');   // Black pawn
    this.load.svg('bk', 'assets/game-icons/bk.svg'); // Black king

    // Load UI icons
    this.load.svg('undo', 'assets/game-icons/undo.svg');
    this.load.svg('redo', 'assets/game-icons/redo.svg');
    this.load.svg('turn', 'assets/game-icons/turn.svg');
    this.load.svg('help', 'assets/game-icons/bar_help.svg');
    this.load.svg('home', 'assets/game-icons/bar_home.svg');
    this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
  }

  create() {
    const { width, height } = this.game.config;

    // Calculate tile size for 10x10 board
    this.gameConfig.tileSize = Math.min(width, height) / this.gameConfig.numberOfCases;

    // Calculate board position (centered)
    this.gameConfig.boardStartX = (width - (this.gameConfig.numberOfCases * this.gameConfig.tileSize)) / 2;
    this.gameConfig.boardStartY = (height - (this.gameConfig.numberOfCases * this.gameConfig.tileSize)) / 2;

    // Create background
    this.createBackground(width, height);

    // Create board frame
    this.createBoardFrame();

    // Create board tiles
    this.createBoard();

    // Initialize game engine
    this.initLevel();

    // Create turn indicator
    this.createTurnIndicator();

    // Create bottom controls
    this.createBottomControls(width, height);

    // Setup input handling
    this.setupInputHandling();
  }

  createBackground(width, height) {
    // Wood background scaled to cover screen
    this.background = this.add.image(width / 2, height / 2, 'background-wood');
    const scale = Math.max(width / this.background.width, height / this.background.height);
    this.background.setScale(scale);
    this.background.setDepth(-10);
  }

  createBoardFrame() {
    const { boardStartX, boardStartY, tileSize, numberOfCases } = this.gameConfig;
    const boardWidth = numberOfCases * tileSize;
    const boardHeight = numberOfCases * tileSize;

    // Dark brown frame behind the tiles
    this.boardFrame = this.add.rectangle(
      boardStartX + boardWidth / 2,
      boardStartY + boardHeight / 2,
      boardWidth + 20,
      boardHeight + 20,
      0x2E1B0C // Dark brown
    );
    this.boardFrame.setDepth(-1);
  }

  createBoard() {
    const { boardStartX, boardStartY, tileSize, numberOfCases } = this.gameConfig;

    this.tiles = [];

    for (let row = 0; row < numberOfCases; row++) {
      for (let col = 0; col < numberOfCases; col++) {
        const x = boardStartX + col * tileSize + tileSize / 2;
        const y = boardStartY + row * tileSize + tileSize / 2;

        // Only create tiles on playable squares (black squares in checkers)
        const isPlayable = (row + col) % 2 === 1;
        if (isPlayable) {
          const tileType = ((row * numberOfCases + col) % 2 === 0) ? 'checkers-black' : 'checkers-white';
          const tile = this.add.image(x, y, tileType);
          tile.setDisplaySize(tileSize, tileSize);
          tile.setDepth(1);

          // Store tile data
          tile.row = row;
          tile.col = col;
          tile.boardPos = row * numberOfCases + col;

          this.tiles.push(tile);
        }
      }
    }
  }

  initLevel() {
    // Initialize the draughts engine with starting position
    this.state = new Draughts('W:W31-50:B1-20');
    this.state.resetGame();

    this.from = -1;
    this.gameOver = false;
    this.redo_stack = [];
    this.currentPlayer = 'W';

    // Create pieces based on engine state
    this.refreshPieces();
  }

  refreshPieces() {
    // Clear existing pieces
    this.pieces.forEach(piece => piece.destroy());
    this.pieces = [];

    const positions = this.simplifiedState(this.state.position());

    positions.forEach(posData => {
      const boardPos = posData.pos;
      const pieceType = posData.piece;

      if (pieceType !== '0') {
        const piece = this.createPiece(boardPos, pieceType);
        this.pieces.push(piece);
      }
    });
  }

  createPiece(boardPos, pieceType) {
    const { boardStartX, boardStartY, tileSize, numberOfCases } = this.gameConfig;

    const row = Math.floor(boardPos / numberOfCases);
    const col = boardPos % numberOfCases;

    const x = boardStartX + col * tileSize + tileSize / 2;
    const y = boardStartY + row * tileSize + tileSize / 2;

    // Map piece types to asset names
    const assetMap = {
      'w': 'w',   // White pawn
      'wk': 'wk', // White king
      'b': 'b',   // Black pawn
      'bk': 'bk'  // Black king
    };

    const piece = this.add.image(x, y, assetMap[pieceType]);
    const pieceSize = tileSize - 12; // 6px padding on each side
    piece.setDisplaySize(pieceSize, pieceSize);
    piece.setDepth(10);

    // Store piece data
    piece.boardPos = boardPos;
    piece.pieceType = pieceType;
    piece.row = row;
    piece.col = col;

    // Make piece interactive for drag and drop
    piece.setInteractive();
    this.input.setDraggable(piece);

    return piece;
  }

  createTurnIndicator() {
    const { width } = this.game.config;

    // Create turn indicator panel at the top
    this.turnIndicator = this.add.rectangle(width / 2, 40, 300, 50, 0x000000, 0.7);
    this.turnIndicator.setStrokeStyle(2, 0xFFFFFF);

    this.turnText = this.add.text(width / 2, 40, "White's turn", {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.updateTurnIndicator();
  }

  updateTurnIndicator() {
    const playerName = this.currentPlayer === 'W' ? "White's turn" : "Black's turn";
    this.turnText.setText(playerName);
  }

  createBottomControls(width, height) {
    const barY = height - 55;
    const buttonSize = 72;
    const spacing = 95;

    // Create 5 buttons: Help, Home, Undo, Level, Redo
    const controls = [
      { icon: 'help', action: 'help' },
      { icon: 'home', action: 'home' },
      { icon: 'undo', action: 'undo' },
      { icon: 'turn', action: 'level' }, // Level indicator
      { icon: 'redo', action: 'redo' }
    ];

    const totalWidth = (controls.length * buttonSize) + ((controls.length - 1) * (spacing - buttonSize));
    const startX = (width - totalWidth) / 2;

    controls.forEach((control, index) => {
      const x = startX + index * spacing;
      const y = barY;

      // Button background
      const button = this.add.graphics();
      button.fillStyle(0xFFFFFF, 0.8);
      button.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 10);
      button.lineStyle(2, 0xFFFFFF, 0.8);
      button.strokeRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, 10);
      button.setInteractive(new Phaser.Geom.Rectangle(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);

      // Icon
      const icon = this.add.image(x, y, control.icon);
      icon.setDisplaySize(buttonSize * 0.6, buttonSize * 0.6);

      // Level indicator text (special case for level button)
      if (control.action === 'level') {
        this.levelText = this.add.text(x, y + 15, this.gameConfig.currentLevel.toString(), {
          fontSize: '16px',
          color: '#FFFFFF',
          fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
      }

      button.on('pointerdown', () => {
        if (this.app?.audioManager) {
          this.app.audioManager.playClickSound();
        }
        this.handleControlAction(control.action);
      });

      button.setDepth(100);
      icon.setDepth(101);
    });
  }

  setupInputHandling() {
    // Drag and drop handling
    this.input.on('dragstart', (pointer, gameObject) => {
      if (this.gameOver) return;

      this.selectedPiece = gameObject;
      this.from = gameObject.boardPos;

      // Highlight possible moves
      this.showPossibleMoves();
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (this.gameOver) return;

      gameObject.setPosition(dragX, dragY);
      gameObject.setDepth(100);
    });

    this.input.on('dragend', (pointer, gameObject) => {
      if (this.gameOver) return;

      // Find the tile under the dropped piece
      const tile = this.getTileAtPosition(pointer.x, pointer.y);

      if (tile) {
        const to = tile.boardPos;

        // Try to make the move
        if (this.makeMove(this.from, to)) {
          // Move successful
          this.clearPossibleMoves();

          // Check for promotion
          this.checkPromotion(gameObject, to);

          // Switch turns
          this.currentPlayer = this.currentPlayer === 'W' ? 'B' : 'W';
          this.updateTurnIndicator();

          // AI move if it's Black's turn
          if (this.currentPlayer === 'B') {
            this.time.delayedCall(500, () => this.makeAIMove());
          }
        } else {
          // Move failed, return piece to original position
          const originalPos = this.boardPosToPixel(this.from);
          gameObject.setPosition(originalPos.x, originalPos.y);
        }
      } else {
        // Dropped outside board, return to original position
        const originalPos = this.boardPosToPixel(this.from);
        gameObject.setPosition(originalPos.x, originalPos.y);
      }

      this.selectedPiece = null;
      this.from = -1;
      gameObject.setDepth(10);
      this.clearPossibleMoves();
    });
  }

  getTileAtPosition(x, y) {
    return this.tiles.find(tile => {
      const bounds = tile.getBounds();
      return bounds.contains(x, y);
    });
  }

  boardPosToPixel(boardPos) {
    const { boardStartX, boardStartY, tileSize, numberOfCases } = this.gameConfig;
    const row = Math.floor(boardPos / numberOfCases);
    const col = boardPos % numberOfCases;

    return {
      x: boardStartX + col * tileSize + tileSize / 2,
      y: boardStartY + row * tileSize + tileSize / 2
    };
  }

  showPossibleMoves() {
    this.clearPossibleMoves();

    if (this.from === -1) return;

    const moves = this.state.moves();
    const fromEngine = this.viewPosToEngine(this.from);

    moves.forEach(move => {
      if (move.from === fromEngine) {
        const toView = this.engineToViewPos(move.to);
        const pixelPos = this.boardPosToPixel(toView);

        // Create move indicator (gray semi-transparent circle)
        const indicator = this.add.circle(pixelPos.x, pixelPos.y, this.gameConfig.tileSize * 0.3, 0x808080, 0.5);
        indicator.setDepth(5);

        this.moveIndicators.push(indicator);
      }
    });
  }

  clearPossibleMoves() {
    this.moveIndicators.forEach(indicator => indicator.destroy());
    this.moveIndicators = [];
  }

  makeMove(from, to) {
    try {
      const move = this.state.move({
        "from": this.viewPosToEngine(from),
        "to": this.viewPosToEngine(to)
      });

      if (move) {
        // Move successful
        this.visibleMove(move, from, to);

        // Save move for undo
        this.redo_stack.push({
          from: from,
          to: to,
          move: move
        });

        return true;
      }
    } catch (error) {
      console.warn('Invalid move:', error);
    }
    return false;
  }

  visibleMove(move, from, to) {
    // Find and move the piece
    const piece = this.pieces.find(p => p.boardPos === from);
    if (piece) {
      const toPixel = this.boardPosToPixel(to);
      piece.setPosition(toPixel.x, toPixel.y);
      piece.boardPos = to;
      piece.row = Math.floor(to / this.gameConfig.numberOfCases);
      piece.col = to % this.gameConfig.numberOfCases;

      // Handle captures (remove jumped pieces)
      if (move.jumps && move.jumps.length > 0) {
        move.jumps.forEach(jumpPos => {
          const jumpViewPos = this.engineToViewPos(jumpPos);
          const jumpedPiece = this.pieces.find(p => p.boardPos === jumpViewPos);
          if (jumpedPiece) {
            jumpedPiece.destroy();
            this.pieces = this.pieces.filter(p => p !== jumpedPiece);
          }
        });
      }
    }
  }

  checkPromotion(piece, to) {
    const { numberOfCases } = this.gameConfig;

    // White promotion (reaching the top)
    if (piece.pieceType === 'w' && to <= numberOfCases - 1) {
      piece.pieceType = 'wk';
      piece.setTexture('wk');
    }
    // Black promotion (reaching the bottom)
    else if (piece.pieceType === 'b' && to >= (numberOfCases * (numberOfCases - 1))) {
      piece.pieceType = 'bk';
      piece.setTexture('bk');
    }
  }

  makeAIMove() {
    const moves = this.state.moves();
    if (moves.length === 0) {
      this.gameOver = true;
      return;
    }

    // Simple AI: pick a random move
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    const fromView = this.engineToViewPos(randomMove.from);
    const toView = this.engineToViewPos(randomMove.to);

    this.makeMove(fromView, toView);
    this.currentPlayer = 'W';
    this.updateTurnIndicator();
  }

  handleControlAction(action) {
    switch (action) {
      case 'help':
        this.showHelpModal();
        break;
      case 'home':
        this.scene.stop('CheckersGame');
        this.app.showGameMenu();
        break;
      case 'undo':
        this.undoMove();
        break;
      case 'redo':
        this.redoMove();
        break;
      case 'level':
        // Could implement level selection here
        break;
    }
  }

  undoMove() {
    if (this.redo_stack.length > 0) {
      // For simplicity, just reset the level
      this.initLevel();
    }
  }

  redoMove() {
    // Implement redo functionality if needed
  }

  showHelpModal() {
    const { width, height } = this.game.config;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();

    const modalBg = this.add.rectangle(width / 2, height / 2, 500, 400, 0xFDFAED);
    modalBg.setStrokeStyle(4, 0xFACA2A);

    const helpText = this.add.text(width / 2, height / 2,
      'Checkers Game\n\n' +
      '• Drag and drop pieces to move\n' +
      '• Capture by jumping over opponent pieces\n' +
      '• Reach the opposite end to become a King\n' +
      '• Kings can move and capture in all directions\n\n' +
      'Good luck!', {
      fontSize: '18px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    const closeBtn = this.add.circle(width / 2 + 220, height / 2 - 180, 20, 0xE32528);
    closeBtn.setInteractive();
    closeBtn.on('pointerdown', () => {
      if (this.app?.audioManager) this.app.audioManager.playClickSound();
      this.closeHelpModal();
    });

    const closeText = this.add.text(width / 2 + 220, height / 2 - 180, '×', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5);

    this.helpModal = [overlay, modalBg, helpText, closeBtn, closeText];
    overlay.on('pointerdown', () => this.closeHelpModal());
  }

  closeHelpModal() {
    if (this.helpModal) {
      this.helpModal.forEach(element => element.destroy());
      this.helpModal = null;
    }
  }

  // Coordinate mapping functions (from GCompris checkers.js)
  viewPosToEngine(pos) {
    const casesNumber = this.gameConfig.numberOfCases * this.gameConfig.numberOfCases;
    const a = 10 * Math.floor((casesNumber - pos) / 10 + 1);
    let b = 20;
    if (pos % 10 !== 0) {
      b = (casesNumber - pos) % 10;
    }
    let newPos = (a - b + 1);
    newPos = Math.floor(newPos / 2 + 0.5);
    return newPos;
  }

  engineToViewPos(pos) {
    const newPos = 90 - 10 * Math.floor((2 * pos - 1) / 10) + 2 * ((pos - 1) % 5) + 1 + ((-1 + Math.pow(-1, Math.floor((2 * pos - 1) / 10))) / 2);
    return newPos;
  }

  // Simplified state function (adapted from GCompris)
  simplifiedState(position) {
    const result = [];
    const posStr = position.substring(1); // Skip the side-to-move character

    for (let i = 0; i < posStr.length; i++) {
      const piece = posStr[i];
      if (piece !== '0') {
        let pieceType = piece;
        // Convert to our naming convention
        if (piece === 'B') pieceType = 'bk'; // Black king
        else if (piece === 'W') pieceType = 'wk'; // White king
        else if (piece === 'b') pieceType = 'b';  // Black pawn
        else if (piece === 'w') pieceType = 'w';  // White pawn

        result.push({
          pos: this.engineToViewPos(i + 1),
          piece: pieceType
        });
      }
    }

    return result;
  }
}
