/**
 * GeographyMapGame - Interactive geography learning game
 * Players explore world regions, learn about countries, and complete geography challenges
 */
import { InteractiveGame } from './InteractiveGame.js';

export class GeographyMapGame extends InteractiveGame {
  constructor(config) {
    super({
      category: 'geography',
      difficulty: 2,
      ...config
    });

    // Geography-specific properties
    this.selectedRegion = null;
    this.mapRegions = [];
    this.regionData = {};
    this.currentChallenge = null;
    this.score = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 0;

    // Game settings
    this.focusContinent = 'africa'; // Start with Africa (Lalela's roots)
    this.showLabels = true;
    this.quizMode = false;
  }

  /**
   * Initialize learning objectives for geography
   */
  initializeLearningObjectives() {
    // Continent identification
    this.addLearningObjective(
      'identify_continents',
      'Identify Continents',
      'Learn to recognize the 7 continents of the world',
      'Click on different continents to learn about them',
      20,
      7 // Need to identify all 7 continents
    );

    // Country knowledge
    this.addLearningObjective(
      'country_facts',
      'Country Facts',
      'Learn basic facts about different countries',
      'Explore countries and read their information',
      25,
      10 // Need to explore 10 different countries
    );

    // Geography quiz
    this.addLearningObjective(
      'geography_quiz',
      'Geography Quiz',
      'Test your knowledge with geography questions',
      'Answer quiz questions correctly',
      30,
      15 // Need to answer 15 questions correctly
    );

    // Map navigation
    this.addLearningObjective(
      'map_navigation',
      'Map Navigation',
      'Learn to navigate and explore the world map',
      'Use zoom and pan controls to explore',
      15,
      5 // Need to navigate to 5 different regions
    );

    // Set up validation rules
    this.setupValidationRules();
  }

  /**
   * Set up validation rules for geography objectives
   */
  setupValidationRules() {
    // Validate continent identification
    this.addValidationRule('identify_continents', (interaction) => {
      return interaction.type === 'continent_selected' &&
             this.isContinent(interaction.regionId);
    });

    // Validate country exploration
    this.addValidationRule('country_facts', (interaction) => {
      return interaction.type === 'country_explored';
    });

    // Validate quiz answers
    this.addValidationRule('geography_quiz', (interaction) => {
      return interaction.type === 'quiz_answer' &&
             interaction.correct === true;
    });

    // Validate map navigation
    this.addValidationRule('map_navigation', (interaction) => {
      return interaction.type === 'region_navigated';
    });
  }

  /**
   * Create interactive map elements
   */
  createInteractiveElements() {
    this.createTitleAndInstructions();
    this.createWorldMap();
    this.createRegionInfoPanel();
    this.createNavigationControls();
    this.createQuizPanel();
    this.initializeRegionData();
  }

  createTitleAndInstructions() {
    const { width, height } = this.scale;

    // Main title - Positioned at top-center, above map area
    this.add.text(width / 2, 50, '🌍 World Explorer!', {
      fontSize: '36px',
      color: '#FFD93D',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Sub-instructions - Positioned below title but above map
    const instructionBg = this.add.graphics();
    instructionBg.fillStyle(0xFFFFFF, 0.9);
    instructionBg.fillRoundedRect(width / 2 - 220, 85, 440, 35, 17);
    instructionBg.lineStyle(3, 0xFFD93D, 1);
    instructionBg.strokeRoundedRect(width / 2 - 220, 85, 440, 35, 17);

    this.add.text(width / 2, 102, 'Touch the animal pictures to explore amazing places!', {
      fontSize: '18px',
      color: '#333333',
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Create the interactive world map
   */
  createWorldMap() {
    const { width, height } = this.scale;

    // Create map container - perfectly centered as main focus
    this.mapContainer = this.add.container(width / 2, height / 2);

    // Create full-screen background first
    this.createMapBackground();

    // Create continent regions (interactive elements)
    this.createContinents();

    // Add zoom and pan functionality
    this.setupMapInteraction();
  }

  /**
   * Create simplified world map background
   */
  createMapBackground() {
    const { width, height } = this.scale;
    const mapGraphics = this.add.graphics();

    // Full-screen bright sky blue background for cheerful feel
    mapGraphics.fillStyle(0xA2D2FF, 1); // Bright sky blue (#A2D2FF)
    mapGraphics.fillRect(0, 0, width, height);

    // Add playful cloud decorations
    mapGraphics.fillStyle(0xFFFFFF, 0.8);
    mapGraphics.fillRoundedRect(width * 0.1, height * 0.15, width * 0.15, height * 0.08, width * 0.03);
    mapGraphics.fillRoundedRect(width * 0.4, height * 0.1, width * 0.12, height * 0.06, width * 0.025);
    mapGraphics.fillRoundedRect(width * 0.7, height * 0.2, width * 0.14, height * 0.07, width * 0.035);

    // Add small decorative elements
    mapGraphics.fillStyle(0xFFD93D, 0.6); // Sunny yellow sun
    mapGraphics.fillCircle(width * 0.85, height * 0.12, width * 0.04);

    // Note: Not adding to mapContainer since this covers full screen
    // Add directly to scene so it stays behind everything
  }

  /**
   * Draw simplified world continents
   */
  drawWorldOutline(graphics) {
    // This is a very simplified world map
    // In a real implementation, you'd use actual geographic coordinates

    // Africa
    graphics.fillStyle(0x00B378, 0.7); // Aloe green
    graphics.fillRect(-95, -5, 90, 100);
    graphics.lineStyle(2, 0x101012, 1);
    graphics.strokeRect(-95, -5, 90, 100);

    // Europe
    graphics.fillStyle(0xFD5E1A, 0.7); // Bead orange
    graphics.fillRect(15, -72, 70, 45);
    graphics.lineStyle(2, 0x101012, 1);
    graphics.strokeRect(15, -72, 70, 45);

    // Asia
    graphics.fillStyle(0xFACA2A, 0.7); // Lalela yellow
    graphics.fillRect(90, -42, 100, 85);
    graphics.lineStyle(2, 0x101012, 1);
    graphics.strokeRect(90, -42, 100, 85);

    // North America
    graphics.fillStyle(0x0062FF, 0.7); // River blue
    graphics.fillRect(-182, -60, 85, 70);
    graphics.lineStyle(2, 0x101012, 1);
    graphics.strokeRect(-182, -60, 85, 70);

    // South America
    graphics.fillStyle(0xE32528, 0.7); // Rooibos red
    graphics.fillRect(-158, 28, 55, 85);
    graphics.lineStyle(2, 0x101012, 1);
    graphics.strokeRect(-158, 28, 55, 85);

    // Australia/Oceania
    graphics.fillStyle(0x9b59b6, 0.7); // Purple
    graphics.fillRect(137, 20, 65, 50);
    graphics.lineStyle(2, 0x101012, 1);
    graphics.strokeRect(137, 20, 65, 50);

    // Antarctica
    graphics.fillStyle(0xecf0f1, 0.7); // Light gray
    graphics.fillRect(-90, 98, 180, 25);
    graphics.lineStyle(2, 0x101012, 1);
    graphics.strokeRect(-90, 98, 180, 25);
  }

  /**
   * Create clickable continent regions
   */
  createContinents() {
    const { width, height } = this.scale;

    // Map occupies 60-70% of screen for better focus
    const mapWidth = width * 0.65;
    const mapHeight = height * 0.6;
    const centerX = 0;
    const centerY = 0;

    // Bright candy colors for toddler appeal + larger hit areas
    const continents = [
      { id: 'africa', name: 'Africa', emoji: '🦒', x: centerX - mapWidth * 0.25, y: centerY + mapHeight * 0.1, size: mapWidth * 0.2, color: 0xFFD93D }, // Sunny Yellow
      { id: 'europe', name: 'Europe', emoji: '🏰', x: centerX + mapWidth * 0.2, y: centerY - mapHeight * 0.25, size: mapWidth * 0.18, color: 0xFF9FF3 }, // Pastel Pink
      { id: 'asia', name: 'Asia', emoji: '🐼', x: centerX + mapWidth * 0.3, y: centerY - mapHeight * 0.05, size: mapWidth * 0.22, color: 0x54A0FF }, // Bright Blue
      { id: 'north_america', name: 'North America', emoji: '🦬', x: centerX - mapWidth * 0.3, y: centerY - mapHeight * 0.15, size: mapWidth * 0.18, color: 0x5CE600 }, // Mint Green
      { id: 'south_america', name: 'South America', emoji: '🦜', x: centerX - mapWidth * 0.25, y: centerY + mapHeight * 0.25, size: mapWidth * 0.15, color: 0xFFA726 }, // Orange
      { id: 'oceania', name: 'Oceania', emoji: '🐨', x: centerX + mapWidth * 0.35, y: centerY + mapHeight * 0.2, size: mapWidth * 0.16, color: 0xAB47BC }, // Soft Purple
      { id: 'antarctica', name: 'Antarctica', emoji: '🐧', x: centerX, y: centerY + mapHeight * 0.35, size: mapWidth * 0.4, color: 0x80DEEA } // Light Cyan
    ];

    continents.forEach(continent => {
      // Create rounded rectangle continent shape (kid-friendly "blob" shape)
      const continentShape = this.add.graphics();
      continentShape.fillStyle(continent.color, 0.8);
      continentShape.fillRoundedRect(
        continent.x - continent.size / 2,
        continent.y - continent.size / 2,
        continent.size,
        continent.size,
        continent.size * 0.3 // Rounded corners
      );
      continentShape.lineStyle(3, 0xFFFFFF, 1); // White border for definition
      continentShape.strokeRoundedRect(
        continent.x - continent.size / 2,
        continent.y - continent.size / 2,
        continent.size,
        continent.size,
        continent.size * 0.3
      );

      // Make interactive with 20% larger hit area for toddlers
      const hitAreaSize = continent.size * 1.2; // 20% larger
      continentShape.setInteractive(
        new Phaser.Geom.Rectangle(
          continent.x - hitAreaSize / 2,
          continent.y - hitAreaSize / 2,
          hitAreaSize,
          hitAreaSize
        ),
        Phaser.Geom.Rectangle.Contains
      );

      // Add hover and click effects with enhanced animations
      continentShape.on('pointerover', () => {
        // Gentle scale up
        this.tweens.add({
          targets: continentShape,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: 'Power2'
        });
      });

      continentShape.on('pointerout', () => {
        // Scale back down
        this.tweens.add({
          targets: continentShape,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2'
        });
      });

      continentShape.on('pointerdown', () => {
        this.selectContinent(continent);
        // Jump animation (Y-axis movement) for "juice"
        this.tweens.add({
          targets: continentShape,
          y: continent.y - 15,
          duration: 200,
          yoyo: true,
          ease: 'Power2'
        });
      });

      // Add emoji icon
      const emojiText = this.add.text(
        continent.x, continent.y,
        continent.emoji,
        {
          fontSize: `${continent.size * 0.4}px`,
          align: 'center'
        }
      ).setOrigin(0.5);

      // Store continent data
      continentShape.continentData = continent;
      this.mapRegions.push(continentShape);
      this.mapContainer.add(continentShape);
      this.mapContainer.add(emojiText);
    });
  }

  /**
   * Set up map interaction (zoom, pan)
   */
  setupMapInteraction() {
    const { width, height } = this.scale;

    // Dynamic camera bounds based on screen size
    const boundsPadding = Math.min(width, height) * 0.1;
    this.cameras.main.setBounds(
      -width / 2 - boundsPadding,
      -height / 2 - boundsPadding,
      width + boundsPadding * 2,
      height + boundsPadding * 2
    );

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      const zoom = this.cameras.main.zoom;
      if (deltaY > 0) {
        this.cameras.main.setZoom(Math.max(0.5, zoom - 0.1));
      } else {
        this.cameras.main.setZoom(Math.min(2, zoom + 0.1));
      }
    });

    // Add pan functionality
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && !pointer.primaryDown) {
        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
      }
    });
  }

  /**
   * Create information panel for selected regions
   */
  createRegionInfoPanel() {
    const { width, height } = this.scale;

    // Create "sticker" style panel background
    const panelGraphics = this.add.graphics();

    // Drop shadow
    panelGraphics.fillStyle(0x000000, 0.3);
    panelGraphics.fillRoundedRect(width - 155, height / 2 - 5, 290, 410, 25);

    // Main panel (sticker style)
    panelGraphics.fillStyle(0xFFFFFF, 0.95);
    panelGraphics.fillRoundedRect(width - 150, height / 2, 280, 400, 24);

    // White border (sticker look)
    panelGraphics.lineStyle(4, 0xFFFFFF, 1);
    panelGraphics.strokeRoundedRect(width - 150, height / 2, 280, 400, 24);

    this.infoPanel = panelGraphics;
    this.infoPanel.setVisible(false);

    // Panel title
    this.infoTitle = this.add.text(width - 150, height / 2 - 180, '', {
      fontSize: '20px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.infoTitle.setVisible(false);

    // Information text
    this.infoText = this.add.text(width - 150, height / 2 - 140, '', {
      fontSize: '14px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'left',
      wordWrap: { width: 250 }
    }).setOrigin(0.5);
    this.infoText.setVisible(false);

    // Explore button
    this.exploreButton = this.add.rectangle(width - 150, height / 2 + 120, 120, 40, 0x0062FF);
    this.exploreButton.setStrokeStyle(2, 0x101012);
    this.exploreButton.setInteractive();
    this.exploreButton.on('pointerdown', () => this.startQuiz());
    this.exploreButton.on('pointerover', () => this.exploreButton.setFillStyle(0x0052CC));
    this.exploreButton.on('pointerout', () => this.exploreButton.setFillStyle(0x0062FF));

    this.exploreButtonText = this.add.text(width - 150, height / 2 + 120, 'Explore', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Nunito, sans-serif'
    }).setOrigin(0.5);
    this.exploreButton.setVisible(false);
    this.exploreButtonText.setVisible(false);
  }

  /**
   * Create navigation controls
   */
  createNavigationControls() {
    const { width, height } = this.scale;

    // Create navigation dock at bottom-center
    const dockX = width / 2;
    const dockY = height * 0.87;
    const buttonSize = Math.min(width, height) * 0.08; // Responsive button size

    // Navigation dock background (sticker style)
    const dockBg = this.add.graphics();

    // Drop shadow for sticker effect
    dockBg.fillStyle(0x000000, 0.2);
    dockBg.fillRoundedRect(dockX - buttonSize * 2 - 2, dockY - buttonSize * 1.5 - 2, buttonSize * 5, buttonSize * 3.5, buttonSize * 0.4);

    // Main dock background
    dockBg.fillStyle(0xFFFFFF, 0.95);
    dockBg.fillRoundedRect(dockX - buttonSize * 2, dockY - buttonSize * 1.5, buttonSize * 5, buttonSize * 3.5, buttonSize * 0.4);

    // White border (sticker look)
    dockBg.lineStyle(3, 0xFFFFFF, 1);
    dockBg.strokeRoundedRect(dockX - buttonSize * 2, dockY - buttonSize * 1.5, buttonSize * 5, buttonSize * 3.5, buttonSize * 0.4);

    // Zoom In Button - Sticker style
    this.zoomInBtn = this.add.graphics();

    // Drop shadow
    this.zoomInBtn.fillStyle(0x000000, 0.2);
    this.zoomInBtn.fillRoundedRect(dockX - buttonSize * 1.5 - 2, dockY - buttonSize - 2, buttonSize, buttonSize, buttonSize * 0.3);

    // Main button
    this.zoomInBtn.fillStyle(0xFF6B6B, 1); // Coral red
    this.zoomInBtn.fillRoundedRect(dockX - buttonSize * 1.5, dockY - buttonSize, buttonSize, buttonSize, buttonSize * 0.3);
    this.zoomInBtn.lineStyle(3, 0xFFFFFF, 1);
    this.zoomInBtn.strokeRoundedRect(dockX - buttonSize * 1.5, dockY - buttonSize, buttonSize, buttonSize, buttonSize * 0.3);

    this.zoomInBtn.setInteractive(new Phaser.Geom.Rectangle(dockX - buttonSize * 1.5, dockY - buttonSize, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);

    this.zoomInText = this.add.text(dockX - buttonSize * 1.5 + buttonSize/2, dockY - buttonSize/2, '🔍+', {
      fontSize: `${buttonSize * 0.4}px`,
      align: 'center'
    }).setOrigin(0.5);

    // Zoom Out Button - Sticker style
    this.zoomOutBtn = this.add.graphics();

    // Drop shadow
    this.zoomOutBtn.fillStyle(0x000000, 0.2);
    this.zoomOutBtn.fillRoundedRect(dockX - buttonSize/2 - 2, dockY - buttonSize - 2, buttonSize, buttonSize, buttonSize * 0.3);

    // Main button
    this.zoomOutBtn.fillStyle(0x4ECDC4, 1); // Turquoise
    this.zoomOutBtn.fillRoundedRect(dockX - buttonSize/2, dockY - buttonSize, buttonSize, buttonSize, buttonSize * 0.3);
    this.zoomOutBtn.lineStyle(3, 0xFFFFFF, 1);
    this.zoomOutBtn.strokeRoundedRect(dockX - buttonSize/2, dockY - buttonSize, buttonSize, buttonSize, buttonSize * 0.3);

    this.zoomOutBtn.setInteractive(new Phaser.Geom.Rectangle(dockX - buttonSize/2, dockY - buttonSize, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);

    this.zoomOutText = this.add.text(dockX, dockY - buttonSize/2, '🔍-', {
      fontSize: `${buttonSize * 0.4}px`,
      align: 'center'
    }).setOrigin(0.5);

    // Reset View Button - Sticker style
    this.resetViewBtn = this.add.graphics();

    // Drop shadow
    this.resetViewBtn.fillStyle(0x000000, 0.2);
    this.resetViewBtn.fillRoundedRect(dockX + buttonSize - 2, dockY - buttonSize - 2, buttonSize, buttonSize, buttonSize * 0.3);

    // Main button
    this.resetViewBtn.fillStyle(0xFFD93D, 1); // Bright yellow
    this.resetViewBtn.fillRoundedRect(dockX + buttonSize, dockY - buttonSize, buttonSize, buttonSize, buttonSize * 0.3);
    this.resetViewBtn.lineStyle(3, 0xFFFFFF, 1);
    this.resetViewBtn.strokeRoundedRect(dockX + buttonSize, dockY - buttonSize, buttonSize, buttonSize, buttonSize * 0.3);

    this.resetViewBtn.setInteractive(new Phaser.Geom.Rectangle(dockX + buttonSize, dockY - buttonSize, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);

    this.resetViewText = this.add.text(dockX + buttonSize + buttonSize/2, dockY - buttonSize/2, '🏠', {
      fontSize: `${buttonSize * 0.5}px`,
      align: 'center'
    }).setOrigin(0.5);

    // Add hover animations to all buttons
    [this.zoomInBtn, this.zoomOutBtn, this.resetViewBtn].forEach(btn => {
      btn.on('pointerover', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150,
          ease: 'Power2'
        });
      });

      btn.on('pointerout', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2'
        });
      });

      btn.on('pointerdown', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 100,
          yoyo: true,
          ease: 'Power2'
        });
      });
    });

    // Button functionality
    this.zoomInBtn.on('pointerdown', () => {
      this.cameras.main.setZoom(Math.min(2, this.cameras.main.zoom + 0.2));
    });

    this.zoomOutBtn.on('pointerdown', () => {
      this.cameras.main.setZoom(Math.max(0.5, this.cameras.main.zoom - 0.2));
    });

    this.resetViewBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: this.cameras.main,
        zoom: 1,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.cameras.main.centerOn(0, 0);
        }
      });
    });
  }

  /**
   * Create quiz panel for geography questions
   */
  createQuizPanel() {
    const { width, height } = this.scale;

    // Create "sticker" style quiz panel
    const quizGraphics = this.add.graphics();

    // Drop shadow
    quizGraphics.fillStyle(0x000000, 0.3);
    quizGraphics.fillRoundedRect(width / 2 - 255, height / 2 - 5, 510, 310, 25);

    // Main panel (sticker style)
    quizGraphics.fillStyle(0xFFFFFF, 0.95);
    quizGraphics.fillRoundedRect(width / 2 - 250, height / 2, 500, 300, 24);

    // White border (sticker look)
    quizGraphics.lineStyle(4, 0xFFFFFF, 1);
    quizGraphics.strokeRoundedRect(width / 2 - 250, height / 2, 500, 300, 24);

    this.quizPanel = quizGraphics;
    this.quizPanel.setVisible(false);

    // Quiz question
    this.quizQuestion = this.add.text(width / 2, height / 2 - 100, '', {
      fontSize: '18px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);
    this.quizQuestion.setVisible(false);

    // Answer options - Large, colorful buttons for toddlers
    const buttonColors = [0xFFD93D, 0xFF9FF3, 0x54A0FF, 0x5CE600]; // Bright candy colors
    this.answerButtons = [];

    for (let i = 0; i < 4; i++) {
      const y = height / 2 - 30 + (i * 60); // More spacing between buttons
      const buttonWidth = 350;
      const buttonHeight = 50;

      // Create sticker-style button with drop shadow
      const buttonGraphics = this.add.graphics();

      // Drop shadow
      buttonGraphics.fillStyle(0x000000, 0.2);
      buttonGraphics.fillRoundedRect(width / 2 - buttonWidth/2 + 2, y - buttonHeight/2 + 2, buttonWidth, buttonHeight, 15);

      // Main button
      buttonGraphics.fillStyle(buttonColors[i], 1);
      buttonGraphics.fillRoundedRect(width / 2 - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 15);
      buttonGraphics.lineStyle(3, 0xFFFFFF, 1);
      buttonGraphics.strokeRoundedRect(width / 2 - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 15);

      // Make interactive with larger hit area
      buttonGraphics.setInteractive(
        new Phaser.Geom.Rectangle(width / 2 - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );

      const buttonText = this.add.text(width / 2, y, '', {
        fontSize: '20px',
        color: '#FFFFFF',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      // Enhanced animations for toddler feedback
      buttonGraphics.on('pointerover', () => {
        this.tweens.add({
          targets: buttonGraphics,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: 'Power2'
        });
      });

      buttonGraphics.on('pointerout', () => {
        this.tweens.add({
          targets: buttonGraphics,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2'
        });
      });

      buttonGraphics.on('pointerdown', () => {
        // Bounce effect
        this.tweens.add({
          targets: buttonGraphics,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 100,
          yoyo: true,
          ease: 'Power2'
        });
        this.checkAnswer(i);
      });

      this.answerButtons.push({ button: buttonGraphics, text: buttonText });
      buttonGraphics.setVisible(false);
      buttonText.setVisible(false);
    }
  }

  /**
   * Initialize region data with facts and information
   */
  initializeRegionData() {
    this.regionData = {
      africa: {
        name: 'Africa',
        facts: [
          'Africa is the second-largest continent by land area',
          'Home to 54 countries and over 1.3 billion people',
          'Has the world\'s largest desert (Sahara) and rainforest (Congo)',
          'Birthplace of humanity - oldest human fossils found here'
        ],
        countries: ['South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Morocco'],
        quiz: [
          { question: 'Find the 🦒!', answers: ['🦒 Africa', '🐼 Asia', '🏰 Europe', '🦬 America'], correct: 0 },
          { question: 'Where are lions? 🦁', answers: ['Africa', 'Asia', 'Europe', 'America'], correct: 0 }
        ]
      },
      europe: {
        name: 'Europe',
        facts: [
          'Europe is the second-smallest continent by land area',
          'Home to 44 countries and about 750 million people',
          'Has the most diverse range of languages in the world',
          'Contains some of the world\'s oldest universities'
        ],
        countries: ['France', 'Germany', 'Italy', 'Spain', 'United Kingdom'],
        quiz: [
          { question: 'Find the 🏰!', answers: ['🏰 Europe', '🐼 Asia', '🦒 Africa', '🦬 America'], correct: 0 }
        ]
      },
      asia: {
        name: 'Asia',
        facts: [
          'Asia is the largest continent by both land area and population',
          'Home to about 4.6 billion people (60% of world population)',
          'Contains the world\'s highest mountain (Everest) and lowest point (Dead Sea)',
          'Has some of the world\'s oldest civilizations'
        ],
        countries: ['China', 'India', 'Japan', 'Indonesia', 'Russia'],
        quiz: [
          { question: 'Find the 🐼!', answers: ['🐼 Asia', '🦒 Africa', '🏰 Europe', '🦬 America'], correct: 0 }
        ]
      }
    };
  }

  /**
   * Handle continent selection
   */
  selectContinent(continent) {
    this.selectedRegion = continent.id;

    // Show information panel
    this.showRegionInfo(continent);

    // Trigger interaction validation
    this.onElementInteraction('continent', 'continent_selected', {
      regionId: continent.id,
      regionName: continent.name
    });

    // Add pulsing animation to selected continent and reset others
    this.mapRegions.forEach(region => {
      if (region.continentData.id === continent.id) {
        // Pulsing animation for selected continent
        this.tweens.add({
          targets: region,
          scaleX: { from: 1, to: 1.2, duration: 300, ease: 'Power2' },
          scaleY: { from: 1, to: 1.2, duration: 300, ease: 'Power2' },
          alpha: { from: 0.8, to: 1, duration: 300, ease: 'Power2' },
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            // Start continuous gentle pulsing
            this.tweens.add({
              targets: region,
              scaleX: 1.05,
              scaleY: 1.05,
              alpha: 1,
              duration: 1000,
              ease: 'Power2',
              yoyo: true,
              repeat: -1
            });
          }
        });
      } else {
        // Stop any existing tweens and reset to normal state
        this.tweens.killTweensOf(region);
        this.tweens.add({
          targets: region,
          scaleX: 1,
          scaleY: 1,
          alpha: 0.8,
          duration: 200,
          ease: 'Power2'
        });
      }
    });
  }

  /**
   * Show information about selected region
   */
  showRegionInfo(continent) {
    const data = this.regionData[continent.id];
    if (!data) return;

    // Show panel with "pop" effect for sticker appearance
    this.infoPanel.setVisible(true);
    this.infoTitle.setVisible(true);
    this.infoText.setVisible(true);
    this.exploreButton.setVisible(true);
    this.exploreButtonText.setVisible(true);

    // Animate panel appearance with pop effect
    this.tweens.add({
      targets: [this.infoTitle, this.infoText, this.exploreButton, this.exploreButtonText],
      alpha: { from: 0, to: 1 },
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 },
      duration: 400,
      ease: 'Back.easeOut',
      delay: 100
    });

    // Update content with kid-friendly format
    this.infoTitle.setText(`${continent.emoji} ${data.name}`);

    // Create simple, icon-based facts for kids
    let kidFriendlyFacts = '';
    switch(continent.id) {
      case 'africa':
        kidFriendlyFacts = '🐘 Big elephants live here!\n🌳 Tall trees and jungles\n🦁 Lions and giraffes roam free!';
        break;
      case 'europe':
        kidFriendlyFacts = '🏰 Beautiful castles and towers\n🍕 Pizza comes from here!\n🎨 Amazing art and music';
        break;
      case 'asia':
        kidFriendlyFacts = '🐼 Cute pandas live here\n🏯 Tall temples and palaces\n🍜 Delicious noodles and rice';
        break;
      case 'north_america':
        kidFriendlyFacts = '🦬 Bison roam the plains\n🌽 Corn grows tall here\n❄️ Snowy mountains in the north';
        break;
      case 'south_america':
        kidFriendlyFacts = '🦜 Colorful birds fly free\n🌴 Tropical jungles everywhere\n🏔️ Tall mountains touch the sky';
        break;
      case 'oceania':
        kidFriendlyFacts = '🐨 Koalas sleep in trees\n🏄‍♂️ Surfing on big waves\n🦘 Kangaroos hop around';
        break;
      case 'antarctica':
        kidFriendlyFacts = '🐧 Penguins waddle everywhere\n❄️ Lots of ice and snow\n🧊 The coldest place on Earth!';
        break;
      default:
        kidFriendlyFacts = '🌍 A wonderful place to explore!\n🗺️ Full of amazing discoveries\n✨ Every place is special!';
    }

    this.infoText.setText(kidFriendlyFacts);

    this.showFeedback(`${continent.emoji} Exploring ${data.name}!`, 'info', 2000);
  }

  /**
   * Start geography quiz
   */
  startQuiz() {
    if (!this.selectedRegion || !this.regionData[this.selectedRegion]) return;

    this.quizMode = true;
    this.currentChallenge = this.regionData[this.selectedRegion].quiz[0];

    this.showQuizQuestion();
  }

  /**
   * Show current quiz question
   */
  showQuizQuestion() {
    if (!this.currentChallenge) return;

    // Hide info panel
    this.infoPanel.setVisible(false);
    this.infoTitle.setVisible(false);
    this.infoText.setVisible(false);
    this.exploreButton.setVisible(false);
    this.exploreButtonText.setVisible(false);

    // Show quiz panel
    this.quizPanel.setVisible(true);
    this.quizQuestion.setVisible(true);

    this.quizQuestion.setText(this.currentChallenge.question);

    // Show answer options
    this.currentChallenge.answers.forEach((answer, index) => {
      this.answerButtons[index].button.setVisible(true);
      this.answerButtons[index].text.setVisible(true);
      this.answerButtons[index].text.setText(answer);
    });
  }

  /**
   * Check quiz answer
   */
  checkAnswer(selectedIndex) {
    const isCorrect = selectedIndex === this.currentChallenge.correct;
    this.totalQuestions++;

    if (isCorrect) {
      this.correctAnswers++;
      this.score += 10;
      this.showFeedback('Correct! 🎉', 'success', 2000);
    } else {
      this.showFeedback('Try again! 💪', 'info', 2000);
    }

    // Trigger interaction validation
    this.onElementInteraction('quiz', 'quiz_answer', {
      correct: isCorrect,
      question: this.currentChallenge.question,
      selectedAnswer: this.currentChallenge.answers[selectedIndex],
      correctAnswer: this.currentChallenge.answers[this.currentChallenge.correct]
    });

    // Hide quiz panel
    this.quizPanel.setVisible(false);
    this.quizQuestion.setVisible(false);
    this.answerButtons.forEach(btn => {
      btn.button.setVisible(false);
      btn.text.setVisible(false);
    });

    this.quizMode = false;
    this.currentChallenge = null;
  }

  /**
   * Check if region ID is a continent
   */
  isContinent(regionId) {
    const continents = ['africa', 'europe', 'asia', 'north_america', 'south_america', 'oceania', 'antarctica'];
    return continents.includes(regionId);
  }

  /**
   * Create tutorial steps for geography map
   */
  createTutorialSteps() {
    return [
      {
        message: "Welcome to Geography Explorer! 🌍",
        highlightElement: null
      },
      {
        message: "Click on any continent to learn about it!",
        highlightElement: this.mapRegions[0] // Highlight Africa
      },
      {
        message: "Use zoom controls to explore the map up close",
        highlightElement: this.zoomInBtn
      },
      {
        message: "Take quizzes to test your geography knowledge!",
        highlightElement: this.exploreButton
      }
    ];
  }

  /**
   * Get geography-specific statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      continentsExplored: this.interactionHistory.filter(h => h.type === 'continent_selected').length,
      countriesExplored: this.interactionHistory.filter(h => h.type === 'country_explored').length,
      quizScore: this.correctAnswers,
      totalQuestions: this.totalQuestions,
      selectedRegion: this.selectedRegion
    };
  }

  /**
   * Override restart to reset geography state
   */
  restartGame() {
    // Reset selections
    this.selectedRegion = null;
    this.currentChallenge = null;
    this.quizMode = false;
    this.score = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 0;

    // Hide panels
    this.infoPanel.setVisible(false);
    this.infoTitle.setVisible(false);
    this.infoText.setVisible(false);
    this.exploreButton.setVisible(false);
    this.exploreButtonText.setVisible(false);
    this.quizPanel.setVisible(false);
    this.quizQuestion.setVisible(false);
    this.answerButtons.forEach(btn => {
      btn.button.setVisible(false);
      btn.text.setVisible(false);
    });

    // Clear highlights
    this.mapRegions.forEach(region => {
      region.setFillStyle(region.continentData.color, 0.8); // Reset to original color
    });

    // Reset camera
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(0, 0);

    super.restartGame();
  }
}