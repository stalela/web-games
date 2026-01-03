/**
 * ExploreFarmAnimalsGame - Learn about farm animals
 * 
 * Adapted from GCompris explore_farm_animals activity
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
        
        // Farm animal data
        this.animals = [
            {
                id: 'horse',
                name: 'Horse',
                sound: 'neigh',
                description: 'The horse goes \'neigh\'. Horses are adapted to run, allowing them to quickly escape predators.',
                hint: 'This animal has single-toed hooves.',
                color: 0x8B4513,
                x: 0.18,
                y: 0.43
            },
            {
                id: 'chicken',
                name: 'Chicken',
                sound: 'cluck',
                description: 'The chicken goes \'cluck\'. Domestic chickens have wings but are not capable of long-distance flight.',
                hint: 'This animal has a comb on its head.',
                color: 0xFFD700,
                x: 0.70,
                y: 0.75
            },
            {
                id: 'cow',
                name: 'Cow',
                sound: 'moo',
                description: 'The cow goes \'moo\'. Cows have around 20,000 taste buds and can detect odours 8km away.',
                hint: 'This animal has around 20,000 taste buds.',
                color: 0xF5F5DC,
                x: 0.43,
                y: 0.46
            },
            {
                id: 'cat',
                name: 'Cat',
                sound: 'meow',
                description: 'The cat goes \'meow\'. Cats are valued for companionship and their ability to chase mice.',
                hint: 'This animal can purr.',
                color: 0xFFA500,
                x: 0.14,
                y: 0.68
            },
            {
                id: 'pig',
                name: 'Pig',
                sound: 'oink',
                description: 'The pig goes \'oink\'. Pigs wallow in the mud to control their body temperature.',
                hint: 'This animal wallows in the mud.',
                color: 0xFFB6C1,
                x: 0.38,
                y: 0.65
            },
            {
                id: 'duck',
                name: 'Duck',
                sound: 'quack',
                description: 'The duck goes \'quack\'. Ducks have waterproof feathers and webbed feet for swimming.',
                hint: 'This animal has webbed feet.',
                color: 0x228B22,
                x: 0.55,
                y: 0.80
            },
            {
                id: 'owl',
                name: 'Owl',
                sound: 'hoot',
                description: 'The owl goes \'hoot\'. Owls are nocturnal birds with excellent night vision.',
                hint: 'This animal is a nocturnal bird.',
                color: 0x8B4513,
                x: 0.85,
                y: 0.30
            },
            {
                id: 'dog',
                name: 'Dog',
                sound: 'woof',
                description: 'The dog goes \'woof\'. Dogs are probably the oldest domesticated species.',
                hint: 'This animal is a descendant of the wolf.',
                color: 0xD2691E,
                x: 0.82,
                y: 0.62
            },
            {
                id: 'sheep',
                name: 'Sheep',
                sound: 'baa',
                description: 'The sheep goes \'baa\'. Most sheep bear a fleece of wool for textile production.',
                hint: 'This animal produces wool.',
                color: 0xFFFAFA,
                x: 0.64,
                y: 0.55
            }
        ];
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
        
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Farm background - sky
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x90EE90, 0x228B22, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-1);
        
        // Barn
        bg.fillStyle(0x8B0000, 1);
        bg.fillRect(width * 0.02, height * 0.25, width * 0.15, height * 0.35);
        bg.fillStyle(0x654321, 1);
        bg.fillTriangle(
            width * 0.02, height * 0.25,
            width * 0.095, height * 0.12,
            width * 0.17, height * 0.25
        );
        
        // Fence
        bg.fillStyle(0x8B4513, 1);
        for (let i = 0; i < 8; i++) {
            bg.fillRect(width * 0.2 + i * width * 0.1, height * 0.88, width * 0.02, height * 0.1);
        }
        bg.fillRect(width * 0.2, height * 0.90, width * 0.75, height * 0.02);
        bg.fillRect(width * 0.2, height * 0.95, width * 0.75, height * 0.02);
        
        // Sun
        bg.fillStyle(0xFFD700, 1);
        bg.fillCircle(width * 0.9, height * 0.1, 40);
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Title/instruction panel
        this.instructionPanel = this.add.graphics();
        this.instructionPanel.fillStyle(0x3d5a5a, 0.9);
        this.instructionPanel.fillRoundedRect(width / 2 - 250, 10, 500, 45, 10);
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
        const levelNames = ['', 'Explore', 'Sounds', 'Quiz'];
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
        
        // Sound replay button (for level 2)
        if (this.level === 2) {
            this.replayBtn = this.createNavButton(width - 60, y, 0x9C27B0, '🔊', () => {
                this.playCurrentSound();
            });
        }
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
            if (a.label) a.label.destroy();
            if (a.star) a.star.destroy();
            a.destroy();
        });
        this.animalSprites = [];
        
        const animalSize = Math.min(width, height) * 0.12;
        
        this.animals.forEach((animal, index) => {
            const x = width * animal.x;
            const y = height * animal.y;
            
            // Draw simple animal shape
            const graphics = this.add.graphics();
            this.drawAnimal(graphics, 0, 0, animalSize, animal);
            graphics.setPosition(x, y);
            graphics.setDepth(2);
            
            // Hit area
            const hitArea = this.add.circle(x, y, animalSize / 2, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .setDepth(3);
            
            hitArea.setData('animal', animal);
            hitArea.setData('index', index);
            hitArea.graphics = graphics;
            
            // Star indicator (for explore mode)
            const star = this.add.text(x, y - animalSize / 2 - 10, '⭐', {
                fontSize: '20px'
            }).setOrigin(0.5).setDepth(5).setVisible(false);
            hitArea.star = star;
            
            // Hover effect
            hitArea.on('pointerover', () => {
                graphics.setScale(1.15);
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

    drawAnimal(graphics, x, y, size, animal) {
        const color = animal.color;
        
        // Body
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(x, y, size * 0.5, size * 0.35);
        
        // Head
        graphics.fillEllipse(x + size * 0.3, y - size * 0.15, size * 0.25, size * 0.2);
        
        // Eyes
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(x + size * 0.35, y - size * 0.18, size * 0.04);
        
        // Legs
        graphics.fillStyle(color === 0xFFFAFA ? 0x333333 : 0x333333, 1);
        graphics.fillRect(x - size * 0.2, y + size * 0.2, size * 0.08, size * 0.15);
        graphics.fillRect(x + size * 0.1, y + size * 0.2, size * 0.08, size * 0.15);
        
        // Outline
        graphics.lineStyle(2, 0x333333, 1);
        graphics.strokeEllipse(x, y, size * 0.5, size * 0.35);
        
        // Animal-specific features
        if (animal.id === 'chicken') {
            // Comb
            graphics.fillStyle(0xFF0000, 1);
            graphics.fillTriangle(x + size * 0.35, y - size * 0.35, x + size * 0.3, y - size * 0.25, x + size * 0.4, y - size * 0.25);
        } else if (animal.id === 'cow') {
            // Spots
            graphics.fillStyle(0x000000, 1);
            graphics.fillCircle(x - size * 0.1, y, size * 0.08);
            graphics.fillCircle(x + size * 0.1, y + size * 0.05, size * 0.06);
        } else if (animal.id === 'pig') {
            // Snout
            graphics.fillStyle(0xFFB6C1, 1);
            graphics.fillCircle(x + size * 0.4, y - size * 0.12, size * 0.08);
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
        
        // Sound text
        const soundText = `🔊 "${animal.sound.toUpperCase()}"`;
        this.soundLabel = this.add.text(width / 2, height * 0.38, soundText, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#9C27B0'
        }).setOrigin(0.5).setDepth(21);
        
        // Description
        this.descriptionText = this.add.text(width / 2, height * 0.52, animal.description, {
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
            this.soundLabel.destroy();
            this.closeBtn.destroy();
            this.descriptionPanel = null;
        });
    }

    updateInstructions() {
        const instructions = [
            '',
            'Click on each animal to learn about them!',
            'Listen to the sound and find the animal!',
            'Read the hint and find the matching animal!'
        ];
        this.instructionText.setText(instructions[this.level]);
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
        
        if (this.level === 2) {
            // Sound quiz
            this.instructionText.setText(`Find the animal that goes "${animal.sound}"!`);
            this.playCurrentSound();
        } else {
            // Text quiz
            this.instructionText.setText(animal.hint);
        }
    }

    playCurrentSound() {
        // Visual feedback for sound playing
        const { width, height } = this.scale;
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
        const graphics = sprite.graphics;
        
        if (correct) {
            // Green glow and spin
            this.tweens.add({
                targets: graphics,
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
            const originalX = graphics.x;
            this.tweens.add({
                targets: graphics,
                x: originalX + 10,
                duration: 50,
                yoyo: true,
                repeat: 3,
                ease: 'Power2',
                onComplete: () => graphics.setX(originalX)
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
                .setDepth(20);
            
            const levelNames = ['', 'Explore', 'Sound Quiz', 'Text Quiz'];
            const message = this.add.text(width / 2, height / 2 - 30, `🎉 ${levelNames[this.level]} Complete!`, {
                fontFamily: 'Arial Black',
                fontSize: '28px',
                color: '#4CAF50'
            }).setOrigin(0.5).setDepth(21);
            
            const nextBtn = this.add.text(width / 2, height / 2 + 30, 'Next Level →', {
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
        
        const message = this.add.text(width / 2, height / 2 - 30, '🏆 Farm Animal Expert! 🏆', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#FFD700'
        }).setOrigin(0.5).setDepth(21);
        
        const menuBtn = this.add.text(width / 2, height / 2 + 30, 'Back to Menu', {
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
