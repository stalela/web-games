/**
 * ChessGame - Classic chess against the computer
 * 
 * Adapted from GCompris chess activity
 * Uses the p4wn chess engine
 * 
 * Features:
 * - Full chess rules (castling, en passant, promotion)
 * - 5 difficulty levels
 * - Move highlighting
 * - Check/checkmate detection
 */

import { LalelaGame } from '../utils/LalelaGame.js';
import * as ChessEngine from '../utils/ChessEngine.js';

export class ChessGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'ChessGame' });
        this.twoPlayer = false;
    }

    init(data) {
        super.init(data);
        this.level = data?.level || 1;
        this.maxLevel = 5;
    }

    create() {
        // Don't call super.create() - we handle our own lifecycle
        // Just initialize what we need from the base class
        this.gameState = 'ready';
        
        // Initialize performance optimizations if available
        if (typeof this.initializePerformanceOptimizations === 'function') {
            this.initializePerformanceOptimizations();
        }
        
        // Game state
        this.chessState = null;
        this.selectedSquare = -1;
        this.validMoves = [];
        this.gameOver = false;
        this.playerColor = 0; // 0 = white, 1 = black
        this.isThinking = false;
        
        // UI elements
        this.squares = [];
        this.pieces = [];
        this.highlights = [];
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Wood texture background (brown gradient)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x5d4037, 0x6d4c41, 0x4e342e, 0x3e2723, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
        
        // Add subtle wood grain lines
        bg.lineStyle(1, 0x4a3728, 0.3);
        for (let i = 0; i < height; i += 20) {
            bg.lineBetween(0, i + Math.random() * 10, width, i + Math.random() * 10);
        }
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Turn indicator (styled box at top)
        const turnBoxWidth = 160;
        const turnBoxHeight = 40;
        this.turnBox = this.add.graphics();
        this.turnBox.fillStyle(0x3d5a5a, 1);
        this.turnBox.fillRoundedRect(
            width / 2 - turnBoxWidth / 2, 
            15, 
            turnBoxWidth, 
            turnBoxHeight, 
            10
        );
        this.turnBox.lineStyle(2, 0x2d4a4a, 1);
        this.turnBox.strokeRoundedRect(
            width / 2 - turnBoxWidth / 2, 
            15, 
            turnBoxWidth, 
            turnBoxHeight, 
            10
        );
        this.turnBox.setDepth(10);

        // Turn text
        this.turnText = this.add.text(width / 2, 35, "White's turn", {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11);

        // Message text (for check/checkmate) - below turn indicator
        this.messageText = this.add.text(width / 2, 70, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffcc00'
        }).setOrigin(0.5).setDepth(10);

        // Create GCompris-style navigation bar
        this.createNavigationDock();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const buttonSize = 60;
        const padding = 10;
        const y = height - buttonSize / 2 - 15;
        
        // Calculate positions for centered navigation
        const totalWidth = buttonSize * 6 + padding * 5 + 40; // 6 buttons + level text
        let x = (width - totalWidth) / 2 + buttonSize / 2;
        
        // Menu button (gold/yellow - hamburger menu)
        this.createGComprisButton(x, y, 0xc9a227, '☰', () => {
            // Toggle menu
        });
        x += buttonSize + padding;
        
        // Help button (green)
        this.createGComprisButton(x, y, 0x4caf50, '?', () => {
            // Show help
        });
        x += buttonSize + padding;
        
        // Home button (cyan)
        this.createGComprisButton(x, y, 0x26c6da, '⌂', () => {
            this.scene.start('GameMenu');
        });
        x += buttonSize + padding;
        
        // Previous level (orange)
        this.createGComprisButton(x, y, 0xf57c00, '❮', () => {
            if (this.level > 1) {
                this.level--;
                this.restartGame();
            }
        });
        x += buttonSize + padding;
        
        // Level indicator
        this.levelText = this.add.text(x, y, String(this.level), {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        x += 40;
        
        // Next level (white/light)
        this.createGComprisButton(x, y, 0xeeeeee, '❯', () => {
            if (this.level < this.maxLevel) {
                this.level++;
                this.restartGame();
            }
        }, '#333333');
        x += buttonSize + padding;
        
        // Reload/Restart button (cyan)
        this.createGComprisButton(x, y, 0x26c6da, '↻', () => {
            this.restartGame();
        });
        
        // Two player toggle button (right side of board)
        const toggleX = this.boardX + this.boardSize + 50;
        const toggleY = this.boardY + this.boardSize / 2;
        this.createTwoPlayerToggle(toggleX, toggleY);
    }
    
    createGComprisButton(x, y, color, icon, callback, textColor = '#ffffff') {
        const button = this.add.circle(x, y, 28, color)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        
        // Add shadow/border effect
        const shadow = this.add.circle(x, y + 2, 28, 0x000000, 0.3)
            .setDepth(9);
        
        const text = this.add.text(x, y, icon, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: textColor
        }).setOrigin(0.5).setDepth(11);

        button.on('pointerover', () => {
            button.setScale(1.1);
            text.setScale(1.1);
        });
        button.on('pointerout', () => {
            button.setScale(1);
            text.setScale(1);
        });
        button.on('pointerdown', callback);
        
        return { button, text, shadow };
    }
    
    createTwoPlayerToggle(x, y) {
        // Two player toggle box
        const boxWidth = 50;
        const boxHeight = 60;
        
        const box = this.add.graphics();
        box.fillStyle(0xf5f5f5, 1);
        box.fillRoundedRect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight, 8);
        box.lineStyle(2, 0xcccccc, 1);
        box.strokeRoundedRect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight, 8);
        box.setDepth(10);
        
        // Player icons
        const icon = this.add.text(x, y, '👤👤', {
            fontFamily: 'Arial',
            fontSize: '20px'
        }).setOrigin(0.5).setDepth(11);
        
        // Make it interactive
        const hitArea = this.add.rectangle(x, y, boxWidth, boxHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(12);
        
        hitArea.on('pointerdown', () => {
            // Switch to two player mode
            this.scene.start('ChessTwoPlayerGame');
        });
    }

    createNavButton(x, y, icon, callback) {
        const button = this.add.circle(x, y, 20, 0x333333)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        
        const text = this.add.text(x, y, icon, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11);

        button.on('pointerover', () => button.setFillStyle(0x555555));
        button.on('pointerout', () => button.setFillStyle(0x333333));
        button.on('pointerdown', callback);
    }

    setupGameLogic() {
        this.createBoard();
        this.startNewGame();
    }

    createBoard() {
        const { width, height } = this.scale;
        
        // Calculate board size and position
        const maxSize = Math.min(width - 40, height - 160);
        this.squareSize = Math.floor(maxSize / 8);
        this.boardSize = this.squareSize * 8;
        this.boardX = (width - this.boardSize) / 2;
        this.boardY = (height - this.boardSize) / 2;

        // Create board container
        this.boardContainer = this.add.container(this.boardX, this.boardY);

        // Create squares
        const lightColor = 0xf0d9b5;
        const darkColor = 0xb58863;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * this.squareSize;
                const y = row * this.squareSize;
                const isLight = (row + col) % 2 === 0;
                
                const square = this.add.rectangle(
                    x + this.squareSize / 2,
                    y + this.squareSize / 2,
                    this.squareSize,
                    this.squareSize,
                    isLight ? lightColor : darkColor
                );
                
                const index = row * 8 + col;
                square.setData('index', index);
                square.setData('baseColor', isLight ? lightColor : darkColor);
                square.setInteractive({ useHandCursor: true });
                
                square.on('pointerdown', () => this.onSquareClick(index));
                
                this.boardContainer.add(square);
                this.squares.push(square);
            }
        }

        // Create highlight layer
        for (let i = 0; i < 64; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const x = col * this.squareSize + this.squareSize / 2;
            const y = row * this.squareSize + this.squareSize / 2;
            
            const highlight = this.add.rectangle(
                x, y,
                this.squareSize - 4,
                this.squareSize - 4,
                0x00ff00, 0
            );
            highlight.setStrokeStyle(3, 0x00ff00, 0);
            this.boardContainer.add(highlight);
            this.highlights.push(highlight);
        }

        // Add rank/file labels
        const labelStyle = { fontFamily: 'Arial', fontSize: '14px', color: '#3e2723', fontStyle: 'bold' };
        const files = 'ABCDEFGH';
        
        for (let i = 0; i < 8; i++) {
            // Files (a-h)
            this.add.text(
                this.boardX + i * this.squareSize + this.squareSize / 2,
                this.boardY + this.boardSize + 5,
                files[i], labelStyle
            ).setOrigin(0.5, 0).setDepth(5);
            
            // Ranks (1-8)
            this.add.text(
                this.boardX - 10,
                this.boardY + (7 - i) * this.squareSize + this.squareSize / 2,
                String(i + 1), labelStyle
            ).setOrigin(1, 0.5).setDepth(5);
        }
    }

    startNewGame() {
        this.chessState = ChessEngine.p4_new_game();
        this.gameOver = false;
        this.selectedSquare = -1;
        this.validMoves = [];
        this.isThinking = false;
        
        this.clearHighlights();
        this.renderPieces();
        this.updateTurnIndicator();
    }

    restartGame() {
        // Clear existing pieces and their shadows
        this.pieces.forEach(p => {
            const shadow = p.getData('shadow');
            if (shadow) shadow.destroy();
            p.destroy();
        });
        this.pieces = [];
        
        // Update level text if it exists
        if (this.levelText) {
            this.levelText.setText(String(this.level));
        }
        
        this.startNewGame();
    }

    renderPieces() {
        // Clear existing pieces and their shadows
        this.pieces.forEach(p => {
            const shadow = p.getData('shadow');
            if (shadow) shadow.destroy();
            p.destroy();
        });
        this.pieces = [];

        const board = this.chessState.board;
        
        for (let enginePos = 21; enginePos < 99; enginePos++) {
            const piece = board[enginePos];
            if (piece && piece !== ChessEngine.P4_EDGE) {
                const viewPos = ChessEngine.engineToViewPos(enginePos);
                const pieceChar = ChessEngine.getPieceChar(piece);
                
                if (pieceChar) {
                    this.createPiece(viewPos, pieceChar);
                }
            }
        }
    }

    createPiece(viewPos, pieceType) {
        const row = Math.floor(viewPos / 8);
        const col = viewPos % 8;
        const x = col * this.squareSize + this.squareSize / 2;
        const y = row * this.squareSize + this.squareSize / 2;

        // Use filled chess symbols for better visibility
        const pieceSymbols = {
            'wp': '♙', 'wr': '♖', 'wn': '♘', 'wb': '♗', 'wq': '♕', 'wk': '♔',
            'bp': '♟', 'br': '♜', 'bn': '♞', 'bb': '♝', 'bq': '♛', 'bk': '♚'
        };

        const symbol = pieceSymbols[pieceType];
        const isWhite = pieceType[0] === 'w';
        
        // Create shadow for depth effect
        const shadow = this.add.text(x + 2, y + 2, symbol, {
            fontFamily: 'Arial',
            fontSize: `${this.squareSize * 0.7}px`,
            color: '#000000'
        }).setOrigin(0.5).setAlpha(0.3);
        this.boardContainer.add(shadow);
        
        const piece = this.add.text(x, y, symbol, {
            fontFamily: 'Arial',
            fontSize: `${this.squareSize * 0.7}px`,
            color: isWhite ? '#f5f5f5' : '#37474f',
            stroke: isWhite ? '#424242' : '#263238',
            strokeThickness: 2
        }).setOrigin(0.5);

        piece.setData('viewPos', viewPos);
        piece.setData('type', pieceType);
        piece.setData('shadow', shadow);
        
        this.boardContainer.add(piece);
        this.pieces.push(piece);
        
        return piece;
    }

    onSquareClick(index) {
        if (this.gameOver || this.isThinking) return;
        
        // In single player, only allow moves when it's the player's turn
        if (!this.twoPlayer && this.chessState.to_play !== this.playerColor) return;

        if (this.selectedSquare === -1) {
            // No piece selected - try to select one
            this.trySelectPiece(index);
        } else {
            // Piece already selected
            if (this.validMoves.includes(index)) {
                // Valid move - execute it
                this.executeMove(this.selectedSquare, index);
            } else {
                // Try to select a different piece
                this.clearHighlights();
                this.selectedSquare = -1;
                this.validMoves = [];
                this.trySelectPiece(index);
            }
        }
    }

    trySelectPiece(viewPos) {
        const enginePos = ChessEngine.viewPosToEngine(viewPos);
        const piece = this.chessState.board[enginePos];
        
        if (!piece || piece === ChessEngine.P4_EDGE) return;
        
        const pieceColor = piece & 1;
        if (pieceColor !== this.chessState.to_play) return;

        // Get valid moves for this piece
        ChessEngine.p4_prepare(this.chessState);
        const allMoves = ChessEngine.p4_parse(
            this.chessState,
            this.chessState.to_play,
            this.chessState.enpassant,
            0
        );

        this.validMoves = [];
        
        for (const move of allMoves) {
            if (move[1] === enginePos) {
                // Test if move leaves king in check
                const testMove = ChessEngine.p4_make_move(this.chessState, move[1], move[2], ChessEngine.P4_QUEEN);
                const inCheck = ChessEngine.p4_check_check(this.chessState, pieceColor);
                ChessEngine.p4_unmake_move(this.chessState, testMove);
                
                if (!inCheck) {
                    this.validMoves.push(ChessEngine.engineToViewPos(move[2]));
                }
            }
        }

        if (this.validMoves.length > 0) {
            this.selectedSquare = viewPos;
            this.highlightSquare(viewPos, 0xffff00, 0.4); // Selected piece
            
            for (const targetPos of this.validMoves) {
                this.highlightSquare(targetPos, 0x00ff00, 0.3); // Valid moves
            }
        }
    }

    highlightSquare(viewPos, color, alpha) {
        const highlight = this.highlights[viewPos];
        if (highlight) {
            highlight.setFillStyle(color, alpha);
            highlight.setStrokeStyle(3, color, alpha);
        }
    }

    clearHighlights() {
        for (const highlight of this.highlights) {
            highlight.setFillStyle(0x00ff00, 0);
            highlight.setStrokeStyle(3, 0x00ff00, 0);
        }
    }

    executeMove(fromViewPos, toViewPos) {
        const fromEngine = ChessEngine.viewPosToEngine(fromViewPos);
        const toEngine = ChessEngine.viewPosToEngine(toViewPos);
        
        // Check for pawn promotion
        const piece = this.chessState.board[fromEngine];
        const pieceType = piece & 14;
        const pieceColor = piece & 1;
        const targetRow = pieceColor ? 2 : 9;
        const toRow = Math.floor(toEngine / 10);
        
        let promotion = ChessEngine.P4_QUEEN;
        if (pieceType === ChessEngine.P4_PAWN && toRow === targetRow) {
            // Auto-promote to queen (could add selection dialog)
            promotion = ChessEngine.P4_QUEEN;
        }

        const result = ChessEngine.p4_move(this.chessState, fromEngine, toEngine, promotion);
        
        if (result.ok) {
            this.clearHighlights();
            this.selectedSquare = -1;
            this.validMoves = [];
            
            // Animate the move
            this.animateMove(fromViewPos, toViewPos, result.flags, () => {
                this.renderPieces();
                this.updateTurnIndicator();
                this.checkGameEnd(result.flags);
                
                // Computer's turn
                if (!this.gameOver && !this.twoPlayer && this.chessState.to_play !== this.playerColor) {
                    this.computerMove();
                }
            });
        }
    }

    animateMove(fromPos, toPos, flags, onComplete) {
        // Find the piece at fromPos
        const piece = this.pieces.find(p => p.getData('viewPos') === fromPos);
        if (!piece) {
            onComplete();
            return;
        }

        const fromRow = Math.floor(fromPos / 8);
        const fromCol = fromPos % 8;
        const toRow = Math.floor(toPos / 8);
        const toCol = toPos % 8;
        
        const toX = toCol * this.squareSize + this.squareSize / 2;
        const toY = toRow * this.squareSize + this.squareSize / 2;

        this.tweens.add({
            targets: piece,
            x: toX,
            y: toY,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Handle castling rook animation
                if (flags & ChessEngine.P4_MOVE_FLAG_CASTLE_KING) {
                    this.animateCastleRook(fromPos + 3, fromPos + 1, onComplete);
                } else if (flags & ChessEngine.P4_MOVE_FLAG_CASTLE_QUEEN) {
                    this.animateCastleRook(fromPos - 4, fromPos - 1, onComplete);
                } else {
                    onComplete();
                }
            }
        });
    }

    animateCastleRook(fromPos, toPos, onComplete) {
        const rook = this.pieces.find(p => p.getData('viewPos') === fromPos);
        if (!rook) {
            onComplete();
            return;
        }

        const toCol = toPos % 8;
        const toRow = Math.floor(toPos / 8);
        const toX = toCol * this.squareSize + this.squareSize / 2;
        const toY = toRow * this.squareSize + this.squareSize / 2;

        this.tweens.add({
            targets: rook,
            x: toX,
            y: toY,
            duration: 200,
            ease: 'Power2',
            onComplete: onComplete
        });
    }

    computerMove() {
        this.isThinking = true;
        this.messageText.setText('Thinking...');

        // Delay to show thinking message
        this.time.delayedCall(100, () => {
            // AI depth based on level
            const depth = this.getAIDepth();
            
            // Use a mix of random and optimal moves based on level
            let move;
            if (this.level === 1 && Math.random() < 0.6) {
                // Level 1: Mostly random moves
                move = this.getRandomMove();
            } else if (this.level === 2 && Math.random() < 0.3) {
                // Level 2: Sometimes random
                move = this.getRandomMove();
            } else {
                // Use engine
                move = ChessEngine.p4_findmove(this.chessState, depth);
            }

            if (move && move[0] && move[1]) {
                const fromViewPos = ChessEngine.engineToViewPos(move[0]);
                const toViewPos = ChessEngine.engineToViewPos(move[1]);
                
                const result = ChessEngine.p4_move(this.chessState, move[0], move[1], ChessEngine.P4_QUEEN);
                
                if (result.ok) {
                    this.animateMove(fromViewPos, toViewPos, result.flags, () => {
                        this.renderPieces();
                        this.updateTurnIndicator();
                        this.isThinking = false;
                        this.checkGameEnd(result.flags);
                    });
                } else {
                    this.isThinking = false;
                    this.messageText.setText('');
                }
            } else {
                this.isThinking = false;
                this.messageText.setText('');
            }
        });
    }

    getAIDepth() {
        switch (this.level) {
            case 1: return 1;
            case 2: return 2;
            case 3: return 2;
            case 4: return 3;
            case 5: return 3;
            default: return 2;
        }
    }

    getRandomMove() {
        ChessEngine.p4_prepare(this.chessState);
        const moves = ChessEngine.p4_parse(
            this.chessState,
            this.chessState.to_play,
            this.chessState.enpassant,
            0
        );

        // Filter out moves that leave king in check
        const validMoves = moves.filter(move => {
            const testMove = ChessEngine.p4_make_move(this.chessState, move[1], move[2], ChessEngine.P4_QUEEN);
            const inCheck = ChessEngine.p4_check_check(this.chessState, this.chessState.to_play);
            ChessEngine.p4_unmake_move(this.chessState, testMove);
            return !inCheck;
        });

        if (validMoves.length === 0) return null;
        
        const idx = Math.floor(Math.random() * validMoves.length);
        return [validMoves[idx][1], validMoves[idx][2]];
    }

    updateTurnIndicator() {
        const isWhiteTurn = this.chessState.to_play === 0;
        this.turnText.setText(isWhiteTurn ? "White's turn" : "Black's turn");
        
        // Check for check
        if (ChessEngine.p4_check_check(this.chessState, this.chessState.to_play)) {
            this.messageText.setText('Check!');
            this.messageText.setColor('#ff4444');
        } else {
            this.messageText.setText('');
        }
    }

    checkGameEnd(flags) {
        if (flags & ChessEngine.P4_MOVE_FLAG_MATE) {
            this.gameOver = true;
            
            if (flags & ChessEngine.P4_MOVE_FLAG_CHECK) {
                // Checkmate
                const winner = this.chessState.to_play === 0 ? 'Black' : 'White';
                this.messageText.setText(`Checkmate! ${winner} wins!`);
                this.messageText.setColor('#00ff00');
                
                // Level progression for single player
                if (!this.twoPlayer) {
                    if ((this.playerColor === 0 && winner === 'White') ||
                        (this.playerColor === 1 && winner === 'Black')) {
                        // Player won
                        this.time.delayedCall(1500, () => this.handleWin());
                    } else {
                        // Player lost
                        this.time.delayedCall(1500, () => this.handleLoss());
                    }
                }
            } else {
                // Stalemate
                this.messageText.setText('Stalemate! Draw!');
                this.messageText.setColor('#ffff00');
            }
        } else if (flags & ChessEngine.P4_MOVE_FLAG_DRAW) {
            this.gameOver = true;
            this.messageText.setText('Draw!');
            this.messageText.setColor('#ffff00');
        }
    }

    handleWin() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.showLevelUpMessage();
        } else {
            this.showVictoryMessage();
        }
    }

    handleLoss() {
        this.showRetryMessage();
    }

    showLevelUpMessage() {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(20);
        
        const message = this.add.text(width / 2, height / 2 - 30, 'Level Complete!', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#00ff00'
        }).setOrigin(0.5).setDepth(21);

        const nextBtn = this.add.text(width / 2, height / 2 + 30, 'Next Level →', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0062FF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });

        nextBtn.on('pointerdown', () => {
            overlay.destroy();
            message.destroy();
            nextBtn.destroy();
            this.levelText.setText(`Level ${this.level}`);
            this.restartGame();
        });
    }

    showVictoryMessage() {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(20);
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 You are a Chess Master! 🏆', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#ffd700'
        }).setOrigin(0.5).setDepth(21);

        const menuBtn = this.add.text(width / 2, height / 2 + 30, 'Back to Menu', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerdown', () => {
            this.scene.start('GameMenu');
        });
    }

    showRetryMessage() {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(20);
        
        const message = this.add.text(width / 2, height / 2 - 30, 'You Lost!', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#ff4444'
        }).setOrigin(0.5).setDepth(21);

        const retryBtn = this.add.text(width / 2, height / 2 + 30, 'Try Again', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0062FF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerdown', () => {
            overlay.destroy();
            message.destroy();
            retryBtn.destroy();
            this.restartGame();
        });
    }
}
