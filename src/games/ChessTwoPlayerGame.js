/**
 * ChessTwoPlayerGame - Two player local chess
 * 
 * Extends ChessGame with two-player mode enabled
 */

import { ChessGame } from './ChessGame.js';

export class ChessTwoPlayerGame extends ChessGame {
    constructor() {
        super({ key: 'ChessTwoPlayerGame' });
        this.twoPlayer = true;
    }

    // Override the scene key
    init(data) {
        super.init(data);
        // In two player mode, both players use the same device
        this.playerColor = 0; // Start with white
    }
}
