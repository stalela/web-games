import { LalelaGame } from '../utils/LalelaGame.js';

export class DrawNumbersGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'DrawNumbersGame',
      title: 'Draw Numbers',
      description: 'Draw the numbers by clicking on the points.',
      category: 'computer',
      ...config
    });

    this.levels = [
      {
        imageName1: "paper.svg",
        imageName2: "zero.svg",
        coordinates: [[341,62],[300,50],[279,52],[251,59],[207,88],[181,121],[164,169],[159,209],[157,259],[168,307],[186,355],[222,388],[266,406],[316,408],[357,402],[402,375],[432,331],[446,289],[450,246],[444,205],[435,160],[414,111],[385,80]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "one.svg",
        coordinates: [[156,175],[189,157],[224,144],[261,124],[293,103],[320,80],[320,115],[320,151],[320,200],[320,246],[320,295],[320,337],[320,376],[320,412],[320,446]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "two.svg",
        coordinates: [[177,132],[189,96],[214,70],[254,49],[304,44],[352,49],[395,70],[425,108],[433,153],[403,198],[359,231],[320,264],[275,295],[237,315],[204,340],[168,372],[210,372],[239,372],[272,372],[301,372],[338,372],[373,372],[408,372],[446,372]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "three.svg",
        coordinates: [[166,128],[185,96],[217,70],[254,59],[295,53],[342,57],[380,75],[410,111],[407,157],[380,183],[344,194],[312,197],[269,212],[313,216],[348,220],[384,231],[414,256],[437,291],[433,329],[414,355],[382,373],[348,384],[305,383],[253,377],[208,357],[177,329],[155,295]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "four.svg",
        coordinates: [[340,31], [312,66],[287,97],[255,132],[231,166],[200,201],[168,240],[122,288],[173,288],[225,288],[262,288],[306,288],[345,288],[386,288],[417,288],
        [340,31],[340,86],[340,151],[340,212],[340,262],[340,310],[340,364],[340,401]],
        coordinates2: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2]
      },
      {
        imageName1: "paper.svg",
        imageName2: "five.svg",
        coordinates: [[428,55],[380,55],[328,55],[283,55],[251,55],[215,55],[208,93],[202,122],[193,160],[185,188],[178,223],[202,226],[225,202],[258,184],[294,179],[335,190],[377,208],[411,234],[428,268],[425,313],[410,347],[381,377],[341,394],[301,402],[254,394],[211,372],[184,347],[167,308]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "six.svg",
        coordinates: [[422,125],[406,86],[380,66],[331,52],[288,51],[253,63],[218,88],[191,129],[177,172],[173,208],[175,251],[181,292],[195,333],[217,368],[251,387],[298,401],[346,395],[393,369],[418,315],[411,255],[382,215],[342,197],[300,193],[266,201],[237,219],[208,246]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "seven.svg",
        coordinates: [[164,57],[207,57],[258,57],[306,57],[344,57],[391,57],[426,57],[461,57],[426,93],[397,125],[370,160],[348,188],[324,222],[297,273],[282,304],[266,346],[254,390]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "eight.svg",
        coordinates: [[279,200],[231,172],[206,135],[210,91],[242,59],[277,42],[319,41],[363,52],[395,78],[413,121],[399,168],[371,198],[317,216],[271,223],[225,246],[197,281],[195,336],[203,364],[224,386],[253,400],[295,411],[345,408],[388,390],[421,354],[432,310],[426,267],[402,240],[374,226],[311,219]]
      },
      {
        imageName1: "paper.svg",
        imageName2: "nine.svg",
        coordinates: [[413,157],[389,106],[351,74],[305,62],[254,67],[218,89],[193,120],[175,172],[193,222],[226,252],[279,266],[331,259],[371,237],[388,205],[413,157],[421,198],[420,262],[411,304],[395,342],[362,375],[313,388],[262,386],[222,369],[202,348],[191,321]]
      }
    ];
  }

  preload() {
    super.preload();
    
    // Load all images
    this.levels.forEach(level => {
      this.load.svg(`drawnumbers-${level.imageName1}`, `assets/drawnumbers/${level.imageName1}`);
      this.load.svg(`drawnumbers-${level.imageName2}`, `assets/drawnumbers/${level.imageName2}`);
    });
    
    this.load.svg('drawnumbers-bluepoint', 'assets/drawnumbers/bluepoint.svg');
    this.load.svg('drawnumbers-bluepointHighlight', 'assets/drawnumbers/bluepointHighlight.svg');
    
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
    this.createNavigationDock(this.cameras.main.width, this.cameras.main.height);
  }

  setupGameLogic() {
    const levelData = this.levels[this.level % this.levels.length];
    const { width, height } = this.cameras.main;

    // Clear previous
    if (this.gameContainer) this.gameContainer.destroy();
    this.gameContainer = this.add.container(0, 0);

    // Background image (paper)
    const bg = this.add.image(width / 2, height / 2, `drawnumbers-${levelData.imageName1}`);
    // Scale to fit
    const scale = Math.min(width / bg.width, height / bg.height) * 0.9;
    bg.setScale(scale);
    this.gameContainer.add(bg);

    // Target image (number) - initially hidden or faint?
    // In GCompris, it appears after drawing.
    // Or maybe it's the guide?
    // Let's show it very faint as a guide.
    const target = this.add.image(width / 2, height / 2, `drawnumbers-${levelData.imageName2}`);
    target.setScale(scale);
    target.setAlpha(0.1);
    this.gameContainer.add(target);
    this.targetImage = target;

    // Calculate offset to center the points on the image
    // The coordinates are relative to the image size (likely 800x600 or similar)
    // We need to map them to the scaled image position
    const offsetX = width / 2 - (bg.width * scale) / 2;
    const offsetY = height / 2 - (bg.height * scale) / 2;

    this.points = [];
    this.currentPointIndex = 0;
    this.lines = [];
    
    // Create points
    levelData.coordinates.forEach((coord, index) => {
      const x = offsetX + coord[0] * scale;
      const y = offsetY + coord[1] * scale;
      
      const point = this.add.image(x, y, 'drawnumbers-bluepoint');
      point.setScale(0.5);
      point.setInteractive({ useHandCursor: true });
      point.data = { index: index };
      
      // Only show first point initially? Or all?
      // Usually all are shown.
      // But we need to enforce order.
      
      point.on('pointerdown', () => this.handlePointClick(index));
      point.on('pointerover', () => {
          if (this.input.activePointer.isDown) {
              this.handlePointClick(index);
          }
      });

      this.gameContainer.add(point);
      this.points.push(point);
    });

    // Highlight first point
    this.highlightPoint(0);
    
    // Graphics for drawing lines
    this.graphics = this.add.graphics();
    this.gameContainer.add(this.graphics);
  }

  highlightPoint(index) {
    this.points.forEach((p, i) => {
      if (i === index) {
        p.setTexture('drawnumbers-bluepointHighlight');
        p.setScale(0.7);
      } else if (i < index) {
        p.setVisible(false); // Hide completed points
      } else {
        p.setTexture('drawnumbers-bluepoint');
        p.setScale(0.5);
      }
    });
  }

  handlePointClick(index) {
    if (index === this.currentPointIndex) {
      this.audioManager.play('click');
      
      // Draw line from previous point
      if (index > 0) {
        // Check for stroke break
        const levelData = this.levels[this.level % this.levels.length];
        const isNewStroke = levelData.coordinates2 && levelData.coordinates2[index] !== levelData.coordinates2[index-1];
        
        if (!isNewStroke) {
          const prev = this.points[index - 1];
          const curr = this.points[index];
          
          this.graphics.lineStyle(4, 0x0000FF, 1);
          this.graphics.lineBetween(prev.x, prev.y, curr.x, curr.y);
        }
      }

      this.currentPointIndex++;
      
      if (this.currentPointIndex >= this.points.length) {
        this.levelComplete();
      } else {
        this.highlightPoint(this.currentPointIndex);
      }
    }
  }

  levelComplete() {
    this.audioManager.play('success');
    this.targetImage.setAlpha(1);
    this.points.forEach(p => p.setVisible(false));
    
    this.time.delayedCall(2000, () => {
      this.level++;
      this.setupGameLogic();
    });
  }

  createNavigationDock(width, height) {
    // Standard dock
    const dockY = height - 46;
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.92);
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 42, width - 60, 84, 42);
    dockBg.setDepth(14);

    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(3, 0x0062FF, 1);
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 42, width - 60, 84, 42);
    dockBorder.setDepth(15);

    const controls = [
      { icon: 'help.svg', action: 'help', color: 0x00B378 },
      { icon: 'home.svg', action: 'home', color: 0x0062FF },
      { icon: 'settings.svg', action: 'levels', color: 0xF08A00 },
      { icon: 'exit.svg', action: 'menu', color: 0xA74BFF }
    ];

    const totalWidth = controls.length * 92;
    const startX = width / 2 - totalWidth / 2 + 31;

    controls.forEach((control, index) => {
      const x = startX + index * 92;
      const btn = this.add.container(x, dockY);
      btn.setSize(62, 62);
      btn.setInteractive({ useHandCursor: true });
      btn.setDepth(20);

      const circle = this.add.circle(0, 0, 31, control.color);
      const icon = this.add.image(0, 0, control.icon.replace('.svg', ''));
      icon.setScale(0.6);
      btn.add([circle, icon]);
      
      btn.on('pointerdown', () => {
        if (control.action === 'home' || control.action === 'menu') {
          this.scene.start('GameMenu');
        }
      });
    });
  }
}
