import { LalelaGame } from '../utils/LalelaGame.js';

export class MiningGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'MiningGame',
      title: 'Mining',
      category: 'strategy',
      description: 'Find the gold nugget hidden under the rocks.',
      ...config
    });

    this.gridSize = 4;
    this.rocks = [];
    this.goldPosition = -1;
  }

  preload() {
    super.preload();
    this.load.image('rockwall', 'assets/mining/rockwall.svg');
    this.load.image('stone1', 'assets/mining/stone1.svg');
    this.load.image('stone2', 'assets/mining/stone2.svg');
    this.load.image('stone3', 'assets/mining/stone3.svg');
    this.load.image('stone4', 'assets/mining/stone4.svg');
    this.load.image('sparkle', 'assets/mining/sparkle.svg');
    this.load.image('gold_nugget', 'assets/mining/gold_nugget.svg');
    // this.load.audio('pickaxe', 'assets/mining/pickaxe.wav'); // Assuming wav works or converted
  }

  create() {
    super.create();
    // Background
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'rockwall')
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.createGrid();
  }

  createGrid() {
    // Clear existing
    this.rocks.forEach(r => r.destroy());
    this.rocks = [];

    // Determine gold position
    const totalCells = this.gridSize * this.gridSize;
    this.goldPosition = Phaser.Math.Between(0, totalCells - 1);

    // Grid layout
    const startX = this.cameras.main.centerX - 200;
    const startY = this.cameras.main.centerY - 200;
    const cellSize = 120;

    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / this.gridSize);
      const col = i % this.gridSize;
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;

      // Random stone image
      const stoneKey = `stone${Phaser.Math.Between(1, 4)}`;
      
      // Create container for the cell
      // If it's the gold position, put the sparkle/gold underneath
      if (i === this.goldPosition) {
        const gold = this.add.image(x, y, 'gold_nugget').setScale(0.5);
        gold.setVisible(false); // Hidden initially
        this.goldSprite = gold;
      }

      const rock = this.add.image(x, y, stoneKey);
      rock.setScale(0.8 + Math.random() * 0.2); // Random size variation
      rock.setAngle(Phaser.Math.Between(-10, 10)); // Random rotation
      rock.setInteractive({ useHandCursor: true });
      
      rock.on('pointerdown', () => this.handleRockClick(rock, i));
      
      this.rocks.push(rock);
    }
  }

  handleRockClick(rock, index) {
    // Play sound
    // this.sound.play('pickaxe');

    // Animate rock removal
    this.tweens.add({
      targets: rock,
      alpha: 0,
      scale: 0,
      duration: 200,
      onComplete: () => {
        rock.destroy();
        
        if (index === this.goldPosition) {
          this.handleWin();
        }
      }
    });
  }

  handleWin() {
    this.goldSprite.setVisible(true);
    this.goldSprite.setScale(0);
    
    this.tweens.add({
      targets: this.goldSprite,
      scale: 1,
      angle: 360,
      duration: 500,
      ease: 'Back.out'
    });

    this.audioManager.play('success');
    
    this.time.delayedCall(1500, () => {
      this.createGrid(); // Restart
    });
  }
}
