/**
 * GameManager - Central coordinator for all games
 * Handles game lifecycle, switching between games, and global state
 */
export class GameManager {
  constructor(assetManager, uiManager) {
    this.assetManager = assetManager;
    this.uiManager = uiManager;
    this.currentGame = null;
    this.gameInstances = new Map();

    this.initializeGameRegistry();
  }

  initializeGameRegistry() {
    // Registry of available games
    this.gameRegistry = {
      'adjacent_numbers': {
        name: 'Adjacent Numbers',
        class: 'AdjacentNumbersGame',
        category: 'mathematics',
        difficulty: 1,
        description: 'Find the missing adjacent numbers'
      },
      'memory': {
        name: 'Memory Game',
        class: 'MemoryGame',
        category: 'logic',
        difficulty: 2,
        description: 'Match pairs of cards'
      },
      'color_mix': {
        name: 'Color Mix',
        class: 'ColorMixGame',
        category: 'sciences',
        difficulty: 2,
        description: 'Mix colors to create new ones'
      }
    };
  }

  async loadGame(gameId) {
    try {
      const gameConfig = this.gameRegistry[gameId];
      if (!gameConfig) {
        throw new Error(`Game ${gameId} not found in registry`);
      }

      // Show loading UI
      this.uiManager.showLoading(`Loading ${gameConfig.name}...`);

      // Load game assets
      await this.assetManager.loadGameAssets(gameId);

      // Import game module dynamically
      const gameModule = await import(`../games/${gameConfig.class}.js`);
      const GameClass = gameModule[gameConfig.class];

      // Create game instance
      const gameInstance = new GameClass(this.assetManager, this.uiManager);

      this.gameInstances.set(gameId, gameInstance);
      this.currentGame = gameId;

      // Hide loading UI
      this.uiManager.hideLoading();

      return gameInstance;

    } catch (error) {
      console.error(`Failed to load game ${gameId}:`, error);
      this.uiManager.showError(`Failed to load ${gameId}: ${error.message}`);
      throw error;
    }
  }

  unloadGame(gameId) {
    const gameInstance = this.gameInstances.get(gameId);
    if (gameInstance && typeof gameInstance.destroy === 'function') {
      gameInstance.destroy();
    }
    this.gameInstances.delete(gameId);

    if (this.currentGame === gameId) {
      this.currentGame = null;
    }
  }

  getCurrentGame() {
    return this.currentGame ? this.gameInstances.get(this.currentGame) : null;
  }

  getAvailableGames() {
    return Object.keys(this.gameRegistry).map(id => ({
      id,
      ...this.gameRegistry[id]
    }));
  }

  getGamesByCategory(category) {
    return this.getAvailableGames().filter(game => game.category === category);
  }

  saveProgress(gameId, progressData) {
    try {
      const progressKey = `lalela_progress_${gameId}`;
      localStorage.setItem(progressKey, JSON.stringify({
        ...progressData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  loadProgress(gameId) {
    try {
      const progressKey = `lalela_progress_${gameId}`;
      const data = localStorage.getItem(progressKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  clearProgress(gameId) {
    try {
      const progressKey = `lalela_progress_${gameId}`;
      localStorage.removeItem(progressKey);
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }
}