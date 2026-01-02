import Phaser from 'phaser';
import Draughts from '../utils/engine.js';

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
    this.bottomControls = [];
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

    // Calculate tile size for 10x10 board with proper centering
    const boardSize = Math.min(width, height) * 0.75; // Use 75% of available space
    this.gameConfig.tileSize = boardSize / this.gameConfig.numberOfCases;

    // Calculate board position (perfectly centered)
    this.gameConfig.boardStartX = (width - boardSize) / 2;
    this.gameConfig.boardStartY = (height - boardSize) / 2;

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

    // Create turn indicator panel at the top (GCompris instruction panel style)
    const panelWidth = 280;
    const panelHeight = 45;
    const panelY = 35;

    // Black rounded rectangle with white stroke
    this.turnIndicator = this.add.graphics();
    this.turnIndicator.fillStyle(0x000000, 0.7);
    this.turnIndicator.fillRoundedRect(width / 2 - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 8);
    this.turnIndicator.lineStyle(2, 0xFFFFFF, 0.8);
    this.turnIndicator.strokeRoundedRect(width / 2 - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 8);

    this.turnText = this.add.text(width / 2, panelY, "White's turn", {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold'
    }).setOrigin(0.5);

    this.updateTurnIndicator();
  }

  updateTurnIndicator() {
    const playerName = this.currentPlayer === 'W' ? "White's turn" : "Black's turn";
    this.turnText.setText(playerName);
  }

  clearBottomControls() {
    if (this.bottomControls) {
      this.bottomControls.forEach(control => {
        if (control.button && control.button.destroy) control.button.destroy();
        if (control.icon && control.icon.destroy) control.icon.destroy();
        if (control.leftArrow && control.leftArrow.destroy) control.leftArrow.destroy();
        if (control.rightArrow && control.rightArrow.destroy) control.rightArrow.destroy();
        if (control.levelText && control.levelText.destroy) control.levelText.destroy();
      });
    }
    this.bottomControls = [];
  }

  createBottomControls(width, height) {
    // Clear existing controls first
    this.clearBottomControls();

    const barY = height - 50;
    const buttonWidth = 80;
    const buttonHeight = 60;
    const spacing = 85;

    // GCompris Activity Bar: Help, Home, Undo, Level Selector, Redo
    const controls = [
      { icon: 'help', action: 'help' },
      { icon: 'home', action: 'home' },
      { icon: 'undo', action: 'undo' },
      { icon: null, action: 'level' }, // Special level selector
      { icon: 'redo', action: 'redo' }
    ];

    const totalWidth = (controls.length * buttonWidth) + ((controls.length - 1) * (spacing - buttonWidth));
    const startX = (width - totalWidth) / 2;

    controls.forEach((control, index) => {
      const x = startX + index * buttonWidth + (index * (spacing - buttonWidth));
      const y = barY;

      // White rounded rectangle button (GCompris Sticker style)
      const button = this.add.graphics();
      button.fillStyle(0xFFFFFF, 0.9);
      button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      button.lineStyle(2, 0xCCCCCC, 0.8);
      button.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      button.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

      // Special handling for level selector
      if (control.action === 'level') {
        // Left arrow
        const leftArrow = this.add.text(x - 15, y, '<', {
          fontSize: '24px',
          color: '#F05A28',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold'
        }).setOrigin(0.5);

        // Level number
        this.levelText = this.add.text(x, y, this.gameConfig.currentLevel.toString(), {
          fontSize: '20px',
          color: '#333333',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold'
        }).setOrigin(0.5);

        // Right arrow
        const rightArrow = this.add.text(x + 15, y, '>', {
          fontSize: '24px',
          color: '#F05A28',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold'
        }).setOrigin(0.5);

        // Make arrows clickable for level changing
        leftArrow.setInteractive();
        rightArrow.setInteractive();

        leftArrow.on('pointerdown', () => {
          if (this.app?.audioManager) this.app.audioManager.playClickSound();
          this.changeLevel(-1);
        });

        rightArrow.on('pointerdown', () => {
          if (this.app?.audioManager) this.app.audioManager.playClickSound();
          this.changeLevel(1);
        });

        this.bottomControls.push({
          button: button,
          leftArrow: leftArrow,
          levelText: this.levelText,
          rightArrow: rightArrow,
          action: control.action
        });

        button.setDepth(200);
        leftArrow.setDepth(201);
        this.levelText.setDepth(201);
        rightArrow.setDepth(201);

      } else {
        // Regular icon button
        const icon = this.add.image(x, y, control.icon);
        icon.setDisplaySize(buttonWidth * 0.5, buttonHeight * 0.5);

        button.on('pointerdown', () => {
          if (this.app?.audioManager) this.app.audioManager.playClickSound();
          this.handleControlAction(control.action);
        });

        button.on('pointerover', () => {
          button.clear();
          button.fillStyle(0xF0F0F0, 0.9);
          button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
          button.lineStyle(2, 0x999999, 0.8);
          button.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        });

        button.on('pointerout', () => {
          button.clear();
          button.fillStyle(0xFFFFFF, 0.9);
          button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
          button.lineStyle(2, 0xCCCCCC, 0.8);
          button.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        });

        this.bottomControls.push({
          button: button,
          icon: icon,
          action: control.action
        });

        button.setDepth(200);
        icon.setDepth(201);
      }
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

          // AI move if it's Black's turn (with longer delay for better UX)
          if (this.currentPlayer === 'B') {
            this.time.delayedCall(800, () => this.makeAIMove());
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

    // Filter moves to only show mandatory captures if any exist
    let validMoves = moves.filter(move => move.from === fromEngine);

    // If there are captures available, only show capture moves
    const captureMoves = moves.filter(move => move.captures && move.captures.length > 0);
    if (captureMoves.length > 0) {
      validMoves = validMoves.filter(move => move.captures && move.captures.length > 0);
    }

    validMoves.forEach(move => {
      const toView = this.engineToViewPos(move.to);
      const pixelPos = this.boardPosToPixel(toView);

      // Create move indicator (gray semi-transparent circle)
      const indicator = this.add.circle(pixelPos.x, pixelPos.y, this.gameConfig.tileSize * 0.3, 0x808080, 0.6);
      indicator.setDepth(5);

      this.moveIndicators.push(indicator);
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

      // Animate piece movement
      this.tweens.add({
        targets: piece,
        x: toPixel.x,
        y: toPixel.y,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          piece.boardPos = to;
          piece.row = Math.floor(to / this.gameConfig.numberOfCases);
          piece.col = to % this.gameConfig.numberOfCases;
        }
      });

      // Handle captures (animate removal of jumped pieces)
      if (move.captures && move.captures.length > 0) {
        move.captures.forEach(capturePos => {
          const captureViewPos = this.engineToViewPos(capturePos);
          const capturedPiece = this.pieces.find(p => p.boardPos === captureViewPos);
          if (capturedPiece) {
            // Animate capture (shrink and fade)
            this.tweens.add({
              targets: capturedPiece,
              scale: 0,
              alpha: 0,
              duration: 400,
              ease: 'Power2',
              onComplete: () => {
                capturedPiece.destroy();
                this.pieces = this.pieces.filter(p => p !== capturedPiece);
              }
            });
          }
        });
      }
    }
  }

  checkPromotion(piece, to) {
    const { numberOfCases } = this.gameConfig;
    let promoted = false;

    // White promotion (reaching the top)
    if (piece.pieceType === 'w' && to <= numberOfCases - 1) {
      piece.pieceType = 'wk';
      promoted = true;
    }
    // Black promotion (reaching the bottom)
    else if (piece.pieceType === 'b' && to >= (numberOfCases * (numberOfCases - 1))) {
      piece.pieceType = 'bk';
      promoted = true;
    }

    if (promoted) {
      // Animate promotion (scale up and down like "crowning")
      this.tweens.add({
        targets: piece,
        scaleX: piece.scaleX * 1.3,
        scaleY: piece.scaleY * 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          piece.setTexture(piece.pieceType);
        }
      });
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
      case 'level':
        // Level selection is handled by the arrow buttons
        break;
      case 'redo':
        this.redoMove();
        break;
    }
  }

  changeLevel(delta) {
    const newLevel = this.gameConfig.currentLevel + delta;
    if (newLevel >= 1 && newLevel <= this.gameConfig.numberOfLevel) {
      this.gameConfig.currentLevel = newLevel;
      this.levelText.setText(newLevel.toString());
      // In a full implementation, you might want to adjust AI difficulty here
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
