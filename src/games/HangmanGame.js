import { LalelaGame } from '../utils/LalelaGame.js';

export class HangmanGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'HangmanGame',
            title: 'Hangman',
            description: 'Guess the hidden word letter by letter.',
            category: 'reading'
        });
    }

    setupGameLogic() {
        this.words = [
            'APPLE', 'BANANA', 'CHERRY', 'ORANGE', 'GRAPE',
            'LEMON', 'MANGO', 'PEACH', 'PEAR', 'PLUM',
            'CARROT', 'POTATO', 'TOMATO', 'ONION', 'CORN',
            'HOUSE', 'SCHOOL', 'GARDEN', 'PARK', 'BEACH',
            'HAPPY', 'SMILE', 'LAUGH', 'PLAY', 'JUMP'
        ];
        
        this.currentWord = '';
        this.guessedLetters = new Set();
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        
        this.startNewRound();
    }
    
    startNewRound() {
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.guessedLetters.clear();
        this.wrongGuesses = 0;
        
        this.drawUI();
    }
    
    drawUI() {
        // Clear previous
        if (this.uiContainer) this.uiContainer.destroy();
        this.uiContainer = this.add.container(0, 0);
        
        // Draw Hangman (simplified)
        const g = this.add.graphics();
        g.lineStyle(4, 0xFFFFFF);
        
        // Gallows
        g.moveTo(100, 500); g.lineTo(300, 500); // Base
        g.moveTo(200, 500); g.lineTo(200, 100); // Pole
        g.moveTo(200, 100); g.lineTo(400, 100); // Top
        g.moveTo(400, 100); g.lineTo(400, 150); // Rope
        g.strokePath();
        this.uiContainer.add(g);
        
        this.hangmanGraphics = this.add.graphics();
        this.uiContainer.add(this.hangmanGraphics);
        this.updateHangman();
        
        // Draw Word
        this.wordText = this.add.text(400, 300, this.getDisplayWord(), {
            fontSize: '48px',
            fontFamily: 'Fredoka One',
            color: '#FFFFFF',
            letterSpacing: 10
        }).setOrigin(0.5);
        this.uiContainer.add(this.wordText);
        
        // Draw Keyboard
        this.createKeyboard();
    }
    
    createKeyboard() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const startX = 100;
        const startY = 400;
        const gap = 50;
        const cols = 10;
        
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            const x = startX + col * gap;
            const y = startY + row * gap;
            
            const btn = this.add.container(x, y);
            
            const bg = this.add.rectangle(0, 0, 40, 40, 0x3498db);
            const txt = this.add.text(0, 0, letter, { fontSize: '24px', color: '#FFF' }).setOrigin(0.5);
            
            bg.setInteractive();
            bg.on('pointerdown', () => this.guessLetter(letter, bg, txt));
            
            btn.add([bg, txt]);
            this.uiContainer.add(btn);
        }
    }
    
    guessLetter(letter, bg, txt) {
        if (this.guessedLetters.has(letter)) return;
        
        this.guessedLetters.add(letter);
        bg.disableInteractive();
        
        if (this.currentWord.includes(letter)) {
            bg.setFillStyle(0x2ecc71); // Green
            this.wordText.setText(this.getDisplayWord());
            
            if (!this.getDisplayWord().includes('_')) {
                this.time.delayedCall(1000, () => this.completeLevel());
            }
        } else {
            bg.setFillStyle(0xe74c3c); // Red
            this.wrongGuesses++;
            this.updateHangman();
            
            if (this.wrongGuesses >= this.maxWrongGuesses) {
                // Show word and restart
                this.wordText.setText(this.currentWord);
                this.wordText.setColor('#e74c3c');
                this.time.delayedCall(2000, () => this.startNewRound());
            }
        }
    }
    
    getDisplayWord() {
        return this.currentWord.split('').map(l => this.guessedLetters.has(l) ? l : '_').join('');
    }
    
    updateHangman() {
        const g = this.hangmanGraphics;
        g.clear();
        g.lineStyle(4, 0xFFFFFF);
        
        if (this.wrongGuesses > 0) g.strokeCircle(400, 180, 30); // Head
        if (this.wrongGuesses > 1) { g.moveTo(400, 210); g.lineTo(400, 350); } // Body
        if (this.wrongGuesses > 2) { g.moveTo(400, 240); g.lineTo(350, 300); } // Left Arm
        if (this.wrongGuesses > 3) { g.moveTo(400, 240); g.lineTo(450, 300); } // Right Arm
        if (this.wrongGuesses > 4) { g.moveTo(400, 350); g.lineTo(350, 450); } // Left Leg
        if (this.wrongGuesses > 5) { g.moveTo(400, 350); g.lineTo(450, 450); } // Right Leg
        
        g.strokePath();
    }
}
