/**
 * LearnAdditionsGame - Visual addition learning game
 * Interactive addition problems with clickable circles to represent the sum
 * Based on GCompris learn_additions activity - uses hillside background
 */
import { InteractiveGame } from './InteractiveGame.js';

export class LearnAdditionsGame extends InteractiveGame {
  constructor(config) {
    super({
      category: 'math',
      difficulty: 2,
      ...config
    });

    // Game configuration
    this.currentQuestion = null;
    this.currentAnswer = 0;
    this.selectedCircles = [];
    this.maxCircles = 4;
    this.level = 1;
    this.questionsCompleted = 0;
    this.questionsPerLevel = 3;

    // Level configuration based on GCompris data
    this.levels = [
      {
        objective: "Additions with 1 and 2",
        difficulty: 2,
        questions: ["1 + 1", "1 + 2", "2 + 2"],
        answers: [2, 3, 4],
        circlesModel: 4
      },
      {
        objective: "Additions with 1, 2 and 3",
        difficulty: 3,
        questions: ["1 + 1", "1 + 2", "1 + 3", "2 + 2", "2 + 3", "3 + 3"],
        answers: [2, 3, 4, 4, 5, 6],
        circlesModel: 6
      },
      {
        objective: "Additions with 1, 2, 3 and 4",
        difficulty: 4,
        questions: ["1 + 1", "1 + 2", "1 + 3", "1 + 4", "2 + 2", "2 + 3", "2 + 4", "3 + 3", "3 + 4", "4 + 4"],
        answers: [2, 3, 4, 5, 4, 5, 6, 6, 7, 8],
        circlesModel: 8
      }
    ];
  }

  /**
   * Preload game assets
   */
  preload() {
    super.preload();

    // Load GCompris hillside background
    this.load.svg('hillside_bg', 'assets/braille_fun/hillside.svg');
    
    // Load GCompris bar icons
    this.load.svg('bar_home', 'assets/game-icons/bar_home.svg');
    this.load.svg('bar_help', 'assets/game-icons/bar_help.svg');
    this.load.svg('bar_previous', 'assets/game-icons/bar_previous.svg');
    this.load.svg('bar_next', 'assets/game-icons/bar_next.svg');
    this.load.svg('bar_reload', 'assets/game-icons/bar_reload.svg');
  }

  /**
   * Override InteractiveGame methods to prevent conflicts
   */
  startNextObjective() {
    // LearnAdditionsGame handles its own game flow
  }

  onObjectiveStart(objective) {
    // LearnAdditionsGame handles its own game flow
  }

  createInteractiveElements() {
    // LearnAdditionsGame creates its own interactive elements
  }

  /**
   * Override: Create background - GCompris hillside with sky
   */
  createBackground() {
    const { width, height } = this.scale;

    // Create gradient sky background
    const skyGradient = this.add.graphics();
    skyGradient.setDepth(-10);
    
    // Sky gradient from light blue at top to lighter blue at horizon
    const skyColors = [
      { y: 0, color: 0x87CEEB },      // Light sky blue at top
      { y: 0.4, color: 0xADD8E6 },    // Lighter blue
      { y: 0.7, color: 0xE0F4FF }     // Almost white near hills
    ];
    
    for (let i = 0; i < height * 0.65; i++) {
      const ratio = i / (height * 0.65);
      let color;
      if (ratio < 0.4) {
        color = this.lerpColor(0x87CEEB, 0xADD8E6, ratio / 0.4);
      } else if (ratio < 0.7) {
        color = this.lerpColor(0xADD8E6, 0xE0F4FF, (ratio - 0.4) / 0.3);
      } else {
        color = 0xE0F4FF;
      }
      skyGradient.fillStyle(color, 1);
      skyGradient.fillRect(0, i, width, 1);
    }

    // Draw rolling green hills (GCompris style)
    this.drawHillside(width, height);
    
    // Add decorative cloud in top-right (near score)
    this.drawCloud(width - 120, 60, 80);
  }

  /**
   * Interpolate between two colors
   */
  lerpColor(color1, color2, t) {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Draw GCompris-style rolling hills
   */
  drawHillside(width, height) {
    const hillsGraphics = this.add.graphics();
    hillsGraphics.setDepth(-5);
    
    // Back hills (darker green)
    hillsGraphics.fillStyle(0x5D8A3E, 1);
    hillsGraphics.beginPath();
    hillsGraphics.moveTo(0, height * 0.65);
    
    // Rolling hill curve
    for (let x = 0; x <= width; x += 10) {
      const y = height * 0.65 + Math.sin(x * 0.005) * 30 + Math.sin(x * 0.002) * 20;
      hillsGraphics.lineTo(x, y);
    }
    hillsGraphics.lineTo(width, height);
    hillsGraphics.lineTo(0, height);
    hillsGraphics.closePath();
    hillsGraphics.fill();

    // Middle hills (medium green)
    hillsGraphics.fillStyle(0x6B9B4A, 1);
    hillsGraphics.beginPath();
    hillsGraphics.moveTo(0, height * 0.72);
    
    for (let x = 0; x <= width; x += 10) {
      const y = height * 0.72 + Math.sin(x * 0.004 + 1) * 25 + Math.sin(x * 0.0015) * 15;
      hillsGraphics.lineTo(x, y);
    }
    hillsGraphics.lineTo(width, height);
    hillsGraphics.lineTo(0, height);
    hillsGraphics.closePath();
    hillsGraphics.fill();

    // Front hills (lighter green)
    hillsGraphics.fillStyle(0x7DB356, 1);
    hillsGraphics.beginPath();
    hillsGraphics.moveTo(0, height * 0.80);
    
    for (let x = 0; x <= width; x += 10) {
      const y = height * 0.80 + Math.sin(x * 0.003 + 2) * 20 + Math.sin(x * 0.001) * 10;
      hillsGraphics.lineTo(x, y);
    }
    hillsGraphics.lineTo(width, height);
    hillsGraphics.lineTo(0, height);
    hillsGraphics.closePath();
    hillsGraphics.fill();
  }

  /**
   * Draw a decorative cloud
   */
  drawCloud(x, y, size) {
    const cloud = this.add.graphics();
    cloud.setDepth(5);
    cloud.fillStyle(0xFFFFFF, 0.9);
    
    // Cloud made of overlapping circles
    cloud.fillCircle(x, y, size * 0.4);
    cloud.fillCircle(x - size * 0.35, y + size * 0.1, size * 0.3);
    cloud.fillCircle(x + size * 0.35, y + size * 0.1, size * 0.3);
    cloud.fillCircle(x - size * 0.2, y - size * 0.15, size * 0.25);
    cloud.fillCircle(x + size * 0.2, y - size * 0.15, size * 0.25);
    
    return cloud;
  }

  /**
   * Override: Create UI elements - GCompris style
   */
  createUI() {
    const { width, height } = this.scale;

    // Math problem display - GCompris orange style (no background box)
    this.questionText = this.add.text(width / 2 - 80, 70, '1 + 1', {
      fontSize: '90px',
      color: '#D2611D',  // GCompris orange
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(10);
    this.questionText.setStroke('#FFFFFF', 8);

    // OK button (green circle next to equation - GCompris style)
    const okX = width / 2 + 80;
    const okY = 70;
    
    this.okButton = this.add.circle(okX, okY, 45, 0x00B378);
    this.okButton.setStrokeStyle(4, 0xFFFFFF);
    this.okButton.setInteractive({ useHandCursor: true });
    this.okButton.setDepth(15);

    // OK text on button
    this.okButtonText = this.add.text(okX, okY, 'OK', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(16);

    // OK button click handler
    this.okButton.on('pointerdown', () => this.checkAnswer());
    this.okButton.on('pointerover', () => this.okButton.setScale(1.1));
    this.okButton.on('pointerout', () => this.okButton.setScale(1));

    // Progress badge (cloud style, top-right)
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0xE8F4EA, 0.95);
    this.progressBg.fillRoundedRect(width - 130, 30, 100, 50, 15);
    this.progressBg.lineStyle(2, 0x7DB356, 1);
    this.progressBg.strokeRoundedRect(width - 130, 30, 100, 50, 15);
    this.progressBg.setDepth(10);

    this.progressText = this.add.text(width - 80, 55, '0/3', {
      fontSize: '22px',
      color: '#5D8A3E',
      fontFamily: 'Fredoka One, cursive',
      align: 'center'
    }).setOrigin(0.5).setDepth(11);

    // Create white rounded container for circles (GCompris style)
    this.createCirclesContainer(width, height);

    // Create navigation bar
    this.createNavigationBar(width, height);
  }

  /**
   * Create white rounded container for circles (GCompris style)
   */
  createCirclesContainer(width, height) {
    const containerWidth = width - 60;
    const containerHeight = 180;
    const containerY = height * 0.45;
    
    // White rounded background for circles
    this.circlesBg = this.add.graphics();
    this.circlesBg.setDepth(5);
    this.circlesBg.fillStyle(0xFFFFFF, 0.85);
    this.circlesBg.fillRoundedRect(30, containerY - containerHeight / 2, containerWidth, containerHeight, 20);
    this.circlesBg.lineStyle(3, 0xDDDDDD, 1);
    this.circlesBg.strokeRoundedRect(30, containerY - containerHeight / 2, containerWidth, containerHeight, 20);
  }

  /**
   * Create GCompris-style navigation bar (rounded square buttons)
   */
  createNavigationBar(width, height) {
    const barY = height - 50;
    const buttonSize = 50;
    const spacing = 65;

    // Navigation controls - GCompris style with rounded square buttons
    const controls = [
      { icon: 'bar_reload', action: 'menu', color: 0x8BC34A, borderColor: 0x689F38, hasStroke: true },
      { icon: 'bar_help', action: 'help', color: 0xFFFFFF, borderColor: 0x4FC3F7, hasStroke: true },
      { icon: 'bar_home', action: 'home', color: 0x42A5F5, borderColor: 0x1E88E5, hasStroke: true },
      { icon: 'bar_previous', action: 'prevLevel', color: 0xFFFFFF, borderColor: 0xFFB74D, hasStroke: true },
      { text: '1', action: 'levels', color: 0xFFFFFF, borderColor: 0x666666, hasStroke: false },
      { icon: 'bar_next', action: 'nextLevel', color: 0xFFFFFF, borderColor: 0xFFB74D, hasStroke: true },
      { icon: 'bar_reload', action: 'levelSelect', color: 0xAB47BC, borderColor: 0x7B1FA2, hasStroke: true }
    ];

    const totalWidth = (controls.length - 1) * spacing + buttonSize;
    const startX = (width - totalWidth) / 2;

    controls.forEach((control, index) => {
      const x = startX + index * spacing;

      // Button background (rounded square)
      const btn = this.add.graphics();
      btn.setDepth(100);
      
      // Fill with color
      btn.fillStyle(control.color, 1);
      btn.fillRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, 10);
      
      // Border stroke
      if (control.hasStroke) {
        btn.lineStyle(3, control.borderColor, 1);
        btn.strokeRoundedRect(x - buttonSize / 2, barY - buttonSize / 2, buttonSize, buttonSize, 10);
      }

      // Interactive zone
      const hitArea = this.add.rectangle(x, barY, buttonSize, buttonSize, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.setDepth(101);

      // Icon or text
      if (control.icon) {
        if (this.textures.exists(control.icon)) {
          const icon = this.add.image(x, barY, control.icon);
          icon.setDisplaySize(buttonSize * 0.6, buttonSize * 0.6);
          icon.setDepth(102);
        }
      } else if (control.text) {
        const levelNum = this.add.text(x, barY, this.level.toString(), {
          fontSize: '24px',
          color: '#333333',
          fontFamily: 'Fredoka One, cursive',
          align: 'center'
        }).setOrigin(0.5).setDepth(102);
        this.levelNumText = levelNum;
      }

      // Click handler
      hitArea.on('pointerdown', () => this.onNavigationClick(control.action));
      hitArea.on('pointerover', () => btn.setAlpha(0.8));
      hitArea.on('pointerout', () => btn.setAlpha(1));
    });
  }

  /**
   * Handle navigation clicks
   */
  onNavigationClick(action) {
    switch (action) {
      case 'help':
        if (this.helpSystem) {
          this.helpSystem.showHelpModal('LearnAdditionsGame');
        }
        break;
      case 'home':
      case 'menu':
        this.scene.start('GameMenu');
        break;
      case 'levels':
      case 'levelSelect':
        this.showLevelSelector();
        break;
      case 'prevLevel':
        if (this.level > 1) {
          this.level--;
          this.questionsCompleted = 0;
          this.recreateCirclesForLevel();
          this.generateQuestion();
          this.updateLevelDisplay();
        }
        break;
      case 'nextLevel':
        if (this.level < this.levels.length) {
          this.level++;
          this.questionsCompleted = 0;
          this.recreateCirclesForLevel();
          this.generateQuestion();
          this.updateLevelDisplay();
        }
        break;
    }
  }

  /**
   * Update level number display
   */
  updateLevelDisplay() {
    if (this.levelNumText) {
      this.levelNumText.setText(this.level.toString());
    }
    if (this.progressText) {
      this.progressText.setText(`${this.questionsCompleted}/${this.questionsPerLevel}`);
    }
  }

  /**
   * Show level selector modal - Sticker-style design
   */
  showLevelSelector() {
    const { width, height } = this.scale;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.setDepth(150);
    overlay.on('pointerdown', () => this.closeLevelSelector());

    // Main modal container - "Sticker Box" style
    const modalWidth = 600;
    const modalHeight = 450;
    const modalX = width / 2;
    const modalY = height / 2;

    // Drop shadow (behind everything)
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(modalX - modalWidth/2 + 8, modalY - modalHeight/2 + 8, modalWidth, modalHeight, 30);
    shadow.setDepth(150);

    // Main sticker background (white with rounded corners)
    const modalBg = this.add.graphics();
    modalBg.fillStyle(0xFFFFFF, 1);
    modalBg.fillRoundedRect(modalX - modalWidth/2, modalY - modalHeight/2, modalWidth, modalHeight, 30);
    modalBg.lineStyle(6, 0x101012, 1); // Thick black border
    modalBg.strokeRoundedRect(modalX - modalWidth/2, modalY - modalHeight/2, modalWidth, modalHeight, 30);
    modalBg.setDepth(151);

    // Inner white glow effect
    const innerGlow = this.add.graphics();
    innerGlow.lineStyle(10, 0xFFFFFF, 0.8);
    innerGlow.strokeRoundedRect(modalX - modalWidth/2 + 10, modalY - modalHeight/2 + 10, modalWidth - 20, modalHeight - 20, 25);
    innerGlow.setDepth(151);

    // Title with icon
    const titleText = this.add.text(modalX, modalY - modalHeight/2 + 60, '🌟 SELECT A LEVEL', {
      fontSize: '32px',
      color: '#0062FF', // River Blue
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(152);

    // Lalela color palette for level buttons
    const levelColors = [
      0x00B378, // Aloe Green (Level 1)
      0xFACA2A, // Lalela Yellow (Level 2)
      0xFD5E1A  // Bead Orange (Level 3)
    ];

    // Create chunky level buttons
    const buttonWidth = 140;
    const buttonHeight = 120;
    const buttonSpacing = 30;
    const startY = modalY - 60;
    const startX = modalX - (this.levels.length * (buttonWidth + buttonSpacing) - buttonSpacing) / 2 + buttonWidth / 2;

    const levelButtons = [];
    const levelTexts = [];
    const levelLabels = [];
    const glowEffects = [];
    const checkmarks = [];

    for (let level = 0; level < this.levels.length; level++) {
      const x = startX + level * (buttonWidth + buttonSpacing);
      const y = startY;

      // Chunky button background (rounded rectangle - "pill" style)
      const buttonBg = this.add.graphics();
      buttonBg.fillStyle(levelColors[level], 1);
      buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, buttonHeight/2);
      buttonBg.lineStyle(4, 0x101012, 1); // Thick black border
      buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, buttonHeight/2);
      buttonBg.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight),
                             Phaser.Geom.Rectangle.Contains);
      buttonBg.setDepth(153);

      // Level number (large and prominent)
      const levelText = this.add.text(x, y - 15, (level + 1).toString(), {
        fontSize: '40px',
        color: '#FFFFFF',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(154);

      // Level objective (smaller, below the number)
      const levelLabel = this.add.text(x, y + 25, this.levels[level].objective, {
        fontSize: '14px',
        color: '#101012',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: buttonWidth - 20 }
      }).setOrigin(0.5).setDepth(154);

      // Current level indicator (pulsing glow + checkmark)
      let glowEffect, checkmark;
      if (level + 1 === this.level) {
        // Pulsing white glow for current level
        glowEffect = this.add.graphics();
        glowEffect.lineStyle(6, 0xFFFFFF, 0.8);
        glowEffect.strokeRoundedRect(x - buttonWidth/2 - 5, y - buttonHeight/2 - 5, buttonWidth + 10, buttonHeight + 10, buttonHeight/2 + 5);
        glowEffect.setDepth(152);

        // Pulsing animation
        this.tweens.add({
          targets: glowEffect,
          alpha: 0.3,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Checkmark badge
        checkmark = this.add.text(x + buttonWidth/2 - 20, y - buttonHeight/2 + 20, '✓', {
          fontSize: '20px',
          color: '#FFFFFF',
          fontFamily: 'Fredoka One, cursive',
          fontStyle: 'bold',
          backgroundColor: '#00B378'
        }).setOrigin(0.5).setPadding(4).setDepth(155);
      }

      // Store references
      levelButtons.push(buttonBg);
      levelTexts.push(levelText);
      levelLabels.push(levelLabel);
      if (glowEffect) glowEffects.push(glowEffect);
      if (checkmark) checkmarks.push(checkmark);

      // Interactive effects
      buttonBg.on('pointerdown', () => {
        // Squish animation
        this.tweens.add({
          targets: [buttonBg, levelText, levelLabel],
          scaleY: 0.8,
          duration: 100,
          yoyo: true,
          ease: 'Power2',
          onComplete: () => {
            this.selectLevel(level + 1);
            this.closeLevelSelector();
          }
        });

        this.playSound('click');
      });

      // Hover effects (scale up)
      buttonBg.on('pointerover', () => {
        this.tweens.add({
          targets: [buttonBg, levelText, levelLabel],
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 150,
          ease: 'Back.easeOut'
        });

        this.playSound('click');
      });

      buttonBg.on('pointerout', () => {
        this.tweens.add({
          targets: [buttonBg, levelText, levelLabel],
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 150,
          ease: 'Back.easeOut'
        });
      });
    }

    // Redesigned close button (large red circle popping out)
    const closeBtnRadius = 25;
    const closeBtnX = modalX + modalWidth/2 - closeBtnRadius + 5;
    const closeBtnY = modalY - modalHeight/2 + closeBtnRadius - 5;

    const closeBtn = this.add.circle(closeBtnX, closeBtnY, closeBtnRadius, 0xE32528);
    closeBtn.setStrokeStyle(4, 0xFFFFFF);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setDepth(156);
    closeBtn.on('pointerdown', () => this.closeLevelSelector());

    const closeText = this.add.text(closeBtnX, closeBtnY, '×', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(157);

    // Pop entry animation for the entire modal
    const modalElements = [modalBg, innerGlow, titleText, shadow, closeBtn, closeText, ...levelButtons, ...levelTexts, ...levelLabels, ...glowEffects, ...checkmarks];

    modalElements.forEach(element => {
      element.setScale(0);
      element.setAlpha(0);
    });

    this.tweens.add({
      targets: modalElements,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Settle to normal scale
        this.tweens.add({
          targets: modalElements,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 200,
          ease: 'Back.easeOut'
        });
      }
    });

    // Store modal elements for cleanup
    this.levelSelectorModal = [
      overlay, shadow, modalBg, innerGlow, titleText,
      ...levelButtons, ...levelTexts, ...levelLabels,
      ...glowEffects, ...checkmarks,
      closeBtn, closeText
    ];
  }

  /**
   * Select a level and restart the game
   */
  selectLevel(levelNumber) {
    this.level = levelNumber;
    this.clearSelection();
    this.recreateCirclesForLevel();
    this.generateQuestion();
  }

  /**
   * Close level selector modal
   */
  closeLevelSelector() {
    if (this.levelSelectorModal) {
      this.levelSelectorModal.forEach(element => element.destroy());
      this.levelSelectorModal = null;
    }
  }

  /**
   * Create game-specific elements after UI is created
   */
  createGameElements() {
    const { width, height } = this.scale;

    // Create counting circles in center
    this.createCountingCircles();

    // Generate first question
    this.generateQuestion();
  }

  /**
   * Create the counting circles where players click (GCompris style)
   */
  createCountingCircles() {
    const { width, height } = this.scale;
    const circlesY = height * 0.45;  // Match the container position

    // Container for circles
    this.circlesContainer = this.add.container(width / 2, circlesY);
    this.circlesContainer.setDepth(10);

    // Create circles based on current level
    this.circles = [];
    this.selectedCircles = [];

    const levelData = this.levels[this.level - 1];
    const numCircles = levelData.circlesModel;
    
    // Calculate circle size based on available space
    const containerWidth = width - 120;
    const maxCircleSize = Math.min(containerWidth / (numCircles + 1), 120);
    const circleRadius = maxCircleSize / 2 - 5;
    const spacing = maxCircleSize + 10;

    // Calculate starting position to center the circles
    const totalWidth = (numCircles - 1) * spacing;
    const startX = -totalWidth / 2;

    for (let i = 0; i < numCircles; i++) {
      const x = startX + (i * spacing);
      const circle = this.createClickableCircle(x, 0, circleRadius, i);
      this.circles.push(circle);
      this.circlesContainer.add(circle.bg);
    }
  }

  /**
   * Create a clickable circle (GCompris style - outline only, fills with orange when clicked)
   */
  createClickableCircle(x, y, radius, index) {
    // Circle background - transparent with dark border (GCompris style)
    const circleBg = this.add.circle(x, y, radius, 0xFFFFFF, 0);  // Transparent fill
    circleBg.setStrokeStyle(4, 0x333333);  // Dark border

    // Make it interactive
    circleBg.setInteractive({ useHandCursor: true });
    circleBg.on('pointerdown', () => this.onCircleClick(index));
    circleBg.on('pointerover', () => {
      if (!this.selectedCircles.includes(index)) {
        circleBg.setFillStyle(0xFFE0B2, 0.3);  // Light orange hover
      }
    });
    circleBg.on('pointerout', () => {
      if (!this.selectedCircles.includes(index)) {
        circleBg.setFillStyle(0xFFFFFF, 0);  // Back to transparent
      }
    });

    return { bg: circleBg, selected: false };
  }

  /**
   * Create control buttons
   */
  createControlButtons() {
    const { width, height } = this.scale;
    const buttonY = height - 80;

    // Clear button
    this.clearButton = this.createButton(width / 2 - 100, buttonY, 'Clear', () => this.clearSelection());

    // Check button
    this.checkButton = this.createButton(width / 2 + 100, buttonY, 'Check Answer', () => this.checkAnswer());
  }

  /**
   * Create a simple button
   */
  createButton(x, y, text, callback) {
    const buttonBg = this.add.rectangle(x, y, 120, 50, 0x0062FF);
    buttonBg.setStrokeStyle(2, 0xFFFFFF);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '18px',
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
   * Handle circle click
   */
  onCircleClick(circleIndex) {
    const circle = this.circles[circleIndex];

    if (circle.selected) {
      // Deselect circle
      this.deselectCircle(circleIndex);
    } else {
      // Select circle
      this.selectCircle(circleIndex);
    }

    this.updateSelectionDisplay();
  }

  /**
   * Select a circle (GCompris style - fills with orange)
   */
  selectCircle(circleIndex) {
    const circle = this.circles[circleIndex];

    if (!circle.selected) {
      circle.selected = true;
      circle.bg.setFillStyle(0xD2611D, 1);  // GCompris orange when selected

      this.selectedCircles.push(circleIndex);

      // Play selection sound
      this.playSound('click');

      // Add a subtle bounce animation
      this.tweens.add({
        targets: circle.bg,
        scale: 1.1,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }

  /**
   * Deselect a circle (GCompris style - back to transparent)
   */
  deselectCircle(circleIndex) {
    const circle = this.circles[circleIndex];

    if (circle.selected) {
      circle.selected = false;
      circle.bg.setFillStyle(0xFFFFFF, 0);  // Back to transparent

      // Remove from selected array
      const index = this.selectedCircles.indexOf(circleIndex);
      if (index > -1) {
        this.selectedCircles.splice(index, 1);
      }

      // Play deselection sound
      this.playSound('click');
    }
  }

  /**
   * Update the visual display of selection (simplified - no instruction text)
   */
  updateSelectionDisplay() {
    // In GCompris style, the OK button is always visible
    // Just update the progress counter
    if (this.progressText) {
      this.progressText.setText(`${this.questionsCompleted}/${this.questionsPerLevel}`);
    }
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    if (this.selectedCircles) {
      this.selectedCircles.forEach(circleIndex => {
        if (this.circles && this.circles[circleIndex]) {
          this.deselectCircle(circleIndex);
        }
      });
    }
    this.selectedCircles = [];
    this.updateSelectionDisplay();

    // Clear feedback if exists
    if (this.feedbackText) {
      this.feedbackText.setText('');
    }

    this.playSound('click');
  }

  /**
   * Check the player's answer
   */
  checkAnswer() {
    const selectedCount = this.selectedCircles.length;

    if (selectedCount === this.currentAnswer) {
      // Correct answer!
      this.questionsCompleted++;
      this.updateSelectionDisplay();
      
      this.showFeedback('Excellent! 🎉', '#00B378');
      this.playSound('success');

      // Celebrate with animations
      this.celebrateCorrect();

      // Check if level complete
      if (this.questionsCompleted >= this.questionsPerLevel) {
        // Advance to next level
        this.time.delayedCall(2000, () => this.advanceLevel());
      } else {
        // Next question after delay
        this.time.delayedCall(1500, () => this.nextQuestion());
      }
    } else {
      // Incorrect answer - shake and show feedback
      this.showFeedback('Try again!', '#FF6B6B');
      this.playSound('error');

      // Shake the circles container
      this.tweens.add({
        targets: this.circlesContainer,
        x: '+=15',
        duration: 80,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
    }
  }

  /**
   * Celebrate correct answer
   */
  celebrateCorrect() {
    // Scale up selected circles
    this.selectedCircles.forEach(circleIndex => {
      const circle = this.circles[circleIndex];
      if (circle && circle.bg) {
        this.tweens.add({
          targets: circle.bg,
          scale: 1.2,
          duration: 300,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      }
    });

    // Create star particle burst
    for (let i = 0; i < 15; i++) {
      const star = this.add.star(this.circlesContainer.x, this.circlesContainer.y, 5, 8, 16, 0xFFD700);
      star.setScale(0.3);
      star.setDepth(50);
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 120;

      this.tweens.add({
        targets: star,
        x: this.circlesContainer.x + Math.cos(angle) * speed,
        y: this.circlesContainer.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        rotation: Math.PI * 2,
        duration: 600,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }
  }

  /**
   * Show feedback text
   */
  showFeedback(text, color) {
    const { width, height } = this.scale;
    
    if (!this.feedbackText) {
      this.feedbackText = this.add.text(width / 2, height * 0.7, '', {
        fontSize: '36px',
        color: color,
        fontFamily: 'Fredoka One, cursive',
        align: 'center',
        backgroundColor: '#FFFFFF',
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      }).setOrigin(0.5).setDepth(200);
      this.feedbackText.setStroke('#333333', 3);
    }

    this.feedbackText.setText(text);
    this.feedbackText.setColor(color);

    // "Pop" animation
    this.feedbackText.setScale(0);
    this.feedbackText.setAlpha(1);
    this.tweens.add({
      targets: this.feedbackText,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Fade out after delay
    this.time.delayedCall(1500, () => {
      if (this.feedbackText) {
        this.tweens.add({
          targets: this.feedbackText,
          alpha: 0,
          scale: 0.8,
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            if (this.feedbackText) {
              this.feedbackText.setText('');
              this.feedbackText.setScale(1);
            }
          }
        });
      }
    });
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    // Clear current selection
    this.clearSelection();

    // Generate new question
    this.generateQuestion();
  }

  /**
   * Generate a new question
   */
  generateQuestion() {
    // Ensure UI is initialized
    if (!this.questionText) {
      console.warn('LearnAdditionsGame: UI not fully initialized, delaying generateQuestion');
      this.time.delayedCall(100, () => this.generateQuestion());
      return;
    }

    const levelData = this.levels[this.level - 1];

    // Pick a random question from current level (avoid repeating)
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * levelData.questions.length);
    } while (levelData.questions[randomIndex] === this.currentQuestion && levelData.questions.length > 1);

    const question = levelData.questions[randomIndex];
    const answer = levelData.answers[randomIndex];

    this.currentQuestion = question;
    this.currentAnswer = answer;

    // Update display - GCompris shows just "1 + 1" without "= ?"
    this.questionText.setText(question);
    
    // Update progress
    this.updateLevelDisplay();
  }

  /**
   * Advance to next level
   */
  advanceLevel() {
    if (this.level < this.levels.length) {
      this.level++;
      this.questionsCompleted = 0;
      this.recreateCirclesForLevel();
      this.showFeedback(`Level ${this.level}!`, '#D2611D');
      this.generateQuestion();
      this.updateLevelDisplay();
    } else {
      this.showFeedback('All levels completed! 🎊', '#00B378');
      // Return to menu after celebration
      this.time.delayedCall(2500, () => this.scene.start('GameMenu'));
    }
  }

  /**
   * Recreate circles for new level
   */
  recreateCirclesForLevel() {
    // Destroy existing circles container
    if (this.circlesContainer) {
      this.circlesContainer.destroy();
    }

    // Clear arrays
    this.circles = [];
    this.selectedCircles = [];

    // Create new circles for the level
    this.createCountingCircles();
  }

  /**
   * Start the game
   */
  create() {
    // Call super.create() first
    super.create();

    // Create game-specific elements
    this.createGameElements();
  }

  /**
   * Play sound effect
   */
  playSound(soundName) {
    if (this.audioManager) {
      this.audioManager.playSound(soundName);
    }
  }

  /**
   * Update method
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