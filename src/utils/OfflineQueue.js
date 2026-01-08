/**
 * OfflineQueue - IndexedDB-based queue for offline events
 * 
 * Stores game events and session data when offline,
 * then syncs when connection is restored.
 * 
 * @example
 * import { offlineQueue } from './utils/OfflineQueue.js';
 * 
 * // Queue an event when offline
 * await offlineQueue.enqueue({
 *   type: 'game_event',
 *   endpoint: '/api/sessions/123/events/',
 *   method: 'POST',
 *   data: { event_type: 'level_complete', score: 100 }
 * });
 * 
 * // Sync when back online
 * await offlineQueue.syncAll();
 */

const DB_NAME = 'lalela-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'pending-requests';

class OfflineQueue {
    constructor() {
        this.db = null;
        this.isOnline = navigator.onLine;
        this.isSyncing = false;
        this.syncCallbacks = [];
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Initialize IndexedDB
     * @returns {Promise<IDBDatabase>}
     */
    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('[OfflineQueue] Failed to open database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[OfflineQueue] Database initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object store for pending requests
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // Indexes for efficient querying
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('priority', 'priority', { unique: false });
                    store.createIndex('retryCount', 'retryCount', { unique: false });
                }
            };
        });
    }

    /**
     * Enqueue a request to be synced later
     * 
     * @param {Object} request - Request to queue
     * @param {string} request.type - Request type (session_start, session_end, game_event)
     * @param {string} request.endpoint - API endpoint
     * @param {string} request.method - HTTP method (POST, PATCH, PUT)
     * @param {Object} request.data - Request body
     * @param {number} [request.priority=5] - Priority (1-10, lower = higher priority)
     * @returns {Promise<number>} Request ID
     */
    async enqueue(request) {
        await this.init();

        const queuedRequest = {
            type: request.type || 'unknown',
            endpoint: request.endpoint,
            method: request.method || 'POST',
            data: request.data,
            priority: request.priority || 5,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: request.maxRetries || 3,
            headers: request.headers || {},
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const addRequest = store.add(queuedRequest);

            addRequest.onsuccess = () => {
                console.log('[OfflineQueue] Request queued:', queuedRequest.type);
                resolve(addRequest.result);
            };

            addRequest.onerror = () => {
                console.error('[OfflineQueue] Failed to queue request:', addRequest.error);
                reject(addRequest.error);
            };
        });
    }

    /**
     * Get all pending requests
     * @returns {Promise<Array>}
     */
    async getAll() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by priority (ascending) then timestamp (ascending)
                const sorted = request.result.sort((a, b) => {
                    if (a.priority !== b.priority) {
                        return a.priority - b.priority;
                    }
                    return a.timestamp - b.timestamp;
                });
                resolve(sorted);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get pending request count
     * @returns {Promise<number>}
     */
    async getCount() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove a request from the queue
     * @param {number} id - Request ID
     * @returns {Promise<void>}
     */
    async remove(id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update a request (e.g., increment retry count)
     * @param {number} id - Request ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<void>}
     */
    async update(id, updates) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (!item) {
                    reject(new Error('Request not found'));
                    return;
                }

                const updated = { ...item, ...updates };
                const putRequest = store.put(updated);

                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Clear all pending requests
     * @returns {Promise<void>}
     */
    async clear() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('[OfflineQueue] Queue cleared');
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Sync all pending requests
     * @returns {Promise<Object>} Sync results
     */
    async syncAll() {
        if (this.isSyncing) {
            console.log('[OfflineQueue] Sync already in progress');
            return { synced: 0, failed: 0, remaining: await this.getCount() };
        }

        if (!navigator.onLine) {
            console.log('[OfflineQueue] Cannot sync - offline');
            return { synced: 0, failed: 0, remaining: await this.getCount() };
        }

        this.isSyncing = true;
        const results = { synced: 0, failed: 0, remaining: 0 };

        try {
            const pending = await this.getAll();
            console.log(`[OfflineQueue] Syncing ${pending.length} pending requests`);

            for (const request of pending) {
                try {
                    await this.syncRequest(request);
                    await this.remove(request.id);
                    results.synced++;
                } catch (error) {
                    console.error('[OfflineQueue] Sync failed for request:', request.id, error);
                    
                    // Increment retry count
                    const newRetryCount = request.retryCount + 1;
                    
                    if (newRetryCount >= request.maxRetries) {
                        // Max retries reached, remove failed request
                        console.warn('[OfflineQueue] Max retries reached, removing:', request.id);
                        await this.remove(request.id);
                    } else {
                        await this.update(request.id, { retryCount: newRetryCount });
                    }
                    
                    results.failed++;
                }
            }

            results.remaining = await this.getCount();
            
            // Notify callbacks
            this.syncCallbacks.forEach(cb => cb(results));
            
            console.log('[OfflineQueue] Sync complete:', results);
        } finally {
            this.isSyncing = false;
        }

        return results;
    }

    /**
     * Sync a single request
     * @param {Object} request - Queued request
     * @returns {Promise<Response>}
     */
    async syncRequest(request) {
        const { endpoint, method, data, headers } = request;

        // Get auth token
        const token = localStorage.getItem('lalela_access_token');
        
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: data ? JSON.stringify(data) : undefined,
        };

        // Add auth header if token exists
        if (token) {
            fetchOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, fetchOptions);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    }

    /**
     * Handle coming online
     */
    handleOnline() {
        console.log('[OfflineQueue] Back online');
        this.isOnline = true;
        
        // Auto-sync after short delay
        setTimeout(() => {
            this.syncAll();
        }, 1000);
    }

    /**
     * Handle going offline
     */
    handleOffline() {
        console.log('[OfflineQueue] Gone offline');
        this.isOnline = false;
    }

    /**
     * Register a sync callback
     * @param {Function} callback - Called after sync with results
     */
    onSync(callback) {
        this.syncCallbacks.push(callback);
    }

    /**
     * Check if we're online
     * @returns {boolean}
     */
    get online() {
        return this.isOnline;
    }

    /**
     * Check if we're currently syncing
     * @returns {boolean}
     */
    get syncing() {
        return this.isSyncing;
    }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();
export { OfflineQueue };
