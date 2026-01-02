/**
 * AdjacentNumbers - Find the missing adjacent numbers in sequences
 * Educational game teaching number sequencing and adjacent number recognition
 */
import { DragDropGame } from './DragDropGame.js';
import { InputManager } from '../utils/InputManager.js';

export class AdjacentNumbers extends DragDropGame {
  constructor(config) {
    super({
      ...config,
      category: 'mathematics',
      difficulty: 1
    });

    // Game-specific properties
    this.currentLevel = 0;
    this.currentSubLevel = 0;
    this.levels = null; // Will be loaded in init()
    this.questionTiles = [];
    this.expectedAnswer = [];
    this.subLevelStartTiles = [];

    // UI elements
    this.instructionText = null;
    this.scoreDisplay = null;
    this.okButton = null;

    // Game state
    this.immediateAnswer = true;
    this.answerCompleted = false;
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load the wood background
    this.load.svg('background-wood', 'assets/game-icons/background-wood.svg');

    // Load UI control icons for navigation dock (same as MemoryGame)
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach(icon => {
      this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });

    console.log("AdjacentNumbers assets loaded");
  }

  /**
   * Initialize data (no game objects here)
   */
  init(data) {
    super.init(data);

    if (data.inputManager) {
      this.inputManager = data.inputManager;
    } else {
      this.inputManager = new InputManager(this);
    }

    this.levels = this.loadLevelData();
  }

  /**
   * OVERRIDE: Create the background first so it is at the bottom
   */
  createBackground() {
    const { width, height } = this.scale;
    this.background = this.add.image(width / 2, height / 2, 'background-wood');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-1); // Ensure it stays behind everything
  }

  /**
   * OVERRIDE: Create UI elements
   */
  createUI() {
    // 1. Instruction panel background
    const instructionPanelBg = this.add.rectangle(
      this.scale.width / 2,
      50,
      this.scale.width - 40,
      60,
      0x000000,
      0.7
    ).setOrigin(0.5);

    // 2. Instruction text
    this.instructionText = this.add.text(
      this.scale.width / 2,
      50,
      'Find the next number.',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }
    ).setOrigin(0.5);

    // 3. Score display
    this.scoreDisplay = this.add.text(
      this.scale.width - 20,
      this.scale.height - 20,
      '0/5',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold'
      }
    ).setOrigin(1, 1);

    // 4. Navigation and OK button
    this.createNavigationDock(this.scale.width, this.scale.height);

    this.okButton = this.add.text(
      this.scale.width / 2,
      this.scale.height - 220,
      'Check Answer',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#27ae60',
        padding: { x: 20, y: 10 },
        fontFamily: 'Fredoka One, cursive'
      }
    ).setOrigin(0.5).setInteractive();

    this.okButton.on('pointerdown', () => this.checkAnswer());
    this.okButton.setVisible(!this.immediateAnswer);
    this.okButton.setDepth(10);
  }

  /**
   * OVERRIDE: This is where the game logic starts after UI/Background are ready
   */
  setupGameLogic() {
    this.startGame();
  }

  /**
   * Create bottom navigation buttons (GCompris style)
   */
  /**
   * Create bottom navigation dock (same as MemoryGame)
   */
  createNavigationDock(width, height) {
    const dockY = height - 80; // Lower dock position for more prominence
    const buttonSize = 90; // MASSIVE increase for toddler fingers
    const spacing = 130; // Much wider spacing for the larger buttons

    // Dock background (prominent "bubbly" white pill shape)
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.95); // More opaque for prominence
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60); // Much taller and wider

    // Deep drop shadow for 3D toy effect
    const dockShadow = this.add.graphics();
    dockShadow.fillStyle(0x000000, 0.3); // Much darker shadow
    dockShadow.fillRoundedRect(width / 2 - (width - 60) / 2 + 4, dockY - 56, width - 60, 120, 60);

    // Thick River Blue border for the dock
    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(5, 0x0062FF, 1); // 5px River Blue border
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);

    const controls = [
      { icon: 'help.svg', action: 'help', color: 0x00B378, label: 'Help' },
      { icon: 'home.svg', action: 'home', color: 0x0062FF, label: 'Home' },
      { icon: 'settings.svg', action: 'levels', color: 0xFACA2A, label: 'Levels' },
      { icon: 'exit.svg', action: 'menu', color: 0xAB47BC, label: 'Menu' }
    ];

    const totalWidth = (controls.length - 1) * spacing + buttonSize;
    const startX = (width - totalWidth) / 2 + buttonSize / 2;

    controls.forEach((control, index) => {
      const x = startX + index * spacing;

      // Button background with enhanced 3D toy effect
      const buttonShadow = this.add.circle(x + 4, dockY + 4, buttonSize / 2, 0x000000, 0.4); // Deeper shadow
      const button = this.add.circle(x, dockY, buttonSize / 2, control.color);
      button.setStrokeStyle(5, 0xFFFFFF); // Thick white border for toy look
      button.setInteractive({ useHandCursor: true });

      // Icon (scaled proportionally to much larger button)
      const icon = this.add.sprite(x, dockY, control.icon.replace('.svg', ''));
      icon.setScale((buttonSize * 0.7) / 100); // Larger relative scaling
      icon.setTint(0xFFFFFF);

      // Label below button (much larger font for toddler readability)
      const label = this.add.text(x, dockY + buttonSize / 2 + 25, control.label, {
        fontSize: '20px', // MASSIVE increase for visibility
        color: '#101012',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);

      // Enhanced hover effects (more dramatic for toddlers)
      button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scale: 1.2, // Much more dramatic scale
          duration: 150,
          ease: 'Back.easeOut'
        });
        button.setStrokeStyle(6, 0x000000); // Even thicker black border on hover
        icon.setScale((buttonSize * 0.8) / 100); // Icon scales with button
      });

      button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scale: 1.0,
          duration: 150,
          ease: 'Back.easeOut'
        });
        button.setStrokeStyle(5, 0xFFFFFF); // Back to thick white border
        icon.setScale((buttonSize * 0.7) / 100); // Icon back to normal
      });

      button.on('pointerdown', () => {
        this.handleDockAction(control.action);
      });

      // Store references for cleanup
      this.dockElements = this.dockElements || [];
      this.dockElements.push(button, buttonShadow, icon, label, dockBg, dockShadow, dockBorder);
    });
  }

  /**
   * Handle navigation dock actions (adapted for AdjacentNumbers)
   */
  handleDockAction(action) {
    switch (action) {
      case 'help':
        this.showHelp();
        break;
      case 'home':
        this.returnToMenu();
        break;
      case 'levels':
        this.showLevelSelector();
        break;
      case 'menu':
        this.showMenu();
        break;
    }
  }

  /**
   * Show help dialog
   */
  showHelp() {
    // Simple help notification
    if (this.uiManager) {
      this.uiManager.showNotification(
        'Find the missing numbers in the sequence. Click on the empty boxes and select the correct numbers from below.',
        'info',
        5000
      );
    }
  }

  /**
   * Show level selector
   */
  showLevelSelector() {
    // For now, just show current level info
    if (this.uiManager) {
      this.uiManager.showNotification(
        `Current Level: ${this.currentLevel + 1}, Sublevel: ${this.currentSubLevel + 1}`,
        'info',
        3000
      );
    }
  }

  /**
   * Show menu
   */
  showMenu() {
    // For now, just show a menu notification
    if (this.uiManager) {
      this.uiManager.showNotification(
        'Menu: Use the buttons to navigate levels or return home.',
        'info',
        3000
      );
    }
  }

  /**
   * Start the game
   */
  startGame() {
    this.currentLevel = 0;
    this.currentSubLevel = 0;
    // Ensure we have the necessary managers from the scene data
    if (!this.inputManager && this.game.inputManager) {
      this.inputManager = this.game.inputManager;
    }

    // Ensure levels are loaded
    if (!this.levels) {
      this.levels = this.loadLevelData();
    }

    this.initLevel();
  }

  /**
   * Initialize level data
   */
  initLevel() {
    // Safety check for levels array
    if (!this.levels || !Array.isArray(this.levels) || this.levels.length === 0) {
      console.error('initLevel: levels array is not properly initialized');
      return;
    }

    // Safety check for currentLevel bounds
    if (this.currentLevel < 0 || this.currentLevel >= this.levels.length) {
      console.error('initLevel: currentLevel out of bounds', this.currentLevel, 'levels length:', this.levels.length);
      this.currentLevel = 0; // Reset to first level
    }

    const levelData = this.levels[this.currentLevel];

    // Safety check for levelData
    if (!levelData) {
      console.error('initLevel: levelData is undefined for level', this.currentLevel);
      return;
    }

    // Update UI
    if (this.instructionText) {
      this.instructionText.setText(levelData.title);
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.setText(`${this.currentSubLevel + 1}/${this.subLevelStartTiles.length}`);
    }

    // Always generate sublevels when starting a level
    this.generateSubLevels(levelData);

    // Setup question and answer tiles
    this.setupTiles(levelData);

    // Reset game state
    this.correctPlacements = 0;
    this.totalPlacements = levelData.indicesToGuess.length;
    this.answerCompleted = false;
    this.levelComplete = false;

    if (this.okButton) {
      this.okButton.setVisible(!this.immediateAnswer && !this.answerCompleted);
    }
  }

  /**
   * Generate sublevels for current level
   */
  generateSubLevels(levelData) {
    // Safety check for levelData
    if (!levelData) {
      console.error('generateSubLevels called with undefined levelData');
      this.subLevelStartTiles = [0]; // Default fallback
      return;
    }

    this.subLevelStartTiles = [];

    // Use fixed levels or generate random ones
    if (levelData.fixedLevels && levelData.fixedLevels.length > 0) {
      this.subLevelStartTiles = [...levelData.fixedLevels];
    } else {
      // Safety check for required properties
      if (typeof levelData.lowerBound !== 'number' ||
          typeof levelData.upperBound !== 'number' ||
          typeof levelData.step !== 'number') {
        console.error('generateSubLevels: invalid levelData properties', levelData);
        this.subLevelStartTiles = [0]; // Default fallback
        return;
      }

      // Generate random start tiles within bounds
      const possibleStartTiles = this.getStartTiles(
        levelData.lowerBound,
        levelData.upperBound,
        levelData.step
      );

      // Shuffle and take first N
      this.shuffleArray(possibleStartTiles);
      this.subLevelStartTiles = possibleStartTiles.slice(0, levelData.numberRandomLevel || 5);
    }

    // Ensure we have at least one sublevel
    if (this.subLevelStartTiles.length === 0) {
      console.warn('No sublevels generated, using default');
      this.subLevelStartTiles = [0];
    }
  }

  /**
   * Setup question and answer tiles
   */
  setupTiles(levelData) {
    // Safety check for levelData
    if (!levelData) {
      console.error('setupTiles called with undefined levelData');
      return;
    }

    // Clear existing tiles and zones
    this.clearTilesAndZones();

    // Ensure subLevelStartTiles is initialized
    if (!this.subLevelStartTiles || this.subLevelStartTiles.length === 0) {
      console.warn('subLevelStartTiles not initialized, generating them now');
      this.generateSubLevels(levelData);
    }

    const startTile = this.subLevelStartTiles[this.currentSubLevel];

    // Debug logging
    console.log('setupTiles called with:', {
      currentLevel: this.currentLevel,
      currentSubLevel: this.currentSubLevel,
      subLevelStartTiles: this.subLevelStartTiles,
      startTile: startTile,
      levelData: levelData
    });

    // Safety check
    if (startTile === undefined) {
      console.error('startTile is undefined!', {
        subLevelStartTiles: this.subLevelStartTiles,
        currentSubLevel: this.currentSubLevel
      });
      // Try to regenerate sublevels if we have an index out of bounds
      if (this.currentSubLevel >= this.subLevelStartTiles.length) {
        console.warn('currentSubLevel out of bounds, resetting to 0');
        this.currentSubLevel = 0;
        this.generateSubLevels(levelData);
        return this.setupTiles(levelData); // Recursively call with regenerated data
      }
      return;
    }

    // Generate question array (with missing numbers marked as '?')
    const question = this.getQuestionArray(startTile, levelData.step, levelData.numberShown, levelData.indicesToGuess);

    // Use fixed size for number boxes
    const tileSize = 120;

    // Create drop zones for question tiles (GCompris style)
    const zoneY = this.scale.height * 0.35;
    const zoneSpacing = tileSize + 20; // Increased spacing for larger tiles
    const startX = this.scale.width / 2 - ((question.length - 1) * zoneSpacing) / 2;

    const dropZonesConfig = question.map((value, index) => {
      // Safety check for value
      if (value === undefined || value === null) {
        console.error('Undefined value in question array at index:', index, 'question:', question);
        value = '?'; // Default to missing number
      }

      return {
        x: startX + index * zoneSpacing,
        y: zoneY,
        width: tileSize,
        height: tileSize,
        expectedValue: value === '?' ? null : value,
        acceptedValues: value === '?' ? [] : [value], // Will be filled based on answer
        label: value === '?' ? '' : value.toString(),
        color: 0xFFFFFF, // White background for all tiles (GCompris style)
        borderColor: value === '?' ? 0xCCCCCC : 0x0062FF, // Light border for empty, blue for filled
        borderWidth: 3
      };
    });

    // Generate correct answers and update drop zones
    this.expectedAnswer = this.getExpectedAnswer(startTile, levelData.step, levelData.numberShown);
    const correctAnswers = this.getCorrectAnswers(question);

    // Update drop zones that accept answers
    question.forEach((value, index) => {
      if (value === '?') {
        dropZonesConfig[index].acceptedValues = [this.expectedAnswer[index]];
        dropZonesConfig[index].expectedValue = this.expectedAnswer[index];
      }
    });

    this.createDropZones(dropZonesConfig);

    // Store question tiles reference
    this.questionTiles = question;

    // Generate proposed answer tiles
    const proposedAnswers = this.generateProposedAnswers(correctAnswers, levelData.numberPropositions);

    // Use fixed size for number boxes
    const bottomTileSize = 120;

    // Create draggable tiles for answers (GCompris style)
    const tileY = this.scale.height * 0.75;
    const tileSpacing = bottomTileSize + 20; // Increased spacing for larger tiles
    const tileStartX = this.scale.width / 2 - ((proposedAnswers.length - 1) * tileSpacing) / 2;

    const draggableTilesConfig = proposedAnswers.map((value, index) => ({
      x: tileStartX + index * tileSpacing,
      y: tileY,
      value: value,
      text: value !== undefined && value !== null ? value.toString() : "?",
      size: bottomTileSize,
      fontSize: Math.floor(bottomTileSize * 0.4), // Scale font size with tile size
      color: 0xFFFFFF, // White background (GCompris style)
      borderColor: 0xCCCCCC, // Light border
      borderWidth: 3
    }));

    this.createDraggableTiles(draggableTilesConfig);

    // Ensure tiles and zones have proper depth (safety check)
    this.draggableTiles.forEach(tile => tile.setDepth(10));
    this.dropZones.forEach(zone => zone.setDepth(5));
  }

  /**
   * Clear existing tiles and zones
   */
  clearTilesAndZones() {
    // Remove existing tiles and zones
    this.draggableTiles.forEach(tile => tile.destroy());
    this.dropZones.forEach(zone => zone.destroy());

    this.draggableTiles = [];
    this.dropZones = [];
  }

  /**
   * Generate question array with missing numbers
   */
  getQuestionArray(startTile, step, numberShown, indicesToGuess) {
    // Safety check
    if (startTile === undefined || startTile === null || typeof startTile !== 'number') {
      console.error('getQuestionArray called with invalid startTile:', startTile, typeof startTile);
      return [];
    }

    // Safety check for other parameters
    if (typeof step !== 'number' || typeof numberShown !== 'number') {
      console.error('getQuestionArray called with invalid parameters:', { step, numberShown });
      return [];
    }

    // Generate complete sequence
    const completeSequence = [];
    for (let i = 0; i < numberShown; i++) {
      const value = startTile + i * step;
      if (typeof value === 'number' && !isNaN(value)) {
        completeSequence.push(value.toString());
      } else {
        console.error('Invalid value calculated:', { startTile, step, i, value });
        return [];
      }
    }

    // Hide numbers at specified indices
    const question = [...completeSequence];
    indicesToGuess.forEach(index => {
      if (index >= 0 && index < question.length) {
        question[index] = '?';
      } else {
        console.warn('Invalid index in indicesToGuess:', index, 'for question length:', question.length);
      }
    });

    return question;
  }

  /**
   * Get expected complete answer
   */
  getExpectedAnswer(startTile, step, numberShown) {
    const answer = [];
    for (let i = 0; i < numberShown; i++) {
      answer.push((startTile + i * step).toString());
    }
    return answer;
  }

  /**
   * Get correct answers (the missing numbers)
   */
  getCorrectAnswers(question) {
    const correctAnswers = [];
    question.forEach((value, index) => {
      if (value === '?') {
        const ans = this.expectedAnswer[index];
        if (ans !== undefined) {
          correctAnswers.push(ans);
        } else {
          console.error(`Missing expected answer for index ${index}`);
        }
      }
    });
    return correctAnswers;
  }

  /**
   * Generate proposed answer tiles (correct + distractors)
   */
  generateProposedAnswers(correctAnswers, numberPropositions) {
    const proposedAnswers = [...correctAnswers];

    // Add distractor answers
    const levelData = this.levels[this.currentLevel];
    let attempts = 0; // Safety counter

    while (proposedAnswers.length < numberPropositions && attempts < 100) {
      attempts++;
      // Generate nearby numbers as distractors
      const startTile = this.subLevelStartTiles[this.currentSubLevel];
      const multiplier = Math.floor(Math.random() * 15) - 5; // -5 to +15
      const proposal = startTile + levelData.step * multiplier;

      if (proposal >= levelData.lowerBound &&
          proposal <= levelData.upperBound &&
          !proposedAnswers.includes(proposal.toString())) {
        proposedAnswers.push(proposal.toString());
      }
    }

    // If we still don't have enough answers after 100 attempts, fill with duplicates or fallback values
    while (proposedAnswers.length < numberPropositions) {
      proposedAnswers.push("?");
    }

    // Shuffle the answers
    return this.shuffleArray([...proposedAnswers]);
  }

  /**
   * Get all possible start tiles for a level
   */
  getStartTiles(lowerBound, upperBound, step) {
    const tiles = [];
    for (let n = lowerBound; n <= upperBound; n += step) {
      tiles.push(n);
    }
    return tiles;
  }

  /**
   * Handle valid drop in subclass
   */
  handleValidDrop(tile, dropZone) {
    // Update the question tile display
    this.updateQuestionTileDisplay(dropZone);

    // Check if answer is complete
    this.checkAnswerComplete();
  }

  /**
   * Update question tile display when filled
   */
  updateQuestionTileDisplay(dropZone) {
    // Find corresponding question tile and update display
    const zoneIndex = this.dropZones.indexOf(dropZone);
    if (zoneIndex >= 0 && this.questionTiles[zoneIndex] === '?') {
      // Update the drop zone to show the placed number
      dropZone.updateConfig({
        label: dropZone.expectedValue.toString(),
        color: 0x00B378 // Aloe Green when filled
      });
    }
  }

  /**
   * Check if all missing numbers have been filled
   */
  checkAnswerComplete() {
    // 1. Only count zones that were originally missing (where the user CAN drop)
    const userDropZones = this.dropZones.filter((zone, index) => 
      this.questionTiles && this.questionTiles[index] === '?'
    );

    const filledUserZones = userDropZones.filter(zone => zone.isOccupied).length;
    const totalRequiredZones = userDropZones.length;

    // Check if the user has filled all the empty boxes
    this.answerCompleted = filledUserZones === totalRequiredZones;

    console.log(`Progress: ${filledUserZones}/${totalRequiredZones} (answerCompleted: ${this.answerCompleted})`);

    if (this.immediateAnswer && this.answerCompleted) {
      this.checkAnswer();
    } else if (this.okButton) {
      this.okButton.setVisible(this.answerCompleted);
    }
  }

  /**
   * Check the player's answer (GCompris style)
   * Only validates zones that were originally missing (user-fillable zones)
   */
  checkAnswer() {
    let allCorrect = true;
    let hasAnyAnswer = false;

    // Only check zones that were originally missing (where the user CAN drop)
    this.dropZones.forEach((zone, index) => {
      // Skip zones that were pre-filled (not originally '?')
      if (!this.questionTiles || this.questionTiles[index] !== '?') {
        return; // Skip pre-filled zones
      }

      if (zone.expectedValue !== null) {
        hasAnyAnswer = true;
        
        // Ensure both values are strings for comparison
        const expectedValue = String(zone.expectedValue);
        const actualValue = zone.currentTile ? String(zone.currentTile.value) : null;
        
        const isCorrect = actualValue !== null && actualValue === expectedValue;

        console.log(`Zone ${index} (user-fillable): expected="${expectedValue}", actual="${actualValue}", correct=${isCorrect}`);

        if (isCorrect) {
          zone.setTileState('RIGHT');
          // Add scale animation for correct answers (GCompris style)
          this.tweens.add({
            targets: zone,
            scale: 1.2,
            duration: 300,
            ease: 'InOutQuad',
            yoyo: true
          });
        } else {
          zone.setTileState('WRONG');
          allCorrect = false;
          // Add shake animation for wrong answers (GCompris style)
          this.tweens.add({
            targets: zone,
            rotation: 0.3,
            duration: 100,
            ease: 'Linear',
            yoyo: true,
            repeat: 3
          });
        }
      }
    });

    if (!hasAnyAnswer) {
      console.warn('checkAnswer: No answers to check!');
      if (this.uiManager) {
        this.uiManager.showNotification('Please place all numbers before checking!', 'info', 2000);
      }
      return;
    }

    console.log(`Answer check complete: allCorrect=${allCorrect}`);

    if (allCorrect) {
      this.handleCorrectAnswer();
    } else {
      this.handleIncorrectAnswer();
    }
  }

  /**
   * Handle correct answer
   */
  handleCorrectAnswer() {
    console.log('handleCorrectAnswer called');
    this.levelComplete = true;

    // Play success sound (GCompris: win.wav)
    if (this.game && this.game.audioManager) {
      this.game.audioManager.playSound('win');
    } else if (this.audioManager) {
      this.audioManager.playSound('win');
    }

    // Visual feedback - celebrate correct zones
    this.dropZones.forEach(zone => {
      if (zone.expectedValue !== null && zone.currentTile) {
        // Keep the correct answer visible, just animate it
        this.tweens.add({
          targets: zone,
          scale: 1.1,
          duration: 200,
          yoyo: true,
          repeat: 1
        });
      }
    });

    // Show success message
    if (this.uiManager) {
      this.uiManager.showNotification('Excellent! All numbers are correct!', 'success', 2000);
    } else {
      console.log('Excellent! All numbers are correct!');
    }

    // Move to next sublevel after delay
    this.time.delayedCall(2000, () => {
      console.log('Moving to next sublevel...');
      this.nextSubLevel();
    });
  }

  /**
   * Handle incorrect answer
   */
  handleIncorrectAnswer() {
    // Play error sound (GCompris: crash.wav)
    if (this.game.audioManager) {
      this.game.audioManager.playSound('crash');
    } else if (this.audioManager) {
      this.audioManager.playSound('crash');
    }

    // Visual feedback - shake incorrect zones
    this.dropZones.forEach(zone => {
      if (zone.isOccupied && zone.currentTile.value !== zone.expectedValue) {
        zone.shake();
      }
    });

    // Show error message
    if (this.uiManager) {
      this.uiManager.showNotification('Some numbers are incorrect. Try again!', 'error', 3000);
    }

    // Reset incorrect placements after delay
    this.time.delayedCall(1500, () => {
      this.resetIncorrectPlacements();
    });
  }

  /**
   * Reset incorrect placements
   */
  resetIncorrectPlacements() {
    this.dropZones.forEach(zone => {
      if (zone.isOccupied && zone.currentTile.value !== zone.expectedValue) {
        zone.removeTile();
      }
    });

    // Re-enable interaction
    this.answerCompleted = false;
    this.okButton.setVisible(false);
  }

  /**
   * Move to next sublevel
   */
  nextSubLevel() {
    console.log(`nextSubLevel: currentSubLevel=${this.currentSubLevel}, totalSubLevels=${this.subLevelStartTiles.length}`);
    this.currentSubLevel++;

    if (this.currentSubLevel >= this.subLevelStartTiles.length) {
      // All sublevels complete for this question type, move to next question type
      console.log(`Sublevels complete, moving to next question type. currentLevel=${this.currentLevel}`);
      this.currentLevel++;
      this.currentSubLevel = 0;

      if (this.currentLevel >= this.levels.length) {
        // All question types complete - Game complete!
        console.log('All levels complete!');
        this.handleGameComplete();
        return;
      }
    }

    // Start next level/sublevel
    console.log(`Starting level ${this.currentLevel}, sublevel ${this.currentSubLevel}`);
    this.initLevel();
  }

  /**
   * Handle game completion
   */
  handleGameComplete() {
    // Show completion message
    if (this.uiManager) {
      this.uiManager.showAchievementNotification('Number Master');
      this.uiManager.showGameOverScreen(
        this.calculateFinalScore(),
        () => this.restartGame(),
        () => this.returnToMenu()
      );
    }
  }

  /**
   * Calculate final score
   */
  calculateFinalScore() {
    return this.currentLevel * 100 + this.currentSubLevel * 10;
  }

  /**
   * Restart the game
   */
  restartGame() {
    this.currentLevel = 0;
    this.currentSubLevel = 0;
    this.initLevel();
  }

  /**
   * Return to main menu
   */
  returnToMenu() {
    this.scene.start('GameMenu');
  }

  /**
   * Check level completion (override from base class)
   */
  checkLevelCompletion() {
    // Level completion is handled in checkAnswer
    return this.levelComplete;
  }

  /**
   * Reset tiles to starting positions (override from base class)
   */
  resetTiles() {
    // Re-setup tiles for current level
    this.setupTiles(this.levels[this.currentLevel]);
  }

  /**
   * Shuffle array utility
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Load level data (equivalent to GCompris Data.qml)
   */
  loadLevelData() {
    return [
      {
        title: "Find the next number.",
        lowerBound: 0,
        upperBound: 8,
        step: 1,
        numberShown: 3,
        indicesToGuess: [2], // Find the last number
        numberRandomLevel: 5,
        fixedLevels: [1, 6, 3, 7, 5, 2, 4, 8, 0],
        numberPropositions: 3
      },
      {
        title: "Find the previous number.",
        lowerBound: 0,
        upperBound: 8,
        step: 1,
        numberShown: 3,
        indicesToGuess: [0], // Find the first number
        numberRandomLevel: 5,
        fixedLevels: [4, 7, 5, 2, 6, 1, 3, 8, 0],
        numberPropositions: 3
      },
      {
        title: "Find the in-between number.",
        lowerBound: 0,
        upperBound: 8,
        step: 1,
        numberShown: 3,
        indicesToGuess: [1], // Find the middle number
        numberRandomLevel: 5,
        fixedLevels: [4, 2, 7, 6, 3, 1, 0, 8],
        numberPropositions: 3
      },
      {
        title: "Find the missing numbers.",
        lowerBound: 0,
        upperBound: 8,
        step: 1,
        numberShown: 5,
        indicesToGuess: [1, 3], // Find two missing numbers
        numberRandomLevel: 5,
        fixedLevels: [3, 6, 4, 7, 2, 1, 0, 5, 8],
        numberPropositions: 5
      },
      {
        title: "Complete the sequence.",
        lowerBound: 0,
        upperBound: 10,
        step: 2,
        numberShown: 4,
        indicesToGuess: [1, 2], // Find two missing numbers in even sequence
        numberRandomLevel: 5,
        fixedLevels: [2, 8, 4, 6, 0, 10],
        numberPropositions: 4
      },
      {
        title: "What comes next?",
        lowerBound: 1,
        upperBound: 9,
        step: 1,
        numberShown: 4,
        indicesToGuess: [3], // Find the last number
        numberRandomLevel: 5,
        fixedLevels: [5, 3, 7, 9, 1, 8, 2, 6, 4],
        numberPropositions: 4
      }
    ];
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      currentLevel: this.currentLevel + 1,
      currentSubLevel: this.currentSubLevel + 1,
      totalLevels: this.levels.length,
      answerCompleted: this.answerCompleted,
      levelComplete: this.levelComplete
    };
  }
}