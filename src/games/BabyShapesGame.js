import { DragDropGame } from './DragDropGame.js';
import { DraggableTile } from '../components/DraggableTile.js';
import { DropZone } from '../components/DropZone.js';

class ImageDraggable extends DraggableTile {
    createVisualElements() {
        const size = this.config.size || 100;
        
        // Add image
        // We use the key provided in config
        this.image = this.scene.add.image(0, 0, this.config.imageKey);
        
        // Scale image to fit within size, preserving aspect ratio
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

export class BabyShapesGame extends DragDropGame {
    constructor(config) {
        super({
            ...config,
            key: 'BabyShapesGame',
            title: 'Baby Shapes',
            description: 'Drag and drop the items to match them.',
            category: 'fun' // or 'discovery'
        });
        
        this.levels = [
            // Level 1
            {
                items: [
                    { id: 'baby_bottle', image: 'food/baby_bottle.svg', x: 0.5, y: 0.25 },
                    { id: 'orange', image: 'food/orange.svg', x: 0.2, y: 0.75 },
                    { id: 'cookie', image: 'food/cookie.svg', x: 0.8, y: 0.75 },
                    { id: 'chocolate', image: 'food/chocolate.svg', x: 0.5, y: 0.75 },
                    { id: 'marmelade', image: 'food/marmelade.svg', x: 0.8, y: 0.25 }
                ]
            },
            // Level 2
            {
                items: [
                    { id: 'sugar_box', image: 'food/sugar_box.svg', x: 0.5, y: 0.25 },
                    { id: 'milk_cup', image: 'food/milk_cup.svg', x: 0.2, y: 0.75 },
                    { id: 'yogurt', image: 'food/yogurt.svg', x: 0.8, y: 0.75 },
                    { id: 'milk_shake', image: 'food/milk_shake.svg', x: 0.5, y: 0.75 },
                    { id: 'bread_slice', image: 'food/bread_slice.svg', x: 0.8, y: 0.25 }
                ]
            },
            // Level 3
            {
                items: [
                    { id: 'french_croissant', image: 'food/french_croissant.svg', x: 0.5, y: 0.25 },
                    { id: 'butter', image: 'food/butter.svg', x: 0.2, y: 0.75 },
                    { id: 'pear', image: 'food/pear.svg', x: 0.8, y: 0.75 },
                    { id: 'banana', image: 'food/banana.svg', x: 0.5, y: 0.75 },
                    { id: 'round_cookie', image: 'food/round_cookie.svg', x: 0.8, y: 0.25 }
                ]
            },
            // Level 4
            {
                items: [
                    { id: 'grapefruit', image: 'food/grapefruit.svg', x: 0.5, y: 0.25 },
                    { id: 'chocolate_cake', image: 'food/chocolate_cake.svg', x: 0.2, y: 0.75 },
                    // { id: 'apple', image: 'food/apple.svg', x: 0.8, y: 0.75 }, // Missing apple?
                    { id: 'milk_cup', image: 'food/milk_cup.svg', x: 0.8, y: 0.75 }, // Reusing milk_cup
                    { id: 'baby_bottle', image: 'food/baby_bottle.svg', x: 0.5, y: 0.75 },
                    { id: 'orange', image: 'food/orange.svg', x: 0.8, y: 0.25 }
                ]
            }
        ];
    }

    preload() {
        super.preload();
        // Load all assets used in levels
        const loadedImages = new Set();
        this.levels.forEach(level => {
            level.items.forEach(item => {
                if (!loadedImages.has(item.image)) {
                    this.load.svg(`babyshapes-${item.id}`, `assets/babyshapes/${item.image}`);
                    loadedImages.add(item.image);
                }
            });
        });
    }

    createBackground() {
        // Simple gradient background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xDDDDDD, 0xDDDDDD, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        // Add instruction text
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, 'Drag and Drop the items to match them.', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        // Clear existing items
        this.draggableTiles.forEach(t => t.destroy());
        this.dropZones.forEach(z => z.destroy());
        this.draggableTiles = [];
        this.dropZones = [];
        
        const levelData = this.levels[levelIndex % this.levels.length];
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create drop zones (targets)
        levelData.items.forEach(item => {
            const x = item.x * width;
            const y = item.y * height;
            
            // Create a "hole" or target visual
            const zoneSize = 120;
            const zone = new DropZone(this, {
                x: x,
                y: y,
                width: zoneSize,
                height: zoneSize,
                expectedValue: item.id
            });
            
            // Add a visual representation of the target (e.g. silhouette or just the image with low opacity)
            const targetImage = this.add.image(0, 0, `babyshapes-${item.id}`);
            const scale = Math.min(100 / targetImage.width, 100 / targetImage.height);
            targetImage.setScale(scale);
            targetImage.setAlpha(0.3); // Ghost effect
            targetImage.setTint(0x000000); // Silhouette effect
            zone.add(targetImage);
            
            this.dropZones.push(zone);
            this.add.existing(zone);
        });

        // Create draggable tiles (sources)
        // In BabyShapes, the sources are usually at the bottom or scattered.
        // But looking at the QML, the "levels" array defines the positions of the TARGETS.
        // The sources need to be created and placed somewhere.
        // I'll place them in a row at the bottom or random positions?
        // Actually, in GCompris BabyShapes, the items are scattered and you drag them to the matching silhouette.
        // Or maybe the items ARE the targets and you drag from a bank?
        // "Drag and Drop the items to match them."
        
        // Let's assume we spawn the draggable items in the center or bottom.
        const startY = height - 100;
        const spacing = width / (levelData.items.length + 1);
        
        levelData.items.forEach((item, index) => {
            const tile = new ImageDraggable(this, {
                x: spacing * (index + 1),
                y: startY,
                value: item.id,
                imageKey: `babyshapes-${item.id}`,
                size: 100
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
            // Correct match
            tile.x = zone.x;
            tile.y = zone.y;
            tile.input.enabled = false; // Lock it
            tile.setAlpha(1);
            
            // Play success sound
            this.audioManager.playSound('success');
            
            this.correctPlacements++;
            
            if (this.correctPlacements >= this.totalPlacements) {
                this.time.delayedCall(1000, () => {
                    this.audioManager.playSound('win');
                    this.startLevel(this.levels.indexOf(this.levels.find(l => l === this.levels[this.currentLevelIndex])) + 1);
                });
            }
        } else {
            // Incorrect
            this.handleDropOutsideZone(tile);
        }
    }
}
