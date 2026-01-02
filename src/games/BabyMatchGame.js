/**
 * BabyMatchGame - Simple memory game for babies and toddlers
 * Large, colorful cards with basic shapes and objects, designed for young children
 */
import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class BabyMatchGame extends MemoryGame {
  constructor(config) {
    super({
      category: 'memory',
      difficulty: 0.5, // Easier than regular memory games
      ...config
    });

    // Baby-friendly properties
    this.babyShapes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
    this.babyColors = [0xE32528, 0xFD5E1A, 0xFACA2A, 0x00B378, 0x0062FF, 0x8000ff]; // Lalela brand colors - bright and friendly
    this.cardSize = 120; // Larger cards for babies
    this.maxHints = 5; // More hints available
    this.flipDelay = 1500; // Longer delay so babies can see the cards
    this.matchType = 'exact';

    // Simplified grid - always 2x2 for babies
    this.gridRows = 2;
    this.gridCols = 2;
    this.cardSpacing = 20;
  }

  /**
   * Generate card pairs for baby level
   */
  generateCardPairs() {
    // Always use 2 pairs (4 cards total) for babies - very simple
    const pairsToShow = 2;

    // Select 2 random shapes for this game
    const selectedShapes = this.shuffleArray([...this.babyShapes]).slice(0, pairsToShow);

    // Create pairs (each shape appears twice)
    this.cardPairs = [];
    selectedShapes.forEach(shape => {
      this.cardPairs.push(shape, shape); // Add two of each shape
    });

    this.totalPairs = pairsToShow;
  }

  /**
   * Create a large, colorful card for babies
   */
  createCard(x, y, value, index) {
    // Create shape content for the card
    const shapeContent = this.createShapeContent(value);

    const card = new Card(this, {
      x: x,
      y: y,
      width: this.cardSize,
      height: this.cardSize,
      value: value,
      content: shapeContent,
      backColor: 0xFACA2A, // Lalela Yellow from brand guide
      frontColor: 0xffffff,
      flipDuration: this.flipDuration * 0.8, // Slightly faster for babies' attention span
      scaleOnHover: 1.1 // More pronounced hover effect
    });

    // Set up card event listeners
    card.on('cardClicked', (clickedCard) => {
      this.onCardClicked(clickedCard);
    });

    card.on('flipComplete', (flippedCard, isFlipped) => {
      this.onCardFlipComplete(flippedCard, isFlipped);

      // Play a gentle sound when card flips
      if (isFlipped && this.game.audioManager) {
        this.game.audioManager.playSound('click');
      }
    });

    return card;
  }

  /**
   * Create simple shape content for baby cards
   */
  createShapeContent(shapeName) {
    // Get a bright color for this shape
    const colorIndex = this.babyShapes.indexOf(shapeName) % this.babyColors.length;
    const color = this.babyColors[colorIndex];

    return {
      type: 'shape',
      shape: shapeName,
      color: color,
      scale: 0.8 // Large but not overwhelming
    };
  }

  /**
   * Simplified card clicking for babies - more forgiving
   */
  onCardClicked(card) {
    // Don't allow clicking if animation is in progress
    if (this.isAnimating || card.isMatched) {
      return;
    }

    // If card is already flipped, don't do anything (babies might click multiple times)
    if (card.isFlipped) {
      return;
    }

    // Flip the card
    card.flip(true);
    this.flippedCards.push(card);

    // Check for matches when 2 cards are flipped
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkForMatch();
    }
  }

  /**
   * Baby-friendly match checking with celebration
   */
  checkForMatch() {
    const [card1, card2] = this.flippedCards;

    if (card1.value === card2.value) {
      // Match found! Big celebration for babies
      this.onBabyMatch(card1, card2);
    } else {
      // No match - gently flip back after longer delay
      this.time.delayedCall(this.flipDelay, () => {
        card1.flip(false);
        card2.flip(false);
        this.flippedCards = [];
      });
    }
  }

  /**
   * Special celebration for baby matches
   */
  onBabyMatch(card1, card2) {
    // Mark cards as matched
    card1.setMatched(true);
    card2.setMatched(true);
    this.matchedPairs++;
    this.flippedCards = [];

    // Big celebration animation
    this.createBabyCelebration(card1, card2);

    // Extra points for babies
    this.addScore(20);

    // Play happy sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('success');
    }

    // Check if game is complete
    if (this.matchedPairs === this.totalPairs) {
      this.onBabyGameComplete();
    }

    this.updateUI();
  }

  /**
   * Create fun celebration animation for babies
   */
  createBabyCelebration(card1, card2) {
    const cards = [card1, card2];

    // Create colorful sparkles around matched cards
    cards.forEach(card => {
      // Big bounce animation
      this.tweens.add({
        targets: card,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 400,
        yoyo: true,
        ease: 'Bounce',
        onComplete: () => {
          // Add rainbow glow effect
          if (card.frontSide) {
            const rainbowColors = [0xE32528, 0xFD5E1A, 0xFACA2A, 0x00B378, 0x0062FF]; // Lalela brand colors
            let colorIndex = 0;

            const colorChange = this.time.addEvent({
              delay: 200,
              callback: () => {
                card.frontSide.setStrokeStyle(4, rainbowColors[colorIndex]);
                colorIndex = (colorIndex + 1) % rainbowColors.length;
              },
              repeat: 5
            });
          }
        }
      });

      // Create floating stars around the card
      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(i * 200, () => {
          this.createFloatingStar(card.x, card.y);
        });
      }
    });
  }

  /**
   * Create a floating star animation
   */
  createFloatingStar(x, y) {
    const star = this.add.text(x, y, '⭐', {
      fontSize: '30px'
    }).setOrigin(0.5);

    // Random direction for star
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 30;

    this.tweens.add({
      targets: star,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      scale: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        star.destroy();
      }
    });
  }

  /**
   * Special completion celebration for babies
   */
  onBabyGameComplete() {
    this.gameCompleted = true;

    // Calculate score with baby bonus
    const babyBonus = 50; // Extra points for completing baby game
    this.addScore(babyBonus);

    const { width, height } = this.scale;

    // Big celebration text
    const celebrationText = this.add.text(width / 2, height / 2 - 50, '🎉 YAY! 🎉', {
      fontSize: '60px',
      color: '#ff6b6b',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Completion message
    const completeText = this.add.text(width / 2, height / 2 + 20, 'You found all the matches!\nYou\'re a memory star! 🌟', {
      fontSize: '24px',
      color: '#2c3e50',
      align: 'center'
    }).setOrigin(0.5);

    // Final score display
    const scoreText = this.add.text(width / 2, height / 2 + 80, `Score: ${this.score}`, {
      fontSize: '28px',
      color: '#27ae60',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animate celebration
    this.tweens.add({
      targets: celebrationText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: 3,
      ease: 'Bounce'
    });

    // Play celebration sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('success');
    }
  }

  /**
   * Create baby-friendly UI
   */
  createUI() {
    const { width, height } = this.scale;

    // Simple score display
    this.scoreText = this.add.text(30, 30, `⭐ ${this.score}`, {
      fontSize: '32px',
      color: '#2c3e50',
      fontStyle: 'bold'
    });

    // Big, friendly instruction text
    this.instructionText = this.add.text(width / 2, height - 80, 'Tap the cards to find matching shapes! 🎯', {
      fontSize: '22px',
      color: '#34495e',
      align: 'center'
    }).setOrigin(0.5);

    // Hint button with baby-friendly icon
    if (this.maxHints > 0) {
      this.hintButton = this.add.text(width - 120, height - 80, `💡 ${this.maxHints - this.hintsUsed}`, {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#f39c12',
        padding: { x: 15, y: 8 },
        borderRadius: 10
      }).setOrigin(0.5).setInteractive();

      this.hintButton.on('pointerdown', () => this.useHint());
    }
  }

  /**
   * Override hint system for babies
   */
  useHint() {
    if (this.hintsUsed >= this.maxHints) {
      return;
    }

    // Find an unmatched pair
    const unmatchedCards = this.cards.filter(card => !card.isMatched);
    if (unmatchedCards.length < 2) return;

    // Find cards with the same value
    const valueGroups = {};
    unmatchedCards.forEach(card => {
      if (!valueGroups[card.value]) {
        valueGroups[card.value] = [];
      }
      valueGroups[card.value].push(card);
    });

    // Find a group with exactly 2 cards (a complete pair)
    const pairValues = Object.keys(valueGroups).filter(value => valueGroups[value].length === 2);
    if (pairValues.length === 0) return;

    // Pick the first available pair
    const pairValue = pairValues[0];
    const [card1, card2] = valueGroups[pairValue];

    // Gentle hint animation - briefly highlight both cards
    this.hintsUsed++;

    [card1, card2].forEach(card => {
      this.tweens.add({
        targets: card,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        ease: 'Power2'
      });
    });

    // Update hint counter
    if (this.hintButton) {
      this.hintButton.setText(`💡 ${this.maxHints - this.hintsUsed}`);
      if (this.hintsUsed >= this.maxHints) {
        this.hintButton.setAlpha(0.5);
        this.hintButton.disableInteractive();
      }
    }

    // Play hint sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('click');
    }
  }

  /**
   * Simplified matching with no wrong answers penalty
   */
  onMatchFailed(card1, card2) {
    // For babies, don't penalize wrong matches - just flip back gently
    // No streak reset or error sounds for babies

    // Flip cards back after delay
    this.time.delayedCall(this.flipDelay, () => {
      card1.flip(false);
      card2.flip(false);
      this.flippedCards = [];
    });
  }

  /**
   * Get baby-friendly game statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      babyMode: true,
      celebrationLevel: 'high', // More celebrations for babies
      hintSystem: 'generous', // More hints available
      difficulty: 'baby-friendly'
    };
  }

  /**
   * Simplified restart for babies
   */
  restartGame() {
    // Reset baby-specific properties
    this.hintsUsed = 0;
    if (this.hintButton) {
      this.hintButton.setAlpha(1);
      this.hintButton.setInteractive();
    }

    super.restartGame();
  }
}