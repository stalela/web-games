import { LalelaGame } from '../utils/LalelaGame.js';

export class VerticalSubtractionGame extends LalelaGame {
    constructor() {
        super({ key: 'VerticalSubtractionGame' });
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();
        this.createUI();
        this.setupGameLogic();
    }

    createUI() {
        this.add.text(this.cameras.main.centerX, 100, 'Vertical Subtraction', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        // Game logic here
    }
}
