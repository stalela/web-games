import { LalelaGame } from '../utils/LalelaGame.js';

export class GraduatedLineUseGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'GraduatedLineUseGame',
      ...config,
      title: 'Graduated Line (Use)',
      description: 'Place the mark at the correct value on a graduated number line.',
      category: 'math'
    });

    this.currentProblem = null;
  }

  preload() {
    super.preload();
    this.load.svg('graduated_line_use-icon', 'assets/game-icons/graduated_line_use.svg');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x1f3a5a);
  }

  createUI() {
    super.createUI();

    const { width } = this.cameras.main;

    this.titleText = this.add.text(width / 2, 24, 'Place the mark', {
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
    this.currentProblem = null;
  }

  generateProblem() {
    const { width, height } = this.cameras.main;
    const { min, max, step } = this.levelData;

    const tickCount = Math.floor((max - min) / step) + 1;
    const solutionIndex = Phaser.Math.Between(1, tickCount - 2);
    const solutionValue = min + solutionIndex * step;

    const lineY = height * 0.52;
    const startX = width * 0.15;
    const endX = width * 0.85;

    this.currentProblem = { min, max, step, tickCount, solutionIndex, solutionValue, startX, endX, lineY };
    this.questionText.setText(`Click where ${solutionValue} is.`);

    this.rulerContainer = this.add.container(0, 0);

    const line = this.add.line(0, 0, startX, lineY, endX, lineY, 0xffffff, 1);
    line.setLineWidth(4, 4);
    this.rulerContainer.add(line);

    for (let i = 0; i < tickCount; i++) {
      const x = Phaser.Math.Linear(startX, endX, i / (tickCount - 1));
      const tickH = (i === 0 || i === tickCount - 1) ? 28 : 14;
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

    this.selectionMarker = this.add.circle(startX, lineY - 30, 10, 0xE53935, 1);
    this.selectionMarker.setStrokeStyle(3, 0xffffff, 0.9);
    this.selectionMarker.setAlpha(0);
    this.rulerContainer.add(this.selectionMarker);

    const hitZone = this.add.rectangle((startX + endX) / 2, lineY, endX - startX, 60, 0x000000, 0);
    hitZone.setInteractive({ useHandCursor: true });
    hitZone.on('pointerdown', (pointer) => this.handleLineClick(pointer.x));
    this.rulerContainer.add(hitZone);
  }

  handleLineClick(x) {
    if (!this.currentProblem) return;

    const { startX, endX, tickCount, min, step, solutionValue, lineY } = this.currentProblem;

    const clamped = Phaser.Math.Clamp(x, startX, endX);
    const ratio = (clamped - startX) / (endX - startX);
    const idx = Phaser.Math.Clamp(Math.round(ratio * (tickCount - 1)), 0, tickCount - 1);
    const value = min + idx * step;

    const markerX = Phaser.Math.Linear(startX, endX, idx / (tickCount - 1));
    this.selectionMarker.setPosition(markerX, lineY - 30);
    this.selectionMarker.setAlpha(1);

    if (value === solutionValue) {
      this.addScore(10);
      this.completeLevel();
    } else {
      if (this.uiManager) {
        this.uiManager.showError('Try again', 1200);
      }
    }
  }
}
