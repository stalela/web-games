import { NineMenMorrisBaseGame } from './NineMenMorrisBaseGame.js';

export class NineMenMorrisTwoPlayerGame extends NineMenMorrisBaseGame {
    constructor() {
        super();
        this.twoPlayer = true;
    }
}
