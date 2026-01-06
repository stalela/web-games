import { DragDropGame } from './DragDropGame.js';
import { DraggableTile } from '../components/DraggableTile.js';
import { DropZone } from '../components/DropZone.js';

class TangramPiece extends DraggableTile {
    createVisualElements() {
        const size = this.config.size || 100;
        const baseColor = 0xffffff;
        const strokeColor = 0xcccccc;
        const shadowColor = 0x000000;

        this.shadow = this.scene.add.rectangle(2, 2, size, size, shadowColor, 0.08);
        this.shadow.setStrokeStyle(2, shadowColor, 0.1);
        this.shadow.setOrigin(0.5);

        this.background = this.scene.add.rectangle(0, 0, size, size, baseColor, 1);
        this.background.setStrokeStyle(3, strokeColor, 1);
        this.background.setOrigin(0.5);
        
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
        
        this.add([this.shadow, this.background, this.image]);
        
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
        
        this.helpModal = null;
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
        const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
        uiIcons.forEach(icon => this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`));
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
        this.bgGraphics.fillGradientStyle(0xd6e9ff, 0xd6e9ff, 0xb6d5ff, 0xb6d5ff, 1);
        this.bgGraphics.fillRect(0, 0, width, height);
        this.bgGraphics.setDepth(-2);
        
        this.bgImage = this.add.image(width/2, height/2, null);
        this.bgImage.setDepth(-1);
    }

    createUI() {
        super.createUI();
        if (this.uiElements && this.uiElements.controls) {
            Object.values(this.uiElements.controls).forEach(control => {
                if (control && control.setVisible) control.setVisible(false);
            });
        }

        this.createNavigationDock(this.cameras.main.width, this.cameras.main.height);

        this.instructionText = this.add.text(this.cameras.main.centerX, 50, 'Complete the puzzle.', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#1d1d1d',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);
    }

    setupGameLogic() {
        this.currentLevelIndex = 0;
        this.startLevel(this.currentLevelIndex);
    }

    startLevel(levelIndex) {
        this.currentLevelIndex = levelIndex % this.levels.length;
        // Clear existing
        this.draggableTiles.forEach(t => t.destroy());
        this.dropZones.forEach(z => z.destroy());
        this.draggableTiles = [];
        this.dropZones = [];
        
        const levelData = this.levels[this.currentLevelIndex];
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
                expectedValue: item.id,
                color: 0xffffff,
                borderColor: 0xd0d0d0,
                borderWidth: 2
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
            
            targetImage.setAlpha(0.32);
            targetImage.setTint(0x7f7f7f);
            zone.add(targetImage);
            
            this.dropZones.push(zone);
            this.add.existing(zone);
        });

        // Create draggable pieces along the top row (match GCompris train layout)
        const bankY = height * 0.2;
        const spacing = width / (levelData.items.length + 1);
        
        levelData.items.forEach((item, index) => {
            const tile = new TangramPiece(this, {
                x: spacing * (index + 1),
                y: bankY,
                value: item.id,
                imageKey: `babytangram-${item.image.replace(/\//g, '-')}`,
                size: Math.min(120, width * 0.14),
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
                    this.startLevel(this.currentLevelIndex + 1);
                });
            }
        } else {
            this.handleDropOutsideZone(tile);
        }
    }

    showHelpModal() {
        if (this.helpModal) {
            this.helpModal.destroy(true);
            this.helpModal = null;
            return;
        }

        const { width, height } = this.cameras.main;
        const panelWidth = Math.min(width * 0.7, 720);
        const panelHeight = Math.min(height * 0.7, 440);

        const container = this.add.container(width / 2, height / 2).setDepth(200);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.45)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => { container.destroy(true); this.helpModal = null; });

        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0xffffff)
            .setStrokeStyle(3, 0x0062ff)
            .setOrigin(0.5);

        const title = this.add.text(0, -panelHeight / 2 + 40, 'How to Play', {
            fontSize: '32px', color: '#0a0a0a', fontStyle: 'bold'
        }).setOrigin(0.5);

        const steps = [
            'Drag each piece from the top row.',
            'Drop it onto the matching silhouette.',
            'Match all pieces to finish and move to the next vehicle.',
            'Use reload to restart the current puzzle.'
        ];

        const body = this.add.text(-panelWidth / 2 + 40, -panelHeight / 2 + 90, steps.join('\n'), {
            fontSize: '22px', color: '#222222', wordWrap: { width: panelWidth - 80 }
        }).setOrigin(0, 0);

        const closeBtn = this.add.rectangle(0, panelHeight / 2 - 50, 140, 46, 0x0062ff)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => { container.destroy(true); this.helpModal = null; });

        const closeLabel = this.add.text(0, panelHeight / 2 - 50, 'Close', {
            fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([overlay, panel, title, body, closeBtn, closeLabel]);
        this.helpModal = container;
    }
}
