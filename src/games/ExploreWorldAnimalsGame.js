/**
 * ExploreWorldAnimalsGame - Learn about wild animals from around the world
 * 
 * Adapted from GCompris explore_world_animals activity
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
        
        // World animals data - grouped by region with map positions
        this.animals = [
            // South America
            {
                id: 'jaguar',
                name: 'Jaguar',
                region: 'South America',
                description: 'The jaguar\'s jaw is well developed. It has the strongest bite of all the felines, able to break even a tortoise shell!',
                hint: 'I have the strongest bite of all big cats.',
                color: 0xFFD700,
                x: 0.32,
                y: 0.65
            },
            {
                id: 'scarlet_macaw',
                name: 'Scarlet Macaw',
                region: 'South America',
                description: 'The scarlet macaw is a big and bright colored parrot, able to learn up to 100 words!',
                hint: 'I am a colorful parrot that can learn many words.',
                color: 0xFF0000,
                x: 0.30,
                y: 0.58
            },
            // North America
            {
                id: 'bison',
                name: 'Bison',
                region: 'North America',
                description: 'Bisons live on the plains of North America and were hunted by Native Americans for food.',
                hint: 'I am a large bovine from the American plains.',
                color: 0x8B4513,
                x: 0.22,
                y: 0.45
            },
            {
                id: 'moose',
                name: 'Moose',
                region: 'North America',
                description: 'Being the largest of all deer, the moose eats as much as 25 kg per day. It can stand on hind legs to reach branches up to 4 meters!',
                hint: 'I am the largest member of the deer family.',
                color: 0x654321,
                x: 0.13,
                y: 0.38
            },
            // Europe
            {
                id: 'hedgehog',
                name: 'Hedgehog',
                region: 'Europe',
                description: 'Hedgehogs eat small animals like frogs and insects. When in danger, they curl up into a ball and stick up their coat of sharp spines.',
                hint: 'I have sharp spines and curl into a ball.',
                color: 0xA0522D,
                x: 0.50,
                y: 0.40
            },
            // Africa
            {
                id: 'giraffe',
                name: 'Giraffe',
                region: 'Africa',
                description: 'The giraffe is the tallest mammal in the world. Their legs, usually 1.8 meters long, are taller than most humans!',
                hint: 'I am the tallest animal in the world.',
                color: 0xDAA520,
                x: 0.53,
                y: 0.55
            },
            {
                id: 'chameleon',
                name: 'Chameleon',
                region: 'Africa',
                description: 'The chameleon is well-known for its ability to change its skin color in a couple of seconds.',
                hint: 'I can change my skin color rapidly.',
                color: 0x32CD32,
                x: 0.60,
                y: 0.62
            },
            {
                id: 'crocodile',
                name: 'Crocodile',
                region: 'Africa',
                description: 'The crocodile is a large amphibious reptile. It lives mostly in large tropical rivers, where it is an ambush predator.',
                hint: 'I am a large reptile with powerful jaws.',
                color: 0x556B2F,
                x: 0.55,
                y: 0.58
            },
            {
                id: 'lemur',
                name: 'Ring-tailed Lemur',
                region: 'Madagascar',
                description: 'The ring-tailed lemur is a primate that lives in Madagascar. Its striped tail makes it easy to recognize.',
                hint: 'I have a distinctive striped tail.',
                color: 0x808080,
                x: 0.60,
                y: 0.65
            },
            // Arctic
            {
                id: 'polar_bear',
                name: 'Polar Bear',
                region: 'Arctic',
                description: 'The polar bear is one of the world\'s largest predatory mammals. It weighs up to a ton and can be as long as 3 meters!',
                hint: 'I am a huge white bear from the Arctic.',
                color: 0xFFFAFA,
                x: 0.37,
                y: 0.25
            },
            {
                id: 'narwhal',
                name: 'Narwhal',
                region: 'Arctic',
                description: 'Narwhals are whales that live in the Arctic Ocean and have long tusks. These tusks remind many people of the mythical unicorn\'s horn.',
                hint: 'I am a whale with a long tusk like a unicorn.',
                color: 0x708090,
                x: 0.47,
                y: 0.26
            },
            // Asia
            {
                id: 'panda',
                name: 'Panda',
                region: 'China',
                description: 'The panda is a bear with black and white fur that lives in mountain ranges in central China. Pandas mostly eat bamboo.',
                hint: 'I am a black and white bear that loves bamboo.',
                color: 0xF5F5F5,
                x: 0.77,
                y: 0.45
            },
            {
                id: 'dragon',
                name: 'Komodo Dragon',
                region: 'Indonesia',
                description: 'The Komodo dragon is the largest living lizard (up to 3 meters). It lives in the Indonesian islands.',
                hint: 'I am the largest living lizard in the world.',
                color: 0x696969,
                x: 0.80,
                y: 0.60
            },
            // Australia
            {
                id: 'kangaroo',
                name: 'Kangaroo',
                region: 'Australia',
                description: 'The kangaroo is well-known for the pouch on its belly used to cradle baby kangaroos.',
                hint: 'I hop and carry my baby in a pouch.',
                color: 0xCD853F,
                x: 0.84,
                y: 0.65
            },
            {
                id: 'koala',
                name: 'Koala',
                region: 'Australia',
                description: 'Koalas are herbivore marsupials that live in the eucalyptus forests of eastern Australia.',
                hint: 'I am a fuzzy marsupial that loves eucalyptus.',
                color: 0xA9A9A9,
                x: 0.89,
                y: 0.68
            }
        ];
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
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // World map background - ocean blue
        const bg = this.add.graphics();
        bg.fillStyle(0x4682B4, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
        
        // Draw simplified continents
        bg.fillStyle(0x228B22, 1);
        
        // North America
        bg.fillRoundedRect(width * 0.08, height * 0.25, width * 0.20, height * 0.30, 20);
        
        // South America
        bg.fillRoundedRect(width * 0.22, height * 0.50, width * 0.14, height * 0.30, 20);
        
        // Europe/Africa
        bg.fillRoundedRect(width * 0.42, height * 0.30, width * 0.10, height * 0.20, 15);
        bg.fillRoundedRect(width * 0.44, height * 0.45, width * 0.15, height * 0.30, 20);
        
        // Asia
        bg.fillRoundedRect(width * 0.52, height * 0.22, width * 0.25, height * 0.35, 25);
        
        // Australia
        bg.fillRoundedRect(width * 0.78, height * 0.55, width * 0.15, height * 0.20, 15);
        
        // Arctic ice
        bg.fillStyle(0xF0F8FF, 1);
        bg.fillRect(0, 0, width, height * 0.15);
        
        // Antarctic ice
        bg.fillStyle(0xF0F8FF, 1);
        bg.fillRect(0, height * 0.88, width, height * 0.12);
        
        // Continent labels
        const labelStyle = { fontFamily: 'Arial', fontSize: '11px', color: '#333333' };
        this.add.text(width * 0.15, height * 0.35, 'North\nAmerica', labelStyle).setOrigin(0.5).setDepth(0);
        this.add.text(width * 0.28, height * 0.62, 'South\nAmerica', labelStyle).setOrigin(0.5).setDepth(0);
        this.add.text(width * 0.47, height * 0.38, 'Europe', labelStyle).setOrigin(0.5).setDepth(0);
        this.add.text(width * 0.50, height * 0.58, 'Africa', labelStyle).setOrigin(0.5).setDepth(0);
        this.add.text(width * 0.68, height * 0.38, 'Asia', labelStyle).setOrigin(0.5).setDepth(0);
        this.add.text(width * 0.85, height * 0.65, 'Australia', labelStyle).setOrigin(0.5).setDepth(0);
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Title/instruction panel
        this.instructionPanel = this.add.graphics();
        this.instructionPanel.fillStyle(0x3d5a5a, 0.9);
        this.instructionPanel.fillRoundedRect(width / 2 - 280, 10, 560, 45, 10);
        this.instructionPanel.setDepth(10);
        
        this.instructionText = this.add.text(width / 2, 32, '', {
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
        
        // Create navigation
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
        const levelNames = ['', 'Explore', 'Quiz'];
        this.levelText = this.add.text(x + 30, y, levelNames[this.level], {
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
            if (a.graphics) a.graphics.destroy();
            if (a.star) a.star.destroy();
            if (a.label) a.label.destroy();
            a.destroy();
        });
        this.animalSprites = [];
        
        const animalSize = Math.min(width, height) * 0.08;
        
        this.animals.forEach((animal, index) => {
            const x = width * animal.x;
            const y = height * animal.y;
            
            // Draw simple animal marker
            const graphics = this.add.graphics();
            
            // Marker circle
            graphics.fillStyle(animal.color, 1);
            graphics.fillCircle(0, 0, animalSize / 2);
            graphics.lineStyle(2, 0x333333, 1);
            graphics.strokeCircle(0, 0, animalSize / 2);
            
            // Draw simplified animal silhouette
            graphics.fillStyle(0x333333, 0.7);
            this.drawAnimalIcon(graphics, 0, 0, animalSize * 0.6, animal.id);
            
            graphics.setPosition(x, y);
            graphics.setDepth(2);
            
            // Hit area
            const hitArea = this.add.circle(x, y, animalSize / 2, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .setDepth(3);
            
            hitArea.setData('animal', animal);
            hitArea.setData('index', index);
            hitArea.graphics = graphics;
            
            // Region label
            const regionLabel = this.add.text(x, y + animalSize / 2 + 10, animal.region, {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: '#ffffff',
                backgroundColor: '#333333aa',
                padding: { x: 3, y: 1 }
            }).setOrigin(0.5).setDepth(4);
            hitArea.label = regionLabel;
            
            // Star indicator (for explore mode)
            const star = this.add.text(x, y - animalSize / 2 - 10, '⭐', {
                fontSize: '16px'
            }).setOrigin(0.5).setDepth(5).setVisible(false);
            hitArea.star = star;
            
            // Hover effect
            hitArea.on('pointerover', () => {
                graphics.setScale(1.2);
            });
            hitArea.on('pointerout', () => {
                graphics.setScale(1);
            });
            
            hitArea.on('pointerdown', () => {
                this.onAnimalClick(animal, hitArea);
            });
            
            this.animalSprites.push(hitArea);
        });
    }

    drawAnimalIcon(graphics, x, y, size, animalId) {
        // Simple shapes to represent different animals
        switch (animalId) {
            case 'giraffe':
                // Tall neck
                graphics.fillRect(x - size * 0.1, y - size * 0.4, size * 0.2, size * 0.6);
                graphics.fillCircle(x, y - size * 0.5, size * 0.15);
                break;
            case 'kangaroo':
                // Body with tail
                graphics.fillEllipse(x, y, size * 0.3, size * 0.4);
                graphics.fillTriangle(x + size * 0.15, y + size * 0.3, x + size * 0.4, y + size * 0.1, x + size * 0.2, y);
                break;
            case 'polar_bear':
            case 'panda':
            case 'koala':
                // Round body
                graphics.fillCircle(x, y, size * 0.3);
                graphics.fillCircle(x, y - size * 0.25, size * 0.2);
                break;
            case 'narwhal':
                // Fish shape with horn
                graphics.fillEllipse(x, y, size * 0.5, size * 0.2);
                graphics.fillTriangle(x - size * 0.35, y, x - size * 0.2, y - size * 0.15, x - size * 0.2, y + size * 0.15);
                break;
            case 'crocodile':
            case 'dragon':
                // Long body
                graphics.fillEllipse(x, y, size * 0.5, size * 0.15);
                graphics.fillTriangle(x + size * 0.3, y, x + size * 0.5, y - size * 0.1, x + size * 0.5, y + size * 0.1);
                break;
            default:
                // Generic 4-legged animal
                graphics.fillEllipse(x, y, size * 0.35, size * 0.25);
                graphics.fillCircle(x + size * 0.25, y - size * 0.1, size * 0.15);
                break;
        }
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
        if (this.descriptionPanel) {
            this.descriptionPanel.destroy();
            this.descriptionTitle?.destroy();
            this.descriptionText?.destroy();
            this.regionLabel?.destroy();
            this.closeBtn?.destroy();
        }
        
        // Create panel
        this.descriptionPanel = this.add.graphics();
        this.descriptionPanel.fillStyle(0xffffff, 0.95);
        this.descriptionPanel.fillRoundedRect(width * 0.15, height * 0.2, width * 0.7, height * 0.5, 15);
        this.descriptionPanel.lineStyle(3, 0x333333, 1);
        this.descriptionPanel.strokeRoundedRect(width * 0.15, height * 0.2, width * 0.7, height * 0.5, 15);
        this.descriptionPanel.setDepth(20);
        
        // Title
        this.descriptionTitle = this.add.text(width / 2, height * 0.28, animal.name, {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(21);
        
        // Region label
        this.regionLabel = this.add.text(width / 2, height * 0.36, `📍 ${animal.region}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#666666'
        }).setOrigin(0.5).setDepth(21);
        
        // Description
        this.descriptionText = this.add.text(width / 2, height * 0.50, animal.description, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#555555',
            wordWrap: { width: width * 0.6 },
            align: 'center'
        }).setOrigin(0.5).setDepth(21);
        
        // Close button
        this.closeBtn = this.add.text(width * 0.82, height * 0.23, '✕', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#666666'
        }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });
        
        this.closeBtn.on('pointerdown', () => {
            this.descriptionPanel.destroy();
            this.descriptionTitle.destroy();
            this.descriptionText.destroy();
            this.regionLabel.destroy();
            this.closeBtn.destroy();
            this.descriptionPanel = null;
        });
    }

    updateInstructions() {
        const instructions = [
            '',
            'Click on each animal to learn about them!',
            'Find the animal: '
        ];
        
        if (this.level === 2 && this.questions[this.currentQuestion]) {
            this.instructionText.setText(instructions[this.level] + this.questions[this.currentQuestion].name);
        } else {
            this.instructionText.setText(instructions[this.level]);
        }
    }

    updateExploreProgress() {
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
        
        this.scoreText.setText(`${this.currentQuestion + 1}/${this.questions.length}`);
        
        const animal = this.questions[this.currentQuestion];
        this.instructionText.setText(`Find the ${animal.name}!`);
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
        const graphics = sprite.graphics;
        
        if (correct) {
            // Green pulse
            this.tweens.add({
                targets: graphics,
                scale: { from: 1, to: 1.5 },
                duration: 300,
                yoyo: true,
                ease: 'Power2'
            });
            
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
            const originalX = graphics.x;
            this.tweens.add({
                targets: graphics,
                x: originalX + 8,
                duration: 50,
                yoyo: true,
                repeat: 3,
                ease: 'Power2',
                onComplete: () => graphics.setX(originalX)
            });
            
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
                .setDepth(20);
            
            const levelNames = ['', 'Exploration', 'Quiz'];
            const message = this.add.text(width / 2, height / 2 - 30, `🌍 ${levelNames[this.level]} Complete! 🌍`, {
                fontFamily: 'Arial Black',
                fontSize: '28px',
                color: '#4CAF50'
            }).setOrigin(0.5).setDepth(21);
            
            const nextBtn = this.add.text(width / 2, height / 2 + 30, 'Start Quiz →', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#0062FF',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
            
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
            .setDepth(20);
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 World Animal Expert! 🏆', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#FFD700'
        }).setOrigin(0.5).setDepth(21);
        
        const subMessage = this.add.text(width / 2, height / 2 + 10, `You learned about all ${this.animals.length} animals!`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(21);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 60, 'Back to Menu', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('GameMenu');
        });
    }

    restartLevel() {
        this.exploredAnimals = new Set();
        this.scene.restart({ level: this.level });
    }
}
