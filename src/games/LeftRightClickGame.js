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
  }

  preload() {
    super.preload();
    this.load.svg('lrc-fish', 'assets/left_right_click/fish.svg');
    this.load.svg('lrc-monkey', 'assets/left_right_click/monkey.svg');
    this.load.svg('lrc-pond', 'assets/left_right_click/pond.svg');
    this.load.svg('lrc-tree', 'assets/left_right_click/tree.svg');
    this.load.svg('lrc-hill', 'assets/left_right_click/hill.svg');
    
    // Load navigation icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach((icon) => {
        this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    
    // Sky
    this.add.rectangle(width/2, height/2, width, height, 0x87CEEB).setDepth(-2);
    
    // Hill
    const hill = this.add.image(width/2, height, 'lrc-hill');
    hill.setOrigin(0.5, 1);
    const scale = width / hill.width;
    hill.setScale(scale);
    hill.setDepth(-1);
    
    // Pond (Left)
    this.pond = this.add.image(width * 0.2, height * 0.8, 'lrc-pond');
    this.pond.setScale(0.8);
    this.pond.setDepth(0);
    
    // Tree (Right)
    this.tree = this.add.image(width * 0.8, height * 0.6, 'lrc-tree');
    this.tree.setScale(0.8);
    this.tree.setDepth(0);
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
    
    // Randomly choose Fish or Monkey
    const type = Math.random() > 0.5 ? 'fish' : 'monkey';
    const key = type === 'fish' ? 'lrc-fish' : 'lrc-monkey';
    
    // Random position in the middle area
    const x = Phaser.Math.Between(width * 0.3, width * 0.7);
    const y = Phaser.Math.Between(height * 0.3, height * 0.7);
    
    const item = this.add.image(x, y, key);
    item.setScale(0);
    item.itemType = type;
    
    // Pop in animation
    this.tweens.add({
      targets: item,
      scale: 0.5,
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
        scale: 0.2,
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
        fontSize: '24px',
        color: '#FF0000',
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
      // Simple help modal
      const { width, height } = this.cameras.main;
      const modal = this.add.container(width/2, height/2).setDepth(100);
      
      const bg = this.add.rectangle(0, 0, 400, 300, 0xFFFFFF).setStrokeStyle(2, 0x000000);
      const text = this.add.text(0, -50, this.description, {
          color: '#000000',
          fontSize: '24px',
          wordWrap: { width: 350 }
      }).setOrigin(0.5);
      
      const closeBtn = this.add.text(0, 100, 'Close', {
          color: '#000000',
          backgroundColor: '#CCCCCC',
          padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => modal.destroy());
      
      modal.add([bg, text, closeBtn]);
  }
}
