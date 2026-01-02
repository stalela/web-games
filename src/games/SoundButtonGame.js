/**
 * SoundButtonGame - Interactive sound learning game
 * Children learn about sounds through interactive buttons and audio feedback
 */
import { InteractiveGame } from './InteractiveGame.js';

export class SoundButtonGame extends InteractiveGame {
  constructor(config) {
    super({
      category: 'sound',
      difficulty: 1,
      ...config
    });

    // Sound-specific properties
    this.soundButtons = [];
    this.currentCategory = 'animals';
    this.soundCategories = {};
    this.activeButton = null;
    this.soundEnabled = true;
    this.buttonSize = 120;
    this.buttonSpacing = 20;
    this.buttonsPerRow = 4;
    this.totalRounds = 0;
    this.correctInteractions = 0;
  }

  /**
   * Initialize learning objectives for sound learning
   */
  initializeLearningObjectives() {
    // Sound recognition
    this.addLearningObjective(
      'sound_recognition',
      'Sound Recognition',
      'Identify and recognize different sounds',
      'Listen to the sounds and match them to the correct buttons',
      20,
      10 // Need to correctly identify 10 different sounds
    );

    // Sound categories
    this.addLearningObjective(
      'sound_categories',
      'Sound Categories',
      'Learn different types of sounds (animals, instruments, etc.)',
      'Explore different sound categories and their characteristics',
      15,
      3 // Need to explore 3 different categories
    );

    // Interactive exploration
    this.addLearningObjective(
      'sound_exploration',
      'Sound Exploration',
      'Explore and interact with sound buttons',
      'Click on different sound buttons to hear and learn',
      25,
      20 // Need to interact with 20 different buttons
    );

    // Sound patterns
    this.addLearningObjective(
      'sound_patterns',
      'Sound Patterns',
      'Recognize patterns in sounds and sequences',
      'Listen for similar sounds and identify patterns',
      30,
      5 // Need to complete 5 pattern recognition activities
    );

    // Set up validation rules
    this.setupValidationRules();
  }

  /**
   * Set up validation rules for sound objectives
   */
  setupValidationRules() {
    // Validate sound recognition
    this.addValidationRule('sound_recognition', (interaction) => {
      return interaction.type === 'sound_played' &&
             interaction.correct === true;
    });

    // Validate category exploration
    this.addValidationRule('sound_categories', (interaction) => {
      return interaction.type === 'category_changed';
    });

    // Validate button interactions
    this.addValidationRule('sound_exploration', (interaction) => {
      return interaction.type === 'button_pressed';
    });

    // Validate pattern recognition
    this.addValidationRule('sound_patterns', (interaction) => {
      return interaction.type === 'pattern_completed';
    });
  }

  /**
   * Create interactive sound button elements
   */
  createInteractiveElements() {
    this.createTitleAndInstructions();
    this.createSoundButtons();
    this.createCategorySelector();
    this.createSoundControls();
    this.initializeSoundData();
    this.loadSounds();
  }

  /**
   * Create title and instructions
   */
  createTitleAndInstructions() {
    const { width, height } = this.scale;

    // Main title
    this.add.text(width / 2, 40, '🔊 Sound Explorer!', {
      fontSize: '36px',
      color: '#FFD93D',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Instructions
    const instructionBg = this.add.graphics();
    instructionBg.fillStyle(0xFFFFFF, 0.9);
    instructionBg.fillRoundedRect(width / 2 - 250, 80, 500, 40, 20);
    instructionBg.lineStyle(3, 0xFFD93D, 1);
    instructionBg.strokeRoundedRect(width / 2 - 250, 80, 500, 40, 20);

    this.add.text(width / 2, 100, 'Touch the buttons to hear amazing sounds!', {
      fontSize: '18px',
      color: '#333333',
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Create interactive sound buttons grid
   */
  createSoundButtons() {
    const { width, height } = this.scale;

    // Calculate grid layout
    const gridWidth = this.buttonsPerRow * (this.buttonSize + this.buttonSpacing) - this.buttonSpacing;
    const gridHeight = Math.ceil(12 / this.buttonsPerRow) * (this.buttonSize + this.buttonSpacing); // Support up to 12 buttons

    const startX = (width - gridWidth) / 2 + this.buttonSize / 2;
    const startY = height / 2 - gridHeight / 2 + this.buttonSize / 2 + 50; // Offset for title

    this.soundButtons = [];

    // Create placeholder buttons (will be populated with category data)
    for (let i = 0; i < 12; i++) {
      const row = Math.floor(i / this.buttonsPerRow);
      const col = i % this.buttonsPerRow;

      const x = startX + col * (this.buttonSize + this.buttonSpacing);
      const y = startY + row * (this.buttonSize + this.buttonSpacing);

      // Create button with sticker style
      const buttonGraphics = this.add.graphics();

      // Drop shadow
      buttonGraphics.fillStyle(0x000000, 0.2);
      buttonGraphics.fillRoundedRect(x - this.buttonSize/2 + 2, y - this.buttonSize/2 + 2, this.buttonSize, this.buttonSize, this.buttonSize * 0.2);

      // Main button background (will be updated with sound data)
      buttonGraphics.fillStyle(0xFFFFFF, 0.9);
      buttonGraphics.fillRoundedRect(x - this.buttonSize/2, y - this.buttonSize/2, this.buttonSize, this.buttonSize, this.buttonSize * 0.2);

      // Button border
      buttonGraphics.lineStyle(3, 0xFFD93D, 1);
      buttonGraphics.strokeRoundedRect(x - this.buttonSize/2, y - this.buttonSize/2, this.buttonSize, this.buttonSize, this.buttonSize * 0.2);

      // Make interactive with larger hit area
      const hitAreaSize = this.buttonSize * 1.2;
      buttonGraphics.setInteractive(
        new Phaser.Geom.Rectangle(x - hitAreaSize/2, y - hitAreaSize/2, hitAreaSize, hitAreaSize),
        Phaser.Geom.Rectangle.Contains
      );

      // Add emoji text (will be updated)
      const emojiText = this.add.text(x, y, '🔊', {
        fontSize: `${this.buttonSize * 0.4}px`,
        align: 'center'
      }).setOrigin(0.5);

      // Add sound name text (will be updated)
      const nameText = this.add.text(x, y + this.buttonSize * 0.35, '', {
        fontSize: `${this.buttonSize * 0.15}px`,
        color: '#333333',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 'bold',
        align: 'center'
      }).setOrigin(0.5);

      const soundButton = {
        graphics: buttonGraphics,
        emojiText: emojiText,
        nameText: nameText,
        x: x,
        y: y,
        index: i,
        soundData: null,
        isActive: false
      };

      // Add interaction handlers
      this.setupButtonInteractions(soundButton);

      this.soundButtons.push(soundButton);
    }
  }

  /**
   * Set up button interaction handlers
   */
  setupButtonInteractions(soundButton) {
    const button = soundButton.graphics;

    // Hover effects
    button.on('pointerover', () => {
      if (!soundButton.isActive) {
        this.tweens.add({
          targets: soundButton.graphics,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: 'Power2'
        });
      }
    });

    button.on('pointerout', () => {
      if (!soundButton.isActive) {
        this.tweens.add({
          targets: soundButton.graphics,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2'
        });
      }
    });

    button.on('pointerdown', () => {
      this.playSoundButton(soundButton);
    });
  }

  /**
   * Create category selector buttons
   */
  createCategorySelector() {
    const { width, height } = this.scale;

    const categories = [
      { id: 'animals', name: 'Animals', emoji: '🐾', color: 0xFF9FF3 },
      { id: 'instruments', name: 'Music', emoji: '🎵', color: 0x54A0FF },
      { id: 'letters', name: 'Letters', emoji: '📝', color: 0x5CE600 },
      { id: 'nature', name: 'Nature', emoji: '🌿', color: 0xFFA726 }
    ];

    const categoryY = height * 0.15;
    const categorySpacing = 120;
    const startX = width / 2 - (categories.length - 1) * categorySpacing / 2;

    this.categoryButtons = [];

    categories.forEach((category, index) => {
      const x = startX + index * categorySpacing;

      // Create category button
      const categoryGraphics = this.add.graphics();

      // Button background
      categoryGraphics.fillStyle(category.color, 0.8);
      categoryGraphics.fillRoundedRect(x - 50, categoryY - 25, 100, 50, 15);
      categoryGraphics.lineStyle(3, 0xFFFFFF, 1);
      categoryGraphics.strokeRoundedRect(x - 50, categoryY - 25, 100, 50, 15);

      categoryGraphics.setInteractive(
        new Phaser.Geom.Rectangle(x - 50, categoryY - 25, 100, 50),
        Phaser.Geom.Rectangle.Contains
      );

      // Category emoji and text
      const emojiText = this.add.text(x, categoryY - 8, category.emoji, {
        fontSize: '24px',
        align: 'center'
      }).setOrigin(0.5);

      const nameText = this.add.text(x, categoryY + 8, category.name, {
        fontSize: '12px',
        color: '#FFFFFF',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);

      const categoryButton = {
        graphics: categoryGraphics,
        emojiText: emojiText,
        nameText: nameText,
        category: category,
        isSelected: category.id === this.currentCategory
      };

      // Update visual state
      this.updateCategoryButtonState(categoryButton);

      // Add interaction
      categoryGraphics.on('pointerdown', () => {
        this.selectCategory(category.id);
      });

      // Hover effects
      categoryGraphics.on('pointerover', () => {
        if (!categoryButton.isSelected) {
          this.tweens.add({
            targets: categoryGraphics,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 150,
            ease: 'Power2'
          });
        }
      });

      categoryGraphics.on('pointerout', () => {
        if (!categoryButton.isSelected) {
          this.tweens.add({
            targets: categoryGraphics,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Power2'
          });
        }
      });

      this.categoryButtons.push(categoryButton);
    });
  }

  /**
   * Create sound control buttons
   */
  createSoundControls() {
    const { width, height } = this.scale;

    // Sound toggle button
    this.soundToggleBtn = this.add.graphics();
    this.soundToggleBtn.fillStyle(0xFFD93D, 0.9);
    this.soundToggleBtn.fillRoundedRect(width - 80, height - 80, 60, 60, 15);
    this.soundToggleBtn.lineStyle(3, 0xFFFFFF, 1);
    this.soundToggleBtn.strokeRoundedRect(width - 80, height - 80, 60, 60, 15);

    this.soundToggleBtn.setInteractive(
      new Phaser.Geom.Rectangle(width - 80, height - 80, 60, 60),
      Phaser.Geom.Rectangle.Contains
    );

    this.soundToggleText = this.add.text(width - 50, height - 50, this.soundEnabled ? '🔊' : '🔇', {
      fontSize: '24px',
      align: 'center'
    }).setOrigin(0.5);

    this.soundToggleBtn.on('pointerdown', () => {
      this.toggleSound();
    });

    // Add hover effects
    this.soundToggleBtn.on('pointerover', () => {
      this.tweens.add({
        targets: this.soundToggleBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        ease: 'Power2'
      });
    });

    this.soundToggleBtn.on('pointerout', () => {
      this.tweens.add({
        targets: this.soundToggleBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
      });
    });
  }

  /**
   * Initialize sound data for different categories
   */
  initializeSoundData() {
    this.soundCategories = {
      animals: [
        { name: 'Cat', emoji: '🐱', soundFile: 'cat_meow.mp3', color: 0xFF9FF3 },
        { name: 'Dog', emoji: '🐕', soundFile: 'dog_bark.mp3', color: 0x54A0FF },
        { name: 'Cow', emoji: '🐄', soundFile: 'cow_moo.mp3', color: 0x5CE600 },
        { name: 'Sheep', emoji: '🐑', soundFile: 'sheep_baa.mp3', color: 0xFFA726 },
        { name: 'Duck', emoji: '🦆', soundFile: 'duck_quack.mp3', color: 0xFF9FF3 },
        { name: 'Lion', emoji: '🦁', soundFile: 'lion_roar.mp3', color: 0xFFD93D },
        { name: 'Elephant', emoji: '🐘', soundFile: 'elephant_trumpet.mp3', color: 0xA78BFA },
        { name: 'Monkey', emoji: '🐒', soundFile: 'monkey_chatter.mp3', color: 0xF87171 },
        { name: 'Bird', emoji: '🐦', soundFile: 'bird_chirp.mp3', color: 0x60A5FA },
        { name: 'Frog', emoji: '🐸', soundFile: 'frog_croak.mp3', color: 0x34D399 },
        { name: 'Horse', emoji: '🐎', soundFile: 'horse_neigh.mp3', color: 0xFBBF24 },
        { name: 'Pig', emoji: '🐖', soundFile: 'pig_oink.mp3', color: 0xFB7185 }
      ],
      instruments: [
        { name: 'Piano', emoji: '🎹', soundFile: 'piano_note.mp3', color: 0xFF9FF3 },
        { name: 'Drums', emoji: '🥁', soundFile: 'drum_beat.mp3', color: 0x54A0FF },
        { name: 'Guitar', emoji: '🎸', soundFile: 'guitar_strum.mp3', color: 0x5CE600 },
        { name: 'Trumpet', emoji: '🎺', soundFile: 'trumpet_fanfare.mp3', color: 0xFFA726 },
        { name: 'Flute', emoji: '🪈', soundFile: 'flute_melody.mp3', color: 0xA78BFA },
        { name: 'Violin', emoji: '🎻', soundFile: 'violin_bow.mp3', color: 0xF87171 },
        { name: 'Bell', emoji: '🔔', soundFile: 'bell_ring.mp3', color: 0x60A5FA },
        { name: 'Xylophone', emoji: '🪕', soundFile: 'xylophone_keys.mp3', color: 0x34D399 }
      ],
      letters: [
        { name: 'A says /a/', emoji: '🅰️', soundFile: 'letter_a.mp3', color: 0xFF9FF3 },
        { name: 'B says /b/', emoji: '🅱️', soundFile: 'letter_b.mp3', color: 0x54A0FF },
        { name: 'C says /c/', emoji: '©️', soundFile: 'letter_c.mp3', color: 0x5CE600 },
        { name: 'D says /d/', emoji: '🄳', soundFile: 'letter_d.mp3', color: 0xFFA726 },
        { name: 'E says /e/', emoji: '🅴', soundFile: 'letter_e.mp3', color: 0xA78BFA },
        { name: 'F says /f/', emoji: '🄵', soundFile: 'letter_f.mp3', color: 0xF87171 },
        { name: 'G says /g/', emoji: '🄶', soundFile: 'letter_g.mp3', color: 0x60A5FA },
        { name: 'H says /h/', emoji: '🄷', soundFile: 'letter_h.mp3', color: 0x34D399 }
      ],
      nature: [
        { name: 'Rain', emoji: '🌧️', soundFile: 'rain_patter.mp3', color: 0x60A5FA },
        { name: 'Wind', emoji: '💨', soundFile: 'wind_blow.mp3', color: 0xA78BFA },
        { name: 'Thunder', emoji: '⛈️', soundFile: 'thunder_clap.mp3', color: 0x374151 },
        { name: 'Ocean', emoji: '🌊', soundFile: 'ocean_waves.mp3', color: 0x3B82F6 },
        { name: 'Forest', emoji: '🌲', soundFile: 'forest_ambience.mp3', color: 0x059669 },
        { name: 'Fire', emoji: '🔥', soundFile: 'fire_crackle.mp3', color: 0xDC2626 },
        { name: 'Stream', emoji: '🏞️', soundFile: 'stream_flow.mp3', color: 0x0891B2 },
        { name: 'Birds', emoji: '🐦', soundFile: 'birds_singing.mp3', color: 0x7C3AED }
      ]
    };
  }

  /**
   * Load sound assets
   */
  loadSounds() {
    // Note: In a real implementation, you would load actual sound files
    // For now, we'll simulate sound loading
    Object.values(this.soundCategories).forEach(sounds => {
      sounds.forEach(sound => {
        // Preload sound files (would be actual audio files)
        // this.load.audio(sound.name.toLowerCase(), `assets/sounds/${sound.soundFile}`);
      });
    });
  }

  /**
   * Select a sound category
   */
  selectCategory(categoryId) {
    if (this.currentCategory === categoryId) return;

    this.currentCategory = categoryId;

    // Update category button states
    this.categoryButtons.forEach(button => {
      button.isSelected = button.category.id === categoryId;
      this.updateCategoryButtonState(button);
    });

    // Update sound buttons for new category
    this.updateSoundButtons();

    // Trigger interaction validation
    this.onElementInteraction('category_selector', 'category_changed', {
      categoryId: categoryId,
      categoryName: this.getCategoryName(categoryId)
    });

    this.showFeedback(`Exploring ${this.getCategoryName(categoryId)} sounds! 🎵`, 'info', 2000);
  }

  /**
   * Update category button visual states
   */
  updateCategoryButtonState(button) {
    const alpha = button.isSelected ? 1 : 0.7;
    const scale = button.isSelected ? 1.05 : 1;

    button.graphics.setAlpha(alpha);
    button.emojiText.setAlpha(alpha);
    button.nameText.setAlpha(alpha);

    button.graphics.setScale(scale);
    button.emojiText.setScale(scale);
    button.nameText.setScale(scale);
  }

  /**
   * Update sound buttons for current category
   */
  updateSoundButtons() {
    const categorySounds = this.soundCategories[this.currentCategory] || [];

    this.soundButtons.forEach((button, index) => {
      if (index < categorySounds.length) {
        const soundData = categorySounds[index];
        button.soundData = soundData;
        button.emojiText.setText(soundData.emoji);
        button.nameText.setText(soundData.name);

        // Update button color
        const graphics = this.add.graphics();
        graphics.fillStyle(soundData.color, 0.9);
        graphics.fillRoundedRect(
          button.x - this.buttonSize/2,
          button.y - this.buttonSize/2,
          this.buttonSize,
          this.buttonSize,
          this.buttonSize * 0.2
        );
        graphics.lineStyle(3, 0xFFFFFF, 1);
        graphics.strokeRoundedRect(
          button.x - this.buttonSize/2,
          button.y - this.buttonSize/2,
          this.buttonSize,
          this.buttonSize,
          this.buttonSize * 0.2
        );

        // Replace the old graphics
        button.graphics.destroy();
        button.graphics = graphics;

        // Re-setup interactions
        this.setupButtonInteractions(button);

        // Make visible
        button.emojiText.setVisible(true);
        button.nameText.setVisible(true);
        graphics.setVisible(true);
      } else {
        // Hide unused buttons
        button.soundData = null;
        button.emojiText.setVisible(false);
        button.nameText.setVisible(false);
        button.graphics.setVisible(false);
      }
    });
  }

  /**
   * Play sound when button is pressed
   */
  playSoundButton(soundButton) {
    if (!soundButton.soundData || !this.soundEnabled) return;

    this.totalRounds++;

    // Visual feedback - button press animation
    this.tweens.add({
      targets: soundButton.graphics,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // Play sound (in real implementation)
    if (this.game.audioManager) {
      // this.game.audioManager.playSound(soundButton.soundData.soundFile);
      console.log(`Playing sound: ${soundButton.soundData.name}`);
    }

    // Trigger interaction validation
    this.onElementInteraction('sound_button', 'button_pressed', {
      soundName: soundButton.soundData.name,
      soundCategory: this.currentCategory,
      buttonIndex: soundButton.index
    });

    // Show feedback
    this.showFeedback(`You heard a ${soundButton.soundData.name}! ${soundButton.soundData.emoji}`, 'success', 1500);

    // Sound wave animation
    this.createSoundWaveAnimation(soundButton.x, soundButton.y);
  }

  /**
   * Create sound wave animation effect
   */
  createSoundWaveAnimation(x, y) {
    const waveGraphics = this.add.graphics();
    waveGraphics.lineStyle(3, 0xFFD93D, 0.8);

    // Animate expanding circles
    this.tweens.add({
      targets: waveGraphics,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onUpdate: (tween) => {
        const progress = tween.progress;
        waveGraphics.clear();
        waveGraphics.lineStyle(3, 0xFFD93D, 0.8 - progress * 0.8);

        const radius = progress * 60;
        waveGraphics.strokeCircle(x, y, radius);
      },
      onComplete: () => {
        waveGraphics.destroy();
      }
    });
  }

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.soundToggleText.setText(this.soundEnabled ? '🔊' : '🔇');

    this.showFeedback(
      this.soundEnabled ? 'Sound is now ON! 🔊' : 'Sound is now OFF 🔇',
      'info',
      1500
    );
  }

  /**
   * Get category display name
   */
  getCategoryName(categoryId) {
    const names = {
      animals: 'Animal',
      instruments: 'Musical Instrument',
      letters: 'Letter',
      nature: 'Nature'
    };
    return names[categoryId] || categoryId;
  }

  /**
   * Create tutorial steps for sound exploration
   */
  createTutorialSteps() {
    return [
      {
        message: "Welcome to Sound Explorer! 🔊",
        highlightElement: null
      },
      {
        message: "Choose a category of sounds to explore",
        highlightElement: this.categoryButtons[0]
      },
      {
        message: "Touch the buttons to hear amazing sounds!",
        highlightElement: this.soundButtons[0]
      },
      {
        message: "Use the speaker button to turn sounds on or off",
        highlightElement: this.soundToggleBtn
      }
    ];
  }

  /**
   * Get sound-specific statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      currentCategory: this.currentCategory,
      soundEnabled: this.soundEnabled,
      buttonsPressed: this.interactionHistory.filter(h => h.type === 'button_pressed').length,
      categoriesExplored: this.interactionHistory.filter(h => h.type === 'category_changed').length
    };
  }

  /**
   * Override restart to reset sound game state
   */
  restartGame() {
    // Reset game state
    this.currentCategory = 'animals';
    this.activeButton = null;
    this.totalRounds = 0;
    this.correctInteractions = 0;

    // Reset category buttons
    this.categoryButtons.forEach(button => {
      button.isSelected = button.category.id === this.currentCategory;
      this.updateCategoryButtonState(button);
    });

    // Reset sound buttons
    this.updateSoundButtons();

    // Reset sound toggle
    this.soundEnabled = true;
    this.soundToggleText.setText('🔊');

    super.restartGame();
  }
}