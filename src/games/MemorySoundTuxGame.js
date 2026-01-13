import { MemorySoundGame } from './MemorySoundGame.js';
import { Card } from '../components/Card.js';

export class MemorySoundTuxGame extends MemorySoundGame {
    constructor() {
        super({
            key: 'MemorySoundTuxGame',
            title: 'Memory Sound Tux',
            description: 'Match sound pairs against Tux.',
            category: 'memory'
        });
        
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
            this.time.delayedCall(1500, () => { // Longer delay for sound
                this.selectCardByIndex(knownPair[1]);
            });
        } else {
            // Random selection
            const availableCards = this.cards.filter(c => !c.isFlipped && !c.isMatched);
            if (availableCards.length >= 2) {
                const first = availableCards[Math.floor(Math.random() * availableCards.length)];
                this.selectCardByIndex(first.cardIndex);
                
                this.time.delayedCall(1500, () => {
                    const matchInMemory = this.tuxMemory.find(m => m.value === first.cardValue && m.index !== first.cardIndex);
                    const matchCard = matchInMemory ? this.cards.find(c => c.cardIndex === matchInMemory.index) : null;
                    
                    if (matchCard && !matchCard.isMatched && !matchCard.isFlipped) {
                        this.selectCardByIndex(matchCard.cardIndex);
                    } else {
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
        // We need to intercept the card creation to add the index and click handler for Tux
        // But MemorySoundGame might have its own createCard logic.
        // Let's check MemorySoundGame.js again.
        // It doesn't seem to override createCard, it uses MemoryGame's.
        // So we can override it here.
        
        const card = super.createCard(x, y, cardData, index);
        card.cardIndex = index;
        card.cardValue = cardData.matchId;

        // We need to wrap the click handler
        // The original card has a 'cardClicked' event listener added in MemoryGame.createCard
        // We can add another one, or replace it?
        // Actually, MemoryGame.createCard adds: card.on('cardClicked', (clickedCard) => this.onCardClicked(clickedCard));
        // We want to prevent that if it's Tux's turn.
        
        // The easiest way is to remove all listeners and add our own that checks turns.
        card.off('cardClicked');
        card.on('cardClicked', (clickedCard) => {
            if (!this.tuxTurn) {
                this.onCardClicked(clickedCard);
            }
        });

        return card;
    }
}
