/**
 * GameMenuScene - GCompris-style main menu with category-based game selection
 * Features layered background, animal category icons, square game cards, and bottom controls
 */
import { InputManager } from '../utils/InputManager.js';

export class GameMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameMenu' });

    // Category definitions with icons (adapted from GCompris)
    this.categories = [
      {
        id: 'favorite',
        name: 'Favorite',
        icon: 'all.svg'
      },
      {
        id: 'computer',
        name: 'Computer',
        icon: 'computer.svg'
      },
      {
        id: 'discovery',
        name: 'Discovery',
        icon: 'discovery.svg'
      },
      {
        id: 'sciences',
        name: 'Sciences',
        icon: 'sciences.svg'
      },
      {
        id: 'fun',
        name: 'Fun',
        icon: 'fun.svg'
      },
      {
        id: 'math',
        name: 'Math',
        icon: 'math.svg'
      },
      {
        id: 'puzzle',
        name: 'Puzzle',
        icon: 'puzzle.svg'
      },
      {
        id: 'reading',
        name: 'Reading',
        icon: 'reading.svg'
      },
      {
        id: 'strategy',
        name: 'Strategy',
        icon: 'strategy.svg'
      },
      {
        id: 'search',
        name: 'Search',
        icon: 'search-icon.svg'
      }
    ];

    // Game definitions with metadata
    this.allGames = [
      {
        scene: 'AdjacentNumbers',
        name: 'Adjacent Numbers',
        icon: 'adjacent_numbers.svg',
        difficulty: 2,
        category: 'math'
      },
      {
        scene: 'SmallnumbersGame',
        name: 'Numbers with Dice',
        icon: 'dice1.svg',
        difficulty: 2,
        category: 'math'
      },
      {
        scene: 'Smallnumbers2Game',
        name: 'Numbers with Dominoes',
        icon: 'smallnumbers2.svg',
        difficulty: 2,
        category: 'math'
      },
      {
        scene: 'LearnQuantitiesGame',
        name: 'Learn Quantities',
        icon: 'learn_quantities.svg',
        difficulty: 1,
        category: 'math'
      },
      {
        scene: 'LearnAdditionsGame',
        name: 'Learn Addition',
        icon: 'learn_additions.svg',
        difficulty: 2,
        category: 'math'
      },
      {
        scene: 'LearnSubtractionsGame',
        name: 'Learn Subtraction',
        icon: 'learn_subtractions.svg',
        difficulty: 2,
        category: 'math'
      },
      {
        scene: 'VerticalAdditionGame',
        name: 'Vertical Addition',
        icon: 'vertical_addition.svg',
        difficulty: 3,
        category: 'math'
      },
      {
        scene: 'Guesscount',
        name: 'Guesscount Math',
        icon: 'guesscount.svg',
        difficulty: 3,
        category: 'math'
      },
      {
        scene: 'MemoryImageGame',
        name: 'Memory Images',
        icon: 'memory.svg',
        difficulty: 2,
        category: 'memory'
      },
      {
        scene: 'MemorySoundGame',
        name: 'Memory Sounds',
        icon: 'memory-sound.svg',
        difficulty: 2,
        category: 'memory'
      },
      {
        scene: 'BabyMatchGame',
        name: 'Baby Match',
        icon: 'babymatch.svg',
        difficulty: 1,
        category: 'logic'
      },
      {
        scene: 'ColorMixGame',
        name: 'Color Mix',
        icon: 'color_mix.svg',
        difficulty: 2,
        category: 'logic'
      },
      {
        scene: 'HexagonGame',
        name: 'Hexagon',
        icon: 'hexagon.svg',
        difficulty: 2,
        category: 'logic'
      },
      {
        scene: 'CheckersGame',
        name: 'Checkers',
        icon: 'checkers.svg',
        difficulty: 4,
        category: 'strategy'
      },
      {
        scene: 'GeographyMapGame',
        name: 'Geography Map',
        icon: 'geography.svg',
        difficulty: 2,
        category: 'world'
      },
      {
        scene: 'SoundButtonGame',
        name: 'Sound Buttons',
        icon: 'instruments.svg',
        difficulty: 1,
        category: 'discovery'
      },
      {
        scene: 'LearnDigitsGame',
        name: 'Learn Digits',
        icon: 'learn_digits.svg',
        difficulty: 1,
        category: 'math'
      },
      {
        scene: 'AlgebraPlusGame',
        name: 'Addition Practice',
        icon: 'algebra_plus.svg',
        difficulty: 3,
        category: 'math'
      },
      {
        scene: 'AlgebraMinusGame',
        name: 'Subtraction Practice',
        icon: 'algebra_minus.svg',
        difficulty: 3,
        category: 'math'
      },
      {
        scene: 'AlgebraByGame',
        name: 'Multiplication Practice',
        icon: 'algebra_by.svg',
        difficulty: 4,
        category: 'math'
      },
      {
        scene: 'AlgebraDivGame',
        name: 'Division Practice',
        icon: 'algebra_div.svg',
        difficulty: 4,
        category: 'math'
      },
      {
        scene: 'MoneyGame',
        name: 'Money',
        icon: 'money.svg',
        difficulty: 2,
        category: 'math'
      },
      {
        scene: 'MoneyCentsGame',
        name: 'Money with Cents',
        icon: 'money_cents.svg',
        difficulty: 3,
        category: 'math'
      },
      {
        scene: 'MoneyBackGame',
        name: 'Give Change',
        icon: 'money_back.svg',
        difficulty: 3,
        category: 'math'
      },
      {
        scene: 'ClickOnLetterGame',
        name: 'Click on a Lowercase Letter',
        icon: 'click_on_letter.svg',
        difficulty: 2,
        category: 'reading'
      },
      {
        scene: 'ClickOnLetterUpGame',
        name: 'Click on an Uppercase Letter',
        icon: 'click_on_letter_up.svg',
        difficulty: 2,
        category: 'reading'
      },
      {
        scene: 'AlphabetSequenceGame',
        name: 'Alphabet Sequence',
        icon: 'alphabet-sequence.svg',
        difficulty: 2,
        category: 'reading'
      },
      {
        scene: 'LetterInWordGame',
        name: 'Letter in Word',
        icon: 'letter-in-word.svg',
        difficulty: 2,
        category: 'reading'
      },
      {
        scene: 'MissingLetterGame',
        name: 'Missing Letter',
        icon: 'missing-letter.svg',
        difficulty: 3,
        category: 'reading'
      },
      {
        scene: 'ReadingHGame',
        name: 'Horizontal Reading',
        icon: 'readingh.svg',
        difficulty: 2,
        category: 'reading'
      },
      {
        scene: 'ReadingVGame',
        name: 'Vertical Reading',
        icon: 'readingv.svg',
        difficulty: 2,
        category: 'reading'
      },
      {
        scene: 'WordsGame',
        name: 'Falling Words',
        icon: 'wordsgame.svg',
        difficulty: 3,
        category: 'reading'
      },
      {
        scene: 'TicTacToeGame',
        name: 'Tic Tac Toe',
        icon: 'tic_tac_toe.svg',
        difficulty: 1,
        category: 'strategy'
      },
      {
        scene: 'TicTacToeTwoPlayerGame',
        name: 'Tic Tac Toe (2P)',
        icon: 'tic_tac_toe.svg',
        difficulty: 1,
        category: 'strategy'
      },
      {
        scene: 'Align4Game',
        name: 'Connect Four',
        icon: 'align4.svg',
        difficulty: 2,
        category: 'strategy'
      },
      {
        scene: 'Align4TwoPlayerGame',
        name: 'Connect Four (2P)',
        icon: 'align4.svg',
        difficulty: 2,
        category: 'strategy'
      }
    ];

    // Current state
    this.currentCategory = 'all'; // 'all' or category id
    this.categoryButtons = [];
    this.gameCards = [];
    this.bottomControls = [];
    this.activityConfigMode = false;
  }

  init(data) {
    this.app = data.app;
  }

  preload() {
    // Get the actual game dimensions
    const { width, height } = this.game.config;

    // Load SVG at the game's resolution so it isn't blurry
    this.load.svg('menu-background', 'assets/game-icons/background.svg', {
        width: width,
        height: height
    });
    
    // Load category animal icons (keeping existing for now)
    this.categories.forEach(category => {
      this.load.svg(category.icon.replace('.svg', ''), `assets/category-icons/${category.icon}`);
    });
    
    // Load game icons
    this.allGames.forEach(game => {
      this.load.svg(game.icon.replace('.svg', ''), `assets/game-icons/${game.icon}`);
    });

    // Load UI control icons
    const uiIcons = [
      { name: 'exit.svg', path: 'category-icons' },
      { name: 'settings.svg', path: 'category-icons' },
      { name: 'help.svg', path: 'category-icons' },
      { name: 'bar_about.svg', path: 'game-icons', key: 'about' },
      { name: 'bar_activity_config.svg', path: 'game-icons', key: 'activityConfig' }
    ];
    uiIcons.forEach(icon => {
      const key = icon.key || icon.name.replace('.svg', '');
      this.load.svg(key, `assets/${icon.path}/${icon.name}`);
    });

    // Load difficulty stars
    for (let i = 1; i <= 3; i++) {
      this.load.svg(`difficulty${i}`, `assets/category-icons/difficulty${i}.svg`);
    }
  }

  async create() {
    // Initialize input manager for this scene
    if (this.app) {
      this.app.inputManager = new InputManager(this);

      // Preload common sounds including the click sound
      await this.app.audioManager.preloadCommonSounds();

      // Resume audio context on first interaction to satisfy browser security
      this.input.once('pointerdown', () => {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume();
        }
      });
    }

    const { width, height } = this.game.config;

    // Create layered background environment
    this.createBackground(width, height);

    // Create title in top area (above category bar)
    // this.createTitle(width, height);

    // Clear and recreate category bar with animal icons
    this.clearCategoryButtons();
    this.createCategoryBar(width, height);

    // Create game grid area (responsive)
    this.createGameGrid(width, height);

    // Clear and recreate bottom control bar
    this.clearBottomControls();
    this.createBottomControls(width, height);

    // Set up keyboard navigation
    this.setupKeyboardNavigation();

    this.searchInput = document.getElementById('search-input');
    this.searchInput.style.display = 'none';

    this.searchInput.addEventListener('input', () => {
        this.filterGamesBySearch(this.searchInput.value);
    });

    // Start with all games visible
    this.filterGamesByCategory('all');

    // Set initial focus (only if cards exist)
    this.currentFocusIndex = 0;
    if (this.gameCards && this.gameCards.length > 0) {
      this.focusGameCard(0);
    }
    this.input.on('wheel', this.scrollContent, this);
  }

  filterGamesBySearch(searchText) {
    const lowerCaseSearchText = searchText.toLowerCase();
    const visibleGames = this.allGames.filter(game => game.name.toLowerCase().includes(lowerCaseSearchText));

    // Calculate grid layout
    const gridWidth = this.gridConfig.areaRight - this.gridConfig.areaLeft;
    const cols = Math.floor(gridWidth / (this.gridConfig.cardSize + this.gridConfig.spacing));

    // Position visible cards
    visibleGames.forEach((game, index) => {
      const card = this.gameCards.find(c => c.gameData.scene === game.scene);
      if (card) {
        const row = Math.floor(index / cols);
        const col = index % cols;

        const totalWidth = cols * this.gridConfig.cardSize + (cols - 1) * this.gridConfig.spacing;
        const startX = this.gridConfig.areaLeft + (gridWidth - totalWidth) / 2 + this.gridConfig.cardSize / 2;
        const startY = this.gridConfig.areaTop + this.gridConfig.cardSize / 2;

        const x = startX + col * (this.gridConfig.cardSize + this.gridConfig.spacing);
        const y = startY + row * (this.gridConfig.cardSize * 1.7 + this.gridConfig.spacing);


        card.setPosition(x, y);
        card.setVisible(true);

        // Pop effect animation (scale from 0 with Back.easeOut)
        card.setScale(0);
        card.setAlpha(1);
        this.tweens.add({
          targets: card,
          scale: 1,
          duration: 400,
          delay: index * 80,
          ease: 'Back.easeOut'
        });
      }
    });

    // Hide non-visible cards
    this.allGames.forEach(game => {
      if (!visibleGames.includes(game)) {
        const card = this.gameCards.find(c => c.gameData.scene === game.scene);
        if (card) {
          card.setVisible(false);
        }
      }
    });
  }

  scrollContent(pointer, gameObjects, deltaX, deltaY, deltaZ) {
    if (this.gridContainer) {
      this.gridContainer.y -= deltaY * 0.5; // Adjust the scroll speed

      // Calculate the bounds
      const visibleCards = this.gameCards.filter(card => card.visible);
      if (visibleCards.length === 0) return;

      const gridWidth = this.gridConfig.areaRight - this.gridConfig.areaLeft;
      const cols = Math.floor(gridWidth / (this.gridConfig.cardSize + this.gridConfig.spacing));
      const rows = Math.ceil(visibleCards.length / cols);
      const gridHeight = rows * (this.gridConfig.cardSize * 1.7 + this.gridConfig.spacing);
      
      const min_y = 0;
      const max_y = -(gridHeight - (this.gridConfig.areaBottom - this.gridConfig.areaTop));


      // Clamp the gridContainer position
      if (this.gridContainer.y > min_y) {
        this.gridContainer.y = min_y;
      }
      if (this.gridContainer.y < max_y) {
          this.gridContainer.y = max_y;
      }
    }
  }

  /**
   * Create GCompris-style background using SVG asset
   */
  createBackground(width, height) {
    // 1. Place the image at the bottom center (height) instead of the middle
    this.backgroundImage = this.add.image(width / 2, height, 'menu-background');
    
    // 2. Anchor at bottom center
    this.backgroundImage.setOrigin(0.5, 1);

    // 3. Scale width to match screen exactly, height will follow aspect ratio
    const scale = width / this.backgroundImage.width;
    this.backgroundImage.setScale(scale);
    
    // 4. Ensure it is behind everything
    this.backgroundImage.setDepth(-10);

    // 5. Add a solid sky color behind the image just in case the SVG height 
    // is shorter than the screen height on tall displays
    this.cameras.main.setBackgroundColor('#87CEEB'); 
  }


  /**
   * Create title area
   */


  /**
   * Clear existing category buttons to prevent duplicates on scene restart
   */
  clearCategoryButtons() {
    if (this.categoryButtons) {
      this.categoryButtons.forEach(btn => {
        if (btn.container && btn.container.destroy) btn.container.destroy();
        if (btn.card && btn.card.destroy) btn.card.destroy();
        if (btn.shadow && btn.shadow.destroy) btn.shadow.destroy();
        if (btn.icon && btn.icon.destroy) btn.icon.destroy();

      });
    }
    this.categoryButtons = [];
  }






  /**
   * Create GCompris-style category bar with floating icon cards
   */
  createCategoryBar(width, height) {
    // Fixed container dimensions
    const barHeight = 110;
    const barY = 85; // Move it slightly higher up

    // Compute the width of the entire bar for categories.
    const barWidth = width - 40; // 20px margin on each side

    // Calculate cell dimensions by dividing barWidth by the number of categories.
    const totalCategoriesInBar = this.categories.length;
    const cellWidth = Math.floor(barWidth / totalCategoriesInBar);
    
    // Center the grid
    const gridStartX = (width - barWidth) / 2;

    // Create category buttons
    this.categories.forEach((category, index) => {
      const x = gridStartX + (index * cellWidth) + (cellWidth / 2);
      const y = barY;

      const rectWidth = cellWidth;
      const rectHeight = rectWidth;
      const rectX = x - rectWidth / 2;
      const rectY = y - rectHeight / 2;
      const rectRadius = 10;

      const card = this.add.graphics();
      card.setDepth(6);
      card.lineStyle(0, 0xFF0000); // No border
      card.strokeRoundedRect(rectX, rectY, rectWidth, rectHeight, rectRadius);

      card.setInteractive(new Phaser.Geom.Rectangle(rectX, rectY, rectWidth, rectHeight), Phaser.Geom.Rectangle.Contains);

      // Category icon (responsive sizing)
      const icon = this.add.sprite(x, y, category.icon.replace('.svg', ''));
      icon.setTint(0xFFFFFF);

      // Calculate a size that fits inside the box with some padding, maintaining aspect ratio
      const padding = rectWidth * 0.2; // 20% padding to be safe
      const maxIconWidth = rectWidth - padding;
      const maxIconHeight = rectHeight - padding;
      const scale = Math.min(maxIconWidth / icon.width, maxIconHeight / icon.height);
      icon.setScale(scale);
      icon.setDepth(7);

      // Hover effects
      card.on('pointerover', () => {
        card.clear();
        card.fillStyle(0xFFFFFF, 0.1);
        card.lineStyle(2, 0xFACA2A); // Lalela Yellow highlight
        card.strokeRoundedRect(rectX, rectY, rectWidth, rectHeight, rectRadius);
        icon.setScale(scale * 1.1);
      });

      card.on('pointerout', () => {
        if (this.currentCategory !== category.id) {
          // Reset to normal appearance
          card.clear();
          card.lineStyle(0, 0xFF0000);
          card.strokeRoundedRect(rectX, rectY, rectWidth, rectHeight, rectRadius);
          icon.setScale(scale);
        }
      });

      card.on('pointerdown', () => {
        this.selectCategory(category.id);
      });

      this.categoryButtons.push({
        card: card,
        icon: icon,
        category: category,
        originalY: y,
        centerX: x,
        centerY: y,
        rectConfig: { x: rectX, y: rectY, width: rectWidth, height: rectHeight, radius: rectRadius }
      });
    });
  }

  /**
   * Select a category and filter games
   */
  selectCategory(categoryId) {
    this.currentCategory = categoryId;

    if (categoryId === 'search') {
      this.searchInput.style.display = 'block';
      if(this.gridContainer) this.gridContainer.setVisible(false);
      this.searchInput.focus();
    } else {
      this.searchInput.style.display = 'none';
      if(this.gridContainer) this.gridContainer.setVisible(true);
      this.filterGamesByCategory(categoryId);
    }

    // Update category button appearances with bounce animation
    this.categoryButtons.forEach(btn => {
      const { x, y, width, height, radius } = btn.rectConfig;
      if (btn.category.id === categoryId) {
        // Selected state: redraw with Lalela Yellow and bounce animation
        btn.card.clear();
        btn.card.fillStyle(0xFACA2A, 0.2); // Light yellow fill
        btn.card.fillRoundedRect(x, y, width, height, radius);
        btn.card.lineStyle(2, 0xFACA2A); // Lalela Yellow border
        btn.card.strokeRoundedRect(x, y, width, height, radius);

        this.playStarAnimation(btn.centerX, btn.centerY);

        // Bounce animation (wiggle effect)
        this.tweens.add({
          targets: [btn.icon],
          y: btn.originalY - 8,
          duration: 150,
          yoyo: true,
          repeat: 1,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Slight continuous wiggle
            this.tweens.add({
              targets: btn.icon,
              angle: 3,
              duration: 120,
              yoyo: true,
              repeat: 2,
              ease: 'Sine.easeInOut'
            });
          }
        });
      } else {
        // Unselected state: reset to normal appearance
        btn.card.clear();
        btn.card.lineStyle(0, 0xFF0000); // Remove border
        btn.card.strokeRoundedRect(x, y, width, height, radius);
        btn.icon.setAngle(0); // Reset rotation
        // Stop any ongoing tweens
        this.tweens.killTweensOf([btn.icon]);
      }
    });

    // Play selection sound (if audio is available)
    if (this.app && this.app.audioManager) {
      this.app.audioManager.playClickSound();
    }
  }

  /**
   * Play a star burst animation at a given position
   */
  playStarAnimation(x, y) {
    const numStars = 12;
    for (let i = 0; i < numStars; i++) {
      const star = this.add.sprite(x, y, 'difficulty1');
      star.setTint(0xFACA2A);
      star.setDepth(100); // Ensure stars are on top
      star.setScale(1.2); // Make stars initially bigger

      const angle = Phaser.Math.DegToRad(i * (360 / numStars));
      const distance = Phaser.Math.Between(80, 150); // Increase travel distance

      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        scale: 0,
        alpha: 0,
        angle: 360,
        duration: 1200, // Make animation slower
        ease: 'Cubic.easeOut',
        onComplete: () => {
          star.destroy();
        }
      });
    }
  }

  /**
   * Create responsive game grid
   */
  createGameGrid(width, height) {
    // Clear existing game cards to prevent duplicates when scene is restarted
    if (this.gameCards) {
      this.gameCards.forEach(card => {
        if (card && card.destroy) {
          card.destroy();
        }
      });
    }
    this.gameCards = [];
    this.gridContainer = this.add.container(0, 0);

    // Calculate responsive grid
    const cardSize = Math.min(200, width / 6);
    const gridAreaTop = 270;
    const gridAreaBottom = height - 120;
    const gridAreaHeight = gridAreaBottom - gridAreaTop;

    this.gridConfig = {
      cardSize: cardSize,
      spacing: 30,
      areaTop: gridAreaTop,
      areaBottom: gridAreaBottom,
      areaLeft: 15,
      areaRight: width - 15
    };

    // Create game cards (initially hidden, will be shown by filter)
    this.allGames.forEach(game => {
      this.createGameCard(game);
    });
  }

  /**
   * Create individual game card (Sticker Style)
   */
      createGameCard(game) {
      const cardWidth = this.gridConfig.cardSize;
      const cardHeight = cardWidth * 1.5; 
      const card = this.add.container(0, 0);
      card.setVisible(false);
  
      // 1. Column Background
      const background = this.add.graphics();
      background.fillStyle(0xFFFFFF, 0.5); 
      background.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
      card.add(background);
  
      // 2. Game Icon
      const icon = this.add.sprite(0, -cardHeight * 0.15, game.icon.replace('.svg', ''));
      const iconPadding = cardWidth * 0.2; // Increased padding for a cleaner look
      const maxIconWidth = cardWidth - iconPadding;
      const maxIconHeight = cardHeight * 0.55 - iconPadding; 
      const iconScale = Math.min(maxIconWidth / icon.width, maxIconHeight / icon.height);
      icon.setScale(iconScale);
      card.add(icon);
  
      // --- 3. FIXED NAME TEXT ---
      // Calculate responsive font size (GCompris uses roughly 12% of card width)
      const dynamicFontSize = Math.floor(cardWidth * 0.16); 
      
      const nameText = this.add.text(0, cardHeight * 0.32, game.name, {
          fontSize: `${dynamicFontSize}px`,
          color: '#101012',
          // GCompris uses "Nunito" or "Andika". Fredoka One is okay, 
          // but 'Nunito' matches the reference image better for legibility.
          fontFamily: 'Fredoka One, cursive', 
          align: 'center',
          fontStyle: 'normal',
          wordWrap: { width: cardWidth * 0.9 } // 10% side margins
      }).setOrigin(0.5);
      
      // Add subtle line spacing for readability
      nameText.setLineSpacing(2);
      card.add(nameText);
  
      // 4. Icons (Fav Sun & Difficulty)
      const iconSize = cardWidth * 0.2; // Responsive icon sizing
      
      const favSun = this.add.sprite(cardWidth/2 - iconSize/2 - 5, -cardHeight/2 + iconSize/2 + 5, 'difficulty1');
      favSun.setDisplaySize(iconSize, iconSize).setAlpha(0.7);
      card.add(favSun);
  
      const difficultyIcon = this.add.sprite(-cardWidth/2 + iconSize/2 + 5, -cardHeight/2 + iconSize/2 + 5, `difficulty${game.difficulty}`);
      difficultyIcon.setDisplaySize(iconSize, iconSize).setTint(0xFACA2A);
      card.add(difficultyIcon);
  
      // Rest of your interactive logic...
      card.setSize(cardWidth, cardHeight);
      card.setInteractive();
      // ...
      card.on('pointerover', () => {
          background.clear();
          background.fillStyle(0xFFFFFF, 0.8); // Brighter highlight
          background.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
          background.lineStyle(2, 0xFFFFFF, 1);
          background.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
      });
  
      card.on('pointerout', () => {
          background.clear();
          background.fillStyle(0xFFFFFF, 0.5);
          background.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
      });
  
      card.on('pointerdown', () => {
          // Play click sound
          if (this.app && this.app.audioManager) {
              this.app.audioManager.playClickSound();
          }

          this.playStarAnimation(card.x, card.y); // Use the particle effect you wrote
          this.time.delayedCall(200, () => this.startGame(game.scene));
      });
  
      card.gameData = game;
      this.gridContainer.add(card);
      this.gameCards.push(card);
  }
  /**
   * Create difficulty stars for game cards (Juicy Style)
   */
  createDifficultyStars(difficulty, cardSize) {
    const stars = [];

    for (let i = 1; i <= difficulty; i++) {
      const star = this.add.sprite(0, 0, `difficulty${Math.min(i, 3)}`);
      star.setScale(0.8); // Larger for more visibility
      star.setTint(0xFACA2A); // Lalela Yellow instead of generic gold
      stars.push(star);
    }

    return stars;
  }

  /**
   * Filter games by category
   */
  filterGamesByCategory(categoryId) {
    if (this.gridContainer) {
      this.gridContainer.y = 0;
    }
    this.searchInput.style.display = 'none';
    let visibleGames;

    if (categoryId === 'all' || categoryId === 'favorite') {
      visibleGames = this.allGames;
    } else {
      visibleGames = this.allGames.filter(game => game.category === categoryId);
    }

    // Calculate grid layout
    const gridWidth = this.gridConfig.areaRight - this.gridConfig.areaLeft;
    const cols = Math.floor(gridWidth / (this.gridConfig.cardSize + this.gridConfig.spacing));
    const rows = Math.ceil(visibleGames.length / cols);

    // Position visible cards
    visibleGames.forEach((game, index) => {
      const card = this.gameCards.find(c => c.gameData.scene === game.scene);
      if (card) {
        const row = Math.floor(index / cols);
        const col = index % cols;

        const totalWidth = cols * this.gridConfig.cardSize + (cols - 1) * this.gridConfig.spacing;
        const startX = this.gridConfig.areaLeft + (gridWidth - totalWidth) / 2 + this.gridConfig.cardSize / 2;
        const startY = this.gridConfig.areaTop + this.gridConfig.cardSize / 2;

        const x = startX + col * (this.gridConfig.cardSize + this.gridConfig.spacing);
        const y = startY + row * (this.gridConfig.cardSize * 1.7 + this.gridConfig.spacing);


        card.setPosition(x, y);
        card.setVisible(true);

        // Pop effect animation (scale from 0 with Back.easeOut)
        card.setScale(0);
        card.setAlpha(1);
        this.tweens.add({
          targets: card,
          scale: 1,
          duration: 400,
          delay: index * 80,
          ease: 'Back.easeOut'
        });
      }
    });

    // Hide non-visible cards
    this.allGames.forEach(game => {
      if (!visibleGames.includes(game)) {
        const card = this.gameCards.find(c => c.gameData.scene === game.scene);
        if (card) {
          card.setVisible(false);
        }
      }
    });
  }

  /**
   * Clear existing bottom controls to prevent duplicates on scene restart
   */
  clearBottomControls() {
    if (this.bottomControls) {
      this.bottomControls.forEach(control => {
        if (control.button && control.button.destroy) control.button.destroy();
        if (control.icon && control.icon.destroy) control.icon.destroy();
        if (control.label && control.label.destroy) control.label.destroy();
      });
    }
    this.bottomControls = [];
  }

  /**
   * Create bottom control bar (3D Toy Style)
   */
  createBottomControls(width, height) {
    const barY = height - 55;
    const buttonSize = 72;
    const spacing = 95;
    const buttonRadius = 10;

    let controls = [
        { icon: 'help', action: 'help', color: 0x00B378 },
        { icon: 'settings', action: 'settings', color: 0x0062FF },
        { icon: 'activityConfig', action: 'activityConfig', color: 0x904DB9 },
        { icon: 'about', action: 'about', color: 0xF05A28 }
    ];

    if (!(this.sys.game.device.os.android || this.sys.game.device.os.iOS)) {
        controls.push({ icon: 'exit', action: 'exit', color: 0xE32528 });
    }

    const totalWidth = (controls.length * buttonSize) + ((controls.length - 1) * (spacing - buttonSize));
    const startX = (width - totalWidth) / 2;

    controls.forEach((control, index) => {
        const x = startX + index * spacing;
        
        const button = this.add.graphics();
        if (control.action === 'activityConfig' && this.activityConfigMode) {
            button.fillStyle(0xFACA2A); // Active color
        } else {
            button.fillStyle(control.color);
        }
        button.fillRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
        button.lineStyle(2, 0xFFFFFF, 0.8);
        button.strokeRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, buttonRadius);

        button.setInteractive(new Phaser.Geom.Rectangle(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);
        
        const icon = this.add.sprite(x, barY, control.icon);
        icon.setScale((buttonSize * 0.6) / icon.width);
        icon.setTint(0xFFFFFF);

        button.on('pointerdown', () => {
            if (this.app?.audioManager) this.app.audioManager.playClickSound();
            icon.y += 2;
            this.handleControlAction(control.action);
            this.time.delayedCall(150, () => {
                this.clearBottomControls();
                this.createBottomControls(width, height);
            });
        });

        button.on('pointerover', () => {
            this.tweens.add({ targets: icon, scale: (buttonSize * 0.65) / icon.width, duration: 100 });
        });
        button.on('pointerout', () => {
            this.tweens.add({ targets: icon, scale: (buttonSize * 0.6) / icon.width, duration: 100 });
        });

        this.bottomControls.push({
            button: button,
            icon: icon,
            action: control.action
        });

        button.setDepth(100);
        icon.setDepth(101);
    });
  }

  /**
   * Handle bottom control actions
   */
  handleControlAction(action) {
    switch (action) {
      case 'activityConfig':
        // Toggles between play mode and configuration mode (the purple button)
        this.activityConfigMode = !this.activityConfigMode;
        console.log('Activity Settings Mode Toggled:', this.activityConfigMode);
        // Re-creating controls is handled in pointerdown now to reflect the state change
        break;
      case 'exit':
        if (window.confirm('Quit GCompris?')) window.close();
        break;
      case 'about':
        // Shows the GCompris About dialog
        console.log('About GCompris clicked');
        this.showAboutDialog(); // You would create this method
        break;
      case 'help':
        this.showHelpModal();
        break;
      case 'settings':
        console.log('Main Configuration clicked');
        break;

    }
  }

  /**
   * Show help modal
   */
  showHelpModal() {
    const { width, height } = this.game.config;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.closeHelpModal());

    // Modal background
    const modalBg = this.add.rectangle(width / 2, height / 2, 500, 400, 0xFDFAED);
    modalBg.setStrokeStyle(4, 0xFACA2A);

    // Help content
    const helpText = this.add.text(width / 2, height / 2, 'Welcome to Lalela Web Games!\n\n' +
      '• Choose a category by clicking the animal icons\n' +
      '• Click on game cards to start playing\n' +
      '• Difficulty stars show game complexity\n' +
      '• Use bottom controls for settings and help\n\n' +
      'Enjoy learning with fun!', {
      fontSize: '18px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    // Close button
    const closeBtn = this.add.circle(width / 2 + 220, height / 2 - 180, 20, 0xE32528);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
        // Play click sound
        if (this.app && this.app.audioManager) {
            this.app.audioManager.playClickSound();
        }
        this.closeHelpModal();
    });

    const closeText = this.add.text(width / 2 + 220, height / 2 - 180, '×', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5);

    this.helpModal = [overlay, modalBg, helpText, closeBtn, closeText];
  }

  /**
   * Close help modal
   */
  closeHelpModal() {
    if (this.helpModal) {
      this.helpModal.forEach(element => element.destroy());
      this.helpModal = null;
    }
  }

  /**
   * Set up keyboard navigation for accessibility
   */
  setupKeyboardNavigation() {
    // Listen for keyboard events
    this.input.keyboard.on('keydown-TAB', (event) => {
      event.preventDefault();
      this.navigateNext();
    });

    this.input.keyboard.on('keydown-SHIFT_TAB', (event) => {
      event.preventDefault();
      this.navigatePrevious();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.activateCurrentCard();
    });

    this.input.keyboard.on('keydown-SPACE', (event) => {
      event.preventDefault();
      this.activateCurrentCard();
    });

    // Arrow key navigation
    this.input.keyboard.on('keydown-UP', () => this.navigateUp());
    this.input.keyboard.on('keydown-DOWN', () => this.navigateDown());
    this.input.keyboard.on('keydown-LEFT', () => this.navigateLeft());
    this.input.keyboard.on('keydown-RIGHT', () => this.navigateRight());

    // Category navigation (number keys)
    for (let i = 1; i <= this.categories.length; i++) {
      this.input.keyboard.on(`keydown-${i}`, () => {
        this.selectCategory(this.categories[i - 1].id);
      });
    }

    // Escape key for help
    this.input.keyboard.on('keydown-ESCAPE', () => {
      if (this.helpModal) {
        this.closeHelpModal();
      }
    });

    // H key for help
    this.input.keyboard.on('keydown-H', () => {
      this.showHelpModal();
    });
  }

  /**
   * Navigate to next card
   */
  navigateNext() {
    const visibleCards = this.gameCards.filter(card => card.visible);
    if (visibleCards.length === 0) return;

    this.currentFocusIndex = (this.currentFocusIndex + 1) % visibleCards.length;
    this.focusGameCard(this.currentFocusIndex);
  }

  /**
   * Navigate to previous card
   */
  navigatePrevious() {
    const visibleCards = this.gameCards.filter(card => card.visible);
    if (visibleCards.length === 0) return;

    this.currentFocusIndex = this.currentFocusIndex === 0 ?
      visibleCards.length - 1 : this.currentFocusIndex - 1;
    this.focusGameCard(this.currentFocusIndex);
  }

  /**
   * Navigate up in grid
   */
  navigateUp() {
    this.navigateInDirection(-1, 0);
  }

  /**
   * Navigate down in grid
   */
  navigateDown() {
    this.navigateInDirection(1, 0);
  }

  /**
   * Navigate left in grid
   */
  navigateLeft() {
    this.navigateInDirection(0, -1);
  }

  /**
   * Navigate right in grid
   */
  navigateRight() {
    this.navigateInDirection(0, 1);
  }

  /**
   * Navigate in a specific direction
   */
  navigateInDirection(deltaRow, deltaCol) {
    const visibleCards = this.gameCards.filter(card => card.visible);
    if (visibleCards.length === 0) return;

    const gridWidth = this.gridConfig.areaRight - this.gridConfig.areaLeft;
    const cols = Math.floor(gridWidth / (this.gridConfig.cardSize + this.gridConfig.spacing));

    const currentCard = visibleCards[this.currentFocusIndex];
    const currentIndex = this.allGames.findIndex(game => game.scene === currentCard.gameData.scene);
    const currentRow = Math.floor(currentIndex / cols);
    const currentCol = currentIndex % cols;

    const newRow = currentRow + deltaRow;
    const newCol = currentCol + deltaCol;

    if (newRow >= 0 && newCol >= 0 && newCol < cols) {
      const newIndex = newRow * cols + newCol;
      if (newIndex < this.allGames.length) {
        const newCard = this.gameCards.find(card => card.gameData.scene === this.allGames[newIndex].scene);
        if (newCard && newCard.visible) {
          this.currentFocusIndex = visibleCards.indexOf(newCard);
          this.focusGameCard(this.currentFocusIndex);
        }
      }
    }
  }

  /**
   * Focus a specific game card
   */
  focusGameCard(index) {
    // Ensure we have game cards and they're initialized
    if (!this.gameCards || this.gameCards.length === 0) {
      return;
    }

    const visibleCards = this.gameCards.filter(card => card.visible);
    if (!visibleCards || visibleCards.length === 0 || !visibleCards[index]) {
      return;
    }

    // Remove focus from all cards
    this.gameCards.forEach((card, i) => {
      // Safely get the background element
      const background = card.getAt && card.getAt(0); // First element should be background
      if (!background) {
        console.warn('Could not find background for card', card.gameData?.name);
        return;
      }

      if (visibleCards.includes(card)) {
        const cardIndex = visibleCards.indexOf(card);
        if (cardIndex === index) {
          // Add focus to this card
          if (background.setStrokeStyle) {
            background.setStrokeStyle(5, 0x000000); // Thick black border
          }
          if (card.setScale) {
            card.setScale(1.05);
          }
          this.announceToScreenReader(`Selected: ${card.gameData.name}`);
        } else {
          // Remove focus from other visible cards
          if (background.setStrokeStyle) {
            background.setStrokeStyle(3, 0x0062FF);
          }
          if (card.setScale) {
            card.setScale(1.0);
          }
        }
      }
    });
  }

  /**
   * Activate the currently focused card
   */
  activateCurrentCard() {
    const visibleCards = this.gameCards.filter(card => card.visible);
    if (!visibleCards || !visibleCards[this.currentFocusIndex]) return;

    const gameScene = visibleCards[this.currentFocusIndex].gameData.scene;
    this.startGame(gameScene);
  }

  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message) {
    // Create a temporary element for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  startGame(gameScene) {
    console.log(`Starting game: ${gameScene}`);

    // Close any open modals
    if (this.helpModal) {
      this.closeHelpModal();
    }

    // Stop current scene
    this.scene.stop('GameMenu');

    // Start the selected game scene with app data
    this.scene.start(gameScene, {
      app: this.app
    });
  }

  showAboutDialog() {
    const { width, height } = this.game.config;

    // Simple placeholder modal for About
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    const modalBg = this.add.rectangle(width / 2, height / 2, 600, 400, 0xFDFAED);
    modalBg.setStrokeStyle(4, 0xF05A28); // Orange border for About

    const aboutText = this.add.text(width / 2, height / 2, 'Lalela Web Games\n\nBased on GCompris activities.\n\nVersion 1.0.0', {
      fontSize: '24px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5);

    const closeBtn = this.add.circle(width / 2 + 280, height / 2 - 180, 20, 0xE32528);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      if (this.app?.audioManager) this.app.audioManager.playClickSound();
      this.closeAboutDialog();
    });

    const closeText = this.add.text(width / 2 + 280, height / 2 - 180, '×', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5);

    this.aboutModal = [overlay, modalBg, aboutText, closeBtn, closeText];
    overlay.on('pointerdown', () => this.closeAboutDialog()); // Close on overlay click
  }

  closeAboutDialog() {
    if (this.aboutModal) {
      this.aboutModal.forEach(element => element.destroy());
      this.aboutModal = null;
    }
  }

  toggleActivityConfigMode() {
    // Placeholder for toggling activity configuration mode
    console.log('Activity Configuration Mode Toggled');
    // In a real scenario, this would likely change a state variable
    // and re-render game cards to show config options instead of play.
  }

  /**
   * Clean up when scene is destroyed
   */
  destroy() {
    // Clean up animations
    if (this.clouds) {
      this.clouds.forEach(cloud => {
        if (cloud && cloud.destroy) cloud.destroy();
      });
    }

    // Clean up game cards
    if (this.gameCards) {
      this.gameCards.forEach(card => {
        if (card && card.destroy) card.destroy();
      });
    }

    // Clean up category buttons
    if (this.categoryButtons) {
      this.categoryButtons.forEach(btn => {
        if (btn.card && btn.card.destroy) btn.card.destroy();
        if (btn.shadow && btn.shadow.destroy) btn.shadow.destroy();
        if (btn.icon && btn.icon.destroy) btn.icon.destroy();
        if (btn.text && btn.text.destroy) btn.text.destroy();
      });
    }

    // Clean up bottom controls
    if (this.bottomControls) {
      this.bottomControls.forEach(control => {
        if (control.button && control.button.destroy) control.button.destroy();
        if (control.shadow && control.shadow.destroy) control.shadow.destroy();
        if (control.icon && control.icon.destroy) control.icon.destroy();
      });
    }

    // Close help modal if open
    if (this.helpModal) {
      this.closeHelpModal();
    }

    // Remove keyboard listeners
    if (this.input && this.input.keyboard) {
      this.input.keyboard.off('keydown-TAB');
      this.input.keyboard.off('keydown-SHIFT_TAB');
      this.input.keyboard.off('keydown-ENTER');
      this.input.keyboard.off('keydown-SPACE');
      this.input.keyboard.off('keydown-UP');
      this.input.keyboard.off('keydown-DOWN');
      this.input.keyboard.off('keydown-LEFT');
      this.input.keyboard.off('keydown-RIGHT');
      this.input.keyboard.off('keydown-ESCAPE');
      this.input.keyboard.off('keydown-H');

      // Remove number key listeners
      for (let i = 1; i <= this.categories.length; i++) {
        this.input.keyboard.off(`keydown-${i}`);
      }
    }

    super.destroy();
  }
}