import { LalelaGame } from '../utils/LalelaGame.js';

// Grammar class definitions with colors
const grammarClasses = {
    'dtm': { name: 'Determiner', color: 0x2760B5, abbr: 'DET' },
    'nou': { name: 'Noun', color: 0x8EEB76, abbr: 'N' },
    'vrb': { name: 'Verb', color: 0xE65B48, abbr: 'V' },
    'adj': { name: 'Adjective', color: 0xECA06F, abbr: 'ADJ' },
    'prn': { name: 'Pronoun', color: 0xE31BE3, abbr: 'PRO' },
    'ppt': { name: 'Preposition', color: 0xE8EF48, abbr: 'PREP' },
    'cjt': { name: 'Conjunction', color: 0x42B324, abbr: 'CONJ' },
    'itj': { name: 'Interjection', color: 0x881744, abbr: 'INT' },
    'adv': { name: 'Adverb', color: 0x00B378, abbr: 'ADV' }
};

export class GrammarAnalysisGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'GrammarAnalysisGame',
            title: 'Grammatical Analysis',
            description: 'Identify grammatical classes in the given sentences.',
            category: 'reading'
        });
        
        this.currentLevel = 0;
        this.currentExercise = 0;
        this.data = null;
        this.wordButtons = [];
        this.classButtons = [];
        this.selectedClass = null;
        this.userAnswers = [];
    }

    preload() {
        super.preload();
        this.load.json('grammar_data', 'assets/grammar_analysis/grammar_analysis-en.json');
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        const { width } = this.cameras.main;
        
        this.add.text(width / 2, 30, 'Grammar Analysis', {
            fontFamily: 'Nunito, Arial',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.objectiveText = this.add.text(width / 2, 70, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(width - 100, 30, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.data = this.cache.json.get('grammar_data');
        if (!this.data) {
            console.error('Failed to load grammar data');
            return;
        }
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.currentExercise = 0;
        
        const level = this.data.levels[levelIndex];
        this.objectiveText.setText(level.objective);
        this.levelText.setText(`Level ${levelIndex + 1}/${this.data.levels.length}`);
        
        this.goalClasses = level.goal.split(' ').filter(c => c);
        this.exercises = this.data.dataset[level.exercise];
        
        if (!this.exercises || this.exercises.length === 0) {
            this.nextLevel();
            return;
        }
        
        this.startExercise(0);
    }

    startExercise(exerciseIndex) {
        this.currentExercise = exerciseIndex;
        this.clearExercise();
        
        const exercise = this.exercises[exerciseIndex];
        const words = this.parseWords(exercise.sentence);
        const answers = this.parseAnswers(exercise.answer);
        
        this.correctAnswers = answers;
        this.userAnswers = new Array(words.length).fill(null);
        
        this.createClassPalette();
        this.createWordDisplay(words);
        this.createSubmitButton();
    }

    parseWords(sentence) {
        // Split by spaces but keep track of punctuation
        return sentence.replace(/([.,!?;:])/g, ' $1').split(/\s+/).filter(w => w);
    }

    parseAnswers(answer) {
        // Answer string has class codes aligned with words
        return answer.split(/\s+/).filter(a => a);
    }

    createClassPalette() {
        const { width, height } = this.cameras.main;
        const paletteY = height - 100;
        
        this.classButtons = [];
        const classCount = this.goalClasses.length;
        const buttonWidth = 100;
        const spacing = 20;
        const totalWidth = classCount * buttonWidth + (classCount - 1) * spacing;
        let startX = (width - totalWidth) / 2 + buttonWidth / 2;
        
        this.goalClasses.forEach((classCode, i) => {
            const classInfo = grammarClasses[classCode];
            if (!classInfo) return;
            
            const x = startX + i * (buttonWidth + spacing);
            
            const bg = this.add.rectangle(x, paletteY, buttonWidth, 40, classInfo.color);
            bg.setStrokeStyle(2, 0xffffff);
            bg.setInteractive({ useHandCursor: true });
            bg.classCode = classCode;
            
            const label = this.add.text(x, paletteY, classInfo.abbr, {
                fontFamily: 'Nunito, Arial',
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            bg.on('pointerdown', () => {
                this.selectClass(classCode);
            });
            
            bg.on('pointerover', () => bg.setScale(1.1));
            bg.on('pointerout', () => {
                if (this.selectedClass !== classCode) bg.setScale(1);
            });
            
            this.classButtons.push({ bg, label, classCode });
        });
        
        // Add "clear" button
        const clearX = startX + classCount * (buttonWidth + spacing);
        const clearBg = this.add.rectangle(clearX, paletteY, 60, 40, 0x888888);
        clearBg.setStrokeStyle(2, 0xffffff);
        clearBg.setInteractive({ useHandCursor: true });
        
        this.add.text(clearX, paletteY, '✕', {
            fontFamily: 'Nunito, Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        clearBg.on('pointerdown', () => {
            this.selectedClass = null;
            this.updateClassSelection();
        });
    }

    selectClass(classCode) {
        this.selectedClass = classCode;
        this.updateClassSelection();
        if (this.audioManager) this.audioManager.playSound('click');
    }

    updateClassSelection() {
        this.classButtons.forEach(btn => {
            if (btn.classCode === this.selectedClass) {
                btn.bg.setStrokeStyle(4, 0x000000);
                btn.bg.setScale(1.1);
            } else {
                btn.bg.setStrokeStyle(2, 0xffffff);
                btn.bg.setScale(1);
            }
        });
    }

    createWordDisplay(words) {
        const { width, height } = this.cameras.main;
        const centerY = height / 2 - 50;
        
        this.wordButtons = [];
        
        // Calculate layout
        const wordWidth = 100;
        const spacing = 10;
        const maxPerRow = Math.floor((width - 100) / (wordWidth + spacing));
        const rows = Math.ceil(words.length / maxPerRow);
        
        words.forEach((word, i) => {
            const row = Math.floor(i / maxPerRow);
            const col = i % maxPerRow;
            const wordsInRow = Math.min(maxPerRow, words.length - row * maxPerRow);
            const rowWidth = wordsInRow * wordWidth + (wordsInRow - 1) * spacing;
            const startX = (width - rowWidth) / 2 + wordWidth / 2;
            
            const x = startX + col * (wordWidth + spacing);
            const y = centerY + row * 80;
            
            // Word text
            const wordText = this.add.text(x, y - 15, word, {
                fontFamily: 'Nunito, Arial',
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Answer box
            const box = this.add.rectangle(x, y + 20, wordWidth - 10, 30, 0x444444);
            box.setStrokeStyle(2, 0xffffff);
            box.setInteractive({ useHandCursor: true });
            box.wordIndex = i;
            
            const answerLabel = this.add.text(x, y + 20, '', {
                fontFamily: 'Nunito, Arial',
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            box.on('pointerdown', () => {
                this.assignClass(i, box, answerLabel);
            });
            
            this.wordButtons.push({ wordText, box, answerLabel, word });
        });
    }

    assignClass(wordIndex, box, label) {
        if (this.selectedClass) {
            this.userAnswers[wordIndex] = this.selectedClass;
            const classInfo = grammarClasses[this.selectedClass];
            label.setText(classInfo.abbr);
            box.setFillStyle(classInfo.color);
        } else {
            this.userAnswers[wordIndex] = null;
            label.setText('');
            box.setFillStyle(0x444444);
        }
        if (this.audioManager) this.audioManager.playSound('click');
    }

    createSubmitButton() {
        const { width, height } = this.cameras.main;
        
        this.submitBtn = this.add.text(width / 2, height - 40, 'Check Answer', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0062FF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.submitBtn.on('pointerdown', () => this.checkAnswer());
    }

    checkAnswer() {
        let allCorrect = true;
        
        this.wordButtons.forEach((btn, i) => {
            const correct = this.correctAnswers[i];
            const user = this.userAnswers[i];
            
            if (this.goalClasses.includes(correct)) {
                // This word needs an answer
                if (user === correct) {
                    btn.box.setStrokeStyle(3, 0x00ff00);
                } else {
                    btn.box.setStrokeStyle(3, 0xff0000);
                    allCorrect = false;
                }
            } else {
                // This word should be left blank
                if (user === null) {
                    btn.box.setStrokeStyle(3, 0x00ff00);
                } else {
                    btn.box.setStrokeStyle(3, 0xff0000);
                    allCorrect = false;
                }
            }
        });
        
        if (allCorrect) {
            if (this.audioManager) this.audioManager.playSound('win');
            this.time.delayedCall(1500, () => this.nextExercise());
        } else {
            if (this.audioManager) this.audioManager.playSound('error');
        }
    }

    nextExercise() {
        if (this.currentExercise < this.exercises.length - 1) {
            this.startExercise(this.currentExercise + 1);
        } else {
            this.nextLevel();
        }
    }

    nextLevel() {
        if (this.currentLevel < this.data.levels.length - 1) {
            this.startLevel(this.currentLevel + 1);
        } else {
            this.scene.start('GameMenu');
        }
    }

    clearExercise() {
        this.wordButtons.forEach(btn => {
            btn.wordText.destroy();
            btn.box.destroy();
            btn.answerLabel.destroy();
        });
        this.classButtons.forEach(btn => {
            btn.bg.destroy();
            btn.label.destroy();
        });
        if (this.submitBtn) this.submitBtn.destroy();
        this.wordButtons = [];
        this.classButtons = [];
        this.selectedClass = null;
    }
}
