import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemoryTuxBaseGame extends MemoryGame {
    constructor(config) {
        super(config);
        
        this.tuxEnabled = true;
        this.tuxMemory = [];
        this.tuxTurn = false;
        this.tuxScore = 0;
        this.playerScore = 0;
    }

    create() {
        super.create();
        this.createScoreDisplay();
    }

    initializeGame() {
        super.initializeGame();
        // Reset Tux state after cards are created
        this.tuxMemory = [];
        this.tuxTurn = false;
        this.tuxScore = 0;
        this.playerScore = 0;
        this.updateScoreDisplay();
    }
    
    createScoreDisplay() {
        const { width } = this.cameras.main;
        
        if (this.playerScoreText) this.playerScoreText.destroy();
        if (this.tuxScoreText) this.tuxScoreText.destroy();
        
        this.playerScoreText = this.add.text(width * 0.25, 30, 'You: 0', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#0062FF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.tuxScoreText = this.add.text(width * 0.75, 30, 'Tux: 0', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#00B378',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    
    updateScoreDisplay() {
        if (this.playerScoreText) this.playerScoreText.setText(`You: ${this.playerScore}`);
        if (this.tuxScoreText) this.tuxScoreText.setText(`Tux: ${this.tuxScore}`);
    }
    
    onMatchFound() {
        if (this.tuxTurn) {
            this.tuxScore++;
        } else {
            this.playerScore++;
        }
        this.updateScoreDisplay();
        super.onMatchFound();
        
        // If it was Tux's turn and he matched, he gets another turn?
        // GCompris rules: usually yes, but let's check.
        // For now, let's keep it simple: match found -> same player continues?
        // In standard memory, yes.
        
        if (this.tuxTurn && !this.isLevelComplete()) {
            this.time.delayedCall(1000, () => this.tuxPlay());
        }
    }
    
    onMatchFailed() {
        // Store revealed cards in Tux's memory
        if (this.selectedCards.length >= 2) {
            this.selectedCards.forEach(card => {
                const exists = this.tuxMemory.find(m => m.index === card.cardIndex);
                if (!exists) {
                    this.tuxMemory.push({
                        index: card.cardIndex,
                        value: card.cardValue // This is the matchId
                    });
                }
            });
        }
        
        super.onMatchFailed();
        
        // Switch turns
        this.tuxTurn = !this.tuxTurn;
        
        if (this.tuxTurn && !this.isLevelComplete()) {
            this.time.delayedCall(1000, () => this.tuxPlay());
        }
    }
    
    tuxPlay() {
        if (!this.tuxTurn) return;
        
        // Find a pair in memory
        const knownPair = this.findKnownPair();
        
        if (knownPair) {
            this.selectCardByIndex(knownPair[0]);
            this.time.delayedCall(800, () => {
                this.selectCardByIndex(knownPair[1]);
            });
        } else {
            // Random selection
            const availableCards = this.cards.filter(c => !c.isFlipped && !c.isMatched);
            if (availableCards.length >= 2) {
                // Pick first card (prefer unknown ones to explore)
                // Or pick a known one if we have one but not its pair?
                
                const first = availableCards[Math.floor(Math.random() * availableCards.length)];
                this.selectCardByIndex(first.cardIndex);
                
                this.time.delayedCall(800, () => {
                    // Check if the first card matches something in memory
                    // (Simulate Tux realizing "Oh I saw that before!")
                    const matchInMemory = this.tuxMemory.find(m => m.value === first.cardValue && m.index !== first.cardIndex);
                    const matchCard = matchInMemory ? this.cards.find(c => c.cardIndex === matchInMemory.index) : null;
                    
                    if (matchCard && !matchCard.isMatched && !matchCard.isFlipped) {
                        // Tux remembers!
                        this.selectCardByIndex(matchCard.cardIndex);
                    } else {
                        // Random second card
                        const remaining = availableCards.filter(c => c.cardIndex !== first.cardIndex);
                        if (remaining.length > 0) {
                            const second = remaining[Math.floor(Math.random() * remaining.length)];
                            this.selectCardByIndex(second.cardIndex);
                        }
                    }
                });
            }
        }
    }
    
    findKnownPair() {
        for (let i = 0; i < this.tuxMemory.length; i++) {
            for (let j = i + 1; j < this.tuxMemory.length; j++) {
                if (this.tuxMemory[i].value === this.tuxMemory[j].value) {
                    const card1 = this.cards.find(c => c.cardIndex === this.tuxMemory[i].index);
                    const card2 = this.cards.find(c => c.cardIndex === this.tuxMemory[j].index);
                    if (card1 && card2 && !card1.isMatched && !card2.isMatched) {
                        return [this.tuxMemory[i].index, this.tuxMemory[j].index];
                    }
                }
            }
        }
        return null;
    }
    
    selectCardByIndex(index) {
        const card = this.cards.find(c => c.cardIndex === index);
        if (card && !card.isFlipped && !card.isMatched) {
            this.onCardClicked(card);
        }
    }

    createCard(x, y, cardData, index) {
        // Override to add index and click handler
        const content = cardData.value.toString();
        
        const card = new Card(this, {
            x: x,
            y: y,
            width: this.cardSize,
            height: this.cardSize,
            value: cardData.matchId,
            content: content,
            backColor: 0x0062FF,
            frontColor: 0xFFFFFF,
            flipDuration: this.flipDuration,
            imageKey: cardData.imageKey // Support for image cards
        });

        card.cardIndex = index;
        card.cardValue = cardData.matchId; // Ensure value is accessible

        card.on('cardClicked', (clickedCard) => {
            if (!this.tuxTurn) {
                this.onCardClicked(clickedCard);
            }
        });

        card.on('flipComplete', (flippedCard, isFlipped) => {
            this.onCardFlipComplete(flippedCard, isFlipped);
        });

        return card;
    }
}
