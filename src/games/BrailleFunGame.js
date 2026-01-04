import { LalelaGame } from '../utils/LalelaGame.js';
import { BrailleCell } from '../components/BrailleCell.js';

export class BrailleFunGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'BrailleFunGame',
      title: 'Braille Fun',
      description: 'Enter the Braille code for the falling letters.',
      category: 'reading',
      ...config
    });
  }

  preload() {
    super.preload();
    this.load.svg('braille-fun-bg', 'assets/braille_fun/hillside.svg');
    this.load.svg('plane', 'assets/braille_fun/plane.svg');
    
    // Load navigation icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach((icon) => {
        this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.image(width / 2, height / 2, 'braille-fun-bg');
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale).setDepth(-1);
  }

  createUI() {
    super.createUI();
    this.createNavigationDock(this.cameras.main.width, this.cameras.main.height);
  }

  setupGameLogic() {
    this.letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    this.startLevel();
  }

  startLevel() {
    this.numChars = (this.level % 3) + 1; // 1, 2, or 3 characters
    this.spawnPlane();
  }

  spawnPlane() {
    const { width, height } = this.cameras.main;
    
    // Generate random letters
    this.targetLetters = [];
    for (let i = 0; i < this.numChars; i++) {
      this.targetLetters.push(this.letters[Math.floor(Math.random() * this.letters.length)]);
    }

    // Create Plane
    if (this.planeContainer) this.planeContainer.destroy();
    this.planeContainer = this.add.container(-200, 150);
    
    const plane = this.add.image(0, 0, 'plane');
    plane.setScale(0.8);
    
    const text = this.add.text(0, 20, this.targetLetters.join(''), {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.planeContainer.add([plane, text]);

    // Animate Plane
    this.tweens.add({
      targets: this.planeContainer,
      x: width + 200,
      duration: 10000, // 10 seconds to cross
      onComplete: () => {
        this.audioManager.play('fail');
        this.spawnPlane(); // Retry
      }
    });

    // Create Input Cells
    this.createInputCells();
  }

  createInputCells() {
    if (this.inputContainer) this.inputContainer.destroy();
    this.inputContainer = this.add.container(0, 0);
    
    const { width, height } = this.cameras.main;
    const cellWidth = 150;
    const spacing = 20;
    const totalWidth = this.numChars * cellWidth + (this.numChars - 1) * spacing;
    const startX = width / 2 - totalWidth / 2 + cellWidth / 2;
    const y = height - 250;

    this.cells = [];

    for (let i = 0; i < this.numChars; i++) {
      const cell = new BrailleCell(this, startX + i * (cellWidth + spacing), y, cellWidth, cellWidth * 1.5, true);
      this.inputContainer.add(cell);
      this.cells.push(cell);
      
      // Listen for changes to auto-check?
      // Or add a check button?
      // GCompris checks automatically or has a button?
      // BrailleAlphabets had a button. BrailleFun might be auto or button.
      // Let's add a check button for simplicity and consistency.
    }

    // Check Button
    const checkBtn = this.add.container(width / 2, height - 130);
    const btnBg = this.add.circle(0, 0, 40, 0x00B378);
    const btnText = this.add.text(0, 0, 'GO', { fontSize: '24px', fontStyle: 'bold' }).setOrigin(0.5);
    
    checkBtn.add([btnBg, btnText]);
    checkBtn.setSize(80, 80);
    checkBtn.setInteractive({ useHandCursor: true });
    checkBtn.on('pointerdown', () => this.checkAnswer());
    
    this.inputContainer.add(checkBtn);
  }

  checkAnswer() {
    let correct = true;
    for (let i = 0; i < this.numChars; i++) {
      if (this.cells[i].getChar() !== this.targetLetters[i]) {
        correct = false;
        break;
      }
    }

    if (correct) {
      this.audioManager.play('success');
      this.tweens.killTweensOf(this.planeContainer);
      this.spawnPlane();
    } else {
      this.audioManager.play('fail');
    }
  }

  createNavigationDock(width, height) {
    // Standard dock
    const dockY = height - 46;
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.92);
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 42, width - 60, 84, 42);
    dockBg.setDepth(14);

    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(3, 0x0062FF, 1);
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 42, width - 60, 84, 42);
    dockBorder.setDepth(15);

    const controls = [
      { icon: 'help.svg', action: 'help', color: 0x00B378 },
      { icon: 'home.svg', action: 'home', color: 0x0062FF },
      { icon: 'settings.svg', action: 'levels', color: 0xF08A00 },
      { icon: 'exit.svg', action: 'menu', color: 0xA74BFF }
    ];

    const totalWidth = controls.length * 92;
    const startX = width / 2 - totalWidth / 2 + 31;

    controls.forEach((control, index) => {
      const x = startX + index * 92;
      const btn = this.add.container(x, dockY);
      btn.setSize(62, 62);
      btn.setInteractive({ useHandCursor: true });
      btn.setDepth(20);

      const circle = this.add.circle(0, 0, 31, control.color);
      const icon = this.add.image(0, 0, control.icon.replace('.svg', ''));
      icon.setScale(0.6);
      btn.add([circle, icon]);
      
      btn.on('pointerdown', () => {
        if (control.action === 'home' || control.action === 'menu') {
          this.scene.start('GameMenu');
        }
      });
    });
  }
}
