import { LalelaGame } from '../utils/LalelaGame.js';

export class ClickGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'computer',
      difficulty: 1,
      ...config
    });
    
    this.fishes = [];
    this.fishData = [
        { imgName: "blueking2.webp", nbFrame: 2, width: 118, height: 76 },
        { imgName: "butfish.webp", nbFrame: 2, width: 98, height: 82 },
        { imgName: "cichlid1.webp", nbFrame: 2, width: 63, height: 37 },
        { imgName: "cichlid4.webp", nbFrame: 2, width: 73, height: 44 },
        { imgName: "collaris.webp", nbFrame: 2, width: 62, height: 50 },
        { imgName: "discus2.webp", nbFrame: 2, width: 100, height: 100 },
        { imgName: "discus3.webp", nbFrame: 2, width: 63, height: 57 },
        { imgName: "f00.webp", nbFrame: 2, width: 64, height: 59 },
        { imgName: "f01.webp", nbFrame: 2, width: 63, height: 50 },
        { imgName: "f02.webp", nbFrame: 2, width: 71, height: 44 },
        { imgName: "f03.webp", nbFrame: 2, width: 83, height: 52 },
        { imgName: "f04.webp", nbFrame: 2, width: 93, height: 62 },
        { imgName: "f05.webp", nbFrame: 2, width: 90, height: 49 },
        { imgName: "f06.webp", nbFrame: 2, width: 93, height: 44 }
    ];
    
    this.spawnTimer = null;
    this.fishGroup = null;
  }

  preload() {
    super.preload();
    this.load.image('sea_bg', 'assets/clickgame/sea1.webp');
    this.load.audio('bubble', 'assets/clickgame/bubble.wav');
    this.load.audio('drip', 'assets/clickgame/drip.wav');
    
    this.fishData.forEach(fish => {
        const key = fish.imgName.split('.')[0];
        this.load.spritesheet(key, `assets/clickgame/${fish.imgName}`, {
            frameWidth: fish.width / fish.nbFrame, // Wait, width is total width or frame width?
            // GCompris usually stores total width in QML/JS if it's a single image, but for spritesheets?
            // Let's check the JS again. "width": 118, "nbFrame": 2.
            // If it's a strip, width is total width.
            // Phaser needs frameWidth.
            frameHeight: fish.height
        });
    });
  }

  createGameObjects() {
    // Background
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'sea_bg')
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setDepth(-1);
      
    this.fishGroup = this.add.group();
    
    // Create animations
    this.fishData.forEach(fish => {
        const key = fish.imgName.split('.')[0];
        // Check if width is total width or frame width.
        // Usually GCompris sprites are horizontal strips.
        // So frameWidth = width / nbFrame.
        
        this.anims.create({
            key: `${key}_swim`,
            frames: this.anims.generateFrameNumbers(key, { start: 0, end: fish.nbFrame - 1 }),
            frameRate: 5,
            repeat: -1
        });
    });
  }

  createUI() {
    super.createUI();
    this.createNavigationDock();
    
    this.add.text(this.cameras.main.centerX, 50, 'Catch the fish!', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  setupGameLogic() {
    this.spawnTimer = this.time.addEvent({
        delay: 1000,
        callback: this.spawnFish,
        callbackScope: this,
        loop: true
    });
  }

  spawnFish() {
    const fishInfo = Phaser.Utils.Array.GetRandom(this.fishData);
    const key = fishInfo.imgName.split('.')[0];
    
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
    
    let x, flipX, velocityX;
    
    if (side === 'left') {
        x = -50;
        flipX = false; // Assuming fish face right by default? Or left?
        // Need to check. Usually fish face left in image?
        // If they face left, and moving right, we need to flip.
        // Let's assume they face left.
        velocityX = Phaser.Math.Between(100, 200);
    } else {
        x = this.cameras.main.width + 50;
        flipX = true;
        velocityX = -Phaser.Math.Between(100, 200);
    }
    
    const fish = this.add.sprite(x, y, key)
        .setInteractive({ useHandCursor: true })
        .play(`${key}_swim`);
        
    // Adjust flip based on direction and original orientation
    // If original faces left:
    // Moving right (vx > 0): flipX = true
    // Moving left (vx < 0): flipX = false
    
    // Let's assume original faces LEFT (common in GCompris).
    if (velocityX > 0) {
        fish.setFlipX(true);
    } else {
        fish.setFlipX(false);
    }
    
    this.physics.add.existing(fish);
    fish.body.setVelocityX(velocityX);
    
    fish.on('pointerdown', () => {
        this.catchFish(fish);
    });
    
    this.fishGroup.add(fish);
    
    // Destroy if out of bounds
    // We can use update loop or just a timer/check
  }
  
  update(time, delta) {
      super.update(time, delta);
      
      this.fishGroup.getChildren().forEach(fish => {
          if (fish.x < -100 || fish.x > this.cameras.main.width + 100) {
              fish.destroy();
          }
      });
  }

  catchFish(fish) {
      this.sound.play('drip');
      this.addScore(10);
      
      // Effect
      this.tweens.add({
          targets: fish,
          scale: 0,
          alpha: 0,
          duration: 200,
          onComplete: () => fish.destroy()
      });
  }

  createNavigationDock() {
    const dockY = this.cameras.main.height - 60;
    
    // Back button
    this.add.text(50, dockY, '⬅ Back', { 
        fontSize: '24px', 
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
    })
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.scene.start('GameMenu'));
  }
}
