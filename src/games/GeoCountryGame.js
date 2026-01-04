import { DragDropGame } from './DragDropGame.js';

export class GeoCountryGame extends DragDropGame {
  constructor(config) {
    super({
      key: 'GeoCountry',
      title: 'Geography: France',
      category: 'geography',
      description: 'Drag and drop the regions of France to their correct location.',
      ...config
    });

    // Hardcoded level data for France (converted from board1_0.qml)
    this.levelData = [
      {
         "pixmapfile" : "france/france.svg",
         "type" : "SHAPE_BACKGROUND_IMAGE"
      },
      {
         "pixmapfile" : "france/corsica.svg",
         "x" : 0.9454,
         "y" : 0.8898,
         "name" : "Corsica"
      },
      {
         "pixmapfile" : "france/nouvelle-aquitaine.svg",
         "x" : 0.3499,
         "y" : 0.6263,
         "name" : "Nouvelle-Aquitaine"
      },
      {
         "pixmapfile" : "france/occitanie.svg",
         "x" : 0.4734,
         "y" : 0.7584,
         "name" : "Occitanie"
      },
      {
         "pixmapfile" : "france/paca.svg",
         "x" : 0.7256,
         "y" : 0.7177,
         "name" : "Provence-Alpes-Côte d'Azur"
      },
      {
         "pixmapfile" : "france/auvergne-rhone-alpes.svg",
         "x" : 0.632,
         "y" : 0.5817,
         "name" : "Auvergne-Rhône-Alpes"
      },
      {
         "pixmapfile" : "france/centre-val_de_loire.svg",
         "x" : 0.4359,
         "y" : 0.3658,
         "name" : "Centre-Val de Loire"
      },
      {
         "pixmapfile" : "france/pays_de_la_loire.svg",
         "x" : 0.2845,
         "y" : 0.3827,
         "name" : "Pays de la Loire"
      },
      {
         "pixmapfile" : "france/ile-de-france.svg",
         "x" : 0.4945,
         "y" : 0.263,
         "name" : "Île-de-France"
      },
      {
         "pixmapfile" : "france/brittany.svg",
         "x" : 0.1475,
         "y" : 0.3082,
         "name" : "Brittany"
      },
      {
         "pixmapfile" : "france/normandy.svg",
         "x" : 0.339,
         "y" : 0.2175,
         "name" : "Normandy"
      },
      {
         "pixmapfile" : "france/hauts_de_france.svg",
         "x" : 0.5149,
         "y" : 0.1357,
         "name" : "Hauts de France"
      },
      {
         "pixmapfile" : "france/grand_est.svg",
         "x" : 0.698,
         "y" : 0.2476,
         "name" : "Grand est"
      },
      {
         "pixmapfile" : "france/bourgogne-franche-comte.svg",
         "x" : 0.6514,
         "y" : 0.4027,
         "name" : "Bourgogne-Franche-Comté"
      }
    ];
  }

  preload() {
    super.preload();
    // Load assets
    this.levelData.forEach(item => {
        const path = `assets/geo_country/${item.pixmapfile}`;
        const key = item.pixmapfile.replace('.svg', '').replace('france/', '');
        this.load.svg(key, path);
    });
  }

  create() {
    super.create();
    // Background is created by super.create() -> createBackground()
    // But we need to place the map background specifically
    this.setupMap();
  }

  setupMap() {
      // Find background item
      const bgItem = this.levelData.find(item => item.type === 'SHAPE_BACKGROUND_IMAGE');
      if (bgItem) {
          const key = bgItem.pixmapfile.replace('.svg', '').replace('france/', '');
          // Place map in center, scaled to fit
          const map = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, key);
          
          // Scale logic: fit within 80% of screen
          const maxWidth = this.cameras.main.width * 0.8;
          const maxHeight = this.cameras.main.height * 0.8;
          const scale = Math.min(maxWidth / map.width, maxHeight / map.height);
          map.setScale(scale);
          
          this.mapImage = map;
          this.mapScale = scale;
          // Store map bounds for coordinate calculation
          this.mapBounds = {
              x: map.x - (map.width * scale) / 2,
              y: map.y - (map.height * scale) / 2,
              width: map.width * scale,
              height: map.height * scale
          };
      }
  }

  createDropZones() {
      // Create drop zones based on coordinates
      this.levelData.forEach(item => {
          if (item.type === 'SHAPE_BACKGROUND_IMAGE') return;
          
          const key = item.pixmapfile.replace('.svg', '').replace('france/', '');
          
          // Calculate position based on map bounds
          // GCompris coordinates are normalized 0-1 relative to the map size
          const x = this.mapBounds.x + (item.x * this.mapBounds.width);
          const y = this.mapBounds.y + (item.y * this.mapBounds.height);
          
          // Create a zone (invisible or semi-transparent)
          // We use the image itself as the zone shape? 
          // Or just a circle/rect?
          // Let's use the image as a "ghost" zone
          const zone = this.add.image(x, y, key);
          zone.setScale(this.mapScale);
          zone.setAlpha(0.3); // Faint ghost
          zone.setTint(0x000000); // Dark silhouette
          
          // Make it a drop zone
          zone.setInteractive({ dropZone: true });
          zone.name = item.name;
          zone.itemKey = key; // Store key to match with draggable
          
          this.dropZones.push(zone);
      });
  }

  createDraggables() {
      // Create draggable pieces
      // Place them scattered around the map or in a tray
      
      const trayX = this.cameras.main.width * 0.1; // Left side tray?
      // Or just scatter them randomly outside the map area?
      
      this.levelData.forEach((item, index) => {
          if (item.type === 'SHAPE_BACKGROUND_IMAGE') return;
          
          const key = item.pixmapfile.replace('.svg', '').replace('france/', '');
          
          // Random position outside the map or in a specific area
          // Let's put them on the left and right sides
          const side = index % 2 === 0 ? 'left' : 'right';
          let startX;
          if (side === 'left') {
              startX = Phaser.Math.Between(50, this.mapBounds.x - 50);
          } else {
              startX = Phaser.Math.Between(this.mapBounds.x + this.mapBounds.width + 50, this.cameras.main.width - 50);
          }
          
          const startY = Phaser.Math.Between(100, this.cameras.main.height - 100);
          
          const piece = this.add.image(startX, startY, key);
          piece.setScale(this.mapScale);
          
          this.input.setDraggable(piece);
          piece.name = item.name;
          piece.itemKey = key;
          
          // Add tooltip/text on hover?
          
          this.draggables.push(piece);
      });
  }
  
  handleDrop(pointer, gameObject, dropZone) {
      // Check if correct match
      if (gameObject.itemKey === dropZone.itemKey) {
          // Snap to zone
          gameObject.x = dropZone.x;
          gameObject.y = dropZone.y;
          gameObject.input.enabled = false; // Disable dragging
          dropZone.setAlpha(0); // Hide zone
          
          // Play success sound
          this.audioManager.play('success');
          
          // Check win condition
          this.checkWinCondition();
      } else {
          // Return to start
          this.tweens.add({
              targets: gameObject,
              x: gameObject.input.dragStartX,
              y: gameObject.input.dragStartY,
              duration: 300,
              ease: 'Back.easeOut'
          });
          this.audioManager.play('error');
      }
  }
  
  checkWinCondition() {
      const allPlaced = this.draggables.every(d => !d.input.enabled);
      if (allPlaced) {
          this.time.delayedCall(500, () => {
              this.audioManager.play('win');
              // Show win modal
              this.scene.start('GameMenu'); // Or next level
          });
      }
  }
}
