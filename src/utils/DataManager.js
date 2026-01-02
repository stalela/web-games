/**
 * DataManager - Unified data access layer with offline-first functionality
 * Coordinates between API, local storage, and caching
 */
export class DataManager {
  constructor() {
    this.apiClient = null;
    this.offlineStorage = null;
    this.cache = new Map();
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;

    this.initializeServices();
    this.setupNetworkListeners();
  }

  /**
   * Initialize API client and offline storage
   */
  async initializeServices() {
    // Initialize offline storage
    if (OfflineStorage.isSupported()) {
      this.offlineStorage = new OfflineStorage();
      await this.offlineStorage.ensureInitialized();
    } else {
      console.warn('IndexedDB not supported, offline functionality limited');
    }

    // Initialize API client
    this.apiClient = new APIClient();

    // Process any pending offline operations
    if (this.isOnline) {
      this.processOfflineQueue();
    }
  }

  /**
   * Setup network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onNetworkReconnected();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onNetworkDisconnected();
    });
  }

  /**
   * Handle network reconnection
   */
  async onNetworkReconnected() {
    console.log('Network reconnected, syncing data...');

    // Process offline queue
    await this.processOfflineQueue();

    // Sync user progress
    await this.syncUserProgress();

    // Refresh cached data
    await this.refreshCache();
  }

  /**
   * Handle network disconnection
   */
  onNetworkDisconnected() {
    console.log('Network disconnected, switching to offline mode');
  }

  // ===== AUTHENTICATION METHODS =====

  async login(credentials) {
    try {
      const response = await this.apiClient.login(credentials.username, credentials.password);
      return response;
    } catch (error) {
      if (!this.isOnline) {
        throw new Error('Cannot login while offline');
      }
      throw error;
    }
  }

  async logout() {
    try {
      await this.apiClient.logout();
    } catch (error) {
      console.warn('Logout failed:', error);
    }
  }

  isAuthenticated() {
    return this.apiClient.isAuthenticated();
  }

  // ===== GAME DATA METHODS =====

  /**
   * Get games list with offline fallback
   */
  async getGames(filters = {}) {
    const cacheKey = `games_${JSON.stringify(filters)}`;

    // Try cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Try API first
      const games = await this.apiClient.getGames(filters);

      // Cache successful response
      this.cache.set(cacheKey, games);

      // Also cache in offline storage
      if (this.offlineStorage) {
        await this.offlineStorage.cacheGameData('games_list', games);
      }

      return games;

    } catch (error) {
      // Fallback to offline storage
      if (this.offlineStorage) {
        const cachedGames = await this.offlineStorage.loadCachedGameData('games_list');
        if (cachedGames) {
          console.log('Using cached games list (offline mode)');
          return cachedGames;
        }
      }

      throw error;
    }
  }

  /**
   * Get specific game data with offline caching
   */
  async getGame(gameId) {
    const cacheKey = `game_${gameId}`;

    // Try cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Check if we have fresh cached data
      if (this.offlineStorage) {
        const isFresh = await this.offlineStorage.isGameDataFresh(gameId);
        if (isFresh) {
          const cachedData = await this.offlineStorage.loadCachedGameData(gameId);
          if (cachedData) {
            this.cache.set(cacheKey, cachedData);
            return cachedData;
          }
        }
      }

      // Fetch from API
      const gameData = await this.apiClient.getGame(gameId);

      // Cache the result
      this.cache.set(cacheKey, gameData);
      if (this.offlineStorage) {
        await this.offlineStorage.cacheGameData(gameId, gameData);
      }

      return gameData;

    } catch (error) {
      // Try offline fallback
      if (this.offlineStorage) {
        const cachedData = await this.offlineStorage.loadCachedGameData(gameId);
        if (cachedData) {
          console.log(`Using cached game data for ${gameId} (offline mode)`);
          return cachedData;
        }
      }

      throw error;
    }
  }

  /**
   * Get game levels with offline support
   */
  async getGameLevels(gameId) {
    const cacheKey = `levels_${gameId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const levels = await this.apiClient.getGameLevels(gameId);
      this.cache.set(cacheKey, levels);
      return levels;
    } catch (error) {
      // For now, return empty array if offline
      console.warn(`Failed to load levels for game ${gameId}:`, error);
      return [];
    }
  }

  // ===== PROGRESS MANAGEMENT =====

  /**
   * Get user progress for a game
   */
  async getGameProgress(gameId, userId) {
    try {
      // Try API first if online
      if (this.isOnline) {
        const progress = await this.apiClient.getUserProgress(gameId);
        return progress;
      }
    } catch (error) {
      console.warn('Failed to fetch progress from server:', error);
    }

    // Fallback to local storage
    if (this.offlineStorage) {
      const localProgress = await this.offlineStorage.loadGameProgress(gameId, userId);
      return localProgress ? localProgress.progressData : null;
    }

    return null;
  }

  /**
   * Save game progress
   */
  async saveGameProgress(gameId, userId, progressData) {
    // Always save locally first
    if (this.offlineStorage) {
      await this.offlineStorage.saveGameProgress(gameId, userId, progressData);
    }

    // Try to sync with server if online
    if (this.isOnline) {
      try {
        await this.apiClient.saveProgress(gameId, progressData);
      } catch (error) {
        console.warn('Failed to sync progress to server:', error);
        // Progress is still saved locally, will sync when online
      }
    }
  }

  /**
   * Get all user progress
   */
  async getAllUserProgress(userId) {
    let serverProgress = {};
    let localProgress = {};

    // Get server progress if online
    if (this.isOnline) {
      try {
        serverProgress = await this.apiClient.getUserProgress();
      } catch (error) {
        console.warn('Failed to fetch server progress:', error);
      }
    }

    // Get local progress
    if (this.offlineStorage) {
      const localData = await this.offlineStorage.getAllUserProgress(userId);
      localData.forEach(item => {
        localProgress[item.gameId] = item.progressData;
      });
    }

    // Merge with server data taking precedence
    return { ...localProgress, ...serverProgress };
  }

  // ===== SETTINGS MANAGEMENT =====

  /**
   * Get user settings
   */
  async getUserSettings() {
    try {
      if (this.isOnline) {
        const settings = await this.apiClient.getUserSettings();
        // Cache locally
        if (this.offlineStorage) {
          for (const [key, value] of Object.entries(settings)) {
            await this.offlineStorage.saveUserSetting(key, value);
          }
        }
        return settings;
      }
    } catch (error) {
      console.warn('Failed to fetch settings from server:', error);
    }

    // Fallback to local settings
    if (this.offlineStorage) {
      return await this.offlineStorage.getAllUserSettings();
    }

    return {};
  }

  /**
   * Save user setting
   */
  async saveUserSetting(key, value) {
    // Save locally
    if (this.offlineStorage) {
      await this.offlineStorage.saveUserSetting(key, value);
    }

    // Sync with server if online
    if (this.isOnline) {
      try {
        const allSettings = await this.offlineStorage.getAllUserSettings();
        allSettings[key] = value;
        await this.apiClient.updateUserSettings(allSettings);
      } catch (error) {
        console.warn('Failed to sync settings to server:', error);
      }
    }
  }

  // ===== OFFLINE SYNC METHODS =====

  /**
   * Process offline queue when coming back online
   */
  async processOfflineQueue() {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;

    try {
      // Process API client's offline queue
      await this.apiClient.processOfflineQueue();

      // Process local sync queue
      if (this.offlineStorage) {
        const pendingOperations = await this.offlineStorage.getPendingSyncOperations();

        for (const operation of pendingOperations) {
          try {
            switch (operation.type) {
              case 'progress':
                await this.apiClient.saveProgress(
                  operation.data.gameId,
                  operation.data.progressData
                );
                break;

              case 'settings':
                await this.apiClient.updateUserSettings(operation.data);
                break;
            }

            await this.offlineStorage.markSyncOperationCompleted(operation.id);
          } catch (error) {
            console.warn('Failed to sync operation:', operation, error);
          }
        }
      }

      console.log('Offline sync completed');
    } catch (error) {
      console.error('Offline sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync user progress with server
   */
  async syncUserProgress() {
    if (!this.isOnline || !this.offlineStorage) return;

    try {
      const userId = 'current_user'; // TODO: Get from auth system
      const localProgress = await this.offlineStorage.getAllUserProgress(userId);

      for (const progress of localProgress) {
        try {
          await this.apiClient.saveProgress(progress.gameId, progress.progressData);
        } catch (error) {
          console.warn(`Failed to sync progress for game ${progress.gameId}:`, error);
        }
      }

      console.log('Progress sync completed');
    } catch (error) {
      console.error('Progress sync failed:', error);
    }
  }

  /**
   * Refresh cached data
   */
  async refreshCache() {
    // Clear memory cache
    this.cache.clear();

    // Refresh game data cache
    try {
      const games = await this.apiClient.getGames();
      this.cache.set('games_list', games);

      if (this.offlineStorage) {
        await this.offlineStorage.cacheGameData('games_list', games);
      }
    } catch (error) {
      console.warn('Failed to refresh games cache:', error);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Check if data is fresh in cache
   */
  isDataFresh(cacheKey, maxAge = 5 * 60 * 1000) { // 5 minutes default
    // Implementation would check cache timestamps
    return true; // Placeholder
  }

  /**
   * Clear all cached data
   */
  async clearCache() {
    this.cache.clear();

    if (this.offlineStorage) {
      await this.offlineStorage.clearAllData();
    }

    if (this.apiClient) {
      this.apiClient.clearAuthTokens();
    }
  }

  /**
   * Get data manager statistics
   */
  async getStats() {
    const stats = {
      isOnline: this.isOnline,
      cacheSize: this.cache.size,
      syncInProgress: this.syncInProgress,
      authenticated: this.isAuthenticated()
    };

    if (this.offlineStorage) {
      stats.storageStats = await this.offlineStorage.getStorageStats();
    }

    return stats;
  }

  /**
   * Health check
   */
  async healthCheck() {
    const results = {
      api: false,
      storage: false,
      cache: true
    };

    // Check API
    if (this.apiClient) {
      results.api = await this.apiClient.healthCheck();
    }

    // Check storage
    if (this.offlineStorage) {
      try {
        await this.offlineStorage.ensureInitialized();
        results.storage = true;
      } catch (error) {
        results.storage = false;
      }
    }

    return results;
  }
}

// Import dependencies (would be at top of file in real implementation)
import { APIClient } from './APIClient.js';
import { OfflineStorage } from './OfflineStorage.js';