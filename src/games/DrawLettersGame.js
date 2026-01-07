/**
 * DrawLettersGame - Connect the dots to draw letters
 * 
 * Adapted from GCompris drawletters activity (extends number_sequence)
 * Restyled to match GCompris visual design with wood background
 * 
 * Features:
 * - Connect dots in sequence to reveal letters
 * - Green dots for upcoming points, blue highlight for current
 * - Lined notebook paper on wood background
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class DrawLettersGame extends LalelaGame {
    constructor(config) {
        super({
            key: 'DrawLettersGame',
            title: 'Draw Letters',
            description: 'Connect the dots to draw the letters.',
            category: 'reading',
            ...config
        });

        // Level data from GCompris drawletters_dataset.js
        this.levels = [
            {
                imageName1: "paper.svg",
                imageName2: "A1.svg",
                coordinates: [[278,58],[260,100],[242,144],[225,187],[207,230],[189,276],[171,316],[154,359],[136,402],[278,58],[296,104],[314,144],[332,187],[350,230],[368,276],[386,316],[403,359],[420,402],[187,286],[235,286],[282,286],[330,286],[378,286]],
                coordinates2: [1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,3,3,3,3,3]
            },
            {
                imageName1: "paper.svg",
                imageName2: "B1.svg",
                coordinates: [[190,59],[190,93],[190,126],[190,165],[190,212],[190,263],[190,308],[190,342],[190,375],[190,409],[223,77],[262,77],[300,78],[340,80],[384,91],[417,114],[433,154],[427,194],[388,226],[360,235],[328,242],[291,240],[262,235],[234,234],[223,234],[251,246],[288,248],[322,248],[358,249],[394,263],[427,291],[440,322],[441,357],[417,390],[375,406],[346,411],[307,413],[267,413],[244,413],[215,409]],
                coordinates2: [1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
            },
            {
                imageName1: "paper.svg",
                imageName2: "C1.svg",
                coordinates: [[435,160],[420,135],[391,110],[353,91],[318,86],[289,86],[255,93],[220,108],[184,136],[162,166],[147,211],[148,249],[157,282],[175,314],[198,340],[233,360],[278,372],[318,372],[361,362],[406,342],[427,315],[442,284]]
            },
            {
                imageName1: "paper.svg",
                imageName2: "D1.svg",
                coordinates: [[110,67],[110,98],[110,132],[110,173],[110,220],[110,267],[110,305],[110,347],[110,383],[110,410],[146,73],[184,78],[219,80],[255,81],[292,85],[328,90],[373,100],[408,118],[434,144],[456,174],[471,220],[475,268],[467,315],[437,356],[398,385],[346,401],[307,406],[260,409],[219,409],[190,409],[157,407]],
                coordinates2: [1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
            },
            {
                imageName1: "paper.svg",
                imageName2: "E1.svg",
                coordinates: [[161,62],[161,95],[161,133],[161,175],[161,216],[161,256],[161,296],[161,336],[161,377],[186,78],[212,78],[242,78],[274,78],[304,78],[335,78],[368,78],[405,78],[186,220],[217,220],[253,220],[289,220],[322,220],[353,220],[390,220],[193,366],[222,366],[252,366],[285,366],[313,366],[346,366],[377,366],[408,366]],
                coordinates2: [1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4]
            },
            {
                imageName1: "paper.svg",
                imageName2: "F1.svg",
                coordinates: [[178,62],[178,95],[178,133],[178,175],[178,216],[178,256],[178,296],[178,336],[178,377],[203,78],[229,78],[259,78],[291,78],[321,78],[352,78],[385,78],[422,78],[203,220],[234,220],[270,220],[306,220],[339,220],[370,220],[407,220]],
                coordinates2: [1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3]
            },
            {
                imageName1: "paper.svg",
                imageName2: "G1.svg",
                coordinates: [[435,160],[420,135],[391,110],[353,91],[318,86],[289,86],[255,93],[220,108],[184,136],[162,166],[147,211],[148,249],[157,282],[175,314],[198,340],[233,360],[278,372],[318,372],[361,362],[406,342],[427,315],[442,284],[442,250],[442,220],[400,220],[358,220],[316,220]]
            },
            {
                imageName1: "paper.svg",
                imageName2: "H1.svg",
                coordinates: [[160,62],[160,106],[160,150],[160,194],[160,238],[160,282],[160,326],[160,370],[160,377],[160,228],[204,228],[248,228],[292,228],[336,228],[380,228],[424,228],[424,62],[424,106],[424,150],[424,194],[424,238],[424,282],[424,326],[424,370],[424,377]],
                coordinates2: [1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3]
            }
        ];
        
        this.navElements = [];
    }

    preload() {
        super.preload();
        
        // Load wood background
        this.load.svg('wood-background', 'assets/game-icons/background-wood.svg');
        
        // Load all letter images and paper
        this.levels.forEach(level => {
            this.load.svg(`drawletters-${level.imageName1}`, `assets/drawletters/${level.imageName1}`);
            this.load.svg(`drawletters-${level.imageName2}`, `assets/drawletters/${level.imageName2}`);
        });
        
        // Load point images (GCompris style)
        this.load.svg('greenpoint', 'assets/drawletters/greenpoint.svg');
        this.load.svg('bluepointHighlight', 'assets/drawletters/bluepointHighlight.svg');
        this.load.svg('blackpoint', 'assets/drawletters/blackpoint.svg');
    }

    init(data) {
        super.init(data);
        this.level = data?.level || 0;
        this.maxLevel = this.levels.length;
    }

    create() {
        this.gameState = 'ready';
        
        // Game state
        this.points = [];
        this.graphics = null;
        this.currentPointIndex = 0;
        this.navElements = [];
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // GCompris uses wood background
        if (this.textures.exists('wood-background')) {
            const woodBg = this.add.image(width / 2, height / 2, 'wood-background');
            const scaleX = width / woodBg.width;
            const scaleY = height / woodBg.height;
            woodBg.setScale(Math.max(scaleX, scaleY));
            woodBg.setDepth(-2);
        } else {
            // Fallback: programmatic wood-like brown
            const gfx = this.add.graphics();
            gfx.fillStyle(0x5D4037, 1);
            gfx.fillRect(0, 0, width, height);
            gfx.setDepth(-2);
        }
    }

    createUI() {
        const { width, height } = this.scale;
        
        // GCompris-style score display (white rounded box at top right)
        const scoreBoxWidth = 65;
        const scoreBoxHeight = 45;
        
        this.scoreBox = this.add.graphics();
        this.scoreBox.fillStyle(0xFFFFFF, 0.95);
        this.scoreBox.fillRoundedRect(width - scoreBoxWidth - 15, 10, scoreBoxWidth, scoreBoxHeight, 8);
        this.scoreBox.lineStyle(2, 0x3E7BB8, 1);
        this.scoreBox.strokeRoundedRect(width - scoreBoxWidth - 15, 10, scoreBoxWidth, scoreBoxHeight, 8);
        this.scoreBox.setDepth(10);
        
        this.scoreText = this.add.text(width - scoreBoxWidth / 2 - 15, 32, `${this.level + 1}/${this.maxLevel}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // Create GCompris-style navigation bar
        this.createNavigationBar();
    }

    createNavigationBar() {
        const { width, height } = this.scale;
        const buttonSize = 60;
        const buttonSpacing = 70;
        const y = height - buttonSize / 2 - 12;
        
        let x = 45;
        
        // Menu button (brown/tan with lines)
        this.createNavButton(x, y, buttonSize, 0x6D5D4D, '☰', () => {
            this.scene.start('GameMenu');
        });
        x += buttonSpacing;
        
        // Help button (green with white ?)
        this.createNavButton(x, y, buttonSize, 0x4CAF50, '?', () => {
            this.showHelpModal();
        });
        x += buttonSpacing;
        
        // Home button (cyan with house icon)
        this.createNavButton(x, y, buttonSize, 0x4FC3F7, '⌂', () => {
            this.scene.start('GameMenu');
        });
        x += buttonSpacing;
        
        // Previous level (orange arrow)
        this.createNavButton(x, y, buttonSize, 0xF5A623, '❮', () => {
            if (this.level > 0) {
                this.level--;
                this.scene.restart({ level: this.level });
            }
        });
        x += buttonSpacing * 0.7;
        
        // Level indicator (number between arrows)
        this.levelText = this.add.text(x, y, String(this.level + 1), {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(101);
        x += buttonSpacing * 0.7;
        
        // Next level (orange arrow)
        this.createNavButton(x, y, buttonSize, 0xF5A623, '❯', () => {
            if (this.level < this.maxLevel - 1) {
                this.level++;
                this.scene.restart({ level: this.level });
            }
        });
        x += buttonSpacing;
        
        // Config/List button (purple with list icon)
        this.createNavButton(x, y, buttonSize, 0x9C6ADE, '≡', () => {
            // Show level selector or config
        });
    }
    
    createNavButton(x, y, size, color, icon, callback) {
        const radius = size / 2;
        
        // Shadow
        const shadow = this.add.circle(x, y + 3, radius, 0x000000, 0.3);
        shadow.setDepth(99);
        this.navElements.push(shadow);
        
        // Button background
        const button = this.add.circle(x, y, radius, color);
        button.setStrokeStyle(3, 0xFFFFFF);
        button.setInteractive({ useHandCursor: true });
        button.setDepth(100);
        this.navElements.push(button);
        
        // Icon
        const text = this.add.text(x, y, icon, {
            fontFamily: 'Arial',
            fontSize: `${size * 0.45}px`,
            color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(101);
        this.navElements.push(text);

        button.on('pointerover', () => {
            button.setScale(1.1);
            text.setScale(1.1);
        });
        button.on('pointerout', () => {
            button.setScale(1);
            text.setScale(1);
        });
        button.on('pointerdown', callback);
        
        return { button, text, shadow };
    }

    showHelpModal() {
        if (this.helpModal) return;
        
        const { width, height } = this.scale;
        
        // Create modal container
        this.helpModal = this.add.container(0, 0).setDepth(200);
        
        // Overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setInteractive();
        this.helpModal.add(overlay);
        
        // Panel
        const panelWidth = Math.min(450, width * 0.8);
        const panelHeight = 280;
        const panel = this.add.graphics();
        panel.fillStyle(0xFFFFFF, 0.98);
        panel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 15);
        panel.lineStyle(3, 0x4CAF50, 1);
        panel.strokeRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 15);
        this.helpModal.add(panel);
        
        // Title
        const title = this.add.text(width / 2, height / 2 - panelHeight / 2 + 35, 'Draw Letters', {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#4CAF50'
        }).setOrigin(0.5);
        this.helpModal.add(title);
        
        // Instructions
        const instructions = 'Connect the dots in order to draw the letter!\n\nClick on the highlighted blue dot to start,\nthen continue clicking green dots in sequence.';
        
        const text = this.add.text(width / 2, height / 2, instructions, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#333333',
            align: 'center',
            wordWrap: { width: panelWidth - 40 }
        }).setOrigin(0.5);
        this.helpModal.add(text);
        
        // Close button
        const closeBtn = this.add.circle(width / 2 + panelWidth / 2 - 25, height / 2 - panelHeight / 2 + 25, 18, 0xE53935);
        closeBtn.setStrokeStyle(2, 0xFFFFFF);
        closeBtn.setInteractive({ useHandCursor: true });
        this.helpModal.add(closeBtn);
        
        const closeX = this.add.text(width / 2 + panelWidth / 2 - 25, height / 2 - panelHeight / 2 + 25, '✕', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.helpModal.add(closeX);
        
        closeBtn.on('pointerdown', () => {
            this.helpModal.destroy();
            this.helpModal = null;
        });
        
        overlay.on('pointerdown', () => {
            this.helpModal.destroy();
            this.helpModal = null;
        });
    }

    setupGameLogic() {
        const levelData = this.levels[this.level % this.levels.length];
        const { width, height } = this.scale;
        
        // Clear previous
        if (this.points) this.points.forEach(p => p.destroy());
        if (this.graphics) this.graphics.destroy();
        if (this.bgImage) this.bgImage.destroy();
        if (this.finalImage) this.finalImage.destroy();
        
        this.points = [];
        this.currentPointIndex = 0;
        
        // GCompris uses 520x520 base size for coordinates
        const barHeight = 80;
        const availableHeight = height - barHeight - 20;
        const paperSize = Math.min(width * 0.7, availableHeight);
        
        // Scale factor from GCompris 520 coordinate system
        const scale = paperSize / 520;
        
        // Center paper image
        const centerX = width / 2;
        const centerY = (height - barHeight) / 2;
        
        // Paper background image
        this.bgImage = this.add.image(centerX, centerY, `drawletters-${levelData.imageName1}`);
        this.bgImage.setDisplaySize(paperSize, paperSize);
        this.bgImage.setDepth(0);
        
        // Calculate offset for coordinates
        const offsetX = centerX - paperSize / 2;
        const offsetY = centerY - paperSize / 2;
        
        // Graphics for drawing lines
        this.graphics = this.add.graphics();
        this.graphics.setDepth(1);
        
        // Create points - GCompris style (green dots, blue highlight for current)
        levelData.coordinates.forEach((coord, index) => {
            const x = coord[0] * scale + offsetX;
            const y = coord[1] * scale + offsetY;
            
            // Determine point size based on whether it's current
            const isCurrentPoint = index === this.currentPointIndex;
            const pointSize = isCurrentPoint ? paperSize * 0.08 : paperSize * 0.04;
            
            // Use appropriate point image
            let textureKey = 'greenpoint';
            if (isCurrentPoint && this.textures.exists('bluepointHighlight')) {
                textureKey = 'bluepointHighlight';
            }
            
            let point;
            if (this.textures.exists(textureKey)) {
                point = this.add.image(x, y, textureKey);
                point.setDisplaySize(pointSize, pointSize);
            } else {
                // Fallback: colored circle
                const color = isCurrentPoint ? 0x0062FF : 0x7CB342;
                point = this.add.circle(x, y, pointSize / 2, color);
            }
            
            point.setDepth(2);
            point.setInteractive({ useHandCursor: true });
            point.setData('index', index);
            point.setData('x', x);
            point.setData('y', y);
            
            // Only show points that haven't been clicked yet
            point.setVisible(index >= this.currentPointIndex);
            
            point.on('pointerdown', () => this.handlePointClick(index, x, y));
            
            this.points.push(point);
        });
        
        // Update point display to show current as highlighted
        this.updatePointsDisplay();
    }
    
    updatePointsDisplay() {
        const levelData = this.levels[this.level % this.levels.length];
        const { width, height } = this.scale;
        
        const barHeight = 80;
        const availableHeight = height - barHeight - 20;
        const paperSize = Math.min(width * 0.7, availableHeight);
        
        this.points.forEach((point, index) => {
            const isCurrentPoint = index === this.currentPointIndex;
            const pointSize = isCurrentPoint ? paperSize * 0.08 : paperSize * 0.04;
            
            // Show only current and future points
            point.setVisible(index >= this.currentPointIndex);
            
            // Resize current point to be larger (highlighted)
            if (point.setDisplaySize) {
                point.setDisplaySize(pointSize, pointSize);
            } else if (point.setRadius) {
                point.setRadius(pointSize / 2);
            }
            
            // Change texture for current point
            if (isCurrentPoint && this.textures.exists('bluepointHighlight')) {
                point.setTexture('bluepointHighlight');
            } else if (index > this.currentPointIndex && this.textures.exists('greenpoint')) {
                point.setTexture('greenpoint');
            }
        });
    }
  
    handlePointClick(index, x, y) {
        if (index !== this.currentPointIndex) return;
        
        const levelData = this.levels[this.level % this.levels.length];
        
        // Play sound
        if (this.audioManager) this.audioManager.playSound('click');
        
        // Draw line from previous point IF same stroke
        if (index > 0) {
            const prevPoint = this.points[index - 1];
            const prevX = prevPoint.getData('x');
            const prevY = prevPoint.getData('y');
            
            let sameStroke = true;
            if (levelData.coordinates2) {
                if (levelData.coordinates2[index] !== levelData.coordinates2[index - 1]) {
                    sameStroke = false;
                }
            }
            
            if (sameStroke) {
                // GCompris uses dark gray lines
                this.graphics.lineStyle(3, 0x373737);
                this.graphics.beginPath();
                this.graphics.moveTo(prevX, prevY);
                this.graphics.lineTo(x, y);
                this.graphics.strokePath();
            }
        }
        
        // Mark current point as clicked (hide it or show as black point)
        this.points[index].setVisible(false);
        
        // Move to next point
        if (index < this.points.length - 1) {
            this.currentPointIndex++;
            this.updatePointsDisplay();
        } else {
            // Level complete
            this.showFinalImage();
        }
    }
  
    showFinalImage() {
        const levelData = this.levels[this.level % this.levels.length];
        const { width, height } = this.scale;
        
        // Hide points and graphics
        this.points.forEach(p => p.setVisible(false));
        this.graphics.clear();
        this.bgImage.setVisible(false);
        
        // Calculate size
        const barHeight = 80;
        const availableHeight = height - barHeight - 20;
        const paperSize = Math.min(width * 0.7, availableHeight);
        const centerX = width / 2;
        const centerY = (height - barHeight) / 2;
        
        // Show final letter image
        this.finalImage = this.add.image(centerX, centerY, `drawletters-${levelData.imageName2}`);
        this.finalImage.setDisplaySize(paperSize, paperSize);
        this.finalImage.setAlpha(0);
        this.finalImage.setDepth(5);
        
        this.tweens.add({
            targets: this.finalImage,
            alpha: 1,
            duration: 800,
            onComplete: () => {
                if (this.audioManager) this.audioManager.playSound('success');
                
                this.time.delayedCall(2000, () => {
                    this.nextLevel();
                });
            }
        });
    }
    
    nextLevel() {
        if (this.level < this.maxLevel - 1) {
            this.level++;
            this.scene.restart({ level: this.level });
        } else {
            // All levels complete - show victory
            this.showVictory();
        }
    }
    
    showVictory() {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(150);
        
        const message = this.add.text(width / 2, height / 2 - 30, '🎉 All Letters Complete! 🎉', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#FFD700'
        }).setOrigin(0.5).setDepth(151);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 30, 'Back to Menu', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(151).setInteractive({ useHandCursor: true });
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('GameMenu');
        });
    }
}
