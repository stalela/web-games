import { BarGame } from './BarGame.js';

export class BarGame2Players extends BarGame {
    constructor() {
        super({ key: 'BarGame2Players' });
        this.gameMode = 2; // 2 players
    }

    preload() {
        super.preload();
        // Same assets
    }

    createUI() {
        super.createUI();
        // Update player 2 indicator to be human (maybe different icon if available, but score_2 is fine)
        // In original, it might be a different icon.
    }

    machinePlay() {
        // No AI in 2 player mode
    }

    endTurn(player) {
        this.isPlayer1Turn = !this.isPlayer1Turn;
        this.updateUI();
        // No AI call
    }

    updateUI() {
        super.updateUI();
        
        // In 2 player mode, selector is always visible (for the active player)
        this.selectorContainer.setVisible(true);
        
        if (this.isPlayer1Turn) {
            this.instructionText.setText("Player 1's Turn");
        } else {
            this.instructionText.setText("Player 2's Turn");
        }
    }
    
    handleGameOver(player) {
        const winner = player === 1 ? 2 : 1;
        this.audioManager.play('success');
        this.showFeedback(`Player ${winner} Wins!`);
        this.time.delayedCall(2000, () => {
            this.initLevel(); // Restart level
        });
    }
}
