import { LalelaGame } from '../utils/LalelaGame.js';

export class MemoryCaseAssociationGame extends LalelaGame {
    constructor(config) {
        super({
            key: 'MemoryCaseAssociationGame',
            ...config,
            title: config?.title || 'Case Association',
            description: config?.description || 'Match uppercase and lowercase letters.',
            category: config?.category || 'memory'
        });
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.canFlip = true;
        this.moves = 0;
        this.level = 1;
    }

    preload() {
        super.preload();
        
        // Load GCompris memory background
        this.load.svg('memory-bg', 'assets/memory/background.svg');
        this.load.svg('backcard', 'assets/memory/backcard.svg');
        this.load.svg('emptycard', 'assets/memory/emptycard.svg');
        this.load.svg('child', 'assets/memory/child.svg');
        
        // Load card flip sound
        this.load.audio('cardFlip', 'assets/memory/card_flip.wav');
        
        // Load alphabet assets
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < letters.length; i++) {
            const char = letters[i];
            this.load.svg(`lower${char}`, `assets/categorization/alphabets/lower${char}.svg`);
            this.load.svg(`upper${char}`, `assets/categorization/alphabets/upper${char}.svg`);
        }
        
        // Load navigation icons
        this.load.svg('home', 'assets/game-icons/bar_home.svg');
        this.load.svg('help', 'assets/game-icons/bar_help.svg');
        this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
        this.load.svg('config', 'assets/game-icons/bar_config.svg');
        this.load.svg('bar_next', 'assets/game-icons/bar_next.svg');
        this.load.svg('bar_prev', 'assets/game-icons/bar_previous.svg');
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // GCompris Egyptian memory background
        this.add.image(width / 2, height / 2, 'memory-bg')
            .setDisplaySize(width, height)
            .setDepth(-2);
    }

    createUI() {
        super.createUI();
        this.createNavigationDock();
        this.createScoreBadge();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const barY = height - 60;
        const buttonSize = 60;
        const spacing = 80;

        // GCompris uses circular buttons with colors
        const controls = [
            { icon: 'help', action: 'help', color: 0x00B378 },
            { icon: 'home', action: 'home', color: 0x4FC3F7 },
            { icon: 'bar_prev', action: 'prev', color: 0xF08A00 },
        ];

        let startX = 130;
        controls.forEach((control, index) => {
            const x = startX + index * spacing;
            this.createCircularNavButton(x, barY, buttonSize, control);
        });

        // Level indicator
        this.levelText = this.add.text(startX + 3 * spacing, barY, `${this.level}`, {
            fontSize: '32px', color: '#333333', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Next button
        this.createCircularNavButton(startX + 4 * spacing, barY, buttonSize, 
            { icon: 'bar_next', action: 'next', color: 0xF08A00 });
        
        // Config/menu button
        this.createCircularNavButton(startX + 5 * spacing, barY, buttonSize,
            { icon: 'config', action: 'menu', color: 0x9C6ADE });
    }

    createCircularNavButton(x, y, buttonSize, control) {
        const button = this.add.graphics();
        button.fillStyle(control.color);
        button.fillCircle(x, y, buttonSize / 2);
        button.lineStyle(3, 0xFFFFFF, 0.9);
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
            this.handleNavAction(control.action);
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
            case 'prev':
                if (this.level > 1) {
                    this.level--;
                    this.restartLevel();
                }
                break;
            case 'next':
                this.level++;
                this.restartLevel();
                break;
            case 'menu':
                this.scene.start('GameMenu');
                break;
        }
    }

    createScoreBadge() {
        const { width, height } = this.scale;
        
        // Character badge in bottom right
        const badgeX = width - 80;
        const badgeY = height - 80;
        
        // Badge background
        const badge = this.add.rectangle(badgeX, badgeY, 90, 90, 0xFFFFFF, 0.95);
        badge.setStrokeStyle(3, 0x4FC3F7);
        badge.setDepth(90);
        
        // Child character
        const child = this.add.image(badgeX - 25, badgeY, 'child');
        child.setDisplaySize(50, 50);
        child.setDepth(91);
        
        // Score
        this.scoreText = this.add.text(badgeX + 15, badgeY, '0', {
            fontSize: '28px', color: '#333333', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(91);
    }

    showHelpModal() {
        if (this.helpModal) return;

        const { width, height } = this.scale;
        this.helpModal = this.add.container(width / 2, height / 2).setDepth(200);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setInteractive();

        const panel = this.add.rectangle(0, 0, 500, 350, 0xffffff, 1);
        panel.setStrokeStyle(3, 0x4FC3F7);

        const title = this.add.text(0, -140, 'Case Association', {
            fontSize: '32px', color: '#2c3e50', fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(0, 20,
            'Match uppercase and lowercase letters!\n\n' +
            '• Flip cards to find matching pairs\n' +
            '• A matches with a, B with b, etc.\n' +
            '• Find all pairs to complete the level\n' +
            '• Use fewer moves for a better score!',
            { fontSize: '20px', color: '#333333', align: 'center', lineSpacing: 8 }
        ).setOrigin(0.5);

        const closeBtn = this.add.text(0, 145, 'Got it!', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#00B378', padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.helpModal.destroy();
            this.helpModal = null;
        });

        this.helpModal.add([overlay, panel, title, instructions, closeBtn]);
    }

    setupGameLogic() {
        this.setupLevel();
    }

    setupLevel() {
        // Clear existing cards
        this.cards.forEach(card => {
            if (card.container) card.container.destroy();
        });
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.canFlip = true;
        
        // Update level text
        if (this.levelText) {
            this.levelText.setText(`${this.level}`);
        }
        
        // Select random letters for this level (3 pairs at level 1, increasing)
        const numPairs = Math.min(3 + this.level - 1, 8);
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const selectedIndices = [];
        
        while (selectedIndices.length < numPairs) {
            const idx = Math.floor(Math.random() * letters.length);
            if (!selectedIndices.includes(idx)) {
                selectedIndices.push(idx);
            }
        }
        
        this.cardPairs = [];
        selectedIndices.forEach(idx => {
            const char = letters[idx];
            this.cardPairs.push({ matchId: char, image: `lower${char}`, isLower: true });
            this.cardPairs.push({ matchId: char, image: `upper${char}`, isLower: false });
        });
        
        this.totalPairs = numPairs;
        
        // Shuffle cards
        this.cardPairs = Phaser.Utils.Array.Shuffle(this.cardPairs);
        
        // Calculate grid
        this.calculateGridAndCreateCards();
    }

    calculateGridAndCreateCards() {
        const { width, height } = this.scale;
        const numCards = this.cardPairs.length;
        
        // Calculate grid dimensions
        let cols, rows;
        if (numCards <= 6) {
            cols = 3; rows = 2;
        } else if (numCards <= 8) {
            cols = 4; rows = 2;
        } else if (numCards <= 12) {
            cols = 4; rows = 3;
        } else {
            cols = 4; rows = 4;
        }
        
        // Card sizing
        const availableWidth = width * 0.8;
        const availableHeight = height * 0.6;
        const cardWidth = Math.min((availableWidth - (cols - 1) * 20) / cols, 140);
        const cardHeight = cardWidth * 1.4;
        
        const gridWidth = cols * cardWidth + (cols - 1) * 20;
        const gridHeight = rows * cardHeight + (rows - 1) * 20;
        const startX = (width - gridWidth) / 2 + cardWidth / 2;
        const startY = (height - gridHeight) / 2 + cardHeight / 2 - 30;
        
        // Create cards
        this.cardPairs.forEach((cardData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (cardWidth + 20);
            const y = startY + row * (cardHeight + 20);
            
            this.createCard(x, y, cardData, cardWidth, cardHeight, index);
        });
    }

    createCard(x, y, cardData, cardWidth, cardHeight, index) {
        const container = this.add.container(x, y).setDepth(10);
        
        // Card back (blue with G logo like GCompris)
        const back = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x4A90D9, 1);
        back.setStrokeStyle(4, 0x2060A0);
        
        // White circle with border
        const circleRadius = cardWidth * 0.32;
        const backCircle = this.add.circle(0, 0, circleRadius, 0xFFFFFF, 0);
        backCircle.setStrokeStyle(4, 0xFFFFFF);
        
        // "G" text for GCompris style (or "L" for Lalela)
        const backText = this.add.text(0, 0, 'G', {
            fontSize: (circleRadius * 1.4) + 'px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Card front (hidden initially)
        const front = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xE8E0D0, 1);
        front.setStrokeStyle(4, 0x4A90D9);
        front.setVisible(false);
        
        // Letter content
        let content;
        if (this.textures.exists(cardData.image)) {
            content = this.add.image(0, 0, cardData.image);
            const scale = (cardWidth * 0.7) / Math.max(content.width, content.height);
            content.setScale(scale);
        } else {
            // Fallback to text
            content = this.add.text(0, 0, cardData.matchId, {
                fontSize: (cardWidth * 0.5) + 'px',
                color: '#333333',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }
        content.setVisible(false);
        
        container.add([back, backCircle, backText, front, content]);
        
        // Store card data
        const card = {
            container,
            back,
            backCircle,
            backText,
            front,
            content,
            data: cardData,
            isFlipped: false,
            isMatched: false,
            index
        };
        
        this.cards.push(card);
        
        // Make interactive
        back.setInteractive({ useHandCursor: true });
        back.on('pointerdown', () => this.onCardClick(card));
        
        front.setInteractive({ useHandCursor: true });
        front.on('pointerdown', () => this.onCardClick(card));
    }

    onCardClick(card) {
        if (!this.canFlip || card.isFlipped || card.isMatched) return;
        if (this.flippedCards.length >= 2) return;
        
        this.playSound('cardFlip');
        this.flipCard(card, true);
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.canFlip = false;
            this.checkMatch();
        }
    }

    flipCard(card, toFront) {
        const { container, back, backCircle, backText, front, content } = card;
        
        // Scale animation for flip
        this.tweens.add({
            targets: container,
            scaleX: 0,
            duration: 150,
            onComplete: () => {
                back.setVisible(!toFront);
                backCircle.setVisible(!toFront);
                backText.setVisible(!toFront);
                front.setVisible(toFront);
                content.setVisible(toFront);
                card.isFlipped = toFront;
                
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    duration: 150
                });
            }
        });
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.data.matchId === card2.data.matchId && card1.data.isLower !== card2.data.isLower) {
            // Match!
            this.time.delayedCall(500, () => {
                this.handleMatch(card1, card2);
            });
        } else {
            // No match
            this.time.delayedCall(1000, () => {
                this.flipCard(card1, false);
                this.flipCard(card2, false);
                this.flippedCards = [];
                this.canFlip = true;
            });
        }
    }

    handleMatch(card1, card2) {
        card1.isMatched = true;
        card2.isMatched = true;
        this.matchedPairs++;
        
        // Fade out matched cards
        this.tweens.add({
            targets: [card1.container, card2.container],
            alpha: 0,
            scale: 0.8,
            duration: 400
        });
        
        // Update score
        this.score += 10;
        if (this.scoreText) {
            this.scoreText.setText(`${this.score}`);
        }
        
        this.flippedCards = [];
        this.canFlip = true;
        
        // Check win
        if (this.matchedPairs >= this.totalPairs) {
            this.handleWin();
        }
    }

    handleWin() {
        this.playSound('success');
        
        const { width, height } = this.scale;
        
        // Win message
        const winBg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x00B378, 0.95);
        winBg.setStrokeStyle(4, 0xFFFFFF);
        winBg.setDepth(200);
        
        const winText = this.add.text(width / 2, height / 2 - 30, 'Level Complete!', {
            fontSize: '36px', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);
        
        const movesText = this.add.text(width / 2, height / 2 + 20, `Moves: ${this.moves}`, {
            fontSize: '24px', color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(201);
        
        // Auto advance after delay
        this.time.delayedCall(2000, () => {
            winBg.destroy();
            winText.destroy();
            movesText.destroy();
            this.level++;
            this.restartLevel();
        });
    }

    restartLevel() {
        this.setupLevel();
    }

    playSound(key) {
        if (this.audioManager) {
            this.audioManager.playSound(key);
        } else {
            try { this.sound.play(key); } catch (e) {}
        }
    }
}
