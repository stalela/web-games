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
        
        this.helpModal = null;
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

        // Navigation icons and background
        const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
        uiIcons.forEach(icon => this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`));
        this.load.svg('babyshapes-wood', 'assets/game-icons/background-wood.svg');
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        const bg = this.add.image(width / 2, height / 2, 'babyshapes-wood');
        const scale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(scale).setDepth(-2);
    }

    createUI() {
        super.createUI();

        // Hide default controls (if any) and draw our dock
        if (this.uiElements && this.uiElements.controls) {
            Object.values(this.uiElements.controls).forEach(control => {
                if (control && control.setVisible) control.setVisible(false);
            });
        }

        this.createNavigationDock(this.cameras.main.width, this.cameras.main.height);
        
        // Instruction banner
        const banner = this.add.rectangle(this.cameras.main.centerX, 60, Math.min(this.cameras.main.width * 0.9, 900), 70, 0xffffff)
            .setStrokeStyle(3, 0x0062ff)
            .setDepth(10)
            .setOrigin(0.5);
        this.instructionText = this.add.text(banner.x, banner.y, 'Drag and Drop the items to match them.', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#1d1d1d',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);
    }

    setupGameLogic() {
        this.currentLevelIndex = 0;
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        this.currentLevelIndex = levelIndex % this.levels.length;
        // Clear existing items
        this.draggableTiles.forEach(t => t.destroy());
        this.dropZones.forEach(z => z.destroy());
        this.draggableTiles = [];
        this.dropZones = [];
        
        const levelData = this.levels[levelIndex % this.levels.length];
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create drop zones (targets)
        const zoneSize = Math.min(width, height) * 0.18;
        levelData.items.forEach(item => {
            const x = item.x * width;
            const y = item.y * height;

            const zone = new DropZone(this, {
                x,
                y,
                width: zoneSize,
                height: zoneSize,
                expectedValue: item.id,
                color: 0x4d7cff,
                borderColor: 0xffffff,
                borderWidth: 4
            });

            const targetImage = this.add.image(0, 0, `babyshapes-${item.id}`);
            const scale = Math.min((zoneSize * 0.7) / targetImage.width, (zoneSize * 0.7) / targetImage.height);
            targetImage.setScale(scale);
            targetImage.setAlpha(0.35);
            targetImage.setTint(0x000000);
            zone.add(targetImage);

            // Orange center dot for alignment cue
            const dot = this.add.circle(0, 0, Math.max(6, zoneSize * 0.05), 0xf08a00, 0.9);
            zone.add(dot);
            dot.setDepth(2);

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
        
        // Vertical bank on the left
        const bankX = Math.min(120, width * 0.12);
        const availableHeight = height * 0.75;
        const startY = height * 0.2;
        const spacing = availableHeight / Math.max(levelData.items.length, 1);

        levelData.items.forEach((item, index) => {
            const tile = new ImageDraggable(this, {
                x: bankX,
                y: startY + index * spacing,
                value: item.id,
                imageKey: `babyshapes-${item.id}`,
                size: Math.min(140, width * 0.14)
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
                    this.startLevel(this.currentLevelIndex + 1);
                });
            }
        } else {
            // Incorrect
            this.handleDropOutsideZone(tile);
        }
    }

    showHelpModal() {
        // Toggle existing modal
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
            'Drag each food item from the left column.',
            'Drop it on the matching silhouette on the board.',
            'When all items are matched, the level advances.',
            'Use reload to restart the current level.'
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
