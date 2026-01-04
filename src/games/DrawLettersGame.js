import { LalelaGame } from '../utils/LalelaGame.js';

export class DrawLettersGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'DrawLettersGame',
      title: 'Draw Letters',
      description: 'Connect the dots to draw the letters.',
      category: 'reading',
      ...config
    });

    this.levels = [
      {
        imageName1: "paper.svg",
        imageName2: "A1.svg",
        coordinates: [[278,58],[260,100],[242,144],[225,187],[207,230],[189,276],[171,316],[154,359],[136,402],[278,58],[296,104],[314,144],[332,187],[350,230],[368,276],[386,316],[403,359],[420,402],[187,286],[235,286],[282,286],[330,286],[378,286]],
        coordinates2: [1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,3,3,3,3,3]
      },
      {
        imageName1: "paper.svg",
        imageName2: "B1.svg",
        coordinates: [[190,59],[190,93],[190,126],[190,165],[190,212],[190,263],[190,308],[190,342],[190,375],[190,409],[223,77],[262,77],[300,78],[340,80],[384,91],[417,114],[433,154],[427,194],[388,226],[360,235],[328,242],[291,240],[262,235],[234,234],[223,234],[251,246],[288,248],[322,248],[358,249],[394,263],[427,291],[440,322],[441,357],[417,390],[375,406],[346,411],[307,413],[267,413],[244,413],[215,409]],
        coordinates2: [1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
      },
      {
        imageName1: "paper.svg",
        imageName2: "C1.svg",
        coordinates: [[435,160],[420,135],[391,110],[353,91],[318,86],[289,86],[255,93],[220,108],[184,136],[162,166],[147,211],[148,249],[157,282],[175,314],[198,340],[233,360],[278,372],[318,372],[361,362],[406,342],[427,315],[442,284]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "D1.svg",
        coordinates: [[110,67],[110,98],[110,132],[110,173],[110,220],[110,267],[110,305],[110,347],[110,383],[110,410],[146,73],[184,78],[219,80],[255,81],[292,85],[328,90],[373,100],[408,118],[434,144],[456,174],[471,220],[475,268],[467,315],[437,356],[398,385],[346,401],[307,406],[260,409],[219,409],[190,409],[157,407]],
        coordinates2: [1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
      },
      {
        imageName1: "paper.svg",
        imageName2: "E1.svg",
        coordinates: [[161,62],[161,95],[161,133],[161,175],[161,216],[161,256],[161,296],[161,336],[161,377],[186,78],[212,78],[242,78],[274,78],[304,78],[335,78],[368,78],[405,78],[186,220],[217,220],[253,220],[289,220],[322,220],[353,220],[390,220],[193,366],[222,366],[252,366],[285,366],[313,366],[346,366],[377,366],[408,366]],
        coordinates2: [1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4]
      }
    ];
  }

  preload() {
    super.preload();
    
    // Load all images
    this.levels.forEach(level => {
      this.load.svg(`drawletters-${level.imageName1}`, `assets/drawletters/${level.imageName1}`);
      this.load.svg(`drawletters-${level.imageName2}`, `assets/drawletters/${level.imageName2}`);
    });
    
    this.load.svg('drawletters-bluepoint', 'assets/drawletters/bluepoint.svg');
    this.load.svg('drawletters-bluepointHighlight', 'assets/drawletters/bluepointHighlight.svg');
    
    // Load navigation icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach((icon) => {
        this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(width / 2, height / 2, width, height, 0xFFFFFF).setDepth(-1);
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
    const levelData = this.levels[this.level % this.levels.length];
    const { width, height } = this.cameras.main;
    
    // Clear previous
    if (this.points) this.points.forEach(p => p.destroy());
    if (this.lines) this.lines.forEach(l => l.destroy());
    if (this.bgImage) this.bgImage.destroy();
    if (this.finalImage) this.finalImage.destroy();
    
    this.points = [];
    this.lines = [];
    this.currentPointIndex = 0;
    
    // Add background image (centered)
    const scaleX = width / 800;
    const scaleY = height / 600;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    
    const offsetX = (width - 800 * scale) / 2;
    const offsetY = (height - 600 * scale) / 2;
    
    this.bgImage = this.add.image(width/2, height/2, `drawletters-${levelData.imageName1}`);
    this.bgImage.setScale(scale);
    
    // Create points
    levelData.coordinates.forEach((coord, index) => {
      const x = coord[0] * scale + offsetX;
      const y = coord[1] * scale + offsetY;
      
      const point = this.add.image(x, y, 'drawletters-bluepoint');
      point.setScale(0.5); // Adjust size
      point.setInteractive({ useHandCursor: true });
      point.setVisible(index === 0); // Only show first point initially?
      
      // If it's the start of a new stroke, it should be visible if the previous stroke is done
      // But here we just show points sequentially.
      
      point.on('pointerdown', () => this.handlePointClick(index, x, y));
      
      this.points.push(point);
    });
    
    // Graphics for lines
    this.graphics = this.add.graphics();
    this.lines.push(this.graphics);
  }
  
  handlePointClick(index, x, y) {
    if (index !== this.currentPointIndex) return;
    
    const levelData = this.levels[this.level % this.levels.length];
    
    // Play sound
    if (this.audioManager) this.audioManager.playSound('click');
    
    // Draw line from previous point IF same stroke
    if (index > 0) {
      const prevPoint = this.points[index - 1];
      
      let sameStroke = true;
      if (levelData.coordinates2) {
        if (levelData.coordinates2[index] !== levelData.coordinates2[index - 1]) {
          sameStroke = false;
        }
      }
      
      if (sameStroke) {
        this.graphics.lineStyle(4, 0x0062FF);
        this.graphics.beginPath();
        this.graphics.moveTo(prevPoint.x, prevPoint.y);
        this.graphics.lineTo(x, y);
        this.graphics.strokePath();
      }
    }
    
    // Show next point
    if (index < this.points.length - 1) {
      this.points[index + 1].setVisible(true);
      this.currentPointIndex++;
    } else {
      // Level complete
      this.showFinalImage();
    }
  }
  
  showFinalImage() {
    const levelData = this.levels[this.level % this.levels.length];
    const { width, height } = this.cameras.main;
    
    // Hide points and lines
    this.points.forEach(p => p.setVisible(false));
    this.graphics.clear();
    this.bgImage.setVisible(false);
    
    // Show final image
    this.finalImage = this.add.image(width/2, height/2, `drawletters-${levelData.imageName2}`);
    this.finalImage.setAlpha(0);
    
    // Scale final image
    const scaleX = width / 800;
    const scaleY = height / 600;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    this.finalImage.setScale(scale);
    
    this.tweens.add({
      targets: this.finalImage,
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.nextLevel();
        });
      }
    });
    
    if (this.audioManager) this.audioManager.playSound('success');
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
