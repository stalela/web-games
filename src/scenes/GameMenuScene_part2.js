      icon.setTint(0xFFFFFF);

      // Category name (using Fredoka One as requested)
      const nameText = this.add.text(x, y + iconSize / 2 + 25, category.name, {
        fontSize: '16px', // Slightly larger
        color: '#101012',
        fontFamily: 'Fredoka One, cursive',
        align: 'center'
      }).setOrigin(0.5);

      // Hover effects (more pronounced)
      circle.on('pointerover', () => {
        circle.setFillStyle(Phaser.Display.Color.GetColor32(Phaser.Display.Color.IntegerToRGB(category.color).r * 1.3,
                                                           Phaser.Display.Color.IntegerToRGB(category.color).g * 1.3,
                                                           Phaser.Display.Color.IntegerToRGB(category.color).b * 1.3, 1));
        circle.setStrokeStyle(6, 0xFACA2A); // Lalela Yellow highlight
        icon.setScale(iconSize / 100 * 1.15); // More dramatic scale
      });

      circle.on('pointerout', () => {
        if (this.currentCategory !== category.id) {
          circle.setFillStyle(category.color);
          circle.setStrokeStyle(5, 0xFFFFFF);
          icon.setScale(iconSize / 100);
        }
      });

      circle.on('pointerdown', () => {
        this.selectCategory(category.id);
      });

      this.categoryButtons.push({
        circle: circle,
        shadow: shadow,
        icon: icon,
        text: nameText,
        category: category,
        originalY: y
      });
    });
  }

  /**
   * Select a category and filter games
   */
  selectCategory(categoryId) {
    this.currentCategory = categoryId;

    // Update category button appearances with bounce animation
    this.categoryButtons.forEach(btn => {
      if (btn.category.id === categoryId) {
        // Selected state: bounce animation and glowing background
        btn.circle.setStrokeStyle(6, 0xFACA2A); // Lalela Yellow border
        btn.circle.setFillStyle(0xFACA2A); // Glowing yellow background

        // Bounce animation (wiggle effect)
        this.tweens.add({
          targets: [btn.circle, btn.icon],
          y: btn.originalY - 10,
          duration: 150,
          yoyo: true,
          repeat: 1,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Slight continuous wiggle
            this.tweens.add({
              targets: btn.icon,
              angle: 5,
              duration: 100,
              yoyo: true,
              repeat: 3,
              ease: 'Sine.easeInOut'
            });
          }
        });
      } else {
        // Unselected state
        btn.circle.setStrokeStyle(5, 0xFFFFFF);
        btn.circle.setFillStyle(btn.category.color);
        btn.icon.setAngle(0); // Reset rotation
        // Stop any ongoing tweens
        this.tweens.killTweensOf([btn.circle, btn.icon]);
      }
    });

    // Filter and show games with pop effect
    this.filterGamesByCategory(categoryId);

    // Play selection sound (if audio is available)
    if (this.app && this.app.audioManager) {
      this.app.audioManager.playSound('click');
    }
  }

  /**
   * Create responsive game grid
   */
  createGameGrid(width, height) {
    // Clear existing game cards to prevent duplicates when scene is restarted
    if (this.gameCards) {
      this.gameCards.forEach(card => {
        if (card && card.destroy) {
          card.destroy();
        }
      });
    }
    this.gameCards = [];

    // Calculate responsive grid
    const cardSize = Math.min(200, width / 6);
    const gridAreaTop = 270;
    const gridAreaBottom = height - 120;
    const gridAreaHeight = gridAreaBottom - gridAreaTop;

    this.gridConfig = {
      cardSize: cardSize,
      spacing: 30,
      areaTop: gridAreaTop,
      areaBottom: gridAreaBottom,
      areaLeft: 20,
      areaRight: width - 20
    };

    // Create game cards (initially hidden, will be shown by filter)
    this.allGames.forEach(game => {
      this.createGameCard(game);
    });
  }

  /**
   * Create individual game card (Sticker Style)
   */
  createGameCard(game) {
    const cardSize = this.gridConfig.cardSize;
    const card = this.add.container(0, 0);
    card.setVisible(false); // Initially hidden

    // Card background (white with more rounded corners and thicker border)
    const background = this.add.rectangle(0, 0, cardSize, cardSize * 1.3, 0xFFFFFF, 0.95);
    background.setStrokeStyle(4, 0x101012); // Thick Ink Black border
    card.add(background);

    // Game icon (top 80% of card - much larger for toddler appeal)
    const icon = this.add.sprite(0, -cardSize * 0.25, game.icon.replace('.svg', ''));
    icon.setScale((cardSize * 0.8) / 100); // 80% of card width
    card.add(icon);

    // Game name (bottom 20% of card - using Fredoka One)
    const nameText = this.add.text(0, cardSize * 0.4, game.name, {
      fontSize: '18px', // Larger for better readability
      color: '#101012',
      fontFamily: 'Fredoka One, cursive',
      align: 'center',
      wordWrap: { width: cardSize - 20 }
    }).setOrigin(0.5);
    card.add(nameText);

    // Difficulty stars (top-right corner with rotation animation)
    const stars = this.createDifficultyStars(game.difficulty, cardSize);
    stars.forEach(star => card.add(star));
    stars.forEach((star, index) => {
      star.setPosition(cardSize * 0.35 - (stars.length - 1 - index) * 20, -cardSize * 0.55);
    });

    // Make card interactive
    background.setInteractive({ useHandCursor: true });

    background.on('pointerover', () => {
      card.setScale(1.08); // More dramatic scale for "grab-able" feel
      background.setStrokeStyle(5, 0xFACA2A); // Lalela Yellow border

      // Animate stars on hover
      stars.forEach((star, index) => {
        this.tweens.add({
          targets: star,
          angle: 360,
          duration: 1000 + index * 200,
          repeat: -1,
          ease: 'Linear'
        });
      });
    });

    background.on('pointerout', () => {
      card.setScale(1.0);
      background.setStrokeStyle(4, 0x101012); // Back to Ink Black

      // Stop star rotation
      stars.forEach(star => {
        this.tweens.killTweensOf(star);
        star.setAngle(0);
      });
    });

    background.on('pointerdown', () => {
      this.startGame(game.scene);
    });

    // Store card data
    card.gameData = game;

    this.gameCards.push(card);
  }

  /**
   * Create difficulty stars for game cards (Juicy Style)
   */
  createDifficultyStars(difficulty, cardSize) {
    const stars = [];

    for (let i = 1; i <= difficulty; i++) {
      const star = this.add.sprite(0, 0, `difficulty${Math.min(i, 3)}`);
      star.setScale(0.8); // Larger for more visibility
      star.setTint(0xFACA2A); // Lalela Yellow instead of generic gold
      stars.push(star);
    }

    return stars;
  }

  /**
   * Filter games by category
   */
  filterGamesByCategory(categoryId) {
    let visibleGames;

    if (categoryId === 'all') {
      visibleGames = this.allGames;
    } else {
      visibleGames = this.allGames.filter(game => game.category === categoryId);
    }

    // Calculate grid layout
    const gridWidth = this.gridConfig.areaRight - this.gridConfig.areaLeft;
    const cols = Math.floor(gridWidth / (this.gridConfig.cardSize + this.gridConfig.spacing));
    const rows = Math.ceil(visibleGames.length / cols);

    // Position visible cards
    visibleGames.forEach((game, index) => {
      const card = this.gameCards.find(c => c.gameData.scene === game.scene);
      if (card) {
        const row = Math.floor(index / cols);
        const col = index % cols;

        const totalWidth = cols * this.gridConfig.cardSize + (cols - 1) * this.gridConfig.spacing;
        const startX = this.gridConfig.areaLeft + (gridWidth - totalWidth) / 2 + this.gridConfig.cardSize / 2;
        const startY = this.gridConfig.areaTop + this.gridConfig.cardSize / 2;

        const x = startX + col * (this.gridConfig.cardSize + this.gridConfig.spacing);
        const y = startY + row * (this.gridConfig.cardSize * 1.3 + this.gridConfig.spacing);

        card.setPosition(x, y);
        card.setVisible(true);

        // Pop effect animation (scale from 0 with Back.easeOut)
        card.setScale(0);
        card.setAlpha(1);
        this.tweens.add({
          targets: card,
          scale: 1,
          duration: 400,
          delay: index * 80,
          ease: 'Back.easeOut'
        });
      }
    });

    // Hide non-visible cards
    this.allGames.forEach(game => {
      if (!visibleGames.includes(game)) {
        const card = this.gameCards.find(c => c.gameData.scene === game.scene);
        if (card) {
          card.setVisible(false);
        }
      }
    });
  }

  /**
   * Clear existing bottom controls to prevent duplicates on scene restart
   */
  clearBottomControls() {
    if (this.bottomControls) {
      this.bottomControls.forEach(control => {
        if (control.button && control.button.destroy) control.button.destroy();
        if (control.shadow && control.shadow.destroy) control.shadow.destroy();
        if (control.icon && control.icon.destroy) control.icon.destroy();
        if (control.label && control.label.destroy) control.label.destroy();
      });
    }
    this.bottomControls = [];
  }

  /**
   * Create bottom control bar (3D Toy Style)
   */
  createBottomControls(width, height) {
    const barY = height - 55;
    const buttonSize = 72; // 20% larger (60 * 1.2)
    const spacing = 120; // Adjusted for larger buttons

    const controls = [
      { icon: 'exit', action: 'exit', color: 0xE32528 },
      { icon: 'settings', action: 'settings', color: 0x0062FF },
      { icon: 'help', action: 'help', color: 0x00B378 },
      { icon: 'home', action: 'home', color: 0xFACA2A }
    ];

    const totalWidth = (controls.length - 1) * spacing + buttonSize;
    const startX = (width - totalWidth) / 2 + buttonSize / 2;

    controls.forEach((control, index) => {
      const x = startX + index * spacing;

      // Fake 3D shadow (darker version of button color)
      const shadowColor = Phaser.Display.Color.GetColor(
        Phaser.Display.Color.IntegerToRGB(control.color).r * 0.6,
        Phaser.Display.Color.IntegerToRGB(control.color).g * 0.6,
        Phaser.Display.Color.IntegerToRGB(control.color).b * 0.6
      );
      const shadow = this.add.circle(x + 3, barY + 3, buttonSize / 2, shadowColor, 0.5);

      // Circular button background (3D effect)
      const button = this.add.circle(x, barY, buttonSize / 2, control.color);
      button.setStrokeStyle(4, 0xFFFFFF); // Thicker white border
      button.setInteractive({ useHandCursor: true });

      // Control icon
      const icon = this.add.sprite(x, barY, control.icon);
      icon.setScale((buttonSize * 0.7) / 100); // Slightly larger relative to button
      icon.setTint(0xFFFFFF);

      // Pressed effect (move down slightly)
      button.on('pointerdown', () => {
        button.setPosition(x, barY + 2);
        icon.setPosition(x, barY + 2);
        this.handleControlAction(control.action);

        // Reset position after short delay
        this.time.delayedCall(100, () => {
          button.setPosition(x, barY);
          icon.setPosition(x, barY);
        });
      });

      // Hover effects (more pronounced)
      button.on('pointerover', () => {
        button.setScale(1.15);
        button.setStrokeStyle(5, 0x000000);
        icon.setScale((buttonSize * 0.8) / 100);
      });

      button.on('pointerout', () => {
        button.setScale(1.0);
        button.setStrokeStyle(4, 0xFFFFFF);
        icon.setScale((buttonSize * 0.7) / 100);
      });

      this.bottomControls.push({
        button: button,
        shadow: shadow,
        icon: icon,
        action: control.action
      });
    });
  }

  /**
   * Handle bottom control actions
   */
  handleControlAction(action) {
    switch (action) {
      case 'exit':
        if (window.confirm('Are you sure you want to exit the game?')) {
          window.close();
        }
        break;
      case 'settings':
        // Open settings dialog
        console.log('Settings clicked');
        break;
      case 'help':
        // Show help modal
        this.showHelpModal();
        break;
      case 'home':
        // Reset to show all games
        this.selectCategory('all');
        break;
    }
  }

  /**
   * Show help modal
   */
  showHelpModal() {
    const { width, height } = this.game.config;

    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.closeHelpModal());

    // Modal background
    const modalBg = this.add.rectangle(width / 2, height / 2, 500, 400, 0xFDFAED);
    modalBg.setStrokeStyle(4, 0xFACA2A);

    // Help content
    const helpText = this.add.text(width / 2, height / 2, 'Welcome to Lalela Web Games!\n\n' +
      '• Choose a category by clicking the animal icons\n' +
      '• Click on game cards to start playing\n' +
      '• Difficulty stars show game complexity\n' +
      '• Use bottom controls for settings and help\n\n' +
      'Enjoy learning with fun!', {
      fontSize: '18px',
      color: '#101012',
      fontFamily: 'Nunito, sans-serif',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    // Close button
    const closeBtn = this.add.circle(width / 2 + 220, height / 2 - 180, 20, 0xE32528);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeHelpModal());

    const closeText = this.add.text(width / 2 + 220, height / 2 - 180, '×', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Fredoka One, cursive'
    }).setOrigin(0.5);

    this.helpModal = [overlay, modalBg, helpText, closeBtn, closeText];
  }

  /**
   * Close help modal
   */
  closeHelpModal() {
    if (this.helpModal) {
      this.helpModal.forEach(element => element.destroy());
      this.helpModal = null;
    }
  }

  /**
   * Set up keyboard navigation for accessibility
   */
  setupKeyboardNavigation() {
    // Listen for keyboard events
    this.input.keyboard.on('keydown-TAB', (event) => {
      event.preventDefault();
      this.navigateNext();
    });

    this.input.keyboard.on('keydown-SHIFT_TAB', (event) => {
      event.preventDefault();
      this.navigatePrevious();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.activateCurrentCard();
    });

    this.input.keyboard.on('keydown-SPACE', (event) => {
      event.preventDefault();
      this.activateCurrentCard();
    });

    // Arrow key navigation
    this.input.keyboard.on('keydown-UP', () => this.navigateUp());
    this.input.keyboard.on('keydown-DOWN', () => this.navigateDown());
    this.input.keyboard.on('keydown-LEFT', () => this.navigateLeft());
    this.input.keyboard.on('keydown-RIGHT', () => this.navigateRight());

    // Category navigation (number keys)
    for (let i = 1; i <= this.categories.length; i++) {
      this.input.keyboard.on(`keydown-${i}`, () => {
        this.selectCategory(this.categories[i - 1].id);
      });
    }

    // Escape key for help
    this.input.keyboard.on('keydown-ESCAPE', () => {
      if (this.helpModal) {
        this.closeHelpModal();
      }
    });

    // H key for help
    this.input.keyboard.on('keydown-H', () => {
      this.showHelpModal();
    });
  }

  /**
   * Navigate to next card
   */
  navigateNext() {
    const visibleCards = this.gameCards.filter(card => card.visible);
    if (visibleCards.length === 0) return;

    this.currentFocusIndex = (this.currentFocusIndex + 1) % visibleCards.length;
    this.focusGameCard(this.currentFocusIndex);
  }

  /**
   * Navigate to previous card
   */
  navigatePrevious() {
    const visibleCards = this.gameCards.filter(card => card.visible);
    if (visibleCards.length === 0) return;

    this.currentFocusIndex = this.currentFocusIndex === 0 ?
      visibleCards.length - 1 : this.currentFocusIndex - 1;
    this.focusGameCard(this.currentFocusIndex);
  }

  /**
   * Navigate up in grid
   */
  navigateUp() {
    this.navigateInDirection(-1, 0);
  }

  /**
   * Navigate down in grid
   */
  navigateDown() {
    this.navigateInDirection(1, 0);
  }

  /**
   * Navigate left in grid
   */
  navigateLeft() {
    this.navigateInDirection(0, -1);
  }

  /**
   * Navigate right in grid
   */
  navigateRight() {
    this.navigateInDirection(0, 1);
  }

  /**
   * Navigate in a specific direction
   */
  navigateInDirection(deltaRow, deltaCol) {
    const visibleCards = this.gameCards.filter(card => card.visible);
    if (visibleCards.length === 0) return;

    const gridWidth = this.gridConfig.areaRight - this.gridConfig.areaLeft;
    const cols = Math.floor(gridWidth / (this.gridConfig.cardSize + this.gridConfig.spacing));

    const currentCard = visibleCards[this.currentFocusIndex];
    const currentIndex = this.allGames.findIndex(game => game.scene === currentCard.gameData.scene);
    const currentRow = Math.floor(currentIndex / cols);
    const currentCol = currentIndex % cols;

    const newRow = currentRow + deltaRow;
    const newCol = currentCol + deltaCol;

    if (newRow >= 0 && newCol >= 0 && newCol < cols) {
      const newIndex = newRow * cols + newCol;
      if (newIndex < this.allGames.length) {
        const newCard = this.gameCards.find(card => card.gameData.scene === this.allGames[newIndex].scene);
        if (newCard && newCard.visible) {
          this.currentFocusIndex = visibleCards.indexOf(newCard);
          this.focusGameCard(this.currentFocusIndex);
        }
      }
    }
  }

  /**
   * Focus a specific game card
   */
  focusGameCard(index) {
    // Ensure we have game cards and they're initialized
    if (!this.gameCards || this.gameCards.length === 0) {
      return;
    }

    const visibleCards = this.gameCards.filter(card => card.visible);
    if (!visibleCards || visibleCards.length === 0 || !visibleCards[index]) {
      return;
    }

    // Remove focus from all cards
    this.gameCards.forEach((card, i) => {
      // Safely get the background element
      const background = card.getAt && card.getAt(0); // First element should be background
      if (!background) {
        console.warn('Could not find background for card', card.gameData?.name);
        return;
      }

      if (visibleCards.includes(card)) {
        const cardIndex = visibleCards.indexOf(card);
        if (cardIndex === index) {
          // Add focus to this card
          if (background.setStrokeStyle) {
            background.setStrokeStyle(5, 0x000000); // Thick black border
          }
          if (card.setScale) {
            card.setScale(1.05);
          }
          this.announceToScreenReader(`Selected: ${card.gameData.name}`);
        } else {
          // Remove focus from other visible cards
          if (background.setStrokeStyle) {
            background.setStrokeStyle(3, 0x0062FF);
          }
          if (card.setScale) {
            card.setScale(1.0);
          }
        }
      }
    });
  }

  /**
   * Activate the currently focused card
   */
  activateCurrentCard() {
    const visibleCards = this.gameCards.filter(card => card.visible);
    if (!visibleCards || !visibleCards[this.currentFocusIndex]) return;

    const gameScene = visibleCards[this.currentFocusIndex].gameData.scene;
    this.startGame(gameScene);
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
      document.body.removeChild(announcement);
    }, 1000);
  }

  startGame(gameScene) {
    console.log(`Starting game: ${gameScene}`);

    // Close any open modals
    if (this.helpModal) {
      this.closeHelpModal();
    }

    // Stop current scene
    this.scene.stop('GameMenu');

    // Start the selected game scene with app data
    this.scene.start(gameScene, {
      app: this.app
    });
  }

  /**
   * Clean up when scene is destroyed
   */
  destroy() {
    // Clean up animations
    if (this.clouds) {
      this.clouds.forEach(cloud => {
        if (cloud && cloud.destroy) cloud.destroy();
      });
    }

    // Clean up game cards
    if (this.gameCards) {
      this.gameCards.forEach(card => {
        if (card && card.destroy) card.destroy();
      });
    }

    // Clean up category buttons
    if (this.categoryButtons) {
      this.categoryButtons.forEach(btn => {
        if (btn.circle && btn.circle.destroy) btn.circle.destroy();
        if (btn.shadow && btn.shadow.destroy) btn.shadow.destroy();
        if (btn.icon && btn.icon.destroy) btn.icon.destroy();
        if (btn.text && btn.text.destroy) btn.text.destroy();
      });
    }

    // Clean up bottom controls
    if (this.bottomControls) {
      this.bottomControls.forEach(control => {
        if (control.button && control.button.destroy) control.button.destroy();
        if (control.shadow && control.shadow.destroy) control.shadow.destroy();
        if (control.icon && control.icon.destroy) control.icon.destroy();
      });
    }

    // Close help modal if open
    if (this.helpModal) {
      this.closeHelpModal();
    }

    // Remove keyboard listeners
    if (this.input && this.input.keyboard) {
      this.input.keyboard.off('keydown-TAB');
      this.input.keyboard.off('keydown-SHIFT_TAB');
      this.input.keyboard.off('keydown-ENTER');
      this.input.keyboard.off('keydown-SPACE');
      this.input.keyboard.off('keydown-UP');
      this.input.keyboard.off('keydown-DOWN');
      this.input.keyboard.off('keydown-LEFT');
      this.input.keyboard.off('keydown-RIGHT');
      this.input.keyboard.off('keydown-ESCAPE');
      this.input.keyboard.off('keydown-H');

      // Remove number key listeners
      for (let i = 1; i <= this.categories.length; i++) {
        this.input.keyboard.off(`keydown-${i}`);
      }
    }

    super.destroy();
  }
}