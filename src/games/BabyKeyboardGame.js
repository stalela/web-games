import { LalelaGame } from '../utils/LalelaGame.js';

export class BabyKeyboardGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'computer',
      difficulty: 1,
      ...config
    });
  }

  preload() {
    super.preload();
    this.load.audio('bleep', 'assets/sounds/bleep.wav');
    this.load.audio('click', 'assets/sounds/audioclick.wav');
  }

  createGameObjects() {
    // No specific game objects other than UI
  }

  createUI() {
    super.createUI();
    
    // Display text centered
    this.displayText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '', {
      fontFamily: 'Arial',
      fontSize: '250px',
      color: '#0062FF', // River Blue
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 10
    }).setOrigin(0.5);

    // Instruction text
    this.add.text(this.cameras.main.centerX, 50, 'Type any key on the keyboard', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#000000',
      backgroundColor: '#ffffff88',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.createNavigationDock();
  }

  setupGameLogic() {
    this.input.keyboard.on('keydown', (event) => {
      this.handleInput(event);
    });
  }

  handleInput(event) {
    const key = event.key;
    
    // Check if it's a letter or number
    // We allow any single character that is printable
    if (key.length === 1) {
      const char = key.toUpperCase();
      this.displayText.setText(char);
      
      // Random color for fun
      const colors = ['#0062FF', '#00B378', '#F08A00', '#A74BFF', '#FF0000'];
      this.displayText.setColor(colors[Math.floor(Math.random() * colors.length)]);
      
      this.speak(char);
    } else {
      // Special keys (Enter, Space, etc.)
      this.displayText.setText('');
      this.sound.play('click');
    }
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
        this.sound.play('bleep');
    }
  }

  createNavigationDock() {
    const dockY = this.cameras.main.height - 60;
    
    // Back button
    this.add.text(50, dockY, '⬅ Back', { 
        fontSize: '24px', 
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 5 }
    })
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.scene.start('GameMenu'));
  }
}
