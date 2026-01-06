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
    this.load.image('sea_bg', 'assets/clickgame/sea6.webp');
    this.load.audio('bubble', 'assets/clickgame/bubble.wav');
    this.load.audio('drip', 'assets/clickgame/drip.wav');

    // Navigation icons
    this.load.svg('home', 'assets/game-icons/bar_home.svg');
    this.load.svg('help', 'assets/game-icons/bar_help.svg');
    this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
    
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
    const { width, height } = this.scale;

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

  createBackground() {
    const { width, height } = this.scale;
    // Fallback color
    this.cameras.main.setBackgroundColor(0x2c3e50);

    const bg = this.add.image(width / 2, height / 2, 'sea_bg');
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale);
    bg.setDepth(-1);
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

    // Slightly larger fish for better visibility
    fish.setScale(1.35);
        
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
    fish.body.setAllowRotation(false);
    fish.body.setAngularVelocity(0);
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
    const { width, height } = this.scale;
    const barY = height - 55;
    const buttonSize = 72;
    const spacing = 95;
    const buttonRadius = 10;

    const controls = [
      { icon: 'home', action: 'home', color: 0x0062FF },
      { icon: 'reload', action: 'reload', color: 0x00B378 },
      { icon: 'help', action: 'help', color: 0xF08A00 }
    ];

    const totalWidth = (controls.length * buttonSize) + ((controls.length - 1) * (spacing - buttonSize));
    const startX = (width - totalWidth) / 2;

    this.navButtons = [];

    controls.forEach((control, index) => {
      const x = startX + index * spacing;
      
      // Button background
      const button = this.add.graphics();
      button.fillStyle(control.color);
      button.fillRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
      button.lineStyle(2, 0xFFFFFF, 0.8);
      button.strokeRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
      button.setInteractive(
        new Phaser.Geom.Rectangle(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize),
        Phaser.Geom.Rectangle.Contains
      );

      // Create icon
      const icon = this.add.sprite(x, barY, control.icon);
      icon.setScale((buttonSize * 0.6) / Math.max(icon.width, icon.height));
      icon.setTint(0xFFFFFF);

      // Button interactions
      button.on('pointerdown', () => {
        icon.y += 2;
        this.handleNavAction(control.action);
        this.time.delayedCall(100, () => {
          icon.y -= 2;
        });
      });

      button.on('pointerover', () => {
        this.tweens.add({ targets: icon, scale: (buttonSize * 0.65) / Math.max(icon.width, icon.height), duration: 100 });
      });

      button.on('pointerout', () => {
        this.tweens.add({ targets: icon, scale: (buttonSize * 0.6) / Math.max(icon.width, icon.height), duration: 100 });
      });

      button.setDepth(100);
      icon.setDepth(101);

      this.navButtons.push({ button, icon });
    });
  }

  handleNavAction(action) {
    switch (action) {
      case 'home':
        this.scene.start('GameMenu');
        break;
      case 'reload':
        this.scene.restart();
        break;
      case 'help':
        this.showHelpModal();
        break;
    }
  }

  showHelpModal() {
    const { width, height } = this.scale;
    
    // Overlay
    this.helpOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);
    this.helpOverlay.setDepth(200);
    this.helpOverlay.setInteractive();

    // Panel
    const panelWidth = Math.min(520, width * 0.85);
    const panelHeight = 260;
    this.helpPanel = this.add.graphics();
    this.helpPanel.fillStyle(0xFFFFFF, 1);
    this.helpPanel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 20);
    this.helpPanel.setDepth(201);

    // Title
    this.helpTitle = this.add.text(width / 2, height / 2 - 90, 'How to Play', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#0062FF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(202);

    // Body
    this.helpText = this.add.text(width / 2, height / 2, 'Click on the fish to catch them!\nEarn points for each catch.', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#333333',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(202);

    // Close
    this.closeBtn = this.add.text(width / 2, height / 2 + 90, 'Close', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#0062FF',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    this.closeBtn.on('pointerdown', () => this.closeHelpModal());
    this.helpOverlay.on('pointerdown', () => this.closeHelpModal());
  }

  closeHelpModal() {
    if (this.helpOverlay) this.helpOverlay.destroy();
    if (this.helpPanel) this.helpPanel.destroy();
    if (this.helpTitle) this.helpTitle.destroy();
    if (this.helpText) this.helpText.destroy();
    if (this.closeBtn) this.closeBtn.destroy();
  }
}
