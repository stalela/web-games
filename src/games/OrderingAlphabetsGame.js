import { LalelaGame } from '../utils/LalelaGame.js';

export class OrderingAlphabetsGame extends LalelaGame {
  constructor(config = {}) {
    super({
      key: 'OrderingAlphabetsGame',
      title: 'Ordering Alphabets',
      category: 'reading',
      description: 'Put the letters in the correct order.',
      ...config
    });

    this.levels = [
      { items: ['A', 'B', 'C', 'D', 'E'] },
      { items: ['F', 'G', 'H', 'I', 'J'] },
      { items: ['K', 'L', 'M', 'N', 'O'] },
      { items: ['P', 'Q', 'R', 'S', 'T'] },
      { items: ['U', 'V', 'W', 'X', 'Y', 'Z'] }
    ];
    this.currentLevelIndex = 0;
    this.draggables = [];
    this.slots = [];
  }

  preload() {
    super.preload();
    this.load.image('hillside', 'assets/ordering_alphabets/hillside.svg');
  }

  create() {
    super.create();
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'hillside')
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.startLevel();
  }

  startLevel() {
    const level = this.levels[this.currentLevelIndex];
    const items = [...level.items]; // Copy
    const shuffled = Phaser.Utils.Array.Shuffle([...items]);

    // Clear previous
    this.draggables.forEach(d => d.destroy());
    this.slots.forEach(s => s.destroy());
    this.draggables = [];
    this.slots = [];

    const startX = 100;
    const gap = 120;
    const y = this.cameras.main.centerY;

    // Create slots (targets)
    items.forEach((item, index) => {
      const x = startX + index * gap;
      
      // Slot visual
      const slot = this.add.rectangle(x, y, 100, 100, 0xffffff, 0.3)
        .setStrokeStyle(2, 0xffffff);
      slot.item = item; // The expected item
      slot.setInteractive({ dropZone: true });
      
      this.slots.push(slot);
    });

    // Create draggables (shuffled)
    shuffled.forEach((item, index) => {
      // Random position at bottom
      const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
      const yPos = this.cameras.main.height - 100;

      const container = this.add.container(x, yPos);
      
      const bg = this.add.rectangle(0, 0, 90, 90, 0x3498db).setStrokeStyle(2, 0x2980b9);
      const text = this.add.text(0, 0, item, {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Fredoka One'
      }).setOrigin(0.5);
      
      container.add([bg, text]);
      container.setSize(90, 90);
      container.setInteractive({ draggable: true });
      container.item = item;
      
      this.input.setDraggable(container);
      
      container.on('drag', (pointer, dragX, dragY) => {
        container.x = dragX;
        container.y = dragY;
      });

      container.on('dragend', (pointer, dragX, dragY, dropped) => {
        if (!dropped) {
          this.tweens.add({
            targets: container,
            x: container.input.dragStartX,
            y: container.input.dragStartY,
            duration: 300
          });
        }
      });

      this.draggables.push(container);
    });

    // Drop logic
    this.input.on('drop', (pointer, gameObject, dropZone) => {
      if (gameObject.item === dropZone.item) {
        // Correct
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.input.enabled = false;
        dropZone.setStrokeStyle(4, 0x00ff00);
        this.audioManager.play('success');
        this.checkWin();
      } else {
        // Incorrect
        this.tweens.add({
          targets: gameObject,
          x: gameObject.input.dragStartX,
          y: gameObject.input.dragStartY,
          duration: 300
        });
        this.audioManager.play('error');
      }
    });
  }

  checkWin() {
    const allPlaced = this.draggables.every(d => !d.input.enabled);
    if (allPlaced) {
      this.time.delayedCall(1000, () => {
        this.currentLevelIndex = (this.currentLevelIndex + 1) % this.levels.length;
        this.startLevel();
      });
    }
  }
}
