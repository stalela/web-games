import { LalelaGame } from '../utils/LalelaGame.js';

export class Guess24Game extends LalelaGame {
  constructor(config) {
    super({
      key: 'Guess24Game',
      title: 'Make 24',
      description: 'Use all 4 numbers and operators (+, -, *, /) to make 24.',
      category: 'math',
      ...config
    });

    this.problems = [];
    this.currentProblem = null;
    this.cards = [];
    this.selectedCard = null;
    this.selectedOperator = null;
    this.history = []; // To support undo if needed, or just reset
  }

  preload() {
    super.preload();
    this.load.json('guess24-data', 'assets/guess24/resource/guess24.json');
  }

  createBackground() {
    const { width, height } = this.game.config;
    this.add.rectangle(width / 2, height / 2, width, height, 0x386cc7); // Blue background from QML
  }

  createUI() {
    super.createUI();
    
    const { width, height } = this.game.config;

    // Title
    this.add.text(width / 2, 50, 'Make 24', {
      fontFamily: 'Fredoka One, Arial',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Instructions
    this.instructionText = this.add.text(width / 2, 100, 'Select a number, then an operator, then another number.', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Card container
    this.cardContainer = this.add.container(width / 2, height / 2);

    // Operator container
    this.operatorContainer = this.add.container(width / 2, height / 2 + 150);

    // Reset Button
    const resetBtn = this.add.rectangle(width - 100, height - 50, 150, 50, 0xff0000)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.resetLevel());
    
    this.add.text(width - 100, height - 50, 'Reset', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  setupGameLogic() {
    const data = this.cache.json.get('guess24-data');
    if (data) {
      this.problems = data;
      this.startGame();
    } else {
      console.error('Failed to load guess24 data');
    }
  }

  loadLevelData(levelNumber) {
    // Filter problems by complexity if needed, or just pick random
    // For now, just pick a random problem
    if (this.problems.length > 0) {
      this.currentProblem = Phaser.Utils.Array.GetRandom(this.problems);
    }
  }

  resetLevel() {
    this.selectedCard = null;
    this.selectedOperator = null;
    this.createCards(this.currentProblem.puzzle.split(' ').map(Number));
    this.createOperators();
    this.instructionText.setText('Select a number, then an operator, then another number.');
  }

  createCards(numbers) {
    this.cardContainer.removeAll(true);
    this.cards = [];

    const cardWidth = 100;
    const spacing = 20;
    const totalWidth = (cardWidth * numbers.length) + (spacing * (numbers.length - 1));
    const startX = -totalWidth / 2 + cardWidth / 2;

    numbers.forEach((num, index) => {
      const x = startX + index * (cardWidth + spacing);
      const card = this.createCard(x, 0, num, index);
      this.cardContainer.add(card);
      this.cards.push(card);
    });
  }

  createCard(x, y, value, index) {
    const container = this.add.container(x, y);
    container.setSize(100, 140);

    const bg = this.add.rectangle(0, 0, 100, 140, 0xffffff)
      .setStrokeStyle(2, 0x000000);
    
    const text = this.add.text(0, 0, value.toString(), {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.value = value;
    container.originalIndex = index; // To track identity if needed

    container.setInteractive(new Phaser.Geom.Rectangle(-50, -70, 100, 140), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', () => this.onCardClicked(container, bg));

    return container;
  }

  createOperators() {
    this.operatorContainer.removeAll(true);
    const ops = ['+', '-', '×', '÷'];
    const width = 60;
    const spacing = 20;
    const totalWidth = (width * ops.length) + (spacing * (ops.length - 1));
    const startX = -totalWidth / 2 + width / 2;

    ops.forEach((op, index) => {
      const x = startX + index * (width + spacing);
      const btn = this.add.rectangle(x, 0, width, width, 0xeeeeee)
        .setStrokeStyle(2, 0x000000)
        .setInteractive({ useHandCursor: true });
      
      const text = this.add.text(x, 0, op, {
        fontSize: '32px',
        color: '#000000'
      }).setOrigin(0.5);

      btn.on('pointerdown', () => this.onOperatorClicked(op, btn));
      
      this.operatorContainer.add([btn, text]);
    });
  }

  onCardClicked(card, bg) {
    if (this.selectedCard === card) {
      // Deselect
      this.selectedCard = null;
      bg.setFillStyle(0xffffff);
      return;
    }

    if (!this.selectedCard) {
      // Select first card
      this.selectedCard = card;
      bg.setFillStyle(0xffff00); // Yellow highlight
    } else if (this.selectedOperator) {
      // Perform operation
      this.performOperation(this.selectedCard, this.selectedOperator, card);
    } else {
      // Change selection
      const prevBg = this.selectedCard.list[0];
      prevBg.setFillStyle(0xffffff);
      this.selectedCard = card;
      bg.setFillStyle(0xffff00);
    }
  }

  onOperatorClicked(op, btn) {
    if (!this.selectedCard) {
      this.instructionText.setText('Select a number first!');
      return;
    }
    this.selectedOperator = op;
    // Highlight operator?
    this.instructionText.setText(`${this.selectedCard.value} ${op} ... Select second number`);
  }

  performOperation(cardA, op, cardB) {
    if (cardA === cardB) return;

    let result;
    const valA = cardA.value;
    const valB = cardB.value;

    switch (op) {
      case '+': result = valA + valB; break;
      case '-': result = valA - valB; break;
      case '×': result = valA * valB; break;
      case '÷': 
        if (valB === 0 || valA % valB !== 0) {
          this.instructionText.setText('Invalid division!');
          this.selectedOperator = null;
          return;
        }
        result = valA / valB; 
        break;
    }

    // Remove cards
    const remainingValues = this.cards
      .filter(c => c !== cardA && c !== cardB)
      .map(c => c.value);
    
    remainingValues.push(result);

    this.selectedCard = null;
    this.selectedOperator = null;

    this.createCards(remainingValues);

    if (remainingValues.length === 1) {
      if (remainingValues[0] === 24) {
        this.instructionText.setText('Success! You made 24!');
        this.time.delayedCall(1500, () => this.completeLevel());
      } else {
        this.instructionText.setText(`Result is ${remainingValues[0]}. Try again!`);
      }
    } else {
      this.instructionText.setText('Select next operation');
    }
  }
}
