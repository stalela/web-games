import { DragDropGame } from './DragDropGame.js';
import { DraggableTile } from '../components/DraggableTile.js';
import { DropZone } from '../components/DropZone.js';

/**
 * TangramPiece - A draggable tangram piece with rotation and flip support
 */
class TangramPiece extends DraggableTile {
    createVisualElements() {
        const size = this.config.size || 100;
        this.config.color = this.config.color || 0xffffff;
        this.config.borderColor = this.config.borderColor || 0xcccccc;

        // Shadow for depth effect
        this.shadow = this.scene.add.rectangle(3, 3, size, size, 0x000000, 0.15);
        this.shadow.setOrigin(0.5);

        // Background
        this.background = this.scene.add.rectangle(0, 0, size, size, 0xffffff, 0.9);
        this.background.setStrokeStyle(2, 0xcccccc, 0.5);
        this.background.setOrigin(0.5);

        // The tangram piece image
        this.image = this.scene.add.image(0, 0, this.config.imageKey);

        // Apply initial flipping if needed
        if (this.config.flipping) {
            this.image.setFlipX(true);
        }

        // Apply initial rotation if needed
        if (this.config.rotation) {
            this.image.setAngle(this.config.rotation);
        }

        // Scale image to fit within size
        const scale = Math.min(size / this.image.width, size / this.image.height) * 0.9;
        this.image.setScale(scale);

        this.add([this.shadow, this.background, this.image]);

        // Selection glow
        this.glow = this.scene.add.rectangle(0, 0, size + 10, size + 10, 0xFFFF00, 0);
        this.glow.setStrokeStyle(4, 0xFFFF00, 0);
        this.addAt(this.glow, 0);

        // Rotation button (shown when selected)
        this.rotateBtn = this.scene.add.container(-size/2 - 25, 0);
        const rotateBg = this.scene.add.circle(0, 0, 18, 0x4a90d9, 1);
        rotateBg.setStrokeStyle(2, 0xffffff, 1);
        const rotateIcon = this.scene.add.text(0, 0, '↻', { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
        this.rotateBtn.add([rotateBg, rotateIcon]);
        this.rotateBtn.setVisible(false);
        this.rotateBtn.setSize(36, 36);
        this.rotateBtn.setInteractive({ useHandCursor: true });
        this.rotateBtn.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.rotate();
        });
        this.add(this.rotateBtn);

        // Flip button (shown when selected and flippable)
        if (this.config.flippable) {
            this.flipBtn = this.scene.add.container(0, size/2 + 25);
            const flipBg = this.scene.add.circle(0, 0, 18, 0x4a90d9, 1);
            flipBg.setStrokeStyle(2, 0xffffff, 1);
            const flipIcon = this.scene.add.text(0, 0, '⇄', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
            this.flipBtn.add([flipBg, flipIcon]);
            this.flipBtn.setVisible(false);
            this.flipBtn.setSize(36, 36);
            this.flipBtn.setInteractive({ useHandCursor: true });
            this.flipBtn.on('pointerdown', (pointer) => {
                pointer.event.stopPropagation();
                this.flip();
            });
            this.add(this.flipBtn);
        }
    }

    setDragging(isDragging) {
        super.setDragging(isDragging);
        if (this.glow) {
            this.glow.setAlpha(isDragging ? 0.3 : 0);
            this.glow.strokeAlpha = isDragging ? 1 : 0;
        }
    }

    setSelected(isSelected) {
        this.isSelected = isSelected;
        if (this.rotateBtn) {
            this.rotateBtn.setVisible(isSelected && this.config.rotable !== false);
        }
        if (this.flipBtn) {
            this.flipBtn.setVisible(isSelected && this.config.flippable);
        }
        if (this.glow) {
            this.glow.setStrokeStyle(4, isSelected ? 0x00AAFF : 0xFFFF00, isSelected ? 1 : 0);
        }
    }

    rotate() {
        const step = this.config.rotationStep || 45;
        this.image.angle += step;
        if (this.scene && this.scene.audioManager) {
            this.scene.audioManager.playSound('click');
        }
        // Check win after rotation
        if (this.scene && this.scene.checkWin) {
            this.scene.checkWin();
        }
    }

    flip() {
        this.image.flipX = !this.image.flipX;
        if (this.scene && this.scene.audioManager) {
            this.scene.audioManager.playSound('click');
        }
        // Check win after flip
        if (this.scene && this.scene.checkWin) {
            this.scene.checkWin();
        }
    }
}

export class TangramGame extends DragDropGame {
    constructor(config) {
        super({
            ...config,
            key: 'TangramGame',
            title: 'Tangram',
            description: 'Arrange the tangram pieces to form the silhouette shape.',
            category: 'fun'
        });

        this.helpModal = null;
        this.selectedPiece = null;

        // Tangram levels from GCompris dataset (simplified)
        this.levels = [
            {
                name: 'Square',
                colorMask: '#999999',
                pieces: [
                    { img: 'p0', flippable: false, width: 0.429, height: 0.214, initX: 0.22, initY: 0.12, initRotation: 0, x: 0.501, y: 0.349, rotation: 0, moduloRotation: 360 },
                    { img: 'p0', flippable: false, width: 0.429, height: 0.214, initX: 0.216, initY: 0.8, initRotation: 0, x: 0.715, y: 0.349, rotation: 180, moduloRotation: 360 },
                    { img: 'p1', flippable: false, width: 0.304, height: 0.152, initX: 0.45, initY: 0.11, initRotation: 180, x: 0.665, y: 0.607, rotation: 90, moduloRotation: 360 },
                    { img: 'p2', flippable: false, width: 0.152, height: 0.152, initX: 0.7, initY: 0.11, initRotation: 0, x: 0.515, y: 0.531, rotation: 0, moduloRotation: 90 },
                    { img: 'p3', flippable: true, width: 0.322, height: 0.108, initX: 0.94, initY: 0.17, initRotation: -90, x: 0.752, y: 0.509, rotation: 0, moduloRotation: 180 },
                    { img: 'p4', flippable: false, width: 0.215, height: 0.108, initX: 0.6, initY: 0.85, initRotation: 0, x: 0.182, y: 0.402, rotation: 0, moduloRotation: 360 },
                    { img: 'p4', flippable: false, width: 0.215, height: 0.108, initX: 0.8, initY: 0.85, initRotation: 180, x: 0.402, y: 0.493, rotation: 45, moduloRotation: 360 }
                ]
            },
            {
                name: 'Cat',
                colorMask: '#999999',
                pieces: [
                    { img: 'p0', flippable: false, width: 0.429, height: 0.214, initX: 0.22, initY: 0.12, initRotation: 180, x: 0.427, y: 0.325, rotation: 270, moduloRotation: 360 },
                    { img: 'p0', flippable: false, width: 0.429, height: 0.214, initX: 0.442, initY: 0.113, initRotation: 0, x: 0.156, y: 0.765, rotation: 315, moduloRotation: 360 },
                    { img: 'p1', flippable: false, width: 0.304, height: 0.152, initX: 0.61, initY: 0.08, initRotation: 180, x: 0.76, y: 0.69, rotation: 270, moduloRotation: 360 },
                    { img: 'p2', flippable: false, width: 0.152, height: 0.152, initX: 0.911, initY: 0.081, initRotation: 0, x: 0.458, y: 0.615, rotation: 0, moduloRotation: 90 },
                    { img: 'p3', flippable: true, width: 0.322, height: 0.108, initX: 0.083, initY: 0.178, initRotation: 45, x: 0.231, y: 0.463, rotation: 45, moduloRotation: 180 },
                    { img: 'p4', flippable: false, width: 0.215, height: 0.108, initX: 0.741, initY: 0.118, initRotation: 135, x: 0.345, y: 0.577, rotation: 45, moduloRotation: 360 },
                    { img: 'p4', flippable: false, width: 0.215, height: 0.108, initX: 0.9, initY: 0.85, initRotation: 45, x: 0.573, y: 0.577, rotation: 315, moduloRotation: 360 }
                ]
            }
        ];
    }

    preload() {
        super.preload();
        // Load UI icons
        const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
        uiIcons.forEach(icon => this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`));

        // Load tangram pieces (colored)
        const pieceIds = ['p0', 'p1', 'p2', 'p3', 'p4'];
        pieceIds.forEach(id => {
            this.load.svg(`tangram-${id}`, `assets/tangram/tangram/${id}.svg`);
        });
        // Load silhouette pieces (grey)
        pieceIds.forEach(id => {
            this.load.svg(`tangram-m-${id}`, `assets/tangram/m-tangram/${id}.svg`);
        });
        // Load flip icon
        this.load.svg('tangram-flip', 'assets/tangram/tangram/flip.svg');
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Light blue gradient background like GCompris
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0xb9d3ff, 0xb9d3ff, 0x8fbfff, 0x8fbfff, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-2);

        // Play area border (optional visual guide)
        const playSize = Math.min(width * 0.7, height * 0.7);
        this.playAreaX = (width - playSize) / 2;
        this.playAreaY = (height - playSize) / 2 - 20;
        this.playSize = playSize;

        // Subtle play area indicator
        const playArea = this.add.rectangle(
            this.playAreaX + playSize / 2,
            this.playAreaY + playSize / 2,
            playSize, playSize,
            0xffffff, 0.1
        );
        playArea.setStrokeStyle(2, 0x4a90d9, 0.3);
        playArea.setDepth(-1);
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

        // Level indicator
        this.levelText = this.add.text(width / 2, 30, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#1d1d1d',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);
    }

    createNavigationDock(width, height) {
        const dockY = height - 40;
        const iconSize = 40;
        const iconSpacing = 60;
        const icons = ['exit', 'home', 'help'];
        const startX = width / 2 - ((icons.length - 1) * iconSpacing) / 2;

        // Dock background
        const dockWidth = icons.length * iconSpacing + 40;
        const dockBg = this.add.rectangle(width / 2, dockY, dockWidth, 56, 0x4a4a4a, 0.85);
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
    }

    showHelpModal() {
        if (this.helpModal) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.helpModal = this.add.container(width / 2, height / 2).setDepth(100);

        // Overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        overlay.setInteractive();

        // Modal panel
        const panel = this.add.rectangle(0, 0, 450, 350, 0xffffff, 1);
        panel.setStrokeStyle(3, 0x4a90d9, 1);

        // Title
        const title = this.add.text(0, -140, '🧩 Tangram Puzzle', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instructions
        const instructions = this.add.text(0, -40, [
            '• Drag the colored pieces to match the grey silhouette',
            '• Tap a piece to select it, then use buttons to:',
            '   ↻  Rotate the piece',
            '   ⇄  Flip the piece (if flippable)',
            '• Match all pieces to complete the level!'
        ].join('\n'), {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#555',
            lineSpacing: 8,
            align: 'left'
        }).setOrigin(0.5);

        // Close button
        const closeBtn = this.add.rectangle(0, 130, 120, 45, 0x4a90d9, 1);
        closeBtn.setStrokeStyle(2, 0x3a7bc8, 1);
        closeBtn.setInteractive({ useHandCursor: true });
        const closeText = this.add.text(0, 130, 'Got it!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x5ba0e9));
        closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x4a90d9));
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
        this.silhouettes = [];
        this.startLevel(this.currentLevelIndex);

        // Click on background to deselect
        this.input.on('pointerdown', (pointer) => {
            if (this.selectedPiece && !pointer.wasTouch) {
                // Check if clicked on empty space
                const hitObjects = this.input.hitTestPointer(pointer);
                const hitPiece = hitObjects.some(obj =>
                    obj.parentContainer instanceof TangramPiece ||
                    obj instanceof TangramPiece
                );
                if (!hitPiece) {
                    this.deselectPiece();
                }
            }
        });
    }

    startLevel(levelIndex) {
        this.currentLevelIndex = levelIndex % this.levels.length;

        // Clear existing pieces
        this.draggableTiles.forEach(t => t.destroy());
        this.draggableTiles = [];
        this.silhouettes.forEach(s => s.destroy());
        this.silhouettes = [];

        const levelData = this.levels[this.currentLevelIndex];
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Update level text
        if (this.levelText) {
            this.levelText.setText(`Level ${this.currentLevelIndex + 1}: ${levelData.name}`);
        }

        // Create silhouettes (target positions)
        levelData.pieces.forEach((piece, i) => {
            const x = this.playAreaX + piece.x * this.playSize;
            const y = this.playAreaY + piece.y * this.playSize;
            const pieceWidth = piece.width * this.playSize;
            const pieceHeight = piece.height * this.playSize;

            const silhouette = this.add.image(x, y, `tangram-m-${piece.img}`);
            const scale = Math.min(pieceWidth / silhouette.width, pieceHeight / silhouette.height);
            silhouette.setScale(scale);
            silhouette.setAngle(piece.rotation);
            silhouette.setTint(0x888888);
            silhouette.setAlpha(0.7);
            silhouette.setDepth(0);
            this.silhouettes.push(silhouette);
        });

        // Create draggable pieces (initial positions)
        levelData.pieces.forEach((piece, i) => {
            const initX = this.playAreaX + piece.initX * this.playSize;
            const initY = this.playAreaY + piece.initY * this.playSize;
            const pieceWidth = piece.width * this.playSize;
            const pieceHeight = piece.height * this.playSize;

            const tile = new TangramPiece(this, {
                x: initX,
                y: initY,
                value: `${piece.img}-${i}`,
                imageKey: `tangram-${piece.img}`,
                size: Math.max(pieceWidth, pieceHeight),
                rotation: piece.initRotation,
                flipping: false,
                flippable: piece.flippable,
                rotable: piece.moduloRotation !== 0,
                rotationStep: piece.moduloRotation === 90 ? 90 : 45,
                color: 0xffffff,
                borderColor: 0xcccccc,
                targetX: piece.x,
                targetY: piece.y,
                targetRotation: piece.rotation,
                moduloRotation: piece.moduloRotation
            });

            // Selection handling
            tile.on('pointerdown', () => this.selectPiece(tile));

            this.draggableTiles.push(tile);
            this.add.existing(tile);
            tile.setDepth(10 + i);
        });
    }

    selectPiece(piece) {
        if (this.selectedPiece && this.selectedPiece !== piece) {
            this.selectedPiece.setSelected(false);
        }
        this.selectedPiece = piece;
        piece.setSelected(true);
        piece.setDepth(100); // Bring to front
    }

    deselectPiece() {
        if (this.selectedPiece) {
            this.selectedPiece.setSelected(false);
            this.selectedPiece = null;
        }
    }

    checkWin() {
        // Simplified win check: all pieces near their target positions
        const tolerance = 30;
        const angleTolerance = 15;

        let allCorrect = true;
        const levelData = this.levels[this.currentLevelIndex];

        this.draggableTiles.forEach((tile, i) => {
            const piece = levelData.pieces[i];
            const targetX = this.playAreaX + piece.x * this.playSize;
            const targetY = this.playAreaY + piece.y * this.playSize;

            const dx = Math.abs(tile.x - targetX);
            const dy = Math.abs(tile.y - targetY);

            // Normalize angle comparison
            const tileAngle = ((tile.list[2].angle % 360) + 360) % 360; // image angle
            const targetAngle = ((piece.rotation % 360) + 360) % 360;
            const modulo = piece.moduloRotation || 360;
            const angleDiff = Math.abs((tileAngle % modulo) - (targetAngle % modulo));

            if (dx > tolerance || dy > tolerance || (angleDiff > angleTolerance && angleDiff < modulo - angleTolerance)) {
                allCorrect = false;
            }
        });

        if (allCorrect) {
            this.levelComplete();
        }
    }

    levelComplete() {
        if (this.audioManager) {
            this.audioManager.playSound('complete');
        }

        // Show success and move to next level
        const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '✓ Level Complete!', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#2ecc71',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);

        this.time.delayedCall(1500, () => {
            successText.destroy();
            if (this.currentLevelIndex + 1 < this.levels.length) {
                this.startLevel(this.currentLevelIndex + 1);
            } else {
                // All levels complete - show congratulations
                this.showGameComplete();
            }
        });
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

        const replayBtn = this.add.rectangle(width / 2, height / 2 + 40, 160, 50, 0x4a90d9, 1).setDepth(151);
        replayBtn.setStrokeStyle(2, 0x3a7bc8, 1);
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
