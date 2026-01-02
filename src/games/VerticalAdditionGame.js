/**
 * VerticalAdditionGame - Column-based addition with carrying
 * Interactive column addition teaching formal addition methods
 * Based on GCompris vertical_addition activity
 */
import { InteractiveGame } from './InteractiveGame.js';

export class VerticalAdditionGame extends InteractiveGame {
  constructor(config) {
    super({
      category: 'math',
      difficulty: 3,
      ...config
    });

    // Game configuration
    this.currentProblem = null;
    this.playerAnswers = [];
    this.carries = [];
    this.selectedColumn = 0;
    this.selectedRow = 0;
    this.level = 1;
    this.subLevel = 1;
    this.subLevelCount = 10; // GCompris style: 10 exercises per level

    // Level configuration based on GCompris data
    this.levels = [
      {
        objective: "2-digit addition without carrying",
        difficulty: 3,
        digits: 2,
        lines: 2,
        withCarry: false,
        examples: [
          { numbers: [12, 23], answer: 35 },
          { numbers: [34, 15], answer: 49 },
          { numbers: [27, 12], answer: 39 },
          { numbers: [45, 24], answer: 69 },
          { numbers: [18, 31], answer: 49 }
        ]
      },
      {
        objective: "2-digit addition with carrying",
        difficulty: 4,
        digits: 2,
        lines: 2,
        withCarry: true,
        examples: [
          { numbers: [27, 18], answer: 45 },
          { numbers: [39, 26], answer: 65 },
          { numbers: [48, 17], answer: 65 },
          { numbers: [56, 29], answer: 85 },
          { numbers: [67, 38], answer: 105 }
        ]
      },
      {
        objective: "2-digit, 3-number addition",
        difficulty: 5,
        digits: 2,
        lines: 3,
        withCarry: true,
        examples: [
          { numbers: [12, 23, 15], answer: 50 },
          { numbers: [34, 25, 18], answer: 77 },
          { numbers: [27, 19, 24], answer: 70 },
          { numbers: [45, 16, 22], answer: 83 },
          { numbers: [38, 27, 19], answer: 84 }
        ]
      }
    ];
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load GCompris wood background
    this.load.svg('background-wood', 'assets/game-icons/background-wood.svg');

    // Load UI control icons for navigation dock
    const uiIcons = ['exit.svg', 'settings.svg', 'help.svg', 'home.svg'];
    uiIcons.forEach(icon => {
      this.load.svg(icon.replace('.svg', ''), `assets/category-icons/${icon}`);
    });
  }

  /**
   * Override InteractiveGame methods to prevent conflicts
   */
  startNextObjective() {
    // VerticalAdditionGame handles its own game flow
  }

  onObjectiveStart(objective) {
    // VerticalAdditionGame handles its own game flow
  }

  createInteractiveElements() {
    // VerticalAdditionGame creates its own interactive elements
  }

  /**
   * Override createBackground to use GCompris wood texture
   */
  createBackground() {
    const { width, height } = this.game.config;

    // Use GCompris wood background - absolute base layer
    this.background = this.add.image(width / 2, height / 2, 'background-wood');
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);
  }

  /**
   * Create game UI
   */
  createGameUI() {
    // Create background first
    this.createBackground();

    const { width, height } = this.game.config;

    // Instruction Panel (GCTextPanel equivalent)
    const panelWidth = width - 120; // Leave space for score/progress
    const panelHeight = 60;
    this.instructionPanel = this.add.container(width / 2 - 60, 30); // Offset for score space

    // Panel background - dark semi-transparent rounded rectangle
    const panelBg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.7);
    panelBg.setStrokeStyle(2, 0xFFFFFF, 0.3);
    panelBg.setOrigin(0.5);

    // Panel text - white text
    this.headerText = this.add.text(0, 0, 'Solve: 42 + 24', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    this.instructionPanel.add([panelBg, this.headerText]);
    this.instructionPanel.setDepth(10);

    // Progress badge in top-right
    this.progressBadge = this.add.container(width - 60, 30);
    this.progressBadge.setDepth(10);
    const badgeBg = this.add.circle(0, 0, 25, 0x4CAF50);
    this.progressText = this.add.text(0, 0, '1/10', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.progressBadge.add([badgeBg, this.progressText]);

    // Instructions
    this.instructionText = this.add.text(width / 2, 120, 'Click on the boxes to enter your answers!\nAdd from right to left, carrying over when needed.', {
      fontSize: '20px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    // Create the addition grid area
    this.createAdditionGrid();

    // Create control buttons (OK button)
    this.createControlButtons();

    // Feedback text (positioned below the grid)
    this.feedbackText = this.add.text(width / 2, height / 2 + 150, '', {
      fontSize: '24px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    // Create navigation dock
    this.createNavigationDock(width, height);
  }

  /**
   * Create navigation dock (GCompris style bottom dock)
   */
  createNavigationDock(width, height) {
    const dockY = height - 80;
    const buttonSize = 90;
    const spacing = 130;

    // Dock background
    const dockBg = this.add.graphics();
    dockBg.fillStyle(0xFFFFFF, 0.95);
    dockBg.fillRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);
    dockBg.setDepth(100);

    // Dock shadow
    const dockShadow = this.add.graphics();
    dockShadow.fillStyle(0x000000, 0.3);
    dockShadow.fillRoundedRect(width / 2 - (width - 60) / 2 + 4, dockY - 56, width - 60, 120, 60);
    dockShadow.setDepth(99);

    // Dock border
    const dockBorder = this.add.graphics();
    dockBorder.lineStyle(5, 0x0062FF, 1);
    dockBorder.strokeRoundedRect(width / 2 - (width - 60) / 2, dockY - 60, width - 60, 120, 60);
    dockBorder.setDepth(100);

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

      // Button shadow
      const buttonShadow = this.add.circle(x + 4, dockY + 4, buttonSize / 2, 0x000000, 0.4);
      buttonShadow.setDepth(100);

      // Button
      const button = this.add.circle(x, dockY, buttonSize / 2, control.color);
      button.setStrokeStyle(5, 0xFFFFFF);
      button.setInteractive({ useHandCursor: true });
      button.setDepth(100);

      // Icon
      const icon = this.add.sprite(x, dockY, control.icon.replace('.svg', ''));
      icon.setScale((buttonSize * 0.7) / 100);
      icon.setTint(0xFFFFFF);
      icon.setDepth(101);

      // Label
      const label = this.add.text(x, dockY + buttonSize / 2 + 20, control.label, {
        fontSize: '14px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }).setOrigin(0.5).setDepth(101);

      // Click handler
      button.on('pointerdown', () => this.onNavigationClick(control.action));
    });
  }

  /**
   * Show or hide interactive elements (grid and OK button)
   * Used when modals are displayed to prevent layering conflicts
   */
  setInteractiveElementsVisible(visible) {
    if (this.gridContainer) {
      this.gridContainer.setVisible(visible);
    }
    if (this.okButton) {
      this.okButton.setVisible(visible && this.okButton.visible); // Respect OK button's own visibility logic
    }
  }

  /**
   * Restore interactive elements after modal closes
   */
  restoreInteractiveElements() {
    this.setInteractiveElementsVisible(true);
  }

  /**
   * Handle navigation dock clicks
   */
  onNavigationClick(action) {
    switch (action) {
      case 'help':
        // Hide interactive elements before showing help modal
        this.setInteractiveElementsVisible(false);
        // Show help modal using HelpSystem
        if (this.helpSystem) {
          this.helpSystem.showHelpModal('VerticalAdditionGame');
        }
        break;
      case 'home':
      case 'menu':
        // Go to main menu
        this.scene.start('GameMenu');
        break;
      case 'levels':
        // Show level selection (TODO: implement)
        console.log('Levels clicked');
        break;
    }
  }

  /**
   * Create the addition grid where players enter answers
   */
  createAdditionGrid() {
    const { width, height } = this.game.config;

    // Perfect center-stage layout: calculate total grid height and center between top panel and navigation dock
    const safeTopY = 90; // Top panel bottom (panel at y=30, height=60)
    const safeBottomY = height - 140; // Navigation dock top (dock at height-80, extends 60px up)
    const safeAreaHeight = safeBottomY - safeTopY;

    // Calculate actual grid dimensions for perfect centering
    const cellWidth = 60;
    const cellHeight = 60;
    const spacing = 5;
    const digits = 2; // Will be updated when problem is generated
    const lines = 2;  // Will be updated when problem is generated
    const gridWidth = digits * cellWidth + (digits - 1) * spacing;
    const gridHeight = lines * cellHeight + (lines - 1) * spacing + 40; // Extra for separator and result

    const gridX = width / 2;
    const gridY = safeTopY + safeAreaHeight / 2;

    // Container for the entire addition problem
    this.gridContainer = this.add.container(gridX, gridY);
    this.gridContainer.setDepth(10);

    // We'll create the grid dynamically based on the current problem
    this.additionGrid = [];
    this.playerAnswers = [];
    this.carries = [];
  }

  /**
   * Create control buttons
   */
  createControlButtons() {
    const { width, height } = this.game.config;

    // Position OK button to the immediate right of the addition problem
    // Will be repositioned when grid is created in createVisualGrid
    const okButtonX = width / 2 + 150; // Initial position, will be updated
    const okButtonY = height / 2; // Vertically centered with grid

    // Massive circular green OK button with drop shadow
    this.okButton = this.add.container(okButtonX, okButtonY);

    // Drop shadow
    const shadowOffset = 4;
    const okButtonShadow = this.add.circle(shadowOffset, shadowOffset, 52, 0x000000, 0.3);
    okButtonShadow.setDepth(14);

    const buttonRadius = 50;
    const okButtonBg = this.add.circle(0, 0, buttonRadius, 0x4CAF50); // Green
    okButtonBg.setStrokeStyle(5, 0xFFFFFF); // Thicker white stroke
    okButtonBg.setInteractive();

    const okText = this.add.text(0, 0, 'OK', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    this.okButton.add([okButtonShadow, okButtonBg, okText]);
    this.okButton.setDepth(15);

    // Initially hide OK button until user enters some input
    this.okButton.setVisible(false);

    // Click handler
    okButtonBg.on('pointerdown', () => this.checkAnswer());
  }

  /**
   * Enable or disable the OK button with visual feedback
   */
  setOkButtonEnabled(enabled) {
    if (!this.okButton) return;

    const buttonBg = this.okButton.getAt(0);
    const buttonText = this.okButton.getAt(1);

    if (enabled) {
      buttonBg.setFillStyle(0x4CAF50); // Green when enabled
      buttonBg.setInteractive();

      // Add pulsing animation when enabled
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scale: 1.1,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      buttonBg.setFillStyle(0xCCCCCC); // Grey when disabled
      buttonBg.disableInteractive();

      // Stop pulsing animation
      this.tweens.killTweensOf([buttonBg, buttonText]);
      buttonBg.setScale(1);
      buttonText.setScale(1);
    }
  }


  /**
   * Create a simple button
   */
  createButton(x, y, text, callback) {
    const buttonBg = this.add.rectangle(x, y, 120, 50, 0x0062FF);
    buttonBg.setStrokeStyle(2, 0xFFFFFF);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    // Make interactive
    buttonBg.setInteractive();
    buttonText.setInteractive();

    const handleClick = () => callback();

    buttonBg.on('pointerdown', handleClick);
    buttonText.on('pointerdown', handleClick);

    buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x0044AA));
    buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x0062FF));

    return { bg: buttonBg, text: buttonText };
  }

  /**
   * Generate a new addition problem
   */
  generateProblem() {
    // Ensure UI is initialized before proceeding
    if (!this.progressText || !this.instructionText) {
      console.warn('VerticalAdditionGame: UI not fully initialized, delaying generateProblem');
      this.time.delayedCall(100, () => this.generateProblem());
      return;
    }

    const levelData = this.levels[this.level - 1];

    // Pick a random example from the current level
    const randomIndex = Math.floor(Math.random() * levelData.examples.length);
    const example = levelData.examples[randomIndex];

    this.currentProblem = {
      numbers: example.numbers,
      answer: example.answer,
      digits: levelData.digits,
      lines: levelData.lines,
      withCarry: levelData.withCarry
    };

    // Initialize answer grid
    this.initializeAnswerGrid();

    // Display the problem
    this.displayProblem();

    // Update progress badge
    this.progressText.setText(`${this.subLevel}/${this.subLevelCount}`);

    // Update instruction text
    const operationString = this.currentProblem.numbers.join(' + ');
    this.headerText.setText(`Solve: ${operationString}`);
  }

  /**
   * Initialize the answer grid
   */
  initializeAnswerGrid() {
    // Clear existing grid
    if (this.additionGrid) {
      this.additionGrid.forEach(row => {
        row.forEach(cell => {
          if (cell && cell.destroy) cell.destroy();
        });
      });
    }

    const digits = this.currentProblem.digits;
    const lines = this.currentProblem.lines;

    this.additionGrid = [];
    this.playerAnswers = [];
    this.carries = [];

    // Initialize answer arrays
    for (let col = 0; col < digits; col++) {
      this.playerAnswers[col] = 0;
      this.carries[col] = 0;
    }

    // Start cursor at rightmost column (units place)
    this.selectedColumn = digits - 1;

    // Create visual grid
    this.createVisualGrid();
  }

  /**
   * Create the visual grid for the addition problem
   */
  createVisualGrid() {
    const digits = this.currentProblem.digits;
    const lines = this.currentProblem.lines;

    // Clear container
    this.gridContainer.removeAll();

    const cellWidth = 60;
    const cellHeight = 60;
    const spacing = 5;

    // Calculate grid dimensions and reposition container for perfect centering
    const totalWidth = digits * cellWidth + (digits - 1) * spacing;
    const totalHeight = lines * cellHeight + (lines - 1) * spacing + 40; // Extra space for separator and result

    // Reposition the grid container for perfect centering between top panel and navigation dock
    const safeTopY = 90; // Top panel bottom
    const safeBottomY = this.game.config.height - 140; // Navigation dock top
    const safeAreaHeight = safeBottomY - safeTopY;
    this.gridContainer.setPosition(this.game.config.width / 2, safeTopY + safeAreaHeight / 2);

    // Starting position within the container (centered)
    const startX = -totalWidth / 2;
    const startY = -totalHeight / 2;

    // Create number rows
    for (let row = 0; row < lines; row++) {
      for (let col = 0; col < digits; col++) {
        const x = startX + col * (cellWidth + spacing);
        const y = startY + row * (cellHeight + spacing);

        // Get the digit for this position
        const number = this.currentProblem.numbers[row];
        const digit = Math.floor(number / Math.pow(10, digits - 1 - col)) % 10;

        // Create cell background - GCompris sticker style: white with thick black border and rounded corners
        const cellBg = this.add.graphics();
        cellBg.fillStyle(0xFFFFFF);
        cellBg.fillRoundedRect(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight, 10);
        cellBg.lineStyle(4, 0x000000);
        cellBg.strokeRoundedRect(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight, 10);

        // Create digit text - chunky 40px for problem numbers
        const digitText = this.add.text(x, y, digit.toString(), {
          fontSize: '40px',
          color: '#000000',
          fontFamily: 'Fredoka One, cursive',
          align: 'center'
        }).setOrigin(0.5);

        this.gridContainer.add(cellBg);
        this.gridContainer.add(digitText);
      }
    }

    // Create thick horizontal separator line above result row (6px solid black)
    const lineY = startY + lines * (cellHeight + spacing) + spacing;
    const lineWidth = digits * (cellWidth + spacing) - spacing;
    const additionLine = this.add.graphics();
    additionLine.fillStyle(0x000000);
    additionLine.fillRect(-lineWidth/2, lineY - 3, lineWidth, 6);
    this.gridContainer.add(additionLine);

    // Create plus signs on the left between rows (except last row)
    for (let row = 0; row < lines - 1; row++) {
      const plusY = startY + row * (cellHeight + spacing) + cellHeight / 2 + spacing / 2;
      const plusX = startX - 25;

      const plusText = this.add.text(plusX, plusY, '+', {
        fontSize: '28px',
        color: '#000000',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }).setOrigin(0.5);

      this.gridContainer.add(plusText);
    }

    // Create answer row below the addition line
    const answerY = lineY + spacing + cellHeight / 2;
    for (let col = 0; col < digits + (this.currentProblem.answer >= Math.pow(10, digits) ? 1 : 0); col++) {
      const x = startX + col * (cellWidth + spacing);
      const y = answerY;

      // Create answer cell (interactive) - GCompris sticker style: white with thick black border and rounded corners
      const answerBg = this.add.graphics();
      answerBg.fillStyle(0xFFFFFF);
      answerBg.fillRoundedRect(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight, 10);
      answerBg.lineStyle(4, 0x000000);
      answerBg.strokeRoundedRect(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight, 10);
      answerBg.setInteractive(new Phaser.Geom.Rectangle(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight), Phaser.Geom.Rectangle.Contains);

      // Create answer text (initially empty) - chunky 48px for result numbers
      const answerText = this.add.text(x, y, '', {
        fontSize: '48px',
        color: '#000000',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }).setOrigin(0.5);

      // Make the cell clickable
      answerBg.on('pointerdown', () => this.selectAnswerCell(col));

      this.gridContainer.add(answerBg);
      this.gridContainer.add(answerText);

      // Store references
      if (!this.additionGrid[col]) this.additionGrid[col] = [];
      this.additionGrid[col].push({ bg: answerBg, text: answerText });
    }

    // Add carry indicators if needed (above top number row)
    if (this.currentProblem.withCarry) {
      const carryY = startY - 25;
      this.createCarryIndicators(startX, carryY, cellWidth, spacing, digits);
    }

    // Reposition OK button to immediate right of the addition problem
    if (this.okButton) {
      const gridRightEdge = this.gridContainer.x + totalWidth / 2;
      const okButtonX = gridRightEdge + 80; // 80px gap from grid edge
      const okButtonY = this.gridContainer.y; // Vertically aligned with grid center
      this.okButton.setPosition(okButtonX, okButtonY);
    }

    // Update highlights to show initial selection
    this.updateAnswerCellHighlights();
  }

  /**
   * Create carry indicators above columns
   */
  createCarryIndicators(startX, carryY, cellWidth, spacing, digits) {
    for (let col = 0; col < digits; col++) {
      const x = startX + col * (cellWidth + spacing);

      // Carry background (small circle above top row - GCompris sticker style)
      const carryBg = this.add.graphics();
      carryBg.fillStyle(0xFFFFFF);
      carryBg.fillCircle(x, carryY, 10);
      carryBg.lineStyle(2, 0x000000);
      carryBg.strokeCircle(x, carryY, 10);

      // Carry text (initially empty)
      const carryText = this.add.text(x, carryY, '', {
        fontSize: '14px',
        color: '#000000',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }).setOrigin(0.5);

      this.gridContainer.add(carryBg);
      this.gridContainer.add(carryText);
    }
  }

  /**
   * Display the current problem
   */
  displayProblem() {
    // The problem is already displayed in the grid
    // Update any additional UI elements if needed
  }

  /**
   * Select an answer cell (cycles through 0-9 when clicked)
   */
  selectAnswerCell(column) {
    // Cycle through numbers 0-9 for the selected column
    const currentValue = this.playerAnswers[column] || 0;
    this.playerAnswers[column] = (currentValue + 1) % 10;

    // Update visual display
    this.updateAnswerDisplay();

    // Right-to-left solving: move left after each entry
    if (column > 0) {
      this.selectedColumn = column - 1;
    } else {
      // At leftmost column, stay there
      this.selectedColumn = column;
    }

    this.updateAnswerCellHighlights();

    this.playSound('click');
  }

  /**
   * Update answer cell highlights
   */
  updateAnswerCellHighlights() {
    this.additionGrid.forEach((column, colIndex) => {
      column.forEach(cell => {
        if (cell && cell.bg) {
          // Clear existing highlight graphics
          if (cell.highlightBg) {
            cell.highlightBg.destroy();
            cell.highlightBg = null;
          }
          if (cell.glowEffect) {
            cell.glowEffect.destroy();
            cell.glowEffect = null;
          }

          if (colIndex === this.selectedColumn) {
            // Create Lalela Yellow background for selected cell
            cell.highlightBg = this.add.graphics();
            cell.highlightBg.fillStyle(0xFACA2A); // Lalela Yellow
            cell.highlightBg.fillRoundedRect(cell.bg.x - cell.bg.width/2, cell.bg.y - cell.bg.height/2, cell.bg.width, cell.bg.height, 10);
            cell.highlightBg.setDepth(cell.bg.depth + 1);
            this.gridContainer.add(cell.highlightBg);

            // Create pulsing white inner glow effect
            cell.glowEffect = this.add.graphics();
            cell.glowEffect.lineStyle(3, 0xFFFFFF, 0.8);
            cell.glowEffect.strokeRoundedRect(cell.bg.x - cell.bg.width/2 + 2, cell.bg.y - cell.bg.height/2 + 2, cell.bg.width - 4, cell.bg.height - 4, 8);
            cell.glowEffect.setDepth(cell.bg.depth + 2);
            this.gridContainer.add(cell.glowEffect);

            // Add pulsing animation to glow
            this.tweens.add({
              targets: cell.glowEffect,
              alpha: 0.3,
              duration: 800,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        }
      });
    });
  }


  /**
   * Update the answer display
   */
  updateAnswerDisplay() {
    this.additionGrid.forEach((column, colIndex) => {
      if (column && column[0] && column[0].text) {
        const digit = this.playerAnswers[colIndex] || 0;
        column[0].text.setText(digit.toString());
      }
    });

    // Check if any cells are filled to show OK button, enable only when all filled
    const anyFilled = this.playerAnswers.some(answer => answer !== undefined && answer !== null && answer !== 0);
    const allFilled = this.playerAnswers.every(answer => answer !== undefined && answer !== null && answer !== 0);

    // Show OK button when any input is entered
    if (anyFilled && !this.okButton.visible) {
      this.okButton.setVisible(true);
    }

    // Enable OK button only when all answers are filled
    this.setOkButtonEnabled(allFilled);
  }

  /**
   * Clear all answers
   */
  clearAnswers() {
    this.playerAnswers = this.playerAnswers.map(() => 0);
    this.carries = this.carries.map(() => 0);
    this.selectedColumn = 0;

    this.updateAnswerDisplay();
    this.updateAnswerCellHighlights();
    this.feedbackText.setText('');

    this.playSound('click');
  }

  /**
   * Check the player's answer
   */
  checkAnswer() {
    // Convert player answers to a number
    let playerResult = 0;
    for (let i = 0; i < this.playerAnswers.length; i++) {
      playerResult += this.playerAnswers[i] * Math.pow(10, this.playerAnswers.length - 1 - i);
    }

    if (playerResult === this.currentProblem.answer) {
      // Correct answer!
      this.showFeedback('Excellent! 🎉', '#00B378');
      this.playSound('success');

      // Celebrate with animations
      this.celebrateCorrect();

      // Next problem after delay
      this.time.delayedCall(2500, () => this.nextProblem());
    } else {
      // Incorrect answer
      this.showFeedback(`Not quite! The answer is ${this.currentProblem.answer}. Try again!`, '#FF6B6B');
      this.playSound('error');

      // Shake the grid with rotation
      this.tweens.add({
        targets: this.gridContainer,
        rotation: Phaser.Math.DegToRad(5), // +5 degrees
        duration: 100,
        yoyo: true,
        repeat: 5,
        ease: 'Power2'
      });
    }
  }

  /**
   * Celebrate correct answer
   */
  celebrateCorrect() {
    // Scale up the entire grid container with bouncy Back.easeOut animation
    this.tweens.add({
      targets: this.gridContainer,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      ease: 'Back.easeOut' // Bouncy easing for celebration
    });

    // Create star particle burst
    for (let i = 0; i < 30; i++) {
      const particle = this.add.star(this.gridContainer.x, this.gridContainer.y, 5, 2, 4, 0xFFD700);
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 200;

      this.tweens.add({
        targets: particle,
        x: this.gridContainer.x + Math.cos(angle) * speed,
        y: this.gridContainer.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Show feedback text
   */
  showFeedback(text, color) {
    if (this.feedbackText) {
      this.feedbackText.setText(text);
      this.feedbackText.setColor(color);
    }
  }

  /**
   * Move to next problem
   */
  nextProblem() {
    // Clear current answers
    this.clearAnswers();

    // Advance sublevel
    this.subLevel++;
    if (this.subLevel > this.subLevelCount) {
      // Level completed, advance to next level
      this.subLevel = 1;
      this.advanceLevel();
    } else {
      // Continue with current level
      this.generateProblem();
    }

    // Clear feedback
    this.feedbackText.setText('');
  }

  /**
   * Advance to next level
   */
  advanceLevel() {
    if (this.level < this.levels.length) {
      this.level++;
      this.showFeedback(`Level ${this.level}!`, '#FACA2A');
      this.generateProblem();
    } else {
      this.showFeedback('All levels completed! 🎊', '#00B378');
    }
  }

  /**
   * Start the game
   */
  create() {
    // Call super.create() first to ensure parent class sets up the base world
    super.create();

    // Create game UI after parent setup
    this.createGameUI();
  }

  /**
   * Setup game logic - called from parent class create() method
   */
  setupGameLogic() {
    // Start with first level
    this.generateProblem();
  }


  /**
   * Play sound effect
   */
  playSound(soundName) {
    // For now, just log - we'll implement proper audio later
    console.log(`Playing sound: ${soundName}`);
  }

  /**
   * Update method - called every frame
   */
  update(time, delta) {
    // Game logic updates if needed
  }

  /**
   * Clean up when game ends
   */
  shutdown() {
    super.shutdown();
  }
}