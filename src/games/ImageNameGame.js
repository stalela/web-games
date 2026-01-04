import { DragDropGame } from './DragDropGame.js';

export class ImageNameGame extends DragDropGame {
  constructor(config) {
    super({
      key: 'ImageNameGame',
      title: 'Name the Image',
      description: 'Drag and drop each item above its name.',
      category: 'reading',
      ...config
    });

    this.levels = [
      {
        items: [
          { image: 'postpoint', text: 'mail box', x: 0.2, y: 0.2 },
          { image: 'sailingboat', text: 'sailing boat', x: 0.5, y: 0.2 },
          { image: 'lamp', text: 'lamp', x: 0.8, y: 0.2 },
          { image: 'postcard', text: 'postcard', x: 0.2, y: 0.65 },
          { image: 'fishingboat', text: 'fishing boat', x: 0.5, y: 0.65 },
          { image: 'light', text: 'bulb', x: 0.8, y: 0.65 }
        ]
      },
      {
        items: [
          { image: 'bottle', text: 'bottle', x: 0.2, y: 0.2 },
          { image: 'glass', text: 'glass', x: 0.5, y: 0.2 },
          { image: 'egg', text: 'egg', x: 0.8, y: 0.2 },
          { image: 'eggpot', text: 'eggcup', x: 0.2, y: 0.65 },
          { image: 'flower', text: 'flower', x: 0.5, y: 0.65 },
          { image: 'vase', text: 'vase', x: 0.8, y: 0.65 }
        ]
      },
      {
        items: [
          { image: 'house', text: 'house', x: 0.2, y: 0.2 },
          { image: 'castle', text: 'castle', x: 0.5, y: 0.2 },
          { image: 'igloo', text: 'igloo', x: 0.8, y: 0.2 },
          { image: 'tent', text: 'tent', x: 0.2, y: 0.65 },
          { image: 'hut', text: 'hut', x: 0.5, y: 0.65 },
          { image: 'tower', text: 'tower', x: 0.8, y: 0.65 }
        ]
      }
    ];
  }

  preload() {
    super.preload();
    // Load all images used in levels
    const images = [
      'postpoint', 'sailingboat', 'lamp', 'postcard', 'fishingboat', 'light',
      'bottle', 'glass', 'egg', 'eggpot', 'flower', 'vase',
      'house', 'castle', 'igloo', 'tent', 'hut', 'tower'
    ];

    images.forEach(img => {
      this.load.svg(`imagename-${img}`, `assets/imagename/${img}.svg`);
    });
    
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
    this.dropZones.forEach(z => z.destroy());
    this.draggableTiles.forEach(t => t.destroy());
    if (this.textLabels) this.textLabels.forEach(t => t.destroy());
    this.textLabels = [];

    // Create Drop Zones (Targets)
    const zonesConfig = levelData.items.map(item => ({
      x: item.x * width,
      y: item.y * height,
      width: 100,
      height: 100,
      expectedValue: item.image,
      color: 0xEEEEEE, // Light gray placeholder
      strokeColor: 0xCCCCCC
    }));

    this.createDropZones(zonesConfig);

    // Add text labels below drop zones
    levelData.items.forEach((item, index) => {
      const zone = this.dropZones[index];
      const text = this.add.text(zone.x, zone.y + 70, item.text, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#000000',
        align: 'center'
      }).setOrigin(0.5);
      this.textLabels.push(text);
    });

    // Create Draggable Tiles (Images)
    // Shuffle them and place them in a sidebar or random positions?
    // GCompris puts them in a sidebar.
    // We'll put them on the left side or bottom.
    // Let's put them on the left side (x=100)
    
    const shuffledItems = this.shuffleArray([...levelData.items]);
    const tilesConfig = shuffledItems.map((item, index) => ({
      x: 80,
      y: 100 + (index * 90),
      value: item.image,
      imageKey: `imagename-${item.image}`,
      size: 80,
      color: 0xFFFFFF // White background for image
    }));

    this.createDraggableTiles(tilesConfig);
    
    // Override tile rendering to show image
    this.draggableTiles.forEach(tile => {
        // Remove default text
        if (tile.textObject) tile.textObject.setVisible(false);
        
        // Add image
        const img = this.add.image(0, 0, tile.config.imageKey);
        const scale = Math.min((tile.width - 10) / img.width, (tile.height - 10) / img.height);
        img.setScale(scale);
        tile.add(img);
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
