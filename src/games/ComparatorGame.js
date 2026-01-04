import { LalelaGame } from '../utils/LalelaGame.js';

export class ComparatorGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'ComparatorGame',
      title: 'Comparator',
      description: 'Compare two numbers: choose <, =, or >.',
      category: 'math',
      ...config
    });

    this.currentProblem = null;
    this.buttons = {};
  }

  preload() {
    super.preload();
    this.load.svg('comparator-icon', 'assets/game-icons/comparator.svg');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x1f3a5a);
  }

  createUI() {
    super.createUI();

    const { width, height } = this.cameras.main;

    this.titleText = this.add.text(width / 2, 24, 'Compare the numbers', {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    this.problemText = this.add.text(width / 2, height * 0.35, '', {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '76px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Buttons
    const btnY = height * 0.72;
    const symbols = ['<', '=', '>'];
    const colors = { '<': 0x0062FF, '=': 0x00B378, '>': 0xF08A00 };

    const gap = 18;
    const btnW = 120;
    const btnH = 90;
    const totalW = symbols.length * btnW + (symbols.length - 1) * gap;
    const startX = width / 2 - totalW / 2 + btnW / 2;

    symbols.forEach((symbol, i) => {
      const x = startX + i * (btnW + gap);
      this.buttons[symbol] = this.createSymbolButton(x, btnY, btnW, btnH, symbol, colors[symbol], () => {
        this.check(symbol);
      });
    });
  }

  setupGameLogic() {
    // Per-level
  }

  onLevelStart() {
    // Suppress base toast
  }

  loadLevelData(levelNumber) {
    const cappedLevel = Math.max(1, Math.min(levelNumber, 6));

    const ranges = {
      1: { min: 0, max: 10 },
      2: { min: 0, max: 20 },
      3: { min: 0, max: 50 },
      4: { min: 0, max: 100 },
      5: { min: 0, max: 200 },
      6: { min: 0, max: 500 }
    };

    this.levelData = {
      number: cappedLevel,
      ...ranges[cappedLevel]
    };
  }

  resetLevel() {
    this.generateProblem();
  }

  generateProblem() {
    const { min, max } = this.levelData;

    const left = Phaser.Math.Between(min, max);
    let right = Phaser.Math.Between(min, max);

    // Introduce some exact matches
    if (Phaser.Math.Between(0, 4) === 0) {
      right = left;
    }

    const relation = left < right ? '<' : left > right ? '>' : '=';
    this.currentProblem = { left, right, relation };

    this.problemText.setText(`${left}   ?   ${right}`);
  }

  createSymbolButton(x, y, w, h, symbol, color, onClick) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, color, 1);
    bg.setStrokeStyle(3, 0xffffff, 0.9);

    const text = this.add.text(0, 0, symbol, {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '56px',
      color: '#ffffff'
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', onClick);

    container.add([bg, text]);
    return container;
  }

  check(choice) {
    if (!this.currentProblem) return;

    if (choice === this.currentProblem.relation) {
      this.addScore(10);
      this.completeLevel();
    } else {
      if (this.uiManager) {
        this.uiManager.showError('Try again', 1200);
      }
    }
  }
}
