/**
 * ExploreFarmAnimalsGame - Learn about farm animals
 * 
 * Adapted from GCompris explore_farm_animals activity
 * Restyled to match GCompris visual design with farm hillside background
 * 
 * Features:
 * - Level 1: Explore - Click on animals to learn about them
 * - Level 2: Sound Quiz - Identify animals by their sounds
 * - Level 3: Text Quiz - Identify animals by description
 */

import { LalelaGame } from '../utils/LalelaGame.js';

export class ExploreFarmAnimalsGame extends LalelaGame {
    constructor(config) {
        super(config || { key: 'ExploreFarmAnimalsGame' });
        
        // Farm animal data with positions from GCompris board1.qml
        this.animals = [
            {
                id: 'horse',
                name: 'Horse',
                sound: 'neigh',
                description: 'The horse goes \'neigh\'. Horses are adapted to run, allowing them to quickly escape predators. They have single-toed hooves.',
                hint: 'This animal has single-toed hooves.',
                x: 0.18,
                y: 0.43,
                width: 0.2,
                height: 0.19
            },
            {
                id: 'chicken',
                name: 'Chicken',
                sound: 'cluck',
                description: 'The chicken goes \'cluck\'. Domestic chickens have wings but are not capable of long-distance flight. They have a comb on their head.',
                hint: 'This animal has a comb on its head.',
                x: 0.70,
                y: 0.80,
                width: 0.19,
                height: 0.12
            },
            {
                id: 'cow',
                name: 'Cow',
                sound: 'moo',
                description: 'The cow goes \'moo\'. Cows have around 20,000 taste buds and can detect odours 8km away.',
                hint: 'This animal has around 20,000 taste buds.',
                x: 0.43,
                y: 0.46,
                width: 0.21,
                height: 0.16
            },
            {
                id: 'cat',
                name: 'Cat',
                sound: 'meow',
                description: 'The cat goes \'meow\'. Cats are valued for companionship and their ability to chase mice and other rodents.',
                hint: 'This animal can purr.',
                x: 0.14,
                y: 0.68,
                width: 0.12,
                height: 0.10
            },
            {
                id: 'pig',
                name: 'Pig',
                sound: 'oink',
                description: 'The pig goes \'oink\'. Pigs wallow in the mud to control their body temperature.',
                hint: 'This animal wallows in the mud to control its body temperature.',
                x: 0.38,
                y: 0.65,
                width: 0.18,
                height: 0.14
            },
            {
                id: 'duck',
                name: 'Duck',
                sound: 'quack',
                description: 'The duck goes \'quack\'. Ducks have waterproof feathers and webbed feet for swimming.',
                hint: 'This animal has webbed feet and can swim on the water.',
                x: 0.33,
                y: 0.83,
                width: 0.245,
                height: 0.14
            },
            {
                id: 'owl',
                name: 'Owl',
                sound: 'hoot',
                description: 'The owl goes \'hoot\'. Owls are nocturnal birds with excellent vision and hearing at night.',
                hint: 'This animal is a nocturnal bird.',
                x: 0.88,
                y: 0.37,
                width: 0.07,
                height: 0.08
            },
            {
                id: 'dog',
                name: 'Dog',
                sound: 'woof',
                description: 'The dog goes \'woof\'. Dogs are probably the oldest domesticated species. They are descendants of the wolf.',
                hint: 'This animal is a descendant of the wolf.',
                x: 0.86,
                y: 0.62,
                width: 0.195,
                height: 0.14
            },
            {
                id: 'sheep',
                name: 'Sheep',
                sound: 'baa',
                description: 'The sheep goes \'baa\'. Most sheep bear a fleece of wool for textile production.',
                hint: 'This animal produces wool.',
                x: 0.64,
                y: 0.59,
                width: 0.16,
                height: 0.16
            }
        ];
    }

    preload() {
        super.preload();
        
        // Load farm background
        this.load.svg('farm-background', 'assets/explore-farm/farm-animals.svg');
        
        // Load animal SVGs (for clickable icons) and WebPs (for info panel)
        this.animals.forEach(animal => {
            this.load.svg(`${animal.id}-icon`, `assets/explore-farm/${animal.id}.svg`);
            this.load.image(`${animal.id}-photo`, `assets/explore-farm/${animal.id}.webp`);
        });
    }

    init(data) {
        super.init(data);
        this.level = data?.level || 1; // 1=explore, 2=sound, 3=text
        this.maxLevel = 3;
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
        
        // Use actual farm background SVG from GCompris
        if (this.textures.exists('farm-background')) {
            // GCompris logic: Play area is a 1000x1000 square centered in a 3000x3000 background
            const barHeight = 70; // Space for nav bar
            const availableHeight = height - barHeight;
            const playAreaSize = Math.min(width, availableHeight);
            
            const bg = this.add.image(width / 2, (height - barHeight) / 2, 'farm-background');
            
            // Scale background to be 3x the play area size (as per GCompris)
            const scale = (3 * playAreaSize) / bg.width;
            bg.setScale(scale);
            bg.setDepth(-1);
            
            // Store map bounds for positioning animals (the center 1/3 of the bg)
            this.mapBounds = {
                x: (width - playAreaSize) / 2,
                y: (height - barHeight - playAreaSize) / 2,
                width: playAreaSize,
                height: playAreaSize
            };
        } else {
            // Fallback: programmatic farm background matching GCompris colors
            const gfx = this.add.graphics();
            
            // Sky gradient (light blue at top, lighter at horizon)
            gfx.fillStyle(0x87CEEB, 1);
            gfx.fillRect(0, 0, width, height * 0.45);
            
            // Ground (green gradient)
            gfx.fillStyle(0x90C040, 1);
            gfx.fillRect(0, height * 0.45, width, height * 0.55);
            
            // Lighter grass foreground
            gfx.fillStyle(0x80B030, 1);
            gfx.fillRect(0, height * 0.7, width, height * 0.3);
            
            gfx.setDepth(-1);
            
            this.mapBounds = { 
                x: 0, 
                y: 0, 
                width, 
                height: height - 70 
            };
        }
    }

    createUI() {
        const { width, height } = this.scale;
        
        // GCompris-style instruction panel (white with blue border)
        const panelWidth = Math.min(600, width * 0.6);
        const panelHeight = 50;
        const panelX = (width - panelWidth) / 2 - 30; // Offset left to account for score
        
        this.instructionPanel = this.add.graphics();
        this.instructionPanel.fillStyle(0xF5F5F5, 0.95);
        this.instructionPanel.fillRoundedRect(panelX, 10, panelWidth, panelHeight, 8);
        this.instructionPanel.lineStyle(2, 0x3E7BB8, 1);
        this.instructionPanel.strokeRoundedRect(panelX, 10, panelWidth, panelHeight, 8);
        this.instructionPanel.setDepth(10);
        
        this.instructionText = this.add.text(panelX + panelWidth / 2, 35, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(11);
        
        // GCompris-style score display (white rounded box at top right)
        const scoreBoxWidth = 60;
        const scoreBoxHeight = 40;
        
        this.scoreBox = this.add.graphics();
        this.scoreBox.fillStyle(0xFFFFFF, 0.95);
        this.scoreBox.fillRoundedRect(width - scoreBoxWidth - 15, 10, scoreBoxWidth, scoreBoxHeight, 8);
        this.scoreBox.lineStyle(2, 0x3E7BB8, 1);
        this.scoreBox.strokeRoundedRect(width - scoreBoxWidth - 15, 10, scoreBoxWidth, scoreBoxHeight, 8);
        this.scoreBox.setDepth(10);
        
        this.scoreText = this.add.text(width - scoreBoxWidth / 2 - 15, 30, '1/3', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);
        
        // Create GCompris-style navigation bar
        this.createNavigationBar();
    }

    createNavigationBar() {
        const { width, height } = this.scale;
        const buttonSize = 55;
        const buttonSpacing = 65;
        const y = height - buttonSize / 2 - 12;
        
        let x = 45;
        
        // Menu button (brown/tan)
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
        x += buttonSpacing * 0.8;
        
        // Level indicator (number between arrows)
        this.levelText = this.add.text(x, y, String(this.level), {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(101);
        x += buttonSpacing * 0.8;
        
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
        
        // Sound replay button (for level 2 - right side)
        if (this.level === 2) {
            this.createNavButton(width - 70, y, buttonSize, 0x9C27B0, '🔊', () => {
                this.playCurrentSound();
            });
        }
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
        const panelHeight = 300;
        const panel = this.add.graphics();
        panel.fillStyle(0xFFFFFF, 0.98);
        panel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 15);
        panel.lineStyle(3, 0x4CAF50, 1);
        panel.strokeRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 15);
        this.helpModal.add(panel);
        
        // Title
        const title = this.add.text(width / 2, height / 2 - panelHeight / 2 + 35, 'Farm Animals', {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#4CAF50'
        }).setOrigin(0.5);
        this.helpModal.add(title);
        
        // Instructions based on level
        const instructions = [
            '',
            'Level 1: Explore\nClick on each farm animal to discover them and learn interesting facts!',
            'Level 2: Sound Quiz\nListen to the animal sound and click on the correct animal.',
            'Level 3: Text Quiz\nRead the hint and find the matching animal.'
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
            if (a.star) a.star.destroy();
            a.destroy();
        });
        this.animalSprites = [];
        
        // Use map bounds if available, otherwise full screen
        const mapBounds = this.mapBounds || { x: 0, y: 0, width, height: height - 70 };
        
        this.animals.forEach((animal, index) => {
            // Position relative to map bounds
            const x = mapBounds.x + mapBounds.width * animal.x;
            const y = mapBounds.y + mapBounds.height * animal.y;
            
            // Target size relative to map bounds
            const targetWidth = mapBounds.width * animal.width;
            const targetHeight = mapBounds.height * animal.height;
            
            // Create animal sprite using SVG
            const textureKey = `${animal.id}-icon`;
            let sprite;
            
            if (this.textures.exists(textureKey)) {
                sprite = this.add.image(x, y, textureKey);
                // Scale to fit within target dimensions
                const scaleX = targetWidth / sprite.width;
                const scaleY = targetHeight / sprite.height;
                const scale = Math.min(scaleX, scaleY);
                sprite.setScale(scale);
            } else {
                // Fallback: colored circle with first letter
                sprite = this.add.circle(x, y, Math.min(targetWidth, targetHeight) / 2, 0x8B4513);
                this.add.text(x, y, animal.name[0], {
                    fontSize: '24px',
                    color: '#ffffff'
                }).setOrigin(0.5).setDepth(3);
            }
            
            sprite.setDepth(2);
            sprite.setInteractive({ useHandCursor: true });
            sprite.setData('animal', animal);
            sprite.setData('index', index);
            
            // Star indicator (for explore mode - shows which animals have been discovered)
            const starSize = Math.min(targetWidth, targetHeight) * 0.3;
            const star = this.add.text(x, y - targetHeight / 2 - 15, '⭐', {
                fontSize: `${Math.max(16, starSize)}px`
            }).setOrigin(0.5).setDepth(5).setVisible(false);
            sprite.star = star;
            
            // Hover effect
            const originalScale = sprite.scale;
            sprite.on('pointerover', () => {
                sprite.setScale(originalScale * 1.15);
            });
            sprite.on('pointerout', () => {
                sprite.setScale(originalScale);
            });
            
            sprite.on('pointerdown', () => {
                this.onAnimalClick(animal, sprite);
            });
            
            this.animalSprites.push(sprite);
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
        const panelWidth = Math.min(600, width * 0.85);
        const panelHeight = Math.min(350, height * 0.5);
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;
        
        this.descriptionPanel = this.add.graphics();
        this.descriptionPanel.fillStyle(0xFFFFFF, 0.98);
        this.descriptionPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
        this.descriptionPanel.lineStyle(3, 0x4CAF50, 1);
        this.descriptionPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
        this.descriptionContainer.add(this.descriptionPanel);
        
        // Animal photo (WebP image)
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
        this.descriptionTitle = this.add.text(titleX, panelY + 40, animal.name, {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#333333'
        }).setOrigin(0.5);
        this.descriptionContainer.add(this.descriptionTitle);
        
        // Sound text
        const soundText = `🔊 "${animal.sound.toUpperCase()}"`;
        this.soundLabel = this.add.text(titleX, panelY + 80, soundText, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#9C27B0'
        }).setOrigin(0.5);
        this.descriptionContainer.add(this.soundLabel);
        
        // Description
        this.descriptionText = this.add.text(titleX, panelY + panelHeight * 0.55, animal.description, {
            fontFamily: 'Arial',
            fontSize: '15px',
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
            'Click on each farm animal to discover them.',
            'Click on the farm animal that makes the sound you hear.',
            'Click the animal that matches the description.'
        ];
        this.instructionText.setText(instructions[this.level]);
    }

    updateExploreProgress() {
        // Update score display with explore progress
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
        
        // Update level display
        this.scoreText.setText(`${this.currentQuestion + 1}/${this.questions.length}`);
        
        const animal = this.questions[this.currentQuestion];
        
        if (this.level === 2) {
            // Sound quiz - update instruction to match GCompris
            this.instructionText.setText('Click on the farm animal that makes the sound you hear.');
            this.playCurrentSound();
        } else {
            // Text quiz - show hint as instruction
            this.instructionText.setText(animal.hint);
        }
    }

    playCurrentSound() {
        const { width, height } = this.scale;
        
        // Visual feedback for sound playing
        const soundIcon = this.add.text(width / 2, height / 2, '🔊', {
            fontSize: '60px'
        }).setOrigin(0.5).setDepth(30);
        
        this.tweens.add({
            targets: soundIcon,
            scale: { from: 1, to: 1.5 },
            alpha: { from: 1, to: 0 },
            duration: 800,
            ease: 'Power2',
            onComplete: () => soundIcon.destroy()
        });
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
            // Wrong
            this.showFeedback(false, sprite);
        }
    }

    showFeedback(correct, sprite) {
        if (correct) {
            // Green glow and spin
            this.tweens.add({
                targets: sprite,
                angle: { from: 0, to: 360 },
                duration: 500,
                ease: 'Power2'
            });
            
            const check = this.add.text(sprite.x, sprite.y, '✓', {
                fontSize: '50px',
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
            const originalX = sprite.x;
            this.tweens.add({
                targets: sprite,
                x: originalX + 10,
                duration: 50,
                yoyo: true,
                repeat: 3,
                ease: 'Power2',
                onComplete: () => sprite.setX(originalX)
            });
            
            const wrong = this.add.text(sprite.x, sprite.y, '✗', {
                fontSize: '40px',
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
            
            const levelNames = ['', 'Explore', 'Sound Quiz', 'Text Quiz'];
            const message = this.add.text(width / 2, height / 2 - 30, `🎉 ${levelNames[this.level]} Complete!`, {
                fontFamily: 'Arial Black',
                fontSize: '28px',
                color: '#4CAF50'
            }).setOrigin(0.5).setDepth(151);
            
            const nextBtn = this.add.text(width / 2, height / 2 + 30, 'Next Level →', {
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
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 Farm Animal Expert! 🏆', {
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

    restartLevel() {
        this.exploredAnimals = new Set();
        this.scene.restart({ level: this.level });
    }
}
