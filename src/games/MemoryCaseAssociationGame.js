import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemoryCaseAssociationGame extends MemoryGame {
    constructor(config) {
        super({
            ...config,
            key: 'MemoryCaseAssociationGame',
            title: 'Case Association',
            description: 'Match uppercase and lowercase letters.',
            category: 'memory'
        });
    }

    preload() {
        super.preload();
        // Load alphabet assets
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < letters.length; i++) {
            const char = letters[i];
            this.load.svg(`lower${char}`, `assets/categorization/alphabets/lower${char}.svg`);
            this.load.svg(`upper${char}`, `assets/categorization/alphabets/upper${char}.svg`);
        }
    }

    setupLevel() {
        // Select random letters for this level
        const numPairs = Math.min(6 + (this.level - 1) * 2, 12); // Increase pairs with level
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
            // Pair 1: Lowercase
            this.cardPairs.push({
                matchId: char,
                image: `lower${char}`
            });
            // Pair 2: Uppercase
            this.cardPairs.push({
                matchId: char,
                image: `upper${char}`
            });
        });
        
        // Calculate grid size based on number of cards
        this.calculateGridDimensions(this.cardPairs.length);
        
        // Calculate layout
        const { width, height } = this.cameras.main;
        this.calculateOptimalLayout(width, height);
        
        // Create cards
        this.shuffleAndPositionCards();
    }

    createCard(x, y, cardData, index) {
        const iconContent = {
            texture: cardData.image,
            scale: (this.cardSize * 0.6) / 100
        };

        const card = new Card(this, {
            x: x,
            y: y,
            width: this.cardSize,
            height: this.cardSize,
            value: cardData.matchId, // This is 'A'
            content: iconContent,
            backColor: 0x0062FF,
            frontColor: 0xFFFFFF,
            flipDuration: this.flipDuration
        });

        card.on('cardClicked', (clickedCard) => {
            this.onCardClicked(clickedCard);
        });

        card.on('flipComplete', (flippedCard, isFlipped) => {
            this.onCardFlipComplete(flippedCard, isFlipped);
        });

        return card;
    }
}
