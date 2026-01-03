/**
 * TicTacToeGame - Tic Tac Toe (against Tux/Computer)
 * 
 * Converted from GCompris tic_tac_toe activity.
 * Original authors: Pulkit Gupta
 * 
 * Game description:
 * - Classic 3x3 Tic-Tac-Toe game
 * - Player vs Computer (Tux)
 * - Multiple difficulty levels with smarter AI
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class TicTacToeGame extends LalelaGame {
    constructor(config = { key: 'TicTacToeGame' }) {
        super(config);
        this.twoPlayer = false; // Can be overridden by subclass
    }
    
    init(data) {
        super.init(data);
        
        this.rows = 3;
        this.cols = 3;
        this.board = []; // 0 = empty, 1 = player 1 (X), 2 = player 2/computer (O)
        this.currentPlayer = 1;
        this.gameOver = false;
        this.playerGoesFirst = true;
        
        this.currentLevel = 0;
        this.maxLevels = 5;
        
        this.cells = [];
        this.winningLine = null;
    }
    
    preload() {
        super.preload();
    }
    
    createBackground() {
        const { width, height } = this.scale;
        
        // Gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xE8F5E9, 0xE8F5E9, 0xA5D6A7, 0xA5D6A7, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
    }
    
    createUI() {
        const { width, height } = this.scale;
        
        // Title
        const title = this.twoPlayer ? 'Tic Tac Toe (2 Players)' : 'Tic Tac Toe vs Computer';
        this.titleText = this.add.text(width / 2, 25, title, {
            fontSize: '26px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#2E7D32',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);
        
        // Level display (only for vs computer)
        if (!this.twoPlayer) {
            this.levelText = this.add.text(width / 2, 55, `Level: 1/${this.maxLevels}`, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#388E3C'
            }).setOrigin(0.5).setDepth(10);
        }
        
        // Turn indicator
        this.turnText = this.add.text(width / 2, height - 120, 'Your turn (X)', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#1565C0'
        }).setOrigin(0.5).setDepth(10);
        
        // Create game board
        this.createBoard();
        
        // Player indicators
        this.createPlayerIndicators();
        
        // Play again / Switch first player buttons
        this.createControlButtons();
        
        // Navigation dock
        this.createNavigationDock();
    }
    
    createBoard() {
        const { width, height } = this.scale;
        
        const boardSize = Math.min(width - 100, height - 250, 350);
        const cellSize = boardSize / 3;
        const startX = width / 2 - boardSize / 2;
        const startY = height / 2 - boardSize / 2 - 20;
        
        this.boardStartX = startX;
        this.boardStartY = startY;
        this.cellSize = cellSize;
        
        // Board background
        const boardBg = this.add.graphics();
        boardBg.fillStyle(0xFFFFFF, 1);
        boardBg.fillRoundedRect(startX - 10, startY - 10, boardSize + 20, boardSize + 20, 15);
        boardBg.lineStyle(4, 0x2E7D32, 1);
        boardBg.strokeRoundedRect(startX - 10, startY - 10, boardSize + 20, boardSize + 20, 15);
        boardBg.setDepth(0);
        
        // Grid lines
        const gridLines = this.add.graphics();
        gridLines.lineStyle(4, 0x4CAF50, 1);
        
        // Vertical lines
        gridLines.moveTo(startX + cellSize, startY);
        gridLines.lineTo(startX + cellSize, startY + boardSize);
        gridLines.moveTo(startX + cellSize * 2, startY);
        gridLines.lineTo(startX + cellSize * 2, startY + boardSize);
        
        // Horizontal lines
        gridLines.moveTo(startX, startY + cellSize);
        gridLines.lineTo(startX + boardSize, startY + cellSize);
        gridLines.moveTo(startX, startY + cellSize * 2);
        gridLines.lineTo(startX + boardSize, startY + cellSize * 2);
        
        gridLines.strokePath();
        gridLines.setDepth(1);
        
        // Create cells
        this.cells = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = startX + col * cellSize + cellSize / 2;
                const y = startY + row * cellSize + cellSize / 2;
                
                const cell = this.add.container(x, y);
                cell.setDepth(2);
                
                // Hit area
                const hitArea = this.add.rectangle(0, 0, cellSize - 10, cellSize - 10, 0x000000, 0);
                hitArea.setInteractive({ useHandCursor: true });
                cell.add(hitArea);
                
                const index = row * 3 + col;
                hitArea.on('pointerdown', () => this.onCellClick(index));
                hitArea.on('pointerover', () => this.onCellHover(index, true));
                hitArea.on('pointerout', () => this.onCellHover(index, false));
                
                this.cells.push({
                    container: cell,
                    hitArea: hitArea,
                    mark: null,
                    row: row,
                    col: col
                });
            }
        }
    }
    
    createPlayerIndicators() {
        const { width, height } = this.scale;
        
        // Player 1 (X) indicator - left side
        this.player1Container = this.add.container(80, height / 2 - 20);
        this.player1Container.setDepth(10);
        
        const p1Bg = this.add.graphics();
        p1Bg.fillStyle(0x1565C0, 1);
        p1Bg.fillRoundedRect(-50, -50, 100, 100, 10);
        this.player1Container.add(p1Bg);
        
        const p1Label = this.add.text(0, -70, this.twoPlayer ? 'Player 1' : 'You', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#1565C0'
        }).setOrigin(0.5);
        this.player1Container.add(p1Label);
        
        const p1X = this.createXMark(0, 0, 35, 0xFFFFFF);
        this.player1Container.add(p1X);
        
        // Player 2 (O) indicator - right side
        this.player2Container = this.add.container(width - 80, height / 2 - 20);
        this.player2Container.add(this.createPlayerIndicatorBg(0xF44336));
        
        const p2Label = this.add.text(0, -70, this.twoPlayer ? 'Player 2' : 'Computer', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#F44336'
        }).setOrigin(0.5);
        this.player2Container.add(p2Label);
        
        const p2O = this.createOMark(0, 0, 30, 0xFFFFFF);
        this.player2Container.add(p2O);
        this.player2Container.setDepth(10);
    }
    
    createPlayerIndicatorBg(color) {
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-50, -50, 100, 100, 10);
        return bg;
    }
    
    createXMark(x, y, size, color) {
        const container = this.add.container(x, y);
        
        const line1 = this.add.graphics();
        line1.lineStyle(8, color, 1);
        line1.moveTo(-size, -size);
        line1.lineTo(size, size);
        line1.strokePath();
        container.add(line1);
        
        const line2 = this.add.graphics();
        line2.lineStyle(8, color, 1);
        line2.moveTo(size, -size);
        line2.lineTo(-size, size);
        line2.strokePath();
        container.add(line2);
        
        return container;
    }
    
    createOMark(x, y, radius, color) {
        const circle = this.add.graphics();
        circle.lineStyle(8, color, 1);
        circle.strokeCircle(x, y, radius);
        return circle;
    }
    
    createControlButtons() {
        const { width, height } = this.scale;
        
        // Play Again button
        this.playAgainBtn = this.add.text(width / 2 - 80, height - 75, '🔄 Play Again', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setDepth(10);
        this.playAgainBtn.setInteractive({ useHandCursor: true });
        this.playAgainBtn.on('pointerdown', () => this.resetGame());
        
        // Switch first player button (only for vs computer)
        if (!this.twoPlayer) {
            this.switchBtn = this.add.text(width / 2 + 80, height - 75, '🔀 Switch First', {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                backgroundColor: '#2196F3',
                padding: { x: 12, y: 8 }
            }).setOrigin(0.5).setDepth(10);
            this.switchBtn.setInteractive({ useHandCursor: true });
            this.switchBtn.on('pointerdown', () => this.switchFirstPlayer());
        }
    }
    
    createNavigationDock() {
        const { width, height } = this.scale;
        const dockY = height - 30;
        const buttonSize = 40;
        const buttons = ['exit', 'help', 'home'];
        const startX = width / 2 - (buttons.length * (buttonSize + 15)) / 2 + buttonSize / 2;
        
        buttons.forEach((btn, i) => {
            const x = startX + i * (buttonSize + 15);
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(0x333333, 0.8);
            buttonBg.fillCircle(x, dockY, buttonSize / 2);
            buttonBg.setDepth(15);
            
            const icons = { exit: '✕', help: '?', home: '⌂' };
            
            const icon = this.add.text(x, dockY, icons[btn], {
                fontSize: '20px',
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
            color: '#2E7D32'
        }).setOrigin(0.5).setDepth(52);
        
        const opponent = this.twoPlayer ? 'your opponent' : 'the computer';
        const helpText = this.add.text(width / 2, modalY + 130, 
            `Take turns placing your mark (X or O).\n\n` +
            `Be the first to get 3 marks in a row\n` +
            `(horizontal, vertical, or diagonal).\n\n` +
            `Block ${opponent} from getting 3 in a row!`, {
            fontSize: '16px',
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
        this.board = Array(9).fill(0);
        this.currentPlayer = 1;
        this.gameOver = false;
        
        // Clear any existing marks
        this.cells.forEach(cell => {
            if (cell.mark) {
                cell.mark.destroy();
                cell.mark = null;
            }
        });
        
        // Clear winning line
        if (this.winningLine) {
            this.winningLine.destroy();
            this.winningLine = null;
        }
        
        this.updateTurnDisplay();
        this.updatePlayerHighlight();
        
        // If computer goes first
        if (!this.twoPlayer && !this.playerGoesFirst) {
            this.time.delayedCall(500, () => this.computerMove());
        }
    }
    
    onCellClick(index) {
        if (this.gameOver) return;
        if (this.board[index] !== 0) return;
        
        // In vs computer mode, only allow clicks on player's turn
        if (!this.twoPlayer) {
            const isPlayerTurn = (this.playerGoesFirst && this.currentPlayer === 1) ||
                                 (!this.playerGoesFirst && this.currentPlayer === 2);
            if (!isPlayerTurn) return;
        }
        
        this.makeMove(index);
    }
    
    onCellHover(index, isOver) {
        if (this.gameOver) return;
        if (this.board[index] !== 0) return;
        
        const cell = this.cells[index];
        if (isOver) {
            cell.hitArea.setFillStyle(0x4CAF50, 0.2);
        } else {
            cell.hitArea.setFillStyle(0x000000, 0);
        }
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        
        // Create mark
        const cell = this.cells[index];
        const markSize = this.cellSize * 0.3;
        
        if (this.currentPlayer === 1) {
            cell.mark = this.createXMark(0, 0, markSize, 0x1565C0);
        } else {
            cell.mark = this.createOMark(0, 0, markSize, 0xF44336);
        }
        cell.container.add(cell.mark);
        
        // Animate mark appearance
        cell.mark.setScale(0);
        this.tweens.add({
            targets: cell.mark,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        // Check for win
        const winner = this.checkWinner();
        if (winner) {
            this.gameOver = true;
            this.showWinner(winner);
            return;
        }
        
        // Check for draw
        if (!this.board.includes(0)) {
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
                this.time.delayedCall(500, () => this.computerMove());
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
        
        // Level 1: Random move
        // Level 2: Try to win
        // Level 3: Try to win, then block
        // Level 4-5: Try to win, block, center, corners strategy
        
        // Try to win (level 2+)
        if (this.currentLevel >= 1) {
            const winMove = this.findWinningMove(computerMark);
            if (winMove !== -1) return winMove;
        }
        
        // Block player from winning (level 3+)
        if (this.currentLevel >= 2) {
            const blockMove = this.findWinningMove(playerMark);
            if (blockMove !== -1) return blockMove;
        }
        
        // Strategic moves (level 4+)
        if (this.currentLevel >= 3) {
            // Take center if available
            if (this.board[4] === 0) return 4;
            
            // Take corners
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(i => this.board[i] === 0);
            if (availableCorners.length > 0) {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
        }
        
        // Random move
        const emptySpots = this.board.map((val, idx) => val === 0 ? idx : -1).filter(idx => idx !== -1);
        if (emptySpots.length > 0) {
            return emptySpots[Math.floor(Math.random() * emptySpots.length)];
        }
        
        return -1;
    }
    
    findWinningMove(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        for (const pattern of winPatterns) {
            const values = pattern.map(i => this.board[i]);
            const playerCount = values.filter(v => v === player).length;
            const emptyCount = values.filter(v => v === 0).length;
            
            if (playerCount === 2 && emptyCount === 1) {
                return pattern.find(i => this.board[i] === 0);
            }
        }
        
        return -1;
    }
    
    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] !== 0 && 
                this.board[a] === this.board[b] && 
                this.board[b] === this.board[c]) {
                this.drawWinningLine(pattern);
                return this.board[a];
            }
        }
        
        return null;
    }
    
    drawWinningLine(pattern) {
        const startCell = this.cells[pattern[0]];
        const endCell = this.cells[pattern[2]];
        
        const startX = startCell.container.x;
        const startY = startCell.container.y;
        const endX = endCell.container.x;
        const endY = endCell.container.y;
        
        this.winningLine = this.add.graphics();
        this.winningLine.lineStyle(8, 0xFFD700, 1);
        this.winningLine.moveTo(startX, startY);
        this.winningLine.lineTo(endX, endY);
        this.winningLine.strokePath();
        this.winningLine.setDepth(3);
    }
    
    updateTurnDisplay() {
        if (this.twoPlayer) {
            const playerName = this.currentPlayer === 1 ? 'Player 1 (X)' : 'Player 2 (O)';
            this.turnText.setText(`${playerName}'s turn`);
        } else {
            if (this.playerGoesFirst) {
                this.turnText.setText(this.currentPlayer === 1 ? 'Your turn (X)' : "Computer's turn (O)");
            } else {
                this.turnText.setText(this.currentPlayer === 2 ? 'Your turn (O)' : "Computer's turn (X)");
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
        this.turnText.setColor(winner === 1 ? '#1565C0' : '#F44336');
        this.turnText.setFontSize('28px');
        
        // If player won vs computer, advance level
        if (!this.twoPlayer) {
            const isPlayerWin = (this.playerGoesFirst && winner === 1) ||
                               (!this.playerGoesFirst && winner === 2);
            if (isPlayerWin && this.currentLevel < this.maxLevels - 1) {
                this.time.delayedCall(1500, () => this.advanceLevel());
            }
        }
    }
    
    showDraw() {
        this.turnText.setText("It's a Draw! 🤝");
        this.turnText.setColor('#FF9800');
        this.turnText.setFontSize('28px');
    }
    
    advanceLevel() {
        this.currentLevel++;
        this.levelText.setText(`Level: ${this.currentLevel + 1}/${this.maxLevels}`);
        
        // Flash level text
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
        this.turnText.setColor('#1565C0');
        this.initBoard();
    }
    
    switchFirstPlayer() {
        this.playerGoesFirst = !this.playerGoesFirst;
        this.resetGame();
    }
}
