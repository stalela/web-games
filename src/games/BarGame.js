import { LalelaGame } from '../utils/LalelaGame.js';

export class BarGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'BarGame' });
        this.levelsProperties = [
            {
                minNumberOfBalls: 1,
                maxNumberOfBalls: 4,
                elementSizeFactor: 0,
                boardSize: 15
            },
            {
                minNumberOfBalls: 2,
                maxNumberOfBalls: 6,
                elementSizeFactor: 4,
                boardSize: 19
            },
            {
                minNumberOfBalls: 3,
                maxNumberOfBalls: 6,
                elementSizeFactor: 7,
                boardSize: 29
            }
        ];
        this.gameMode = 1; // 1 for AI, 2 for 2 players
        this.moveCount = -1;
        this.numberOfLevel = 3; // 0, 1, 2
        this.listWin = [];
        this.isPlayer1Beginning = true;
        this.isPlayer1Turn = true;
        this.selectedBalls = 0;
    }

    preload() {
        super.preload();
        this.load.svg('bg-bargame', 'assets/bargame/background.svg');
        this.load.svg('ball_1', 'assets/bargame/ball_1.svg');
        this.load.svg('ball_2', 'assets/bargame/ball_2.svg');
        this.load.svg('ball_1b', 'assets/bargame/ball_1b.svg');
        this.load.svg('ball_2b', 'assets/bargame/ball_2b.svg');
        this.load.svg('case', 'assets/bargame/case.svg');
        this.load.svg('case_last', 'assets/bargame/case_last.svg');
        this.load.svg('score_1', 'assets/bargame/score_1.svg');
        this.load.svg('score_2', 'assets/bargame/score_2.svg');
    }

    createBackground() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg-bargame')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        // Instruction text
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, "Select balls to place, then click OK.", {
            fontFamily: 'Fredoka One',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // OK Button
        this.okButton = this.uiManager.createButton(this, this.cameras.main.width - 100, this.cameras.main.height - 100, 'OK', () => {
            this.onOkClick();
        });
        this.okButton.setVisible(false);

        // Ball Selector UI
        this.selectorContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.height - 150);
        
        // Player indicators
        this.player1Indicator = this.add.image(100, 100, 'score_1').setScale(0.5);
        this.player2Indicator = this.add.image(this.cameras.main.width - 100, 100, 'score_2').setScale(0.5);
        
        // Highlight active player
        this.activePlayerHighlight = this.add.graphics();
    }

    setupGameLogic() {
        this.currentLevel = 0;
        this.initLevel();
    }

    initLevel() {
        this.moveCount = -1;
        this.selectedBalls = 0;
        
        // Clear previous board
        if (this.boardContainer) this.boardContainer.destroy();
        this.boardContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);

        const props = this.levelsProperties[this.currentLevel];
        const boardSize = props.boardSize;
        
        // Create holes
        this.holes = [];
        this.balls = [];
        
        // Layout holes in a spiral or grid? 
        // GCompris uses a spiral or line. Let's use a grid/line for simplicity or try to match the SVG layout if possible.
        // Looking at the screenshots/description, it's often a line or a curve.
        // Let's do a simple grid layout for now, wrapping if needed.
        
        const cols = 10;
        const spacing = 60;
        const startX = -((Math.min(boardSize, cols) - 1) * spacing) / 2;
        const startY = -((Math.ceil(boardSize / cols) - 1) * spacing) / 2;

        for (let i = 0; i < boardSize; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = startX + col * spacing;
            const y = startY + row * spacing;

            const isLast = i === boardSize - 1;
            const texture = isLast ? 'case_last' : 'case';
            
            const hole = this.add.image(x, y, texture).setScale(0.5);
            this.boardContainer.add(hole);
            this.holes.push(hole);

            // Placeholder for ball
            const ball = this.add.image(x, y, 'ball_1').setScale(0.5).setVisible(false);
            this.boardContainer.add(ball);
            this.balls.push(ball);
        }

        // Setup Selector
        this.createSelector();

        // AI Logic Setup
        this.calculateWinPlaces();

        // Turn setup
        if (this.isPlayer1Beginning) {
            this.initiatePlayer1();
        } else {
            this.initiatePlayer2();
        }
        
        this.updateUI();
    }

    createSelector() {
        this.selectorContainer.removeAll(true);
        const props = this.levelsProperties[this.currentLevel];
        const min = props.minNumberOfBalls;
        const max = props.maxNumberOfBalls;
        
        const spacing = 70;
        const startX = -((max - min) * spacing) / 2;

        for (let i = min; i <= max; i++) {
            const x = startX + (i - min) * spacing;
            const btn = this.add.image(x, 0, 'ball_1b').setScale(0.6).setInteractive();
            
            // Number text
            const text = this.add.text(x, 0, i.toString(), {
                fontFamily: 'Fredoka One',
                fontSize: '24px',
                color: '#000000'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                this.selectBalls(i);
            });

            this.selectorContainer.add(btn);
            this.selectorContainer.add(text);
        }
    }

    selectBalls(count) {
        if (!this.isPlayer1Turn && this.gameMode === 1) return; // AI turn

        this.selectedBalls = count;
        this.okButton.setVisible(true);
        
        // Visual feedback on selector
        // (Simplified for now)
        this.instructionText.setText(`Place ${count} balls?`);
    }

    onOkClick() {
        this.play(1, this.selectedBalls);
        this.okButton.setVisible(false);
        this.selectedBalls = 0;
        this.instructionText.setText("Wait...");
    }

    play(player, value) {
        let placed = 0;
        
        const placeNextBall = () => {
            if (placed < value) {
                this.moveCount++;
                const boardSize = this.levelsProperties[this.currentLevel].boardSize;
                
                if (this.moveCount < boardSize) {
                    const ball = this.balls[this.moveCount];
                    ball.setTexture(player === 1 ? 'ball_1' : 'ball_2');
                    ball.setVisible(true);
                    
                    // Check win/loss
                    if (this.moveCount === boardSize - 1) {
                        this.handleGameOver(player);
                        return;
                    }
                    
                    placed++;
                    this.time.delayedCall(300, placeNextBall);
                }
            } else {
                // Turn end
                this.endTurn(player);
            }
        };
        
        placeNextBall();
    }

    endTurn(player) {
        this.isPlayer1Turn = !this.isPlayer1Turn;
        this.updateUI();

        if (this.gameMode === 1 && this.isPlayer1Turn === false) {
            // AI Turn
            this.time.delayedCall(1000, () => {
                this.machinePlay();
            });
        }
    }

    machinePlay() {
        const props = this.levelsProperties[this.currentLevel];
        const min = props.minNumberOfBalls;
        const max = props.maxNumberOfBalls;
        
        const accessible = (x) => {
            return this.listWin.indexOf(x + this.moveCount) >= 0;
        };

        let playable = [];
        for (let x = min; x <= max; x++) {
            if (accessible(x)) {
                playable.push(x);
            }
        }

        let value;
        if (playable.length !== 0) {
            value = playable[Math.floor(Math.random() * playable.length)];
        } else {
            value = Math.floor(Math.random() * (max - min + 1)) + min;
        }

        this.play(2, value);
    }

    calculateWinPlaces() {
        const props = this.levelsProperties[this.currentLevel];
        const min = props.minNumberOfBalls;
        const max = props.maxNumberOfBalls;
        const boardSize = props.boardSize;
        const period = min + max;

        let winnersList = [];
        for (let x = 0; x < min; x++) {
            winnersList.push((boardSize - 1 - x) % period);
        }

        let winners = [];
        for (let x = period + 1; x < boardSize; x++) {
            if (winnersList.indexOf((x + 1) % period) >= 0) {
                winners.push(x);
            }
        }

        const levelWin = this.currentLevel * min; // Logic from original code
        // Note: original code uses items.currentLevel which is 0,1,2. 
        // But numberOfLevel is 4 in original? 
        // Original: items.currentLevel = Core.getInitialLevel(numberOfLevel);
        // Let's stick to the logic:
        
        if (levelWin === 0) {
            winners = [];
        } else {
            winners = winners.slice(-levelWin);
            if (this.currentLevel === this.levelsProperties.length - 1) {
                winners = winners.slice(1);
            }
        }
        this.listWin = winners;
    }

    handleGameOver(player) {
        // The player who placed the last ball (on red hole) LOSES.
        // So if player 1 placed it, player 2 wins.
        
        const winner = player === 1 ? 2 : 1;
        
        if (winner === 1) {
            this.audioManager.play('success');
            this.showFeedback('You Win!');
            this.time.delayedCall(2000, () => {
                this.nextLevel();
            });
        } else {
            this.audioManager.play('fail');
            this.showFeedback('Tux Wins!');
            this.time.delayedCall(2000, () => {
                this.initLevel(); // Restart level
            });
        }
    }

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel >= this.levelsProperties.length) {
            this.currentLevel = 0; // Loop or finish?
            // Usually finish
            this.scene.start('GameMenu');
        } else {
            this.initLevel();
        }
    }

    initiatePlayer1() {
        this.isPlayer1Turn = true;
        this.updateUI();
    }

    initiatePlayer2() {
        this.isPlayer1Turn = false;
        this.updateUI();
        if (this.gameMode === 1) {
            this.time.delayedCall(1000, () => this.machinePlay());
        }
    }

    updateUI() {
        // Highlight active player
        this.activePlayerHighlight.clear();
        this.activePlayerHighlight.lineStyle(4, 0xffff00);
        
        if (this.isPlayer1Turn) {
            this.activePlayerHighlight.strokeCircle(this.player1Indicator.x, this.player1Indicator.y, 40);
            this.instructionText.setText("Your Turn");
            this.selectorContainer.setVisible(true);
        } else {
            this.activePlayerHighlight.strokeCircle(this.player2Indicator.x, this.player2Indicator.y, 40);
            this.instructionText.setText("Tux's Turn");
            this.selectorContainer.setVisible(false);
            this.okButton.setVisible(false);
        }
    }
}
