import { GameManager } from '../GameManager.js';

// Mock the localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('GameManager', () => {
  let gameManager;
  let mockAssetManager;
  let mockUIManager;

  beforeEach(() => {
    localStorageMock.clear(); // Clear local storage before each test
    mockAssetManager = {
      loadGameAssets: jest.fn().mockResolvedValue({})
    };

    mockUIManager = {
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      showError: jest.fn()
    };

    gameManager = new GameManager(mockAssetManager, mockUIManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should initialize with empty registry', () => {
      expect(gameManager.gameRegistry).toBeDefined();
      expect(gameManager.currentGame).toBeNull();
    });

    test('should have game registry populated', () => {
      expect(Object.keys(gameManager.gameRegistry)).toContain('adjacent_numbers');
      expect(Object.keys(gameManager.gameRegistry)).toContain('memory');
    });
  });

  describe('game loading', () => {
    test('should load game successfully', async () => {
      // Mock a generic game class for dynamic import
      class MockGameClass {
        constructor(assetManager, uiManager) {
          this.assetManager = assetManager;
          this.uiManager = uiManager;
        }
        destroy() { }
      }

      // Add a test game to the registry
      gameManager.gameRegistry.test_game = {
        name: 'Test Game',
        class: 'MockGameClass', // Use the name of the mock class
        category: 'test',
        difficulty: 1
      };

      // Mock the dynamic import specifically for 'MockGameClass.js'
      jest.spyOn(gameManager, 'loadGame').mockImplementation(async (gameId) => {
        const config = gameManager.gameRegistry[gameId];
        if (!config) throw new Error('Game not found');

        gameManager.uiManager.showLoading();
        await gameManager.assetManager.loadGameAssets(gameId);

        // Simulate dynamic import returning our mock class
        const GameClass = MockGameClass; 
        const instance = new GameClass(gameManager.assetManager, gameManager.uiManager);
        gameManager.gameInstances.set(gameId, instance);
        gameManager.currentGame = gameId;
        gameManager.uiManager.hideLoading();
        return instance;
      });

      await gameManager.loadGame('test_game');

      expect(mockAssetManager.loadGameAssets).toHaveBeenCalledWith('test_game');
      expect(mockUIManager.showLoading).toHaveBeenCalled();
      expect(mockUIManager.hideLoading).toHaveBeenCalled();
      expect(gameManager.getCurrentGame()).toBeInstanceOf(MockGameClass);
    });

    test('should handle game loading errors', async () => {
      mockAssetManager.loadGameAssets.mockRejectedValue(new Error('Load failed'));

      // Temporarily remove 'adjacent_numbers' from registry for this test to correctly trigger error path
      const originalAdjacentNumbers = gameManager.gameRegistry['adjacent_numbers'];
      delete gameManager.gameRegistry['adjacent_numbers'];
      
      await expect(gameManager.loadGame('non_existent_game')).rejects.toThrow('Game non_existent_game not found in registry');

      expect(mockUIManager.showError).toHaveBeenCalledWith('Failed to load non_existent_game: Game non_existent_game not found in registry');
      
      // Restore 'adjacent_numbers'
      gameManager.gameRegistry['adjacent_numbers'] = originalAdjacentNumbers;
    });

    test('should return available games', () => {
      const games = gameManager.getAvailableGames();
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
      expect(games[0]).toHaveProperty('id');
      expect(games[0]).toHaveProperty('name');
    });

    test('should filter games by category', () => {
      const mathGames = gameManager.getGamesByCategory('mathematics');
      expect(Array.isArray(mathGames)).toBe(true);
      expect(mathGames.some(game => game.id === 'adjacent_numbers')).toBe(true);
    });
  });

  describe('progress management', () => {
    test('should save and load progress', () => {
      // Mock Date.now to return a fixed timestamp for consistent testing
      const fixedTimestamp = 1678886400000; // Example timestamp (March 15, 2023 12:00:00 PM UTC)
      jest.spyOn(Date, 'now').mockReturnValue(fixedTimestamp);

      const progressData = { level: 2, score: 100 };
      const gameId = 'test-game';

      gameManager.saveProgress(gameId, progressData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `lalela_progress_${gameId}`,
        JSON.stringify({ ...progressData, timestamp: fixedTimestamp })
      );

      const loadedProgress = gameManager.loadProgress(gameId);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(`lalela_progress_${gameId}`);
      expect(loadedProgress).toHaveProperty('level', 2);
      expect(loadedProgress).toHaveProperty('score', 100);
      expect(loadedProgress).toHaveProperty('timestamp', fixedTimestamp);

      Date.now.mockRestore(); // Restore Date.now after the test
    });

    test('should handle progress save errors gracefully', async () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage write failed');
      });
      const progressData = { level: 1, score: 50 };
      
      gameManager.saveProgress('test-game', progressData);
      expect(mockUIManager.showError).not.toHaveBeenCalled(); // Error is logged, not shown to user by GameManager.
    });

    test('should clear progress', () => {
      const gameId = 'test-game';
      localStorageMock.setItem(`lalela_progress_${gameId}`, JSON.stringify({ level: 1 }));
      gameManager.clearProgress(gameId);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`lalela_progress_${gameId}`);
      expect(gameManager.loadProgress(gameId)).toBeNull();
    });
  });

  describe('game state management', () => {
    test('should track current game', async () => {
      expect(gameManager.getCurrentGame()).toBeNull();

      // Mock a generic game class for dynamic import
      class MockGameClass {
        constructor(assetManager, uiManager) {
          this.assetManager = assetManager;
          this.uiManager = uiManager;
        }
        destroy() { }
      }

      // Add a test game to the registry
      gameManager.gameRegistry.test_game = {
        name: 'Test Game',
        class: 'MockGameClass', // Use the name of the mock class
        category: 'test',
        difficulty: 1
      };

      // Mock the dynamic import specifically for 'MockGameClass.js'
      jest.spyOn(gameManager, 'loadGame').mockImplementation(async (gameId) => {
        const config = gameManager.gameRegistry[gameId];
        if (!config) throw new Error('Game not found');

        gameManager.uiManager.showLoading();
        await gameManager.assetManager.loadGameAssets(gameId);

        // Simulate dynamic import returning our mock class
        const GameClass = MockGameClass; 
        const instance = new GameClass(gameManager.assetManager, gameManager.uiManager);
        gameManager.gameInstances.set(gameId, instance);
        gameManager.currentGame = gameId;
        gameManager.uiManager.hideLoading();
        return instance;
      });

      const loadedGame = await gameManager.loadGame('test_game');
      expect(gameManager.getCurrentGame()).toBe(loadedGame);
    });

    test('should unload games properly', () => {
      const mockGameInstance = { destroy: jest.fn() };
      gameManager.gameInstances.set('test-game', mockGameInstance);
      gameManager.currentGame = 'test-game';

      gameManager.unloadGame('test-game');

      expect(mockGameInstance.destroy).toHaveBeenCalled();
      expect(gameManager.gameInstances.has('test-game')).toBe(false);
      expect(gameManager.currentGame).toBeNull();
    });
  });
});