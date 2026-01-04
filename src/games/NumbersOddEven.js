import { LalelaGame } from '../utils/LalelaGame.js';

export class NumbersOddEven extends LalelaGame {
    constructor() {
        super();
        this.score = 0;
        this.targetType = 'odd'; // 'odd' or 'even'
        this.clouds = [];
        this.spawnTimer = null;
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x87CEEB)
            .setOrigin(0, 0)
            .setDepth(-1);
        
        // Add some static clouds/scenery
        this.add.circle(100, 100, 50, 0xffffff, 0.5);
        this.add.circle(150, 100, 60, 0xffffff, 0.5);
        this.add.circle(this.cameras.main.width - 100, 200, 70, 0xffffff, 0.5);
    }

    createUI() {
        super.createUI();
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, "", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.scoreText = this.add.text(this.cameras.main.width - 20, 20, "Score: 0", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#000000"
        }).setOrigin(1, 0);
    }

    setupGameLogic() {
        this.player = this.add.rectangle(100, this.cameras.main.centerY, 60, 40, 0xff0000);
        this.add.rectangle(100, this.cameras.main.centerY - 20, 80, 5, 0x000000); // Rotor
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setAllowGravity(false);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.setTarget();
        
        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnCloud,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-300);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(300);
        } else {
            this.player.body.setVelocityY(0);
        }

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(300);
        } else {
            this.player.body.setVelocityX(0);
        }

        // Cleanup off-screen clouds
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            if (this.clouds[i].x < -50) {
                this.clouds[i].destroy();
                this.clouds.splice(i, 1);
            }
        }
    }

    setTarget() {
        this.targetType = Math.random() > 0.5 ? 'odd' : 'even';
        this.instructionText.setText(`Catch ${this.targetType.toUpperCase()} numbers!`);
        this.instructionText.setColor(this.targetType === 'odd' ? '#0000AA' : '#AA0000');
    }

    spawnCloud() {
        const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
        const number = Phaser.Math.Between(1, 99);
        
        const container = this.add.container(this.cameras.main.width + 50, y);
        const cloud = this.add.circle(0, 0, 40, 0xffffff);
        const text = this.add.text(0, 0, number.toString(), {
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([cloud, text]);
        container.setSize(80, 80);
        this.physics.add.existing(container);
        container.body.setVelocityX(-150);
        container.body.setAllowGravity(false);

        container.number = number;
        
        this.physics.add.overlap(this.player, container, this.collectCloud, null, this);
        this.clouds.push(container);
    }

    collectCloud(player, cloudContainer) {
        const number = cloudContainer.number;
        const isOdd = number % 2 !== 0;
        const isCorrect = (this.targetType === 'odd' && isOdd) || (this.targetType === 'even' && !isOdd);

        if (isCorrect) {
            this.score += 10;
            this.audioManager.play('success');
            this.scoreText.setText(`Score: ${this.score}`);
            
            // Change target occasionally
            if (this.score % 50 === 0) {
                this.setTarget();
            }
        } else {
            this.score = Math.max(0, this.score - 5);
            this.audioManager.play('error');
            this.scoreText.setText(`Score: ${this.score}`);
            this.cameras.main.shake(200, 0.01);
        }

        cloudContainer.destroy();
    }
}
