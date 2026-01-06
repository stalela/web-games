import { DragDropGame } from './DragDropGame.js';
import { DraggableTile } from '../components/DraggableTile.js';
import { DropZone } from '../components/DropZone.js';

/**
 * ImageDraggable - A draggable image piece with circular frame like GCompris
 */
class ImageDraggable extends DraggableTile {
    createVisualElements() {
        const size = this.config.size || 80;
        this.config.color = this.config.color || 0x8b4513;
        this.config.borderColor = this.config.borderColor || 0x654321;

        // Circular background frame (wood style)
        this.frame = this.scene.add.circle(0, 0, size / 2 + 8, 0x8b4513, 1);
        this.frame.setStrokeStyle(4, 0x654321, 1);

        // Inner circle for image
        this.innerCircle = this.scene.add.circle(0, 0, size / 2, 0xffffff, 1);

        // Image (clipped to circle visually)
        this.image = this.scene.add.image(0, 0, this.config.imageKey);

        // Scale image to fit within size, preserving aspect ratio
        const scale = Math.min(size / this.image.width, size / this.image.height);
        this.image.setScale(scale);

        // Selection glow
        this.glow = this.scene.add.circle(0, 0, size / 2 + 12, 0xFFFF00, 0);
        this.glow.setStrokeStyle(4, 0xFFFF00, 0);

        this.add([this.glow, this.frame, this.innerCircle, this.image]);

        // Create a fake background for DraggableTile hover compatibility
        this.background = this.frame;
    }

    setDragging(isDragging) {
        super.setDragging(isDragging);
        if (this.glow) {
            this.glow.setAlpha(isDragging ? 0.5 : 0);
            this.glow.strokeAlpha = isDragging ? 1 : 0;
        }
        if (this.frame) {
            this.frame.setStrokeStyle(4, isDragging ? 0xFFAA00 : 0x654321, 1);
        }
    }
}

export class DetailsGame extends DragDropGame {
    constructor(config) {
        super({
            ...config,
            key: 'DetailsGame',
            title: 'Find the Details',
            description: 'Drag the missing pieces to complete the picture.',
            category: 'fun'
        });

        this.helpModal = null;

        // Levels from GCompris board files with exact coordinates
        this.levels = [
            {
                name: 'VincentVanGogh0012',
                instruction: 'Vincent van Gogh, Entrance Hall of Saint-Paul Hospital - 1889',
                bg: 'image/VincentVanGogh0012_background.webp',
                items: [
                    { id: '0', image: 'image/VincentVanGogh0012_0.webp', x: 0.543, y: 0.102 },
                    { id: '1', image: 'image/VincentVanGogh0012_1.webp', x: 0.601, y: 0.468 }
                ]
            },
            {
                name: 'VincentVanGoghBridge',
                instruction: 'Vincent van Gogh, The Bridge of Langlois at Arles - 1888',
                bg: 'image/VincentVanGoghBridge_background.webp',
                items: [
                    { id: '0', image: 'image/VincentVanGoghBridge_0.webp', x: 0.56, y: 0.536 },
                    { id: '1', image: 'image/VincentVanGoghBridge_1.webp', x: 0.943, y: 0.5 }
                ]
            },
            {
                name: 'Eglise_dAuvers',
                instruction: 'Vincent van Gogh, The Church at Auvers-sur-Oise - 1890',
                bg: 'image/Eglise_dAuvers-sur-Oise_background.webp',
                items: [
                    { id: '0', image: 'image/Eglise_dAuvers-sur-Oise_0.webp', x: 0.181, y: 0.78 },
                    { id: '1', image: 'image/Eglise_dAuvers-sur-Oise_1.webp', x: 0.577, y: 0.178 },
                    { id: '2', image: 'image/Eglise_dAuvers-sur-Oise_2.webp', x: 0.091, y: 0.56 }
                ]
            },
            {
                name: 'TourEiffel',
                instruction: 'Eiffel Tower, Paris',
                bg: 'image/TourEiffel_background.webp',
                items: [
                    { id: '0', image: 'image/TourEiffel_0.webp', x: 0.5, y: 0.15 },
                    { id: '1', image: 'image/TourEiffel_1.webp', x: 0.5, y: 0.55 }
                ]
            },
            {
                name: 'TajMahal',
                instruction: 'Taj Mahal, India',
                bg: 'image/TajMahal_background.webp',
                items: [
                    { id: '0', image: 'image/TajMahal_0.webp', x: 0.217, y: 0.465 },
                    { id: '1', image: 'image/TajMahal_1.webp', x: 0.789, y: 0.465 },
                    { id: '2', image: 'image/TajMahal_2.webp', x: 0.5, y: 0.273 },
                    { id: '3', image: 'image/TajMahal_3.webp', x: 0.113, y: 0.373 },
                    { id: '4', image: 'image/TajMahal_4.webp', x: 0.887, y: 0.373 },
                    { id: '5', image: 'image/TajMahal_5.webp', x: 0.5, y: 0.627 }
                ]
            },
            {
                name: 'Neuschwanstein',
                instruction: 'Neuschwanstein Castle, Germany',
                bg: 'image/Neuschwanstein_background.webp',
                items: [
                    { id: '0', image: 'image/Neuschwanstein_0.webp', x: 0.667, y: 0.133 },
                    { id: '1', image: 'image/Neuschwanstein_1.webp', x: 0.533, y: 0.267 },
                    { id: '2', image: 'image/Neuschwanstein_2.webp', x: 0.4, y: 0.4 }
                ]
            }
        ];
    }

    preload() {
        super.preload();
        // Load UI icons
        const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
        uiIcons.forEach(icon => this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`));

        // Load wood background textures
        this.load.svg('wood-bg-main', 'assets/details/resource/backgroundW01.svg');
        this.load.svg('wood-bg-panel', 'assets/details/resource/backgroundW02.svg');

        // Load all level assets
        const loadedImages = new Set();
        this.levels.forEach(level => {
            if (level.bg && !loadedImages.has(level.bg)) {
                this.load.image(`details-bg-${level.name}`, `assets/details/${level.bg}`);
                loadedImages.add(level.bg);
            }
            level.items.forEach(item => {
                if (!loadedImages.has(item.image)) {
                    this.load.image(`details-${item.image.replace(/\//g, '-')}`, `assets/details/${item.image}`);
                    loadedImages.add(item.image);
                }
            });
        });
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Main wood background (full screen)
        this.bgWood = this.add.image(width / 2, height / 2, 'wood-bg-main');
        this.bgWood.setDisplaySize(width, height);
        this.bgWood.setDepth(-2);

        // Left panel for pieces (wood strip panel)
        this.leftPanel = this.add.image(60, height / 2, 'wood-bg-panel');
        this.leftPanel.setDisplaySize(120, height);
        this.leftPanel.setDepth(2);

        // Main image container will be set per level
        this.bgImage = null;
    }

    createUI() {
        super.createUI();
        // Hide default controls if any
        if (this.uiElements && this.uiElements.controls) {
            Object.values(this.uiElements.controls).forEach(control => {
                if (control && control.setVisible) control.setVisible(false);
            });
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Navigation dock
        this.createNavigationDock(width, height);

        // Instruction text
        this.instructionText = this.add.text(width / 2 + 60, 30, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
    }

    createNavigationDock(width, height) {
        const dockY = height - 40;
        const iconSize = 40;
        const iconSpacing = 60;
        const icons = ['exit', 'home', 'help'];
        const startX = width / 2 - ((icons.length - 1) * iconSpacing) / 2 + 60;

        // Dock background
        const dockWidth = icons.length * iconSpacing + 40;
        const dockBg = this.add.rectangle(width / 2 + 60, dockY, dockWidth, 56, 0x4a4a4a, 0.85);
        dockBg.setStrokeStyle(2, 0x666666, 1);
        dockBg.setDepth(10);

        icons.forEach((iconName, i) => {
            const x = startX + i * iconSpacing;
            const iconBtn = this.add.image(x, dockY, iconName);
            iconBtn.setDisplaySize(iconSize, iconSize);
            iconBtn.setDepth(11);
            iconBtn.setInteractive({ useHandCursor: true });
            iconBtn.on('pointerover', () => iconBtn.setScale(1.15));
            iconBtn.on('pointerout', () => iconBtn.setScale(1));
            iconBtn.on('pointerdown', () => {
                if (this.audioManager) this.audioManager.playSound('click');
                switch (iconName) {
                    case 'exit':
                    case 'home':
                        this.scene.start('GameMenu');
                        break;
                    case 'help':
                        this.showHelpModal();
                        break;
                }
            });
        });

        // Level navigation arrows
        this.prevBtn = this.add.text(width / 2 - 40, dockY, '❮', {
            fontSize: '36px',
            color: '#FFB800',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
        this.prevBtn.on('pointerdown', () => {
            if (this.currentLevelIndex > 0) {
                this.startLevel(this.currentLevelIndex - 1);
            }
        });

        this.levelNumText = this.add.text(width / 2 + 60, dockY, '1', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        this.nextBtn = this.add.text(width / 2 + 160, dockY, '❯', {
            fontSize: '36px',
            color: '#FFB800',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
        this.nextBtn.on('pointerdown', () => {
            if (this.currentLevelIndex < this.levels.length - 1) {
                this.startLevel(this.currentLevelIndex + 1);
            }
        });
    }

    showHelpModal() {
        if (this.helpModal) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.helpModal = this.add.container(width / 2, height / 2).setDepth(100);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        overlay.setInteractive();

        const panel = this.add.rectangle(0, 0, 450, 300, 0xffffff, 1);
        panel.setStrokeStyle(3, 0x8b4513, 1);

        const title = this.add.text(0, -110, '🔍 Find the Details', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(0, -20, [
            '• Look at the picture with missing pieces',
            '• Drag pieces from the left panel',
            '• Drop them in the correct spots',
            '• Complete all pieces to finish the level!'
        ].join('\n'), {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#555',
            lineSpacing: 8,
            align: 'left'
        }).setOrigin(0.5);

        const closeBtn = this.add.rectangle(0, 100, 120, 45, 0x8b4513, 1);
        closeBtn.setStrokeStyle(2, 0x654321, 1);
        closeBtn.setInteractive({ useHandCursor: true });
        const closeText = this.add.text(0, 100, 'Got it!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xa0522d));
        closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x8b4513));
        closeBtn.on('pointerdown', () => this.closeHelpModal());

        this.helpModal.add([overlay, panel, title, instructions, closeBtn, closeText]);
    }

    closeHelpModal() {
        if (this.helpModal) {
            this.helpModal.destroy();
            this.helpModal = null;
        }
    }

    setupGameLogic() {
        this.currentLevelIndex = 0;
        this.startLevel(this.currentLevelIndex);
    }

    startLevel(levelIndex) {
        this.currentLevelIndex = levelIndex % this.levels.length;

        // Clear existing tiles and zones
        this.draggableTiles.forEach(t => t.destroy());
        this.dropZones.forEach(z => z.destroy());
        this.draggableTiles = [];
        this.dropZones = [];

        // Clear previous background image
        if (this.bgImage) {
            this.bgImage.destroy();
        }

        const levelData = this.levels[this.currentLevelIndex];
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Update instruction text
        if (this.instructionText) {
            this.instructionText.setText(levelData.instruction);
        }

        // Update level number
        if (this.levelNumText) {
            this.levelNumText.setText(`${this.currentLevelIndex + 1}`);
        }

        // Main painting area (right of left panel)
        const paintingAreaX = 140;
        const paintingAreaWidth = width - paintingAreaX - 20;
        const paintingAreaHeight = height - 120;

        // Set background image
        this.bgImage = this.add.image(0, 0, `details-bg-${levelData.name}`);
        const scale = Math.min(paintingAreaWidth / this.bgImage.width, paintingAreaHeight / this.bgImage.height);
        this.bgImage.setScale(scale);

        // Center the image in the painting area
        const imgCenterX = paintingAreaX + paintingAreaWidth / 2;
        const imgCenterY = 60 + paintingAreaHeight / 2;
        this.bgImage.setPosition(imgCenterX, imgCenterY);
        this.bgImage.setDepth(0);

        // Calculate image bounds for positioning drop zones
        const imgWidth = this.bgImage.width * scale;
        const imgHeight = this.bgImage.height * scale;
        const imgLeft = imgCenterX - imgWidth / 2;
        const imgTop = imgCenterY - imgHeight / 2;

        // Create drop zones (white holes on the image)
        levelData.items.forEach((item, index) => {
            const x = imgLeft + item.x * imgWidth;
            const y = imgTop + item.y * imgHeight;

            // Get the actual detail image to size the hole correctly
            const detailKey = `details-${item.image.replace(/\//g, '-')}`;
            const detailImg = this.textures.get(detailKey);
            const detailWidth = detailImg.source[0].width * scale;
            const detailHeight = detailImg.source[0].height * scale;

            const zone = new DropZone(this, {
                x: x,
                y: y,
                width: detailWidth,
                height: detailHeight,
                expectedValue: item.id
            });

            // White "hole" rectangle showing missing area
            const hole = this.add.rectangle(0, 0, detailWidth, detailHeight, 0xFFFFFF, 1);
            zone.add(hole);
            zone.setDepth(1);

            this.dropZones.push(zone);
            this.add.existing(zone);
        });

        // Create draggable pieces on left panel
        const piecesCount = levelData.items.length;
        const pieceSpacing = Math.min(100, (height - 150) / piecesCount);
        const startY = 80 + (height - 150 - pieceSpacing * piecesCount) / 2;

        levelData.items.forEach((item, index) => {
            const tile = new ImageDraggable(this, {
                x: 60,
                y: startY + index * pieceSpacing,
                value: item.id,
                imageKey: `details-${item.image.replace(/\//g, '-')}`,
                size: 70,
                color: 0x8b4513,
                borderColor: 0x654321
            });
            tile.originalX = 60;
            tile.originalY = startY + index * pieceSpacing;
            tile.setDepth(5);

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
            tile.input.enabled = false;

            // Hide the circular frame, show just the image
            if (tile.frame) tile.frame.setVisible(false);
            if (tile.innerCircle) tile.innerCircle.setVisible(false);
            if (tile.glow) tile.glow.setVisible(false);

            // Hide the hole
            if (zone.list && zone.list[0]) {
                zone.list[0].setVisible(false);
            }

            if (this.audioManager) this.audioManager.playSound('success');
            this.correctPlacements++;

            if (this.correctPlacements >= this.totalPlacements) {
                this.time.delayedCall(1000, () => {
                    if (this.audioManager) this.audioManager.playSound('win');
                    if (this.currentLevelIndex < this.levels.length - 1) {
                        this.startLevel(this.currentLevelIndex + 1);
                    } else {
                        this.showGameComplete();
                    }
                });
            }
        } else {
            this.returnTileToStart(tile);
        }
    }

    returnTileToStart(tile) {
        if (tile.originalX !== undefined && tile.originalY !== undefined) {
            this.tweens.add({
                targets: tile,
                x: tile.originalX,
                y: tile.originalY,
                duration: 300,
                ease: 'Back.easeOut'
            });
        }
    }

    showGameComplete() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(150);
        const congratsText = this.add.text(width / 2, height / 2 - 40, '🎉 All Levels Complete!', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(151);

        const replayBtn = this.add.rectangle(width / 2, height / 2 + 40, 160, 50, 0x8b4513, 1).setDepth(151);
        replayBtn.setStrokeStyle(2, 0x654321, 1);
        replayBtn.setInteractive({ useHandCursor: true });
        const replayText = this.add.text(width / 2, height / 2 + 40, 'Play Again', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(152);

        replayBtn.on('pointerdown', () => {
            overlay.destroy();
            congratsText.destroy();
            replayBtn.destroy();
            replayText.destroy();
            this.startLevel(0);
        });
    }
}
