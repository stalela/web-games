import { LalelaGame } from '../utils/LalelaGame.js';

export class BalanceBoxGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'BalanceBoxGame',
      ...config,
      title: 'Balance Box',
      description: 'Balance the scale using weights.',
      category: 'math'
    });

    this.targetWeight = 0;
    this.availableWeights = [1, 2, 5, 10];
    this.placedWeights = [];
  }

  preload() {
    super.preload();
    this.load.svg('balancebox-icon', 'assets/game-icons/balancebox.svg');

    // Optional buttons from the original activity (used if needed later)
    this.load.svg('balancebox-button-normal', 'assets/balancebox/resource/button-normal.svg');
    this.load.svg('balancebox-button-pressed', 'assets/balancebox/resource/button-pressed.svg');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x243b55);
  }

  createUI() {
    super.createUI();

    const { width } = this.cameras.main;

    this.titleText = this.add.text(width / 2, 24, 'Balance the scale', {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    this.instructionText = this.add.text(width / 2, 70, '', {
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

    const targets = {
      1: { min: 3, max: 10 },
      2: { min: 6, max: 14 },
      3: { min: 10, max: 20 },
      4: { min: 15, max: 30 },
      5: { min: 20, max: 40 },
      6: { min: 25, max: 50 }
    };

    this.levelData = {
      number: cappedLevel,
      ...targets[cappedLevel]
    };
  }

  resetLevel() {
    this.clearBoard();
    this.setupBoard();
  }

  clearBoard() {
    if (this.boardContainer) {
      this.boardContainer.destroy(true);
      this.boardContainer = null;
    }

    this.placedWeights = [];
  }

  setupBoard() {
    const { width, height } = this.cameras.main;

    this.boardContainer = this.add.container(0, 0);

    // Generate solvable target
    const target = this.generateSolvableTarget(this.levelData.min, this.levelData.max);
    this.targetWeight = target;
    this.instructionText.setText(`Make the right side equal to ${target}`);

    const centerX = width / 2;
    const baseY = height * 0.58;

    // Stand
    const stand = this.add.rectangle(centerX, baseY + 140, 40, 200, 0x2c2c2c);
    const base = this.add.rectangle(centerX, baseY + 240, 360, 26, 0x2c2c2c);
    this.boardContainer.add([stand, base]);

    // Beam
    this.beam = this.add.rectangle(centerX, baseY, 420, 16, 0x404040);
    this.boardContainer.add(this.beam);

    // Pivot
    const pivot = this.add.triangle(centerX, baseY + 70, 0, 0, 40, 0, 20, 40, 0x2c2c2c);
    pivot.setOrigin(0.5, 0);
    this.boardContainer.add(pivot);

    // Plates
    this.leftPlate = this.add.rectangle(centerX - 160, baseY + 60, 180, 18, 0x8d6e63);
    this.rightPlate = this.add.rectangle(centerX + 160, baseY + 60, 180, 18, 0x8d6e63);
    this.leftPlate.setStrokeStyle(2, 0xffffff, 0.3);
    this.rightPlate.setStrokeStyle(2, 0xffffff, 0.3);
    this.boardContainer.add([this.leftPlate, this.rightPlate]);

    // Target label
    const targetLabel = this.add.text(this.leftPlate.x, this.leftPlate.y - 54, String(target), {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '44px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.boardContainer.add(targetLabel);

    // Drop zone for right plate
    this.rightDropZone = this.add.zone(this.rightPlate.x, this.rightPlate.y - 50, 220, 160);
    this.rightDropZone.setRectangleDropZone(220, 160);
    this.boardContainer.add(this.rightDropZone);

    // Weights
    const weightY = height * 0.85;
    const weightStartX = centerX - 210;
    const gap = 140;

    this.availableWeights.forEach((value, i) => {
      const x = weightStartX + i * gap;
      const weight = this.createWeight(x, weightY, value);
      this.boardContainer.add(weight);
    });

    // Check button
    this.checkButton = this.createButton(centerX, height * 0.93, 200, 56, 'Check', () => this.checkBalance());
    this.boardContainer.add(this.checkButton);

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('drop', (pointer, gameObject) => {
      this.snapToRightPlate(gameObject);
    });

    this.input.on('dragend', (pointer, gameObject, dropped) => {
      if (!dropped) {
        // If already placed, keep it; otherwise reset
        if (!gameObject.isPlaced) {
          gameObject.x = gameObject.startX;
          gameObject.y = gameObject.startY;
        }
      }

      this.updateBeamTilt();
    });
  }

  createWeight(x, y, value) {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 44, 0x0062FF, 1);
    bg.setStrokeStyle(3, 0xffffff, 0.9);

    const text = this.add.text(0, 0, String(value), {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, text]);

    container.setSize(88, 88);
    container.setInteractive({ useHandCursor: true });
    this.input.setDraggable(container);

    container.value = value;
    container.startX = x;
    container.startY = y;
    container.isPlaced = false;

    return container;
  }

  createButton(x, y, w, h, label, onClick) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0x00B378, 1);
    bg.setStrokeStyle(3, 0xffffff, 0.9);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', onClick);

    container.add([bg, text]);
    return container;
  }

  snapToRightPlate(weight) {
    // Duplicate weights allowed by dragging again from the bottom? For now, a weight can be placed once.
    if (weight.isPlaced) return;

    weight.isPlaced = true;

    const existing = this.placedWeights.length;
    const offsetX = (existing % 3) * 60 - 60;
    const offsetY = Math.floor(existing / 3) * 60;

    weight.x = this.rightPlate.x + offsetX;
    weight.y = this.rightPlate.y - 54 - offsetY;

    this.placedWeights.push(weight);
  }

  currentSum() {
    return this.placedWeights.reduce((sum, w) => sum + (w.value || 0), 0);
  }

  updateBeamTilt() {
    const sum = this.currentSum();
    const diff = Phaser.Math.Clamp(sum - this.targetWeight, -20, 20);
    const angle = Phaser.Math.DegToRad(diff * 0.7);
    this.beam.setRotation(angle);
  }

  checkBalance() {
    const sum = this.currentSum();
    this.updateBeamTilt();

    if (sum === this.targetWeight) {
      this.addScore(10);
      this.completeLevel();
    } else {
      if (this.uiManager) {
        this.uiManager.showError(`${sum} is not equal to ${this.targetWeight}`, 1500);
      }
    }
  }

  generateSolvableTarget(min, max) {
    // Build a target as a random sum of the available weights, then clamp to range.
    let target = 0;
    const picks = Phaser.Math.Between(1, 5);
    for (let i = 0; i < picks; i++) {
      target += Phaser.Utils.Array.GetRandom(this.availableWeights);
    }

    // Ensure target is in range; regenerate a few times.
    for (let tries = 0; tries < 10 && (target < min || target > max); tries++) {
      target = 0;
      const p = Phaser.Math.Between(1, 5);
      for (let i = 0; i < p; i++) {
        target += Phaser.Utils.Array.GetRandom(this.availableWeights);
      }
    }

    return Phaser.Math.Clamp(target, min, max);
  }
}
