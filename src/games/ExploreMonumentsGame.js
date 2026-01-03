import { LalelaGame } from '../utils/LalelaGame.js';

export class ExploreMonumentsGame extends LalelaGame {
    constructor() {
        super();
        this.level = 1;
        this.maxLevel = 3; // Currently implementing 3 levels
        this.monuments = [];
        this.mapBounds = null;
    }

    preload() {
        super.preload();
        
        // Load common assets
        this.load.svg('monument-key', 'assets/explore-monuments/key.svg');
        
        // Load Level 1 (World) assets
        this.load.svg('bg-world', 'assets/explore-monuments/wonders/world-map.svg');
        this.load.image('chichenItza', 'assets/explore-monuments/wonders/chichenItza.webp');
        this.load.image('colosseum', 'assets/explore-monuments/wonders/colosseum.webp');
        this.load.image('christTheRedeemer', 'assets/explore-monuments/wonders/christTheRedeemer.webp');
        this.load.image('greatWallofChina', 'assets/explore-monuments/wonders/greatWallofChina.webp');
        this.load.image('machuPicchu', 'assets/explore-monuments/wonders/machuPicchu.webp');
        this.load.image('petra', 'assets/explore-monuments/wonders/petra.webp');
        this.load.image('tajMahal', 'assets/explore-monuments/wonders/tajMahal.webp');

        // Load Level 2 (India) assets
        this.load.svg('bg-india', 'assets/explore-monuments/india/india.svg');
        this.load.image('goldenTemple', 'assets/explore-monuments/india/goldenTemple.webp');
        this.load.image('hawaMahal', 'assets/explore-monuments/india/hawaMahal.webp');
        this.load.image('gatewayofIndia', 'assets/explore-monuments/india/gatewayofIndia.webp');
        this.load.image('greatStupa', 'assets/explore-monuments/india/greatStupa.webp');
        this.load.image('ajantaCave', 'assets/explore-monuments/india/ajantaCave.webp');
        this.load.image('konarkSunTemple', 'assets/explore-monuments/india/konarkSunTemple.webp');
        this.load.image('mysorePalace', 'assets/explore-monuments/india/mysorePalace.webp');
        this.load.image('charminar', 'assets/explore-monuments/india/charminar.webp');
        this.load.image('victoriaMemorial', 'assets/explore-monuments/india/victoriaMemorial.webp');
        this.load.image('rangGhar', 'assets/explore-monuments/india/rangGhar.webp');
        this.load.image('qutubMinar', 'assets/explore-monuments/india/qutubMinar.webp');

        // Load Level 3 (France) assets
        this.load.svg('bg-france', 'assets/explore-monuments/france/france.svg');
        this.load.image('montStMichel', 'assets/explore-monuments/france/montStMichel.webp');
        // Add other France assets as needed... I'll stick to 2 fully implemented levels for now to ensure quality
    }

    init(data) {
        super.init(data);
        this.level = data?.level || 1;
        this.maxLevel = 2; // Restricting to 2 for now until I parse more data
    }

    create() {
        this.gameState = 'ready';
        
        if (typeof this.initializePerformanceOptimizations === 'function') {
            this.initializePerformanceOptimizations();
        }
        
        this.exploredMonuments = new Set();
        this.currentQuestion = 0;
        this.questions = [];
        this.monumentSprites = [];
        this.descriptionPanel = null;
        
        this.loadLevelData();
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    loadLevelData() {
        if (this.level === 1) {
            this.currentMapKey = 'bg-world';
            this.monuments = [
                { id: 'chichenItza', name: 'Chichén Itzá', x: 0.226, y: 0.495, description: 'Chichen Itza is a Mayan City on the Yucatan Peninsula in Mexico.' },
                { id: 'colosseum', name: 'Colosseum', x: 0.506, y: 0.425, description: 'The Colosseum is the most recognizable of Rome\'s Classical buildings.' },
                { id: 'christTheRedeemer', name: 'Christ the Redeemer', x: 0.348, y: 0.630, description: 'Christ the Redeemer is an Art Deco statue of Jesus Christ in Rio de Janeiro, Brazil.' },
                { id: 'greatWallofChina', name: 'The Great Wall of China', x: 0.794, y: 0.428, description: 'The Great Wall winds up and down across deserts, grasslands, mountains and plateaus.' },
                { id: 'machuPicchu', name: 'Machu Picchu', x: 0.272, y: 0.6, description: 'Machu Picchu stands 2430 meters above sea-level, in the middle of a tropical mountain forest.' },
                { id: 'petra', name: 'Petra', x: 0.569, y: 0.465, description: 'Petra is a historical and archaeological city in southern Jordan.' },
                { id: 'tajMahal', name: 'Taj Mahal', x: 0.689, y: 0.472, description: 'The Taj Mahal is a white marble mausoleum located in Agra, India.' }
            ];
            this.levelTitle = 'The New 7 Wonders of the World';
        } else if (this.level === 2) {
            this.currentMapKey = 'bg-india';
            this.monuments = [
                { id: 'goldenTemple', name: 'Golden Temple', x: 0.255, y: 0.150, description: 'Sri Harimandir Sahib, known as the Golden Temple in Amritsar.' },
                { id: 'hawaMahal', name: 'Hawa Mahal', x: 0.270, y: 0.330, description: 'Hawa Mahal is a palace in Jaipur, India.' },
                { id: 'gatewayofIndia', name: 'Gateway of India', x: 0.185, y: 0.610, description: 'The Gateway of India is one of India\'s most unique landmarks situated in Mumbai.' },
                { id: 'greatStupa', name: 'Great Stupa', x: 0.320, y: 0.445, description: 'The Great Stupa at Sanchi is the oldest stone structure in India.' },
                { id: 'ajantaCave', name: 'Ajanta Caves', x: 0.250, y: 0.550, description: 'The Ajanta Caves are rock-cut Buddhist cave monuments.' },
                { id: 'konarkSunTemple', name: 'Konark Sun Temple', x: 0.590, y: 0.585, description: 'The Konark Sun Temple is a 13th-century Hindu temple dedicated to the Sun god.' },
                { id: 'mysorePalace', name: 'Mysore Palace', x: 0.300, y: 0.845, description: 'Mysore Palace is one of the largest and most spectacular monuments in India.' },
                { id: 'charminar', name: 'Charminar', x: 0.355, y: 0.670, description: 'The Charminar in Hyderabad was constructed in 1591.' },
                { id: 'victoriaMemorial', name: 'Victoria Memorial', x: 0.675, y: 0.500, description: 'The Victoria Memorial was built to commemorate the peak of the British Empire in India.' },
                { id: 'rangGhar', name: 'Rang Ghar', x: 0.870, y: 0.310, description: 'The Rang Ghar is a two-storied building which once served as the royal sports-pavilion.' },
                { id: 'qutubMinar', name: 'Qutub Minar', x: 0.310, y: 0.275, description: 'Qutub Minar is the tallest brick minaret in the world.' }
            ];
            this.levelTitle = 'Monuments of India';
        }
    }

    createBackground() {
        const { width, height } = this.scale;
        
        if (this.textures.exists(this.currentMapKey)) {
            const bg = this.add.image(width / 2, height / 2, this.currentMapKey);
            
            // GCompris logic: Play area is a 1000x1000 square centered in a 3000x3000 background
            const availableHeight = height - 100;
            const playAreaSize = Math.min(width, availableHeight);
            
            // Scale background to be 3x the play area size
            const scale = (3 * playAreaSize) / bg.width;
            
            bg.setScale(scale);
            bg.setDepth(-1);
            
            // Store map bounds for positioning monuments
            this.mapBounds = {
                x: (width - playAreaSize) / 2,
                y: (height - playAreaSize) / 2,
                width: playAreaSize,
                height: playAreaSize
            };
        } else {
            // Fallback
            const bg = this.add.graphics();
            bg.fillStyle(0x4682B4, 1);
            bg.fillRect(0, 0, width, height);
            bg.setDepth(-1);
            this.mapBounds = { x: 0, y: 0, width, height };
        }
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Title/instruction panel
        this.instructionPanel = this.add.graphics();
        this.instructionPanel.fillStyle(0x3d5a5a, 0.9);
        this.instructionPanel.fillRoundedRect(width / 2 - 300, 10, 600, 45, 10);
        this.instructionPanel.setDepth(10);
        
        this.instructionText = this.add.text(width / 2, 32, this.levelTitle, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // Score display
        this.scoreText = this.add.text(width - 20, 15, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0).setDepth(10);
        
        this.createNavigationDock();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const buttonSize = 45;
        const padding = 10;
        const y = height - buttonSize / 2 - 10;
        
        let x = 40;
        
        // Home button
        this.createNavButton(x, y, 0x26c6da, '⌂', () => {
            this.scene.start('GameMenu');
        });
        x += buttonSize + padding;
        
        // Previous level
        this.createNavButton(x, y, 0xf57c00, '❮', () => {
            if (this.level > 1) {
                this.level--;
                this.restartLevel();
            }
        });
        x += buttonSize + padding;
        
        // Level indicator
        this.levelText = this.add.text(x + 30, y, `Level ${this.level}`, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        x += 70;
        
        // Next level
        this.createNavButton(x, y, 0xeeeeee, '❯', () => {
            if (this.level < this.maxLevel) {
                this.level++;
                this.restartLevel();
            }
        }, '#333333');
        x += buttonSize + padding;
        
        // Restart
        this.createNavButton(x, y, 0x26c6da, '↻', () => {
            this.restartLevel();
        });
    }
    
    createNavButton(x, y, color, icon, callback, textColor = '#ffffff') {
        const button = this.add.circle(x, y, 20, color)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        
        this.add.circle(x, y + 2, 20, 0x000000, 0.3).setDepth(9);
        
        const text = this.add.text(x, y, icon, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: textColor
        }).setOrigin(0.5).setDepth(11);

        button.on('pointerover', () => {
            button.setScale(1.1);
            text.setScale(1.1);
        });
        button.on('pointerout', () => {
            button.setScale(1);
            text.setScale(1);
        });
        button.on('pointerdown', callback);
        
        return { button, text };
    }

    setupGameLogic() {
        this.createMonuments();
        this.updateInstructions();
        this.startQuiz();
    }

    createMonuments() {
        const { width, height } = this.scale;
        
        // Clear existing
        this.monumentSprites.forEach(m => {
            if (m.marker) m.marker.destroy();
            if (m.label) m.label.destroy();
            m.destroy();
        });
        this.monumentSprites = [];
        
        const markerSize = Math.min(width, height) * 0.05;
        const mapBounds = this.mapBounds || { x: 0, y: 0, width, height };
        
        this.monuments.forEach((monument, index) => {
            const x = mapBounds.x + mapBounds.width * monument.x;
            const y = mapBounds.y + mapBounds.height * monument.y;
            
            // Create marker (key icon)
            const marker = this.add.image(x, y, 'monument-key');
            const scale = markerSize / Math.max(marker.width, marker.height);
            marker.setScale(scale);
            marker.setDepth(5);
            marker.setInteractive({ useHandCursor: true });
            
            marker.setData('monument', monument);
            marker.setData('index', index);
            
            marker.on('pointerdown', () => {
                this.checkAnswer(monument);
            });
            
            // Label (hidden initially)
            const label = this.add.text(x, y + markerSize/2 + 5, monument.name, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5, 0).setDepth(6).setVisible(false);
            
            this.monumentSprites.push({ marker, label, destroy: () => { marker.destroy(); label.destroy(); } });
        });
    }

    startQuiz() {
        this.questions = [...this.monuments];
        // Shuffle questions
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
        this.currentQuestion = 0;
        this.askQuestion();
    }

    askQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.showLevelComplete();
            return;
        }
        
        const target = this.questions[this.currentQuestion];
        this.instructionText.setText(`Find: ${target.name}`);
        
        // Reset markers
        this.monumentSprites.forEach(m => {
            m.marker.setTint(0xffffff);
            m.label.setVisible(false);
        });
    }

    checkAnswer(selectedMonument) {
        const target = this.questions[this.currentQuestion];
        
        if (selectedMonument.id === target.id) {
            // Correct
            this.sound.play('success');
            this.showMonumentInfo(target);
            this.currentQuestion++;
        } else {
            // Incorrect
            this.sound.play('fail');
            const sprite = this.monumentSprites.find(m => m.marker.getData('monument').id === selectedMonument.id);
            if (sprite) {
                sprite.marker.setTint(0xff0000);
                this.tweens.add({
                    targets: sprite.marker,
                    scale: sprite.marker.scale * 1.2,
                    duration: 100,
                    yoyo: true
                });
            }
        }
    }

    showMonumentInfo(monument) {
        const { width, height } = this.scale;
        
        // Create modal
        const modal = this.add.container(width/2, height/2).setDepth(20);
        
        const bg = this.add.rectangle(0, 0, 500, 400, 0xffffff).setStrokeStyle(4, 0x3d5a5a);
        modal.add(bg);
        
        // Image
        if (this.textures.exists(monument.id)) {
            const img = this.add.image(0, -50, monument.id);
            const scale = Math.min(400 / img.width, 250 / img.height);
            img.setScale(scale);
            modal.add(img);
        }
        
        // Title
        const title = this.add.text(0, 100, monument.name, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        modal.add(title);
        
        // Description
        const desc = this.add.text(0, 150, monument.description, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#333333',
            align: 'center',
            wordWrap: { width: 450 }
        }).setOrigin(0.5, 0);
        modal.add(desc);
        
        // Close button
        const closeBtn = this.add.text(0, 180, 'Next', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#3d5a5a',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            modal.destroy();
            this.askQuestion();
        });
        modal.add(closeBtn);
    }

    showLevelComplete() {
        const { width, height } = this.scale;
        
        const modal = this.add.container(width/2, height/2).setDepth(30);
        
        const bg = this.add.rectangle(0, 0, 400, 300, 0xffffff).setStrokeStyle(4, 0x00B378);
        modal.add(bg);
        
        const title = this.add.text(0, -50, 'Level Complete!', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#00B378',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        modal.add(title);
        
        const nextBtn = this.add.text(0, 50, this.level < this.maxLevel ? 'Next Level' : 'Finish', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#00B378',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        nextBtn.on('pointerdown', () => {
            modal.destroy();
            if (this.level < this.maxLevel) {
                this.level++;
                this.restartLevel();
            } else {
                this.scene.start('GameMenu');
            }
        });
        modal.add(nextBtn);
        
        this.sound.play('level-complete');
    }

    restartLevel() {
        this.scene.restart({ level: this.level });
    }
}
