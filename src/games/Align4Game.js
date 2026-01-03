/**
 * Align4Game - Connect Four (against Tux/Computer)
 * 
 * Converted from GCompris align4 activity.
 * Original authors: Bharath M S
 * 
 * Game description:
 * - Classic Connect Four game (7 columns x 6 rows)
 * - Drop tokens into columns to get 4 in a row
 * - Player vs Computer (Tux) with difficulty levels
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class Align4Game extends LalelaGame {
    constructor(config = { key: 'Align4Game' }) {
        super(config);
        this.twoPlayer = false;
    }
    
    init(data) {
        super.init(data);
        
        this.rows = 6;
        this.cols = 7;
        this.board = []; // 0 = empty, 1 = player 1 (red), 2 = player 2/computer (yellow)
        this.currentPlayer = 1;
        this.gameOver = false;
        this.playerGoesFirst = true;
        
        this.currentLevel = 0;
        this.maxLevels = 5;
        
        this.columnButtons = [];
        this.tokens = [];
        this.hoverToken = null;
        this.winningCells = [];
    }
    
    preload() {
        super.preload();
    }
    
    createBackground() {
        const { width, height } = this.scale;
        
        // Sky blue gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xE3F2FD, 0xE3F2FD, 0xBBDEFB, 0xBBDEFB, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
    }
    
    createUI() {
        const { width, height } = this.scale;
        
        // Title
        const title = this.twoPlayer ? 'Connect Four (2 Players)' : 'Connect Four vs Computer';
        this.titleText = this.add.text(width / 2, 25, title, {
            fontSize: '26px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#1565C0',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        
        // Level display (only for vs computer)
        if (!this.twoPlayer) {
            this.levelText = this.add.text(width / 2, 55, `Level: 1/${this.maxLevels}`, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#1976D2'
            }).setOrigin(0.5).setDepth(10);
        }
        
        // Turn indicator
        this.turnText = this.add.text(width / 2, height - 90, 'Your turn (Red)', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#D32F2F'
        }).setOrigin(0.5).setDepth(10);
        
        // Create game board
        this.createBoard();
        
        // Player indicators
        this.createPlayerIndicators();
        
        // Control buttons
        this.createControlButtons();
        
        // Navigation dock
        this.createNavigationDock();
    }
    
    createBoard() {
        const { width, height } = this.scale;
        
        // Calculate board dimensions
        const maxBoardWidth = width - 160;
        const maxBoardHeight = height - 220;
        const cellSize = Math.min(maxBoardWidth / this.cols, maxBoardHeight / this.rows, 60);
        
        const boardWidth = cellSize * this.cols;
        const boardHeight = cellSize * this.rows;
        const startX = width / 2 - boardWidth / 2;
        const startY = height / 2 - boardHeight / 2 + 10;
        
        this.boardStartX = startX;
        this.boardStartY = startY;
        this.cellSize = cellSize;
        
        // Board background (blue frame)
        const boardFrame = this.add.graphics();
        boardFrame.fillStyle(0x1565C0, 1);
        boardFrame.fillRoundedRect(startX - 15, startY - 15, boardWidth + 30, boardHeight + 30, 15);
        boardFrame.setDepth(3);
        
        // Create grid cells (holes)
        this.tokens = [];
        for (let row = 0; row < this.rows; row++) {
            this.tokens[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const x = startX + col * cellSize + cellSize / 2;
                const y = startY + row * cellSize + cellSize / 2;
                
                // Empty hole (white circle)
                const hole = this.add.graphics();
                hole.fillStyle(0xE3F2FD, 1);
                hole.fillCircle(x, y, cellSize / 2 - 4);
                hole.setDepth(4);
                
                this.tokens[row][col] = {
                    x: x,
                    y: y,
                    token: null
                };
            }
        }
        
        // Column click areas (above board)
        this.columnButtons = [];
        for (let col = 0; col < this.cols; col++) {
            const x = startX + col * cellSize + cellSize / 2;
            const y = startY - cellSize / 2 - 10;
            
            const hitArea = this.add.rectangle(x, startY + boardHeight / 2, cellSize - 5, boardHeight + cellSize, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            hitArea.on('pointerdown', () => this.onColumnClick(col));
            hitArea.on('pointerover', () => this.onColumnHover(col, true));
            hitArea.on('pointerout', () => this.onColumnHover(col, false));
            hitArea.setDepth(10);
            
            this.columnButtons.push({
                hitArea: hitArea,
                col: col
            });
        }
        
        // Hover token (shows where piece will drop)
        this.hoverToken = this.add.graphics();
        this.hoverToken.setDepth(2);
        this.hoverToken.setVisible(false);
        this.hoverTokenCol = -1;
    }
    
    createPlayerIndicators() {
        const { width, height } = this.scale;
        
        // Player 1 (Red) indicator
        this.player1Container = this.add.container(60, height / 2);
        this.player1Container.setDepth(10);
        
        const p1Bg = this.add.graphics();
        p1Bg.fillStyle(0xD32F2F, 1);
        p1Bg.fillCircle(0, 0, 35);
        this.player1Container.add(p1Bg);
        
        const p1Label = this.add.text(0, -55, this.twoPlayer ? 'Player 1' : 'You', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#D32F2F'
        }).setOrigin(0.5);
        this.player1Container.add(p1Label);
        
        // Player 2 (Yellow) indicator
        this.player2Container = this.add.container(width - 60, height / 2);
        this.player2Container.setDepth(10);
        
        const p2Bg = this.add.graphics();
        p2Bg.fillStyle(0xFFC107, 1);
        p2Bg.fillCircle(0, 0, 35);
        p2Bg.lineStyle(3, 0xFF8F00, 1);
        p2Bg.strokeCircle(0, 0, 35);
        this.player2Container.add(p2Bg);
        
        const p2Label = this.add.text(0, -55, this.twoPlayer ? 'Player 2' : 'Computer', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#FF8F00'
        }).setOrigin(0.5);
        this.player2Container.add(p2Label);
    }
    
    createControlButtons() {
        const { width, height } = this.scale;
        
        // Play Again button
        this.playAgainBtn = this.add.text(width / 2 - 80, height - 50, '🔄 Play Again', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setDepth(10);
        this.playAgainBtn.setInteractive({ useHandCursor: true });
        this.playAgainBtn.on('pointerdown', () => this.resetGame());
        
        // Switch first player button
        if (!this.twoPlayer) {
            this.switchBtn = this.add.text(width / 2 + 80, height - 50, '🔀 Switch', {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                backgroundColor: '#2196F3',
                padding: { x: 10, y: 6 }
            }).setOrigin(0.5).setDepth(10);
            this.switchBtn.setInteractive({ useHandCursor: true });
            this.switchBtn.on('pointerdown', () => this.switchFirstPlayer());
        }
    }
    
    createNavigationDock() {
        const { width, height } = this.scale;
        const dockY = height - 25;
        const buttonSize = 35;
        const buttons = ['exit', 'help', 'home'];
        const startX = width / 2 - (buttons.length * (buttonSize + 12)) / 2 + buttonSize / 2;
        
        buttons.forEach((btn, i) => {
            const x = startX + i * (buttonSize + 12);
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(0x333333, 0.8);
            buttonBg.fillCircle(x, dockY, buttonSize / 2);
            buttonBg.setDepth(15);
            
            const icons = { exit: '✕', help: '?', home: '⌂' };
            
            const icon = this.add.text(x, dockY, icons[btn], {
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(16);
            
            const hitArea = this.add.circle(x, dockY, buttonSize / 2, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            hitArea.on('pointerdown', () => this.handleNavigation(btn));
        });
    }
    
    handleNavigation(action) {
        if (action === 'exit' || action === 'home') {
            this.scene.start('GameMenu');
        } else if (action === 'help') {
            this.showHelpModal();
        }
    }
    
    showHelpModal() {
        const { width, height } = this.scale;
        
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        overlay.setDepth(50);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        
        const modalWidth = Math.min(450, width - 40);
        const modalHeight = 280;
        const modalX = (width - modalWidth) / 2;
        const modalY = (height - modalHeight) / 2;
        
        const modal = this.add.graphics();
        modal.fillStyle(0xffffff, 1);
        modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 15);
        modal.setDepth(51);
        
        const helpTitle = this.add.text(width / 2, modalY + 30, 'How to Play', {
            fontSize: '26px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#1565C0'
        }).setOrigin(0.5).setDepth(52);
        
        const helpText = this.add.text(width / 2, modalY + 130, 
            `Click a column to drop your token.\n\n` +
            `Be the first to connect 4 tokens in a row!\n\n` +
            `Win horizontally, vertically, or diagonally.`, {
            fontSize: '17px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
            align: 'center'
        }).setOrigin(0.5).setDepth(52);
        
        const closeBtn = this.add.text(width / 2, modalY + modalHeight - 40, 'Got it!', {
            fontSize: '20px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setDepth(52);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            modal.destroy();
            helpTitle.destroy();
            helpText.destroy();
            closeBtn.destroy();
        });
    }
    
    setupGameLogic() {
        this.initBoard();
    }
    
    initBoard() {
        // Initialize empty board
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = Array(this.cols).fill(0);
        }
        
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winningCells = [];
        
        // Clear any existing tokens
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.tokens[row][col].token) {
                    this.tokens[row][col].token.destroy();
                    this.tokens[row][col].token = null;
                }
            }
        }
        
        this.updateTurnDisplay();
        this.updatePlayerHighlight();
        
        // If computer goes first
        if (!this.twoPlayer && !this.playerGoesFirst) {
            this.time.delayedCall(500, () => this.computerMove());
        }
    }
    
    onColumnClick(col) {
        if (this.gameOver) return;
        
        // Check if column is full
        if (this.board[0][col] !== 0) return;
        
        // In vs computer mode, only allow clicks on player's turn
        if (!this.twoPlayer) {
            const isPlayerTurn = (this.playerGoesFirst && this.currentPlayer === 1) ||
                                 (!this.playerGoesFirst && this.currentPlayer === 2);
            if (!isPlayerTurn) return;
        }
        
        this.makeMove(col);
    }
    
    onColumnHover(col, isOver) {
        if (this.gameOver) return;
        if (this.board[0][col] !== 0) return;
        
        if (isOver) {
            // Show hover token
            const x = this.boardStartX + col * this.cellSize + this.cellSize / 2;
            const y = this.boardStartY - this.cellSize / 2 - 15;
            
            this.hoverToken.clear();
            const color = this.currentPlayer === 1 ? 0xD32F2F : 0xFFC107;
            this.hoverToken.fillStyle(color, 0.7);
            this.hoverToken.fillCircle(x, y, this.cellSize / 2 - 6);
            this.hoverToken.setVisible(true);
            this.hoverTokenCol = col;
        } else {
            this.hoverToken.setVisible(false);
            this.hoverTokenCol = -1;
        }
    }
    
    makeMove(col) {
        // Find lowest empty row in column
        let targetRow = -1;
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                targetRow = row;
                break;
            }
        }
        
        if (targetRow === -1) return; // Column full
        
        this.board[targetRow][col] = this.currentPlayer;
        
        // Hide hover token
        this.hoverToken.setVisible(false);
        
        // Create and drop token
        const tokenData = this.tokens[targetRow][col];
        const color = this.currentPlayer === 1 ? 0xD32F2F : 0xFFC107;
        const strokeColor = this.currentPlayer === 1 ? 0xB71C1C : 0xFF8F00;
        
        const token = this.add.graphics();
        token.fillStyle(color, 1);
        token.fillCircle(0, 0, this.cellSize / 2 - 6);
        token.lineStyle(3, strokeColor, 1);
        token.strokeCircle(0, 0, this.cellSize / 2 - 6);
        token.setPosition(tokenData.x, this.boardStartY - this.cellSize);
        token.setDepth(5);
        
        tokenData.token = token;
        
        // Animate drop
        this.tweens.add({
            targets: token,
            y: tokenData.y,
            duration: 300 + targetRow * 50,
            ease: 'Bounce.easeOut',
            onComplete: () => this.afterMove(targetRow, col)
        });
    }
    
    afterMove(row, col) {
        // Check for win
        const winner = this.checkWinner(row, col);
        if (winner) {
            this.gameOver = true;
            this.highlightWinningTokens();
            this.showWinner(winner);
            return;
        }
        
        // Check for draw
        let isDraw = true;
        for (let c = 0; c < this.cols; c++) {
            if (this.board[0][c] === 0) {
                isDraw = false;
                break;
            }
        }
        if (isDraw) {
            this.gameOver = true;
            this.showDraw();
            return;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateTurnDisplay();
        this.updatePlayerHighlight();
        
        // Computer's turn
        if (!this.twoPlayer && !this.gameOver) {
            const isComputerTurn = (this.playerGoesFirst && this.currentPlayer === 2) ||
                                   (!this.playerGoesFirst && this.currentPlayer === 1);
            if (isComputerTurn) {
                this.time.delayedCall(400, () => this.computerMove());
            }
        }
    }
    
    computerMove() {
        if (this.gameOver) return;
        
        const move = this.getAIMove();
        if (move !== -1) {
            this.makeMove(move);
        }
    }
    
    getAIMove() {
        const computerMark = this.playerGoesFirst ? 2 : 1;
        const playerMark = this.playerGoesFirst ? 1 : 2;
        
        // Get available columns
        const availableCols = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.board[0][col] === 0) {
                availableCols.push(col);
            }
        }
        
        if (availableCols.length === 0) return -1;
        
        // Try to win (level 2+)
        if (this.currentLevel >= 1) {
            const winMove = this.findWinningMove(computerMark);
            if (winMove !== -1) return winMove;
        }
        
        // Block player (level 3+)
        if (this.currentLevel >= 2) {
            const blockMove = this.findWinningMove(playerMark);
            if (blockMove !== -1) return blockMove;
        }
        
        // Strategic play (level 4+)
        if (this.currentLevel >= 3) {
            // Prefer center columns
            const centerPreference = [3, 2, 4, 1, 5, 0, 6];
            for (const col of centerPreference) {
                if (availableCols.includes(col)) {
                    // Check if this move sets up opponent to win
                    if (this.currentLevel >= 4) {
                        if (!this.wouldSetupOpponentWin(col, computerMark)) {
                            return col;
                        }
                    } else {
                        return col;
                    }
                }
            }
        }
        
        // Random move
        return availableCols[Math.floor(Math.random() * availableCols.length)];
    }
    
    findWinningMove(player) {
        for (let col = 0; col < this.cols; col++) {
            // Find where token would land
            let row = -1;
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.board[r][col] === 0) {
                    row = r;
                    break;
                }
            }
            
            if (row === -1) continue;
            
            // Temporarily place token
            this.board[row][col] = player;
            
            // Check if this wins
            if (this.checkWinner(row, col)) {
                this.board[row][col] = 0;
                return col;
            }
            
            this.board[row][col] = 0;
        }
        
        return -1;
    }
    
    wouldSetupOpponentWin(col, player) {
        // Find where token would land
        let row = -1;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r][col] === 0) {
                row = r;
                break;
            }
        }
        
        if (row === -1 || row === 0) return false;
        
        // Temporarily place token
        this.board[row][col] = player;
        
        // Check if opponent could win by playing on top
        const opponent = player === 1 ? 2 : 1;
        this.board[row - 1][col] = opponent;
        const opponentWins = this.checkWinner(row - 1, col);
        
        this.board[row][col] = 0;
        this.board[row - 1][col] = 0;
        
        return opponentWins;
    }
    
    checkWinner(row, col) {
        const player = this.board[row][col];
        if (player === 0) return null;
        
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]], // Diagonal \
            [[1, -1], [-1, 1]]  // Diagonal /
        ];
        
        for (const [dir1, dir2] of directions) {
            const cells = [[row, col]];
            
            // Count in first direction
            let r = row + dir1[0];
            let c = col + dir1[1];
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                cells.push([r, c]);
                r += dir1[0];
                c += dir1[1];
            }
            
            // Count in opposite direction
            r = row + dir2[0];
            c = col + dir2[1];
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                cells.push([r, c]);
                r += dir2[0];
                c += dir2[1];
            }
            
            if (cells.length >= 4) {
                this.winningCells = cells;
                return player;
            }
        }
        
        return null;
    }
    
    highlightWinningTokens() {
        for (const [row, col] of this.winningCells) {
            const tokenData = this.tokens[row][col];
            if (tokenData.token) {
                // Add glow effect
                this.tweens.add({
                    targets: tokenData.token,
                    scale: 1.15,
                    duration: 300,
                    yoyo: true,
                    repeat: 2
                });
            }
        }
    }
    
    updateTurnDisplay() {
        if (this.twoPlayer) {
            const playerName = this.currentPlayer === 1 ? 'Player 1 (Red)' : 'Player 2 (Yellow)';
            this.turnText.setText(`${playerName}'s turn`);
            this.turnText.setColor(this.currentPlayer === 1 ? '#D32F2F' : '#FF8F00');
        } else {
            if (this.playerGoesFirst) {
                const text = this.currentPlayer === 1 ? 'Your turn (Red)' : "Computer's turn (Yellow)";
                this.turnText.setText(text);
                this.turnText.setColor(this.currentPlayer === 1 ? '#D32F2F' : '#FF8F00');
            } else {
                const text = this.currentPlayer === 2 ? 'Your turn (Yellow)' : "Computer's turn (Red)";
                this.turnText.setText(text);
                this.turnText.setColor(this.currentPlayer === 2 ? '#FF8F00' : '#D32F2F');
            }
        }
    }
    
    updatePlayerHighlight() {
        const p1Active = this.currentPlayer === 1;
        this.player1Container.setAlpha(p1Active ? 1 : 0.5);
        this.player2Container.setAlpha(p1Active ? 0.5 : 1);
    }
    
    showWinner(winner) {
        const { width, height } = this.scale;
        
        let message;
        if (this.twoPlayer) {
            message = winner === 1 ? 'Player 1 Wins! 🎉' : 'Player 2 Wins! 🎉';
        } else {
            const isPlayerWin = (this.playerGoesFirst && winner === 1) ||
                               (!this.playerGoesFirst && winner === 2);
            message = isPlayerWin ? 'You Win! 🎉' : 'Computer Wins!';
        }
        
        this.turnText.setText(message);
        this.turnText.setFontSize('26px');
        
        // Advance level if player won
        if (!this.twoPlayer) {
            const isPlayerWin = (this.playerGoesFirst && winner === 1) ||
                               (!this.playerGoesFirst && winner === 2);
            if (isPlayerWin && this.currentLevel < this.maxLevels - 1) {
                this.time.delayedCall(2000, () => this.advanceLevel());
            }
        }
    }
    
    showDraw() {
        this.turnText.setText("It's a Draw! 🤝");
        this.turnText.setColor('#FF9800');
        this.turnText.setFontSize('26px');
    }
    
    advanceLevel() {
        this.currentLevel++;
        this.levelText.setText(`Level: ${this.currentLevel + 1}/${this.maxLevels}`);
        
        this.tweens.add({
            targets: this.levelText,
            scale: 1.3,
            duration: 200,
            yoyo: true
        });
        
        this.resetGame();
    }
    
    resetGame() {
        this.turnText.setFontSize('22px');
        this.initBoard();
    }
    
    switchFirstPlayer() {
        this.playerGoesFirst = !this.playerGoesFirst;
        this.resetGame();
    }
}
