/**
 * GeographyMapGame - Interactive geography learning game
 * Ported from GCompris Geography activity
 */
import { LalelaGame } from '../utils/LalelaGame.js';
import levelsData from './data/geography_levels.json';

export class GeographyMapGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'geography',
      difficulty: 2,
      ...config
    });

    // Game state
    this.currentLevelIndex = 0;
    this.currentMapData = null;
    this.mapItems = [];
    this.targetItem = null;
    this.isGameActive = false;
    
    // Map container
    this.mapContainer = null;
    this.mapScale = 1;
    this.mapOffsetX = 0;
    this.mapOffsetY = 0;
  }

  init(data) {
    super.init(data);
    // Use level from data if provided, otherwise default to 1
    // Map level 1..N to index 0..N-1
    const level = data.level || this.level || 1;
    this.currentLevelIndex = (level - 1) % levelsData.length;
  }

  preload() {
    super.preload();
    
    // Load assets for the current level
    this.currentMapData = levelsData[this.currentLevelIndex];
    
    if (this.currentMapData && this.currentMapData.items) {
      this.currentMapData.items.forEach(item => {
        if (item.image) {
          // Check if it's an SVG
          const key = `geo_${this.currentLevelIndex}_${item.image}`;
          // Path relative to dist/assets/
          const path = `assets/geography/${item.image}`;
          this.load.svg(key, path);
        }
      });
    }
  }

  /**
   * LalelaGame calls createBackground() then createGameObjects() then createUI().
   * Keep all map sprites in createGameObjects so UI stays on top.
   */
  createGameObjects() {
    this.createMap();
  }

  createBackground() {
    // Standard Lalela background
    // Check if 'background' texture exists, otherwise use a color
    if (this.textures.exists('background')) {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
          .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
          .setDepth(-2);
    } else {
        this.cameras.main.setBackgroundColor('#b5ddff'); // Ocean blue
    }
  }

  createUI() {
    // Instruction text
    this.instructionText = this.add.text(this.cameras.main.centerX, 50, '', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold',
      backgroundColor: '#ffffff88',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(10);

    // Navigation dock
    this.createNavigationDock();
  }

  createMap() {
    // Container for the map to handle scaling/positioning together
    this.mapContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
    
    if (!this.currentMapData || !this.currentMapData.items) return;

    // Find background item
    const bgItem = this.currentMapData.items.find(i => i.type === 'SHAPE_BACKGROUND_IMAGE');
    let bgWidth = 800; // Default
    let bgHeight = 600;

    if (bgItem) {
      const key = `geo_${this.currentLevelIndex}_${bgItem.image}`;
      if (this.textures.exists(key)) {
          const bgImage = this.add.image(0, 0, key);
          bgWidth = bgImage.width;
          bgHeight = bgImage.height;
          
          // Center the background at 0,0 in the container
          // Top-left will be (-bgWidth/2, -bgHeight/2)
          bgImage.setOrigin(0.5, 0.5);
          this.mapContainer.add(bgImage);
      }
    }

    // Calculate scale to fit screen
    const maxW = this.cameras.main.width * 0.9;
    const maxH = this.cameras.main.height * 0.7;
    const scale = Math.min(maxW / bgWidth, maxH / bgHeight);
    this.mapContainer.setScale(scale);

    // Add interactive items
    this.currentMapData.items.forEach(item => {
      if (item.type === 'SHAPE_BACKGROUND_IMAGE') return;

      const key = `geo_${this.currentLevelIndex}_${item.image}`;
      if (!this.textures.exists(key)) return;
      
      const itemImage = this.add.image(0, 0, key);
      
      // Position
      // x and y are normalized coordinates (0-1) relative to background size
      // Since background is centered at 0,0, top-left is -bgWidth/2, -bgHeight/2
      const x = (parseFloat(item.x) * bgWidth) - (bgWidth / 2);
      const y = (parseFloat(item.y) * bgHeight) - (bgHeight / 2);
      
      // GCompris items seem to be positioned by their center? Or top-left?
      // QML Image x,y is top-left.
      // Phaser Image origin is 0.5, 0.5 by default.
      // So if we place it at (x,y), the center will be at (x,y).
      // But (x,y) is the top-left corner in QML.
      // So we should set origin to 0,0?
      // Or adjust position: x + width/2, y + height/2.
      // Let's try setting origin to 0,0 first as it matches QML semantics better for placement.
      itemImage.setOrigin(0, 0);
      itemImage.setPosition(x, y);
      
      // Make interactive
      // Use pixel perfect if possible, but it's expensive. 
      // For now, use standard hit area.
      itemImage.setInteractive({ useHandCursor: true });
      
      // Store data on the object
      itemImage.itemData = item;
      
      itemImage.on('pointerdown', () => this.handleItemClick(itemImage));
      itemImage.on('pointerover', () => itemImage.setTint(0xdddddd));
      itemImage.on('pointerout', () => itemImage.clearTint());

      this.mapContainer.add(itemImage);
      this.mapItems.push(itemImage);
    });
  }

  setupGameLogic() {
    this.instructionText.setText(this.currentMapData.instruction);
    // Delay start slightly
    this.time.delayedCall(1000, () => this.nextQuestion());
  }

  nextQuestion() {
    if (this.mapItems.length === 0) return;

    // Pick a random item
    const randomIndex = Phaser.Math.Between(0, this.mapItems.length - 1);
    this.targetItem = this.mapItems[randomIndex];
    
    // Show instruction
    const name = this.targetItem.itemData.toolTipText;
    this.instructionText.setText(`Find ${name}`);
    
    // Play audio (TTS fallback)
    this.speak(name);
    
    this.isGameActive = true;
  }

  handleItemClick(clickedImage) {
    if (!this.isGameActive) return;

    if (clickedImage === this.targetItem) {
      // Correct
      this.isGameActive = false;
      
      if (this.audioManager) {
          this.audioManager.playSound('success');
      }
      
      // Animation
      this.tweens.add({
        targets: clickedImage,
        scale: clickedImage.scale * 1.2,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          this.nextQuestion();
        }
      });
    } else {
      // Incorrect
      if (this.audioManager) {
          this.audioManager.playSound('error');
      }
      this.cameras.main.shake(200, 0.005);
    }
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      // Cancel previous
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
  
  createNavigationDock() {
      // Simple navigation dock
      const dockY = this.cameras.main.height - 60;
      
      // Back button
      const backBtn = this.add.text(50, dockY, '⬅ Back', { 
          fontSize: '24px', 
          color: '#ffffff',
          backgroundColor: '#00000088',
          padding: { x: 10, y: 5 }
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('GameMenu'));
      
      // Next Level button (debug/cheat)
      const nextBtn = this.add.text(this.cameras.main.width - 150, dockY, 'Next Level ➡', { 
          fontSize: '24px', 
          color: '#ffffff',
          backgroundColor: '#00000088',
          padding: { x: 10, y: 5 }
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
          this.level++;
          this.scene.restart({ level: this.level });
      });
  }
}
