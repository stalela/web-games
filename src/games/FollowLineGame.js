import { LalelaGame } from '../utils/LalelaGame.js';

export class FollowLineGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'FollowLineGame',
      title: 'Control the Hose-pipe',
      description: 'Move the mouse along the pipe to stop the fire.',
      category: 'computer',
      ...config
    });

    this.pathPoints = [];
    this.currentProgress = 0;
    this.isOffPath = false;
    this.offPathTimer = null;
  }

  preload() {
    super.preload();
    this.load.svg('fl-background', 'assets/followline/background.svg');
    this.load.svg('fl-fireman', 'assets/followline/fireman.svg');
    this.load.svg('fl-fire', 'assets/followline/fire.svg');
    this.load.svg('fl-fireflame', 'assets/followline/fire_flame.svg');
    this.load.svg('fl-waterspot', 'assets/followline/water_spot.svg');
    
    // Load navigation icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach((icon) => {
        this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    
    // Background
    const bg = this.add.image(width/2, height/2, 'fl-background');
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale);
    bg.setDepth(-1);
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
  }

  setupGameLogic() {
    const { width, height } = this.cameras.main;
    
    // Fireman on left
    this.fireman = this.add.image(100, height/2, 'fl-fireman');
    this.fireman.setScale(0.8);
    
    // Fire on right
    this.fire = this.add.image(width - 100, height/2, 'fl-fire');
    this.fire.setScale(0.8);
    
    // Generate Path
    this.generatePath();
    
    // Draw Path
    this.drawPath();
    
    // Input handling
    this.input.on('pointermove', this.handlePointerMove, this);
    
    // Timer for regression when off path
    this.offPathTimer = this.time.addEvent({
      delay: 100,
      callback: this.regressProgress,
      callbackScope: this,
      loop: true,
      paused: true
    });
  }
  
  generatePath() {
    const { width, height } = this.cameras.main;
    this.pathPoints = [];
    
    const startX = 150;
    const startY = height / 2;
    const endX = width - 150;
    
    let x = startX;
    let y = startY;
    let angle = 0;
    const step = 10;
    const amplitude = 50 + (this.level * 10); // Increase waviness with level
    const frequency = 0.02 + (this.level * 0.005);
    
    while (x < endX) {
      this.pathPoints.push({ x, y });
      x += step;
      y = startY + Math.sin((x - startX) * frequency) * amplitude;
    }
    this.pathPoints.push({ x: endX, y: startY }); // Ensure we reach the end roughly
  }
  
  drawPath() {
    if (this.pathGraphics) this.pathGraphics.destroy();
    this.pathGraphics = this.add.graphics();
    
    // Draw full pipe (gray)
    this.pathGraphics.lineStyle(40, 0x888888);
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
    for (let i = 1; i < this.pathPoints.length; i++) {
      this.pathGraphics.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
    }
    this.pathGraphics.strokePath();
    
    // Draw water/progress (blue)
    this.updateProgressGraphics();
  }
  
  updateProgressGraphics() {
    if (this.progressGraphics) this.progressGraphics.destroy();
    this.progressGraphics = this.add.graphics();
    
    if (this.currentProgress > 0) {
      this.progressGraphics.lineStyle(30, 0x0000FF); // Water color
      this.progressGraphics.beginPath();
      this.progressGraphics.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
      
      const maxIndex = Math.min(Math.floor(this.currentProgress), this.pathPoints.length - 1);
      for (let i = 1; i <= maxIndex; i++) {
        this.progressGraphics.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
      }
      this.progressGraphics.strokePath();
      
      // Draw "lock" (red tip)
      if (maxIndex < this.pathPoints.length - 1) {
        const tip = this.pathPoints[maxIndex];
        this.progressGraphics.fillStyle(0xFF0000);
        this.progressGraphics.fillCircle(tip.x, tip.y, 15);
      }
    }
  }
  
  handlePointerMove(pointer) {
    // Check if pointer is near the "next" point in the path
    const nextIndex = Math.floor(this.currentProgress) + 1;
    
    if (nextIndex >= this.pathPoints.length) {
      this.levelComplete();
      return;
    }
    
    const nextPoint = this.pathPoints[nextIndex];
    const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, nextPoint.x, nextPoint.y);
    
    if (dist < 40) { // Tolerance radius
      this.currentProgress += 1; // Advance one step
      this.updateProgressGraphics();
      this.isOffPath = false;
      this.offPathTimer.paused = true;
      
      if (this.currentProgress >= this.pathPoints.length - 1) {
        this.levelComplete();
      }
    } else {
      // Check if we are far from the current tip
      const currentTip = this.pathPoints[Math.floor(this.currentProgress)];
      const distToTip = Phaser.Math.Distance.Between(pointer.x, pointer.y, currentTip.x, currentTip.y);
      
      if (distToTip > 60) {
        this.isOffPath = true;
        this.offPathTimer.paused = false;
      }
    }
  }
  
  regressProgress() {
    if (this.currentProgress > 0) {
      this.currentProgress -= 1;
      this.updateProgressGraphics();
    }
  }
  
  levelComplete() {
    this.input.off('pointermove');
    this.offPathTimer.remove();
    
    if (this.audioManager) this.audioManager.playSound('success');
    
    // Extinguish fire animation
    this.tweens.add({
      targets: this.fire,
      scale: 0,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.nextLevel();
        });
      }
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
