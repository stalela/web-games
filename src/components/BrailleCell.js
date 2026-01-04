import { getDotsForChar, getCharForDots } from '../utils/BrailleUtils.js';

export class BrailleCell extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height, isInteractive = true) {
    super(scene, x, y);
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.isInteractiveCell = isInteractive;
    
    this.dots = [];
    this.activeDots = new Set();
    
    this.createDots();
    this.scene.add.existing(this);
  }

  createDots() {
    // Braille layout:
    // 1 4
    // 2 5
    // 3 6
    
    const dotRadius = this.width / 5;
    const col1X = -this.width / 4;
    const col2X = this.width / 4;
    const row1Y = -this.height / 3;
    const row2Y = 0;
    const row3Y = this.height / 3;

    const positions = [
      { id: 1, x: col1X, y: row1Y },
      { id: 2, x: col1X, y: row2Y },
      { id: 3, x: col1X, y: row3Y },
      { id: 4, x: col2X, y: row1Y },
      { id: 5, x: col2X, y: row2Y },
      { id: 6, x: col2X, y: row3Y }
    ];

    positions.forEach(pos => {
      // Background for dot (hole)
      const bg = this.scene.add.circle(pos.x, pos.y, dotRadius, 0xFFFFFF);
      bg.setStrokeStyle(2, 0x000000);
      
      // The dot itself (initially invisible/off)
      const dot = this.scene.add.circle(pos.x, pos.y, dotRadius - 4, 0x000000);
      dot.setVisible(false);
      
      // Interaction zone
      const zone = this.scene.add.zone(pos.x, pos.y, dotRadius * 2.5, dotRadius * 2.5);
      
      if (this.isInteractiveCell) {
        zone.setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => this.toggleDot(pos.id, dot));
      }

      this.add([bg, dot, zone]);
      this.dots.push({ id: pos.id, sprite: dot });
    });
  }

  toggleDot(id, sprite) {
    if (this.activeDots.has(id)) {
      this.activeDots.delete(id);
      sprite.setVisible(false);
    } else {
      this.activeDots.add(id);
      sprite.setVisible(true);
    }
    this.emit('change', Array.from(this.activeDots));
  }

  setChar(char) {
    this.reset();
    const dots = getDotsForChar(char);
    dots.forEach(id => {
      this.activeDots.add(id);
      const dotObj = this.dots.find(d => d.id === id);
      if (dotObj) dotObj.sprite.setVisible(true);
    });
  }

  reset() {
    this.activeDots.clear();
    this.dots.forEach(d => d.sprite.setVisible(false));
  }

  getDots() {
    return Array.from(this.activeDots).sort((a, b) => a - b);
  }
  
  getChar() {
      return getCharForDots(this.getDots());
  }
}
