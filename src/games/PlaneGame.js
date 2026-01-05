import { LalelaGame } from '../utils/LalelaGame.js';

export class PlaneGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'PlaneGame',
      title: 'Plane Game',
      category: 'math',
      description: 'Catch the numbers in ascending order.',
      ...config
    });
    this.clouds = [];
    this.numbers = [];
    this.currentNumber = 1;
    this.planeSpeed = 200;
    this.cloudSpeed = 150;
  }

  preload() {
    super.preload();
    this.load.image('desert_scene', 'assets/planegame/desert_scene.svg'); // Assuming copied or use placeholder
    this.load.image('cloud', 'assets/planegame/cloud.svg');
    this.load.image('plane', 'assets/planegame/tuxhelico.svg');
  }

  create() {
    super.create();
    // Background
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'desert_scene')
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Plane
    this.plane = this.physics.add.sprite(100, this.cameras.main.centerY, 'plane');
    this.plane.setDisplaySize(80, 60);
    this.plane.setCollideWorldBounds(true);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointermove', (pointer) => {
      this.plane.y = pointer.y;
    });

    // Clouds Group
    this.cloudsGroup = this.physics.add.group();

    // Overlap check
    this.physics.add.overlap(this.plane, this.cloudsGroup, this.catchCloud, null, this);

    this.startLevel();
  }

  startLevel() {
    this.currentNumber = 1;
    this.numbers = [1, 2, 3, 4, 5]; // Example sequence
    this.spawnClouds();
  }

  spawnClouds() {
    // Clear existing
    this.cloudsGroup.clear(true, true);

    // Spawn clouds with numbers
    this.numbers.forEach((num, index) => {
      const x = this.cameras.main.width + 100 + index * 300;
      const y = Phaser.Math.Between(50, this.cameras.main.height - 50);
      
      const cloud = this.cloudsGroup.create(x, y, 'cloud');
      cloud.setDisplaySize(100, 60);
      cloud.number = num;
      
      const text = this.add.text(0, 0, num.toString(), {
        fontSize: '32px',
        color: '#000000'
      }).setOrigin(0.5);
      
      // Attach text to cloud (simple way: update in update loop or use container)
      // Physics groups work best with sprites. Let's store text ref on sprite.
      cloud.text = text;
      cloud.setVelocityX(-this.cloudSpeed);
    });
  }

  update(time, delta) {
    super.update(time, delta);

    // Plane movement (Keyboard)
    if (this.cursors.up.isDown) {
      this.plane.setVelocityY(-this.planeSpeed);
    } else if (this.cursors.down.isDown) {
      this.plane.setVelocityY(this.planeSpeed);
    } else {
      this.plane.setVelocityY(0);
    }

    // Update cloud texts and respawn
    this.cloudsGroup.getChildren().forEach(cloud => {
      if (cloud.text) {
        cloud.text.x = cloud.x;
        cloud.text.y = cloud.y;
      }

      if (cloud.x < -100) {
        cloud.x = this.cameras.main.width + 100;
        cloud.y = Phaser.Math.Between(50, this.cameras.main.height - 50);
      }
    });
  }

  catchCloud(plane, cloud) {
    if (cloud.number === this.currentNumber) {
      // Correct
      this.audioManager.play('success');
      cloud.text.destroy();
      cloud.destroy();
      this.currentNumber++;
      
      if (this.currentNumber > this.numbers.length) {
        this.time.delayedCall(1000, () => this.scene.start('GameMenu')); // Or next level
      }
    } else {
      // Incorrect
      this.audioManager.play('error'); // Crash sound?
      // Maybe penalty or restart?
    }
  }
}
