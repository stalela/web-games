import { LalelaGame } from '../utils/LalelaGame.js';

export class GraduatedLineReadGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'GraduatedLineReadGame',
      ...config,
      title: 'Graduated Line (Read)',
      description: 'Read the value on a graduated number line.',
      category: 'math'
    });

    this.currentProblem = null;
    this.choiceButtons = [];
  }

  preload() {
    super.preload();
    this.load.svg('graduated_line_read-icon', 'assets/game-icons/graduated_line_read.svg');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x1f3a5a);
  }

  createUI() {
    super.createUI();

    const { width } = this.cameras.main;

    this.titleText = this.add.text(width / 2, 24, 'Read the number', {
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
    // All game setup happens per-level
  }

  onLevelStart() {
    // Suppress base toast
  }

  loadLevelData(levelNumber) {
    const cappedLevel = Math.max(1, Math.min(levelNumber, 6));

    const presets = {
      1: { min: 0, max: 10, step: 1 },
      2: { min: 0, max: 20, step: 2 },
      3: { min: 0, max: 50, step: 5 },
      4: { min: 0, max: 100, step: 10 },
      5: { min: 0, max: 100, step: 5 },
      6: { min: 0, max: 200, step: 20 }
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
    if (this.rulerContainer) {
      this.rulerContainer.destroy(true);
      this.rulerContainer = null;
    }

    this.choiceButtons.forEach((b) => b.destroy(true));
    this.choiceButtons = [];
  }

  generateProblem() {
    const { width, height } = this.cameras.main;
    const { min, max, step } = this.levelData;

    const tickCount = Math.floor((max - min) / step) + 1;
    const solutionIndex = Phaser.Math.Between(1, tickCount - 2);
    const solutionValue = min + solutionIndex * step;

    this.currentProblem = { min, max, step, tickCount, solutionIndex, solutionValue };
    this.questionText.setText('What number is marked in red?');

    const lineY = height * 0.52;
    const startX = width * 0.15;
    const endX = width * 0.85;

    this.rulerContainer = this.add.container(0, 0);

    const line = this.add.line(0, 0, startX, lineY, endX, lineY, 0xffffff, 1);
    line.setLineWidth(4, 4);
    this.rulerContainer.add(line);

    for (let i = 0; i < tickCount; i++) {
      const x = Phaser.Math.Linear(startX, endX, i / (tickCount - 1));
      const isMajor = i === 0 || i === tickCount - 1 || (solutionValue <= 100 && (min + i * step) % (step * 2) === 0);
      const tickH = isMajor ? 26 : 14;
      const tick = this.add.line(0, 0, x, lineY - tickH / 2, x, lineY + tickH / 2, 0xffffff, 1);
      tick.setLineWidth(3, 3);
      this.rulerContainer.add(tick);

      if (i === 0 || i === tickCount - 1) {
        const v = min + i * step;
        const label = this.add.text(x, lineY + 22, String(v), {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#ffffff'
        }).setOrigin(0.5, 0);
        this.rulerContainer.add(label);
      }
    }

    const markerX = Phaser.Math.Linear(startX, endX, solutionIndex / (tickCount - 1));
    const marker = this.add.circle(markerX, lineY - 30, 10, 0xE53935, 1);
    marker.setStrokeStyle(3, 0xffffff, 0.9);
    this.rulerContainer.add(marker);

    const choices = this.buildChoices(solutionValue, min, max, step);

    const btnY = height * 0.78;
    const btnW = 140;
    const btnH = 56;
    const gap = 16;
    const totalW = choices.length * btnW + (choices.length - 1) * gap;
    const startBtnX = width / 2 - totalW / 2 + btnW / 2;

    choices.forEach((value, index) => {
      const x = startBtnX + index * (btnW + gap);
      const btn = this.createChoiceButton(x, btnY, btnW, btnH, String(value), () => {
        this.checkAnswer(value);
      });
      this.choiceButtons.push(btn);
    });
  }

  buildChoices(correct, min, max, step) {
    const values = new Set([correct]);
    while (values.size < 4) {
      const offset = Phaser.Math.Between(-3, 3) * step;
      const v = Phaser.Math.Clamp(correct + offset, min, max);
      values.add(v);
    }
    return Phaser.Utils.Array.Shuffle(Array.from(values));
  }

  createChoiceButton(x, y, w, h, label, onClick) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0x0062FF, 1);
    bg.setStrokeStyle(3, 0xffffff, 0.9);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', onClick);

    container.add([bg, text]);
    return container;
  }

  checkAnswer(value) {
    if (!this.currentProblem) return;

    if (value === this.currentProblem.solutionValue) {
      this.addScore(10);
      this.completeLevel();
    } else {
      if (this.uiManager) {
        this.uiManager.showError('Try again', 1200);
      }
    }
  }
}
