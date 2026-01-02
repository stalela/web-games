/**
 * Guesscount - Build mathematical expressions to reach target numbers
 * Educational game teaching arithmetic operations through drag-and-drop expression building
 */
import { DragDropGame } from './DragDropGame.js';
import { InputManager } from '../utils/InputManager.js';
import { DraggableTile } from '../components/DraggableTile.js';
import { DropZone } from '../components/DropZone.js';

export class Guesscount extends DragDropGame {
  constructor(config) {
    super({
      ...config,
      category: 'mathematics',
      difficulty: 3
    });

    // Game-specific properties
    this.currentLevel = 0;
    this.targetNumber = 0;
    this.availableOperands = [];
    this.availableOperators = ['+', '-', '×', '÷'];
    this.expressionRows = []; // Array of expression rows
    this.maxRows = 3; // Maximum number of expression rows

    // UI elements
    this.targetDisplay = null;
    this.expressionContainer = null;
    this.operandTray = null;
    this.operatorTray = null;

    // Game state
    this.currentExpression = [];
    this.isExpressionValid = false;
  }

  /**
   * Initialize the game
   */
  init(data) {
    super.init(data);

    // Use the provided input manager or create our own
    if (data.inputManager) {
      this.inputManager = data.inputManager;
    } else {
      // Fallback: create input manager for this scene if not provided
      this.inputManager = new InputManager(this);
    }

    // Setup game-specific UI
    this.setupUI();

    // Start the game
    this.startGame();
  }

  /**
   * Setup game UI elements
   */
  setupUI() {
    // Target number display (large and prominent)
    this.targetDisplay = this.add.text(
      this.scale.width / 2,
      80,
      'Target: 0',
      {
        fontSize: '36px',
        color: '#2c3e50',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    // Expression building area
    this.expressionContainer = this.add.container(this.scale.width / 2, 200);

    // Operand tray (bottom)
    this.createOperandTray();

    // Operator tray (right side)
    this.createOperatorTray();

    // Instructions
    this.instructionText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 60,
      'Drag numbers and operators to build expressions that equal the target!',
      {
        fontSize: '16px',
        color: '#34495e',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 2,
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  /**
   * Create the operand tray at the bottom
   */
  createOperandTray() {
    const trayY = this.scale.height - 120;
    const startX = 100;
    const spacing = 70;

    // Create operand tiles
    this.operandTray = [];
    for (let i = 0; i < this.availableOperands.length; i++) {
      const operand = this.availableOperands[i];
      const x = startX + i * spacing;

      const tile = new DraggableTile(this, {
        x: x,
        y: trayY,
        value: operand,
        text: operand.toString(),
        size: 50,
        color: 0x0062FF, // River Blue from brand guide
        originalPosition: { x: x, y: trayY }
      });

      this.operandTray.push(tile);
      this.draggableTiles.push(tile);
    }
  }

  /**
   * Create the operator tray on the right side
   */
  createOperatorTray() {
    const trayX = this.scale.width - 80;
    const startY = 200;
    const spacing = 70;

    // Create operator tiles
    this.operatorTray = [];
    for (let i = 0; i < this.availableOperators.length; i++) {
      const operator = this.availableOperators[i];
      const y = startY + i * spacing;

      const tile = new DraggableTile(this, {
        x: trayX,
        y: y,
        value: operator,
        text: operator,
        size: 50,
        color: 0xE32528, // Rooibos Red from brand guide
        originalPosition: { x: trayX, y }
      });

      this.operatorTray.push(tile);
      this.draggableTiles.push(tile);
    }
  }

  /**
   * Create expression rows for building the mathematical expression
   */
  createExpressionRows() {
    // Clear existing rows
    this.expressionRows.forEach(row => {
      row.zones.forEach(zone => zone.destroy());
      row.container.destroy();
    });
    this.expressionRows = [];
    this.dropZones = [];

    const rowHeight = 80;
    const startY = 180;
    const zoneWidth = 60;
    const zoneSpacing = 10;

    for (let rowIndex = 0; rowIndex < this.maxRows; rowIndex++) {
      const rowY = startY + rowIndex * rowHeight;
      const rowContainer = this.add.container(0, rowY);
      const zones = [];

      // Create 5 zones per row (can fit expressions like "2 + 3 × 4")
      for (let zoneIndex = 0; zoneIndex < 5; zoneIndex++) {
        const zoneX = (zoneIndex - 2) * (zoneWidth + zoneSpacing); // Center around 0

        const zone = new DropZone(this, {
          x: zoneX,
          y: 0,
          width: zoneWidth,
          height: zoneWidth,
          expectedValue: null, // Any value accepted
          acceptedValues: [...this.availableOperands, ...this.availableOperators],
          color: 0xFDFAED, // Warm Cream from brand guide
          label: '',
          showHighlight: true
        });

        zones.push(zone);
        this.dropZones.push(zone);
        rowContainer.add(zone);
      }

      this.expressionRows.push({
        container: rowContainer,
        zones: zones,
        expression: []
      });
    }

    this.expressionContainer.add(this.expressionRows.map(row => row.container));
  }

  /**
   * Start the game
   */
  startGame() {
    this.currentLevel = 0;
    this.initLevel();
  }

  /**
   * Initialize level data
   */
  initLevel() {
    // Load level data (simplified version)
    const levelData = this.getLevelData(this.currentLevel);

    // Set target number
    this.targetNumber = levelData.target;
    this.targetDisplay.setText(`Target: ${this.targetNumber}`);

    // Set available operands
    this.availableOperands = [...levelData.operands];

    // Reset expression
    this.currentExpression = [];
    this.isExpressionValid = false;

    // Create expression rows and trays
    this.createExpressionRows();
    this.createOperandTray();
    this.createOperatorTray();

    // Reset game state
    this.correctPlacements = 0;
    this.totalPlacements = 0;
    this.levelComplete = false;

    // Update score display
    this.updateScoreDisplay();
  }

  /**
   * Handle valid drop in expression building
   */
  handleValidDrop(tile, dropZone) {
    super.handleValidDrop(tile, dropZone);

    // Update the expression
    this.updateExpression();

    // Check if the expression evaluates to the target
    this.checkExpression();
  }

  /**
   * Update the current mathematical expression
   */
  updateExpression() {
    this.currentExpression = [];

    // Build expression from all zones that have tiles
    this.dropZones.forEach((zone, index) => {
      if (zone.currentTile) {
        this.currentExpression.push({
          value: zone.currentTile.value,
          type: this.isOperator(zone.currentTile.value) ? 'operator' : 'operand',
          zone: zone,
          index: index
        });
      }
    });

    // Validate the expression structure
    this.validateExpression();
  }

  /**
   * Check if the current expression equals the target
   */
  checkExpression() {
    if (!this.isExpressionValid) return;

    try {
      const result = this.evaluateExpression(this.currentExpression);
      if (result === this.targetNumber) {
        this.handleCorrectExpression();
      }
    } catch (error) {
      // Invalid expression, continue
      console.log('Expression evaluation error:', error.message);
    }
  }

  /**
   * Handle correct expression
   */
  handleCorrectExpression() {
    this.levelComplete = true;

    // Visual feedback
    this.showSuccessAnimation();

    // Play success sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('success');
    }

    // Show success message
    if (this.uiManager) {
      this.uiManager.showNotification(
        `Perfect! ${this.formatExpression(this.currentExpression)} = ${this.targetNumber}`,
        'success',
        3000
      );
    }

    // Move to next level after delay
    this.time.delayedCall(2000, () => {
      this.nextLevel();
    });
  }

  /**
   * Show success animation
   */
  showSuccessAnimation() {
    // Animate all zones in the expression
    this.currentExpression.forEach((item, index) => {
      this.tweens.add({
        targets: item.zone,
        scale: 1.2,
        duration: 300,
        delay: index * 100,
        yoyo: true,
        ease: 'Power2'
      });
    });
  }

  /**
   * Validate expression structure
   */
  validateExpression() {
    this.isExpressionValid = false;

    if (this.currentExpression.length === 0) return;

    // Basic validation: alternate operand-operator-operand...
    let expectOperand = true;
    let valid = true;

    for (const item of this.currentExpression) {
      const isOperand = item.type === 'operand';
      const isOperator = item.type === 'operator';

      if (expectOperand && !isOperand) {
        valid = false;
        break;
      }
      if (!expectOperand && !isOperator) {
        valid = false;
        break;
      }

      expectOperand = !expectOperand;
    }

    // Must end with operand
    if (this.currentExpression.length > 0) {
      const lastItem = this.currentExpression[this.currentExpression.length - 1];
      if (lastItem.type !== 'operand') {
        valid = false;
      }
    }

    this.isExpressionValid = valid;

    // Visual feedback for validity
    this.updateExpressionValidityDisplay();
  }

  /**
   * Update visual feedback for expression validity
   */
  updateExpressionValidityDisplay() {
    this.dropZones.forEach(zone => {
      if (zone.currentTile) {
        const isValid = this.isExpressionValid;
        zone.setHighlight(isValid);
        zone.background.setStrokeStyle(3, isValid ? 0x00B378 : 0xE32528); // Aloe Green : Rooibos Red
      } else {
        zone.setHighlight(false);
        zone.background.setStrokeStyle(3, 0x101012); // Ink Black from brand guide
      }
    });
  }

  /**
   * Evaluate the mathematical expression
   */
  evaluateExpression(expression) {
    if (!this.isExpressionValid || expression.length === 0) {
      throw new Error('Invalid expression');
    }

    // Simple left-to-right evaluation (no operator precedence)
    let result = parseInt(expression[0].value);

    for (let i = 1; i < expression.length; i += 2) {
      const operator = expression[i].value;
      const operand = parseInt(expression[i + 1].value);

      switch (operator) {
        case '+':
          result += operand;
          break;
        case '-':
          result -= operand;
          break;
        case '×':
          result *= operand;
          break;
        case '÷':
          if (operand === 0) throw new Error('Division by zero');
          result = Math.floor(result / operand); // Integer division
          break;
        default:
          throw new Error('Unknown operator');
      }
    }

    return result;
  }

  /**
   * Format expression for display
   */
  formatExpression(expression) {
    return expression.map(item => item.value).join(' ');
  }

  /**
   * Check if a value is an operator
   */
  isOperator(value) {
    return this.availableOperators.includes(value);
  }

  /**
   * Next level
   */
  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= this.getTotalLevels()) {
      this.handleGameComplete();
    } else {
      this.initLevel();
    }
  }

  /**
   * Handle game completion
   */
  handleGameComplete() {
    if (this.uiManager) {
      this.uiManager.showAchievementNotification('Math Master');
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
    return this.currentLevel * 100;
  }

  /**
   * Restart game
   */
  restartGame() {
    this.currentLevel = 0;
    this.initLevel();
  }

  /**
   * Return to menu
   */
  returnToMenu() {
    this.scene.start('GameMenu');
  }

  /**
   * Update score display
   */
  updateScoreDisplay() {
    // Implementation for score display
  }

  /**
   * Check level completion (override)
   */
  checkLevelCompletion() {
    return this.levelComplete;
  }

  /**
   * Reset tiles (override)
   */
  resetTiles() {
    // Reset all tiles to their trays
    this.draggableTiles.forEach(tile => {
      if (tile.isPlaced) {
        tile.returnToOriginalPosition();
        tile.setPlaced(false);
      }
    });

    // Clear drop zones
    this.dropZones.forEach(zone => {
      zone.removeTile();
    });

    // Reset expression
    this.currentExpression = [];
    this.isExpressionValid = false;
    this.updateExpressionValidityDisplay();
  }

  /**
   * Show hint
   */
  showHint() {
    if (this.uiManager) {
      this.uiManager.showTutorial(
        "Build expressions using numbers and operators that equal the target number!",
        "center"
      );
    }
  }

  /**
   * Get level data
   */
  getLevelData(level) {
    const levelData = [
      {
        target: 10,
        operands: [2, 3, 4, 5, 6],
        description: "Basic addition and subtraction"
      },
      {
        target: 24,
        operands: [2, 3, 4, 6, 8],
        description: "Multiplication introduction"
      },
      {
        target: 15,
        operands: [3, 5, 7, 9, 10],
        description: "Mixed operations"
      },
      {
        target: 8,
        operands: [2, 4, 6, 8, 12],
        description: "Division practice"
      }
    ];

    return levelData[level] || levelData[0];
  }

  /**
   * Get total levels
   */
  getTotalLevels() {
    return 4;
  }

  /**
   * Get game statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      currentLevel: this.currentLevel + 1,
      targetNumber: this.targetNumber,
      expressionValid: this.isExpressionValid,
      expression: this.formatExpression(this.currentExpression)
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clean up expression rows
    if (this.expressionRows) {
      this.expressionRows.forEach(row => {
        row.zones.forEach(zone => zone.destroy());
        row.container.destroy();
      });
    }

    // Clean up trays
    if (this.operandTray) {
      this.operandTray.forEach(tile => tile.destroy());
    }
    if (this.operatorTray) {
      this.operatorTray.forEach(tile => tile.destroy());
    }

    super.destroy();
  }
}