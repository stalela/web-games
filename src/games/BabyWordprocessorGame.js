import { LalelaGame } from '../utils/LalelaGame.js';

export class BabyWordprocessorGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'BabyWordprocessorGame',
            title: 'Baby Wordprocessor',
            description: 'Write your first texts with this simple word processor.',
            category: 'computer'
        });
        
        this.textContent = '';
        this.cursorPosition = 0;
        this.currentStyle = 'paragraph';
        this.textDisplay = null;
        this.cursor = null;
    }

    preload() {
        super.preload();
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        // Paper-like background
        const graphics = this.add.graphics();
        graphics.fillStyle(0xf5f5dc, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        const { width } = this.cameras.main;
        
        // Title bar
        this.add.rectangle(width / 2, 30, width, 60, 0x0062FF);
        this.add.text(width / 2, 30, '📝 My First Word Processor', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Toolbar
        this.createToolbar();
        
        // Text area
        this.createTextArea();
        
        // Virtual keyboard for mobile
        this.createVirtualKeyboard();
        
        // Instructions
        this.add.text(width / 2, this.cameras.main.height - 20, 
            'Type on keyboard or tap virtual keys!', {
            fontFamily: 'Nunito, Arial',
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(0.5);
    }

    createToolbar() {
        const { width } = this.cameras.main;
        const toolbarY = 90;
        
        // Toolbar background
        this.add.rectangle(width / 2, toolbarY, width - 40, 50, 0xe0e0e0);
        
        // Style buttons
        const styles = [
            { name: 'Title', style: 'title', size: '32px' },
            { name: 'Subtitle', style: 'subtitle', size: '24px' },
            { name: 'Paragraph', style: 'paragraph', size: '18px' }
        ];
        
        const startX = 100;
        styles.forEach((s, i) => {
            const btn = this.add.text(startX + i * 120, toolbarY, s.name, {
                fontFamily: 'Nunito, Arial',
                fontSize: '16px',
                color: '#333333',
                backgroundColor: '#ffffff',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                this.setStyle(s.style);
            });
            
            btn.on('pointerover', () => btn.setBackgroundColor('#0062FF').setColor('#ffffff'));
            btn.on('pointerout', () => btn.setBackgroundColor('#ffffff').setColor('#333333'));
        });
        
        // Clear button
        const clearBtn = this.add.text(width - 80, toolbarY, '🗑️ Clear', {
            fontFamily: 'Nunito, Arial',
            fontSize: '16px',
            color: '#E65B48',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        clearBtn.on('pointerdown', () => this.clearText());
    }

    createTextArea() {
        const { width, height } = this.cameras.main;
        const areaX = 40;
        const areaY = 130;
        const areaWidth = width - 80;
        const areaHeight = height - 330;
        
        // Text area background
        this.add.rectangle(width / 2, areaY + areaHeight / 2, areaWidth, areaHeight, 0xffffff)
            .setStrokeStyle(2, 0xcccccc);
        
        // Text display
        this.textDisplay = this.add.text(areaX + 15, areaY + 15, '', {
            fontFamily: 'Georgia, Times, serif',
            fontSize: '18px',
            color: '#333333',
            wordWrap: { width: areaWidth - 30 },
            lineSpacing: 8
        });
        
        // Blinking cursor
        this.cursor = this.add.text(areaX + 15, areaY + 15, '|', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#0062FF'
        });
        
        this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Setup keyboard input
        this.setupKeyboardInput();
    }

    createVirtualKeyboard() {
        const { width, height } = this.cameras.main;
        const keyboardY = height - 130;
        
        // Keyboard background
        this.add.rectangle(width / 2, keyboardY + 40, width, 120, 0x333333);
        
        const rows = [
            'QWERTYUIOP',
            'ASDFGHJKL',
            'ZXCVBNM'
        ];
        
        const keySize = 35;
        const spacing = 5;
        
        rows.forEach((row, rowIndex) => {
            const rowWidth = row.length * (keySize + spacing);
            const startX = (width - rowWidth) / 2 + keySize / 2;
            
            row.split('').forEach((char, i) => {
                const x = startX + i * (keySize + spacing);
                const y = keyboardY + rowIndex * (keySize + spacing);
                
                const key = this.add.rectangle(x, y, keySize, keySize, 0x555555);
                key.setStrokeStyle(1, 0x777777);
                key.setInteractive({ useHandCursor: true });
                
                const label = this.add.text(x, y, char.toLowerCase(), {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#ffffff'
                }).setOrigin(0.5);
                
                key.on('pointerdown', () => {
                    key.setFillStyle(0x0062FF);
                    this.addCharacter(char.toLowerCase());
                });
                
                key.on('pointerup', () => {
                    key.setFillStyle(0x555555);
                });
            });
        });
        
        // Space bar
        const spaceBar = this.add.rectangle(width / 2, keyboardY + 3 * (keySize + spacing), 200, keySize, 0x555555);
        spaceBar.setStrokeStyle(1, 0x777777);
        spaceBar.setInteractive({ useHandCursor: true });
        this.add.text(width / 2, keyboardY + 3 * (keySize + spacing), 'SPACE', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        spaceBar.on('pointerdown', () => {
            spaceBar.setFillStyle(0x0062FF);
            this.addCharacter(' ');
        });
        spaceBar.on('pointerup', () => spaceBar.setFillStyle(0x555555));
        
        // Backspace
        const backspace = this.add.rectangle(width - 60, keyboardY + 2 * (keySize + spacing), 80, keySize, 0xE65B48);
        backspace.setInteractive({ useHandCursor: true });
        this.add.text(width - 60, keyboardY + 2 * (keySize + spacing), '⌫', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        backspace.on('pointerdown', () => this.deleteCharacter());
        
        // Enter
        const enterKey = this.add.rectangle(width - 60, keyboardY + (keySize + spacing), 80, keySize, 0x00B378);
        enterKey.setInteractive({ useHandCursor: true });
        this.add.text(width - 60, keyboardY + (keySize + spacing), '↵', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        enterKey.on('pointerdown', () => this.addCharacter('\n'));
    }

    setupKeyboardInput() {
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Backspace') {
                this.deleteCharacter();
            } else if (event.key === 'Enter') {
                this.addCharacter('\n');
            } else if (event.key.length === 1) {
                this.addCharacter(event.key);
            }
        });
    }

    addCharacter(char) {
        this.textContent += char;
        this.updateDisplay();
        if (this.audioManager) this.audioManager.playSound('click');
    }

    deleteCharacter() {
        if (this.textContent.length > 0) {
            this.textContent = this.textContent.slice(0, -1);
            this.updateDisplay();
        }
    }

    clearText() {
        this.textContent = '';
        this.updateDisplay();
    }

    setStyle(style) {
        this.currentStyle = style;
        this.updateDisplay();
    }

    updateDisplay() {
        let fontSize, fontStyle;
        
        switch (this.currentStyle) {
            case 'title':
                fontSize = '32px';
                fontStyle = 'bold';
                break;
            case 'subtitle':
                fontSize = '24px';
                fontStyle = 'bold';
                break;
            default:
                fontSize = '18px';
                fontStyle = 'normal';
        }
        
        this.textDisplay.setFontSize(fontSize);
        this.textDisplay.setFontStyle(fontStyle);
        this.textDisplay.setText(this.textContent);
        
        // Update cursor position
        const bounds = this.textDisplay.getBounds();
        this.cursor.x = bounds.right + 2;
        this.cursor.y = bounds.bottom - parseInt(fontSize);
        this.cursor.setFontSize(fontSize);
    }

    setupGameLogic() {
        // Show welcome message
        this.textContent = 'Hello! Start typing...';
        this.updateDisplay();
        
        this.time.delayedCall(1000, () => {
            this.textContent = '';
            this.updateDisplay();
        });
    }
}
