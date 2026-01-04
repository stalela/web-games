import { LalelaGame } from '../utils/LalelaGame.js';

export class GnumchGame extends LalelaGame {
  constructor(config) {
    super({
      title: 'Gnumch',
      description: 'Click the correct numbers before they escape!',
      category: 'math',
      ...config
    });

    this.round = 0;
    this.roundsPerLevel = 5;
    this.targetValue = 0;
    this.ruleText = '';

    this.creatures = [];
    this.correctRemaining = 0;
  }

  preload() {
    super.preload();
  }

  createBackground() {
    const { width, height } = this.game.config;
    // Slightly "arcade" background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f1b2a);
  }

  createUI() {
    super.createUI();

    const { width } = this.cameras.main;

    this.titleText = this.add.text(width / 2, 22, this.gameConfig.title || 'Gnumch', {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    this.instructionText = this.add.text(width / 2, 68, '', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    this.targetText = this.add.text(width / 2, 108, '', {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '42px',
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
      1: { min: 1, max: 10 },
      2: { min: 1, max: 20 },
      3: { min: 1, max: 50 },
      4: { min: 1, max: 100 },
      5: { min: 1, max: 200 },
      6: { min: 1, max: 500 }
    };

    this.levelData = {
      number: cappedLevel,
      ...presets[cappedLevel]
    };
  }

  resetLevel() {
    this.round = 0;
    this.startRound();
  }

  startRound() {
    this.clearCreatures();

    this.round += 1;
    if (this.round > this.roundsPerLevel) {
      this.completeLevel();
      return;
    }

    const { min, max } = this.levelData;

    const { targetValue, ruleText } = this.generateRoundRule(min, max);
    this.targetValue = targetValue;
    this.ruleText = ruleText;

    this.instructionText.setText(ruleText);
    this.targetText.setText(`Target: ${targetValue}`);

    const count = 10;
    const values = this.generateCreatureValues(targetValue, count, min, max);

    this.correctRemaining = 0;

    values.forEach((value, index) => {
      const creature = this.spawnCreature(index, count, value);
      const isCorrect = this.isCorrectValue(value, targetValue);
      creature.isCorrect = isCorrect;
      if (isCorrect) this.correctRemaining += 1;

      this.creatures.push(creature);
    });

    // Safety: always ensure at least 1 correct
    if (this.correctRemaining === 0 && this.creatures.length > 0) {
      this.creatures[0].isCorrect = true;
      this.correctRemaining = 1;
    }
  }

  clearCreatures() {
    this.creatures.forEach((c) => c.destroy(true));
    this.creatures = [];
    this.correctRemaining = 0;
  }

  spawnCreature(index, total, value) {
    const { width, height } = this.cameras.main;

    const areaTop = 180;
    const areaBottom = height - 120;

    const x = Phaser.Math.Between(80, width - 80);
    const y = Phaser.Math.Between(areaTop, areaBottom);

    const container = this.add.container(x, y);

    const body = this.add.circle(0, 0, 34, 0x0062FF, 1);
    body.setStrokeStyle(3, 0xffffff, 0.8);

    const text = this.add.text(0, 0, String(value), {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([body, text]);
    container.setSize(70, 70);

    container.value = value;
    container.bodyCircle = body;
    container.textLabel = text;

    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.handleCreatureClick(container));

    // Simple drifting motion
    const vx = Phaser.Math.Between(-60, 60);
    const vy = Phaser.Math.Between(-40, 40);

    container.vx = vx;
    container.vy = vy;

    return container;
  }

  handleCreatureClick(creature) {
    if (!creature || creature.clicked) return;
    creature.clicked = true;

    if (creature.isCorrect) {
      creature.bodyCircle.setFillStyle(0x00B378, 1);
      this.addScore(5);
      this.correctRemaining -= 1;

      if (this.correctRemaining <= 0) {
        this.time.delayedCall(600, () => this.startRound());
      }
    } else {
      creature.bodyCircle.setFillStyle(0xE53935, 1);
      if (this.uiManager) {
        this.uiManager.showError('Wrong!', 900);
      }
    }
  }

  update(time, delta) {
    super.update?.(time, delta);

    const dt = delta / 1000;
    const { width, height } = this.cameras.main;

    const minX = 50;
    const maxX = width - 50;
    const minY = 180;
    const maxY = height - 120;

    for (const c of this.creatures) {
      if (!c || c.clicked) continue;

      c.x += c.vx * dt;
      c.y += c.vy * dt;

      if (c.x < minX || c.x > maxX) c.vx *= -1;
      if (c.y < minY || c.y > maxY) c.vy *= -1;
    }
  }

  // --- Hooks for variants ---

  generateRoundRule(min, max) {
    // Override in variants
    const targetValue = Phaser.Math.Between(min, max);
    return { targetValue, ruleText: 'Click the correct numbers' };
  }

  isCorrectValue(value, targetValue) {
    // Override in variants
    return value === targetValue;
  }

  generateCreatureValues(targetValue, count, min, max) {
    // Override in variants
    const values = new Set([targetValue]);
    while (values.size < count) {
      values.add(Phaser.Math.Between(min, max));
    }
    return Array.from(values);
  }
}
