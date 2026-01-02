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
    this.redo_stack = [];
    this.pieces = [];
    this.tiles = [];
    this.selectedPiece = null;
    this.moveIndicators = [];
    this.bottomControls = [];
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
        const isPlayable = (row + col) % 2 === 1;
        if (isPlayable) {
          const tile = this.add.image(x, y, 'checkers-black');
          tile.setDisplaySize(tileSize, tileSize).setDepth(1);
          tile.boardPos = row * numberOfCases + col;
          tile.setInteractive(); // Make tiles clickable for destination selection
          this.tiles.push(tile);
        }
      }
    }
  }

  initLevel() {
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
    const { boardStartX, boardStartY, tileSize, numberOfCases } = this.gameConfig;
    const row = Math.floor(boardPos / numberOfCases);
    const col = boardPos % numberOfCases;
          const x = boardStartX + col * tileSize + tileSize / 2;
          const y = boardStartY + row * tileSize + tileSize / 2;

    const piece = this.add.image(x, y, pieceType);
    piece.setDisplaySize(tileSize - 12, tileSize - 12).setDepth(10);
    piece.boardPos = boardPos;
    piece.pieceType = pieceType;
    piece.setInteractive();
    this.input.setDraggable(piece);
    return piece;
  }

  createTurnIndicator() {
    const { width } = this.game.config;
    const panelY = 35;
    this.turnIndicator = this.add.graphics().setDepth(50);
    this.turnIndicator.fillStyle(0x000000, 0.7);
    this.turnIndicator.fillRoundedRect(width / 2 - 140, panelY - 22, 280, 45, 8);
    this.turnIndicator.lineStyle(2, 0xFFFFFF, 0.8);
    this.turnIndicator.strokeRoundedRect(width / 2 - 140, panelY - 22, 280, 45, 8);

    this.turnText = this.add.text(width / 2, panelY, "White's turn", {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial', fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(51);
  }

  updateTurnIndicator() {
    this.turnText.setText(this.currentPlayer === 'W' ? "White's turn" : "Black's turn");
  }

  setupInputHandling() {
    // Handling for clicking a tile (for click-to-move)
    this.input.on('gameobjectdown', (pointer, gameObject) => {
        if (this.gameOver || this.currentPlayer === 'B') return;

        // If we clicked a piece
        if (gameObject.pieceType) {
            // Check if it's the correct turn
            const isWhitePiece = gameObject.pieceType.startsWith('w');
            if (isWhitePiece && this.currentPlayer === 'W') {
                this.from = gameObject.boardPos;
                this.selectedPiece = gameObject;
                this.showPossibleMoves();
            }
        }
        // If we clicked a tile while a piece was selected
        else if (gameObject.boardPos !== undefined && this.from !== -1) {
            this.handleMoveAttempt(gameObject.boardPos);
        }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      if (this.gameOver || this.currentPlayer === 'B') return;
      const isWhitePiece = gameObject.pieceType.startsWith('w');
      if (!isWhitePiece) return;

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
      if (tile) {
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

  resetPiecePosition(piece) {
      const pos = this.boardPosToPixel(this.from);
      this.tweens.add({
          targets: piece,
          x: pos.x, y: pos.y,
          duration: 200,
          onComplete: () => piece.setDepth(10)
      });
  }

  getTileAtPosition(x, y) {
    return this.tiles.find(tile => {
      const bounds = tile.getBounds();
      return bounds.contains(x, y);
    });
  }

  showPossibleMoves() {
    this.clearPossibleMoves();
    const moves = this.state.moves();
    const fromEngine = this.viewPosToEngine(this.from);

    // Engine returns all valid moves; filter for the selected piece
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
        targets: piece,
        x: toPixel.x, y: toPixel.y,
        duration: 300,
        onComplete: () => {
          piece.boardPos = to;
          this.checkPromotion(piece, to);
          piece.setDepth(10);
        }
      });

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

  // --- Helpers ---
  boardPosToPixel(boardPos) {
    const { boardStartX, boardStartY, tileSize, numberOfCases } = this.gameConfig;
    return {
      x: boardStartX + (boardPos % numberOfCases) * tileSize + tileSize / 2,
      y: boardStartY + Math.floor(boardPos / numberOfCases) * tileSize + tileSize / 2
    };
  }

  checkPromotion(piece, to) {
    const isWhite = piece.pieceType.startsWith('w');
    if ((isWhite && to < 10) || (!isWhite && to > 89)) {
        const newKey = isWhite ? 'wk' : 'bk';
        piece.pieceType = newKey;
        piece.setTexture(newKey);
    }
  }

  viewPosToEngine(pos) {
    const casesNumber = 100;
    const a = 10 * Math.floor((casesNumber - pos) / 10 + 1);
    let b = (pos % 10 === 0) ? 20 : (casesNumber - pos) % 10;
    let newPos = Math.floor((a - b + 1) / 2 + 0.5);
    return newPos;
  }

  engineToViewPos(pos) {
    return 90 - 10 * Math.floor((2 * pos - 1) / 10) + 2 * ((pos - 1) % 5) + 1 + ((-1 + Math.pow(-1, Math.floor((2 * pos - 1) / 10))) / 2);
  }

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

  handleControlAction(action) {
    if (action === 'home') {
        this.scene.stop('CheckersGame');
        this.app.showGameMenu();
    } else if (action === 'reload') {
        this.initLevel();
    }
  }

  createBottomControls(width, height) {
    const barY = height - 50;
    const buttonWidth = 80;
    const spacing = 95;
    const actions = ['help', 'home', 'undo', 'reload', 'redo'];
    const startX = (width - (actions.length * spacing)) / 2 + spacing / 2;

    actions.forEach((action, i) => {
        const x = startX + i * spacing;
        const btn = this.add.container(x, barY);
        const bg = this.add.graphics();
        bg.fillStyle(0xFFFFFF, 0.9).fillRoundedRect(-40, -30, 80, 60, 8);
        bg.lineStyle(2, 0xCCCCCC).strokeRoundedRect(-40, -30, 80, 60, 8);
        const icon = this.add.image(0, 0, action === 'reload' ? 'reload' : action === 'undo' ? 'undo' : action === 'redo' ? 'redo' : action);
        icon.setDisplaySize(40, 40);
        btn.add([bg, icon]);
        bg.setInteractive(new Phaser.Geom.Rectangle(-40, -30, 80, 60), Phaser.Geom.Rectangle.Contains);
        bg.on('pointerdown', () => {
            if (this.app?.audioManager) this.app.audioManager.playClickSound();
            this.handleControlAction(action);
        });
        btn.setDepth(200);
    });
  }
}
