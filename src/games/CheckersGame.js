import Phaser from 'phaser';
import Draughts from '../utils/engine.js';

export class CheckersGame extends Phaser.Scene {
  constructor() {
    super({ key: 'CheckersGame' });

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
  // Matches GCompris pattern for 10x10 with (0,0) as playable
  viewPosToEngine(pos) {
    const row = Math.floor(pos / 10);
    const col = pos % 10;
    const engineIndex = row * 5 + Math.floor(col / 2) + 1;
    // Flip so White (engine 31-50) is at visual Top
    return 51 - engineIndex;
  }

  engineToViewPos(pos) {
    const flipped = 51 - pos;
    const row = Math.floor((flipped - 1) / 5);
    const col = ((flipped - 1) % 5) * 2 + (row % 2);
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
    if ((isWhite && to < 10) || (!isWhite && to > 89)) {
        const newKey = isWhite ? 'wk' : 'bk';
        piece.pieceType = newKey;
        piece.setTexture(newKey);
    }
  }

  createBottomControls(width, height) {
    const barY = height - 50;
    const spacing = 95;
    const actions = ['help', 'home', 'undo', 'reload', 'redo'];
    const startX = (width - (actions.length * spacing)) / 2 + spacing / 2;

    actions.forEach((action, i) => {
        const x = startX + i * spacing;
        const btn = this.add.container(x, barY).setDepth(200);
        const bg = this.add.graphics();
        bg.fillStyle(0xFFFFFF, 0.9).fillRoundedRect(-40, -30, 80, 60, 8);
        bg.lineStyle(2, 0xCCCCCC).strokeRoundedRect(-40, -30, 80, 60, 8);
        const icon = this.add.image(0, 0, action === 'reload' ? 'reload' : action === 'undo' ? 'undo' : action === 'redo' ? 'redo' : action);
        icon.setDisplaySize(40, 40);
        btn.add([bg, icon]);
        bg.setInteractive(new Phaser.Geom.Rectangle(-40, -30, 80, 60), Phaser.Geom.Rectangle.Contains);
        bg.on('pointerdown', () => this.handleControlAction(action));
    });
  }

  handleControlAction(action) {
    if (action === 'home') {
        this.scene.stop('CheckersGame');
        this.app.showGameMenu();
    } else if (action === 'reload') {
        this.initLevel();
    }
  }
}
