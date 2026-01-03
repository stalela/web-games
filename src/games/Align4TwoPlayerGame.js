/**
 * Align4TwoPlayerGame - Connect Four (2 Players)
 * 
 * Converted from GCompris align4_2players activity.
 * 
 * Game description:
 * - Classic Connect Four game (7 columns x 6 rows)
 * - Two players on same device
 */

import { Align4Game } from './Align4Game.js';

export class Align4TwoPlayerGame extends Align4Game {
    constructor(config = { key: 'Align4TwoPlayerGame' }) {
        super(config);
        this.twoPlayer = true;
    }
}
