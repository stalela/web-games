import { LalelaGame } from '../utils/LalelaGame.js';

export class MemoryEnumerateGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'MemoryEnumerateGame',
            title: 'Memory Enumeration',
            description: 'Match the number with the correct quantity.',
            category: 'memory'
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
        this.load.svg('child', 'assets/memory/child.svg');
        
        // Load butterfly for enumeration
        this.load.svg('butterfly', 'assets/memory-enumerate/butterfly.svg');
        
        // Load card flip sound
        this.load.audio('cardFlip', 'assets/memory/card_flip.wav');
        
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
        
        const badgeX = width - 80;
        const badgeY = height - 80;
        
        const badge = this.add.rectangle(badgeX, badgeY, 90, 90, 0xFFFFFF, 0.95);
        badge.setStrokeStyle(3, 0x4FC3F7);
        badge.setDepth(90);
        
        const child = this.add.image(badgeX - 25, badgeY, 'child');
        child.setDisplaySize(50, 50);
        child.setDepth(91);
        
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

        const title = this.add.text(0, -140, 'Memory Enumeration', {
            fontSize: '32px', color: '#2c3e50', fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(0, 20,
            'Match numbers with quantities!\n\n' +
            '• Flip cards to find matching pairs\n' +
            '• Match number "3" with 3 butterflies\n' +
            '• Find all pairs to complete the level\n' +
            '• Fewer moves = better score!',
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
        
        if (this.levelText) {
            this.levelText.setText(`${this.level}`);
        }
        
        // Number of pairs based on level (level 1 = 2 pairs, level 2 = 3 pairs, etc.)
        const numPairs = Math.min(1 + this.level, 6);
        
        // Generate number-quantity pairs
        const numbers = [];
        for (let i = 1; i <= 10; i++) numbers.push(i);
        // Shuffle and pick
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        const selectedNumbers = numbers.slice(0, numPairs);
        
        this.cardPairs = [];
        selectedNumbers.forEach(num => {
            // Number card
            this.cardPairs.push({ matchId: num, type: 'number', value: num });
            // Quantity card (butterflies)
            this.cardPairs.push({ matchId: num, type: 'quantity', value: num });
        });
        
        this.totalPairs = numPairs;
        
        // Shuffle cards
        this.cardPairs = Phaser.Utils.Array.Shuffle(this.cardPairs);
        
        // Calculate grid and create cards
        this.calculateGridAndCreateCards();
    }

    calculateGridAndCreateCards() {
        const { width, height } = this.scale;
        const numCards = this.cardPairs.length;
        
        // Calculate grid dimensions
        let cols, rows;
        if (numCards <= 4) {
            cols = 2; rows = 2;
        } else if (numCards <= 6) {
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
        const availableHeight = height * 0.55;
        const cardWidth = Math.min((availableWidth - (cols - 1) * 20) / cols, 130);
        const cardHeight = cardWidth * 1.4;
        
        const gridWidth = cols * cardWidth + (cols - 1) * 20;
        const gridHeight = rows * cardHeight + (rows - 1) * 20;
        const startX = (width - gridWidth) / 2 + cardWidth / 2;
        const startY = (height - gridHeight) / 2 + cardHeight / 2 - 40;
        
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
        
        // Card back (blue with G logo)
        const back = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x4A90D9, 1);
        back.setStrokeStyle(4, 0x2060A0);
        
        // White circle with border
        const circleRadius = cardWidth * 0.32;
        const backCircle = this.add.circle(0, 0, circleRadius, 0xFFFFFF, 0);
        backCircle.setStrokeStyle(4, 0xFFFFFF);
        
        // "G" text
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
        
        // Content based on card type
        let content;
        if (cardData.type === 'number') {
            // Show the number
            content = this.add.text(0, 0, cardData.value.toString(), {
                fontSize: (cardWidth * 0.6) + 'px',
                color: '#333333',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        } else {
            // Show butterflies for quantity
            content = this.createButterflyContent(cardData.value, cardWidth, cardHeight);
        }
        content.setVisible(false);
        
        container.add([back, backCircle, backText, front, content]);
        
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

    createButterflyContent(count, cardWidth, cardHeight) {
        // Create a container to hold butterflies
        const container = this.add.container(0, 0);
        
        const butterflySize = Math.min(cardWidth, cardHeight) * 0.25;
        
        // Position butterflies based on count
        const positions = this.getButterflyPositions(count, cardWidth * 0.8, cardHeight * 0.8);
        
        positions.forEach((pos, i) => {
            const butterfly = this.add.image(pos.x, pos.y, 'butterfly');
            butterfly.setDisplaySize(butterflySize, butterflySize);
            butterfly.setAngle(pos.rotation || (Math.random() * 60 - 30));
            container.add(butterfly);
        });
        
        return container;
    }

    getButterflyPositions(count, maxWidth, maxHeight) {
        const positions = [];
        const hw = maxWidth / 2;
        const hh = maxHeight / 2;
        
        // Different layouts based on count
        switch (count) {
            case 1:
                positions.push({ x: 0, y: 0, rotation: 30 });
                break;
            case 2:
                positions.push({ x: -hw * 0.4, y: -hh * 0.3, rotation: 50 });
                positions.push({ x: hw * 0.3, y: hh * 0.3, rotation: -50 });
                break;
            case 3:
                positions.push({ x: 0, y: -hh * 0.4, rotation: 0 });
                positions.push({ x: -hw * 0.4, y: hh * 0.3, rotation: 45 });
                positions.push({ x: hw * 0.4, y: hh * 0.3, rotation: -45 });
                break;
            case 4:
                positions.push({ x: -hw * 0.35, y: -hh * 0.35, rotation: 30 });
                positions.push({ x: hw * 0.35, y: -hh * 0.35, rotation: -30 });
                positions.push({ x: -hw * 0.35, y: hh * 0.35, rotation: -30 });
                positions.push({ x: hw * 0.35, y: hh * 0.35, rotation: 30 });
                break;
            case 5:
                positions.push({ x: 0, y: 0, rotation: 0 });
                positions.push({ x: -hw * 0.4, y: -hh * 0.4, rotation: 45 });
                positions.push({ x: hw * 0.4, y: -hh * 0.4, rotation: -45 });
                positions.push({ x: -hw * 0.4, y: hh * 0.4, rotation: -45 });
                positions.push({ x: hw * 0.4, y: hh * 0.4, rotation: 45 });
                break;
            default:
                // Grid layout for 6+
                const cols = Math.ceil(Math.sqrt(count));
                const rows = Math.ceil(count / cols);
                const cellW = maxWidth / cols;
                const cellH = maxHeight / rows;
                for (let i = 0; i < count; i++) {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    positions.push({
                        x: (col - (cols - 1) / 2) * cellW,
                        y: (row - (rows - 1) / 2) * cellH,
                        rotation: Math.random() * 60 - 30
                    });
                }
        }
        
        return positions;
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
        
        // Match if same matchId but different types (number vs quantity)
        if (card1.data.matchId === card2.data.matchId && card1.data.type !== card2.data.type) {
            this.time.delayedCall(500, () => {
                this.handleMatch(card1, card2);
            });
        } else {
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
        
        const winBg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x00B378, 0.95);
        winBg.setStrokeStyle(4, 0xFFFFFF);
        winBg.setDepth(200);
        
        const winText = this.add.text(width / 2, height / 2 - 30, 'Level Complete!', {
            fontSize: '36px', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);
        
        const movesText = this.add.text(width / 2, height / 2 + 20, `Moves: ${this.moves}`, {
            fontSize: '24px', color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(201);
        
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
