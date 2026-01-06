import { LalelaGame } from '../utils/LalelaGame.js';

export class FamilyGame extends LalelaGame {
    constructor(config) {
        super({
            key: 'FamilyGame',
            ...config,
            title: config?.title || 'Family',
            description: config?.description || 'Learn about family relationships.',
            category: config?.category || 'discovery'
        });
    }

    preload() {
        super.preload();
        
        // Load background
        this.load.svg('family-bg', 'assets/family/background.svg');
        
        // Load all character icons
        const characters = [
            'man1', 'man2', 'man3', 'woman1', 'woman2', 'woman3',
            'boy1', 'boy2', 'girl1', 'girl2',
            'oldMan1', 'oldMan2', 'oldWoman1', 'oldWoman2',
            'babyBoy', 'babyGirl'
        ];
        characters.forEach(char => {
            this.load.svg(`family-${char}`, `assets/family/${char}.svg`);
        });
        
        // Load rings for married couples
        this.load.svg('family-rings', 'assets/family/rings.svg');
        
        // Load navigation icons
        this.load.svg('home', 'assets/game-icons/bar_home.svg');
        this.load.svg('help', 'assets/game-icons/bar_help.svg');
    }

    createBackground() {
        const { width, height } = this.scale;
        
        this.add.image(width / 2, height / 2, 'family-bg')
            .setDisplaySize(width, height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        // Nav dock created after game logic so we know level count
    }

    setupGameLogic() {
        // Define all levels based on GCompris FamilyDataset
        this.levels = [
            // Level 1: Father
            {
                edgeList: [[3, 2, 5, 2], [4, 2, 4, 4]],
                nodePositions: [[3, 2], [5, 2], [4, 4]],
                captions: [0, 0], // 0=left, 1=right
                nodeValue: ['man1', 'woman2', 'boy1'],
                currentState: ['activeTo', 'deactivate', 'active'],
                edgeState: [1, 0], // 1=married, 0=other
                answer: 'Father',
                options: ['Father', 'Grandfather', 'Uncle']
            },
            // Level 2: Mother
            {
                edgeList: [[3, 2, 5, 2], [4, 2, 4, 4]],
                nodePositions: [[3, 2], [5, 2], [4, 4]],
                captions: [0, 1],
                nodeValue: ['man1', 'woman2', 'boy1'],
                currentState: ['deactivate', 'activeTo', 'active'],
                edgeState: [1, 0],
                answer: 'Mother',
                options: ['Mother', 'Grandmother', 'Aunt']
            },
            // Level 3: Brother
            {
                edgeList: [[3, 2, 5, 2], [4, 2, 4, 3], [3, 3, 5, 3], [3, 3, 3, 4], [5, 3, 5, 4]],
                nodePositions: [[3, 2], [5, 2], [3, 4], [5, 4]],
                captions: [0, 1],
                nodeValue: ['man1', 'woman2', 'boy1', 'boy2'],
                currentState: ['deactivate', 'deactivate', 'active', 'activeTo'],
                edgeState: [1, 0, 0, 0, 0],
                answer: 'Brother',
                options: ['Cousin', 'Brother', 'Sister']
            },
            // Level 4: Sister
            {
                edgeList: [[4, 2, 6, 2], [5, 2, 5, 3], [3, 3, 7, 3], [3, 3, 3, 4], [5, 3, 5, 4], [7, 3, 7, 4]],
                nodePositions: [[4, 2], [6, 2], [3, 4], [5, 4], [7, 4]],
                captions: [0, 1],
                nodeValue: ['man1', 'woman2', 'boy1', 'girl1', 'boy2'],
                currentState: ['deactivate', 'deactivate', 'active', 'activeTo', 'deactivate'],
                edgeState: [1, 0, 0, 0, 0, 0],
                answer: 'Sister',
                options: ['Cousin', 'Brother', 'Sister']
            },
            // Level 5: Grandfather
            {
                edgeList: [[3, 1, 5, 1], [4, 1, 4, 3], [4, 3, 6, 3], [5, 3, 5, 4], [3, 4, 7, 4], [3, 4, 3, 5], [5, 4, 5, 5], [7, 4, 7, 5]],
                nodePositions: [[3, 1], [5, 1], [4, 3], [6, 3], [3, 5], [5, 5], [7, 5]],
                captions: [0, 0],
                nodeValue: ['oldMan1', 'oldWoman1', 'man2', 'woman1', 'girl1', 'boy1', 'boy2'],
                currentState: ['activeTo', 'deactivate', 'deactivate', 'deactivate', 'active', 'deactivate', 'deactivate'],
                edgeState: [1, 0, 1, 0, 0, 0, 0, 0],
                answer: 'Grandfather',
                options: ['Granddaughter', 'Grandson', 'Grandfather', 'Grandmother']
            },
            // Level 6: Grandmother
            {
                edgeList: [[3, 1, 5, 1], [4, 1, 4, 3], [4, 3, 6, 3], [5, 3, 5, 4], [3, 4, 7, 4], [3, 4, 3, 5], [5, 4, 5, 5], [7, 4, 7, 5]],
                nodePositions: [[3, 1], [5, 1], [4, 3], [6, 3], [3, 5], [5, 5], [7, 5]],
                captions: [0, 1],
                nodeValue: ['oldMan1', 'oldWoman1', 'man2', 'woman1', 'girl1', 'boy1', 'boy2'],
                currentState: ['deactivate', 'activeTo', 'deactivate', 'deactivate', 'active', 'deactivate', 'deactivate'],
                edgeState: [1, 0, 1, 0, 0, 0, 0, 0],
                answer: 'Grandmother',
                options: ['Granddaughter', 'Grandson', 'Grandfather', 'Grandmother']
            },
            // Level 7: Son-in-law (complex)
            {
                edgeList: [[2, 1, 4, 1], [3, 1, 3, 2], [2, 2, 4, 2], [2, 2, 2, 3], [4, 2, 4, 3], [6, 1, 8, 1], [7, 1, 7, 3], [5, 3, 7, 3]],
                nodePositions: [[2, 1], [4, 1], [2, 3], [4, 3], [6, 1], [8, 1], [5, 3], [7, 3]],
                captions: [0, 1],
                nodeValue: ['oldMan1', 'oldWoman1', 'man3', 'woman2', 'oldMan2', 'oldWoman2', 'man2', 'woman1'],
                currentState: ['deactivate', 'deactivate', 'deactivate', 'active', 'deactivate', 'deactivate', 'activeTo', 'deactivate'],
                edgeState: [1, 0, 0, 0, 0, 1, 0, 1],
                answer: 'Brother-in-law',
                options: ['Father-in-law', 'Mother-in-law', 'Sister-in-law', 'Brother-in-law', 'Daughter-in-law']
            }
        ];
        
        this.currentLevel = 0;
        this.levelObjects = [];
        
        // Create navigation dock
        this.createNavigationDock();
        
        // Start first level
        this.startLevel(0);
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const barY = height - 55;
        const buttonSize = 72;
        const spacing = 95;
        const buttonRadius = 10;

        const controls = [
            { icon: 'help', action: 'help', color: 0x00B378 },
            { icon: 'home', action: 'home', color: 0x00B378 }
        ];

        // Left side controls
        let startX = 80;
        controls.forEach((control, index) => {
            const x = startX + index * spacing;
            this.createNavButton(x, barY, buttonSize, buttonRadius, control);
        });

        // Level arrows in center
        this.prevBtn = this.add.text(width / 2 - 60, barY, '❮', {
            fontSize: '48px',
            color: '#D97706',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });
        this.prevBtn.on('pointerdown', () => {
            if (this.currentLevel > 0) {
                this.startLevel(this.currentLevel - 1);
            }
        });

        this.levelText = this.add.text(width / 2, barY, '1', {
            fontSize: '36px',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        this.nextBtn = this.add.text(width / 2 + 60, barY, '❯', {
            fontSize: '48px',
            color: '#D97706',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });
        this.nextBtn.on('pointerdown', () => {
            if (this.currentLevel < this.levels.length - 1) {
                this.startLevel(this.currentLevel + 1);
            }
        });
    }

    createNavButton(x, y, buttonSize, buttonRadius, control) {
        const button = this.add.graphics();
        button.fillStyle(control.color);
        button.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
        button.lineStyle(2, 0xFFFFFF, 0.8);
        button.strokeRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
        button.setInteractive(
            new Phaser.Geom.Rectangle(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize),
            Phaser.Geom.Rectangle.Contains
        );

        const icon = this.add.sprite(x, y, control.icon);
        icon.setScale((buttonSize * 0.6) / Math.max(icon.width, icon.height));
        icon.setTint(0xFFFFFF);

        button.on('pointerdown', () => {
            icon.y += 2;
            this.handleNavAction(control.action);
            this.time.delayedCall(100, () => { icon.y -= 2; });
        });

        button.setDepth(100);
        icon.setDepth(101);
    }

    handleNavAction(action) {
        switch (action) {
            case 'home':
                this.scene.start('GameMenu');
                break;
            case 'help':
                this.showHelpModal();
                break;
        }
    }

    showHelpModal() {
        if (this.helpModal) return;

        const { width, height } = this.scale;
        this.helpModal = this.add.container(width / 2, height / 2).setDepth(200);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        overlay.setInteractive();

        const panel = this.add.rectangle(0, 0, 500, 300, 0xffffff, 1);
        panel.setStrokeStyle(3, 0x00B378);

        const title = this.add.text(0, -110, 'How to Play', {
            fontSize: '32px', color: '#2c3e50', fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(0, 10,
            'Look at the family tree and find "Me".\n\n' +
            'The person with the orange border and "?" is\n' +
            'the one you need to identify.\n\n' +
            'Click the correct relationship from the list!',
            { fontSize: '20px', color: '#333333', align: 'center', lineSpacing: 6 }
        ).setOrigin(0.5);

        const closeBtn = this.add.text(0, 120, 'Got it!', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#00B378', padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.helpModal.destroy();
            this.helpModal = null;
        });

        this.helpModal.add([overlay, panel, title, instructions, closeBtn]);
    }

    startLevel(levelIndex) {
        // Clear previous level objects
        this.levelObjects.forEach(obj => obj.destroy());
        this.levelObjects = [];
        
        this.currentLevel = levelIndex;
        const level = this.levels[levelIndex];
        
        // Update level text
        if (this.levelText) {
            this.levelText.setText((levelIndex + 1).toString());
        }
        
        const { width, height } = this.scale;
        
        // Calculate grid size to fit the tree
        // GCompris uses 8x5 grid
        const layoutHeight = height - 130; // Leave space for nav bar
        const nodeSize = Math.min(width / 10, layoutHeight / 6);
        
        // Center the tree
        const treeWidth = nodeSize * 8;
        const treeHeight = nodeSize * 5;
        const offsetX = (width - treeWidth) / 2;
        const offsetY = 80;
        
        // Track "Me" and "?" positions for labels
        let mePosition = null;
        let questionPosition = null;
        let meCaption = level.captions[0];
        let questionCaption = level.captions[1];
        
        // Find Me and Question positions
        level.currentState.forEach((state, i) => {
            if (state === 'active') {
                mePosition = { x: level.nodePositions[i][0], y: level.nodePositions[i][1] };
            } else if (state === 'activeTo') {
                questionPosition = { x: level.nodePositions[i][0], y: level.nodePositions[i][1] };
            }
        });
        
        // Draw edges (lines connecting family members)
        const graphics = this.add.graphics();
        graphics.lineStyle(6, 0x2D5F8B); // Dark blue color like GCompris
        
        level.edgeList.forEach((edge, i) => {
            const x1 = offsetX + (edge[0] - 0.5) * nodeSize;
            const y1 = offsetY + (edge[1] - 0.5) * nodeSize;
            const x2 = offsetX + (edge[2] - 0.5) * nodeSize;
            const y2 = offsetY + (edge[3] - 0.5) * nodeSize;
            
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
        });
        graphics.strokePath();
        this.levelObjects.push(graphics);
        
        // Draw rings for married couples
        level.edgeState.forEach((state, i) => {
            if (state === 1) { // married
                const edge = level.edgeList[i];
                const ringX = offsetX + (edge[0] + 0.3) * nodeSize;
                const ringY = offsetY + (edge[1] - 1 + 0.3) * nodeSize;
                
                const ring = this.add.image(ringX, ringY, 'family-rings');
                ring.setDisplaySize(nodeSize * 0.4, nodeSize * 0.4);
                ring.setDepth(5);
                this.levelObjects.push(ring);
            }
        });
        
        // Draw nodes (people)
        level.nodePositions.forEach((pos, i) => {
            const x = offsetX + (pos[0] - 0.5) * nodeSize;
            const y = offsetY + (pos[1] - 0.5) * nodeSize;
            const state = level.currentState[i];
            
            // Node background circle
            const nodeBg = this.add.graphics();
            
            // Colors based on state
            let bgColor = 0x7CD5F5; // Light blue
            let borderColor = 0x2D5F8B; // Dark blue
            
            if (state === 'active') {
                borderColor = 0xe1e1e1; // Light grey for "Me"
            } else if (state === 'activeTo') {
                bgColor = 0xBAE4F3;
                borderColor = 0xe77936; // Orange for question
            }
            
            // Draw filled circle with border
            nodeBg.fillStyle(bgColor);
            nodeBg.fillCircle(x, y, nodeSize * 0.45);
            nodeBg.lineStyle(4, borderColor);
            nodeBg.strokeCircle(x, y, nodeSize * 0.45);
            nodeBg.setDepth(1);
            this.levelObjects.push(nodeBg);
            
            // Character image
            const charImage = this.add.image(x, y, `family-${level.nodeValue[i]}`);
            charImage.setDisplaySize(nodeSize * 0.65, nodeSize * 0.65);
            charImage.setDepth(2);
            this.levelObjects.push(charImage);
            
            // Add wobble animation for active nodes
            if (state === 'active' || state === 'activeTo') {
                this.tweens.add({
                    targets: charImage,
                    angle: { from: -5, to: 5 },
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
        
        // Draw "Me" label
        if (mePosition) {
            const meLabelX = offsetX + (mePosition.x - 0.5) * nodeSize + (meCaption === 0 ? -nodeSize * 0.7 : nodeSize * 0.7);
            const meLabelY = offsetY + (mePosition.y - 0.5) * nodeSize;
            
            const meBg = this.add.rectangle(meLabelX, meLabelY, nodeSize * 0.7, nodeSize * 0.35, 0xf0f0f0);
            meBg.setStrokeStyle(2, 0x3498db);
            meBg.setDepth(10);
            this.levelObjects.push(meBg);
            
            const meText = this.add.text(meLabelX, meLabelY, 'Me', {
                fontSize: `${nodeSize * 0.22}px`,
                color: '#2c3e50',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(11);
            this.levelObjects.push(meText);
        }
        
        // Draw "?" label
        if (questionPosition) {
            const qLabelX = offsetX + (questionPosition.x - 0.5) * nodeSize + (questionCaption === 0 ? -nodeSize * 0.55 : nodeSize * 0.55);
            const qLabelY = offsetY + (questionPosition.y - 0.5) * nodeSize - nodeSize * 0.35;
            
            const qBg = this.add.circle(qLabelX, qLabelY, nodeSize * 0.18, 0xf0f0f0);
            qBg.setStrokeStyle(2, 0xe77936);
            qBg.setDepth(10);
            this.levelObjects.push(qBg);
            
            const qText = this.add.text(qLabelX, qLabelY, '?', {
                fontSize: `${nodeSize * 0.25}px`,
                color: '#e77936',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(11);
            this.levelObjects.push(qText);
        }
        
        // Create answer buttons on the right side
        const buttonWidth = Math.min(250, width * 0.25);
        const buttonHeight = 55;
        const buttonSpacing = 12;
        const buttonsStartX = width - buttonWidth / 2 - 30;
        const buttonsStartY = 90;
        
        level.options.forEach((option, i) => {
            const btnY = buttonsStartY + i * (buttonHeight + buttonSpacing);
            
            // Button background
            const btnBg = this.add.rectangle(buttonsStartX, btnY, buttonWidth, buttonHeight, 0xffffff);
            btnBg.setStrokeStyle(3, 0x87CEEB);
            btnBg.setInteractive({ useHandCursor: true });
            btnBg.setDepth(10);
            this.levelObjects.push(btnBg);
            
            // Button text
            const btnText = this.add.text(buttonsStartX, btnY, option, {
                fontSize: '22px',
                color: '#2c3e50',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(11);
            this.levelObjects.push(btnText);
            
            // Hover effects
            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0xe8f4fc);
            });
            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0xffffff);
            });
            
            // Click handler
            btnBg.on('pointerdown', () => {
                if (option === level.answer) {
                    // Correct answer
                    if (this.audioManager) this.audioManager.playSound('success');
                    btnBg.setFillStyle(0x90EE90); // Green
                    btnBg.disableInteractive();
                    
                    // Go to next level after delay
                    this.time.delayedCall(1500, () => {
                        if (this.currentLevel < this.levels.length - 1) {
                            this.startLevel(this.currentLevel + 1);
                        } else {
                            // Game complete - restart
                            this.startLevel(0);
                        }
                    });
                } else {
                    // Wrong answer
                    if (this.audioManager) this.audioManager.playSound('error');
                    btnBg.setFillStyle(0xFFB6C1); // Light red
                    
                    // Reset color after delay
                    this.time.delayedCall(500, () => {
                        btnBg.setFillStyle(0xffffff);
                    });
                }
            });
        });
    }
}
