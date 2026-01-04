import { LalelaGame } from '../utils/LalelaGame.js';

export class NumbersOddEvenGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'NumbersOddEvenGame',
      title: 'Odd and Even Numbers',
      category: 'math',
      description: 'Catch the correct numbers with the helicopter.',
      ...config
    });

    this.levels = [
      { type: 'even', label: 'Catch Even Numbers' },
      { type: 'odd', label: 'Catch Odd Numbers' }
    ];
    this.currentLevelIndex = 0;
    this.score = 0;
  }

  preload() {
    super.preload();
    this.load.image('helico', 'assets/numbers_odd_even/tuxhelico.svg');
    this.load.image('cloud', 'assets/numbers_odd_even/cloud.svg');
    this.load.image('cloud_storm', 'assets/numbers_odd_even/cloud_storm.svg');
  }

  create() {
    super.create();
    this.createBackground(); // Default blue sky
    
    this.player = this.physics.add.sprite(100, this.cameras.main.centerY, 'helico');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.5);

    this.clouds = this.physics.add.group();
    
    this.levelText = this.add.text(this.cameras.main.centerX, 50, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Fredoka One'
    }).setOrigin(0.5);

    this.startLevel();

    // Input
    this.input.on('pointermove', (pointer) => {
      this.player.y = pointer.y;
    });

    // Spawn timer
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnCloud,
      callbackScope: this,
      loop: true
    });

    // Collision
    this.physics.add.overlap(this.player, this.clouds, this.handleCollision, null, this);
  }

  startLevel() {
    const level = this.levels[this.currentLevelIndex];
    this.levelText.setText(level.label);
    this.score = 0;
  }

  spawnCloud() {
    const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
    const cloud = this.clouds.create(this.cameras.main.width + 100, y, 'cloud');
    cloud.setVelocityX(-200);
    cloud.setScale(0.8);
    
    // Assign number
    const num = Phaser.Math.Between(1, 20);
    cloud.number = num;
    
    const text = this.add.text(0, 0, num.toString(), {
      fontSize: '32px',
      color: '#000000'
    }).setOrigin(0.5);
    
    // Attach text to cloud (simple way: update in update loop, or container)
    // Using container for physics is tricky in Phaser 3 without a plugin, 
    // so we'll just update text position in update()
    cloud.textObject = text;
  }

  update() {
    this.clouds.children.iterate((cloud) => {
      if (cloud && cloud.textObject) {
        cloud.textObject.x = cloud.x;
        cloud.textObject.y = cloud.y;
        
        if (cloud.x < -100) {
          cloud.textObject.destroy();
          cloud.destroy();
        }
      }
    });
  }

  handleCollision(player, cloud) {
    const level = this.levels[this.currentLevelIndex];
    const isEven = cloud.number % 2 === 0;
    const isTarget = (level.type === 'even' && isEven) || (level.type === 'odd' && !isEven);

    if (isTarget) {
      this.audioManager.play('success');
      this.score += 10;
      // Visual feedback
      this.tweens.add({
        targets: cloud,
        scale: 1.2,
        alpha: 0,
        duration: 200
      });
    } else {
      this.audioManager.play('error');
      // Maybe lose life or score
    }

    if (cloud.textObject) cloud.textObject.destroy();
    cloud.destroy();

    if (this.score >= 50) {
      this.currentLevelIndex = (this.currentLevelIndex + 1) % this.levels.length;
      this.startLevel();
    }
  }
}
