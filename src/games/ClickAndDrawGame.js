import { LalelaGame } from '../utils/LalelaGame.js';

export class ClickAndDrawGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'ClickAndDrawGame',
      title: 'Click and Draw',
      description: 'Draw the picture by clicking on the points.',
      category: 'computer',
      ...config
    });

    this.levels = [
      {
        imageName1: "dn_fond1.svg",
        imageName2: "dn_fond2.svg",
        coordinates: [[267,121],[349,369],[139,216],[397,214],[190,369],[267,121]]
      },
      {
        imageName1: "de1.svg",
        imageName2: "de2.svg",
        coordinates: [[104,275],[106,171],[203,133],[288,178],[288,237],[311,211],[427,220],[428,324],[382,386],[260,374],[260,297],[195,323],[104,275]]
      },
      {
        imageName1: "house1.svg",
        imageName2: "house2.svg",
        coordinates: [[306,360],[412,360],[413,175],[356,120],[355,70],[330,70],[330,96],[272,40],[119,177],[120,361],[253,361],[252,276],[306,276],[306,360]]
      },
      {
        imageName1: "sapin1.svg",
        imageName2: "sapin2.svg",
        coordinates: [[104,463],[201,361],[127,373],[221,238],[160,251],[237,127],[189,146],[259,52],[324,144],[276,128],[352,251],[295,239],[387,371],[318,362],[417,466],[282,453],[282,504],[234,504],[234,453],[104,463]]
      },
      {
        imageName1: "epouvantail1.svg",
        imageName2: "epouvantail2.svg",
        coordinates: [[105,449],[190,340],[190,224],[62,233],[58,168],[245,160],[218,135],[217,77],[190,79],[189,68],[213,65],[209,30],[310,30],[314,56],[338,54],[339,66],[313,68],[312,135],[284,161],[462,163],[457,223],[327,221],[327,337],[411,457],[357,487],[263,377],[159,491],[105,449]]
      },
      {
        imageName1: "plane1.svg",
        imageName2: "plane2.svg",
        coordinates: [[228,296],[106,299],[85,278],[103,253],[142,237],[133,220],[148,213],[103,159],[108,140],[130,138],[247,223],[332,222],[377,214],[351,197],[352,187],[369,188],[395,198],[428,164],[438,216],[470,236],[472,248],[451,247],[428,240],[378,265],[308,280],[394,352],[392,382],[350,370],[266,316],[228,324],[214,310],[228,296]]
      },
      {
        imageName1: "fish1.svg",
        imageName2: "fish2.svg",
        coordinates: [[21,320],[50,256],[100,212],[209,203],[244,156],[276,146],[294,156],[302,175],[292,204],[314,215],[342,195],[360,207],[355,225],[365,242],[408,258],[446,246],[462,222],[480,215],[494,226],[498,278],[481,349],[469,373],[440,366],[424,335],[362,328],[318,339],[325,357],[322,378],[299,392],[268,388],[226,352],[202,352],[210,360],[206,380],[188,382],[172,360],[52,360],[35,350],[32,322],[21,320]]
      },
      {
        imageName1: "carnaval1.svg",
        imageName2: "carnaval2.svg",
        coordinates: [[135,204],[192,143],[224,180],[246,118],[265,188],[269,120],[277,179],[312,154],[364,203],[315,188],[286,224],[286,236],[284,296],[279,315],[320,306],[364,262],[384,184],[404,186],[386,279],[313,366],[304,473],[312,518],[208,518],[220,473],[202,365],[177,402],[200,468],[180,483],[148,407],[180,333],[227,317],[219,295],[214,235],[213,223],[183,189],[135,204]]
      },
      {
        imageName1: "bear1.svg",
        imageName2: "bear2.svg",
        coordinates: [[154,256],[112,240],[66,206],[42,174],[45,159],[66,154],[107,167],[150,188],[184,220],[202,206],[220,200],[192,185],[171,154],[169,117],[187,90],[170,76],[165,55],[185,38],[210,40],[226,52],[227,66],[250,59],[281,60],[300,66],[301,48],[318,37],[340,36],[357,48],[360,70],[351,82],[336,86],[352,110],[356,136],[349,164],[329,189],[308,200],[330,212],[372,180],[428,158],[461,154],[472,164],[468,184],[442,213],[400,236],[365,251],[379,286],[382,329],[376,364],[398,354],[416,360],[426,384],[421,417],[398,455],[370,470],[343,456],[340,419],[311,440],[264,453],[210,441],[180,422],[181,450],[167,471],[134,467],[105,434],[92,402],[98,366],[121,354],[146,364],[138,326],[142,282],[154,256]]
      }
    ];
  }

  preload() {
    super.preload();
    
    // Load all images
    this.levels.forEach(level => {
      this.load.svg(`clickanddraw-${level.imageName1}`, `assets/clickanddraw/${level.imageName1}`);
      this.load.svg(`clickanddraw-${level.imageName2}`, `assets/clickanddraw/${level.imageName2}`);
    });
    
    this.load.svg('clickanddraw-bluepoint', 'assets/clickanddraw/bluepoint.svg');
    this.load.svg('clickanddraw-bluepointHighlight', 'assets/clickanddraw/bluepointHighlight.svg');
    
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
    // Original coordinates are based on ~800x600?
    // We need to scale/center them.
    // Let's assume the coordinates are relative to an 800x600 area.
    
    const scaleX = width / 800;
    const scaleY = height / 600;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    
    const offsetX = (width - 800 * scale) / 2;
    const offsetY = (height - 600 * scale) / 2;
    
    this.bgImage = this.add.image(width/2, height/2, `clickanddraw-${levelData.imageName1}`);
    // We might need to scale the image too?
    // The SVG might be any size.
    // Let's assume the SVG fits the 800x600 coordinate space.
    // We'll scale it to fit the screen.
    
    // Actually, let's just use the coordinates directly with scaling.
    
    // Create points
    levelData.coordinates.forEach((coord, index) => {
      const x = coord[0] * scale + offsetX;
      const y = coord[1] * scale + offsetY;
      
      const point = this.add.image(x, y, 'clickanddraw-bluepoint');
      point.setScale(0.5); // Adjust size
      point.setInteractive({ useHandCursor: true });
      point.setVisible(index === 0); // Only show first point initially?
      
      point.on('pointerdown', () => this.handlePointClick(index, x, y));
      
      this.points.push(point);
    });
    
    // Graphics for lines
    this.graphics = this.add.graphics();
    this.lines.push(this.graphics);
  }
  
  handlePointClick(index, x, y) {
    if (index !== this.currentPointIndex) return;
    
    // Play sound
    if (this.audioManager) this.audioManager.playSound('click');
    
    // Draw line from previous point
    if (index > 0) {
      const prevPoint = this.points[index - 1];
      this.graphics.lineStyle(4, 0x0062FF);
      this.graphics.beginPath();
      this.graphics.moveTo(prevPoint.x, prevPoint.y);
      this.graphics.lineTo(x, y);
      this.graphics.strokePath();
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
    this.finalImage = this.add.image(width/2, height/2, `clickanddraw-${levelData.imageName2}`);
    this.finalImage.setAlpha(0);
    
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
