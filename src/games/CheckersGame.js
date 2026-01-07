import Phaser from 'phaser';
import Draughts from '../utils/engine.js';

export class CheckersGame extends Phaser.Scene {
  constructor(key = 'CheckersGame') {
    super({ key: key });

    this.gameConfig = {
      numberOfCases: 10,
      tileSize: 0,
      boardStartX: 0,
      boardStartY: 0,
      currentLevel: 1,
      numberOfLevel: 5,
    };

    this.state = null;
    this.from = -1;
    this.gameOver = false;
    this.pieces = [];
    this.tiles = [];
    this.selectedPiece = null;
    this.moveIndicators = [];
    this.currentPlayer = 'W'; 
  }

  init(data) {
    this.app = data.app;
  }

  preload() {
    this.load.svg('background-wood', 'assets/game-icons/background-wood.svg');
    this.load.svg('checkers-white', 'assets/game-icons/checkers-white.svg');
    this.load.svg('checkers-black', 'assets/game-icons/checkers-black.svg');
    this.load.svg('w', 'assets/game-icons/w.svg');   
    this.load.svg('wk', 'assets/game-icons/wk.svg'); 
    this.load.svg('b', 'assets/game-icons/b.svg');   
    this.load.svg('bk', 'assets/game-icons/bk.svg'); 
    this.load.svg('undo', 'assets/game-icons/undo.svg');
    this.load.svg('redo', 'assets/game-icons/redo.svg');
    this.load.svg('turn', 'assets/game-icons/turn.svg');
    this.load.svg('help', 'assets/game-icons/bar_help.svg');
    this.load.svg('home', 'assets/game-icons/bar_home.svg');
    this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
  }

  create() {
    const { width, height } = this.game.config;
    const boardSize = Math.min(width, height) * 0.75;
    this.gameConfig.tileSize = boardSize / this.gameConfig.numberOfCases;
    this.gameConfig.boardStartX = (width - boardSize) / 2;
    this.gameConfig.boardStartY = (height - boardSize) / 2;

    this.createBackground(width, height);
    this.createBoardFrame();
    this.createBoard();
    this.initLevel();
    this.createTurnIndicator();
    this.createBottomControls(width, height);
    this.setupInputHandling();
  }

  createBackground(width, height) {
    this.background = this.add.image(width / 2, height / 2, 'background-wood');
    const scale = Math.max(width / this.background.width, height / this.background.height);
    this.background.setScale(scale).setDepth(-10);
  }

  createBoardFrame() {
    const { boardStartX, boardStartY, tileSize, numberOfCases } = this.gameConfig;
    const boardWidth = numberOfCases * tileSize;
    this.boardFrame = this.add.rectangle(boardStartX + boardWidth / 2, boardStartY + boardWidth / 2, boardWidth + 20, boardWidth + 20, 0x2E1B0C);
    this.boardFrame.setDepth(-1);
  }

  createBoard() {
    const { boardStartX, boardStartY, tileSize, numberOfCases } = this.gameConfig;
    this.tiles = [];

    for (let row = 0; row < numberOfCases; row++) {
      for (let col = 0; col < numberOfCases; col++) {
        const x = boardStartX + col * tileSize + tileSize / 2;
        const y = boardStartY + row * tileSize + tileSize / 2;

        // Visual fix: GCompris board starts with a Dark square at (0,0)
        const isPlayableTile = (row + col) % 2 === 0;
        const tileKey = isPlayableTile ? 'checkers-black' : 'checkers-white';
        
        const tile = this.add.image(x, y, tileKey);
        tile.setDisplaySize(tileSize, tileSize).setDepth(1);
        tile.boardPos = row * numberOfCases + col;
        tile.isPlayable = isPlayableTile;

        // Enable input only on playable squares
        if (isPlayableTile) {
            tile.setInteractive(); 
        }
        this.tiles.push(tile);
      }
    }
  }

  initLevel() {
    // Draughts engine: 1-50 indexing. Start: White (W) at 31-50, Black (B) at 1-20
    this.state = new Draughts('W:W31-50:B1-20');
    this.state.resetGame();
    this.from = -1;
    this.gameOver = false;
    this.currentPlayer = 'W';
    this.refreshPieces();
  }

  refreshPieces() {
    this.pieces.forEach(piece => piece.destroy());
    this.pieces = [];
    const positions = this.simplifiedState(this.state.position());
    positions.forEach(posData => {
      if (posData.piece !== '0') {
        const piece = this.createPiece(posData.pos, posData.piece);
        this.pieces.push(piece);
      }
    });
  }

  createPiece(boardPos, pieceType) {
    const pos = this.boardPosToPixel(boardPos);
    const piece = this.add.image(pos.x, pos.y, pieceType);
    piece.setDisplaySize(this.gameConfig.tileSize - 12, this.gameConfig.tileSize - 12).setDepth(10);
    piece.boardPos = boardPos;
    piece.pieceType = pieceType;
    piece.setInteractive();
    this.input.setDraggable(piece);
    return piece;
  }

  createTurnIndicator() {
    const { width } = this.game.config;
    this.turnIndicator = this.add.graphics().setDepth(50);
    this.turnIndicator.fillStyle(0x000000, 0.7);
    this.turnIndicator.fillRoundedRect(width / 2 - 140, 13, 280, 45, 8);
    this.turnIndicator.lineStyle(2, 0xFFFFFF, 0.8);
    this.turnIndicator.strokeRoundedRect(width / 2 - 140, 13, 280, 45, 8);

    this.turnText = this.add.text(width / 2, 35, "White's turn", {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial', fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(51);
  }

  updateTurnIndicator() {
    this.turnText.setText(this.currentPlayer === 'W' ? "White's turn" : "Black's turn");
  }

  setupInputHandling() {
    this.input.on('gameobjectdown', (pointer, gameObject) => {
        if (this.gameOver || this.currentPlayer === 'B') return;

        // Click a piece to select it
        if (gameObject.pieceType) {
            const isWhitePiece = gameObject.pieceType.startsWith('w');
            if (isWhitePiece && this.currentPlayer === 'W') {
                this.from = gameObject.boardPos;
                this.selectedPiece = gameObject;
                this.showPossibleMoves();
            }
        } 
        // Click a tile to move selected piece
        else if (gameObject.isPlayable && this.from !== -1) {
            this.handleMoveAttempt(gameObject.boardPos);
        }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      if (this.gameOver || this.currentPlayer === 'B') return;
      if (!gameObject.pieceType || !gameObject.pieceType.startsWith('w')) return;

      this.selectedPiece = gameObject;
      this.from = gameObject.boardPos;
      gameObject.setDepth(100);
      this.showPossibleMoves();
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (this.selectedPiece === gameObject) {
        gameObject.setPosition(dragX, dragY);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      if (this.selectedPiece !== gameObject) return;
      const tile = this.getTileAtPosition(pointer.x, pointer.y);
      if (tile && tile.isPlayable) {
          this.handleMoveAttempt(tile.boardPos);
      } else {
          this.resetPiecePosition(gameObject);
      }
    });
  }

  handleMoveAttempt(to) {
      if (this.makeMove(this.from, to)) {
          this.currentPlayer = 'B';
          this.updateTurnIndicator();
          this.from = -1;
          this.selectedPiece = null;
          this.clearPossibleMoves();
          this.time.delayedCall(1000, () => this.makeAIMove());
      } else {
          if (this.selectedPiece) this.resetPiecePosition(this.selectedPiece);
      }
  }

  showPossibleMoves() {
    this.clearPossibleMoves();
    if (this.from === -1) return;

    const moves = this.state.moves();
    const fromEngine = this.viewPosToEngine(this.from);
    
    // Filter moves for the selected piece
    const validMoves = moves.filter(m => m.from === fromEngine);

    validMoves.forEach(move => {
      const toView = this.engineToViewPos(move.to);
      const pixelPos = this.boardPosToPixel(toView);
      const indicator = this.add.circle(pixelPos.x, pixelPos.y, this.gameConfig.tileSize * 0.25, 0x808080, 0.6);
      indicator.setDepth(5);
      this.moveIndicators.push(indicator);
    });
  }

  clearPossibleMoves() {
    this.moveIndicators.forEach(i => i.destroy());
    this.moveIndicators = [];
  }

  makeMove(from, to) {
    try {
      const move = this.state.move({
        from: this.viewPosToEngine(from),
        to: this.viewPosToEngine(to)
      });
      if (move) {
        this.visibleMove(move, from, to);
        return true;
      }
    } catch (e) { console.warn("Invalid move", e); }
    return false;
  }

  visibleMove(move, from, to) {
    const piece = this.pieces.find(p => p.boardPos === from);
    if (piece) {
      const toPixel = this.boardPosToPixel(to);
      this.tweens.add({
        targets: piece, x: toPixel.x, y: toPixel.y, duration: 300,
        onComplete: () => {
          piece.boardPos = to;
          this.checkPromotion(piece, to);
          piece.setDepth(10);
        }
      });

      // Handle captures
      if (move.takes && move.takes.length > 0) {
        move.takes.forEach(capPos => {
          const capView = this.engineToViewPos(capPos);
          const target = this.pieces.find(p => p.boardPos === capView);
          if (target) {
            this.tweens.add({
              targets: target, scale: 0, alpha: 0, duration: 300,
              onComplete: () => {
                target.destroy();
                this.pieces = this.pieces.filter(p => p !== target);
              }
            });
          }
        });
      }
    }
  }

  makeAIMove() {
    if (this.gameOver) return;
    const moves = this.state.moves();
    if (moves.length === 0) {
        this.gameOver = true;
        this.turnText.setText("White Wins!");
        return;
    }
    const move = moves[Math.floor(Math.random() * moves.length)];
    this.makeMove(this.engineToViewPos(move.from), this.engineToViewPos(move.to));
    this.currentPlayer = 'W';
    this.updateTurnIndicator();
    if (this.state.gameOver()) {
        this.gameOver = true;
        this.turnText.setText("Black Wins!");
    }
  }

  // --- Fixed Coordinate Mapping ---
  // Engine external numbering (1-50):
  //   Row 0 (even): squares 1-5 at cols 1,3,5,7,9 (indented)
  //   Row 1 (odd):  squares 6-10 at cols 0,2,4,6,8 (left edge)
  // Our board has (row+col)%2===0 as playable:
  //   Row 0 (even): playable at cols 0,2,4,6,8
  //   Row 1 (odd):  playable at cols 1,3,5,7,9
  // So we need to account for this offset difference
  viewPosToEngine(pos) {
    const row = Math.floor(pos / 10);
    const col = pos % 10;
    // For even rows: our cols 0,2,4,6,8 map to engine's "indented" squares
    // For odd rows: our cols 1,3,5,7,9 map to engine's "left edge" squares
    // The engine numbers squares left-to-right within each row
    const colIndex = Math.floor(col / 2); // 0-4 within the row
    const engineIndex = row * 5 + colIndex + 1;
    return engineIndex;
  }

  engineToViewPos(pos) {
    const row = Math.floor((pos - 1) / 5);
    const colIndex = (pos - 1) % 5; // 0-4 within the row
    // Engine even rows are indented (cols 1,3,5,7,9), but our even rows have cols 0,2,4,6,8
    // Engine odd rows start at left (cols 0,2,4,6,8), but our odd rows have cols 1,3,5,7,9
    // So we need: even rows -> cols 0,2,4,6,8, odd rows -> cols 1,3,5,7,9
    const col = colIndex * 2 + (row % 2);
    return row * 10 + col;
  }

  boardPosToPixel(boardPos) {
    const { boardStartX, boardStartY, tileSize } = this.gameConfig;
    return {
      x: boardStartX + (boardPos % 10) * tileSize + tileSize / 2,
      y: boardStartY + Math.floor(boardPos / 10) * tileSize + tileSize / 2
    };
  }

  // --- Boilerplate UI ---
  simplifiedState(position) {
    const res = [];
    const str = position.substring(1);
    for (let i = 0; i < str.length; i++) {
        const p = str[i];
        if (p !== '0') {
            let type = p === 'W' ? 'wk' : p === 'B' ? 'bk' : p;
            res.push({ pos: this.engineToViewPos(i + 1), piece: type });
        }
    }
    return res;
  }

  resetPiecePosition(piece) {
      const pos = this.boardPosToPixel(this.from);
      this.tweens.add({
          targets: piece, x: pos.x, y: pos.y, duration: 200,
          onComplete: () => piece.setDepth(10)
      });
  }

  getTileAtPosition(x, y) {
    return this.tiles.find(tile => tile.getBounds().contains(x, y));
  }

  checkPromotion(piece, to) {
    const isWhite = piece.pieceType.startsWith('w');
    // White promotes when reaching top row (0-9), Black at bottom row (90-99)
    if ((isWhite && to < 10) || (!isWhite && to >= 90)) {
        const newKey = isWhite ? 'wk' : 'bk';
        piece.pieceType = newKey;
        piece.setTexture(newKey);
    }
  }

  createBottomControls(width, height) {
    this.navContainer = this.add.container(0, 0).setDepth(200);
    const btnSize = 70;
    const spacing = 10;
    let x = 20;
    const y = height - btnSize / 2 - 15;

    // Brown menu button (hamburger)
    this.createNavButton(x + btnSize / 2, y, btnSize, 0x8B4513, '☰', 'menu');
    x += btnSize + spacing;

    // Green help button
    this.createNavButton(x + btnSize / 2, y, btnSize, 0x2ECC71, '?', 'help');
    x += btnSize + spacing;

    // Cyan home button
    this.createNavButton(x + btnSize / 2, y, btnSize, 0x17A2B8, '⌂', 'home');
    x += btnSize + spacing;

    // Orange left arrow (prev level)
    this.createNavButton(x + btnSize / 2, y, btnSize * 0.7, 0xE67E22, '❮', 'prevLevel');
    x += btnSize * 0.7 + spacing;

    // Level number display
    this.levelText = this.add.text(x + 20, y, '1', {
      fontSize: '36px',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(201);
    this.navContainer.add(this.levelText);
    x += 50;

    // Orange right arrow (next level) 
    this.createNavButton(x + btnSize / 2, y, btnSize * 0.7, 0xE67E22, '❯', 'nextLevel');
    x += btnSize * 0.7 + spacing;

    // Blue undo button
    this.createNavButton(x + btnSize / 2, y, btnSize, 0x3498DB, '↩', 'reload');
  }

  createNavButton(x, y, size, color, symbol, action) {
    const btn = this.add.container(x, y).setDepth(200);

    // Circle background
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(3, 0xFFFFFF, 0.3);
    bg.strokeCircle(0, 0, size / 2);

    // Symbol text
    const text = this.add.text(0, 0, symbol, {
      fontSize: `${size * 0.5}px`,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    btn.add([bg, text]);
    this.navContainer.add(btn);

    // Make interactive
    const hitArea = this.add.circle(x, y, size / 2).setInteractive();
    hitArea.setAlpha(0.001);
    hitArea.on('pointerdown', () => this.handleControlAction(action));
  }

  handleControlAction(action) {
    switch (action) {
      case 'home':
        this.scene.stop('CheckersGame');
        this.app.showGameMenu();
        break;
      case 'reload':
        this.initLevel();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'menu':
        // Menu action - could show settings
        break;
      case 'prevLevel':
        if (this.gameConfig.currentLevel > 1) {
          this.gameConfig.currentLevel--;
          this.updateLevelText();
          this.initLevel();
        }
        break;
      case 'nextLevel':
        if (this.gameConfig.currentLevel < this.gameConfig.numberOfLevel) {
          this.gameConfig.currentLevel++;
          this.updateLevelText();
          this.initLevel();
        }
        break;
    }
  }

  updateLevelText() {
    if (this.levelText) {
      this.levelText.setText(this.gameConfig.currentLevel.toString());
    }
  }

  showHelp() {
    const { width, height } = this.game.config;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setDepth(300)
      .setInteractive();

    // Help panel
    const panel = this.add.graphics().setDepth(301);
    const panelWidth = 500;
    const panelHeight = 300;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;

    panel.fillStyle(0x2E1B0C, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    panel.lineStyle(3, 0x8B4513);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);

    // Title
    const title = this.add.text(width / 2, panelY + 40, 'Checkers (International Draughts)', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(302);

    // Instructions
    const instructions = this.add.text(width / 2, panelY + 130, 
      'Play checkers against the computer.\n\n' +
      'Click or drag your white pieces to move.\n' +
      'Capture opponent pieces by jumping over them.\n' +
      'Reach the opposite end to promote to a King!',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#CCCCCC',
        align: 'center',
        lineSpacing: 8
      }
    ).setOrigin(0.5).setDepth(302);

    // Close button
    const closeBtn = this.add.text(width / 2, panelY + panelHeight - 40, 'Got it!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#2ECC71',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setDepth(302).setInteractive();

    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      instructions.destroy();
      closeBtn.destroy();
    });
  }
}
