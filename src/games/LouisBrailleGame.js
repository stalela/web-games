import { LalelaGame } from '../utils/LalelaGame.js';

export class LouisBrailleGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'LouisBrailleGame',
      title: 'The Story of Louis Braille',
      description: 'Arrange the events in the correct order.',
      category: 'reading',
      ...config
    });
  }

  preload() {
    super.preload();
    // Load assets
    const images = [
      'louis', 'stitching_awl', 'blind', 'paris', 'piano', 
      'night_writing', 'braille', 'teach', 'maths', 'statue', 'world'
    ];
    
    images.forEach(img => {
      this.load.svg(`louis-${img}`, `assets/louis-braille/${img}.svg`);
    });

    // Load navigation icons
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach((icon) => {
        this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(width / 2, height / 2, width, height, 0xE6F3FF).setDepth(-1);
  }

  createUI() {
    super.createUI();
    this.createNavigationDock(this.cameras.main.width, this.cameras.main.height);
    
    // Title
    this.add.text(this.cameras.main.width / 2, 50, 'The Story of Louis Braille', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  setupGameLogic() {
    this.events = [
      { year: 1809, text: "Born on January 4th 1809 in Coupvray near Paris.", img: "louis-louis" },
      { year: 1812, text: "Injured his right eye with a stitching awl.", img: "louis-stitching_awl" },
      { year: 1812, text: "Became blind due to severe infection.", img: "louis-blind" },
      { year: 1819, text: "Sent to Paris to study at the Royal Institute.", img: "louis-paris" },
      { year: 1820, text: "Began to play the piano and the organ.", img: "louis-piano" },
      { year: 1821, text: "Charles Barbier shared his night writing code.", img: "louis-night_writing" },
      { year: 1824, text: "Invented the Braille system (6 dots).", img: "louis-braille" },
      { year: 1828, text: "Became a teacher and promoted his method.", img: "louis-teach" },
      { year: 1837, text: "Extended Braille to math and music.", img: "louis-maths" },
      { year: 1852, text: "Died of tuberculosis. Buried in the Pantheon.", img: "louis-statue" },
      { year: 9999, text: "Braille became a worldwide standard.", img: "louis-world" }
    ];

    // Shuffle for the game
    this.currentOrder = this.shuffleArray([...this.events]);
    
    this.createList();
  }

  createList() {
    const { width, height } = this.cameras.main;
    const itemHeight = 80;
    const startY = 100;
    
    if (this.listContainer) this.listContainer.destroy();
    this.listContainer = this.add.container(0, 0);
    
    this.items = [];

    this.currentOrder.forEach((event, index) => {
      const item = this.createListItem(event, index, width / 2, startY + index * (itemHeight + 10));
      this.listContainer.add(item);
      this.items.push(item);
    });

    // Check Button
    const checkBtn = this.add.container(width - 100, height - 100);
    const btnBg = this.add.circle(0, 0, 40, 0x00B378);
    const btnText = this.add.text(0, 0, 'OK', { fontSize: '24px', fontStyle: 'bold' }).setOrigin(0.5);
    
    checkBtn.add([btnBg, btnText]);
    checkBtn.setSize(80, 80);
    checkBtn.setInteractive({ useHandCursor: true });
    checkBtn.on('pointerdown', () => this.checkOrder());
    
    this.listContainer.add(checkBtn);
  }

  createListItem(event, index, x, y) {
    const container = this.add.container(x, y);
    const width = 800;
    const height = 80;
    
    const bg = this.add.rectangle(0, 0, width, height, 0xFFFFFF);
    bg.setStrokeStyle(2, 0xCCCCCC);
    
    const img = this.add.image(-350, 0, event.img);
    img.setDisplaySize(60, 60);
    
    const text = this.add.text(-300, 0, event.text, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#000000',
      wordWrap: { width: 600 }
    }).setOrigin(0, 0.5);

    container.add([bg, img, text]);
    container.setSize(width, height);
    container.setInteractive({ draggable: true });
    
    container.data = { event, index };
    
    // Drag logic
    container.on('dragstart', () => {
      this.children.bringToTop(container);
      bg.setFillStyle(0xE0E0E0);
    });

    container.on('drag', (pointer, dragX, dragY) => {
      container.y = dragY;
    });

    container.on('dragend', () => {
      bg.setFillStyle(0xFFFFFF);
      this.reorderItems(container);
    });

    return container;
  }

  reorderItems(draggedItem) {
    // Find new index based on y position
    const itemHeight = 90; // 80 + 10 spacing
    const startY = 100;
    
    let newIndex = Math.round((draggedItem.y - startY) / itemHeight);
    newIndex = Math.max(0, Math.min(newIndex, this.items.length - 1));
    
    const oldIndex = this.items.indexOf(draggedItem);
    
    if (newIndex !== oldIndex) {
      // Remove from old position
      this.items.splice(oldIndex, 1);
      // Insert at new position
      this.items.splice(newIndex, 0, draggedItem);
      
      // Update visual positions
      this.items.forEach((item, i) => {
        this.tweens.add({
          targets: item,
          y: startY + i * itemHeight,
          duration: 200
        });
      });
    } else {
      // Return to original position
      this.tweens.add({
        targets: draggedItem,
        y: startY + oldIndex * itemHeight,
        duration: 200
      });
    }
  }

  checkOrder() {
    let correct = true;
    for (let i = 0; i < this.items.length - 1; i++) {
      if (this.items[i].data.event.year > this.items[i+1].data.event.year) {
        correct = false;
        break;
      }
    }

    if (correct) {
      this.audioManager.play('success');
      // Show completion message
      const { width, height } = this.cameras.main;
      const msg = this.add.text(width/2, height/2, 'Correct! You know the story of Louis Braille.', {
        fontSize: '32px',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setDepth(100);
      
      this.time.delayedCall(3000, () => {
        msg.destroy();
        this.scene.start('GameMenu');
      });
    } else {
      this.audioManager.play('fail');
    }
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
