/**
 * InteractiveGame - Base class for interactive learning games
 * Provides common functionality for educational games with interactive elements,
 * feedback systems, and learning progress tracking
 */
import { LalelaGame } from '../utils/LalelaGame.js';

export class InteractiveGame extends LalelaGame {
  constructor(config) {
    super({
      category: 'interactive',
      ...config
    });

    // Interactive elements management
    this.interactiveElements = new Map();
    this.activeInteractions = new Set();

    // Learning progress tracking
    this.learningObjectives = [];
    this.completedObjectives = new Set();
    this.currentObjective = null;

    // Feedback and tutorial systems
    this.feedbackQueue = [];
    this.tutorialMode = false;
    this.tutorialSteps = [];
    this.currentTutorialStep = 0;

    // Interaction settings
    this.interactionTypes = new Set(['click', 'drag', 'touch', 'hover']);
    this.feedbackDelay = 500; // Delay before showing feedback
    this.autoAdvance = true; // Auto-advance to next objective

    // Validation and scoring
    this.validationRules = new Map();
    this.interactionHistory = [];
    this.performanceMetrics = {
      correctInteractions: 0,
      incorrectInteractions: 0,
      hintsUsed: 0,
      timeSpent: 0
    };
  }

  /**
   * Initialize the interactive game
   */
  init(data) {
    super.init(data);

    // Set up interaction handling
    this.setupInteractionHandling();

    // Initialize learning objectives
    this.initializeLearningObjectives();

    // Set up feedback system
    this.setupFeedbackSystem();
  }

  /**
   * Create the game scene
   */
  create() {
    super.create();

    // Create interactive elements
    this.createInteractiveElements();

    // Set up tutorial if enabled
    if (this.tutorialMode) {
      this.setupTutorial();
    }

    // Start the first objective
    this.startNextObjective();
  }

  /**
   * Set up interaction handling for different input types
   */
  setupInteractionHandling() {
    // Handle pointer interactions
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('pointermove', this.onPointerMove, this);

    // Handle game object interactions if input manager is available
    if (this.inputManager) {
      this.inputManager.on('dragstart', this.onDragStart, this);
      this.inputManager.on('drag', this.onDrag, this);
      this.inputManager.on('dragend', this.onDragEnd, this);
      this.inputManager.on('tap', this.onTap, this);
    }
  }

  /**
   * Initialize learning objectives for this game
   * Override in subclasses to define specific objectives
   */
  initializeLearningObjectives() {
    // Default empty implementation - subclasses should override
    this.learningObjectives = [];
  }

  /**
   * Create interactive elements for the game
   * Override in subclasses to create specific interactive elements
   */
  createInteractiveElements() {
    // Default implementation - subclasses should override
    console.log('InteractiveGame: createInteractiveElements() should be overridden');
  }

  /**
   * Set up the feedback system
   */
  setupFeedbackSystem() {
    // Create feedback display area
    this.feedbackContainer = this.add.container(this.game.config.width / 2, this.game.config.height - 100);

    // Create feedback text
    this.feedbackText = this.add.text(0, 0, '', {
      fontSize: '24px',
      color: '#2c3e50',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.feedbackContainer.add(this.feedbackText);
    this.feedbackContainer.setVisible(false);
  }

  /**
   * Set up tutorial mode
   */
  setupTutorial() {
    this.tutorialSteps = this.createTutorialSteps();
    this.showTutorialStep(0);
  }

  /**
   * Create tutorial steps
   * Override in subclasses for specific tutorials
   */
  createTutorialSteps() {
    return [
      {
        message: "Welcome! Let's learn together!",
        highlightElement: null,
        action: null
      }
    ];
  }

  /**
   * Show a specific tutorial step
   */
  showTutorialStep(stepIndex) {
    if (stepIndex >= this.tutorialSteps.length) {
      this.endTutorial();
      return;
    }

    const step = this.tutorialSteps[stepIndex];
    this.currentTutorialStep = stepIndex;

    // Show tutorial message
    this.showTutorialMessage(step.message, step.highlightElement);

    // Execute step action if any
    if (step.action) {
      step.action();
    }
  }

  /**
   * Show tutorial message with optional element highlighting
   */
  showTutorialMessage(message, highlightElement = null) {
    // Create tutorial overlay
    if (!this.tutorialOverlay) {
      this.tutorialOverlay = this.add.rectangle(
        this.game.config.width / 2,
        this.game.config.height / 2,
        this.game.config.width,
        this.game.config.height,
        0x000000, 0.7
      ).setInteractive();
    }

    // Create tutorial text
    if (!this.tutorialText) {
      this.tutorialText = this.add.text(
        this.game.config.width / 2,
        this.game.config.height / 2,
        '',
        {
          fontSize: '28px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: this.game.config.width - 100 }
        }
      ).setOrigin(0.5);
    }

    this.tutorialText.setText(message);
    this.tutorialOverlay.setVisible(true);
    this.tutorialText.setVisible(true);

    // Highlight element if specified
    if (highlightElement && typeof highlightElement.setTint === 'function') {
      highlightElement.setTint(0xffff00); // Yellow highlight
      this.highlightedElement = highlightElement;
    }

    // Add click to continue
    const continueText = this.add.text(
      this.game.config.width / 2,
      this.game.config.height - 100,
      'Tap to continue',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#3498db'
      }
    ).setOrigin(0.5).setInteractive();

    continueText.on('pointerdown', () => {
      continueText.destroy();
      this.showTutorialStep(this.currentTutorialStep + 1);
    });
  }

  /**
   * End tutorial mode
   */
  endTutorial() {
    if (this.tutorialOverlay) {
      this.tutorialOverlay.setVisible(false);
    }
    if (this.tutorialText) {
      this.tutorialText.setVisible(false);
    }
    if (this.highlightedElement) {
      this.highlightedElement.clearTint();
    }

    this.tutorialMode = false;
    console.log('Tutorial completed!');
  }

  /**
   * Start the next learning objective
   */
  startNextObjective() {
    if (this.completedObjectives.size >= this.learningObjectives.length) {
      this.onAllObjectivesComplete();
      return;
    }

    // Find the next incomplete objective
    const nextObjective = this.learningObjectives.find(obj => !this.completedObjectives.has(obj.id));

    if (nextObjective) {
      this.currentObjective = nextObjective;
      this.onObjectiveStart(nextObjective);
    }
  }

  /**
   * Handle objective start
   */
  onObjectiveStart(objective) {
    console.log(`Starting objective: ${objective.title}`);

    // Show objective message
    this.showFeedback(`New objective: ${objective.title}`, 'info', 3000);

    // Enable relevant interactions
    this.enableObjectiveInteractions(objective);
  }

  /**
   * Enable interactions for a specific objective
   */
  enableObjectiveInteractions(objective) {
    // Default implementation - subclasses should override
    // Enable all interactive elements by default
    this.interactiveElements.forEach((element, id) => {
      if (element.setInteractive) {
        element.setInteractive();
      }
    });
  }

  /**
   * Validate an interaction against current objective
   */
  validateInteraction(interaction) {
    const objective = this.currentObjective;
    if (!objective) return false;

    const validator = this.validationRules.get(objective.id);
    if (!validator) {
      console.warn(`No validator found for objective: ${objective.id}`);
      return false;
    }

    return validator(interaction);
  }

  /**
   * Handle correct interaction
   */
  onCorrectInteraction(interaction) {
    this.performanceMetrics.correctInteractions++;

    // Record interaction
    this.interactionHistory.push({
      type: 'correct',
      objectiveId: this.currentObjective?.id,
      interaction: interaction,
      timestamp: Date.now()
    });

    // Show positive feedback
    this.showFeedback('Great job! 🎉', 'success', 2000);

    // Play success sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('success');
    }

    // Check if objective is complete
    this.checkObjectiveCompletion();
  }

  /**
   * Handle incorrect interaction
   */
  onIncorrectInteraction(interaction) {
    this.performanceMetrics.incorrectInteractions++;

    // Record interaction
    this.interactionHistory.push({
      type: 'incorrect',
      objectiveId: this.currentObjective?.id,
      interaction: interaction,
      timestamp: Date.now()
    });

    // Show corrective feedback
    this.showFeedback('Try again! 💪', 'error', 2000);

    // Play error sound (gentle for learning)
    if (this.game.audioManager) {
      this.game.audioManager.playSound('click'); // Use click instead of error for learning
    }
  }

  /**
   * Check if current objective is complete
   */
  checkObjectiveCompletion() {
    const objective = this.currentObjective;
    if (!objective) return;

    // Simple completion check - override in subclasses for complex logic
    const correctForObjective = this.interactionHistory.filter(
      h => h.objectiveId === objective.id && h.type === 'correct'
    ).length;

    if (correctForObjective >= (objective.requiredInteractions || 1)) {
      this.completeObjective(objective);
    }
  }

  /**
   * Mark an objective as completed
   */
  completeObjective(objective) {
    this.completedObjectives.add(objective.id);

    // Show completion message
    this.showFeedback(`Objective complete: ${objective.title}! 🌟`, 'success', 3000);

    // Award points
    this.addScore(objective.points || 10);

    // Auto-advance to next objective
    if (this.autoAdvance) {
      this.time.delayedCall(2000, () => {
        this.startNextObjective();
      });
    }
  }

  /**
   * Handle completion of all objectives
   */
  onAllObjectivesComplete() {
    this.gameCompleted = true;

    // Calculate final score with learning bonuses
    const learningBonus = this.completedObjectives.size * 25;
    this.addScore(learningBonus);

    // Show completion screen
    this.showCompletionScreen();
  }

  /**
   * Show completion screen for interactive game
   */
  showCompletionScreen() {
    const { width, height } = this.scale;

    // Create completion overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Completion message
    const titleText = this.add.text(width / 2, height / 2 - 100, '🎓 Learning Complete! 🎓', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    const statsText = this.add.text(width / 2, height / 2, `
Correct Interactions: ${this.performanceMetrics.correctInteractions}
Total Score: ${this.score}
Objectives Completed: ${this.completedObjectives.size}/${this.learningObjectives.length}
    `.trim(), {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Restart button
    const restartButton = this.add.text(width / 2, height / 2 + 100, 'Learn Again', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#27ae60',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerdown', () => {
      this.restartGame();
    });
  }

  /**
   * Show feedback message
   */
  showFeedback(message, type = 'info', duration = 2000) {
    if (!this.feedbackText) return;

    // Set color based on type
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };

    this.feedbackText.setText(message);
    this.feedbackText.setColor(colors[type] || colors.info);
    this.feedbackContainer.setVisible(true);

    // Hide after duration
    this.time.delayedCall(duration, () => {
      if (this.feedbackContainer) {
        this.feedbackContainer.setVisible(false);
      }
    });
  }

  /**
   * Register an interactive element
   */
  registerInteractiveElement(id, element, interactionType = 'click') {
    this.interactiveElements.set(id, element);

    // Set up interaction based on type
    if (interactionType === 'click' && element.setInteractive) {
      element.setInteractive();
      element.on('pointerdown', () => this.onElementInteraction(id, 'click', element));
    }

    return element;
  }

  /**
   * Handle interaction with a registered element
   */
  onElementInteraction(elementId, interactionType, element) {
    const interaction = {
      elementId,
      type: interactionType,
      element,
      timestamp: Date.now()
    };

    // Validate interaction
    if (this.validateInteraction(interaction)) {
      this.onCorrectInteraction(interaction);
    } else {
      this.onIncorrectInteraction(interaction);
    }
  }

  /**
   * Use a hint for the current objective
   */
  useHint() {
    if (this.performanceMetrics.hintsUsed >= 3) { // Max 3 hints
      this.showFeedback('No more hints available', 'warning', 2000);
      return;
    }

    this.performanceMetrics.hintsUsed++;

    // Show hint for current objective
    const objective = this.currentObjective;
    if (objective && objective.hint) {
      this.showFeedback(`💡 Hint: ${objective.hint}`, 'info', 4000);
    }

    // Play hint sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('click');
    }
  }

  /**
   * Pointer event handlers
   */
  onPointerDown(pointer) {
    // Override in subclasses for specific pointer handling
  }

  onPointerUp(pointer) {
    // Override in subclasses for specific pointer handling
  }

  onPointerMove(pointer) {
    // Override in subclasses for specific pointer handling
  }

  /**
   * Input manager event handlers
   */
  onDragStart(data) {
    // Override in subclasses
  }

  onDrag(data) {
    // Override in subclasses
  }

  onDragEnd(data) {
    // Override in subclasses
  }

  onTap(data) {
    // Override in subclasses
  }

  /**
   * Create UI elements specific to interactive games
   */
  createUI() {
    super.createUI();

    const { width, height } = this.scale;

    // Progress indicator
    this.progressText = this.add.text(20, height - 60,
      `Progress: ${this.completedObjectives.size}/${this.learningObjectives.length}`, {
      fontSize: '18px',
      color: '#2c3e50'
    });

    // Hint button
    this.hintButton = this.add.text(width - 120, height - 60, '💡 Hint', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#f39c12',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    this.hintButton.on('pointerdown', () => this.useHint());

    // Objective display
    this.objectiveText = this.add.text(width / 2, 80, '', {
      fontSize: '20px',
      color: '#2c3e50',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * Update UI elements
   */
  updateUI() {
    super.updateUI();

    // Update progress
    if (this.progressText) {
      this.progressText.setText(
        `Progress: ${this.completedObjectives.size}/${this.learningObjectives.length}`
      );
    }

    // Update objective display
    if (this.objectiveText && this.currentObjective) {
      this.objectiveText.setText(this.currentObjective.title);
    }
  }

  /**
   * Add a learning objective
   */
  addLearningObjective(id, title, description, hint = '', points = 10, requiredInteractions = 1) {
    const objective = {
      id,
      title,
      description,
      hint,
      points,
      requiredInteractions
    };

    this.learningObjectives.push(objective);
    return objective;
  }

  /**
   * Add a validation rule for an objective
   */
  addValidationRule(objectiveId, validator) {
    this.validationRules.set(objectiveId, validator);
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      learningObjectives: this.learningObjectives.length,
      completedObjectives: this.completedObjectives.size,
      currentObjective: this.currentObjective?.title,
      correctInteractions: this.performanceMetrics.correctInteractions,
      incorrectInteractions: this.performanceMetrics.incorrectInteractions,
      hintsUsed: this.performanceMetrics.hintsUsed,
      accuracy: this.performanceMetrics.correctInteractions /
               Math.max(1, this.performanceMetrics.correctInteractions + this.performanceMetrics.incorrectInteractions) * 100,
      tutorialMode: this.tutorialMode,
      interactionHistory: this.interactionHistory.length
    };
  }

  /**
   * Restart the game
   */
  restartGame() {
    // Reset learning progress
    this.completedObjectives.clear();
    this.currentObjective = null;
    this.interactionHistory = [];
    this.performanceMetrics = {
      correctInteractions: 0,
      incorrectInteractions: 0,
      hintsUsed: 0,
      timeSpent: 0
    };

    // Reset tutorial if enabled
    if (this.tutorialMode) {
      this.currentTutorialStep = 0;
    }

    super.restartGame();
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clean up interactive elements
    this.interactiveElements.clear();
    this.activeInteractions.clear();
    this.feedbackQueue = [];

    super.destroy();
  }
}