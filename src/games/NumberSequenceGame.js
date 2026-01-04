import { LalelaGame } from '../utils/LalelaGame.js';

export class NumberSequenceGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'NumberSequenceGame',
      title: 'Number Sequence',
      category: 'math',
      description: 'Connect the numbers in order to reveal the picture.',
      ...config
    });

    // Data from number_sequence_dataset.js
    this.levels = [
      {
        "imageName1": "dn_fond1",
        "imageName2": "dn_fond2",
        "coordinates": [[267,121],[349,369],[139,216],[397,214],[190,369],[267,121]]
      },
      {
        "imageName1": "de1",
        "imageName2": "de2",
        "coordinates": [[104,275],[106,171],[203,133],[288,178],[288,237],[311,211],[427,220],[428,324],[382,386],[260,374],[260,297],[195,323],[104,275]]
      },
      {
        "imageName1": "house1",
        "imageName2": "house2",
        "coordinates": [[306,360],[412,360],[413,175],[356,120],[355,70],[330,70],[330,96],[272,40],[119,177],[120,361],[253,361],[252,276],[306,276],[306,360]]
      }
    ];
    
    this.currentLevelIndex = 0;
    this.nextNumber = 1;
    this.dots = [];
    this.lines = null;
  }

  preload() {
    super.preload();
    this.levels.forEach(level => {
      this.load.image(level.imageName1, `assets/number_sequence/${level.imageName1}.svg`);
      this.load.image(level.imageName2, `assets/number_sequence/${level.imageName2}.svg`);
    });
    this.load.image('greenpoint', 'assets/number_sequence/greenpoint.svg');
  }

  create() {
    super.create();
    this.lines = this.add.graphics();
    this.startLevel();
  }

  startLevel() {
    const level = this.levels[this.currentLevelIndex];
    this.nextNumber = 1;
    
    // Clear previous
    if (this.bgImage) this.bgImage.destroy();
    this.dots.forEach(d => d.destroy());
    this.dots = [];
    this.lines.clear();

    // Background (faded/partial)
    // Scale to fit
    this.bgImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, level.imageName1);
    const scale = Math.min(this.cameras.main.width / this.bgImage.width, this.cameras.main.height / this.bgImage.height) * 0.8;
    this.bgImage.setScale(scale);
    
    // Calculate offset to center the coordinates
    // Coordinates in dataset seem to be absolute for a specific resolution (likely 800x600 or similar)
    // We need to map them to our scaled image
    
    // Assuming original coords are based on ~600x500 area?
    // Let's just use relative positioning based on the image size if possible, 
    // but the coords are likely pixel values.
    // We'll assume the coords match the image size.
    
    const offsetX = this.bgImage.x - (this.bgImage.width * scale) / 2;
    const offsetY = this.bgImage.y - (this.bgImage.height * scale) / 2;

    level.coordinates.forEach((coord, index) => {
      // Skip the last one if it's a loop closer (same as first)
      if (index === level.coordinates.length - 1 && 
          coord[0] === level.coordinates[0][0] && 
          coord[1] === level.coordinates[0][1]) {
        return;
      }

      // Map coords (assuming original image size matches coords space)
      // This might need adjustment if coords are not relative to image 0,0
      // But usually in GCompris they are relative to the board.
      // Let's try direct mapping first, maybe scaling.
      
      // Actually, let's just place them relative to the screen center for now
      // The coords look like 0-500 range.
      
      const x = coord[0] * 1.5; // Rough scaling
      const y = coord[1] * 1.5;
      
      const dot = this.add.image(x, y, 'greenpoint').setScale(0.5);
      dot.setInteractive({ useHandCursor: true });
      dot.number = index + 1;
      
      const text = this.add.text(x, y - 20, (index + 1).toString(), {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      dot.text = text;
      
      dot.on('pointerdown', () => this.handleDotClick(dot));
      
      this.dots.push(dot);
    });
  }

  handleDotClick(dot) {
    if (dot.number === this.nextNumber) {
      this.audioManager.play('click');
      
      // Draw line from previous
      if (this.nextNumber > 1) {
        const prevDot = this.dots[this.nextNumber - 2];
        this.lines.lineStyle(4, 0x00ff00);
        this.lines.beginPath();
        this.lines.moveTo(prevDot.x, prevDot.y);
        this.lines.lineTo(dot.x, dot.y);
        this.lines.strokePath();
      }
      
      dot.setTint(0x00ff00); // Highlight
      this.nextNumber++;
      
      if (this.nextNumber > this.dots.length) {
        // Close the loop
        const firstDot = this.dots[0];
        const lastDot = dot;
        this.lines.lineStyle(4, 0x00ff00);
        this.lines.beginPath();
        this.lines.moveTo(lastDot.x, lastDot.y);
        this.lines.lineTo(firstDot.x, firstDot.y);
        this.lines.strokePath();
        
        this.handleWin();
      }
    } else {
      this.audioManager.play('error');
    }
  }

  handleWin() {
    this.audioManager.play('success');
    
    // Show full image
    const level = this.levels[this.currentLevelIndex];
    this.bgImage.setTexture(level.imageName2);
    this.bgImage.setAlpha(0);
    
    this.tweens.add({
      targets: this.bgImage,
      alpha: 1,
      duration: 1000
    });
    
    // Hide dots
    this.dots.forEach(d => {
      d.setVisible(false);
      d.text.setVisible(false);
    });
    this.lines.clear();

    this.time.delayedCall(2000, () => {
      this.currentLevelIndex = (this.currentLevelIndex + 1) % this.levels.length;
      this.startLevel();
    });
  }
}
