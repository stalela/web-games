import { LalelaGame } from '../utils/LalelaGame.js';

export class MorseCodeGame extends LalelaGame {
    constructor() {
        super();
        this.morseTable = {
            "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.",
            "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.",
            "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-", "U": "..-",
            "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--..", "1": ".----", "2": "..---",
            "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..",
            "9": "----.", "0": "-----"
        };
        this.currentLevelIndex = 0;
        this.currentSubLevelIndex = 0;
        this.currentQuestion = null;
        this.userAnswer = "";
    }

    preload() {
        super.preload();
        this.load.image('morse_bg', 'assets/morse_code/background.svg');
        this.load.image('ledOff', 'assets/morse_code/ledOff.svg');
        this.load.image('ledOn', 'assets/morse_code/ledOn.svg');
        this.load.image('morseButton', 'assets/morse_code/morseButton.svg');
        this.load.audio('dot', 'assets/morse_code/dot.wav');
        this.load.audio('dash', 'assets/morse_code/dash.wav');
        this.load.audio('silence', 'assets/morse_code/silence.wav');
    }

    create() {
        super.create();
        this.createLevels();
        this.startLevel();
    }

    createBackground() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'morse_bg')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    createLevels() {
        this.levels = [
            // Level 1: Letters
            [
                { values: ["A", "R", "N", "E", "H", "S", "I"], question: "Send the message %1 in Morse code.", toAlpha: false },
                { values: [".-", "-.", ".-.", ".", "..", "...", "...."], question: "Convert the message %1 to letters.", toAlpha: true },
                { values: [".-", "-.", ".-.", ".", "..", "...", "...."], question: "Find the corresponding letter.", audioMode: true, toAlpha: true },
                { values: ["O", "T", "M", "W", "G", "K"], question: "Send the message %1 in Morse code.", toAlpha: false },
                { values: ["-", "--", "---", ".--", "--.", "-.-"], question: "Convert the message %1 to letters.", toAlpha: true },
                { values: ["C", "P", "B", "V", "D", "U"], question: "Send the message %1 in Morse code.", toAlpha: false },
                { values: ["-.-.", ".--.", "-...", "...-", "-..", "..-"], question: "Convert the message %1 to letters.", toAlpha: true },
                { values: ["Q", "Z", "Y", "X", "J", "L", "F"], question: "Send the message %1 in Morse code.", toAlpha: false },
                { values: ["--.-", "--..", "-.--", "-..-", ".---", ".-..", "..-."], question: "Convert the message %1 to letters.", toAlpha: true }
            ],
            // Level 2: Digits
            [
                { values: ["1", "2", "3", "4", "5"], question: "Send the message %1 in Morse code.", toAlpha: false },
                { values: [".----", "..---", "...--", "....-", "....."], question: "Convert the message %1 to digits.", toAlpha: true },
                { values: ["6", "7", "8", "9", "0"], question: "Send the message %1 in Morse code.", toAlpha: false },
                { values: ["-....", "--...", "---..", "----.", "-----"], question: "Convert the message %1 to digits.", toAlpha: true }
            ],
            // Level 3: Words
            [
                { values: ["CAT", "SING", "BEE", "RED", "WHAT"], question: "Send the message %1 in Morse code.", toAlpha: false },
                { values: ["-.-. .- -", "... .. -. --.", "-... . .", ".-. . -..", ".-- .... .- -"], question: "Convert the message %1 to words.", toAlpha: true }
            ]
        ];
    }

    startLevel() {
        if (this.currentLevelIndex >= this.levels.length) {
            this.scene.start('GameMenu');
            return;
        }
        
        this.currentSubLevelData = this.levels[this.currentLevelIndex];
        this.currentSubLevelIndex = 0;
        this.shuffleArray(this.currentSubLevelData); // Shuffle exercises within level? No, exercises are groups.
        // Actually the GCompris data structure is array of exercises.
        // Each exercise has 'values' which is a list of items to test.
        
        this.startExercise();
    }

    startExercise() {
        if (this.currentSubLevelIndex >= this.currentSubLevelData.length) {
            this.currentLevelIndex++;
            this.startLevel();
            return;
        }

        this.currentExercise = this.currentSubLevelData[this.currentSubLevelIndex];
        this.exerciseItems = [...this.currentExercise.values];
        this.shuffleArray(this.exerciseItems);
        this.currentItemIndex = 0;
        
        this.showNextItem();
    }

    showNextItem() {
        if (this.currentItemIndex >= this.exerciseItems.length) {
            this.currentSubLevelIndex++;
            this.startExercise();
            return;
        }

        this.currentItem = this.exerciseItems[this.currentItemIndex];
        this.userAnswer = "";
        
        this.updateUI();
        
        if (this.currentExercise.audioMode) {
            this.playMorse(this.currentItem);
        }
    }

    updateUI() {
        // Clear previous UI elements
        if (this.uiContainer) this.uiContainer.destroy();
        this.uiContainer = this.add.container(0, 0);

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Question Text
        let questionText = this.currentExercise.question.replace('%1', this.currentItem);
        if (this.currentExercise.audioMode) {
            questionText = this.currentExercise.question.replace('%1', "sound");
        }
        
        const textObj = this.add.text(centerX, centerY - 200, questionText, {
            fontFamily: 'Fredoka One',
            fontSize: '32px',
            color: '#000000',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);
        this.uiContainer.add(textObj);

        // Display Item (if not audio mode or if we want to show it anyway)
        if (!this.currentExercise.audioMode) {
            const displayItem = this.add.text(centerX, centerY - 100, this.currentItem, {
                fontFamily: 'Fredoka One',
                fontSize: '64px',
                color: '#0062FF'
            }).setOrigin(0.5);
            this.uiContainer.add(displayItem);
        } else {
             const soundIcon = this.add.image(centerX, centerY - 100, 'morseButton').setScale(0.5).setInteractive();
             soundIcon.on('pointerdown', () => this.playMorse(this.currentItem));
             this.uiContainer.add(soundIcon);
        }

        // User Input Display
        this.inputDisplay = this.add.text(centerX, centerY + 50, "", {
            fontFamily: 'Fredoka One',
            fontSize: '48px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        this.uiContainer.add(this.inputDisplay);

        // Controls
        if (this.currentExercise.toAlpha) {
            // User needs to type letters
            this.add.text(centerX, centerY + 150, "Type the answer", {
                fontFamily: 'Fredoka One',
                fontSize: '24px',
                color: '#555555'
            }).setOrigin(0.5);
        } else {
            // User needs to input morse
            const dotBtn = this.createButton(centerX - 100, centerY + 150, ".", () => this.addInput("."));
            const dashBtn = this.createButton(centerX + 100, centerY + 150, "-", () => this.addInput("-"));
            const spaceBtn = this.createButton(centerX, centerY + 150, "Space", () => this.addInput(" "));
            
            this.uiContainer.add([dotBtn, dashBtn, spaceBtn]);
        }

        // Check Button
        const checkBtn = this.add.text(centerX, centerY + 250, "CHECK", {
            fontFamily: 'Fredoka One',
            fontSize: '32px',
            color: '#FFFFFF',
            backgroundColor: '#00B378',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        checkBtn.on('pointerdown', () => this.checkAnswer());
        this.uiContainer.add(checkBtn);
        
        // Backspace
        const backBtn = this.add.text(centerX + 200, centerY + 50, "⌫", {
             fontSize: '32px', color: '#000000'
        }).setOrigin(0.5).setInteractive();
        backBtn.on('pointerdown', () => {
            this.userAnswer = this.userAnswer.slice(0, -1);
            this.inputDisplay.setText(this.userAnswer);
        });
        this.uiContainer.add(backBtn);

        // Keyboard input
        this.input.keyboard.removeAllListeners('keydown');
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Enter') {
                this.checkAnswer();
            } else if (event.key === 'Backspace') {
                this.userAnswer = this.userAnswer.slice(0, -1);
                this.inputDisplay.setText(this.userAnswer);
            } else if (this.currentExercise.toAlpha) {
                if (event.key.length === 1) {
                    this.userAnswer += event.key.toUpperCase();
                    this.inputDisplay.setText(this.userAnswer);
                }
            } else {
                if (event.key === '.') this.addInput(".");
                if (event.key === '-') this.addInput("-");
                if (event.key === ' ') this.addInput(" ");
            }
        });
    }

    createButton(x, y, text, callback) {
        const btn = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 80, 60, 0x0062FF).setInteractive();
        const txt = this.add.text(0, 0, text, { fontSize: '32px', color: '#FFFFFF' }).setOrigin(0.5);
        bg.on('pointerdown', callback);
        btn.add([bg, txt]);
        return btn;
    }

    addInput(char) {
        this.userAnswer += char;
        this.inputDisplay.setText(this.userAnswer);
        if (char === '.') this.sound.play('dot');
        if (char === '-') this.sound.play('dash');
    }

    playMorse(text) {
        // If text is alpha, convert to morse first
        let morse = text;
        if (!this.currentExercise.toAlpha) {
             // If we are asking to send message in morse, we play the morse of the question?
             // No, usually we play what is shown.
             // If question is "A", we play ".-"
             morse = this.alpha2morse(text);
        } else {
             // If question is ".-", we play ".-"
             // But wait, if toAlpha is true, the question IS morse (e.g. ".-")
             // So we play it directly.
        }

        // Actually, let's look at the data.
        // Level 1: values: ["A", ...], question: "Send ... in Morse", toAlpha: false.
        // We show "A". User inputs ".-".
        // Level 2: values: [".-", ...], question: "Convert ... to letters", toAlpha: true.
        // We show ".-". User inputs "A".
        
        // If audioMode is true:
        // values: [".-", ...], question: "Find letter", audioMode: true, toAlpha: true.
        // We play ".-". User inputs "A".
        
        // So if toAlpha is true, the value IS morse.
        // If toAlpha is false, the value IS alpha.
        
        let sequence = [];
        if (this.currentExercise.toAlpha) {
            // Value is morse, e.g. ".-" or ".- -..."
            sequence = this.parseMorseString(text);
        } else {
            // Value is alpha, e.g. "A"
            let m = this.alpha2morse(text);
            sequence = this.parseMorseString(m);
        }
        
        this.playSequence(sequence);
    }
    
    alpha2morse(str) {
        let code = "";
        for (let i = 0; i < str.length; i++) {
            let char = str[i].toUpperCase();
            if (this.morseTable[char]) {
                code += this.morseTable[char] + " ";
            } else if (char === ' ') {
                code += "  "; // Double space for word separation
            }
        }
        return code.trim();
    }
    
    parseMorseString(morseStr) {
        // Convert ".- -..." to sequence of dots/dashes
        let seq = [];
        for (let i = 0; i < morseStr.length; i++) {
            if (morseStr[i] === '.') seq.push('dot');
            if (morseStr[i] === '-') seq.push('dash');
            if (morseStr[i] === ' ') seq.push('silence');
        }
        return seq;
    }
    
    playSequence(sequence) {
        let delay = 0;
        sequence.forEach(soundKey => {
            this.time.delayedCall(delay, () => {
                this.sound.play(soundKey);
            });
            delay += 300; // 300ms per unit
        });
    }

    checkAnswer() {
        let expected = "";
        if (this.currentExercise.toAlpha) {
            // Question was morse (e.g. ".-"), expected is alpha ("A")
            // But wait, the dataset values for toAlpha=true are morse strings.
            // We need to convert them to alpha to check.
            // Or we can just convert user input (Alpha) to Morse and compare?
            // No, if question is ".-", expected is "A".
            // I need a morse2alpha function or just search the table.
            expected = this.morse2alpha(this.currentItem);
        } else {
            // Question was alpha ("A"), expected is morse (".-")
            expected = this.alpha2morse(this.currentItem);
        }
        
        // Normalize spaces
        let userNorm = this.userAnswer.trim().replace(/\s+/g, ' ');
        let expectedNorm = expected.trim().replace(/\s+/g, ' ');
        
        if (userNorm.toUpperCase() === expectedNorm.toUpperCase()) {
            this.sound.play('success');
            this.time.delayedCall(1000, () => {
                this.currentItemIndex++;
                this.showNextItem();
            });
        } else {
            this.sound.play('fail');
            // Show feedback?
            this.inputDisplay.setColor('#FF0000');
            this.time.delayedCall(500, () => {
                this.inputDisplay.setColor('#000000');
                this.userAnswer = "";
                this.inputDisplay.setText("");
            });
        }
    }
    
    morse2alpha(morse) {
        // Reverse lookup
        // Handle words separated by spaces
        // Morse words are separated by "   " (3 spaces) usually, or just spaces.
        // In my alpha2morse I used " " for letter sep and "  " for word sep.
        
        // Simple reverse lookup for single chars first
        let result = "";
        let tokens = morse.split(' '); // Split by space
        for (let token of tokens) {
            if (token === "") {
                result += " ";
                continue;
            }
            let found = Object.keys(this.morseTable).find(key => this.morseTable[key] === token);
            if (found) result += found;
        }
        return result.replace(/\s+/g, '').trim(); // This is too simple for sentences
        
        // Better:
        // If input is ".- -...", it means "AB".
        // If input is ".-   -...", it means "A B".
        // My dataset has "CAT" -> "-.-. .- -" (letters separated by space)
        // So splitting by space gives letters.
    }
}
