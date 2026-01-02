/**
 * OfflineStorage - Handles IndexedDB for local game progress and data
 * Provides offline-first functionality with background sync
 */
export class OfflineStorage {
  constructor(dbName = 'LalelaGames', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.isInitialized = false;
    this.initPromise = this.initializeDB();
  }

  /**
   * Initialize IndexedDB database
   */
  async initializeDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB initialization failed');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('gameProgress')) {
          const progressStore = db.createObjectStore('gameProgress', { keyPath: 'id' });
          progressStore.createIndex('gameId', 'gameId', { unique: false });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        if (!db.objectStoreNames.contains('gameData')) {
          const gameStore = db.createObjectStore('gameData', { keyPath: 'id' });
          gameStore.createIndex('gameId', 'gameId', { unique: true });
          gameStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('assets')) {
          const assetStore = db.createObjectStore('assets', { keyPath: 'url' });
          assetStore.createIndex('type', 'type', { unique: false });
          assetStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  /**
   * Wait for DB initialization
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initPromise;
    }
  }

  /**
   * Generic database operation
   */
  async performTransaction(storeName, mode, operation) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      try {
        resolve(operation(store));
      } catch (error) {
        reject(error);
      }
    });
  }

  // ===== GAME PROGRESS METHODS =====

  /**
   * Save game progress
   */
  async saveGameProgress(gameId, userId, progressData) {
    const progressEntry = {
      id: `${userId}_${gameId}`,
      gameId,
      userId,
      progressData,
      lastModified: Date.now(),
      version: 1
    };

    await this.performTransaction('gameProgress', 'readwrite', (store) => {
      store.put(progressEntry);
    });

    // Add to sync queue for server update
    await this.addToSyncQueue('progress', {
      gameId,
      userId,
      progressData,
      action: 'update'
    });

    return progressEntry;
  }

  /**
   * Load game progress
   */
  async loadGameProgress(gameId, userId) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameProgress'], 'readonly');
      const store = transaction.objectStore('gameProgress');
      const request = store.get(`${userId}_${gameId}`);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all game progress for a user
   */
  async getAllUserProgress(userId) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameProgress'], 'readonly');
      const store = transaction.objectStore('gameProgress');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete game progress
   */
  async deleteGameProgress(gameId, userId) {
    await this.performTransaction('gameProgress', 'readwrite', (store) => {
      store.delete(`${userId}_${gameId}`);
    });

    // Add to sync queue for server update
    await this.addToSyncQueue('progress', {
      gameId,
      userId,
      action: 'delete'
    });
  }

  // ===== GAME DATA METHODS =====

  /**
   * Cache game data locally
   */
  async cacheGameData(gameId, gameData) {
    const dataEntry = {
      id: gameId,
      gameData,
      lastModified: Date.now(),
      version: 1
    };

    await this.performTransaction('gameData', 'readwrite', (store) => {
      store.put(dataEntry);
    });

    return dataEntry;
  }

  /**
   * Load cached game data
   */
  async loadCachedGameData(gameId) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameData'], 'readonly');
      const store = transaction.objectStore('gameData');
      const request = store.get(gameId);

      request.onsuccess = () => {
        resolve(request.result ? request.result.gameData : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if game data is cached and fresh
   */
  async isGameDataFresh(gameId, maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameData'], 'readonly');
      const store = transaction.objectStore('gameData');
      const request = store.get(gameId);

      request.onsuccess = () => {
        if (!request.result) {
          resolve(false);
          return;
        }

        const age = Date.now() - request.result.lastModified;
        resolve(age < maxAge);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ===== USER SETTINGS METHODS =====

  /**
   * Save user setting
   */
  async saveUserSetting(key, value) {
    const settingEntry = {
      key,
      value,
      lastModified: Date.now()
    };

    await this.performTransaction('userSettings', 'readwrite', (store) => {
      store.put(settingEntry);
    });

    return settingEntry;
  }

  /**
   * Load user setting
   */
  async loadUserSetting(key, defaultValue = null) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : defaultValue);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all user settings
   */
  async getAllUserSettings() {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      const request = store.getAll();

      request.onsuccess = () => {
        const settings = {};
        request.result.forEach(setting => {
          settings[setting.key] = setting.value;
        });
        resolve(settings);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ===== ASSET CACHING METHODS =====

  /**
   * Cache asset data
   */
  async cacheAsset(url, data, type = 'unknown') {
    const assetEntry = {
      url,
      data,
      type,
      lastAccessed: Date.now(),
      cachedAt: Date.now(),
      size: this.getDataSize(data)
    };

    await this.performTransaction('assets', 'readwrite', (store) => {
      store.put(assetEntry);
    });

    return assetEntry;
  }

  /**
   * Load cached asset
   */
  async loadCachedAsset(url) {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      const request = store.get(url);

      request.onsuccess = () => {
        if (request.result) {
          // Update last accessed time
          this.updateAssetAccessTime(url);
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update asset last accessed time
   */
  async updateAssetAccessTime(url) {
    await this.performTransaction('assets', 'readwrite', (store) => {
      const request = store.get(url);
      request.onsuccess = () => {
        if (request.result) {
          request.result.lastAccessed = Date.now();
          store.put(request.result);
        }
      };
    });
  }

  /**
   * Clean old cached assets
   */
  async cleanOldAssets(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const cutoffTime = Date.now() - maxAge;

    await this.performTransaction('assets', 'readwrite', (store) => {
      const index = store.index('lastAccessed');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    });
  }

  /**
   * Get data size helper
   */
  getDataSize(data) {
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    if (typeof data === 'string') {
      return data.length * 2; // Approximate for UTF-16
    }
    if (data instanceof Blob) {
      return data.size;
    }
    // For other types, estimate
    return JSON.stringify(data).length * 2;
  }

  // ===== SYNC QUEUE METHODS =====

  /**
   * Add operation to sync queue
   */
  async addToSyncQueue(type, data) {
    const queueEntry = {
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    await this.performTransaction('syncQueue', 'readwrite', (store) => {
      store.add(queueEntry);
    });

    return queueEntry;
  }

  /**
   * Get pending sync operations
   */
  async getPendingSyncOperations() {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result.filter(op => op.status === 'pending'));
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark sync operation as completed
   */
  async markSyncOperationCompleted(operationId) {
    await this.performTransaction('syncQueue', 'readwrite', (store) => {
      const request = store.get(operationId);
      request.onsuccess = () => {
        if (request.result) {
          request.result.status = 'completed';
          store.put(request.result);
        }
      };
    });
  }

  /**
   * Clean completed sync operations
   */
  async cleanCompletedSyncOperations(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoffTime = Date.now() - maxAge;

    await this.performTransaction('syncQueue', 'readwrite', (store) => {
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.status === 'completed') {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    });
  }

  // ===== UTILITY METHODS =====

  /**
   * Clear all data
   */
  async clearAllData() {
    const storeNames = ['gameProgress', 'gameData', 'userSettings', 'assets', 'syncQueue'];

    for (const storeName of storeNames) {
      await this.performTransaction(storeName, 'readwrite', (store) => {
        store.clear();
      });
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    await this.ensureInitialized();

    const stats = {
      gameProgress: 0,
      gameData: 0,
      userSettings: 0,
      assets: 0,
      syncQueue: 0,
      totalSize: 0
    };

    const storeNames = Object.keys(stats);

    for (const storeName of storeNames) {
      if (storeName === 'totalSize') continue;

      const count = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      stats[storeName] = count;
    }

    // Estimate total size (rough approximation)
    stats.totalSize = await this.estimateStorageSize();

    return stats;
  }

  /**
   * Estimate total storage size
   */
  async estimateStorageSize() {
    // This is a rough estimation
    let totalSize = 0;

    await this.performTransaction('assets', 'readonly', (store) => {
      const request = store.getAll();

      request.onsuccess = () => {
        request.result.forEach(asset => {
          totalSize += asset.size || 0;
        });
      };
    });

    // Add estimated size for other data
    const otherData = await this.getAllUserSettings();
    totalSize += JSON.stringify(otherData).length * 2;

    return totalSize;
  }

  /**
   * Check if IndexedDB is supported
   */
  static isSupported() {
    return typeof window !== 'undefined' &&
           'indexedDB' in window &&
           !!window.indexedDB;
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}