/**
 * EnumerateGame - Counting objects educational game
 * Players count the number of each type of object displayed on screen
 */
import { InteractiveGame } from './InteractiveGame.js';

export class EnumerateGame extends InteractiveGame {
  constructor(config) {
    super({
      id: 'EnumerateGame',
      name: 'Count the Objects',
      category: 'math',
      difficulty: 1,
      description: 'Count the number of each type of object',
      ...config
    });

    // Game-specific properties
    this.fruitItems = ['apple', 'banana', 'cherries', 'grapes', 'lemon', 'orange', 'peach', 'pear', 'plum', 'strawberry', 'watermelon'];
    this.currentLevelData = null;
    this.objectGroups = [];
    this.answerButtons = [];
    this.selectedAnswer = null;
    this.currentItemIndex = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 0;
  }

  preload() {
    super.preload();

    // Load fruit icons
    this.fruitItems.forEach(fruit => {
      this.load.svg(fruit, `assets/game-icons/${fruit}.svg`);
    });

    // Load background
    this.load.svg('enumerate_bg', 'assets/game-icons/enumerate.svg');
  }

  create() {
    // Create game UI first before calling super.create()
    this.createGameUI();

    // Now call super.create() which will eventually call startLevel()
    super.create();
  }

  /**
   * Override LalelaGame's startLevel to prevent automatic calling
   */
  startLevel(levelNumber) {
    // Ignore automatic calls from LalelaGame, let EnumerateGame handle its own startLevel()
    if (typeof levelNumber === 'number') {
      // This is an automatic call from LalelaGame, ignore it
      return;
    }
    // Call the EnumerateGame's startLevel method
    this.startLevelEnumerate();
  }

  /**
   * EnumerateGame's actual startLevel method (renamed from original startLevel)
   */
  startLevelEnumerate() {
    // Ensure scene is fully initialized before proceeding
    if (!this.add || !this.objectsContainer || !this.answersContainer) {
      console.warn('EnumerateGame: Scene not fully initialized, delaying startLevelEnumerate');
      this.time.delayedCall(100, () => this.startLevelEnumerate());
      return;
    }

    // Level progression: start simple, get harder
    const level = this.level || 1;
    const sublevel = Math.floor(Math.random() * 4) + 1;

    // Determine level parameters
    let maxItems = Math.min(2 + level, 4); // Start with 2-4 items
    let numItemTypes = Math.min(1 + Math.floor(level / 2), 2); // 1-2 types initially

    if (level >= 3) {
      maxItems = Math.min(3 + level, 6); // Increase complexity
      numItemTypes = Math.min(1 + level, 3); // More types
    }

    this.currentLevelData = {
      maxItems: maxItems,
      numItemTypes: numItemTypes,
      sublevel: sublevel
    };

    this.startNewQuestion();
  }


  /**
   * Override InteractiveGame methods to prevent conflicts
   */
  startNextObjective() {
    // EnumerateGame handles its own game flow, don't use InteractiveGame objectives
  }

  onObjectiveStart(objective) {
    // EnumerateGame handles its own game flow
  }

  createInteractiveElements() {
    // EnumerateGame doesn't need InteractiveGame's interactive elements
  }

  createGameUI() {
    const { width, height } = this.scale;

    // Background
    this.background = this.add.image(width / 2, height / 2, 'enumerate_bg');
    this.background.setDisplaySize(width, height);

    // Title
    this.titleText = this.add.text(width / 2, 50, 'Count the Objects', {
      fontSize: '32px',
      color: '#0062FF',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);

    // Instruction text
    this.instructionText = this.add.text(width / 2, 100, 'How many apples do you see?', {
      fontSize: '24px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    // Objects display area
    this.objectsContainer = this.add.container(width / 2, height / 2 - 50);

    // Answer buttons container
    this.answersContainer = this.add.container(width / 2, height - 150);

    // Feedback text
    this.feedbackText = this.add.text(width / 2, height - 50, '', {
      fontSize: '28px',
      color: '#00B378',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5);
  }

  startNewQuestion() {
    // Clear previous objects
    this.clearObjects();

    // Generate question data
    const questionData = this.generateQuestion();

    // Display objects
    this.displayObjects(questionData);

    // Create answer buttons
    this.createAnswerButtons(questionData);

    // Update instruction
    const currentItem = questionData.items[this.currentItemIndex];
    const itemName = currentItem.type.charAt(0).toUpperCase() + currentItem.type.slice(1);
    this.instructionText.setText(`How many ${itemName}s do you see?`);

    // Clear feedback
    this.feedbackText.setText('');
  }

  generateQuestion() {
    const { maxItems, numItemTypes } = this.currentLevelData;

    // Select random fruit types for this question
    const selectedTypes = [];
    const availableTypes = [...this.fruitItems];
    for (let i = 0; i < numItemTypes; i++) {
      const randomIndex = Math.floor(Math.random() * availableTypes.length);
      selectedTypes.push(availableTypes.splice(randomIndex, 1)[0]);
    }

    // Generate items for each type
    const items = [];
    selectedTypes.forEach(type => {
      const count = Math.floor(Math.random() * maxItems) + 1;
      items.push({ type, count });
    });

    return { items };
  }

  displayObjects(questionData) {
    // Safety check - ensure scene is properly initialized
    if (!this.add || typeof this.add.sprite !== 'function') {
      console.error('EnumerateGame: Scene not properly initialized, this.add.sprite is not available');
      return;
    }

    if (!this.objectsContainer) {
      console.error('EnumerateGame: objectsContainer not initialized');
      return;
    }

    const { items } = questionData;
    const totalObjects = items.reduce((sum, item) => sum + item.count, 0);

    // Layout objects in a grid
    const cols = Math.min(6, Math.ceil(Math.sqrt(totalObjects)));
    const rows = Math.ceil(totalObjects / cols);

    const startX = -((cols - 1) * 80) / 2;
    const startY = -((rows - 1) * 80) / 2;

    let objectIndex = 0;

    // Create visual groups for each item type
    this.objectGroups = [];

    const scene = this; // Store reference to the scene
    items.forEach((item, itemIndex) => {
      const group = {
        type: item.type,
        count: item.count,
        sprites: []
      };

      for (let i = 0; i < item.count; i++) {
        const col = objectIndex % cols;
        const row = Math.floor(objectIndex / cols);

        const x = startX + col * 80;
        const y = startY + row * 80;

        const sprite = scene.add.sprite(x, y, item.type);
        if (sprite && typeof sprite.setScale === 'function') {
          sprite.setScale(0.6);
        }
        if (sprite && typeof sprite.setInteractive === 'function') {
          sprite.setInteractive();
        }

        // Add slight random offset for natural look
        sprite.x += (Math.random() - 0.5) * 20;
        sprite.y += (Math.random() - 0.5) * 20;

        if (scene.objectsContainer && typeof scene.objectsContainer.add === 'function') {
          scene.objectsContainer.add(sprite);
        }
        group.sprites.push(sprite);

        objectIndex++;

        // Animate entrance
        sprite.setAlpha(0);
        scene.tweens.add({
          targets: sprite,
          alpha: 1,
          scale: 0.6,
          duration: 500,
          delay: objectIndex * 100,
          ease: 'Back.easeOut'
        });
      }

      scene.objectGroups.push(group);
    });
  }

  createAnswerButtons(questionData) {
    // Clear previous buttons
    this.answersContainer.removeAll(true);
    this.answerButtons = [];

    const currentItem = questionData.items[this.currentItemIndex];
    const correctAnswer = currentItem.count;

    // Create buttons for answers (correct + some wrong options)
    const answers = [correctAnswer];
    const maxWrong = Math.min(3, correctAnswer + 2);

    // Add wrong answers
    while (answers.length < 4 && answers.length < maxWrong + 1) {
      let wrongAnswer;
      do {
        wrongAnswer = Math.max(1, correctAnswer + (Math.floor(Math.random() * 4) - 2));
      } while (answers.includes(wrongAnswer) || wrongAnswer < 1 || wrongAnswer > 10);

      answers.push(wrongAnswer);
    }

    // Shuffle answers
    answers.sort(() => Math.random() - 0.5);

    // Create buttons
    const buttonSpacing = 120;
    const startX = -((answers.length - 1) * buttonSpacing) / 2;

    answers.forEach((answer, index) => {
      const x = startX + index * buttonSpacing;

      // Button background
      const buttonBg = this.add.circle(x, 0, 40, 0xFACA2A);
      buttonBg.setStrokeStyle(4, 0x101012);
      buttonBg.setInteractive();

      // Button text
      const buttonText = this.add.text(x, 0, answer.toString(), {
        fontSize: '28px',
        color: '#101012',
        fontFamily: 'Fredoka One, cursive'
      }).setOrigin(0.5);

      // Button container
      const buttonContainer = this.add.container(0, 0, [buttonBg, buttonText]);
      buttonContainer.x = x;
      buttonContainer.y = 0;

      this.answersContainer.add(buttonContainer);

      // Store button data
      const buttonData = {
        container: buttonContainer,
        background: buttonBg,
        text: buttonText,
        value: answer,
        isCorrect: answer === correctAnswer
      };

      this.answerButtons.push(buttonData);

      // Button interactions
      buttonBg.on('pointerdown', () => this.onAnswerSelected(buttonData));
      buttonBg.on('pointerover', () => {
        this.tweens.add({
          targets: buttonBg,
          scale: 1.1,
          duration: 150,
          ease: 'Back.easeOut'
        });
      });
      buttonBg.on('pointerout', () => {
        this.tweens.add({
          targets: buttonBg,
          scale: 1.0,
          duration: 150,
          ease: 'Back.easeOut'
        });
      });
    });
  }

  onAnswerSelected(buttonData) {
    if (this.selectedAnswer) return; // Prevent multiple selections

    this.selectedAnswer = buttonData;

    // Disable all buttons
    this.answerButtons.forEach(btn => {
      btn.background.disableInteractive();
    });

    // Visual feedback
    if (buttonData.isCorrect) {
      // Correct answer
      buttonData.background.setFillStyle(0x00B378); // Green
      buttonData.text.setColor('#FFFFFF');
      this.feedbackText.setText('Correct!');
      this.feedbackText.setColor('#00B378');

      // Success animation
      this.tweens.add({
        targets: buttonData.container,
        scale: 1.2,
        duration: 300,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.correctAnswers++;
          this.totalQuestions++;
          this.moveToNextQuestion();
        }
      });

      // Animate correct objects
      const currentGroup = this.objectGroups[this.currentItemIndex];
      currentGroup.sprites.forEach((sprite, index) => {
        this.tweens.add({
          targets: sprite,
          scale: 0.8,
          duration: 300,
          delay: index * 50,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      });

    } else {
      // Wrong answer
      buttonData.background.setFillStyle(0xE32528); // Red
      buttonData.text.setColor('#FFFFFF');
      this.feedbackText.setText('Try again!');
      this.feedbackText.setColor('#E32528');

      // Error animation
      this.tweens.add({
        targets: buttonData.container,
        x: buttonData.container.x + 10,
        duration: 100,
        yoyo: true,
        repeat: 3,
        ease: 'Power2',
        onComplete: () => {
          // Re-enable buttons after wrong answer
          this.selectedAnswer = null;
          this.answerButtons.forEach(btn => {
            btn.background.setInteractive();
            // Reset button colors
            if (btn.isCorrect) {
              btn.background.setFillStyle(0xFACA2A);
              btn.text.setColor('#101012');
            } else {
              btn.background.setFillStyle(0xFACA2A);
              btn.text.setColor('#101012');
            }
          });
        }
      });
    }
  }

  moveToNextQuestion() {
    this.currentItemIndex++;

    // Check if we've counted all item types
    if (this.currentItemIndex >= this.objectGroups.length) {
      // Level complete
      this.time.delayedCall(1000, () => {
        this.showLevelComplete();
      });
    } else {
      // Next item type
      this.time.delayedCall(1500, () => {
        this.selectedAnswer = null;
        this.startNewQuestion();
      });
    }
  }

  showLevelComplete() {
    // Clear current UI
    this.objectsContainer.removeAll(true);
    this.answersContainer.removeAll(true);
    this.feedbackText.setText('');

    // Show level complete message
    this.instructionText.setText(`Great job! Level ${this.level} completed!`);

    // Add score bonus
    const scoreBonus = this.correctAnswers * 10;
    this.addScore(scoreBonus);

    // Animate level complete
    this.time.delayedCall(2000, () => {
      this.level++;
      this.correctAnswers = 0;
      this.startLevel();
    });
  }

  clearObjects() {
    if (this.objectsContainer) {
      this.objectsContainer.removeAll(true);
    }
    if (this.answersContainer) {
      this.answersContainer.removeAll(true);
    }
    this.objectGroups = [];
    this.answerButtons = [];
    this.selectedAnswer = null;
    this.currentItemIndex = 0;
  }

  updateUI() {
    // Update score display if it exists
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }
  }
}