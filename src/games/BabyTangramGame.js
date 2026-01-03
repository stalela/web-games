import { DragDropGame } from './DragDropGame.js';
import { DraggableTile } from '../components/DraggableTile.js';
import { DropZone } from '../components/DropZone.js';

class TangramPiece extends DraggableTile {
    createVisualElements() {
        const size = this.config.size || 100;
        
        // Add image
        this.image = this.scene.add.image(0, 0, this.config.imageKey);
        
        // Apply flipping if needed
        if (this.config.flipping) {
            this.image.setFlipX(true);
        }
        
        // Apply rotation if needed
        if (this.config.rotation) {
            this.image.setAngle(this.config.rotation);
        }

        // Scale image to fit within size, preserving aspect ratio
        // But for Tangram, relative sizes matter.
        // The config provides width/height relative to screen/board.
        // We should probably respect that if possible, or just scale to a standard size.
        // For simplicity, we'll scale to fit the tile size for now.
        const scale = Math.min(size / this.image.width, size / this.image.height);
        this.image.setScale(scale);
        
        this.add(this.image);
        
        // Add a subtle shadow/glow when dragging
        this.glow = this.scene.add.rectangle(0, 0, size + 10, size + 10, 0xFFFFFF, 0);
        this.glow.setStrokeStyle(4, 0xFFFF00, 0);
        this.addAt(this.glow, 0);
    }
    
    setDragging(isDragging) {
        super.setDragging(isDragging);
        if (this.glow) {
            this.glow.setAlpha(isDragging ? 0.5 : 0);
            this.glow.strokeAlpha = isDragging ? 1 : 0;
        }
    }
}

export class BabyTangramGame extends DragDropGame {
    constructor(config) {
        super({
            ...config,
            key: 'BabyTangramGame',
            title: 'Baby Tangram',
            description: 'Complete the puzzle by dragging the pieces.',
            category: 'fun'
        });
        
        this.levels = [
            // Level 1: Train
            {
                name: 'train1',
                items: [
                    { id: 'loco', image: 'train/loco.svg', x: 0.16, y: 0.50, width: 0.237, height: 0.238 },
                    { id: 'coal', image: 'train/coal.svg', x: 0.38, y: 0.54, width: 0.221, height: 0.144 },
                    { id: 'wood', image: 'train/wood.svg', x: 0.61, y: 0.54, width: 0.235, height: 0.141 },
                    { id: 'passenger', image: 'train/passenger.svg', x: 0.83, y: 0.51, width: 0.238, height: 0.213 }
                ]
            },
            // Level 2: Truck
            {
                name: 'truck',
                bg: 'truck/traffic_bg.svg',
                items: [
                    { id: 'cabin', image: 'truck/cabin.svg', x: 0.847, y: 0.435, width: 0.207, height: 0.178 },
                    { id: 'container', image: 'truck/container.svg', x: 0.358, y: 0.489, width: 0.676, height: 0.271 },
                    { id: 'back_road', image: 'truck/back_road.svg', x: 0.181, y: 0.633, width: 0.198, height: 0.092 },
                    { id: 'front_road', image: 'truck/front_road.svg', x: 0.766, y: 0.617, width: 0.403, height: 0.121 },
                    { id: 'engine', image: 'truck/engine.svg', x: 0.860, y: 0.573, width: 0.233, height: 0.109 }
                ]
            },
            // Level 3: Car
            {
                name: 'car',
                bg: 'car1/car.svg',
                items: [
                    { id: 'windshield', image: 'car1/windshield.svg', x: 0.5, y: 0.309, width: 0.563, height: 0.227 },
                    { id: 'tire_right', image: 'car1/tire_right.svg', x: 0.226, y: 0.720, width: 0.126, height: 0.147 },
                    { id: 'tire_left', image: 'car1/tire_right.svg', x: 0.782, y: 0.720, width: 0.126, height: 0.147, flipping: true },
                    { id: 'bumper', image: 'car1/bumper.svg', x: 0.5, y: 0.668, width: 0.710, height: 0.184 },
                    { id: 'grille', image: 'car1/grille.svg', x: 0.505, y: 0.600, width: 0.365, height: 0.051 },
                    { id: 'headlights_right', image: 'car1/headlights.svg', x: 0.768, y: 0.513, width: 0.134, height: 0.125 },
                    { id: 'headlights_left', image: 'car1/headlights.svg', x: 0.232, y: 0.513, width: 0.134, height: 0.125, flipping: true }
                ]
            }
        ];
    }

    preload() {
        super.preload();
        const loadedImages = new Set();
        this.levels.forEach(level => {
            if (level.bg && !loadedImages.has(level.bg)) {
                this.load.svg(`babytangram-bg-${level.name}`, `assets/baby_tangram/${level.bg}`);
                loadedImages.add(level.bg);
            }
            level.items.forEach(item => {
                if (!loadedImages.has(item.image)) {
                    this.load.svg(`babytangram-${item.image.replace(/\//g, '-')}`, `assets/baby_tangram/${item.image}`);
                    loadedImages.add(item.image);
                }
            });
        });
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.bgGraphics = this.add.graphics();
        this.bgGraphics.fillGradientStyle(0xE0F7FA, 0xE0F7FA, 0xB2EBF2, 0xB2EBF2, 1);
        this.bgGraphics.fillRect(0, 0, width, height);
        this.bgGraphics.setDepth(-2);
        
        this.bgImage = this.add.image(width/2, height/2, null);
        this.bgImage.setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, 'Complete the puzzle.', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.currentLevelIndex = 0;
        this.startLevel(this.currentLevelIndex);
    }

    startLevel(levelIndex) {
        // Clear existing
        this.draggableTiles.forEach(t => t.destroy());
        this.dropZones.forEach(z => z.destroy());
        this.draggableTiles = [];
        this.dropZones = [];
        
        const levelData = this.levels[levelIndex % this.levels.length];
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set background if available
        if (levelData.bg) {
            this.bgImage.setTexture(`babytangram-bg-${levelData.name}`);
            // Scale to fit
            const scale = Math.min(width / this.bgImage.width, height / this.bgImage.height);
            this.bgImage.setScale(scale);
            this.bgImage.setVisible(true);
        } else {
            this.bgImage.setVisible(false);
        }

        // Create drop zones (targets)
        levelData.items.forEach(item => {
            const x = item.x * width;
            const y = item.y * height;
            
            // Use width/height from config if available to size the zone
            const zoneWidth = item.width ? item.width * width : 100;
            const zoneHeight = item.height ? item.height * height : 100;
            
            const zone = new DropZone(this, {
                x: x,
                y: y,
                width: zoneWidth,
                height: zoneHeight,
                expectedValue: item.id
            });
            
            // Visual target (silhouette)
            const targetImage = this.add.image(0, 0, `babytangram-${item.image.replace(/\//g, '-')}`);
            
            // Scale logic
            // If width/height provided, scale to match
            if (item.width && item.height) {
                targetImage.setDisplaySize(item.width * width, item.height * height);
            } else {
                const scale = Math.min(100 / targetImage.width, 100 / targetImage.height);
                targetImage.setScale(scale);
            }
            
            if (item.flipping) targetImage.setFlipX(true);
            if (item.rotation) targetImage.setAngle(item.rotation);
            
            targetImage.setAlpha(0.3);
            targetImage.setTint(0x000000);
            zone.add(targetImage);
            
            this.dropZones.push(zone);
            this.add.existing(zone);
        });

        // Create draggable pieces
        // Place them at the bottom or side
        const startY = height - 80;
        const spacing = width / (levelData.items.length + 1);
        
        levelData.items.forEach((item, index) => {
            const tile = new TangramPiece(this, {
                x: spacing * (index + 1),
                y: startY,
                value: item.id,
                imageKey: `babytangram-${item.image.replace(/\//g, '-')}`,
                size: 80, // Smaller size for the bank
                flipping: item.flipping,
                rotation: item.rotation
            });
            
            this.draggableTiles.push(tile);
            this.add.existing(tile);
        });
        
        this.totalPlacements = levelData.items.length;
        this.correctPlacements = 0;
        this.levelComplete = false;
    }

    handleDropInZone(tile, zone) {
        if (tile.value === zone.expectedValue) {
            tile.x = zone.x;
            tile.y = zone.y;
            
            // Scale up to match target size if needed
            // In startLevel we set target size based on item.width/height
            // We should probably store that info or retrieve it from zone
            // For now, let's just let it be.
            
            tile.input.enabled = false;
            tile.setAlpha(1);
            
            this.audioManager.playSound('success');
            this.correctPlacements++;
            
            if (this.correctPlacements >= this.totalPlacements) {
                this.time.delayedCall(1000, () => {
                    this.audioManager.playSound('win');
                    this.currentLevelIndex++;
                    this.startLevel(this.currentLevelIndex);
                });
            }
        } else {
            this.handleDropOutsideZone(tile);
        }
    }
}
