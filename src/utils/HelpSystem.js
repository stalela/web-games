/**
 * HelpSystem - Contextual help for Lalela Web Games
 * Provides game-specific tips and instructions in a child-friendly modal
 */

export class HelpSystem {
  constructor(scene) {
    this.scene = scene;
    this.helpIcon = null;
    this.helpModal = null;
    this.isModalVisible = false;

    // Game-specific help content
    this.gameHelpContent = {
      SmallnumbersGame: {
        title: 'Numbers with Dice',
        content: [
          'Watch the dice falling from the top.',
          'Count the dots on each dice quickly.',
          'Type the number using your keyboard.',
          'Try to catch them before they reach the ground!'
        ]
      },
      Smallnumbers2Game: {
        title: 'Numbers with Dominoes',
        content: [
          'Watch the dominoes falling from the top.',
          'Each domino has two sides with dots.',
          'Count ALL the dots on both sides.',
          'Type the total number using your keyboard!'
        ]
      },
      LearnQuantitiesGame: {
        title: 'Learn Quantities',
        content: [
          'A number is shown at the top.',
          'Use the arrow to select how many oranges you want.',
          'Drag the selected oranges to the green area.',
          'Keep adding until you match the target number!',
          'Click OK when you think you have the right amount.'
        ]
      },
      LearnAdditionsGame: {
        title: 'Learn Addition',
        content: [
          'An addition problem is shown at the top.',
          'Click on the circles below to show your answer.',
          'Each circle you click turns yellow and shows a number.',
          'Click the green OK button when ready to check.',
          'If you make a mistake, click circles to add or remove them!'
        ]
      },
      LearnSubtractionsGame: {
        title: 'Learn Subtraction',
        content: [
          'A subtraction problem is shown at the top.',
          'Click on the circles below to select your answer.',
          'Each circle you click represents one unit of the difference.',
          'Click "Check Answer" when you think you have the right number of circles.',
          'Use "Clear" to start over if you make a mistake.'
        ]
      },
      VerticalAdditionGame: {
        title: 'Vertical Addition',
        content: [
          'Numbers are arranged in columns for addition.',
          'Click on the white boxes in the result row to select them.',
          'Use the number buttons (0-9) to enter digits.',
          'Start from the right column and work left.',
          'Remember to carry over when the sum is 10 or more!',
          'Click "Check Answer" when you think you have the correct result.'
        ]
      },
      AdjacentNumbers: {
        title: "🧮 Find the Missing Number!",
        tips: [
          "Look at the numbers in the row - they make a pattern",
          "Find the empty box (marked with ?) that needs a number",
          "Drag the correct number from below into the empty box",
          "Numbers usually go up by 1: like 1, 2, 3... or 5, 6, 7...",
          "Sometimes you need to find the number that comes BEFORE",
          "Count carefully - don't rush!",
          "When you think you have the right number, drop it in!"
        ]
      },
      Guesscount: {
        title: "🔢 Math Builder",
        tips: [
          "Build math problems that equal the target number",
          "Drag numbers and operators (+, -, ×, ÷) into the boxes",
          "Start with what you know and work step by step",
          "You can use multiple operations in one problem",
          "Check your work by calculating the result"
        ]
      },
      MemoryImageGame: {
        title: "🖼️ Picture Memory",
        tips: [
          "Look at all the picture cards carefully",
          "Remember where each picture is located",
          "When cards are flipped over, click two cards to match them",
          "If they match, they stay face up!",
          "If they don't match, try to remember for next time"
        ]
      },
      MemorySoundGame: {
        title: "🔊 Sound Memory",
        tips: [
          "Listen to each sound carefully when cards are shown",
          "Remember which sound goes with which card",
          "Click cards to hear their sounds and try to match them",
          "Some sounds are animals, some are instruments!",
          "Take your time to listen before making matches"
        ]
      },
      BabyMatchGame: {
        title: "🌈 Shape Friends",
        tips: [
          "Look at the colorful shapes and remember them",
          "Click on cards to flip them over and see what's underneath",
          "Find two cards with the same shape and color",
          "When you find a match, those cards stay face up!",
          "Don't worry if you make a mistake - you can try again"
        ]
      },
      ColorMixGame: {
        title: "🎨 Color Magician",
        tips: [
          "Mix primary colors to make new colors!",
          "Red + Yellow = Orange, Red + Blue = Purple, Yellow + Blue = Green",
          "Drag colors from the palette into the mixing area",
          "Try different combinations to discover new colors",
          "Match the target color shown at the top"
        ]
      },
      GeographyMapGame: {
        title: "🌍 World Explorer",
        tips: [
          "Click on different continents to learn about them",
          "Each continent has fun facts and interesting places",
          "Use the zoom buttons to get closer or see the whole world",
          "Look for the animal emojis that represent each continent",
          "Try to find all the continents on the map!"
        ]
      },
      SoundButtonGame: {
        title: "🎵 Sound Safari",
        tips: [
          "Choose a sound category from the top buttons",
          "Click on the big colorful buttons to hear different sounds",
          "Each category has its own special sounds to discover",
          "Listen carefully - some sounds are funny, some are surprising!",
          "Try clicking different combinations to make your own symphony"
        ]
      },
      LearnDigitsGame: {
        title: "🔢 Number Explorer",
        tips: [
          "Choose a learning mode: Identify, Count, or Sequence",
          "In Identify mode, click the number that matches what's shown",
          "In Count mode, click the correct number of objects",
          "In Sequence mode, click numbers in the right order",
          "Take your time and learn at your own pace!"
        ]
      }
    };
  }

  /**
   * Create help icon in the corner of the screen
   */
  createHelpIcon() {
    const { width, height } = this.scene.scale;

    // Create help icon container
    this.helpIcon = this.scene.add.container(width - 60, 60);

    // Help icon background (circle)
    const iconBg = this.scene.add.circle(0, 0, 25, 0x0062FF, 1);
    iconBg.setInteractive({ useHandCursor: true });

    // Question mark text
    const questionMark = this.scene.add.text(0, -2, '?', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add subtle shadow/glow effect
    const glow = this.scene.add.circle(0, 0, 28, 0xFFFFFF, 0.1);

    // Add to container
    this.helpIcon.add([glow, iconBg, questionMark]);

    // Add hover effects
    iconBg.on('pointerover', () => {
      this.scene.tweens.add({
        targets: [iconBg, questionMark],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Power2'
      });
      this.announceToScreenReader('Help button - click for game tips');
    });

    iconBg.on('pointerout', () => {
      this.scene.tweens.add({
        targets: [iconBg, questionMark],
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
    });

    // Click handler
    iconBg.on('pointerdown', () => {
      this.showHelpModal();
    });

    // Keyboard accessibility
    this.scene.input.keyboard.on('keydown-H', () => {
      if (!this.isModalVisible) {
        this.showHelpModal();
      }
    });

    return this.helpIcon;
  }

  /**
   * Show help modal with game-specific tips
   */
  showHelpModal(gameKey = null) {
    if (this.isModalVisible) return;

    // If no game key provided, try to detect from current scene
    if (!gameKey) {
      gameKey = this.detectCurrentGame();
    }

    const helpData = this.gameHelpContent[gameKey];
    if (!helpData) {
      console.warn(`No help content found for game: ${gameKey}`);
      return;
    }

    this.isModalVisible = true;
    this.createHelpModal(helpData);
  }

  /**
   * Detect current game from scene
   */
  detectCurrentGame() {
    const sceneKey = this.scene.scene.key;

    // Map scene keys to help content keys
    const sceneToGameMap = {
      'AdjacentNumbers': 'AdjacentNumbers',
      'Guesscount': 'Guesscount',
      'MemoryImageGame': 'MemoryImageGame',
      'MemorySoundGame': 'MemorySoundGame',
      'BabyMatchGame': 'BabyMatchGame',
      'ColorMixGame': 'ColorMixGame',
      'GeographyMapGame': 'GeographyMapGame',
      'SoundButtonGame': 'SoundButtonGame',
      'LearnDigitsGame': 'LearnDigitsGame',
      'LearnAdditionsGame': 'LearnAdditionsGame'
    };

    return sceneToGameMap[sceneKey] || null;
  }

  /**
   * Create the help modal
   */
  createHelpModal(helpData) {
    const { width, height } = this.scene.scale;

    // Modal background (semi-transparent overlay)
    const modalBg = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0x000000, 0.7
    );
    modalBg.setInteractive();

    // Modal container
    const modalWidth = Math.min(500, width * 0.9);
    const modalHeight = Math.min(400, height * 0.8);
    const modalX = width / 2;
    const modalY = height / 2;

    // Modal background
    const modalBackground = this.scene.add.rectangle(
      modalX, modalY,
      modalWidth, modalHeight,
      0xFDFAED, 1
    );
    modalBackground.setStrokeStyle(4, 0x0062FF);

    // Close button (X)
    const closeBtn = this.scene.add.text(
      modalX + modalWidth / 2 - 30,
      modalY - modalHeight / 2 + 30,
      '×',
      {
        fontSize: '32px',
        color: '#E32528',
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });

    // Title
    const titleText = this.scene.add.text(
      modalX,
      modalY - modalHeight / 2 + 60,
      helpData.title,
      {
        fontSize: '28px',
        color: '#0062FF',
        fontFamily: 'Fredoka One, cursive',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);

    // Tips list
    const tipsStartY = modalY - modalHeight / 2 + 120;
    const tipSpacing = 35;

    const tipTexts = helpData.content.map((tip, index) => {
      const tipText = this.scene.add.text(
        modalX - modalWidth / 2 + 40,
        tipsStartY + index * tipSpacing,
        `• ${tip}`,
        {
          fontSize: '18px',
          color: '#101012',
          fontFamily: 'Nunito, sans-serif',
          wordWrap: { width: modalWidth - 80 }
        }
      ).setOrigin(0, 0.5);

      return tipText;
    });

    // Store modal elements
    this.helpModal = {
      bg: modalBg,
      background: modalBackground,
      closeBtn: closeBtn,
      title: titleText,
      tips: tipTexts
    };

    // Animate modal in
    this.animateModalIn();

    // Event handlers
    modalBg.on('pointerdown', () => this.hideHelpModal());
    closeBtn.on('pointerdown', () => this.hideHelpModal());

    // Keyboard accessibility
    this.scene.input.keyboard.on('keydown-ESC', () => this.hideHelpModal());
    this.scene.input.keyboard.on('keydown-ENTER', () => this.hideHelpModal());

    // Announce to screen readers
    this.announceToScreenReader(`${helpData.title} - ${helpData.content.length} helpful tips`);
  }

  /**
   * Animate modal appearance
   */
  animateModalIn() {
    if (!this.helpModal) return;

    const { background, title, tips, closeBtn } = this.helpModal;

    // Start with small scale and fade in
    background.setScale(0.8);
    background.setAlpha(0);
    title.setAlpha(0);
    closeBtn.setAlpha(0);
    tips.forEach(tip => tip.setAlpha(0));

    // Animate in
    this.scene.tweens.add({
      targets: background,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Animate content
    this.scene.tweens.add({
      targets: [title, closeBtn],
      alpha: 1,
      duration: 400,
      delay: 200,
      ease: 'Power2'
    });

    // Animate tips with stagger
    tips.forEach((tip, index) => {
      this.scene.tweens.add({
        targets: tip,
        alpha: 1,
        x: tip.x + 20, // Slide from left
        duration: 300,
        delay: 300 + index * 100,
        ease: 'Power2'
      });
    });
  }

  /**
   * Hide help modal
   */
  hideHelpModal() {
    if (!this.isModalVisible || !this.helpModal) return;

    const { bg, background, title, tips, closeBtn } = this.helpModal;

    // Animate out
    this.scene.tweens.add({
      targets: [background, title, closeBtn, ...tips],
      alpha: 0,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // Destroy modal elements
        [bg, background, title, closeBtn, ...tips].forEach(element => {
          if (element && element.destroy) {
            element.destroy();
          }
        });

        this.helpModal = null;
        this.isModalVisible = false;

        this.announceToScreenReader('Help closed');
      }
    });
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
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Update help content for a specific game
   */
  updateHelpContent(gameKey, helpData) {
    this.gameHelpContent[gameKey] = helpData;
  }

  /**
   * Destroy help system
   */
  destroy() {
    if (this.helpIcon) {
      this.helpIcon.destroy();
      this.helpIcon = null;
    }

    if (this.helpModal) {
      this.hideHelpModal();
    }

    // Remove keyboard listeners
    if (this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.off('keydown-H');
      this.scene.input.keyboard.off('keydown-ESC');
      this.scene.input.keyboard.off('keydown-ENTER');
    }
  }
}

// Global help system instance
export const helpSystem = new HelpSystem();