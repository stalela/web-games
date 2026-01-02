/**
 * MemoryImageGame - Image matching memory game
 * Players match pairs of identical images by flipping cards
 */
import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemoryImageGame extends MemoryGame {
  constructor(config) {
    super({
      category: 'memory',
      difficulty: 1,
      ...config
    });

    // Image-specific properties
    this.imageCategories = ['animals', 'fruits', 'shapes', 'colors', 'numbers'];
    this.currentCategory = 'animals';
    this.imageAssets = {}; // Cache for loaded images
    this.imageSize = 64; // Size of images within cards

    // Set match type to exact (for image matching)
    this.matchType = 'exact';

    // INCREASE these values for 3-6 year olds
    this.maxCardSize = 200;
    this.minCardSize = 120;
    this.cardSpacing = 20;

    // Reduce grid padding so cards can expand to use nearly the whole screen width
    this.gridPadding = 10;
  }

  /**
   * Preload assets for the image memory game
   */
  preload() {
    super.preload();

    // Load image assets for the current category
    this.loadImageAssets();
  }

  /**
   * Initialize the image memory game
   */
  init(data) {
    super.init(data);
  }

  /**
   * Load image assets for the current category
   */
  loadImageAssets() {
    try {
      // Load image assets for the current category
      const imageKeys = this.getImageKeysForCategory(this.currentCategory);
      this.imageAssets = {};

      // Get unique keys to avoid loading duplicates
      const uniqueKeys = [...new Set(imageKeys)];

      // List of animals we actually have SVG files for
      const availableAnimals = ['cat', 'turtle', 'lion', 'elephant'];

      // Only load animals we actually have
      uniqueKeys.forEach(key => {
        if (availableAnimals.includes(key)) {
          const svgPath = `assets/game-icons/memory_${key}.svg`;

          // Create asset entry
          this.imageAssets[key] = {
            key: key,
            texture: `memory_${key}`, // The texture key that will be loaded
            category: this.currentCategory,
            svgPath: svgPath
          };

          // Load the SVG
          this.load.svg(`memory_${key}`, svgPath);
        } else {
          console.warn(`Skipping ${key} - SVG file not available`);
        }
      });

      console.log(`Loaded ${Object.keys(this.imageAssets).length} image assets for category: ${this.currentCategory}`);

    } catch (error) {
      console.error('Failed to load image assets:', error);
    }
  }

  /**
   * Get image keys for a specific category (only using animals we have SVG files for)
   */
  getImageKeysForCategory(category) {
    // Only return animals we actually have SVG files for
    const availableAnimals = ['cat', 'turtle', 'lion', 'elephant'];

    const categoryImages = {
      animals: availableAnimals,
      fruits: availableAnimals, // Fallback to animals for now
      shapes: availableAnimals, // Fallback to animals for now
      colors: availableAnimals, // Fallback to animals for now
      numbers: availableAnimals  // Fallback to animals for now
    };

    return categoryImages[category] || categoryImages.animals;
  }

  /**
   * Generate card pairs for the current level
   */
  generateCardPairs() {
    const imageKeys = this.getImageKeysForCategory(this.currentCategory);

    // Determine how many pairs to show based on level
    let pairsToShow;
    switch (this.level) {
      case 1:
        pairsToShow = 4; // 8 cards total (4x2 grid)
        this.gridRows = 2;
        this.gridCols = 4;
        break;
      case 2:
        pairsToShow = 6; // 12 cards total (3x4 grid)
        this.gridRows = 3;
        this.gridCols = 4;
        break;
      case 3:
        pairsToShow = 8; // 16 cards total (4x4 grid)
        this.gridRows = 4;
        this.gridCols = 4;
        break;
      default:
        pairsToShow = 6;
        this.gridRows = 3;
        this.gridCols = 4;
    }

    // Select random images for this level
    const selectedImages = this.shuffleArray([...imageKeys]).slice(0, pairsToShow);

    // Create pairs (each image appears twice)
    this.cardPairs = [];
    selectedImages.forEach(image => {
      this.cardPairs.push(image, image); // Add two of each image
    });

    this.totalPairs = pairsToShow;
  }

  /**
   * Create a card with image content
   */
  createCard(x, y, value, index) {
    // Create image content for the card
    const imageContent = this.createImageContent(value);

    const card = new Card(this, {
      x: x,
      y: y,
      width: this.cardSize,
      height: this.cardSize,
      value: value,
      content: imageContent,
      backColor: 0x0062FF, // River Blue from brand guide
      frontColor: 0xFFFFFF, // Pure White from brand guide
      flipDuration: this.flipDuration
    });

    // Set up card event listeners
    card.on('cardClicked', (clickedCard) => {
      this.onCardClicked(clickedCard);
    });

    card.on('flipComplete', (flippedCard, isFlipped) => {
      this.onCardFlipComplete(flippedCard, isFlipped);
    });

    return card;
  }

  /**
   * Create image content for a card
   */
  createImageContent(imageKey) {
    const textureKey = `memory_${imageKey}`;

    // Return an object so Card.js recognizes this as a texture (not text)
    return {
      texture: textureKey,
      scale: 0.8 // Scale the animal to fill most of the card
    };
  }

  /**
   * Set the image category for this game
   */
  setImageCategory(category) {
    if (this.imageCategories.includes(category)) {
      this.currentCategory = category;
      this.loadImageAssets();

      // Restart game with new category if currently playing
      if (this.gameStarted) {
        this.restartGame();
      }
    } else {
      console.warn(`Unknown image category: ${category}`);
    }
  }

  /**
   * Get available image categories
   */
  getAvailableCategories() {
    return [...this.imageCategories];
  }

  /**
   * Override match comparison for image matching
   */
  compareExact(card1, card2) {
    // For images, exact match means same image key
    return card1.value === card2.value;
  }

  /**
   * Create UI elements specific to image memory game
   */
  createUI() {
    const { width, height } = this.scale;

    // Category display
    this.categoryText = this.add.text(
      width / 2,
      60,
      `${this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1)} Images`,
      {
        fontSize: '20px',
        color: '#101012',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Call parent createUI after setting up our elements
    super.createUI();

    // Update instructions for image matching (after parent UI is created)
    if (this.instructionText) {
      this.instructionText.setText('Click cards to flip them and find matching images!');
    }
  }

  /**
   * Update UI elements
   */
  updateUI() {
    super.updateUI();

    // Update category display if it exists and is a valid Phaser object
    if (this.categoryText && typeof this.categoryText.setText === 'function') {
      try {
        this.categoryText.setText(
          `${this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1)} Images`
        );
      } catch (error) {
        console.warn('Failed to update categoryText:', error);
      }
    }
  }

  /**
   * Handle successful match with image-specific feedback
   */
  onMatchFound(card1, card2) {
    super.onMatchFound(card1, card2);

    // Additional visual feedback for image matches
    this.createMatchEffect(card1, card2);
  }

  /**
   * Create visual effect for successful image matches
   */
  createMatchEffect(card1, card2) {
    const cards = [card1, card2];

    // Create sparkles or particles around matched cards
    cards.forEach(card => {
      // Simple scale pulse effect (could be enhanced with particles)
      this.tweens.add({
        targets: card,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          // Add a subtle glow effect
          if (card.frontSide) {
            card.frontSide.setStrokeStyle(4, 0x00B378); // Aloe Green from brand guide
          }
        }
      });
    });
  }

  /**
   * Get level-specific configuration
   */
  getLevelConfig(level) {
    const configs = {
      1: {
        pairs: 4,
        grid: { rows: 2, cols: 4 },
        timeLimit: 120,
        hintPenalty: 1
      },
      2: {
        pairs: 6,
        grid: { rows: 3, cols: 4 },
        timeLimit: 180,
        hintPenalty: 2
      },
      3: {
        pairs: 8,
        grid: { rows: 4, cols: 4 },
        timeLimit: 240,
        hintPenalty: 3
      }
    };

    return configs[level] || configs[1];
  }

  /**
   * Override restartGame to reload image assets if category changed
   */
  restartGame() {
    // Ensure image assets are loaded
    if (Object.keys(this.imageAssets).length === 0) {
      this.loadImageAssets();
    }

    super.restartGame();
  }

  /**
   * Get game-specific statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      imageCategory: this.currentCategory,
      availableCategories: this.imageCategories.length,
      imagesLoaded: Object.keys(this.imageAssets).length
    };
  }

  /**
   * Clean up resources when game is destroyed
   */
  destroy() {
    // Clean up image assets
    this.imageAssets = {};

    super.destroy();
  }
}