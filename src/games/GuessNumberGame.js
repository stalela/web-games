import { LalelaGame } from '../utils/LalelaGame.js';

export class GuessNumberGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'GuessNumberGame',
      title: 'Guess the Number',
      description: 'Help the helicopter find the exit by guessing the number.',
      category: 'math',
      ...config
    });

    this.min = 1;
    this.max = 100;
    this.targetNumber = 0;
    this.guesses = 0;
  }

  preload() {
    super.preload();
    this.load.svg('cave', 'assets/guessnumber/resource/cave.svg');
    this.load.svg('helico', 'assets/guessnumber/resource/tuxhelico.svg');
    this.load.audio('helicopter', 'assets/guessnumber/resource/helicopter.wav');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x5a3820); // Brown background
    
    // Cave image aligned to right
    const cave = this.add.image(width, height / 2, 'cave');
    cave.setOrigin(1, 0.5);
    // Scale to fit height
    const scale = height / cave.height;
    cave.setScale(scale);
  }

  createUI() {
    super.createUI();
    const { width, height } = this.game.config;

    // Helicopter
    this.helico = this.add.image(100, height / 2, 'helico');
    this.helico.setScale(0.5);

    // Instructions / Feedback
    this.feedbackText = this.add.text(width / 2, 50, '', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Input area
    // Move up to ensure it fits on screen (numpad height is approx 280px)
    this.createInput(width / 2, height - 180);
  }

  createInput(x, y) {
    // Simple virtual numpad or text input?
    // Let's use a DOM input for simplicity if possible, or a custom numpad.
    // Custom numpad is better for game feel.
    
    const numpadContainer = this.add.container(x, y);
    
    // Display current input
    this.inputText = this.add.text(0, -150, '', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    numpadContainer.add(this.inputText);

    // Numpad buttons
    const keys = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      'C', '0', 'OK'
    ];

    const btnSize = 60;
    const spacing = 10;
    
    keys.forEach((key, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const bx = (col - 1) * (btnSize + spacing);
      const by = (row - 1.5) * (btnSize + spacing); // Centered vertically around 0

      const btn = this.add.rectangle(bx, by, btnSize, btnSize, 0x333333)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.onKey(key));
      
      const txt = this.add.text(bx, by, key, {
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0.5);

      numpadContainer.add([btn, txt]);
    });
    
    this.currentInput = '';
  }

  onKey(key) {
    if (key === 'C') {
      this.currentInput = '';
    } else if (key === 'OK') {
      this.submitGuess();
    } else {
      if (this.currentInput.length < 4) {
        this.currentInput += key;
      }
    }
    this.inputText.setText(this.currentInput);
  }

  setupGameLogic() {
    // Level 1: 1-10, Level 2: 1-20, etc.
    // Or use presets
  }

  loadLevelData(levelNumber) {
    const maxes = [10, 20, 50, 100, 200, 500, 1000];
    this.max = maxes[Math.min(levelNumber - 1, maxes.length - 1)] || 100;
    this.min = 1;
    
    this.targetNumber = Phaser.Math.Between(this.min, this.max);
    this.guesses = 0;
    this.currentInput = '';
    if (this.inputText) this.inputText.setText('');
    if (this.feedbackText) this.feedbackText.setText(`Guess a number between ${this.min} and ${this.max}`);
    
    // Reset helico
    if (this.helico) {
      this.helico.x = 100;
      this.helico.y = this.game.config.height / 2;
    }
  }

  submitGuess() {
    const val = parseInt(this.currentInput);
    if (isNaN(val)) return;

    this.guesses++;
    
    if (val === this.targetNumber) {
      this.feedbackText.setText('Correct! You found it!');
      this.sound.play('helicopter');
      
      // Move helico to exit
      this.tweens.add({
        targets: this.helico,
        x: this.game.config.width + 100,
        duration: 2000,
        onComplete: () => this.completeLevel()
      });
    } else {
      const diff = (this.targetNumber - val) / this.targetNumber; // Normalized diff?
      // Visual feedback: move helico up/down based on high/low
      // If too high (val > target), helico should go down? Or up?
      // Usually "Too High" means guess is above target.
      // Let's just use text first.
      
      if (val > this.targetNumber) {
        this.feedbackText.setText('Too High!');
        // Move helico down (y increases)
        this.tweens.add({
          targets: this.helico,
          y: Math.min(this.game.config.height - 50, this.helico.y + 50),
          duration: 500
        });
      } else {
        this.feedbackText.setText('Too Low!');
        // Move helico up (y decreases)
        this.tweens.add({
          targets: this.helico,
          y: Math.max(50, this.helico.y - 50),
          duration: 500
        });
      }
      
      // Move forward slightly
      this.tweens.add({
        targets: this.helico,
        x: Math.min(this.game.config.width - 200, this.helico.x + 50),
        duration: 500
      });
    }
    
    this.currentInput = '';
    this.inputText.setText('');
  }
}
