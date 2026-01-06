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
    
    // Load menu background
    const { width, height } = this.scale;
    this.load.svg('menu-background', 'assets/game-icons/background.svg', {
      width: width,
      height: height
    });

    // Load navigation icons
    this.load.svg('home', 'assets/game-icons/bar_home.svg');
    this.load.svg('help', 'assets/game-icons/bar_help.svg');
    this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
  }

  createBackground() {
    const { width, height } = this.scale;
    
    // Fallback sky color
    this.cameras.main.setBackgroundColor('#87CEEB');
    
    // Add the SVG background
    this.backgroundImage = this.add.image(width / 2, height, 'menu-background');
    this.backgroundImage.setOrigin(0.5, 1); // Anchored at bottom center
    this.backgroundImage.setDepth(-1);
    
    // Scale to fit width
    const scaleX = width / this.backgroundImage.width;
    this.backgroundImage.setScale(scaleX);
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
    const { width, height } = this.scale;
    const barY = height - 55;
    const buttonSize = 72;
    const spacing = 95;
    const buttonRadius = 10;

    const controls = [
      { icon: 'home', action: 'home', color: 0x0062FF },
      { icon: 'reload', action: 'reload', color: 0x00B378 },
      { icon: 'help', action: 'help', color: 0xF08A00 }
    ];

    const totalWidth = (controls.length * buttonSize) + ((controls.length - 1) * (spacing - buttonSize));
    const startX = (width - totalWidth) / 2;

    this.navButtons = [];

    controls.forEach((control, index) => {
      const x = startX + index * spacing;
      
      // Create button background
      const button = this.add.graphics();
      button.fillStyle(control.color);
      button.fillRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
      button.lineStyle(2, 0xFFFFFF, 0.8);
      button.strokeRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
      button.setInteractive(
        new Phaser.Geom.Rectangle(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize),
        Phaser.Geom.Rectangle.Contains
      );

      // Create icon
      const icon = this.add.sprite(x, barY, control.icon);
      icon.setScale((buttonSize * 0.6) / Math.max(icon.width, icon.height));
      icon.setTint(0xFFFFFF);

      // Button interactions
      button.on('pointerdown', () => {
        icon.y += 2;
        this.handleNavAction(control.action);
        this.time.delayedCall(100, () => {
          icon.y -= 2;
        });
      });

      button.on('pointerover', () => {
        this.tweens.add({ targets: icon, scale: (buttonSize * 0.65) / Math.max(icon.width, icon.height), duration: 100 });
      });

      button.on('pointerout', () => {
        this.tweens.add({ targets: icon, scale: (buttonSize * 0.6) / Math.max(icon.width, icon.height), duration: 100 });
      });

      button.setDepth(100);
      icon.setDepth(101);

      this.navButtons.push({ button, icon });
    });
  }

  handleNavAction(action) {
    switch (action) {
      case 'home':
        this.scene.start('GameMenu');
        break;
      case 'reload':
        this.scene.restart();
        break;
      case 'help':
        this.showHelpModal();
        break;
    }
  }

  showHelpModal() {
    const { width, height } = this.scale;
    
    // Semi-transparent overlay
    this.helpOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.helpOverlay.setDepth(200);
    this.helpOverlay.setInteractive();

    // Help panel
    const panelWidth = Math.min(500, width * 0.8);
    const panelHeight = 250;
    this.helpPanel = this.add.graphics();
    this.helpPanel.fillStyle(0xFFFFFF, 1);
    this.helpPanel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 20);
    this.helpPanel.setDepth(201);

    // Help title
    this.helpTitle = this.add.text(width / 2, height / 2 - 80, 'How to Play', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#0062FF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(202);

    // Help text
    this.helpText = this.add.text(width / 2, height / 2, 
      'Press any key on your keyboard!\n\nThe letter or number will appear\non screen and be spoken aloud.', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#333333',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(202);

    // Close button
    this.closeBtn = this.add.text(width / 2, height / 2 + 90, 'Close', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#0062FF',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    this.closeBtn.on('pointerdown', () => this.closeHelpModal());
    this.helpOverlay.on('pointerdown', () => this.closeHelpModal());
  }

  closeHelpModal() {
    if (this.helpOverlay) this.helpOverlay.destroy();
    if (this.helpPanel) this.helpPanel.destroy();
    if (this.helpTitle) this.helpTitle.destroy();
    if (this.helpText) this.helpText.destroy();
    if (this.closeBtn) this.closeBtn.destroy();
  }
}
