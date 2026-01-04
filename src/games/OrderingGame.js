import { LalelaGame } from '../utils/LalelaGame.js';

export class OrderingGame extends LalelaGame {
  constructor(config) {
    super(config);
    this.mode = config.mode; // 'numbers', 'sentences', 'chronology'
    this.levels = config.levels || [];
    this.currentLevelIndex = 0;
    this.draggables = [];
    this.slots = [];
  }

  preload() {
    super.preload();
    this.load.image('hillside', 'assets/ordering_alphabets/hillside.svg');
    
    // Load chronology images if needed
    if (this.mode === 'chronology') {
      this.levels.forEach(level => {
        level.items.forEach(item => {
          // item is like 'garden-01.svg'
          // We assume assets are in 'assets/ordering_chronology/'
          const key = item.replace('.svg', '');
          this.load.image(key, `assets/ordering_chronology/${item}`);
        });
      });
    }
  }

  create() {
    super.create();
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'hillside')
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.createUI();
    this.startLevel();
  }

  startLevel() {
    const level = this.levels[this.currentLevelIndex];
    let items = [];

    if (this.mode === 'numbers') {
      // Generate numbers
      const min = level.min || 1;
      const max = level.max || 10;
      const count = level.count || 5;
      const uniqueNumbers = new Set();
      while (uniqueNumbers.size < count) {
        uniqueNumbers.add(Phaser.Math.Between(min, max));
      }
      items = Array.from(uniqueNumbers);
      if (level.order === 'descending') {
        items.sort((a, b) => b - a);
      } else {
        items.sort((a, b) => a - b);
      }
    } else {
      items = [...level.items];
    }

    this.correctOrder = [...items];
    const shuffled = Phaser.Utils.Array.Shuffle([...items]);

    // Clear previous
    this.draggables.forEach(d => d.destroy());
    this.slots.forEach(s => s.destroy());
    this.draggables = [];
    this.slots = [];

    const startX = 100;
    const gap = (this.cameras.main.width - 200) / items.length;
    const y = this.cameras.main.centerY - 100;

    // Create slots (targets)
    items.forEach((item, index) => {
      const x = startX + index * gap + gap / 2;
      
      // Slot visual
      const slot = this.add.rectangle(x, y, 100, 100, 0xffffff, 0.3)
        .setStrokeStyle(2, 0xffffff);
      slot.index = index;
      slot.setInteractive({ dropZone: true });
      
      this.slots.push(slot);
    });

    // Create draggables (shuffled)
    shuffled.forEach((item, index) => {
      // Random position at bottom
      const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
      const yPos = this.cameras.main.height - 150;

      const container = this.add.container(x, yPos);
      
      const bg = this.add.rectangle(0, 0, 90, 90, 0x3498db).setStrokeStyle(2, 0x2980b9);
      
      let content;
      if (this.mode === 'chronology') {
        const key = item.replace('.svg', '');
        content = this.add.image(0, 0, key).setDisplaySize(80, 80);
      } else {
        content = this.add.text(0, 0, item, {
          fontSize: this.mode === 'sentences' ? '24px' : '48px',
          color: '#ffffff',
          fontFamily: 'Fredoka One'
        }).setOrigin(0.5);
      }
      
      container.add([bg, content]);
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

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      gameObject.x = dropZone.x;
      gameObject.y = dropZone.y;
      
      // Check if all are placed
      this.checkCompletion();
    });
  }

  checkCompletion() {
    // Simple check: are all slots occupied by the correct item?
    // This is a bit tricky because we need to know which item is in which slot.
    // A better way is to check if the item in slot i matches correctOrder[i].
    
    let correctCount = 0;
    let placedCount = 0;

    this.slots.forEach((slot, index) => {
      // Find draggable overlapping with slot
      const draggable = this.draggables.find(d => 
        Phaser.Math.Distance.Between(d.x, d.y, slot.x, slot.y) < 50
      );

      if (draggable) {
        placedCount++;
        if (draggable.item === this.correctOrder[index]) {
          correctCount++;
        }
      }
    });

    if (placedCount === this.correctOrder.length) {
      if (correctCount === this.correctOrder.length) {
        this.audioManager.play('success');
        this.time.delayedCall(1000, () => {
          this.currentLevelIndex++;
          if (this.currentLevelIndex < this.levels.length) {
            this.startLevel();
          } else {
            this.scene.start('GameMenu');
          }
        });
      } else {
        // Optional: Feedback for incorrect placement
      }
    }
  }
}
