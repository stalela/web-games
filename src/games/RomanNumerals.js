import { LalelaGame } from '../utils/LalelaGame.js';

export class RomanNumerals extends LalelaGame {
    constructor() {
        super();
        this.arabic = 0;
        this.roman = "";
        this.mode = "arabic_to_roman"; // or roman_to_arabic
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xF5F5DC)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Roman Numerals", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.arabic = Phaser.Math.Between(1, 20);
        this.roman = this.toRoman(this.arabic);
        this.mode = Math.random() > 0.5 ? "arabic_to_roman" : "roman_to_arabic";

        if (this.questionText) this.questionText.destroy();
        
        let question = "";
        if (this.mode === "arabic_to_roman") {
            question = `Convert ${this.arabic} to Roman`;
        } else {
            question = `Convert ${this.roman} to Arabic`;
        }

        this.questionText = this.add.text(this.cameras.main.centerX, 200, question, {
            fontSize: '48px',
            color: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.createOptions();
    }

    toRoman(num) {
        const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
        let roman = '';
        for (let i in lookup ) {
            while ( num >= lookup[i] ) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    }

    createOptions() {
        if (this.optionsContainer) this.optionsContainer.destroy();
        this.optionsContainer = this.add.container(this.cameras.main.centerX, 400);

        // Generate 3 wrong answers
        let options = [];
        if (this.mode === "arabic_to_roman") {
            options.push(this.roman);
            while (options.length < 4) {
                let wrong = this.toRoman(Phaser.Math.Between(1, 20));
                if (!options.includes(wrong)) options.push(wrong);
            }
        } else {
            options.push(this.arabic.toString());
            while (options.length < 4) {
                let wrong = Phaser.Math.Between(1, 20).toString();
                if (!options.includes(wrong)) options.push(wrong);
            }
        }

        // Shuffle
        options.sort(() => Math.random() - 0.5);

        options.forEach((opt, index) => {
            let btn = this.add.container((index - 1.5) * 150, 0);
            let bg = this.add.rectangle(0, 0, 120, 80, 0x8d6e63).setInteractive();
            let text = this.add.text(0, 0, opt, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
            
            btn.add([bg, text]);
            
            bg.on('pointerdown', () => this.checkAnswer(opt));
            this.optionsContainer.add(btn);
        });
    }

    checkAnswer(answer) {
        let correct = false;
        if (this.mode === "arabic_to_roman") {
            correct = answer === this.roman;
        } else {
            correct = answer === this.arabic.toString();
        }

        if (correct) {
            this.audioManager.play('success');
            this.time.delayedCall(1000, () => this.startLevel());
        } else {
            this.audioManager.play('error');
        }
    }
}
