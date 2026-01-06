import { LalelaGame } from '../utils/LalelaGame.js';

export class LeftRightClickGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'LeftRightClickGame',
      title: 'Mouse Click Training',
      description: 'Left click on fish, Right click on monkeys.',
      category: 'computer',
      ...config
    });

    this.score = 0;
    this.items = [];
    this.spawnTimer = null;
    this.helpModal = null;
  }

  preload() {
    super.preload();
    this.load.svg('lrc-fish', 'assets/left_right_click/fish.svg');
    this.load.svg('lrc-monkey', 'assets/left_right_click/monkey.svg');
    this.load.svg('lrc-pond', 'assets/left_right_click/pond.svg');
    this.load.svg('lrc-tree', 'assets/left_right_click/tree.svg');
    this.load.svg('lrc-hill', 'assets/left_right_click/hill.svg');
    this.load.svg('lrc-mouse', 'assets/left_right_click/mouse.svg');
    this.load.svg('lrc-mouse-button', 'assets/left_right_click/mouse_button.svg');
    
    // Load navigation icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach((icon) => {
        this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    const sky = this.add.rectangle(width / 2, height / 2, width, height, 0x7ed5ff).setDepth(-3);
    sky.setOrigin(0.5);

    const grass = this.add.rectangle(width / 2, height * 0.72, width, height * 0.6, 0x6fbf6a).setDepth(-2);
    grass.setOrigin(0.5, 0.5);

    const hill = this.add.image(width / 2, height, 'lrc-hill');
    hill.setOrigin(0.5, 1);
    const hillScale = Math.max(width / hill.width, 0.9);
    hill.setScale(hillScale).setDepth(-1);
    hill.y = height * 0.75;

    this.pond = this.add.image(width * 0.16, height * 0.78, 'lrc-pond')
      .setDisplaySize(width * 0.18, height * 0.12)
      .setDepth(0);

    this.tree = this.add.image(width * 0.84, height * 0.55, 'lrc-tree')
      .setDisplaySize(width * 0.12, height * 0.22)
      .setDepth(0);

    this.mouseHint = this.add.image(width * 0.5, height * 0.18, 'lrc-mouse')
      .setDisplaySize(width * 0.18, height * 0.25)
      .setDepth(1);
  }

  createUI() {
    super.createUI();
    
    // Hide default controls
    if (this.uiElements && this.uiElements.controls) {
      Object.values(this.uiElements.controls).forEach(control => {
        if (control && control.setVisible) control.setVisible(false);
      });
    }

    this.createNavigationDock(this.cameras.main.width, this.cameras.main.height);
    
    // Disable context menu on canvas to allow right click
    this.game.canvas.oncontextmenu = (e) => e.preventDefault();
  }

  setupGameLogic() {
    this.items = [];
    this.score = 0;
    const { width, height } = this.cameras.main;
    this.spawnArea = new Phaser.Geom.Rectangle(width * 0.15, height * 0.28, width * 0.7, height * 0.45);
    
    // Spawn items periodically
    this.spawnTimer = this.time.addEvent({
      delay: 2000,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true
    });
    
    // Spawn first item immediately
    this.spawnItem();
  }
  
  spawnItem() {
    const { width, height } = this.cameras.main;
    const area = this.spawnArea || new Phaser.Geom.Rectangle(width * 0.2, height * 0.25, width * 0.6, height * 0.5);

    const type = Math.random() > 0.5 ? 'fish' : 'monkey';
    const key = type === 'fish' ? 'lrc-fish' : 'lrc-monkey';
    const x = Phaser.Math.Between(area.x, area.right);
    const y = Phaser.Math.Between(area.y, area.bottom);
    
    const item = this.add.image(x, y, key).setDepth(2);
    item.setScale(0);
    item.itemType = type;
    
    // Pop in animation
    this.tweens.add({
      targets: item,
      scale: 0.9,
      duration: 500,
      ease: 'Back.out'
    });
    
    item.setInteractive();
    
    item.on('pointerdown', (pointer) => {
      this.handleItemClick(item, pointer);
    });
    
    this.items.push(item);
    
    // Limit number of items
    if (this.items.length > 10) {
      const oldItem = this.items.shift();
      oldItem.destroy();
    }
  }
  
  handleItemClick(item, pointer) {
    const isRightClick = pointer.rightButtonDown();
    const isLeftClick = pointer.leftButtonDown();
    
    let correct = false;
    let targetX, targetY;
    
    if (item.itemType === 'fish') {
      // Fish needs Left Click
      if (isLeftClick) {
        correct = true;
        targetX = this.pond.x;
        targetY = this.pond.y;
      }
    } else {
      // Monkey needs Right Click
      if (isRightClick) {
        correct = true;
        targetX = this.tree.x;
        targetY = this.tree.y;
      }
    }
    
    if (correct) {
      if (this.audioManager) this.audioManager.playSound('success');
      
      // Disable interaction
      item.disableInteractive();
      
      // Move to target
      this.tweens.add({
        targets: item,
        x: targetX,
        y: targetY,
        scale: 0.3,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          item.destroy();
          this.items = this.items.filter(i => i !== item);
        }
      });
      
      this.score++;
      if (this.score >= 10) {
        this.levelComplete();
      }
    } else {
      if (this.audioManager) this.audioManager.playSound('error');
      
      // Shake effect
      this.tweens.add({
        targets: item,
        x: item.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3
      });
      
      // Show hint
      const hintText = item.itemType === 'fish' ? 'Left Click!' : 'Right Click!';
      const hint = this.add.text(item.x, item.y - 50, hintText, {
        fontSize: '28px',
        color: '#f44336',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: hint,
        y: hint.y - 20,
        alpha: 0,
        duration: 1000,
        onComplete: () => hint.destroy()
      });
    }
  }
  
  levelComplete() {
    this.spawnTimer.remove();
    // Show completion modal or next level
    // For now, just restart
    this.time.delayedCall(2000, () => {
        this.scene.restart();
    });
  }

  shutdown() {
    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
      this.spawnTimer = null;
    }
    super.shutdown && super.shutdown();
  }

  /**
   * Create bottom navigation dock
   */
  createNavigationDock(width, height) {
    const dockY = height - 46;
    
    // Dock background pill
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.92);
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 42, width - 60, 84, 42);
    dockBg.setDepth(14);

    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(3, 0x0062FF, 1);
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 42, width - 60, 84, 42);
    dockBorder.setDepth(15);

    const controls = [
      { icon: 'help.svg', action: 'help', color: 0x00B378, label: 'Help' },
      { icon: 'home.svg', action: 'home', color: 0x0062FF, label: 'Home' },
      { icon: 'settings.svg', action: 'levels', color: 0xF08A00, label: 'Levels' },
      { icon: 'exit.svg', action: 'menu', color: 0xA74BFF, label: 'Menu' }
    ];

    const totalWidth = controls.length * 92; // 62 button + 30 spacing
    const startX = width / 2 - totalWidth / 2 + 31;

    controls.forEach((control, index) => {
      const x = startX + index * 92;
      const y = dockY;
      
      const btn = this.add.container(x, y);
      btn.setSize(62, 62);
      btn.setInteractive({ useHandCursor: true });
      btn.setDepth(20);

      const circle = this.add.circle(0, 0, 31, control.color);
      const icon = this.add.image(0, 0, control.icon.replace('.svg', ''));
      icon.setScale(0.6);
      
      btn.add([circle, icon]);
      
      btn.on('pointerdown', () => this.handleDockAction(control.action));
      
      // Hover effect
      btn.on('pointerover', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100
        });
      });
      
      btn.on('pointerout', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 100
        });
      });
    });
  }

  handleDockAction(action) {
    switch(action) {
      case 'home':
      case 'menu':
        this.scene.start('GameMenu');
        break;
      case 'help':
        this.showHelpModal();
        break;
      case 'levels':
        // Optional: Show level selector
        break;
    }
  }
  
  showHelpModal() {
    // Toggle existing modal
    if (this.helpModal) {
      this.helpModal.destroy(true);
      this.helpModal = null;
      return;
    }

    const { width, height } = this.cameras.main;
    const panelWidth = Math.min(width * 0.7, 680);
    const panelHeight = Math.min(height * 0.7, 420);

    const container = this.add.container(width / 2, height / 2).setDepth(200);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.45)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        container.destroy(true);
        this.helpModal = null;
      });

    const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0xFFFFFF)
      .setStrokeStyle(3, 0x0062FF)
      .setDepth(201)
      .setOrigin(0.5);

    const title = this.add.text(0, -panelHeight / 2 + 40, 'How to Play', {
      fontSize: '32px',
      color: '#0a0a0a',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructions = [
      'Left click the fish and send them to the pond.',
      'Right click the monkeys and send them to the tree.',
      'Score 10 correct clicks to finish the level.',
      'Use the reload button to restart anytime.'
    ];

    const text = this.add.text(-panelWidth / 2 + 40, -panelHeight / 2 + 90, instructions.join('\n'), {
      fontSize: '22px',
      color: '#222222',
      wordWrap: { width: panelWidth - 80 }
    }).setOrigin(0, 0);

    const mouseVisual = this.add.image(panelWidth / 2 - 130, 0, 'lrc-mouse')
      .setDisplaySize(panelWidth * 0.22, panelHeight * 0.4)
      .setDepth(202);

    const closeBtn = this.add.rectangle(0, panelHeight / 2 - 50, 140, 46, 0x0062FF, 1)
      .setStrokeStyle(2, 0xFFFFFF)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        container.destroy(true);
        this.helpModal = null;
      });

    const closeLabel = this.add.text(0, panelHeight / 2 - 50, 'Close', {
      fontSize: '22px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([overlay, panel, title, text, mouseVisual, closeBtn, closeLabel]);
    this.helpModal = container;
  }
}
