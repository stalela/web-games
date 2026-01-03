import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemoryEnumerateGame extends MemoryGame {
    constructor(config) {
        super({
            ...config,
            key: 'MemoryEnumerateGame',
            title: 'Memory Enumeration',
            description: 'Match the number with the correct quantity.',
            category: 'memory'
        });
    }

    preload() {
        super.preload();
        this.load.svg('memory-enum-butterfly', 'assets/memory-enumerate/butterfly.svg');
    }

    setupLevel() {
        const numPairs = Math.min(3 + this.level, 8); // Start with 4 pairs
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        // Shuffle numbers
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        
        const selectedNumbers = numbers.slice(0, numPairs);
        
        this.cardPairs = [];
        selectedNumbers.forEach(num => {
            // Pair 1: Number
            this.cardPairs.push({
                matchId: num,
                type: 'number',
                value: num
            });
            // Pair 2: Quantity
            this.cardPairs.push({
                matchId: num,
                type: 'quantity',
                value: num
            });
        });
        
        this.calculateGridDimensions(this.cardPairs.length);
        const { width, height } = this.cameras.main;
        this.calculateOptimalLayout(width, height);
        this.shuffleAndPositionCards();
    }

    createCard(x, y, cardData, index) {
        let content;
        
        if (cardData.type === 'number') {
            content = cardData.value.toString();
        } else {
            // Create texture for quantity
            const key = `enum-texture-${cardData.value}`;
            if (!this.textures.exists(key)) {
                this.createQuantityTexture(key, cardData.value);
            }
            content = {
                texture: key,
                scale: (this.cardSize * 0.8) / 100 // Scale to fit
            };
        }

        const card = new Card(this, {
            x: x,
            y: y,
            width: this.cardSize,
            height: this.cardSize,
            value: cardData.matchId,
            content: content,
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
    
    createQuantityTexture(key, count) {
        // Create a RenderTexture
        const size = 100;
        const rt = this.make.renderTexture({ width: size, height: size }, false);
        
        // Draw butterflies
        // Simple grid or random positions?
        // Let's do a simple grid for now
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const itemSize = size / Math.max(cols, rows);
        
        for (let i = 0; i < count; i++) {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const x = c * itemSize + itemSize / 2;
            const y = r * itemSize + itemSize / 2;
            
            const sprite = this.make.image({ key: 'memory-enum-butterfly', add: false });
            const scale = Math.min(itemSize / sprite.width, itemSize / sprite.height) * 0.8;
            sprite.setScale(scale);
            
            rt.draw(sprite, x, y);
        }
        
        rt.saveTexture(key);
    }
}
