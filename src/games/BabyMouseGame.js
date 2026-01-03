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
