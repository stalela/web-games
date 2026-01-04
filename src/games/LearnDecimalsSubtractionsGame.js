import { LalelaGame } from '../utils/LalelaGame.js';

export class LearnDecimalsSubtractionsGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'LearnDecimalsSubtractionsGame',
      title: 'Decimal Subtractions',
      description: 'Practice subtracting decimal numbers.',
      category: 'math',
      ...config
    });

    this.currentProblem = null;
    this.choiceButtons = [];
  }

  preload() {
    super.preload();
    this.load.svg('learn_decimals_subtractions-icon', 'assets/game-icons/learn_decimals_subtractions.svg');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x16324f);
  }

  createUI() {
    super.createUI();

    const { width } = this.cameras.main;

    this.titleText = this.add.text(width / 2, 24, 'Decimal subtractions', {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    this.questionText = this.add.text(width / 2, 70, '', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);
  }

  setupGameLogic() {
    // Per-level
  }

  onLevelStart() {
    // Suppress base toast
  }

  loadLevelData(levelNumber) {
    const cappedLevel = Math.max(1, Math.min(levelNumber, 3));

    const presets = {
      1: { step: 0.1 },
      2: { step: 0.01 },
      3: { step: 0.01, allowBorrow: true }
    };

    this.levelData = {
      number: cappedLevel,
      ...presets[cappedLevel]
    };
  }

  resetLevel() {
    this.clearProblem();
    this.generateProblem();
  }

  clearProblem() {
    this.choiceButtons.forEach((b) => b.destroy(true));
    this.choiceButtons = [];
    this.currentProblem = null;

    if (this.problemText) {
      this.problemText.destroy();
      this.problemText = null;
    }
  }

  generateProblem() {
    const { width, height } = this.cameras.main;
    const { step, allowBorrow } = this.levelData;
    const denom = Math.round(1 / step);

    // Ensure a >= b unless allowBorrow is true
    let aIndex = Phaser.Math.Between(1, denom * 2 - 1);
    let bIndex = Phaser.Math.Between(1, denom - 1);

    if (!allowBorrow) {
      aIndex = Phaser.Math.Between(bIndex, denom * 2 - 1);
    }

    const a = aIndex / denom;
    const b = bIndex / denom;
    const correct = Math.round((a - b) * denom) / denom;

    this.currentProblem = { a, b, correct, step, denom };

    this.questionText.setText('Choose the correct answer');

    const fmt = (v) => v.toFixed(step < 0.1 ? 2 : 1);
    this.problemText = this.add.text(width / 2, height * 0.38, `${fmt(a)} − ${fmt(b)} = ?`, {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '54px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const choices = this.buildChoices(correct, denom);

    const btnY = height * 0.74;
    const btnW = 180;
    const btnH = 64;
    const gap = 18;
    const totalW = choices.length * btnW + (choices.length - 1) * gap;
    const startBtnX = width / 2 - totalW / 2 + btnW / 2;

    choices.forEach((value, index) => {
      const x = startBtnX + index * (btnW + gap);
      const btn = this.createChoiceButton(x, btnY, btnW, btnH, fmt(value), () => this.checkAnswer(value));
      this.choiceButtons.push(btn);
    });
  }

  buildChoices(correct, denom) {
    const correctIndex = Math.round(correct * denom);
    const values = new Set([correctIndex]);

    while (values.size < 4) {
      const offset = Phaser.Math.Between(-8, 8);
      const idx = Phaser.Math.Clamp(correctIndex + offset, 0, denom * 2);
      values.add(idx);
    }

    return Phaser.Utils.Array.Shuffle(Array.from(values)).map((idx) => idx / denom);
  }

  createChoiceButton(x, y, w, h, label, onClick) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0x0062FF, 1);
    bg.setStrokeStyle(3, 0xffffff, 0.9);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', onClick);

    container.add([bg, text]);
    return container;
  }

  checkAnswer(value) {
    if (!this.currentProblem) return;

    if (value === this.currentProblem.correct) {
      this.addScore(10);
      this.completeLevel();
    } else {
      if (this.uiManager) {
        this.uiManager.showError('Try again', 1200);
      }
    }
  }
}
