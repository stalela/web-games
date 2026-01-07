/**
 * ExploreWorldAnimalsGame - Learn about wild animals from around the world
 * 
 * Adapted from GCompris explore_world_animals activity
 * Restyled to match GCompris visual design with wood background
 * 
 * Features:
 * - Level 1: Explore - Click on animals to learn about them
 * - Level 2: Map Quiz - Find animals on world map by name
 * - 15 animals from different continents
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class ExploreWorldAnimalsGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'ExploreWorldAnimalsGame' });
        
        // World animals data - from GCompris board1.qml, board2.qml, board3.qml
        this.animals = [
            // Board 1 animals
            {
                id: 'jaguar',
                name: 'Jaguar',
                region: 'South America',
                description: 'The jaguar\'s jaw is well developed. It has the strongest bite of all the felines, able to break even a tortoise shell!',
                hint: 'I have the strongest bite of all big cats.',
                x: 0.32,
                y: 0.575
            },
            {
                id: 'hedgehog',
                name: 'Hedgehog',
                region: 'Europe',
                description: 'Hedgehogs eat small animals like frogs and insects. When in danger, they curl up into a ball and stick up their coat of sharp spines.',
                hint: 'I have sharp spines and curl into a ball.',
                x: 0.50,
                y: 0.40
            },
            {
                id: 'giraffe',
                name: 'Giraffe',
                region: 'Africa',
                description: 'The giraffe is the tallest mammal in the world. Their legs, usually 1.8 meters long, are taller than most humans!',
                hint: 'I am the tallest animal in the world.',
                x: 0.525,
                y: 0.53
            },
            {
                id: 'bison',
                name: 'Bison',
                region: 'North America',
                description: 'Bisons live on the plains of North America and were hunted by Native Americans for food.',
                hint: 'I am a large bovine from the American plains.',
                x: 0.215,
                y: 0.445
            },
            {
                id: 'narwhal',
                name: 'Narwhal',
                region: 'Arctic Ocean',
                description: 'Narwhals are whales that live in the Arctic Ocean and have long tusks. These tusks remind many people of the mythical unicorn\'s horn.',
                hint: 'I am a whale with a long tusk like a unicorn.',
                x: 0.47,
                y: 0.255
            },
            // Board 2 animals
            {
                id: 'chameleon',
                name: 'Chameleon',
                region: 'Africa & Madagascar',
                description: 'The chameleon is well-known for its ability to change its skin color in a couple of seconds.',
                hint: 'I can change my skin color rapidly.',
                x: 0.60,
                y: 0.615
            },
            {
                id: 'polar_bear',
                name: 'Polar Bear',
                region: 'Arctic',
                description: 'The polar bear is one of the world\'s largest predatory mammals. It weighs up to a ton and can be as long as 3 meters!',
                hint: 'I am a huge white bear from the Arctic.',
                x: 0.365,
                y: 0.25
            },
            {
                id: 'kangaroo',
                name: 'Kangaroo',
                region: 'Australia',
                description: 'The kangaroo is well-known for the pouch on its belly used to cradle baby kangaroos.',
                hint: 'I hop and carry my baby in a pouch.',
                x: 0.840,
                y: 0.63
            },
            {
                id: 'scarlet_macaw',
                name: 'Scarlet Macaw',
                region: 'South America',
                description: 'The scarlet macaw is a big and bright colored parrot, able to learn up to 100 words!',
                hint: 'I am a colorful parrot that can learn many words.',
                x: 0.30,
                y: 0.55
            },
            {
                id: 'moose',
                name: 'Moose',
                region: 'North America',
                description: 'Being the largest of all deer, the moose eats as much as 25 kg per day. It can stand on hind legs to reach branches up to 4 meters!',
                hint: 'I am the largest member of the deer family.',
                x: 0.125,
                y: 0.37
            },
            // Board 3 animals
            {
                id: 'crocodile',
                name: 'Crocodile',
                region: 'Africa & Asia',
                description: 'The crocodile is a large amphibious reptile. It lives mostly in large tropical rivers, where it is an ambush predator.',
                hint: 'I am a large reptile with powerful jaws.',
                x: 0.525,
                y: 0.55
            },
            {
                id: 'dragon',
                name: 'Komodo Dragon',
                region: 'Indonesia',
                description: 'The Komodo dragon is the largest living lizard (up to 3 meters). It lives in the Indonesian islands.',
                hint: 'I am the largest living lizard in the world.',
                x: 0.80,
                y: 0.58
            },
            {
                id: 'koala',
                name: 'Koala',
                region: 'Australia',
                description: 'Koalas are herbivore marsupials that live in the eucalyptus forests of eastern Australia.',
                hint: 'I am a fuzzy marsupial that loves eucalyptus.',
                x: 0.885,
                y: 0.64
            },
            {
                id: 'lemur',
                name: 'Ring-tailed Lemur',
                region: 'Madagascar',
                description: 'The ring-tailed lemur is a primate that lives in Madagascar. Its striped tail makes it easy to recognize.',
                hint: 'I have a distinctive striped tail.',
                x: 0.595,
                y: 0.63
            },
            {
                id: 'panda',
                name: 'Panda',
                region: 'China',
                description: 'The panda is a bear with black and white fur that lives in mountain ranges in central China. Pandas mostly eat bamboo.',
                hint: 'I am a black and white bear that loves bamboo.',
                x: 0.765,
                y: 0.45
            }
        ];
    }

    preload() {
        super.preload();
        
        // Load wood background (same as ExploreLevels uses)
        this.load.svg('wood-background', 'assets/chess/background-wood.svg');
        
        // Load world map
        this.load.svg('world-map', 'assets/explore-world/world-map.svg');
        
        // Load animal photos (WebP images)
        this.animals.forEach(animal => {
            this.load.image(`${animal.id}-photo`, `assets/explore-world/${animal.id}.webp`);
        });
    }

    init(data) {
        super.init(data);
        this.level = data?.level || 1; // 1=explore, 2=quiz
        this.maxLevel = 2;
    }

    create() {
        this.gameState = 'ready';
        
        if (typeof this.initializePerformanceOptimizations === 'function') {
            this.initializePerformanceOptimizations();
        }
        
        // Game state
        this.exploredAnimals = new Set();
        this.currentQuestion = 0;
        this.questions = [];
        this.animalSprites = [];
        this.descriptionPanel = null;
        this.navElements = [];
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // GCompris uses brown wood background
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
        
        // Calculate map size (centered, with margins for UI)
        const barHeight = 80;
        const topMargin = 70;
        const availableHeight = height - barHeight - topMargin;
        const availableWidth = width * 0.65;
        
        // World map centered on wood background
        if (this.textures.exists('world-map')) {
            const map = this.add.image(width / 2, (height - barHeight + topMargin) / 2, 'world-map');
            
            // Scale to fit within available space while preserving aspect ratio
            const scaleX = availableWidth / map.width;
            const scaleY = availableHeight / map.height;
            const mapScale = Math.min(scaleX, scaleY);
            map.setScale(mapScale);
            map.setDepth(-1);
            
            // Store actual displayed map bounds for positioning animals
            const displayedWidth = map.width * mapScale;
            const displayedHeight = map.height * mapScale;
            const mapCenterX = width / 2;
            const mapCenterY = (height - barHeight + topMargin) / 2;
            
            this.mapBounds = {
                x: mapCenterX - displayedWidth / 2,
                y: mapCenterY - displayedHeight / 2,
                width: displayedWidth,
                height: displayedHeight
            };
        } else {
            // Fallback: create simple programmatic map
            const mapWidth = availableWidth;
            const mapHeight = availableHeight * 0.7;
            const mapX = (width - mapWidth) / 2;
            const mapY = topMargin + (availableHeight - mapHeight) / 2;
            
            const mapGfx = this.add.graphics();
            mapGfx.fillStyle(0x87CEEB, 1);
            mapGfx.fillRect(mapX, mapY, mapWidth, mapHeight);
            mapGfx.setDepth(-1);
            
            this.mapBounds = {
                x: mapX,
                y: mapY,
                width: mapWidth,
                height: mapHeight
            };
        }
    }

    createUI() {
        const { width, height } = this.scale;
        
        // GCompris-style instruction panel (white with blue border)
        const panelWidth = Math.min(650, width * 0.65);
        const panelHeight = 50;
        const panelX = (width - panelWidth) / 2 - 40; // Offset left for score
        
        this.instructionPanel = this.add.graphics();
        this.instructionPanel.fillStyle(0xF5F5F5, 0.95);
        this.instructionPanel.fillRoundedRect(panelX, 10, panelWidth, panelHeight, 8);
        this.instructionPanel.lineStyle(2, 0x3E7BB8, 1);
        this.instructionPanel.strokeRoundedRect(panelX, 10, panelWidth, panelHeight, 8);
        this.instructionPanel.setDepth(10);
        
        this.instructionText = this.add.text(panelX + panelWidth / 2, 35, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(11);
        
        // GCompris-style score display (white rounded box at top right)
        const scoreBoxWidth = 65;
        const scoreBoxHeight = 45;
        
        this.scoreBox = this.add.graphics();
        this.scoreBox.fillStyle(0xFFFFFF, 0.95);
        this.scoreBox.fillRoundedRect(width - scoreBoxWidth - 15, 10, scoreBoxWidth, scoreBoxHeight, 8);
        this.scoreBox.lineStyle(2, 0x3E7BB8, 1);
        this.scoreBox.strokeRoundedRect(width - scoreBoxWidth - 15, 10, scoreBoxWidth, scoreBoxHeight, 8);
        this.scoreBox.setDepth(10);
        
        this.scoreText = this.add.text(width - scoreBoxWidth / 2 - 15, 32, '1/2', {
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
        
        let x = 50;
        
        // Menu button (brown/tan with hamburger icon)
        this.createNavButton(x, y, buttonSize, 0x8B7355, '☰', () => {
            this.scene.start('GameMenu');
        });
        x += buttonSpacing;
        
        // Help button (green with white ?)
        this.createNavButton(x, y, buttonSize, 0x4CAF50, '?', () => {
            this.showHelpModal();
        });
        x += buttonSpacing;
        
        // Home button (orange with house icon)
        this.createNavButton(x, y, buttonSize, 0xF5A623, '⌂', () => {
            this.scene.start('GameMenu');
        });
        x += buttonSpacing;
        
        // Previous level (orange arrow)
        this.createNavButton(x, y, buttonSize, 0xF5A623, '❮', () => {
            if (this.level > 1) {
                this.level--;
                this.restartLevel();
            }
        });
        x += buttonSpacing * 0.75;
        
        // Level indicator (number between arrows)
        this.levelText = this.add.text(x, y, String(this.level), {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(101);
        x += buttonSpacing * 0.75;
        
        // Next level (orange arrow)
        this.createNavButton(x, y, buttonSize, 0xF5A623, '❯', () => {
            if (this.level < this.maxLevel) {
                this.level++;
                this.restartLevel();
            }
        });
        x += buttonSpacing;
        
        // Reload/Restart button (gray-blue)
        this.createNavButton(x, y, buttonSize, 0x7B8B9A, '↻', () => {
            this.restartLevel();
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
        const panelWidth = Math.min(500, width * 0.8);
        const panelHeight = 280;
        const panel = this.add.graphics();
        panel.fillStyle(0xFFFFFF, 0.98);
        panel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 15);
        panel.lineStyle(3, 0x4CAF50, 1);
        panel.strokeRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 15);
        this.helpModal.add(panel);
        
        // Title
        const title = this.add.text(width / 2, height / 2 - panelHeight / 2 + 35, 'World Animals', {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#4CAF50'
        }).setOrigin(0.5);
        this.helpModal.add(title);
        
        // Instructions based on level
        const instructions = [
            '',
            'Level 1: Explore\nClick on each animal marker to discover wild animals from around the world!',
            'Level 2: Quiz\nClick on the location where the given animal lives.'
        ];
        
        const text = this.add.text(width / 2, height / 2, instructions[this.level], {
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
        this.createAnimals();
        this.updateInstructions();
        
        if (this.level === 1) {
            this.updateExploreProgress();
        } else {
            this.startQuiz();
        }
    }

    createAnimals() {
        const { width, height } = this.scale;
        
        // Clear existing
        this.animalSprites.forEach(a => {
            if (a.container) a.container.destroy();
            if (a.star) a.star.destroy();
            if (a.label) a.label.destroy();
            if (a.marker) {
                if (a.marker.border) a.marker.border.destroy();
                a.marker.destroy();
            }
            a.destroy();
        });
        this.animalSprites = [];
        
        const markerSize = Math.min(width, height) * 0.055;
        
        // Use map bounds to position animals relative to the map
        const mapBounds = this.mapBounds;
        
        this.animals.forEach((animal, index) => {
            // Position relative to the map bounds
            const x = mapBounds.x + mapBounds.width * animal.x;
            const y = mapBounds.y + mapBounds.height * animal.y;
            
            // Create circular marker with animal thumbnail
            const photoKey = `${animal.id}-photo`;
            let marker;
            
            if (this.textures.exists(photoKey)) {
                // Create circular photo marker
                marker = this.add.image(x, y, photoKey);
                const scale = markerSize / Math.max(marker.width, marker.height);
                marker.setScale(scale);
                
                // Border circle
                const border = this.add.graphics();
                border.lineStyle(3, 0xFFFFFF, 1);
                border.strokeCircle(x, y, markerSize / 2 + 2);
                border.setDepth(2);
                marker.border = border;
            } else {
                // Fallback: question mark marker (GCompris style)
                const gfx = this.add.graphics();
                gfx.fillStyle(0xD4A574, 1);
                gfx.fillCircle(0, 0, markerSize / 2);
                gfx.lineStyle(2, 0xFFFFFF, 1);
                gfx.strokeCircle(0, 0, markerSize / 2);
                gfx.setPosition(x, y);
                
                marker = gfx;
                
                this.add.text(x, y, '?', {
                    fontSize: `${markerSize * 0.6}px`,
                    color: '#FFFFFF',
                    fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(3);
            }
            
            marker.setDepth(2);
            
            // Create hit area
            const hitArea = this.add.circle(x, y, markerSize / 2 + 5, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .setDepth(3);
            
            hitArea.setData('animal', animal);
            hitArea.setData('index', index);
            hitArea.marker = marker;
            
            // Region label (smaller, below marker)
            const regionLabel = this.add.text(x, y + markerSize / 2 + 10, animal.region, {
                fontFamily: 'Arial',
                fontSize: '9px',
                color: '#FFFFFF',
                backgroundColor: '#333333cc',
                padding: { x: 3, y: 2 }
            }).setOrigin(0.5).setDepth(4);
            hitArea.label = regionLabel;
            
            // Star indicator (for explore mode)
            const star = this.add.text(x, y - markerSize / 2 - 10, '⭐', {
                fontSize: '14px'
            }).setOrigin(0.5).setDepth(5).setVisible(false);
            hitArea.star = star;
            
            // Hover effect
            const originalScale = marker.scale || 1;
            hitArea.on('pointerover', () => {
                if (marker.setScale) marker.setScale(originalScale * 1.2);
                if (marker.border) marker.border.setScale(1.2);
            });
            hitArea.on('pointerout', () => {
                if (marker.setScale) marker.setScale(originalScale);
                if (marker.border) marker.border.setScale(1);
            });
            
            hitArea.on('pointerdown', () => {
                this.onAnimalClick(animal, hitArea);
            });
            
            this.animalSprites.push(hitArea);
        });
    }

    onAnimalClick(animal, sprite) {
        if (this.level === 1) {
            // Explore mode - show description
            this.showDescription(animal);
            this.exploredAnimals.add(animal.id);
            sprite.star.setVisible(true);
            this.updateExploreProgress();
            
            // Check if all explored
            if (this.exploredAnimals.size === this.animals.length) {
                this.time.delayedCall(500, () => {
                    this.handleLevelComplete();
                });
            }
        } else {
            // Quiz mode - check answer
            this.checkQuizAnswer(animal, sprite);
        }
    }

    showDescription(animal) {
        const { width, height } = this.scale;
        
        // Remove existing panel
        this.hideDescriptionPanel();
        
        // Create panel container
        this.descriptionContainer = this.add.container(0, 0).setDepth(50);
        
        // Panel background
        const panelWidth = Math.min(550, width * 0.8);
        const panelHeight = Math.min(320, height * 0.5);
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;
        
        this.descriptionPanel = this.add.graphics();
        this.descriptionPanel.fillStyle(0xFFFFFF, 0.98);
        this.descriptionPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
        this.descriptionPanel.lineStyle(3, 0x4CAF50, 1);
        this.descriptionPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
        this.descriptionContainer.add(this.descriptionPanel);
        
        // Animal photo
        const photoKey = `${animal.id}-photo`;
        const photoX = panelX + panelWidth * 0.25;
        const photoY = panelY + panelHeight * 0.5;
        
        if (this.textures.exists(photoKey)) {
            this.animalPhoto = this.add.image(photoX, photoY, photoKey);
            const maxPhotoSize = Math.min(panelWidth * 0.35, panelHeight * 0.6);
            const photoScale = Math.min(maxPhotoSize / this.animalPhoto.width, maxPhotoSize / this.animalPhoto.height);
            this.animalPhoto.setScale(photoScale);
            this.descriptionContainer.add(this.animalPhoto);
        }
        
        // Title
        const titleX = panelX + panelWidth * 0.65;
        this.descriptionTitle = this.add.text(titleX, panelY + 35, animal.name, {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#333333'
        }).setOrigin(0.5);
        this.descriptionContainer.add(this.descriptionTitle);
        
        // Region label
        this.regionLabel = this.add.text(titleX, panelY + 70, `📍 ${animal.region}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#666666'
        }).setOrigin(0.5);
        this.descriptionContainer.add(this.regionLabel);
        
        // Description
        this.descriptionText = this.add.text(titleX, panelY + panelHeight * 0.55, animal.description, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#555555',
            wordWrap: { width: panelWidth * 0.42 },
            align: 'center'
        }).setOrigin(0.5);
        this.descriptionContainer.add(this.descriptionText);
        
        // Close button
        this.closeBtn = this.add.circle(panelX + panelWidth - 25, panelY + 25, 18, 0xE53935);
        this.closeBtn.setStrokeStyle(2, 0xFFFFFF);
        this.closeBtn.setInteractive({ useHandCursor: true });
        this.descriptionContainer.add(this.closeBtn);
        
        const closeX = this.add.text(panelX + panelWidth - 25, panelY + 25, '✕', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.descriptionContainer.add(closeX);
        
        this.closeBtn.on('pointerdown', () => {
            this.hideDescriptionPanel();
        });
    }

    hideDescriptionPanel() {
        if (this.descriptionContainer) {
            this.descriptionContainer.destroy();
            this.descriptionContainer = null;
            this.descriptionPanel = null;
        }
    }

    updateInstructions() {
        // GCompris-style instructions
        const instructions = [
            '',
            'Explore wild animals from around the world.',
            'Click on the location where the given animal lives.'
        ];
        
        if (this.level === 2 && this.questions[this.currentQuestion]) {
            this.instructionText.setText(`Find the ${this.questions[this.currentQuestion].name}!`);
        } else {
            this.instructionText.setText(instructions[this.level]);
        }
    }

    updateExploreProgress() {
        // Update level display for explore mode
        this.scoreText.setText(`${this.exploredAnimals.size}/${this.animals.length}`);
    }

    startQuiz() {
        // Shuffle questions
        this.questions = [...this.animals].sort(() => Math.random() - 0.5);
        this.currentQuestion = 0;
        this.showNextQuestion();
    }

    showNextQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.handleLevelComplete();
            return;
        }
        
        // Update level/score display
        this.scoreText.setText(`${this.currentQuestion + 1}/${this.questions.length}`);
        
        const animal = this.questions[this.currentQuestion];
        this.instructionText.setText(`Click on the location where the ${animal.name} lives.`);
    }

    checkQuizAnswer(animal, sprite) {
        const correctAnimal = this.questions[this.currentQuestion];
        
        if (animal.id === correctAnimal.id) {
            // Correct!
            this.showFeedback(true, sprite);
            this.currentQuestion++;
            
            this.time.delayedCall(800, () => {
                this.showNextQuestion();
            });
        } else {
            // Wrong - show hint
            this.showFeedback(false, sprite);
            this.instructionText.setText(`That's the ${animal.name}. Find the ${correctAnimal.name}!`);
        }
    }

    showFeedback(correct, sprite) {
        const marker = sprite.marker;
        
        if (correct) {
            // Green pulse
            if (marker.setScale) {
                this.tweens.add({
                    targets: marker,
                    scale: { from: marker.scale, to: marker.scale * 1.5 },
                    duration: 300,
                    yoyo: true,
                    ease: 'Power2'
                });
            }
            
            const check = this.add.text(sprite.x, sprite.y, '✓', {
                fontSize: '40px',
                color: '#4CAF50'
            }).setOrigin(0.5).setDepth(25);
            
            this.tweens.add({
                targets: check,
                y: sprite.y - 40,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => check.destroy()
            });
        } else {
            // Shake
            if (marker.x !== undefined) {
                const originalX = marker.x;
                this.tweens.add({
                    targets: marker,
                    x: originalX + 8,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                    ease: 'Power2',
                    onComplete: () => marker.setX(originalX)
                });
            }
            
            const wrong = this.add.text(sprite.x, sprite.y, '✗', {
                fontSize: '30px',
                color: '#F44336'
            }).setOrigin(0.5).setDepth(25);
            
            this.tweens.add({
                targets: wrong,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => wrong.destroy()
            });
        }
    }

    handleLevelComplete() {
        const { width, height } = this.scale;
        
        if (this.level < this.maxLevel) {
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setDepth(150);
            
            const levelNames = ['', 'Exploration', 'Quiz'];
            const message = this.add.text(width / 2, height / 2 - 30, `🌍 ${levelNames[this.level]} Complete! 🌍`, {
                fontFamily: 'Arial Black',
                fontSize: '28px',
                color: '#4CAF50'
            }).setOrigin(0.5).setDepth(151);
            
            const nextBtn = this.add.text(width / 2, height / 2 + 30, 'Start Quiz →', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(151).setInteractive({ useHandCursor: true });
            
            nextBtn.on('pointerdown', () => {
                overlay.destroy();
                message.destroy();
                nextBtn.destroy();
                this.level++;
                this.restartLevel();
            });
        } else {
            this.showVictory();
        }
    }

    showVictory() {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(150);
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 World Animal Expert! 🏆', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#FFD700'
        }).setOrigin(0.5).setDepth(151);
        
        const subMessage = this.add.text(width / 2, height / 2 + 10, `You learned about all ${this.animals.length} animals!`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(151);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 60, 'Back to Menu', {
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

    restartLevel() {
        this.exploredAnimals = new Set();
        this.scene.restart({ level: this.level });
    }
}
