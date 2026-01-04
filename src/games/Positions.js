import { LalelaGame } from '../utils/LalelaGame.js';

export class Positions extends LalelaGame {
    constructor() {
        super();
        this.questions = [
            { text: "Where is the ball?", answer: "ON", type: "on" },
            { text: "Where is the ball?", answer: "UNDER", type: "under" },
            { text: "Where is the ball?", answer: "LEFT", type: "left" },
            { text: "Where is the ball?", answer: "RIGHT", type: "right" }
        ];
        this.currentQuestion = null;
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xB2DFDB)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.questionText = this.add.text(this.cameras.main.centerX, 50, "", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.currentQuestion = Phaser.Math.RND.pick(this.questions);
        this.questionText.setText(this.currentQuestion.text);

        // Draw Scene
        if (this.sceneContainer) this.sceneContainer.destroy();
        this.sceneContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY - 50);

        // Box
        this.add.rectangle(0, 0, 100, 100, 0x795548).addToContainer(this.sceneContainer);

        // Ball Position
        let ballX = 0, ballY = 0;
        if (this.currentQuestion.type === "on") ballY = -70;
        if (this.currentQuestion.type === "under") ballY = 70;
        if (this.currentQuestion.type === "left") ballX = -70;
        if (this.currentQuestion.type === "right") ballX = 70;

        this.add.circle(ballX, ballY, 20, 0xff0000).addToContainer(this.sceneContainer);

        // Options
        this.createOptions();
    }

    createOptions() {
        if (this.optionsContainer) this.optionsContainer.destroy();
        this.optionsContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.height - 150);

        const options = ["ON", "UNDER", "LEFT", "RIGHT"];
        const startX = -((options.length * 150) / 2) + 75;

        options.forEach((opt, index) => {
            let btn = this.add.container(startX + index * 150, 0);
            let bg = this.add.rectangle(0, 0, 120, 60, 0xffffff).setStrokeStyle(2, 0x000000).setInteractive();
            let text = this.add.text(0, 0, opt, { fontSize: '24px', color: '#000' }).setOrigin(0.5);
            
            btn.add([bg, text]);
            
            bg.on('pointerdown', () => this.checkAnswer(opt));
            this.optionsContainer.add(btn);
        });
    }

    checkAnswer(answer) {
        if (answer === this.currentQuestion.answer) {
            this.audioManager.play('success');
            this.time.delayedCall(1000, () => this.startLevel());
        } else {
            this.audioManager.play('error');
        }
    }
}
