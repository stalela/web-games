/**
 * MemorySoundGame - Sound-based memory game
 * Players match pairs by listening to audio cues and remembering sound patterns
 */
import { MemoryGame } from './MemoryGame.js';
import { Card } from '../components/Card.js';

export class MemorySoundGame extends MemoryGame {
  constructor(config) {
    super({
      category: 'memory',
      difficulty: 2,
      ...config
    });

    // Sound-specific properties
    this.soundCategories = ['animals', 'instruments', 'nature', 'voices', 'music'];
    this.currentSoundCategory = 'animals';
    this.soundAssets = {}; // Cache for loaded sounds
    this.isPlayingSound = false;
    this.autoPlayEnabled = true;
    this.playOnFlip = true; // Play sound when card is flipped
    this.playOnMatch = true; // Play sound when cards match

    // Set match type to sound
    this.matchType = 'sound';
  }

  /**
   * Initialize the sound memory game
   */
  init(data) {
    super.init(data);

    // Load sound assets for the current category
    this.loadSoundAssets();
  }

  /**
   * Load sound assets for the current category
   */
  async loadSoundAssets() {
    if (!this.assetManager) {
      console.warn('No asset manager available for loading sounds');
      return;
    }

    try {
      // Load sound assets for the current category
      const soundKeys = this.getSoundKeysForCategory(this.currentSoundCategory);
      this.soundAssets = {};

      // In a real implementation, this would load actual audio files
      // For now, we'll use placeholder data
      soundKeys.forEach(key => {
        this.soundAssets[key] = {
          key: key,
          audio: null, // Would be loaded Howl audio object
          category: this.currentSoundCategory,
          duration: 1000 + Math.random() * 2000 // Simulated duration
        };
      });

    } catch (error) {
      console.error('Failed to load sound assets:', error);
    }
  }

  /**
   * Get sound keys for a specific category
   */
  getSoundKeysForCategory(category) {
    const categorySounds = {
      animals: ['dog_bark', 'cat_meow', 'cow_moo', 'sheep_baa', 'duck_quack', 'lion_roar', 'elephant_trumpet', 'monkey_chatter'],
      instruments: ['piano_c', 'guitar_chord', 'drum_beat', 'flute_melody', 'violin_note', 'trumpet_fanfare', 'bell_chime', 'xylophone_scale'],
      nature: ['rain_patter', 'wind_howl', 'ocean_waves', 'forest_birds', 'thunder_clap', 'stream_flow', 'leaves_rustle', 'crickets_chirp'],
      voices: ['hello_female', 'hello_male', 'laugh_child', 'clap_hands', 'count_one', 'count_two', 'count_three', 'count_four'],
      music: ['do_note', 're_note', 'mi_note', 'fa_note', 'so_note', 'la_note', 'ti_note', 'do_high']
    };

    return categorySounds[category] || categorySounds.animals;
  }

  /**
   * Generate card pairs for the current level
   */
  generateCardPairs() {
    const soundKeys = this.getSoundKeysForCategory(this.currentSoundCategory);

    // Determine how many pairs to show based on level
    let pairsToShow;
    switch (this.level) {
      case 1:
        pairsToShow = 3; // 6 cards total (3x2 grid)
        this.gridRows = 2;
        this.gridCols = 3;
        break;
      case 2:
        pairsToShow = 4; // 8 cards total (2x4 grid)
        this.gridRows = 2;
        this.gridCols = 4;
        break;
      case 3:
        pairsToShow = 6; // 12 cards total (3x4 grid)
        this.gridRows = 3;
        this.gridCols = 4;
        break;
      default:
        pairsToShow = 4;
        this.gridRows = 2;
        this.gridCols = 4;
    }

    // Select random sounds for this level
    const selectedSounds = this.shuffleArray([...soundKeys]).slice(0, pairsToShow);

    // Create pairs (each sound appears twice)
    this.cardPairs = [];
    selectedSounds.forEach(sound => {
      this.cardPairs.push(sound, sound); // Add two of each sound
    });

    this.totalPairs = pairsToShow;
  }

  /**
   * Create a card with sound content
   */
  createCard(x, y, value, index) {
    // Create sound content for the card
    const soundContent = this.createSoundContent(value);

    const card = new Card(this, {
      x: x,
      y: y,
      width: this.cardSize,
      height: this.cardSize,
      value: value,
      content: soundContent,
      backColor: 0xFD5E1A, // Bead Orange from brand guide (for sound games)
      frontColor: 0xFFFFFF, // Pure White from brand guide
      flipDuration: this.flipDuration
    });

    // Set up card event listeners
    card.on('cardClicked', (clickedCard) => {
      this.onCardClicked(clickedCard);
    });

    card.on('flipComplete', (flippedCard, isFlipped) => {
      this.onCardFlipComplete(flippedCard, isFlipped);

      // Play sound when card is flipped to front (if enabled)
      if (isFlipped && this.playOnFlip && !this.isPlayingSound) {
        this.playCardSound(flippedCard.value);
      }
    });

    return card;
  }

  /**
   * Create sound content for a card
   */
  createSoundContent(soundKey) {
    // In a real implementation, this would return sound data
    // For now, return a placeholder that can be rendered

    if (this.soundAssets[soundKey]) {
      return {
        type: 'sound',
        key: soundKey,
        category: this.currentSoundCategory,
        icon: this.getSoundIcon(soundKey) // Visual representation
      };
    }

    // Fallback to text if sound not available
    return soundKey.replace(/_/g, ' ');
  }

  /**
   * Get visual icon representation for a sound
   */
  getSoundIcon(soundKey) {
    // Return appropriate emoji/icon based on sound type
    const iconMap = {
      // Animals
      'dog_bark': '🐕', 'cat_meow': '🐱', 'cow_moo': '🐄', 'sheep_baa': '🐑',
      'duck_quack': '🦆', 'lion_roar': '🦁', 'elephant_trumpet': '🐘', 'monkey_chatter': '🐒',

      // Instruments
      'piano_c': '🎹', 'guitar_chord': '🎸', 'drum_beat': '🥁', 'flute_melody': '🪈',
      'violin_note': '🎻', 'trumpet_fanfare': '🎺', 'bell_chime': '🔔', 'xylophone_scale': '🎵',

      // Nature
      'rain_patter': '🌧️', 'wind_howl': '🌪️', 'ocean_waves': '🌊', 'forest_birds': '🌳',
      'thunder_clap': '⛈️', 'stream_flow': '🏞️', 'leaves_rustle': '🍃', 'crickets_chirp': '🦗',

      // Voices
      'hello_female': '👩', 'hello_male': '👨', 'laugh_child': '👶', 'clap_hands': '👏',
      'count_one': '1️⃣', 'count_two': '2️⃣', 'count_three': '3️⃣', 'count_four': '4️⃣',

      // Music
      'do_note': '🎼', 're_note': '🎵', 'mi_note': '🎶', 'fa_note': '🎵',
      'so_note': '🎼', 'la_note': '🎶', 'ti_note': '🎵', 'do_high': '🎵'
    };

    return iconMap[soundKey] || '🔊';
  }

  /**
   * Play the sound associated with a card
   */
  playCardSound(soundKey) {
    if (this.isPlayingSound) return;

    this.isPlayingSound = true;

    // In a real implementation, this would play the actual sound
    // For now, we'll simulate sound playback
    console.log(`Playing sound: ${soundKey}`);

    if (this.soundAssets[soundKey]) {
      const soundData = this.soundAssets[soundKey];
      const duration = soundData.duration || 1500;

      // Simulate sound playback with visual feedback
      this.showSoundPlayingFeedback(soundKey, duration);

      // Reset playing flag after sound completes
      this.time.delayedCall(duration, () => {
        this.isPlayingSound = false;
      });
    } else {
      // Fallback - just reset the flag quickly
      this.time.delayedCall(500, () => {
        this.isPlayingSound = false;
      });
    }
  }

  /**
   * Show visual feedback when a sound is playing
   */
  showSoundPlayingFeedback(soundKey, duration) {
    // Create a temporary sound indicator
    const icon = this.getSoundIcon(soundKey);
    const soundIndicator = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      `🔊 ${icon}`,
      {
        fontSize: '48px',
        color: '#9b59b6',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 3
      }
    ).setOrigin(0.5);

    // Animate the sound indicator
    this.tweens.add({
      targets: soundIndicator,
      scale: 1.2,
      duration: duration / 4,
      yoyo: true,
      ease: 'Power2'
    });

    // Remove the indicator after sound completes
    this.time.delayedCall(duration, () => {
      if (soundIndicator && soundIndicator.destroy) {
        soundIndicator.destroy();
      }
    });
  }

  /**
   * Set the sound category for this game
   */
  setSoundCategory(category) {
    if (this.soundCategories.includes(category)) {
      this.currentSoundCategory = category;
      this.loadSoundAssets();

      // Restart game with new category if currently playing
      if (this.gameStarted) {
        this.restartGame();
      }
    } else {
      console.warn(`Unknown sound category: ${category}`);
    }
  }

  /**
   * Get available sound categories
   */
  getAvailableCategories() {
    return [...this.soundCategories];
  }

  /**
   * Override sound comparison for audio matching
   */
  compareSound(value1, value2) {
    // For sounds, exact match means same sound key
    return value1 === value2;
  }

  /**
   * Override match found to play celebration sound
   */
  onMatchFound(card1, card2) {
    super.onMatchFound(card1, card2);

    // Play match celebration sound
    if (this.playOnMatch && this.game.audioManager) {
      this.game.audioManager.playSound('success');
    }
  }

  /**
   * Override onCardClicked to handle sound playback
   */
  onCardClicked(card) {
    // If auto-play is enabled and card is face down, play its sound
    if (this.autoPlayEnabled && !card.isFlipped && !this.isPlayingSound) {
      this.playCardSound(card.value);
      return; // Don't flip yet, let user listen first
    }

    // Otherwise, proceed with normal card flipping
    super.onCardClicked(card);
  }

  /**
   * Create UI elements specific to sound memory game
   */
  createUI() {
    super.createUI();

    const { width, height } = this.scale;

    // Sound category display
    this.categoryText = this.add.text(
      width / 2,
      60,
      `${this.currentSoundCategory.charAt(0).toUpperCase() + this.currentSoundCategory.slice(1)} Sounds`,
      {
        fontSize: '20px',
        color: '#2c3e50',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Sound control buttons
    this.autoPlayButton = this.add.text(
      width - 120,
      height - 120,
      `Auto-play: ${this.autoPlayEnabled ? 'ON' : 'OFF'}`,
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: this.autoPlayEnabled ? '#27ae60' : '#95a5a6',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setInteractive();

    this.autoPlayButton.on('pointerdown', () => {
      this.autoPlayEnabled = !this.autoPlayEnabled;
      this.autoPlayButton.setText(`Auto-play: ${this.autoPlayEnabled ? 'ON' : 'OFF'}`);
      this.autoPlayButton.setStyle({
        backgroundColor: this.autoPlayEnabled ? '#27ae60' : '#95a5a6'
      });
    });

    // Instructions for sound game
    this.instructionText.setText('Listen to the sounds and find matching pairs!');
  }

  /**
   * Update UI elements
   */
  updateUI() {
    super.updateUI();

    // Update category display if it exists
    if (this.categoryText && typeof this.categoryText.setText === 'function') {
      try {
        this.categoryText.setText(
          `${this.currentSoundCategory.charAt(0).toUpperCase() + this.currentSoundCategory.slice(1)} Sounds`
        );
      } catch (error) {
        console.warn('Failed to update categoryText:', error);
      }
    }
  }

  /**
   * Get level-specific configuration
   */
  getLevelConfig(level) {
    const configs = {
      1: {
        pairs: 3,
        grid: { rows: 2, cols: 3 },
        timeLimit: 90,
        hintPenalty: 0.5
      },
      2: {
        pairs: 4,
        grid: { rows: 2, cols: 4 },
        timeLimit: 120,
        hintPenalty: 1
      },
      3: {
        pairs: 6,
        grid: { rows: 3, cols: 4 },
        timeLimit: 180,
        hintPenalty: 1.5
      }
    };

    return configs[level] || configs[1];
  }

  /**
   * Override restartGame to reload sound assets if category changed
   */
  restartGame() {
    // Stop any currently playing sounds
    this.isPlayingSound = false;

    // Ensure sound assets are loaded
    if (Object.keys(this.soundAssets).length === 0) {
      this.loadSoundAssets();
    }

    super.restartGame();
  }

  /**
   * Get game-specific statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      soundCategory: this.currentSoundCategory,
      availableCategories: this.soundCategories.length,
      soundsLoaded: Object.keys(this.soundAssets).length,
      autoPlayEnabled: this.autoPlayEnabled,
      soundsPlayed: this.moves // Each move involves listening to a sound
    };
  }

  /**
   * Clean up resources when game is destroyed
   */
  destroy() {
    // Stop any playing sounds
    this.isPlayingSound = false;

    // Clean up sound assets
    this.soundAssets = {};

    super.destroy();
  }
}