/**
 * UIManager - Handles user interface elements and user feedback
 * Manages loading screens, menus, notifications, and UI components
 */
export class UIManager {
  constructor(audioManager = null, inputManager = null) {
    this.audioManager = audioManager;
    this.inputManager = inputManager;
    this.loadingElement = null;
    this.notificationQueue = [];
    this.isLoading = false;
    this.uiComponents = new Map();
    this.themes = {
      default: {
        primary: '#3498db',
        secondary: '#2ecc71',
        danger: '#e74c3c',
        warning: '#f39c12',
        background: '#2c3e50',
        text: '#ecf0f1'
      }
    };
    this.currentTheme = 'default';
  }

  /**
   * Initialize UI manager with DOM elements
   */
  initialize() {
    this.createLoadingElement();
    this.createNotificationContainer();
  }

  /**
   * Create loading screen element
   */
  createLoadingElement() {
    if (document.getElementById('lalela-loading')) {
      this.loadingElement = document.getElementById('lalela-loading');
      return;
    }

    this.loadingElement = document.createElement('div');
    this.loadingElement.id = 'lalela-loading';
    this.loadingElement.innerHTML = `
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading...</div>
          <div class="loading-progress">
            <div class="loading-bar"></div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
      }

      .loading-content {
        text-align: center;
        color: white;
        font-family: Arial, sans-serif;
      }

      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .loading-text {
        font-size: 18px;
        margin-bottom: 20px;
      }

      .loading-progress {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        overflow: hidden;
        margin: 0 auto;
      }

      .loading-bar {
        height: 100%;
        background: white;
        width: 0%;
        transition: width 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.loadingElement);
  }

  /**
   * Create notification container
   */
  createNotificationContainer() {
    if (document.getElementById('lalela-notifications')) {
      return;
    }

    const container = document.createElement('div');
    container.id = 'lalela-notifications';

    const theme = this.themes[this.currentTheme];

    const style = document.createElement('style');
    style.textContent = `
      #lalela-notifications {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
        font-family: Arial, sans-serif;
      }

      .notification {
        background: white;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        border-left: 4px solid ${theme.primary};
        max-width: 320px;
        min-width: 280px;
        opacity: 0;
        transform: translateX(100%) scale(0.8);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        pointer-events: auto;
        backdrop-filter: blur(10px);
      }

      .notification.show {
        opacity: 1;
        transform: translateX(0) scale(1);
      }

      .notification.success {
        border-left-color: ${theme.secondary};
        background: linear-gradient(135deg, #d4edda, #c3e6cb);
      }

      .notification.error {
        border-left-color: ${theme.danger};
        background: linear-gradient(135deg, #f8d7da, #f5c6cb);
      }

      .notification.warning {
        border-left-color: ${theme.warning};
        background: linear-gradient(135deg, #fff3cd, #ffeaa7);
      }

      .notification.info {
        border-left-color: ${theme.primary};
        background: linear-gradient(135deg, #d1ecf1, #bee5eb);
      }

      .notification-title {
        font-weight: 600;
        margin-bottom: 6px;
        font-size: 15px;
        color: #2c3e50;
      }

      .notification-message {
        font-size: 14px;
        color: #34495e;
        line-height: 1.4;
      }

      .notification-close {
        position: absolute;
        top: 12px;
        right: 12px;
        cursor: pointer;
        font-size: 18px;
        color: #95a5a6;
        transition: color 0.2s ease;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .notification-close:hover {
        color: #2c3e50;
        background: rgba(0, 0, 0, 0.1);
      }

      .notification-progress {
        margin-top: 12px;
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
        overflow: hidden;
      }

      .notification-progress-bar {
        height: 100%;
        background: currentColor;
        width: 100%;
        animation: progress-shrink 3s linear forwards;
      }

      @keyframes progress-shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(container);
  }

  /**
   * Show loading screen
   */
  showLoading(message = 'Loading...', progress = null) {
    if (!this.loadingElement) {
      this.initialize();
    }

    this.isLoading = false;
    this.loadingElement.style.display = 'block';

    const textElement = this.loadingElement.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = message;
    }

    if (progress !== null) {
      this.updateLoadingProgress(progress);
    }
  }

  /**
   * Hide loading screen
   */
  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
    this.isLoading = false;
  }

  /**
   * Update loading progress
   */
  updateLoadingProgress(progress) {
    if (this.loadingElement) {
      const bar = this.loadingElement.querySelector('.loading-bar');
      if (bar) {
        bar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
      }
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info', duration = 3000, options = {}) {
    if (!document.getElementById('lalela-notifications')) {
      this.initialize();
    }

    const container = document.getElementById('lalela-notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const title = options.title || this.getNotificationTitle(type);
    const showProgress = duration > 0 && options.showProgress !== false;

    notification.innerHTML = `
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
      <span class="notification-close">×</span>
      ${showProgress ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
    `;

    container.appendChild(notification);

    // Play sound if audio manager is available
    if (this.audioManager && options.sound) {
      this.audioManager.playSound(options.sound);
    }

    // Show notification with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Setup close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.hideNotification(notification);
    });

    // Auto-hide after duration
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        if (notification.parentNode) {
          this.hideNotification(notification);
        }
      }, duration);

      // Store timeout ID for potential cancellation
      notification._timeoutId = timeoutId;
    }

    return notification;
  }

  /**
   * Hide notification
   */
  hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Get notification title based on type
   */
  getNotificationTitle(type) {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };
    return titles[type] || 'Info';
  }

  /**
   * Show error message
   */
  showError(message, duration = 5000) {
    return this.showNotification(message, 'error', duration);
  }

  /**
   * Show success message
   */
  showSuccess(message, duration = 3000) {
    return this.showNotification(message, 'success', duration);
  }

  /**
   * Show warning message
   */
  showWarning(message, duration = 4000) {
    return this.showNotification(message, 'warning', duration);
  }

  /**
   * Create game UI elements
   */
  createGameUI(scene, config) {
    const uiElements = {};

    // Score display
    if (config.showScore) {
      uiElements.score = this.createScoreDisplay(scene);
    }

    // Timer
    if (config.showTimer) {
      uiElements.timer = this.createTimerDisplay(scene);
    }

    // Progress bar
    if (config.showProgress) {
      uiElements.progress = this.createProgressBar(scene);
    }

    // Lives/Hearts display
    if (config.showLives) {
      uiElements.lives = this.createLivesDisplay(scene, config.maxLives || 3);
    }

    // Level indicator
    if (config.showLevel) {
      uiElements.level = this.createLevelDisplay(scene);
    }

    // Control buttons
    uiElements.controls = this.createControlButtons(scene);

    // Pause menu
    if (config.showPauseMenu) {
      uiElements.pauseMenu = this.createPauseMenu(scene);
    }

    return uiElements;
  }

  /**
   * Create score display
   */
  createScoreDisplay(scene) {
    const scoreText = scene.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });

    return {
      text: scoreText,
      updateScore: (score) => {
        scoreText.setText(`Score: ${score}`);
      }
    };
  }

  /**
   * Create timer display
   */
  createTimerDisplay(scene) {
    const timerText = scene.add.text(scene.game.config.width - 20, 20, '00:00', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0);

    let startTime = Date.now();
    let paused = false;

    return {
      text: timerText,
      start: () => {
        startTime = Date.now();
        paused = false;
      },
      pause: () => {
        paused = true;
      },
      resume: () => {
        paused = false;
      },
      update: () => {
        if (!paused) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const minutes = Math.floor(elapsed / 60);
          const seconds = elapsed % 60;
          timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      },
      getTime: () => {
        return Math.floor((Date.now() - startTime) / 1000);
      }
    };
  }

  /**
   * Create progress bar
   */
  createProgressBar(scene) {
    const { width, height } = scene.game.config;

    // Background
    const bg = scene.add.rectangle(width / 2, height - 30, width - 40, 8, 0x666666);

    // Progress fill
    const fill = scene.add.rectangle(width / 2, height - 30, 0, 6, 0x00ff00);

    return {
      updateProgress: (progress) => {
        const maxWidth = width - 44;
        fill.width = Math.max(0, Math.min(maxWidth, progress * maxWidth));
        fill.x = 22 + fill.width / 2;
      }
    };
  }

  /**
   * Create control buttons
   */
  createControlButtons(scene) {
    const { width, height } = scene.game.config;
    const buttons = {};

    // Home button
    buttons.home = this.createButton(scene, 20, height - 20, '🏠', () => {
      // Navigate to main menu
      scene.scene.start('GameMenu');
    });

    // Settings button
    buttons.settings = this.createButton(scene, width - 60, height - 20, '⚙️', () => {
      // Show settings menu
      console.log('Settings clicked');
    });

    return buttons;
  }

  /**
   * Create lives/hearts display
   */
  createLivesDisplay(scene, maxLives = 3) {
    const { width } = scene.game.config;
    const hearts = [];

    for (let i = 0; i < maxLives; i++) {
      const heart = scene.add.text(width - 40 - (i * 35), 20, '❤️', {
        fontSize: '28px'
      });
      hearts.push(heart);
    }

    return {
      hearts,
      updateLives: (lives) => {
        hearts.forEach((heart, index) => {
          heart.setText(index < lives ? '❤️' : '🤍');
        });
      }
    };
  }

  /**
   * Create level display
   */
  createLevelDisplay(scene) {
    const levelText = scene.add.text(20, scene.game.config.height - 50, 'Level: 1', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });

    return {
      text: levelText,
      updateLevel: (level) => {
        levelText.setText(`Level: ${level}`);
      }
    };
  }

  /**
   * Create pause menu
   */
  createPauseMenu(scene) {
    const { width, height } = scene.game.config;

    // Semi-transparent overlay
    const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Pause menu panel
    const panel = scene.add.rectangle(width / 2, height / 2, 300, 200, 0xffffff, 1)
      .setStrokeStyle(3, 0x3498db);

    // Title
    const title = scene.add.text(width / 2, height / 2 - 60, 'PAUSED', {
      fontSize: '32px',
      color: '#2c3e50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.createButton(scene, width / 2, height / 2 - 10, 'Resume', () => {
      this.hidePauseMenu(pauseMenu);
    });

    // Restart button
    const restartBtn = this.createButton(scene, width / 2, height / 2 + 30, 'Restart', () => {
      // Trigger game restart
      scene.scene.restart();
    });

    // Quit button
    const quitBtn = this.createButton(scene, width / 2, height / 2 + 70, 'Quit', () => {
      scene.scene.start('GameMenu');
    });

    const pauseMenu = {
      overlay,
      panel,
      title,
      resumeBtn,
      restartBtn,
      quitBtn,
      elements: [overlay, panel, title, resumeBtn, restartBtn, quitBtn],
      show: () => this.showPauseMenu(pauseMenu),
      hide: () => this.hidePauseMenu(pauseMenu)
    };

    // Initially hide
    pauseMenu.elements.forEach(element => element.setVisible(false));

    return pauseMenu;
  }

  /**
   * Show pause menu
   */
  showPauseMenu(pauseMenu) {
    pauseMenu.elements.forEach(element => element.setVisible(true));
  }

  /**
   * Hide pause menu
   */
  hidePauseMenu(pauseMenu) {
    pauseMenu.elements.forEach(element => element.setVisible(false));
  }

  /**
   * Create enhanced button with better styling
   */
  createButton(scene, x, y, text, onClick, options = {}) {
    const theme = this.themes[this.currentTheme];

    // Button background
    const buttonBg = scene.add.rectangle(x, y, options.width || 120, options.height || 40,
      options.color || theme.primary, 1)
      .setStrokeStyle(2, 0x000000, 0.3)
      .setInteractive();

    // Button text
    const buttonText = scene.add.text(x, y, text, {
      fontSize: options.fontSize || '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(options.hoverColor || this.adjustBrightness(theme.primary, -20));
      if (this.audioManager) {
        this.audioManager.playSound('button_hover');
      }
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(options.color || theme.primary);
    });

    buttonBg.on('pointerdown', () => {
      buttonBg.setFillStyle(options.clickColor || this.adjustBrightness(theme.primary, -40));
      if (this.audioManager) {
        this.audioManager.playSound('click');
      }
      onClick();
    });

    buttonBg.on('pointerup', () => {
      buttonBg.setFillStyle(options.color || theme.primary);
    });

    return {
      background: buttonBg,
      text: buttonText,
      setText: (newText) => buttonText.setText(newText),
      setPosition: (newX, newY) => {
        buttonBg.setPosition(newX, newY);
        buttonText.setPosition(newX, newY);
      },
      setVisible: (visible) => {
        buttonBg.setVisible(visible);
        buttonText.setVisible(visible);
      },
      destroy: () => {
        buttonBg.destroy();
        buttonText.destroy();
      }
    };
  }

  /**
   * Helper method to adjust color brightness
   */
  adjustBrightness(color, amount) {
    const usePound = color[0] === '#';

    const col = usePound ? color.slice(1) : color;

    const num = parseInt(col, 16);

    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;

    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;

    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
  }

  /**
   * Show tutorial overlay
   */
  showTutorial(message, position = 'center') {
    const tutorial = document.createElement('div');
    tutorial.id = 'lalela-tutorial';
    tutorial.innerHTML = `
      <div class="tutorial-overlay">
        <div class="tutorial-content">
          <div class="tutorial-message">${message}</div>
          <button class="tutorial-close">Got it!</button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .tutorial-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        backdrop-filter: blur(5px);
      }

      .tutorial-content {
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }

      .tutorial-message {
        font-size: 18px;
        color: #2c3e50;
        margin-bottom: 24px;
        line-height: 1.5;
      }

      .tutorial-close {
        background: #3498db;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .tutorial-close:hover {
        background: #2980b9;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(tutorial);

    const closeBtn = tutorial.querySelector('.tutorial-close');
    const closeTutorial = () => {
      tutorial.remove();
      style.remove();
    };

    closeBtn.addEventListener('click', closeTutorial);

    // Auto-close after 10 seconds
    setTimeout(closeTutorial, 10000);

    return tutorial;
  }

  /**
   * Show achievement notification
   */
  showAchievement(title, description, icon = '🏆') {
    return this.showNotification(
      description,
      'success',
      5000,
      {
        title: `${icon} ${title}`,
        sound: 'success'
      }
    );
  }

  /**
   * Show settings panel
   */
  showSettingsPanel(onSettingsChange) {
    const settings = document.createElement('div');
    settings.id = 'lalela-settings';
    settings.innerHTML = `
      <div class="settings-overlay">
        <div class="settings-panel">
          <h3>Game Settings</h3>

          <div class="setting-group">
            <label>Master Volume</label>
            <input type="range" id="master-volume" min="0" max="1" step="0.1" value="1">
          </div>

          <div class="setting-group">
            <label>Sound Effects</label>
            <input type="range" id="sfx-volume" min="0" max="1" step="0.1" value="1">
          </div>

          <div class="setting-group">
            <label>Music</label>
            <input type="range" id="music-volume" min="0" max="1" step="0.1" value="1">
          </div>

          <div class="setting-group">
            <label>
              <input type="checkbox" id="mute-audio"> Mute All Audio
            </label>
          </div>

          <div class="settings-buttons">
            <button id="settings-save">Save</button>
            <button id="settings-cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .settings-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        backdrop-filter: blur(5px);
      }

      .settings-panel {
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }

      .settings-panel h3 {
        margin: 0 0 24px 0;
        color: #2c3e50;
        font-size: 24px;
        text-align: center;
      }

      .setting-group {
        margin-bottom: 20px;
      }

      .setting-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #34495e;
      }

      .setting-group input[type="range"] {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: #ecf0f1;
        outline: none;
      }

      .setting-group input[type="checkbox"] {
        margin-right: 8px;
      }

      .settings-buttons {
        display: flex;
        gap: 12px;
        margin-top: 32px;
      }

      .settings-buttons button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      #settings-save {
        background: #27ae60;
        color: white;
      }

      #settings-save:hover {
        background: #229954;
      }

      #settings-cancel {
        background: #95a5a6;
        color: white;
      }

      #settings-cancel:hover {
        background: #7f8c8d;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(settings);

    // Load current settings
    if (this.audioManager) {
      const volumes = this.audioManager.getVolumeLevels();
      document.getElementById('master-volume').value = volumes.master;
      document.getElementById('sfx-volume').value = volumes.sfx;
      document.getElementById('music-volume').value = volumes.music;
      document.getElementById('mute-audio').checked = volumes.muted;
    }

    // Event handlers
    const saveBtn = document.getElementById('settings-save');
    const cancelBtn = document.getElementById('settings-cancel');

    const closeSettings = () => {
      settings.remove();
      style.remove();
    };

    saveBtn.addEventListener('click', () => {
      if (this.audioManager) {
        const masterVol = parseFloat(document.getElementById('master-volume').value);
        const sfxVol = parseFloat(document.getElementById('sfx-volume').value);
        const musicVol = parseFloat(document.getElementById('music-volume').value);
        const isMuted = document.getElementById('mute-audio').checked;

        this.audioManager.setMasterVolume(masterVol);
        this.audioManager.setSFXVolume(sfxVol);
        this.audioManager.setMusicVolume(musicVol);
        this.audioManager.setMuted(isMuted);
      }

      if (onSettingsChange) {
        onSettingsChange();
      }

      closeSettings();
    });

    cancelBtn.addEventListener('click', closeSettings);

    return settings;
  }

  /**
   * Show achievement notification
   */
  showAchievementNotification(achievementName, options = {}) {
    const message = `🏆 Achievement Unlocked: ${achievementName}!`;
    return this.showNotification(message, 'success', 5000, {
      sound: 'achievement',
      ...options
    });
  }

  /**
   * Show game over screen
   */
  showGameOverScreen(score, onRestart, onMenu) {
    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.innerHTML = `
      <div class="game-over-content">
        <h1>🎮 Game Complete!</h1>
        <div class="final-score">Final Score: ${score}</div>
        <div class="game-over-buttons">
          <button id="restart-game" class="game-button primary">Play Again</button>
          <button id="back-to-menu" class="game-button secondary">Main Menu</button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #game-over-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
      }
      .game-over-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        max-width: 400px;
        width: 90%;
      }
      .game-over-content h1 {
        color: #2c3e50;
        margin-bottom: 20px;
        font-size: 2.5em;
      }
      .final-score {
        font-size: 1.5em;
        color: #3498db;
        margin-bottom: 30px;
        font-weight: bold;
      }
      .game-over-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
      }
      .game-button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1.1em;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: bold;
      }
      .game-button.primary {
        background: #27ae60;
        color: white;
      }
      .game-button.primary:hover {
        background: #229954;
        transform: translateY(-2px);
      }
      .game-button.secondary {
        background: #3498db;
        color: white;
      }
      .game-button.secondary:hover {
        background: #2980b9;
        transform: translateY(-2px);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Event handlers
    document.getElementById('restart-game').addEventListener('click', () => {
      overlay.remove();
      style.remove();
      if (onRestart) onRestart();
    });

    document.getElementById('back-to-menu').addEventListener('click', () => {
      overlay.remove();
      style.remove();
      if (onMenu) onMenu();
    });
  }
}