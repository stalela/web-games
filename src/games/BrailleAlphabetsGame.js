import { LalelaGame } from '../utils/LalelaGame.js';
import { BrailleCell } from '../components/BrailleCell.js';

export class BrailleAlphabetsGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'BrailleAlphabetsGame',
      title: 'Braille Alphabets',
      description: 'Learn the Braille alphabet.',
      category: 'reading',
      ...config
    });

    this.levels = [
      { showReference: true, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] },
      { showReference: false, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] },
      { showReference: true, letters: ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'] },
      { showReference: false, letters: ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'] },
      { showReference: true, letters: ['U', 'V', 'W', 'X', 'Y', 'Z'] },
      { showReference: false, letters: ['U', 'V', 'W', 'X', 'Y', 'Z'] }
    ];
  }

  preload() {
    super.preload();
    this.load.svg('braille-bg', 'assets/braille_alphabets/background.svg');
    this.load.svg('tux-braille', 'assets/braille_alphabets/tux_braille.svg');
    
    // Load navigation icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach((icon) => {
        this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.image(width / 2, height / 2, 'braille-bg');
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale).setDepth(-1);
  }

  createUI() {
    super.createUI();
    this.createNavigationDock(this.cameras.main.width, this.cameras.main.height);
    
    // Instruction text
    this.instructionText = this.add.text(this.cameras.main.width / 2, 100, '', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 800 }
    }).setOrigin(0.5);
  }

  setupGameLogic() {
    this.startLevel();
  }

  startLevel() {
    const levelConfig = this.levels[this.level % this.levels.length];
    this.currentSequence = this.shuffleArray([...levelConfig.letters]);
    this.sequenceIndex = 0;
    this.showReference = levelConfig.showReference;
    
    this.nextQuestion();
  }

  nextQuestion() {
    if (this.sequenceIndex >= this.currentSequence.length) {
      this.level++;
      this.startLevel();
      return;
    }

    const targetLetter = this.currentSequence[this.sequenceIndex];
    this.currentTarget = targetLetter;

    // Clear previous
    if (this.mainContainer) this.mainContainer.destroy();
    this.mainContainer = this.add.container(0, 0);

    const { width, height } = this.cameras.main;

    // Update instruction
    this.instructionText.setText(`Reproduce the letter ${targetLetter}`);

    // Interactive Braille Cell
    this.inputCell = new BrailleCell(this, width / 2, height / 2 + 50, 200, 300, true);
    this.mainContainer.add(this.inputCell);

    // Reference Cell (if enabled)
    if (this.showReference) {
      const refX = width / 2 - 300;
      const refY = height / 2 + 50;
      
      const refLabel = this.add.text(refX, refY - 180, 'Reference', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#333333'
      }).setOrigin(0.5);
      
      const refCell = new BrailleCell(this, refX, refY, 150, 225, false);
      refCell.setChar(targetLetter);
      
      this.mainContainer.add([refLabel, refCell]);
    }

    // Check Button
    const checkBtn = this.add.container(width / 2 + 300, height / 2 + 50);
    const btnBg = this.add.circle(0, 0, 50, 0x00B378);
    const btnText = this.add.text(0, 0, 'OK', { fontSize: '32px', fontStyle: 'bold' }).setOrigin(0.5);
    
    checkBtn.add([btnBg, btnText]);
    checkBtn.setSize(100, 100);
    checkBtn.setInteractive({ useHandCursor: true });
    checkBtn.on('pointerdown', () => this.checkAnswer());
    
    this.mainContainer.add(checkBtn);
  }

  checkAnswer() {
    const enteredChar = this.inputCell.getChar();
    
    if (enteredChar === this.currentTarget) {
      this.audioManager.play('success');
      this.sequenceIndex++;
      
      this.time.delayedCall(1000, () => {
        this.nextQuestion();
      });
    } else {
      this.audioManager.play('fail');
      // Shake effect
      this.tweens.add({
        targets: this.inputCell,
        x: this.inputCell.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3
      });
    }
  }

  createNavigationDock(width, height) {
    // Standard dock implementation (copied from ImageNameGame/AdjacentNumbers)
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
