import { OwareGame } from './OwareGame.js';

export class OwareTwoPlayerGame extends OwareGame {
    constructor() {
        super({
            key: 'OwareTwoPlayerGame',
            title: 'Oware (2 Players)',
            description: 'Play the strategic game of Oware with a friend.',
            category: 'strategy'
        });
        
        this.isAI = false;
    }
}
