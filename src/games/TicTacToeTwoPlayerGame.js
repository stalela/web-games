/**
 * TicTacToeTwoPlayerGame - Tic Tac Toe (2 Players)
 * 
 * Converted from GCompris tic_tac_toe_2players activity.
 * 
 * Game description:
 * - Classic 3x3 Tic-Tac-Toe game
 * - Two players on same device
 */

import { TicTacToeGame } from './TicTacToeGame.js';

export class TicTacToeTwoPlayerGame extends TicTacToeGame {
    constructor(config = { key: 'TicTacToeTwoPlayerGame' }) {
        super(config);
        this.twoPlayer = true;
    }
}
