import { LalelaGame } from '../utils/LalelaGame.js';

export class OwareGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'OwareGame',
      title: 'Oware',
      category: 'strategy',
      description: 'Play the strategic game of Oware against Tux.',
      ...config
    });

    this.pits = {
      player1: [], // Bottom row (Player)
      player2: []  // Top row (AI/Opponent)
    };
    this.scores = {
      player1: 0,
      player2: 0
    };
    this.turn = 1; // 1 or 2
    this.isAI = true;
    this.seedsPerPit = 4;
    this.winningScore = 25;
  }

  create() {
    super.create();
    this.createBoard();
    this.startNewGame();
  }

  createBoard() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Background
    this.add.rectangle(centerX, centerY, 800, 400, 0x8B4513).setStrokeStyle(4, 0x000000);

    // Pits
    const startX = centerX - 250;
    const gap = 100;

    // Player 2 (Top) - Indices 0-5 (Left to Right visually, but logic might differ)
    // In Oware, pits are usually numbered counter-clockwise.
    // P2: 11 10 9 8 7 6
    // P1: 0 1 2 3 4 5
    
    // Let's use arrays for each player.
    // Player 1: 0-5 (Left to Right)
    // Player 2: 0-5 (Right to Left) to maintain the loop.
    
    for (let i = 0; i < 6; i++) {
      // Player 2 (Top)
      const p2Pit = this.createPit(startX + i * gap, centerY - 80, 2, 5 - i);
      this.pits.player2[5 - i] = p2Pit;

      // Player 1 (Bottom)
      const p1Pit = this.createPit(startX + i * gap, centerY + 80, 1, i);
      this.pits.player1[i] = p1Pit;
    }

    // Score displays
    this.scoreText1 = this.add.text(centerX, centerY + 160, 'Player: 0', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
    this.scoreText2 = this.add.text(centerX, centerY - 160, 'Tux: 0', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
    
    this.turnText = this.add.text(centerX, centerY, 'Your Turn', { fontSize: '24px', color: '#ffff00' }).setOrigin(0.5);
  }

  createPit(x, y, player, index) {
    const pit = this.add.circle(x, y, 40, 0xDEB887).setStrokeStyle(2, 0x000000);
    pit.setInteractive();
    pit.player = player;
    pit.index = index;
    pit.seeds = 0;
    
    pit.text = this.add.text(x, y, '0', { fontSize: '24px', color: '#000000' }).setOrigin(0.5);
    
    pit.on('pointerdown', () => {
      if (this.turn === 1 && player === 1) {
        this.handleMove(index);
      }
    });

    return pit;
  }

  startNewGame() {
    this.scores.player1 = 0;
    this.scores.player2 = 0;
    this.turn = 1;
    
    // Reset seeds
    for (let i = 0; i < 6; i++) {
      this.updatePit(1, i, 4);
      this.updatePit(2, i, 4);
    }
    
    this.updateUI();
  }

  updatePit(player, index, seeds) {
    const pit = this.pits[`player${player}`][index];
    pit.seeds = seeds;
    pit.text.setText(seeds.toString());
  }

  handleMove(index) {
    if (this.turn !== 1) return;
    
    const seeds = this.pits.player1[index].seeds;
    if (seeds === 0) return;

    this.sowSeeds(1, index);
  }

  sowSeeds(startPlayer, startIndex) {
    let seeds = this.pits[`player${startPlayer}`][startIndex].seeds;
    this.updatePit(startPlayer, startIndex, 0);

    let currentPlayer = startPlayer;
    let currentIndex = startIndex;

    const delay = 200;
    let step = 0;

    const sowStep = () => {
      if (seeds > 0) {
        // Move to next pit
        if (currentPlayer === 1) {
          if (currentIndex < 5) {
            currentIndex++;
          } else {
            currentPlayer = 2;
            currentIndex = 0;
          }
        } else {
          if (currentIndex < 5) {
            currentIndex++;
          } else {
            currentPlayer = 1;
            currentIndex = 0;
          }
        }

        // Skip the starting pit if we loop around? (Oware rules usually say yes if > 11 seeds)
        // For simplicity, let's assume standard sowing.
        
        // Add seed
        const currentPit = this.pits[`player${currentPlayer}`][currentIndex];
        this.updatePit(currentPlayer, currentIndex, currentPit.seeds + 1);
        seeds--;
        
        step++;
        this.time.delayedCall(delay, sowStep);
      } else {
        // Finished sowing
        this.checkCapture(currentPlayer, currentIndex);
        this.switchTurn();
      }
    };

    sowStep();
  }

  checkCapture(player, index) {
    // Capture only happens in opponent's row
    if (player === this.turn) return; // Ended in own row

    let currentIdx = index;
    let captured = false;

    while (currentIdx >= 0 && currentIdx <= 5) {
      const pit = this.pits[`player${player}`][currentIdx];
      if (pit.seeds === 2 || pit.seeds === 3) {
        // Capture
        this.scores[`player${this.turn}`] += pit.seeds;
        this.updatePit(player, currentIdx, 0);
        captured = true;
        
        // Move backwards
        currentIdx--; 
      } else {
        break;
      }
    }
    
    this.updateUI();
    this.checkWin();
  }

  switchTurn() {
    this.turn = this.turn === 1 ? 2 : 1;
    this.updateUI();

    if (this.turn === 2 && this.isAI) {
      this.time.delayedCall(1000, () => this.aiMove());
    }
  }

  aiMove() {
    // Simple AI: Pick random valid pit
    const validMoves = [];
    for (let i = 0; i < 6; i++) {
      if (this.pits.player2[i].seeds > 0) {
        validMoves.push(i);
      }
    }

    if (validMoves.length > 0) {
      const move = Phaser.Utils.Array.GetRandom(validMoves);
      this.sowSeeds(2, move);
    } else {
      // No moves? Game over or pass?
      // Usually game over and opponent takes all.
      this.captureAll(1);
    }
  }

  captureAll(player) {
    // Player captures all remaining seeds
    for (let p = 1; p <= 2; p++) {
      for (let i = 0; i < 6; i++) {
        const seeds = this.pits[`player${p}`][i].seeds;
        if (seeds > 0) {
          this.scores[`player${player}`] += seeds;
          this.updatePit(p, i, 0);
        }
      }
    }
    this.updateUI();
    this.checkWin();
  }

  checkWin() {
    if (this.scores.player1 >= 25) {
      this.endGame('You Win!');
    } else if (this.scores.player2 >= 25) {
      this.endGame('Tux Wins!');
    } else if (this.scores.player1 === 24 && this.scores.player2 === 24) {
      this.endGame('Draw!');
    }
  }

  endGame(message) {
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
      fontSize: '64px',
      color: '#00ff00',
      backgroundColor: '#000000'
    }).setOrigin(0.5);
    
    this.time.delayedCall(3000, () => {
      this.scene.start('GameMenu');
    });
  }

  updateUI() {
    this.scoreText1.setText(`Player: ${this.scores.player1}`);
    this.scoreText2.setText(`Tux: ${this.scores.player2}`);
    this.turnText.setText(this.turn === 1 ? 'Your Turn' : 'Tux Thinking...');
  }
}
