import { LalelaGame } from '../utils/LalelaGame.js';

export class SolarSystemGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'SolarSystemGame',
            title: 'Solar System',
            description: 'Learn about the planets in our solar system.',
            category: 'discovery'
        });
    }

    preload() {
        super.preload();
        this.load.svg('solar-bg', 'assets/solar_system/background.svg');
        this.load.image('solar-sun', 'assets/solar_system/sun.webp');
        this.load.image('solar-mercury', 'assets/solar_system/mercury.webp');
        this.load.image('solar-venus', 'assets/solar_system/venus.webp');
        this.load.image('solar-earth', 'assets/solar_system/earth.webp');
        this.load.image('solar-mars', 'assets/solar_system/mars.webp');
        this.load.image('solar-jupiter', 'assets/solar_system/jupiter.webp');
        this.load.image('solar-saturn', 'assets/solar_system/saturn.webp');
        this.load.image('solar-uranus', 'assets/solar_system/uranus.webp');
        this.load.image('solar-neptune', 'assets/solar_system/neptune.webp');
        
        // Load navigation icons
        this.load.svg('home', 'assets/game-icons/bar_home.svg');
        this.load.svg('help', 'assets/game-icons/bar_help.svg');
        this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
        this.load.svg('config', 'assets/game-icons/bar_config.svg');
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Rotating starry background (like GCompris)
        const bgSize = Math.max(width, height) * 2.5;
        this.starsBg = this.add.image(width / 2, height / 2, 'solar-bg');
        this.starsBg.setDisplaySize(bgSize, bgSize);
        this.starsBg.setDepth(-2);
        
        // Slow rotation animation
        this.tweens.add({
            targets: this.starsBg,
            angle: 360,
            duration: 108000,
            repeat: -1,
            ease: 'Linear'
        });
    }

    createUI() {
        super.createUI();
        this.createNavigationDock();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const barY = height - 60;
        const buttonSize = 60;
        const spacing = 80;

        // GCompris uses circular buttons
        const controls = [
            { icon: 'config', action: 'config', color: 0x8B6914 },
            { icon: 'help', action: 'help', color: 0x00B378 },
            { icon: 'home', action: 'home', color: 0x4FC3F7 },
            { icon: 'reload', action: 'reload', color: 0x9C6ADE }
        ];

        let startX = 50;
        controls.forEach((control, index) => {
            const x = startX + index * spacing;
            this.createNavButton(x, barY, buttonSize, control);
        });
    }

    createNavButton(x, y, buttonSize, control) {
        // Circular button
        const button = this.add.graphics();
        button.fillStyle(control.color);
        button.fillCircle(x, y, buttonSize / 2);
        button.lineStyle(3, 0xFFFFFF, 0.8);
        button.strokeCircle(x, y, buttonSize / 2);
        button.setInteractive(
            new Phaser.Geom.Circle(x, y, buttonSize / 2),
            Phaser.Geom.Circle.Contains
        );
        button.setDepth(100);

        const icon = this.add.sprite(x, y, control.icon);
        icon.setScale((buttonSize * 0.55) / Math.max(icon.width, icon.height));
        icon.setTint(0xFFFFFF);
        icon.setDepth(101);

        button.on('pointerdown', () => {
            icon.y += 2;
            this.handleNavAction(control.action);
            this.time.delayedCall(100, () => { icon.y -= 2; });
        });
        
        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(control.color);
            button.fillCircle(x, y, buttonSize / 2 + 3);
            button.lineStyle(3, 0xFFFFFF, 1);
            button.strokeCircle(x, y, buttonSize / 2 + 3);
        });
        
        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(control.color);
            button.fillCircle(x, y, buttonSize / 2);
            button.lineStyle(3, 0xFFFFFF, 0.8);
            button.strokeCircle(x, y, buttonSize / 2);
        });
    }

    handleNavAction(action) {
        switch (action) {
            case 'home':
                this.scene.start('GameMenu');
                break;
            case 'help':
                this.showHelpModal();
                break;
            case 'reload':
                this.resetQuiz();
                break;
            case 'config':
                this.showConfigModal();
                break;
        }
    }

    showHelpModal() {
        if (this.helpModal) return;

        const { width, height } = this.scale;
        this.helpModal = this.add.container(width / 2, height / 2).setDepth(200);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setInteractive();

        const panel = this.add.rectangle(0, 0, 550, 400, 0x1a1a2e, 1);
        panel.setStrokeStyle(3, 0x4FC3F7);

        const title = this.add.text(0, -165, 'Solar System Quiz', {
            fontSize: '32px', color: '#4FC3F7', fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(0, 20,
            'Click on the Sun or any planet to answer\n' +
            'questions about them!\n\n' +
            'Each question has 4 options.\n' +
            'The closeness meter shows how close\n' +
            'your answer is to being correct.\n\n' +
            'Try to reach 100% on all questions!',
            { fontSize: '20px', color: '#FFFFFF', align: 'center', lineSpacing: 8 }
        ).setOrigin(0.5);

        const closeBtn = this.add.text(0, 170, 'Got it!', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#00B378', padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.helpModal.destroy();
            this.helpModal = null;
        });

        this.helpModal.add([overlay, panel, title, instructions, closeBtn]);
    }

    showConfigModal() {
        if (this.configModal) return;

        const { width, height } = this.scale;
        this.configModal = this.add.container(width / 2, height / 2).setDepth(200);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setInteractive();

        const panel = this.add.rectangle(0, 0, 400, 250, 0x1a1a2e, 1);
        panel.setStrokeStyle(3, 0x8B6914);

        const title = this.add.text(0, -90, 'Game Mode', {
            fontSize: '28px', color: '#8B6914', fontStyle: 'bold'
        }).setOrigin(0.5);

        const learningBtn = this.add.text(0, -20, 'Learning Mode', {
            fontSize: '22px', color: '#ffffff', 
            backgroundColor: this.gameMode === 'learning' ? '#00B378' : '#555555',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const assessmentBtn = this.add.text(0, 40, 'Assessment Mode', {
            fontSize: '22px', color: '#ffffff',
            backgroundColor: this.gameMode === 'assessment' ? '#00B378' : '#555555',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        learningBtn.on('pointerdown', () => {
            this.gameMode = 'learning';
            this.configModal.destroy();
            this.configModal = null;
        });

        assessmentBtn.on('pointerdown', () => {
            this.gameMode = 'assessment';
            this.configModal.destroy();
            this.configModal = null;
        });

        const closeBtn = this.add.text(0, 100, 'Close', {
            fontSize: '20px', color: '#ffffff', backgroundColor: '#666666', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.configModal.destroy();
            this.configModal = null;
        });

        this.configModal.add([overlay, panel, title, learningBtn, assessmentBtn, closeBtn]);
    }

    setupGameLogic() {
        const { width, height } = this.scale;
        
        this.gameMode = 'learning';
        this.currentQuestionIndex = 0;
        this.score = 0;
        
        // Planet data matching GCompris
        this.planetsData = [
            { id: 'sun', name: 'Sun', size: 1.3, questions: this.getSunQuestions() },
            { id: 'mercury', name: 'Mercury', size: 0.12, questions: this.getMercuryQuestions() },
            { id: 'venus', name: 'Venus', size: 0.22, questions: this.getVenusQuestions() },
            { id: 'earth', name: 'Earth', size: 0.30, questions: this.getEarthQuestions() },
            { id: 'mars', name: 'Mars', size: 0.15, questions: this.getMarsQuestions() },
            { id: 'jupiter', name: 'Jupiter', size: 1.0, questions: this.getJupiterQuestions() },
            { id: 'saturn', name: 'Saturn', size: 1.2, questions: this.getSaturnQuestions() },
            { id: 'uranus', name: 'Uranus', size: 0.5, questions: this.getUranusQuestions() },
            { id: 'neptune', name: 'Neptune', size: 0.4, questions: this.getNeptuneQuestions() }
        ];
        
        this.planetSprites = [];
        this.createPlanets();
    }

    createPlanets() {
        const { width, height } = this.scale;
        const centerY = height * 0.45;
        const baseSize = Math.min(width, height) * 0.09;
        
        const totalWidth = width * 0.92;
        const startX = width * 0.04;
        const spacing = totalWidth / this.planetsData.length;
        
        this.planetsData.forEach((planet, i) => {
            const x = startX + i * spacing + spacing / 2;
            const displaySize = baseSize * planet.size;
            
            // Planet sprite
            const sprite = this.add.image(x, centerY, `solar-${planet.id}`);
            sprite.setDisplaySize(displaySize, displaySize);
            sprite.setInteractive({ useHandCursor: true });
            sprite.setDepth(10);
            sprite.planetData = planet;
            sprite.questionIndex = 0;
            
            this.planetSprites.push(sprite);
            
            // Label ABOVE the planet (like GCompris)
            const labelY = centerY - (displaySize / 2) - 25;
            const label = this.add.text(x, labelY, planet.name, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(11);
            
            // Click handler
            sprite.on('pointerdown', () => {
                this.playSound('click');
                this.showQuiz(planet, sprite);
                
                // Scale animation
                this.tweens.add({
                    targets: sprite,
                    scaleX: sprite.scaleX * 1.15,
                    scaleY: sprite.scaleY * 1.15,
                    duration: 150,
                    yoyo: true
                });
            });
            
            // Hover effects
            sprite.on('pointerover', () => {
                sprite.setTint(0xddddff);
                label.setColor('#4FC3F7');
            });
            
            sprite.on('pointerout', () => {
                sprite.clearTint();
                label.setColor('#FFFFFF');
            });
        });
    }

    playSound(key) {
        if (this.audioManager) {
            this.audioManager.playSound(key);
        } else {
            try { this.sound.play(key); } catch (e) {}
        }
    }

    showQuiz(planet, sprite) {
        if (this.quizModal) {
            this.quizModal.destroy();
        }
        
        const { width, height } = this.scale;
        const questions = planet.questions;
        
        if (!questions || questions.length === 0) return;
        
        const questionIndex = sprite.questionIndex % questions.length;
        const question = questions[questionIndex];
        const totalQuestions = questions.length;
        
        this.quizModal = this.add.container(0, 0).setDepth(150);
        
        // Semi-transparent overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        overlay.setInteractive();
        this.quizModal.add(overlay);
        
        // Question box at top center (like GCompris)
        const questionBoxWidth = Math.min(700, width * 0.65);
        const questionBox = this.add.rectangle(width / 2, 55, questionBoxWidth, 60, 0x4a4a4a, 0.95);
        questionBox.setStrokeStyle(3, 0x666666);
        this.quizModal.add(questionBox);
        
        const questionText = this.add.text(width / 2, 55, question.question, {
            fontSize: '22px', color: '#FFFFFF', fontStyle: 'bold', align: 'center',
            wordWrap: { width: questionBoxWidth - 40 }
        }).setOrigin(0.5);
        this.quizModal.add(questionText);
        
        // Question counter top right (like "1/6")
        const counterBox = this.add.rectangle(width - 60, 55, 70, 50, 0x4a4a4a, 0.95);
        counterBox.setStrokeStyle(2, 0x666666);
        this.quizModal.add(counterBox);
        
        const counterText = this.add.text(width - 60, 55, `${questionIndex + 1}/${totalQuestions}`, {
            fontSize: '24px', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.quizModal.add(counterText);
        
        // Large planet image on LEFT side
        const planetSize = Math.min(height * 0.55, width * 0.35);
        const planetX = width * 0.25;
        const planetY = height * 0.45;
        
        const planetImg = this.add.image(planetX, planetY, `solar-${planet.id}`);
        planetImg.setDisplaySize(planetSize, planetSize);
        this.quizModal.add(planetImg);
        
        // Answer options on RIGHT side (gray rectangular buttons)
        const optionsX = width * 0.72;
        const optionsStartY = 140;
        const optionHeight = 65;
        const optionWidth = Math.min(450, width * 0.42);
        const optionSpacing = 15;
        
        question.options.forEach((option, i) => {
            const optY = optionsStartY + i * (optionHeight + optionSpacing);
            
            // Gray button with dark border (like GCompris)
            const optBtn = this.add.rectangle(optionsX, optY, optionWidth, optionHeight, 0xc0c0c0, 1);
            optBtn.setStrokeStyle(3, 0x404040);
            optBtn.setInteractive({ useHandCursor: true });
            
            const optText = this.add.text(optionsX, optY, option, {
                fontSize: '22px', color: '#333333', fontStyle: 'bold'
            }).setOrigin(0.5);
            
            this.quizModal.add([optBtn, optText]);
            
            optBtn.on('pointerover', () => {
                optBtn.setFillStyle(0xd8d8d8);
                optBtn.setStrokeStyle(3, 0x606060);
            });
            
            optBtn.on('pointerout', () => {
                optBtn.setFillStyle(0xc0c0c0);
                optBtn.setStrokeStyle(3, 0x404040);
            });
            
            optBtn.on('pointerdown', () => {
                this.checkAnswer(question, i, optBtn, optText, sprite, planet);
            });
        });
        
        // Accuracy box at bottom right (like GCompris)
        const accuracyBoxWidth = 180;
        const accuracyBoxX = width - 120;
        const accuracyBoxY = height - 130;
        
        const accuracyBox = this.add.rectangle(accuracyBoxX, accuracyBoxY, accuracyBoxWidth, 45, 0xc0c0c0, 1);
        accuracyBox.setStrokeStyle(2, 0x404040);
        this.quizModal.add(accuracyBox);
        
        this.accuracyLabel = this.add.text(accuracyBoxX, accuracyBoxY, 'Accuracy: 0%', {
            fontSize: '20px', color: '#333333', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.quizModal.add(this.accuracyLabel);
        
        // Store current accuracy for animation
        this.currentAccuracy = 0;
    }

    checkAnswer(question, answerIndex, btn, text, sprite, planet) {
        const closeness = question.closeness[answerIndex];
        const isCorrect = closeness === 100;
        
        // Update accuracy label
        this.accuracyLabel.setText(`Accuracy: ${Math.round(closeness)}%`);
        
        // Color feedback
        if (isCorrect) {
            btn.setFillStyle(0x66CC66);
            btn.setStrokeStyle(3, 0x00AA00);
            text.setColor('#006600');
            this.playSound('success');
            
            // Move to next question after delay
            this.time.delayedCall(1500, () => {
                sprite.questionIndex++;
                if (sprite.questionIndex < planet.questions.length) {
                    this.showQuiz(planet, sprite);
                } else {
                    // All questions done for this planet
                    this.quizModal.destroy();
                    this.quizModal = null;
                    sprite.setTint(0x00FF00); // Mark as completed
                }
            });
        } else {
            btn.setFillStyle(0xFFAAAA);
            btn.setStrokeStyle(3, 0xCC4444);
            text.setColor('#660000');
            this.playSound('wrong');
        }
    }

    resetQuiz() {
        this.planetSprites.forEach(sprite => {
            sprite.questionIndex = 0;
            sprite.clearTint();
        });
        
        if (this.quizModal) {
            this.quizModal.destroy();
            this.quizModal = null;
        }
    }

    // Question data for each planet
    getSunQuestions() {
        return [
            {
                question: 'How large is the Sun compared to the planets in our Solar System?',
                options: ['Sixth largest', 'Third largest', 'Largest', 'Seventh largest'],
                closeness: [17.5, 67, 100, 1]
            },
            {
                question: 'The temperature of the Sun is around:',
                options: ['1000 °C', '4500 °C', '5505 °C', '3638 °C'],
                closeness: [1, 78, 100, 60]
            },
            {
                question: 'How old is the Sun?',
                options: ['1.2 billion years', '3 billion years', '7 billion years', '4.5 billion years'],
                closeness: [1, 55, 25, 100]
            }
        ];
    }

    getMercuryQuestions() {
        return [
            {
                question: 'At which position is Mercury in the Solar System?',
                options: ['Seventh', 'Sixth', 'First', 'Fourth'],
                closeness: [1, 17.5, 100, 50.5]
            },
            {
                question: 'How small is Mercury compared to other planets?',
                options: ['Smallest', 'Second smallest', 'Third smallest', 'Fifth smallest'],
                closeness: [100, 75.3, 50.5, 1]
            },
            {
                question: 'How many moons has Mercury?',
                options: ['5', '200', '0', '10'],
                closeness: [97.5, 1, 100, 95]
            }
        ];
    }

    getVenusQuestions() {
        return [
            {
                question: 'At which position is Venus in the Solar System?',
                options: ['Seventh', 'Sixth', 'Second', 'Fourth'],
                closeness: [1, 20.8, 100, 60.4]
            },
            {
                question: 'Venus is as heavy as:',
                options: ['0.7 Earths', '0.8 Earths', '1.3 Earths', '2.5 Earths'],
                closeness: [94, 100, 71, 1]
            },
            {
                question: 'How many moons has Venus?',
                options: ['5', '10', '2', '0'],
                closeness: [50, 1, 80, 100]
            }
        ];
    }

    getEarthQuestions() {
        return [
            {
                question: 'At which position is Earth in the Solar System?',
                options: ['Sixth', 'Third', 'First', 'Fifth'],
                closeness: [1, 100, 35, 35]
            },
            {
                question: 'How long does it take for Earth to orbit the Sun?',
                options: ['200 days', '30 days', '7 days', '365 days'],
                closeness: [54.3, 7.3, 1, 100]
            },
            {
                question: 'How many moons has Earth?',
                options: ['1', '5', '2', '3'],
                closeness: [100, 15, 75, 50.5]
            }
        ];
    }

    getMarsQuestions() {
        return [
            {
                question: 'At which position is Mars in the Solar System?',
                options: ['Sixth', 'Fourth', 'First', 'Fifth'],
                closeness: [34, 100, 1, 67]
            },
            {
                question: 'The maximum temperature on Mars is:',
                options: ['20 °C', '35 °C', '100 °C', '60 °C'],
                closeness: [100, 81.4, 1, 51.5]
            },
            {
                question: 'How many moons has Mars?',
                options: ['1', '5', '2', '3'],
                closeness: [67, 1, 100, 50.5]
            }
        ];
    }

    getJupiterQuestions() {
        return [
            {
                question: 'At which position is Jupiter in the Solar System?',
                options: ['Sixth', 'Fifth', 'First', 'Fourth'],
                closeness: [75, 100, 1, 75]
            },
            {
                question: 'How large is Jupiter compared to other planets?',
                options: ['Third largest', 'Largest', 'Fifth largest', 'Second largest'],
                closeness: [50.5, 100, 1, 75]
            },
            {
                question: 'How many moons has Jupiter?',
                options: ['1', '79', '25', '53'],
                closeness: [1, 100, 32.1, 67.9]
            }
        ];
    }

    getSaturnQuestions() {
        return [
            {
                question: 'At which position is Saturn in the Solar System?',
                options: ['Sixth', 'Fourth', 'First', 'Fifth'],
                closeness: [100, 60.4, 1, 80]
            },
            {
                question: 'How large is Saturn compared to other planets?',
                options: ['Third largest', 'Largest', 'Fifth largest', 'Second largest'],
                closeness: [67, 67, 1, 100]
            },
            {
                question: 'How many moons has Saturn?',
                options: ['120', '1', '82', '200'],
                closeness: [32.2, 1, 100, 1]
            }
        ];
    }

    getUranusQuestions() {
        return [
            {
                question: 'At which position is Uranus in the Solar System?',
                options: ['Seventh', 'Fourth', 'Eighth', 'Fifth'],
                closeness: [100, 1, 67, 34]
            },
            {
                question: 'How many years does it take for Uranus to orbit the Sun?',
                options: ['1 Earth year', '24 Earth years', '68 Earth years', '84 Earth years'],
                closeness: [1, 28.4, 81, 100]
            },
            {
                question: 'How many moons has Uranus?',
                options: ['120', '87', '27', '50'],
                closeness: [1, 36, 100, 75.5]
            }
        ];
    }

    getNeptuneQuestions() {
        return [
            {
                question: 'At which position is Neptune in the Solar System?',
                options: ['Seventh', 'Fourth', 'Eighth', 'Fifth'],
                closeness: [75, 1, 100, 25.7]
            },
            {
                question: 'How long does it take for Neptune to orbit the Sun?',
                options: ['165 Earth years', '3 Earth years', '100 Earth years', '1 Earth year'],
                closeness: [100, 2, 60.7, 1]
            },
            {
                question: 'How many moons has Neptune?',
                options: ['120', '87', '14', '50'],
                closeness: [1, 31.8, 100, 66.3]
            }
        ];
    }
}
