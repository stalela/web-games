/**
 * ClickOnLetterUpGame - Click on an uppercase letter
 * 
 * Converted from GCompris click_on_letter_up activity.
 * 
 * This is a simple variant of ClickOnLetterGame that uses uppercase letters.
 */

import { ClickOnLetterGame } from './ClickOnLetterGame.js';

export class ClickOnLetterUpGame extends ClickOnLetterGame {
    constructor() {
        super();
        this.scene.key = 'ClickOnLetterUpGame';
    }
    
    init(data) {
        super.init(data);
        
        // Override mode to uppercase
        this.mode = 'uppercase';
    }
}
