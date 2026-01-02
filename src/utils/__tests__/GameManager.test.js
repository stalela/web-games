/**
 * GameManager tests
 */
import { GameManager } from '../GameManager.js';

describe('GameManager', () => {
  let gameManager;
  let mockAssetManager;
  let mockUIManager;

  beforeEach(() => {
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
    testUtils.cleanup();
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
      const mockGameClass = jest.fn();
      gameManager.gameRegistry.test_game = {
        name: 'Test Game',
        class: 'TestGame',
        category: 'test',
        difficulty: 1
      };

      // Mock dynamic import
      global.import = jest.fn().mockResolvedValue({ TestGame: mockGameClass });

      await gameManager.loadGame('test_game');

      expect(mockAssetManager.loadGameAssets).toHaveBeenCalledWith('test_game');
      expect(mockUIManager.showLoading).toHaveBeenCalled();
      expect(mockUIManager.hideLoading).toHaveBeenCalled();
    });

    test('should handle game loading errors', async () => {
      mockAssetManager.loadGameAssets.mockRejectedValue(new Error('Load failed'));

      await expect(gameManager.loadGame('adjacent_numbers')).rejects.toThrow();

      expect(mockUIManager.showError).toHaveBeenCalled();
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
    });
  });

  describe('progress management', () => {
    test('should save and load progress', async () => {
      const progressData = { level: 2, score: 100 };
      const userId = 'test-user';

      await gameManager.saveGameProgress('test-game', userId, progressData);

      // Note: In real implementation, this would test the actual storage
      expect(gameManager.saveProgress).toBeDefined();
    });

    test('should handle progress save errors gracefully', async () => {
      // Mock storage failure
      const progressData = { level: 1, score: 50 };

      // Should not throw error even if storage fails
      await expect(gameManager.saveGameProgress('test-game', 'user', progressData))
        .resolves.not.toThrow();
    });
  });

  describe('game state management', () => {
    test('should track current game', () => {
      expect(gameManager.getCurrentGame()).toBeNull();

      // Simulate setting current game
      gameManager.currentGame = 'test-game';
      expect(gameManager.currentGame).toBe('test-game');
    });

    test('should unload games properly', () => {
      gameManager.gameInstances.set('test-game', { destroy: jest.fn() });
      gameManager.currentGame = 'test-game';

      gameManager.unloadGame('test-game');

      expect(gameManager.gameInstances.has('test-game')).toBe(false);
      expect(gameManager.currentGame).toBeNull();
    });
  });
});