import { ChessGame } from './ChessGame.js';
import * as ChessEngine from '../utils/ChessEngine.js';

export class ChessPartyEndGame extends ChessGame {
    constructor() {
        super({ key: 'ChessPartyEndGame' });
        this.currentLevel = 0;
        this.levels = [
            { name: "Level 1", fen: "4k3/8/8/8/8/8/8/K4QQ1 w - - 0 1", instruction: "Checkmate the black king" },
            { name: "Level 2", fen: "1k6/8/8/8/8/8/8/K4RR1 w - - 0 1", instruction: "Checkmate the black king" },
            { name: "Level 3", fen: "8/8/8/1B6/1R6/8/8/k3K3 w - - 0 1", instruction: "Checkmate the black king" },
            { name: "Level 4", fen: "8/8/8/3N4/3N4/3B4/3B4/k3K3 w - - 0 1", instruction: "Checkmate the black king" },
            { name: "Checkmate in 1", fen: "8/8/8/8/8/6K1/4Q3/6k1 w - - 2 1", instruction: "Checkmate in 1 move" },
            { name: "Mate in 1", fen: "5k2/8/5K2/4Q3/5P2/8/8/8 w - - 3 1", instruction: "Checkmate in 1 move" },
            { name: "Zugzwang", fen: "8/8/p1p5/1p5p/1P5p/8/PPP2K1p/4R1rk w - - 0 1", instruction: "Find the winning move" },
            { name: "Earlyish", fen: "rnq1nrk1/pp3pbp/6p1/3p4/3P4/5N2/PP2BPPP/R1BQK2R w KQ - 0 1", instruction: "Find the best move" },
            { name: "Checkmate in 2", fen: "4kb2/3r1p2/2R3p1/6B1/p6P/P3p1P1/P7/5K2 w - - 0 1", instruction: "Checkmate in 2 moves" },
            { name: "Leonid's Position", fen: "q2k2q1/2nqn2b/1n1P1n1b/2rnr2Q/1NQ1QN1Q/3Q3B/2RQR2B/Q2K2Q1 w - - 0 1", instruction: "Find the winning move" },
            { name: "Sufficient Material", fen: "8/6BK/7B/6b1/7B/8/B7/7k w - - 0 1", instruction: "Checkmate the black king" },
            { name: "Checkmate in 1", fen: "rnbqkr2/ppppbp1p/8/3NQ3/8/8/PPPP1nPP/R1B1KBNR w - - 0 1", instruction: "Checkmate in 1 move" },
            { name: "Checkmate in 2", fen: "6k1/p4p2/1p4p1/2p4p/4Pnq1/1PQ5/P1P2PPP/3R2K1 w - - 0 1", instruction: "Checkmate in 2 moves" },
            { name: "Sacrifice Queen", fen: "5rk1/1p3p1p/6p1/q2P4/2n5/P6Q/KB2p3/2R5 w - - 0 1", instruction: "Checkmate in 5 moves, sacrifice your queen" }
        ];
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();
        // Add instruction text specific to this game
        this.instructionText = this.add.text(this.cameras.main.centerX, 100, "", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#00000080",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(20);
    }

    startNewGame() {
        this.chessState = ChessEngine.p4_new_game();
        const levelData = this.levels[this.currentLevel];
        
        // Load FEN
        ChessEngine.p4_fen2state(levelData.fen, this.chessState);
        
        this.gameOver = false;
        this.selectedSquare = -1;
        this.validMoves = [];
        this.isThinking = false;
        
        this.clearHighlights();
        this.updatePieces();
        this.updateTurnIndicator();
        
        // Update instruction
        if (this.instructionText) {
            this.instructionText.setText(levelData.instruction);
        }
        
        // Ensure player plays the side to move
        this.playerColor = this.chessState.to_play;
        
        // If it's computer's turn (unlikely for these puzzles but possible), make it move
        if (this.playerColor !== this.chessState.to_play) {
            this.computerMove();
        }
    }

    // Override checkGameStatus to handle puzzle completion
    checkGameStatus() {
        const result = ChessEngine.p4_check_checkmate(this.chessState);
        
        if (result !== 0) {
            this.gameOver = true;
            let message = '';
            
            if (result === 1) {
                // Checkmate - White wins
                message = 'Checkmate! White wins!';
                if (this.playerColor === 0) {
                    this.audioManager.play('success');
                    this.time.delayedCall(2000, () => this.nextLevel());
                } else {
                    this.audioManager.play('fail');
                }
            } else if (result === 2) {
                // Checkmate - Black wins
                message = 'Checkmate! Black wins!';
                if (this.playerColor === 1) {
                    this.audioManager.play('success');
                    this.time.delayedCall(2000, () => this.nextLevel());
                } else {
                    this.audioManager.play('fail');
                }
            } else if (result === 3) {
                // Stalemate
                message = 'Stalemate! Draw.';
                this.audioManager.play('fail'); // Usually fail in puzzles unless draw is goal
            }
            
            this.messageText.setText(message);
            return true;
        }
        
        // Check for check
        if (ChessEngine.p4_check_check(this.chessState, this.chessState.to_play)) {
            this.messageText.setText('Check!');
            this.audioManager.play('click'); // Or specific check sound
        } else {
            this.messageText.setText('');
        }
        
        return false;
    }

    nextLevel() {
        if (this.currentLevel < this.levels.length - 1) {
            this.currentLevel++;
            this.startNewGame();
        } else {
            this.scene.start('GameMenu');
        }
    }
}
