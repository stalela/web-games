import { LalelaGame } from '../utils/LalelaGame.js';

export class NineMenMorrisBaseGame extends LalelaGame {
    constructor() {
        super();
        this.boardPoints = [];
        this.pieces = [];
        this.currentPlayer = 1; // 1 or 2
        this.phase = 'PLACE'; // PLACE, MOVE, FLY
        this.piecesLeftToPlace = { 1: 9, 2: 9 };
        this.piecesOnBoard = { 1: 0, 2: 0 };
        this.selectedPiece = null;
        this.isRemovingPiece = false;
        this.twoPlayer = false;
    }

    preload() {
        super.preload();
        this.load.image('nmm_board', 'assets/nine_men_morris/board.svg');
        this.load.image('nmm_white', 'assets/nine_men_morris/white_piece.svg');
        this.load.image('nmm_black', 'assets/nine_men_morris/black_piece.svg');
        this.load.image('nmm_bg', 'assets/morse_code/background.svg'); // Reusing background
    }

    create() {
        super.create();
        this.createBackground();
        this.createBoard();
        this.createUI();
        this.setupGame();
    }

    createBackground() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'nmm_bg')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    createBoard() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const size = Math.min(this.cameras.main.width, this.cameras.main.height) * 0.8;
        
        this.boardImage = this.add.image(cx, cy, 'nmm_board').setDisplaySize(size, size);
        
        // Define points relative to board center and size
        // The SVG likely has a specific layout.
        // I'll use the coordinates from GCompris JS but adapted.
        // GCompris uses 0.05 to 0.95 range.
        
        const pointsData = [
            {x: 0.05, y: 0.95, id: 0}, {x: 0.5, y: 0.95, id: 1}, {x: 0.95, y: 0.95, id: 2},
            {x: 0.2, y: 0.8, id: 3}, {x: 0.5, y: 0.8, id: 4}, {x: 0.8, y: 0.8, id: 5},
            {x: 0.35, y: 0.65, id: 6}, {x: 0.5, y: 0.65, id: 7}, {x: 0.65, y: 0.65, id: 8},
            {x: 0.05, y: 0.5, id: 9}, {x: 0.2, y: 0.5, id: 10}, {x: 0.35, y: 0.5, id: 11},
            {x: 0.65, y: 0.5, id: 12}, {x: 0.8, y: 0.5, id: 13}, {x: 0.95, y: 0.5, id: 14},
            {x: 0.35, y: 0.35, id: 15}, {x: 0.5, y: 0.35, id: 16}, {x: 0.65, y: 0.35, id: 17},
            {x: 0.2, y: 0.2, id: 18}, {x: 0.5, y: 0.2, id: 19}, {x: 0.8, y: 0.2, id: 20},
            {x: 0.05, y: 0.05, id: 21}, {x: 0.5, y: 0.05, id: 22}, {x: 0.95, y: 0.05, id: 23}
        ];
        
        // Adjacency list (neighbors)
        this.neighbors = {
            0: [1, 9], 1: [0, 2, 4], 2: [1, 14],
            3: [4, 10], 4: [3, 5, 1, 7], 5: [4, 13],
            6: [7, 11], 7: [6, 8, 4], 8: [7, 12],
            9: [0, 10, 21], 10: [9, 11, 3, 18], 11: [10, 6, 15],
            12: [8, 13, 17], 13: [12, 14, 5, 20], 14: [13, 2, 23],
            15: [16, 11], 16: [15, 17, 19], 17: [16, 12],
            18: [19, 10], 19: [18, 20, 16, 22], 20: [19, 13],
            21: [22, 9], 22: [21, 23, 19], 23: [22, 14]
        };

        // Mills (triplets)
        this.mills = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [9, 10, 11], [12, 13, 14],
            [15, 16, 17], [18, 19, 20], [21, 22, 23],
            [0, 9, 21], [3, 10, 18], [6, 11, 15],
            [1, 4, 7], [16, 19, 22],
            [8, 12, 17], [5, 13, 20], [2, 14, 23]
        ];

        this.points = [];
        const boardLeft = cx - size / 2;
        const boardTop = cy - size / 2;

        pointsData.forEach(p => {
            const px = boardLeft + p.x * size;
            const py = boardTop + p.y * size;
            
            const point = this.add.circle(px, py, 15, 0x000000, 0)
                .setInteractive();
            point.id = p.id;
            point.occupiedBy = 0; // 0, 1, 2
            point.on('pointerdown', () => this.onPointClick(point));
            this.points[p.id] = point;
        });
    }

    createUI() {
        this.statusText = this.add.text(this.cameras.main.centerX, 50, "Player 1's Turn", {
            fontFamily: 'Fredoka One', fontSize: '32px', color: '#000000'
        }).setOrigin(0.5);
        
        this.p1PiecesText = this.add.text(50, 100, "P1: 9", { fontSize: '24px', color: '#000000' });
        this.p2PiecesText = this.add.text(this.cameras.main.width - 150, 100, "P2: 9", { fontSize: '24px', color: '#000000' });
    }

    setupGame() {
        this.currentPlayer = 1;
        this.phase = 'PLACE';
        this.piecesLeftToPlace = { 1: 9, 2: 9 };
        this.piecesOnBoard = { 1: 0, 2: 0 };
        this.updateStatus();
    }

    onPointClick(point) {
        if (this.isRemovingPiece) {
            this.handleRemovePiece(point);
            return;
        }

        if (this.currentPlayer === 2 && !this.twoPlayer) return; // AI turn

        if (this.phase === 'PLACE') {
            if (point.occupiedBy === 0) {
                this.placePiece(point.id, this.currentPlayer);
            }
        } else if (this.phase === 'MOVE' || this.phase === 'FLY') {
            if (this.selectedPiece) {
                // Try to move selected piece to this point
                if (point.occupiedBy === 0) {
                    if (this.isValidMove(this.selectedPiece.pointId, point.id)) {
                        this.movePiece(this.selectedPiece, point.id);
                    } else {
                        // Invalid move, deselect
                        this.deselectPiece();
                        // If clicked on own piece, select it
                        if (point.occupiedBy === this.currentPlayer) {
                            this.selectPiece(point);
                        }
                    }
                } else if (point.occupiedBy === this.currentPlayer) {
                    // Change selection
                    this.selectPiece(point);
                }
            } else {
                // Select piece
                if (point.occupiedBy === this.currentPlayer) {
                    this.selectPiece(point);
                }
            }
        }
    }

    placePiece(pointId, player) {
        const point = this.points[pointId];
        point.occupiedBy = player;
        
        const piece = this.add.image(point.x, point.y, player === 1 ? 'nmm_white' : 'nmm_black')
            .setDisplaySize(40, 40);
        piece.pointId = pointId;
        piece.player = player;
        this.pieces.push(piece);
        
        this.piecesLeftToPlace[player]--;
        this.piecesOnBoard[player]++;
        
        if (this.checkMill(pointId, player)) {
            this.isRemovingPiece = true;
            this.statusText.setText(`Player ${player} formed a mill! Remove opponent's piece.`);
        } else {
            this.endTurn();
        }
    }

    selectPiece(point) {
        this.deselectPiece();
        this.selectedPiece = this.pieces.find(p => p.pointId === point.id);
        if (this.selectedPiece) {
            this.selectedPiece.setTint(0x00FF00);
        }
    }

    deselectPiece() {
        if (this.selectedPiece) {
            this.selectedPiece.clearTint();
            this.selectedPiece = null;
        }
    }

    isValidMove(fromId, toId) {
        if (this.phase === 'FLY') return true; // Can move anywhere
        // Check adjacency
        return this.neighbors[fromId].includes(toId);
    }

    movePiece(piece, toId) {
        const fromId = piece.pointId;
        this.points[fromId].occupiedBy = 0;
        this.points[toId].occupiedBy = piece.player;
        
        piece.pointId = toId;
        piece.x = this.points[toId].x;
        piece.y = this.points[toId].y;
        
        this.deselectPiece();
        
        if (this.checkMill(toId, piece.player)) {
            this.isRemovingPiece = true;
            this.statusText.setText(`Player ${piece.player} formed a mill! Remove opponent's piece.`);
        } else {
            this.endTurn();
        }
    }

    checkMill(pointId, player) {
        // Check all mills containing this point
        return this.mills.some(mill => {
            if (mill.includes(pointId)) {
                return mill.every(id => this.points[id].occupiedBy === player);
            }
            return false;
        });
    }

    handleRemovePiece(point) {
        if (point.occupiedBy === 0 || point.occupiedBy === this.currentPlayer) return;
        
        // Cannot remove piece in a mill unless all opponent pieces are in mills
        if (this.checkMill(point.id, point.occupiedBy)) {
            if (!this.allOpponentPiecesInMills(point.occupiedBy)) {
                // Show warning: cannot remove piece from mill
                return;
            }
        }
        
        // Remove piece
        const pieceIndex = this.pieces.findIndex(p => p.pointId === point.id);
        if (pieceIndex !== -1) {
            this.pieces[pieceIndex].destroy();
            this.pieces.splice(pieceIndex, 1);
            point.occupiedBy = 0;
            this.piecesOnBoard[point.occupiedBy === 1 ? 2 : 1]--; // Wait, point.occupiedBy is the opponent
            // Wait, if I remove opponent (2), piecesOnBoard[2] decreases.
            // point.occupiedBy IS the opponent (2).
            // So piecesOnBoard[2]--.
            // But I need to know which player it was.
            // point.occupiedBy is correct.
        }
        
        this.isRemovingPiece = false;
        this.endTurn();
    }

    allOpponentPiecesInMills(opponent) {
        const opponentPieces = this.pieces.filter(p => p.player === opponent);
        return opponentPieces.every(p => this.checkMill(p.pointId, opponent));
    }

    endTurn() {
        // Check win/loss
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        
        if (this.piecesLeftToPlace[1] === 0 && this.piecesLeftToPlace[2] === 0) {
            // Moving phase
            if (this.piecesOnBoard[opponent] < 3) {
                this.gameOver(this.currentPlayer);
                return;
            }
            // Check if opponent has moves
            if (!this.hasValidMoves(opponent)) {
                this.gameOver(this.currentPlayer);
                return;
            }
        }

        this.currentPlayer = opponent;
        
        // Update phase
        if (this.piecesLeftToPlace[this.currentPlayer] > 0) {
            this.phase = 'PLACE';
        } else {
            if (this.piecesOnBoard[this.currentPlayer] === 3) {
                this.phase = 'FLY';
            } else {
                this.phase = 'MOVE';
            }
        }
        
        this.updateStatus();
        
        if (this.currentPlayer === 2 && !this.twoPlayer) {
            this.time.delayedCall(500, () => this.computerMove());
        }
    }

    hasValidMoves(player) {
        if (this.piecesOnBoard[player] === 3) return true; // Can fly
        const playerPieces = this.pieces.filter(p => p.player === player);
        return playerPieces.some(p => {
            const neighbors = this.neighbors[p.pointId];
            return neighbors.some(n => this.points[n].occupiedBy === 0);
        });
    }

    updateStatus() {
        this.statusText.setText(`Player ${this.currentPlayer}'s Turn (${this.phase})`);
        this.p1PiecesText.setText(`P1: ${this.piecesLeftToPlace[1]} / ${this.piecesOnBoard[1]}`);
        this.p2PiecesText.setText(`P2: ${this.piecesLeftToPlace[2]} / ${this.piecesOnBoard[2]}`);
    }

    gameOver(winner) {
        this.statusText.setText(`Player ${winner} Wins!`);
        this.sound.play('success');
        this.scene.pause();
    }

    computerMove() {
        // Placeholder for AI
        // Random move for now
        if (this.phase === 'PLACE') {
            const emptyPoints = this.points.filter(p => p.occupiedBy === 0);
            if (emptyPoints.length > 0) {
                const randomPoint = emptyPoints[Math.floor(Math.random() * emptyPoints.length)];
                this.placePiece(randomPoint.id, 2);
            }
        } else {
            // Move
            const myPieces = this.pieces.filter(p => p.player === 2);
            // Try to find a valid move
            let moved = false;
            // Shuffle pieces to try random ones
            this.shuffleArray(myPieces);
            
            for (let piece of myPieces) {
                let possibleMoves = [];
                if (this.phase === 'FLY') {
                    possibleMoves = this.points.filter(p => p.occupiedBy === 0).map(p => p.id);
                } else {
                    possibleMoves = this.neighbors[piece.pointId].filter(id => this.points[id].occupiedBy === 0);
                }
                
                if (possibleMoves.length > 0) {
                    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    this.movePiece(piece, randomMove);
                    moved = true;
                    break;
                }
            }
            
            if (!moved) {
                // Should have lost already if no moves
                console.log("AI has no moves");
            }
        }
        
        // If AI formed a mill, it needs to remove a piece
        if (this.isRemovingPiece) {
            this.time.delayedCall(500, () => this.computerRemovePiece());
        }
    }

    computerRemovePiece() {
        const opponentPieces = this.pieces.filter(p => p.player === 1);
        // Filter out pieces in mills unless all are in mills
        let removable = opponentPieces.filter(p => !this.checkMill(p.pointId, 1));
        if (removable.length === 0) {
            removable = opponentPieces;
        }
        
        if (removable.length > 0) {
            const randomPiece = removable[Math.floor(Math.random() * removable.length)];
            this.handleRemovePiece(this.points[randomPiece.pointId]);
        }
    }
}
