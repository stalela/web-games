import { LalelaGame } from '../utils/LalelaGame.js';

export class LearnDecimalsGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'LearnDecimalsGame',
      ...config,
      title: 'Learn Decimals',
      description: 'Learn to read decimal values by selecting them on a bar.',
      category: 'math'
    });

    this.currentProblem = null;
  }

  preload() {
    super.preload();
    this.load.svg('learn_decimals-icon', 'assets/game-icons/learn_decimals.svg');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x16324f);
  }

  createUI() {
    super.createUI();

    const { width } = this.cameras.main;

    this.titleText = this.add.text(width / 2, 24, 'Learn decimals', {
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
      2: { step: 0.05 },
      3: { step: 0.01 }
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
    if (this.barContainer) {
      this.barContainer.destroy(true);
      this.barContainer = null;
    }
    this.currentProblem = null;
  }

  generateProblem() {
    const { width, height } = this.cameras.main;
    const step = this.levelData.step;
    const denominator = Math.round(1 / step);

    const targetIndex = Phaser.Math.Between(1, denominator - 1);
    const targetValue = targetIndex * step;

    this.currentProblem = { step, denominator, targetIndex, targetValue };
    this.questionText.setText(`Click on ${targetValue.toFixed(step < 0.1 ? 2 : 1)} on the bar.`);

    const barW = Math.min(720, width * 0.8);
    const barH = 50;
    const barX = width / 2 - barW / 2;
    const barY = height * 0.5;

    this.barContainer = this.add.container(0, 0);

    const border = this.add.rectangle(width / 2, barY, barW + 8, barH + 8, 0xffffff, 0.15);
    border.setStrokeStyle(3, 0xffffff, 0.8);
    this.barContainer.add(border);

    for (let i = 0; i < denominator; i++) {
      const segX = barX + (i + 0.5) * (barW / denominator);
      const seg = this.add.rectangle(segX, barY, barW / denominator - 2, barH - 2, 0xffffff, 0.12);
      seg.setStrokeStyle(1, 0xffffff, 0.35);
      this.barContainer.add(seg);

      if (denominator <= 20 || i % Math.floor(denominator / 10) === 0) {
        const label = this.add.text(segX, barY + 40, (i * step).toFixed(step < 0.1 ? 2 : 1), {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffffff'
        }).setOrigin(0.5, 0);
        this.barContainer.add(label);
      }
    }

    this.selectionMarker = this.add.triangle(barX, barY - 40, 0, 0, 18, 0, 9, 18, 0xE53935, 1);
    this.selectionMarker.setAlpha(0);
    this.barContainer.add(this.selectionMarker);

    const hitZone = this.add.rectangle(width / 2, barY, barW, barH + 20, 0x000000, 0);
    hitZone.setInteractive({ useHandCursor: true });
    hitZone.on('pointerdown', (pointer) => this.handleBarClick(pointer.x, barX, barW));
    this.barContainer.add(hitZone);
  }

  handleBarClick(x, barX, barW) {
    if (!this.currentProblem) return;

    const { denominator, step, targetIndex } = this.currentProblem;

    const clamped = Phaser.Math.Clamp(x, barX, barX + barW);
    const ratio = (clamped - barX) / barW;
    const idx = Phaser.Math.Clamp(Math.round(ratio * denominator), 0, denominator);

    const chosenIndex = Phaser.Math.Clamp(idx, 0, denominator);
    const chosenValue = chosenIndex * step;

    const markerX = barX + chosenIndex * (barW / denominator);
    this.selectionMarker.setPosition(markerX - 9, this.cameras.main.height * 0.5 - 40);
    this.selectionMarker.setAlpha(1);

    if (chosenIndex === targetIndex) {
      this.addScore(10);
      this.completeLevel();
    } else {
      if (this.uiManager) {
        this.uiManager.showError(`That was ${chosenValue.toFixed(step < 0.1 ? 2 : 1)}`, 1400);
      }
    }
  }
}
