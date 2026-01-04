import { LalelaGame } from '../utils/LalelaGame.js';

export class Reversecount extends LalelaGame {
    constructor() {
        super();
        this.targetNumber = 0;
        this.currentCount = 0;
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x80DEEA)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Count the Intervals", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.targetNumber = Phaser.Math.Between(1, 10);
        this.currentCount = 0;

        // Draw Ice Spots
        if (this.spotsContainer) this.spotsContainer.destroy();
        this.spotsContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);

        const startX = -((this.targetNumber * 60) / 2);
        
        // Tux
        this.add.circle(startX - 60, 0, 30, 0x000000).addToContainer(this.spotsContainer);
        
        // Fish
        this.add.circle(startX + this.targetNumber * 60 + 60, 0, 20, 0xffa500).addToContainer(this.spotsContainer);

        // Ice blocks
        for (let i = 0; i < this.targetNumber; i++) {
            this.add.rectangle(startX + i * 60 + 30, 0, 50, 50, 0xffffff).addToContainer(this.spotsContainer);
        }

        // Domino Input
        this.createDomino();
    }

    createDomino() {
        if (this.domino) this.domino.destroy();
        
        this.domino = this.add.container(this.cameras.main.centerX, this.cameras.main.height - 150);
        
        let bg = this.add.rectangle(0, 0, 100, 150, 0xffffff).setStrokeStyle(4, 0x000000).setInteractive();
        this.dominoText = this.add.text(0, 0, "0", { fontSize: '64px', color: '#000' }).setOrigin(0.5);
        
        this.domino.add([bg, this.dominoText]);

        bg.on('pointerdown', () => {
            this.currentCount++;
            if (this.currentCount > 10) this.currentCount = 0;
            this.dominoText.setText(this.currentCount.toString());
        });

        // OK Button
        let okBtn = this.add.rectangle(this.cameras.main.centerX + 150, this.cameras.main.height - 150, 80, 50, 0x4CAF50).setInteractive();
        let okText = this.add.text(this.cameras.main.centerX + 150, this.cameras.main.height - 150, "OK", { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
        
        okBtn.on('pointerdown', () => this.checkAnswer());
    }

    checkAnswer() {
        if (this.currentCount === this.targetNumber) {
            this.audioManager.play('success');
            this.time.delayedCall(1000, () => this.startLevel());
        } else {
            this.audioManager.play('error');
        }
    }
}
