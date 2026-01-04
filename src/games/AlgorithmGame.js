import { LalelaGame } from '../utils/LalelaGame.js';

export class AlgorithmGame extends LalelaGame {
    constructor() {
        super({ key: 'AlgorithmGame' });
        this.images = ["apple", "banana", "cherries", "lemon", "orange", "pear", "pineapple", "plum"];
        this.sample = [
            [[0,1,0,1,0,1,0,1],[0,1,1,0,0,1,1,0],[1,1,0,0,0,0,1,1],[1,0,0,1,0,1,1,0]],//level1
            [[0,1,2,0,1,2,0,1],[0,1,2,3,0,1,2,3],[0,1,2,3,3,2,1,0],[0,1,2,1,0,1,2,0]],//2
            [[0,1,2,3,1,0,0,1],[0,1,2,3,0,1,0,1],[0,1,2,3,1,2,1,2],[0,1,2,3,2,3,2,3]],//3
            [[0,1,2,3,0,1,2,0],[0,1,2,3,1,2,3,1],[0,1,2,3,2,1,3,1],[0,1,2,3,3,1,2,1]],//4
            [[0,1,2,3,1,2,3,0],[0,1,2,3,2,3,0,1],[0,1,2,3,3,0,1,2],[0,1,2,3,3,0,1,2]],//5
            [[0,1,2,3,3,1,2,0],[0,1,2,3,0,2,1,3],[0,1,2,3,2,3,1,0],[0,1,2,3,2,1,3,0]],//6
            [[0,1,2,3,3,0,1,1],[0,1,2,3,2,2,3,2],[0,1,2,3,1,1,0,3],[0,1,2,3,1,2,3,2]] //7
        ];
        this.matchesVisible = 4;
        this.max = 8;
    }

    preload() {
        super.preload();
        this.load.svg('bg-algorithm', 'assets/algorithm/desert_scene.svg');
        this.load.svg('question_mark', 'assets/algorithm/question_mark.svg');
        this.images.forEach(img => {
            this.load.svg(img, `assets/algorithm/${img}.svg`);
        });
    }

    createBackground() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bg-algorithm')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, "Complete the pattern", {
            fontFamily: 'Fredoka One',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Containers for rows
        this.questionContainer = this.add.container(this.cameras.main.centerX, 200);
        this.answerContainer = this.add.container(this.cameras.main.centerX, 350);
        this.selectionContainer = this.add.container(this.cameras.main.centerX, 500);
    }

    setupGameLogic() {
        this.currentLevel = 0;
        this.initLevel();
    }

    initLevel() {
        this.choiceCount = this.matchesVisible;
        
        // Select pattern
        const levelSamples = this.sample[this.currentLevel % this.sample.length];
        const patternIndex = Phaser.Math.Between(0, levelSamples.length - 1);
        this.currentPattern = levelSamples[patternIndex];

        // Generate sequences
        this.questionSequence = this.getImages(this.currentPattern);
        this.answerSequence = this.getImages(this.currentPattern);

        this.drawQuestionRow();
        this.drawAnswerRow();
        this.drawSelectionRow();
    }

    getImages(pattern) {
        const shuffledImages = Phaser.Utils.Array.Shuffle([...this.images]);
        return pattern.map(idx => shuffledImages[idx]);
    }

    drawQuestionRow() {
        this.questionContainer.removeAll(true);
        const spacing = 80;
        const startX = -((this.max - 1) * spacing) / 2;

        this.questionSequence.forEach((img, i) => {
            const sprite = this.add.image(startX + i * spacing, 0, img).setScale(0.6);
            this.questionContainer.add(sprite);
        });
    }

    drawAnswerRow() {
        this.answerContainer.removeAll(true);
        const spacing = 80;
        const startX = -((this.max - 1) * spacing) / 2;

        // Draw visible items
        for (let i = 0; i < this.choiceCount; i++) {
            const sprite = this.add.image(startX + i * spacing, 0, this.answerSequence[i]).setScale(0.6);
            this.answerContainer.add(sprite);
        }

        // Draw question mark if not finished
        if (this.choiceCount < this.max) {
            const qMark = this.add.image(startX + this.choiceCount * spacing, 0, 'question_mark').setScale(0.6);
            this.answerContainer.add(qMark);
            
            // Add placeholder slots for remaining
            for (let i = this.choiceCount + 1; i < this.max; i++) {
                const slot = this.add.rectangle(startX + i * spacing, 0, 60, 60, 0x000000, 0.2);
                this.answerContainer.add(slot);
            }
        }
    }

    drawSelectionRow() {
        this.selectionContainer.removeAll(true);
        const spacing = 90;
        const startX = -((this.images.length - 1) * spacing) / 2;

        this.images.forEach((img, i) => {
            const sprite = this.add.image(startX + i * spacing, 0, img).setScale(0.7).setInteractive();
            sprite.on('pointerdown', () => this.handleSelection(img));
            
            // Add hover effect
            sprite.on('pointerover', () => sprite.setScale(0.8));
            sprite.on('pointerout', () => sprite.setScale(0.7));
            
            this.selectionContainer.add(sprite);
        });
    }

    handleSelection(selectedImage) {
        if (this.choiceCount >= this.max) return;

        const correctImage = this.answerSequence[this.choiceCount];

        if (selectedImage === correctImage) {
            this.audioManager.play('click');
            this.choiceCount++;
            this.drawAnswerRow();

            if (this.choiceCount === this.max) {
                this.audioManager.play('success');
                this.time.delayedCall(1000, () => {
                    this.nextLevel();
                });
            }
        } else {
            this.audioManager.play('fail');
            // Shake effect on question mark?
        }
    }

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel >= this.sample.length) {
            this.currentLevel = 0; // Loop
        }
        this.initLevel();
    }
}
