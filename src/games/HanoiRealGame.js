import { HanoiGame } from './HanoiGame.js';

export class HanoiRealGame extends HanoiGame {
    constructor(config) {
        super({
            ...config,
            key: 'HanoiRealGame',
            title: 'Tower of Hanoi (Real)',
            description: 'Move the tower to the rightmost peg.',
            category: 'strategy'
        });
    }
    
    // Can override createUI or setupGameLogic to use specific assets if needed
    // For now, the base logic is solid.
}
