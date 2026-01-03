import Phaser from 'phaser';
import { Howl, Howler } from 'howler';
import './styles/brand.css';
import { GameManager } from './utils/GameManager.js';
import { AssetManager } from './utils/AssetManager.js';
import { UIManager } from './utils/UIManager.js';
import { InputManager } from './utils/InputManager.js';
import { AudioManager } from './utils/AudioManager.js';
import { DataManager } from './utils/DataManager.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';
import { AdjacentNumbers } from './games/AdjacentNumbers.js';
import { HexagonGame } from './games/HexagonGame.js';
import { CheckersGame } from './games/CheckersGame.js';
import { SmallnumbersGame } from './games/SmallnumbersGame.js';
import { Smallnumbers2Game } from './games/Smallnumbers2Game.js';
import { LearnQuantitiesGame } from './games/LearnQuantitiesGame.js';
import { LearnAdditionsGame } from './games/LearnAdditionsGame.js';
import { LearnSubtractionsGame } from './games/LearnSubtractionsGame.js';
import { VerticalAdditionGame } from './games/VerticalAdditionGame.js';
import { Guesscount } from './games/Guesscount.js';
import { MemoryImageGame } from './games/MemoryImageGame.js';
import { MemorySoundGame } from './games/MemorySoundGame.js';
import { BabyMatchGame } from './games/BabyMatchGame.js';
import { ColorMixGame } from './games/ColorMixGame.js';
import { GeographyMapGame } from './games/GeographyMapGame.js';
import { SoundButtonGame } from './games/SoundButtonGame.js';
import { LearnDigitsGame } from './games/LearnDigitsGame.js';
import { AlgebraPlusGame } from './games/AlgebraPlusGame.js';
import { AlgebraMinusGame } from './games/AlgebraMinusGame.js';
import { AlgebraByGame } from './games/AlgebraByGame.js';
import { AlgebraDivGame } from './games/AlgebraDivGame.js';
import { MoneyGame } from './games/MoneyGame.js';
import { MoneyCentsGame } from './games/MoneyCentsGame.js';
import { MoneyBackGame } from './games/MoneyBackGame.js';
import { ClickOnLetterGame } from './games/ClickOnLetterGame.js';
import { ClickOnLetterUpGame } from './games/ClickOnLetterUpGame.js';
import { AlphabetSequenceGame } from './games/AlphabetSequenceGame.js';
import { LetterInWordGame } from './games/LetterInWordGame.js';
import { MissingLetterGame } from './games/MissingLetterGame.js';
import { ReadingHGame } from './games/ReadingHGame.js';
import { ReadingVGame } from './games/ReadingVGame.js';
import { WordsGame } from './games/WordsGame.js';
import { TicTacToeGame } from './games/TicTacToeGame.js';
import { TicTacToeTwoPlayerGame } from './games/TicTacToeTwoPlayerGame.js';
import { Align4Game } from './games/Align4Game.js';
import { Align4TwoPlayerGame } from './games/Align4TwoPlayerGame.js';
import { ChessGame } from './games/ChessGame.js';
import { ChessTwoPlayerGame } from './games/ChessTwoPlayerGame.js';
import { ColorsGame } from './games/ColorsGame.js';
import { AdvancedColorsGame } from './games/AdvancedColorsGame.js';
import { ColorMixPaintGame } from './games/ColorMixPaintGame.js';
import { ColorMixLightGame } from './games/ColorMixLightGame.js';
import { LoadingScene } from './scenes/LoadingScene.js';
import { GameMenuScene } from './scenes/GameMenuScene.js';
import { browserCompatibility } from './utils/BrowserCompatibility.js';
import { accessibilityTester } from './utils/AccessibilityTester.js';
import { securityTester } from './utils/SecurityTester.js';

// Global game configuration
const GAME_CONFIG = {
  width: Math.max(window.innerWidth || 800, 800),
  height: Math.max(window.innerHeight || 600, 600),
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: Math.max(window.innerWidth || 800, 800),
    height: Math.max(window.innerHeight || 600, 600)
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: process.env.NODE_ENV === 'development'
    }
  }
};

// Initialize the application
class LalelaGamesApp {
  constructor() {
    this.game = null;
    this.gameManager = null;
    this.assetManager = null;
    this.uiManager = null;
    this.inputManager = null;
    this.audioManager = null;
    this.dataManager = null;
    this.performanceMonitor = null;
    this.currentGame = null;

    this.init();
  }

  async init() {
    try {
      // Start performance monitoring
      this.performanceMonitor = new PerformanceMonitor();
      this.performanceMonitor.startMonitoring();

      // Initialize managers in correct order
      this.audioManager = new AudioManager();
      this.dataManager = new DataManager();
      this.assetManager = new AssetManager();
      this.uiManager = new UIManager(this.audioManager);
      this.gameManager = new GameManager(this.assetManager, this.uiManager);

      // Initialize UI
      this.uiManager.initialize();

      // Make sure game container is visible before creating Phaser game
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) {
        gameContainer.style.display = 'block';
      }

      // Initialize Phaser game
      this.game = new Phaser.Game(GAME_CONFIG);

      // Add loading scene first
      this.game.scene.add('LoadingScene', LoadingScene);

      // Add game menu scene
      this.game.scene.add('GameMenu', GameMenuScene);

      // Add game scenes
      this.game.scene.add('AdjacentNumbers', AdjacentNumbers);
      this.game.scene.add('SmallnumbersGame', SmallnumbersGame);
      this.game.scene.add('Smallnumbers2Game', Smallnumbers2Game);
      this.game.scene.add('LearnQuantitiesGame', LearnQuantitiesGame);
      this.game.scene.add('LearnAdditionsGame', LearnAdditionsGame);
      this.game.scene.add('LearnSubtractionsGame', LearnSubtractionsGame);
      this.game.scene.add('VerticalAdditionGame', VerticalAdditionGame);
      this.game.scene.add('Guesscount', Guesscount);
      this.game.scene.add('MemoryImageGame', MemoryImageGame);
      this.game.scene.add('MemorySoundGame', MemorySoundGame);
      this.game.scene.add('BabyMatchGame', BabyMatchGame);
      this.game.scene.add('ColorMixGame', ColorMixGame);
      this.game.scene.add('GeographyMapGame', GeographyMapGame);
      this.game.scene.add('SoundButtonGame', SoundButtonGame);
      this.game.scene.add('LearnDigitsGame', LearnDigitsGame);
      this.game.scene.add('HexagonGame', HexagonGame);
      this.game.scene.add('CheckersGame', CheckersGame);
      this.game.scene.add('AlgebraPlusGame', AlgebraPlusGame);
      this.game.scene.add('AlgebraMinusGame', AlgebraMinusGame);
      this.game.scene.add('AlgebraByGame', AlgebraByGame);
      this.game.scene.add('AlgebraDivGame', AlgebraDivGame);
      this.game.scene.add('MoneyGame', MoneyGame);
      this.game.scene.add('MoneyCentsGame', MoneyCentsGame);
      this.game.scene.add('MoneyBackGame', MoneyBackGame);
      this.game.scene.add('ClickOnLetterGame', ClickOnLetterGame);
      this.game.scene.add('ClickOnLetterUpGame', ClickOnLetterUpGame);
      this.game.scene.add('AlphabetSequenceGame', AlphabetSequenceGame);
      this.game.scene.add('LetterInWordGame', LetterInWordGame);
      this.game.scene.add('MissingLetterGame', MissingLetterGame);
      this.game.scene.add('ReadingHGame', ReadingHGame);
      this.game.scene.add('ReadingVGame', ReadingVGame);
      this.game.scene.add('WordsGame', WordsGame);
      this.game.scene.add('TicTacToeGame', TicTacToeGame);
      this.game.scene.add('TicTacToeTwoPlayerGame', TicTacToeTwoPlayerGame);
      this.game.scene.add('Align4Game', Align4Game);
      this.game.scene.add('Align4TwoPlayerGame', Align4TwoPlayerGame);
      this.game.scene.add('ChessGame', ChessGame);
      this.game.scene.add('ChessTwoPlayerGame', ChessTwoPlayerGame);
      this.game.scene.add('ColorsGame', ColorsGame);
      this.game.scene.add('AdvancedColorsGame', AdvancedColorsGame);
      this.game.scene.add('ColorMixPaintGame', ColorMixPaintGame);
      this.game.scene.add('ColorMixLightGame', ColorMixLightGame);

      // Setup audio manager
      await this.audioManager.preloadCommonSounds();

      // Setup global event listeners
      this.setupEventListeners();

      // Load initial assets and data
      const loadStartTime = performance.now();
      await Promise.all([
        this.assetManager.loadCoreAssets(),
        this.dataManager.initializeServices()
      ]);

      // Run browser compatibility tests
      try {
        const compatibilityResults = await browserCompatibility.runCompatibilityTests();
        console.log('Browser compatibility test completed:', compatibilityResults);

        // Store compatibility results for later use
        this.browserCompatibility = compatibilityResults;
      } catch (error) {
        console.warn('Browser compatibility test failed:', error);
      }

      // Run accessibility tests
      try {
        const accessibilityResults = await accessibilityTester.runAccessibilityTests(this);
        console.log('Accessibility test completed:', accessibilityResults);

        // Store accessibility results
        this.accessibilityResults = accessibilityResults;
      } catch (error) {
        console.warn('Accessibility test failed:', error);
      }

      // Run security tests
      try {
        const securityResults = await securityTester.runSecurityTests();
        console.log('Security test completed:', securityResults);

        // Store security results
        this.securityResults = securityResults;
      } catch (error) {
        console.warn('Security test failed:', error);
      }
      const loadTime = performance.now() - loadStartTime;
      this.performanceMonitor.recordLoadTime('initial_assets', loadTime);

      // Initialize game menu
      this.showGameMenu();

      console.log('Lalela Games initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Lalela Games:', error);
      this.performanceMonitor?.recordError(error, { phase: 'initialization' });
      this.showErrorScreen(error);
    }
  }


  showErrorScreen(error) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.innerHTML = `
        <h1>Error Loading Games</h1>
        <p>Sorry, there was a problem loading the games. Please try refreshing the page.</p>
        <p>Error: ${error.message}</p>
        <button onclick="window.location.reload()">Reload Page</button>
      `;
    }
  }

  showGameMenu() {
    // Start the GameMenu scene (now properly registered during initialization)
    this.game.scene.start('GameMenu', { app: this });
  }

  // Legacy GameMenu code completely removed - now using proper GameMenuScene class

  startGame(gameScene) {
    console.log(`Starting game: ${gameScene}`);

    // Stop current scene and start the selected game scene
    this.game.scene.stop('GameMenu');

    if (gameScene === 'AdjacentNumbers') {
      this.game.scene.start('AdjacentNumbers', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'SmallnumbersGame') {
      this.game.scene.start('SmallnumbersGame', {
        app: this,
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        inputManager: this.inputManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        performanceMonitor: this.performanceMonitor,
        renderingOptimizer: this.renderingOptimizer,
        tweenPool: this.tweenPool,
        helpSystem: this.helpSystem
      });
    } else if (gameScene === 'Smallnumbers2Game') {
      this.game.scene.start('Smallnumbers2Game', {
        app: this,
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        inputManager: this.inputManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        performanceMonitor: this.performanceMonitor,
        renderingOptimizer: this.renderingOptimizer,
        tweenPool: this.tweenPool,
        helpSystem: this.helpSystem
      });
    } else if (gameScene === 'LearnQuantitiesGame') {
      this.game.scene.start('LearnQuantitiesGame', {
        app: this,
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        inputManager: this.inputManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        performanceMonitor: this.performanceMonitor,
        renderingOptimizer: this.renderingOptimizer,
        tweenPool: this.tweenPool,
        helpSystem: this.helpSystem
      });
    } else if (gameScene === 'LearnAdditionsGame') {
      this.game.scene.start('LearnAdditionsGame', {
        app: this,
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        inputManager: this.inputManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        performanceMonitor: this.performanceMonitor,
        renderingOptimizer: this.renderingOptimizer,
        tweenPool: this.tweenPool,
        helpSystem: this.helpSystem
      });
    } else if (gameScene === 'LearnSubtractionsGame') {
      this.game.scene.start('LearnSubtractionsGame', {
        app: this,
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        inputManager: this.inputManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        performanceMonitor: this.performanceMonitor,
        renderingOptimizer: this.renderingOptimizer,
        tweenPool: this.tweenPool,
        helpSystem: this.helpSystem
      });
    } else if (gameScene === 'VerticalAdditionGame') {
      this.game.scene.start('VerticalAdditionGame', {
        app: this,
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        inputManager: this.inputManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        performanceMonitor: this.performanceMonitor,
        renderingOptimizer: this.renderingOptimizer,
        tweenPool: this.tweenPool,
        helpSystem: this.helpSystem
      });
    } else if (gameScene === 'Guesscount') {
      this.game.scene.start('Guesscount', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'MemoryImageGame') {
      this.game.scene.start('MemoryImageGame', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'MemorySoundGame') {
      this.game.scene.start('MemorySoundGame', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'BabyMatchGame') {
      this.game.scene.start('BabyMatchGame', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'ColorMixGame') {
      this.game.scene.start('ColorMixGame', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'GeographyMapGame') {
      this.game.scene.start('GeographyMapGame', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'SoundButtonGame') {
      this.game.scene.start('SoundButtonGame', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'LearnDigitsGame') {
      this.game.scene.start('LearnDigitsGame', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'HexagonGame') {
      this.game.scene.start('HexagonGame', {
        gameManager: this.gameManager,
        assetManager: this.assetManager,
        uiManager: this.uiManager,
        audioManager: this.audioManager,
        dataManager: this.dataManager,
        inputManager: this.inputManager
      });
    } else if (gameScene === 'CheckersGame') {
      this.game.scene.start('CheckersGame', {
        app: this
      });
    } else {
      // For other games, show placeholder
      const app = this;

      class PlaceholderScene extends Phaser.Scene {
        constructor() {
          super('PlaceholderGame');
        }

        create() {
          const { width, height } = app.game.config;

          this.add.rectangle(width / 2, height / 2, width, height, 0x34495e);
          this.add.text(width / 2, height / 2,
            `${gameScene}\n\nComing Soon!`, {
            fontSize: '32px',
            color: '#ffffff',
            align: 'center'
          }).setOrigin(0.5);

          // Add back button
          const backButton = this.add.text(50, 50, '← Back to Menu', {
            fontSize: '18px',
            color: '#3498db',
            backgroundColor: '#2c3e50',
            padding: { x: 10, y: 5 }
          }).setInteractive();

          backButton.on('pointerdown', () => {
            app.game.scene.stop('PlaceholderGame');
            app.showGameMenu();
          });
        }
      }

      // Only add the scene if it doesn't already exist
      if (!this.game.scene.getScene('PlaceholderGame')) {
        this.game.scene.add('PlaceholderGame', PlaceholderScene);
      }
      this.game.scene.start('PlaceholderGame');
    }
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.game) {
        this.game.scale.resize(window.innerWidth, window.innerHeight);
      }
    });

    // Handle visibility change (pause/resume game)
    document.addEventListener('visibilitychange', () => {
      if (this.game && this.currentGame) {
        if (document.hidden) {
          this.game.scene.pause(this.currentGame);
        } else {
          this.game.scene.resume(this.currentGame);
        }
      }
    });
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.lalelaGames = new LalelaGamesApp();
});

// Export for debugging
if (process.env.NODE_ENV === 'development') {
  window.LalelaGamesApp = LalelaGamesApp;
}