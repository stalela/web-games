import { LalelaGame } from '../utils/LalelaGame.js';

export class BabyMouseGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'computer',
      difficulty: 1,
      ...config
    });
    
    this.blueDuck = null;
    this.targetX = 0;
    this.targetY = 0;
  }

  preload() {
    super.preload();
    this.load.svg('baby_mouse_bg', 'assets/baby_mouse/background.svg');
    this.load.svg('arrow', 'assets/baby_mouse/arrow.svg');
    
    const ducks = ['pink', 'green', 'yellow', 'orange', 'blue'];
    ducks.forEach(color => {
      this.load.svg(`${color}_duck`, `assets/baby_mouse/${color}_duck.svg`);
    });
    
    // Sounds
    this.load.audio('bleep', 'assets/sounds/bleep.wav');
    this.load.audio('smudge', 'assets/sounds/smudge.wav');
    this.load.audio('flip', 'assets/sounds/flip.wav');
    this.load.audio('completetask', 'assets/sounds/completetask.wav');

    // Load navigation icons
    this.load.svg('home', 'assets/game-icons/bar_home.svg');
    this.load.svg('help', 'assets/game-icons/bar_help.svg');
    this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
  }

  createGameObjects() {
    // Background
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'baby_mouse_bg')
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setDepth(-1);
      
    this.createLeftDucks();
    this.createArrows();
    this.createMainDuck();
  }

  createUI() {
    super.createUI();
    this.createNavigationDock();
    
    // Instruction
    this.add.text(this.cameras.main.centerX, 50, 'Move the mouse or touch the screen', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#000000',
      backgroundColor: '#ffffff88',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  createLeftDucks() {
    const ducks = [
      { color: 'pink', sound: 'bleep' },
      { color: 'green', sound: 'smudge' },
      { color: 'yellow', sound: 'flip' },
      { color: 'orange', sound: 'completetask' }
    ];
    
    const startY = 150;
    const spacing = 120;
    const x = 80;
    
    ducks.forEach((duck, index) => {
      const sprite = this.add.image(x, startY + index * spacing, `${duck.color}_duck`)
        .setDisplaySize(100, 100)
        .setInteractive({ useHandCursor: true });
        
      sprite.on('pointerdown', () => {
        this.sound.play(duck.sound);
        
        // Animation
        this.tweens.add({
          targets: sprite,
          scale: 1.2,
          duration: 200,
          yoyo: true
        });
        
        this.tweens.add({
          targets: sprite,
          angle: 360,
          duration: 500
        });
      });
    });
  }

  createArrows() {
    const x = this.cameras.main.width - 150;
    const y = 200;
    const size = 80;
    const spacing = 90;
    
    // Up
    this.createArrow(x, y - spacing, 0, 0, -50);
    // Down
    this.createArrow(x, y + spacing, 180, 0, 50);
    // Left
    this.createArrow(x - spacing, y, -90, -50, 0);
    // Right
    this.createArrow(x + spacing, y, 90, 50, 0);
  }

  createArrow(x, y, angle, dx, dy) {
    const arrow = this.add.image(x, y, 'arrow')
      .setDisplaySize(80, 80)
      .setAngle(angle)
      .setInteractive({ useHandCursor: true });
      
    arrow.on('pointerdown', () => {
      this.moveBlueDuck(dx, dy);
      
      this.tweens.add({
        targets: arrow,
        scale: 0.8,
        duration: 100,
        yoyo: true
      });
    });
  }

  createMainDuck() {
    this.blueDuck = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'blue_duck')
      .setDisplaySize(150, 150);
      
    // Mouse movement
    this.input.on('pointermove', (pointer) => {
      // Only move if pointer is in the central area (roughly)
      if (pointer.x > 200 && pointer.x < this.cameras.main.width - 300) {
        this.blueDuck.setPosition(pointer.x, pointer.y);
      }
    });
    
    // Click to show marker
    this.input.on('pointerdown', (pointer) => {
      if (pointer.x > 200 && pointer.x < this.cameras.main.width - 300) {
        this.showMarker(pointer.x, pointer.y);
      }
    });
  }

  moveBlueDuck(dx, dy) {
    const newX = Phaser.Math.Clamp(this.blueDuck.x + dx * 2, 200, this.cameras.main.width - 300);
    const newY = Phaser.Math.Clamp(this.blueDuck.y + dy * 2, 100, this.cameras.main.height - 100);
    
    this.tweens.add({
      targets: this.blueDuck,
      x: newX,
      y: newY,
      duration: 200
    });
  }

  showMarker(x, y) {
    const marker = this.add.circle(x, y, 10, 0xff0000);
    this.tweens.add({
      targets: marker,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => marker.destroy()
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
      
      // Create button background
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
    
    // Semi-transparent overlay
    this.helpOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.helpOverlay.setDepth(200);
    this.helpOverlay.setInteractive();

    // Help panel
    const panelWidth = Math.min(500, width * 0.8);
    const panelHeight = 280;
    this.helpPanel = this.add.graphics();
    this.helpPanel.fillStyle(0xFFFFFF, 1);
    this.helpPanel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 20);
    this.helpPanel.setDepth(201);

    // Help title
    this.helpTitle = this.add.text(width / 2, height / 2 - 100, 'How to Play', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#0062FF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(202);

    // Help text
    this.helpText = this.add.text(width / 2, height / 2, 
      'Move the mouse to control the blue duck!\n\nClick on the colored ducks to hear sounds.\n\nUse the arrow buttons to move the duck.', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#333333',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(202);

    // Close button
    this.closeBtn = this.add.text(width / 2, height / 2 + 110, 'Close', {
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
