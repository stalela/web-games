import { LalelaGame } from '../utils/LalelaGame.js';

export class GlettersGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'GlettersGame',
      title: 'Falling Letters',
      description: 'Type the falling letters before they hit the ground!',
      category: 'reading',
      ...config
    });

    this.words = [];
    this.fallingItems = [];
    this.spawnTimer = null;
    this.speed = 100;
  }

  preload() {
    super.preload();
    this.load.json('gletters-data', 'assets/gletters/resource/default-en.json');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
  }

  createUI() {
    super.createUI();
    // Score is handled by base class
  }

  setupGameLogic() {
    const data = this.cache.json.get('gletters-data');
    if (data) {
      // Parse data. Structure might be complex.
      // If it's GCompris format, it might be:
      // [ { "objective": "...", "words": [...] }, ... ]
      // Or wrapped in an object.
      // Let's assume array of levels.
      this.levelDataRaw = data;
      
      // Input handling
      this.input.keyboard.on('keydown', (event) => {
        this.checkInput(event.key);
      });

      this.startGame();
    }
  }

  loadLevelData(levelNumber) {
    if (!this.levelDataRaw) return;
    
    // GCompris levels are 1-based in UI, 0-based in array usually.
    const levelIndex = (levelNumber - 1) % this.levelDataRaw.length;
    const level = this.levelDataRaw[levelIndex];
    
    if (level && level.words) {
      this.words = level.words;
    } else {
      // Fallback
      this.words = ['a', 'b', 'c', 'd', 'e'];
    }

    this.speed = 100 + (levelNumber * 20);
    this.fallingItems.forEach(item => item.destroy());
    this.fallingItems = [];
    
    if (this.spawnTimer) this.spawnTimer.remove();
    
    this.spawnTimer = this.time.addEvent({
      delay: 2000 - (levelNumber * 100),
      callback: this.spawnLetter,
      callbackScope: this,
      loop: true
    });
  }

  spawnLetter() {
    const { width } = this.game.config;
    const letter = Phaser.Utils.Array.GetRandom(this.words);
    const x = Phaser.Math.Between(50, width - 50);
    
    const text = this.add.text(x, -50, letter, {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.physics.add.existing(text);
    text.body.setVelocityY(this.speed);
    
    text.letter = letter;
    this.fallingItems.push(text);
  }

  update(time, delta) {
    super.update(time, delta);
    
    const { height } = this.game.config;
    
    // Check for missed letters
    for (let i = this.fallingItems.length - 1; i >= 0; i--) {
      const item = this.fallingItems[i];
      if (item.y > height) {
        item.destroy();
        this.fallingItems.splice(i, 1);
        // Penalty?
        this.cameras.main.shake(200, 0.01);
      }
    }
  }

  checkInput(key) {
    // Find matching letter
    // Prioritize lowest?
    let matchIndex = -1;
    let maxY = -1;

    for (let i = 0; i < this.fallingItems.length; i++) {
      const item = this.fallingItems[i];
      // Case insensitive?
      if (item.letter.toLowerCase() === key.toLowerCase()) {
        if (item.y > maxY) {
          maxY = item.y;
          matchIndex = i;
        }
      }
    }

    if (matchIndex !== -1) {
      const item = this.fallingItems[matchIndex];
      
      // Visual effect
      this.add.text(item.x, item.y, '✨', { fontSize: '32px' }).setOrigin(0.5);
      
      item.destroy();
      this.fallingItems.splice(matchIndex, 1);
      this.addScore(10);
      
      // Check level completion?
      // Maybe time based or count based.
      // For now, infinite until user quits or we add a counter.
      // Let's add a counter.
      this.correctCount = (this.correctCount || 0) + 1;
      if (this.correctCount >= 10) {
        this.correctCount = 0;
        this.completeLevel();
      }
    }
  }
}
