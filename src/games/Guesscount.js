/**
 * Guesscount - Build mathematical expressions to reach target numbers
 * Educational game teaching arithmetic operations through drag-and-drop expression building
 * GCompris-style implementation
 */
import { LalelaGame } from '../utils/LalelaGame.js';

export class Guesscount extends LalelaGame {
  constructor(config) {
    super({
      ...config,
      key: 'Guesscount',
      title: 'Guesscount',
      description: 'Build expressions to reach target numbers',
      category: 'mathematics'
    });

    // Game state
    this.currentLevel = 1;
    this.currentSubLevel = 0;
    this.totalSubLevels = 4;
    this.targetNumber = 0;
    this.availableOperands = [];
    this.availableOperators = ['+'];
    this.expressionSlots = [];
    this.result = null;
  }

  preload() {
    super.preload();
    
    // Load wood background
    this.load.svg('wood-bg', 'assets/details/resource/backgroundW01.svg');
    
    // Load navigation icons
    this.load.svg('home', 'assets/game-icons/bar_home.svg');
    this.load.svg('help', 'assets/game-icons/bar_help.svg');
    this.load.svg('bar_prev', 'assets/game-icons/bar_previous.svg');
    this.load.svg('bar_next', 'assets/game-icons/bar_next.svg');
    this.load.svg('config', 'assets/game-icons/bar_config.svg');
  }

  createBackground() {
    const { width, height } = this.scale;
    
    // Wood background like GCompris
    this.add.image(width / 2, height / 2, 'wood-bg')
      .setDisplaySize(width, height)
      .setDepth(-2);
  }

  createUI() {
    super.createUI();
    this.createTopBar();
    this.createNavigationDock();
  }

  createTopBar() {
    const { width, height } = this.scale;
    
    // Progress indicator (0/4 format on left)
    const progressBg = this.add.rectangle(50, 35, 60, 45, 0xFFFFFF, 0.95);
    progressBg.setStrokeStyle(2, 0x333333);
    progressBg.setDepth(50);
    
    this.progressText = this.add.text(50, 35, `${this.currentSubLevel}/${this.totalSubLevels}`, {
      fontSize: '22px', color: '#333333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(51);
    
    // Target display (GCompris style - orange border, white background)
    const targetWidth = Math.min(700, width * 0.7);
    const targetBg = this.add.rectangle(width / 2 + 30, 35, targetWidth, 50, 0xFFF8F0, 1);
    targetBg.setStrokeStyle(4, 0xF08A00);
    targetBg.setDepth(50);
    
    this.targetDisplay = this.add.text(width / 2 + 30, 35, 'Guesscount: 0', {
      fontSize: '26px', color: '#333333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(51);
  }

  createNavigationDock() {
    const { width, height } = this.scale;
    const barY = height - 60;
    const buttonSize = 60;
    const spacing = 80;

    const controls = [
      { icon: 'help', action: 'help', color: 0x00B378 },
      { icon: 'home', action: 'home', color: 0x4FC3F7 },
      { icon: 'bar_prev', action: 'prev', color: 0xF08A00 },
    ];

    let startX = 130;
    controls.forEach((control, index) => {
      const x = startX + index * spacing;
      this.createCircularNavButton(x, barY, buttonSize, control);
    });

    // Level indicator
    this.levelText = this.add.text(startX + 3 * spacing, barY, `${this.currentLevel}`, {
      fontSize: '32px', color: '#333333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);

    // Next and config buttons
    this.createCircularNavButton(startX + 4 * spacing, barY, buttonSize, 
      { icon: 'bar_next', action: 'next', color: 0xF08A00 });
    this.createCircularNavButton(startX + 5 * spacing, barY, buttonSize,
      { icon: 'config', action: 'menu', color: 0x9C6ADE });
  }

  createCircularNavButton(x, y, buttonSize, control) {
    const button = this.add.graphics();
    button.fillStyle(control.color);
    button.fillCircle(x, y, buttonSize / 2);
    button.lineStyle(3, 0xFFFFFF, 0.9);
    button.strokeCircle(x, y, buttonSize / 2);
    button.setInteractive(
      new Phaser.Geom.Circle(x, y, buttonSize / 2),
      Phaser.Geom.Circle.Contains
    );
    button.setDepth(100);

    const icon = this.add.sprite(x, y, control.icon);
    icon.setScale((buttonSize * 0.55) / Math.max(icon.width, icon.height));
    icon.setTint(0xFFFFFF);
    icon.setDepth(101);

    button.on('pointerdown', () => this.handleNavAction(control.action));
  }

  handleNavAction(action) {
    switch (action) {
      case 'home':
        this.scene.start('GameMenu');
        break;
      case 'help':
        this.showHelpModal();
        break;
      case 'prev':
        if (this.currentLevel > 1) {
          this.currentLevel--;
          this.initLevel();
        }
        break;
      case 'next':
        this.currentLevel = Math.min(this.currentLevel + 1, 4);
        this.initLevel();
        break;
      case 'menu':
        this.scene.start('GameMenu');
        break;
    }
  }

  showHelpModal() {
    if (this.helpModal) return;

    const { width, height } = this.scale;
    this.helpModal = this.add.container(width / 2, height / 2).setDepth(200);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setInteractive();

    const panel = this.add.rectangle(0, 0, 500, 350, 0xffffff, 1);
    panel.setStrokeStyle(3, 0xF08A00);

    const title = this.add.text(0, -140, 'Guesscount', {
      fontSize: '32px', color: '#2c3e50', fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructions = this.add.text(0, 20,
      'Build an expression that equals the target!\n\n' +
      '• Drag numbers from the Numbers row\n' +
      '• Drag operators from the Operators row\n' +
      '• Drop them into the expression slots\n' +
      '• Build: Number Operator Number = Result',
      { fontSize: '20px', color: '#333333', align: 'center', lineSpacing: 8 }
    ).setOrigin(0.5);

    const closeBtn = this.add.text(0, 145, 'Got it!', {
      fontSize: '24px', color: '#ffffff', backgroundColor: '#00B378', padding: { x: 30, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      this.helpModal.destroy();
      this.helpModal = null;
    });

    this.helpModal.add([overlay, panel, title, instructions, closeBtn]);
  }

  setupGameLogic() {
    this.initLevel();
  }

  initLevel() {
    // Clear existing elements
    this.clearGameElements();
    
    // Get level data
    const levelData = this.getLevelData();
    this.targetNumber = levelData.target;
    this.availableOperands = levelData.operands;
    this.availableOperators = levelData.operators;
    
    // Update displays
    if (this.targetDisplay) {
      this.targetDisplay.setText(`Guesscount: ${this.targetNumber}`);
    }
    if (this.progressText) {
      this.progressText.setText(`${this.currentSubLevel}/${this.totalSubLevels}`);
    }
    if (this.levelText) {
      this.levelText.setText(`${this.currentLevel}`);
    }
    
    // Create game elements
    this.createOperatorRow();
    this.createOperandRow();
    this.createExpressionRow();
  }

  clearGameElements() {
    // Clear operator tiles
    if (this.operatorTiles) {
      this.operatorTiles.forEach(t => { if (t.container) t.container.destroy(); });
    }
    this.operatorTiles = [];
    
    // Clear operand tiles
    if (this.operandTiles) {
      this.operandTiles.forEach(t => { if (t.container) t.container.destroy(); });
    }
    this.operandTiles = [];
    
    // Clear expression elements
    if (this.expressionElements) {
      this.expressionElements.forEach(e => { if (e.destroy) e.destroy(); });
    }
    this.expressionElements = [];
    
    // Clear row backgrounds
    if (this.rowBgs) {
      this.rowBgs.forEach(bg => { if (bg.destroy) bg.destroy(); });
    }
    this.rowBgs = [];
  }

  createOperatorRow() {
    const { width, height } = this.scale;
    const rowY = 100;
    const rowHeight = 60;
    
    this.rowBgs = this.rowBgs || [];
    
    // "Operators" label box (pink/red border)
    const labelWidth = width * 0.28;
    const labelBg = this.add.rectangle(20 + labelWidth / 2, rowY, labelWidth, rowHeight, 0xFAFAFA, 1);
    labelBg.setStrokeStyle(4, 0xE16F6F);
    labelBg.setDepth(5);
    this.rowBgs.push(labelBg);
    
    const labelText = this.add.text(20 + labelWidth / 2, rowY, 'Operators', {
      fontSize: '24px', color: '#333333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rowBgs.push(labelText);
    
    // Operator tiles
    const startX = 20 + labelWidth + 20;
    const tileSize = 55;
    const spacing = 65;
    
    this.operatorTiles = [];
    this.availableOperators.forEach((op, i) => {
      const x = startX + i * spacing + tileSize / 2;
      const tile = this.createDraggableTile(x, rowY, op, 'operator', tileSize, 0xFAFAFA, 0xE16F6F);
      this.operatorTiles.push(tile);
    });
  }

  createOperandRow() {
    const { width, height } = this.scale;
    const rowY = 175;
    const rowHeight = 60;
    
    // "Numbers" label box (green border)
    const labelWidth = width * 0.28;
    const labelBg = this.add.rectangle(20 + labelWidth / 2, rowY, labelWidth, rowHeight, 0xFAFAFA, 1);
    labelBg.setStrokeStyle(4, 0x75D21B);
    labelBg.setDepth(5);
    this.rowBgs.push(labelBg);
    
    const labelText = this.add.text(20 + labelWidth / 2, rowY, 'Numbers', {
      fontSize: '24px', color: '#333333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.rowBgs.push(labelText);
    
    // Number tiles
    const startX = 20 + labelWidth + 20;
    const tileSize = 55;
    const spacing = 65;
    
    this.operandTiles = [];
    this.availableOperands.forEach((num, i) => {
      const x = startX + i * spacing + tileSize / 2;
      const tile = this.createDraggableTile(x, rowY, num, 'operand', tileSize, 0xFAFAFA, 0x75D21B);
      this.operandTiles.push(tile);
    });
  }

  createDraggableTile(x, y, value, type, size, fillColor, borderColor) {
    const container = this.add.container(x, y).setDepth(20);
    
    const bg = this.add.rectangle(0, 0, size, size, fillColor, 1);
    bg.setStrokeStyle(3, borderColor);
    
    const text = this.add.text(0, 0, value.toString(), {
      fontSize: '26px', color: '#333333', fontStyle: 'bold'
    }).setOrigin(0.5);
    
    container.add([bg, text]);
    
    // Make draggable
    bg.setInteractive({ useHandCursor: true, draggable: true });
    
    const tile = { container, bg, text, value, type, originalX: x, originalY: y, inSlot: null };
    
    this.input.setDraggable(bg);
    
    bg.on('dragstart', () => {
      container.setDepth(100);
    });
    
    bg.on('drag', (pointer, dragX, dragY) => {
      container.x = dragX;
      container.y = dragY;
    });
    
    bg.on('dragend', () => {
      container.setDepth(20);
      this.handleTileDrop(tile);
    });
    
    return tile;
  }

  createExpressionRow() {
    const { width, height } = this.scale;
    const rowY = 260;
    const slotSize = 60;
    const spacing = 10;
    
    this.expressionElements = this.expressionElements || [];
    this.expressionSlots = [];
    
    // Expression slots: [operand] [operator] [operand] [=] [result]
    const colors = [
      { fill: 0x9ACD32, border: 0xF08A00, type: 'operand' },  // green/orange - operand 1
      { fill: 0xD8A0A0, border: 0xF08A00, type: 'operator' }, // pink/orange - operator
      { fill: 0x9ACD32, border: 0xF08A00, type: 'operand' },  // green/orange - operand 2
    ];
    
    const startX = 50;
    
    colors.forEach((slotConfig, i) => {
      const x = startX + i * (slotSize + spacing) + slotSize / 2;
      const slot = this.createDropSlot(x, rowY, slotSize, slotConfig.fill, slotConfig.border, slotConfig.type);
      this.expressionSlots.push(slot);
    });
    
    // Equals sign
    const eqX = startX + 3 * (slotSize + spacing) + slotSize / 2;
    const eqBg = this.add.rectangle(eqX, rowY, slotSize, slotSize, 0xFAFAFA, 1);
    eqBg.setStrokeStyle(3, 0x4FC3F7);
    eqBg.setDepth(5);
    this.expressionElements.push(eqBg);
    
    const eqText = this.add.text(eqX, rowY, '=', {
      fontSize: '32px', color: '#333333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.expressionElements.push(eqText);
    
    // Result box
    const resultX = startX + 4 * (slotSize + spacing) + slotSize / 2;
    const resultBg = this.add.rectangle(resultX, rowY, slotSize, slotSize, 0xFAFAFA, 1);
    resultBg.setStrokeStyle(3, 0x4FC3F7);
    resultBg.setDepth(5);
    this.expressionElements.push(resultBg);
    
    this.resultText = this.add.text(resultX, rowY, '', {
      fontSize: '26px', color: '#333333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    this.expressionElements.push(this.resultText);
  }

  createDropSlot(x, y, size, fillColor, borderColor, acceptType) {
    const bg = this.add.rectangle(x, y, size, size, fillColor, 1);
    bg.setStrokeStyle(3, borderColor);
    bg.setDepth(4);
    this.expressionElements.push(bg);
    
    return { x, y, size, bg, acceptType, currentTile: null };
  }

  handleTileDrop(tile) {
    // Check if dropped on a slot
    let droppedOnSlot = false;
    
    for (const slot of this.expressionSlots) {
      if (slot.acceptType === tile.type) {
        const dist = Phaser.Math.Distance.Between(tile.container.x, tile.container.y, slot.x, slot.y);
        if (dist < slot.size) {
          // Return previous tile if any
          if (slot.currentTile) {
            this.returnTileToOrigin(slot.currentTile);
          }
          
          // Snap to slot
          tile.container.x = slot.x;
          tile.container.y = slot.y;
          tile.inSlot = slot;
          slot.currentTile = tile;
          droppedOnSlot = true;
          
          this.checkExpression();
          break;
        }
      }
    }
    
    if (!droppedOnSlot) {
      this.returnTileToOrigin(tile);
    }
  }

  returnTileToOrigin(tile) {
    if (tile.inSlot) {
      tile.inSlot.currentTile = null;
      tile.inSlot = null;
    }
    
    this.tweens.add({
      targets: tile.container,
      x: tile.originalX,
      y: tile.originalY,
      duration: 200
    });
  }

  checkExpression() {
    // Check if all slots are filled
    const operand1 = this.expressionSlots[0].currentTile;
    const operator = this.expressionSlots[1].currentTile;
    const operand2 = this.expressionSlots[2].currentTile;
    
    if (operand1 && operator && operand2) {
      const result = this.calculate(operand1.value, operator.value, operand2.value);
      this.resultText.setText(result.toString());
      
      if (result === this.targetNumber) {
        this.handleCorrectAnswer();
      }
    } else {
      this.resultText.setText('');
    }
  }

  calculate(a, op, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? Math.floor(a / b) : 0;
      default: return 0;
    }
  }

  handleCorrectAnswer() {
    this.playSound('success');
    
    // Flash result green
    this.resultText.setColor('#00B378');
    
    this.time.delayedCall(1500, () => {
      this.resultText.setColor('#333333');
      this.currentSubLevel++;
      
      if (this.currentSubLevel >= this.totalSubLevels) {
        this.currentSubLevel = 0;
        this.currentLevel = Math.min(this.currentLevel + 1, 4);
      }
      
      this.initLevel();
    });
  }

  getLevelData() {
    const levels = [
      { target: 14, operands: [4, 1, 13], operators: ['+'] },
      { target: 20, operands: [5, 10, 15], operators: ['+', '-'] },
      { target: 24, operands: [3, 4, 6, 8], operators: ['+', '-', '×'] },
      { target: 12, operands: [2, 3, 4, 6], operators: ['+', '-', '×', '÷'] }
    ];
    
    const level = levels[(this.currentLevel - 1) % levels.length];
    
    // Shuffle operands for each sublevel
    level.operands = Phaser.Utils.Array.Shuffle([...level.operands]);
    
    return level;
  }

  playSound(key) {
    if (this.audioManager) {
      this.audioManager.playSound(key);
    }
  }
}