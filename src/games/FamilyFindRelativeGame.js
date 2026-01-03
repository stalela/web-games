import { FamilyGame } from './FamilyGame.js';

export class FamilyFindRelativeGame extends FamilyGame {
    constructor(config) {
        super({
            ...config,
            key: 'FamilyFindRelativeGame',
            title: 'Find Relative',
            description: 'Find the requested relative in the family tree.',
            category: 'discovery'
        });
    }
    
    // We can override startLevel1 to ask different questions or have more complex trees
    // For now, we reuse the base logic which is already "Find the [Role]"
}
