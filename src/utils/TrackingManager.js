/**
 * TrackingManager - Handles game session tracking and event logging
 * 
 * Communicates with the Django API to track:
 * - Game sessions (start, update, end)
 * - Individual events (level_start, correct_answer, etc.)
 * 
 * Features:
 * - Event queuing with batch submission
 * - Automatic flush on threshold or timeout
 * - Offline-resilient with IndexedDB queue
 * - Singleton pattern for global access
 */

import { authManager } from './AuthManager.js';
import { offlineQueue } from './OfflineQueue.js';

class TrackingManagerClass {
  constructor() {
    this.currentSessionId = null;
    this.currentGameSlug = null;
    this.eventQueue = [];
    this.flushThreshold = 10;      // Flush after 10 events
    this.flushIntervalMs = 30000;  // Flush every 30 seconds
    this.flushTimer = null;
    this.isOnline = navigator.onLine;
    this.pendingEvents = [];       // Events stored when offline
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.handleUnload());
  }

  /**
   * Get the API base URL based on environment
   */
  getApiBaseUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return window.location.origin;
  }

  /**
   * Start a new game session
   * @param {string} gameSlug - The game's unique identifier (e.g., 'adjacent_numbers')
   * @param {number} level - Starting level (default 1)
   * @returns {Promise<string|null>} Session ID or null if failed
   */
  async startSession(gameSlug, level = 1) {
    const childId = authManager.getChildId();
    
    // If not authenticated, skip tracking
    if (!childId) {
      console.log('TrackingManager: No child authenticated, skipping session tracking');
      return null;
    }

    try {
      const response = await fetch(`${this.getApiBaseUrl()}/api/sessions/start/`, {
        method: 'POST',
        headers: {
          ...authManager.getAuthHeaders(),
          'Content-Type': 'application/json',
          'X-Child-Id': childId
        },
        body: JSON.stringify({
          game_slug: gameSlug,
          level: level,
          device_type: this.getDeviceType(),
          user_agent: navigator.userAgent
        })
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.warn('TrackingManager: Failed to start session', response.status, responseText);
        return null;
      }
      
      const data = await response.json();
      this.currentSessionId = data.session_id;
      this.currentGameSlug = gameSlug;
      
      // Start flush timer
      this.startFlushTimer();
      
      console.log(`TrackingManager: Session started ${this.currentSessionId}`);
      return this.currentSessionId;

    } catch (error) {
      console.warn('TrackingManager: Error starting session', error.message);
      return null;
    }
  }

  /**
   * Track an event within the current session
   * @param {string} eventType - Event type (level_start, correct_answer, etc.)
   * @param {object} eventData - Additional event data
   * @param {number} level - Current level (optional)
   */
  trackEvent(eventType, eventData = {}, level = null) {
    if (!this.currentSessionId) {
      console.log('TrackingManager: No active session, event not tracked');
      return;
    }

    const event = {
      event_type: eventType,
      level: level,
      event_data: eventData,
      timestamp: new Date().toISOString()
    };

    this.eventQueue.push(event);
    console.log(`TrackingManager: Queued event ${eventType} (${this.eventQueue.length} in queue)`);

    // Flush if threshold reached
    if (this.eventQueue.length >= this.flushThreshold) {
      this.flushEventQueue();
    }
  }

  /**
   * Update session progress (score, level)
   * @param {object} progress - {score, level_reached, completed}
   */
  async updateSession(progress) {
    if (!this.currentSessionId) {
      return;
    }

    try {
      const response = await fetch(
        `${this.getApiBaseUrl()}/api/sessions/${this.currentSessionId}/`,
        {
          method: 'PATCH',
          headers: {
            ...authManager.getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(progress)
        }
      );

      if (!response.ok) {
        console.warn('TrackingManager: Failed to update session', response.status);
      }
    } catch (error) {
      console.warn('TrackingManager: Error updating session', error.message);
    }
  }

  /**
   * End the current session
   * @param {number} score - Final score
   * @param {number} levelReached - Highest level reached
   * @param {boolean} completed - Whether game was completed
   */
  async endSession(score = 0, levelReached = 1, completed = false) {
    // Flush remaining events first
    await this.flushEventQueue();
    
    // Stop flush timer
    this.stopFlushTimer();

    if (!this.currentSessionId) {
      return;
    }

    try {
      const response = await fetch(
        `${this.getApiBaseUrl()}/api/sessions/${this.currentSessionId}/end/`,
        {
          method: 'POST',
          headers: {
            ...authManager.getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            score: score,
            level_reached: levelReached,
            completed: completed
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`TrackingManager: Session ended (${data.duration_seconds}s, score: ${data.score})`);
      } else {
        console.warn('TrackingManager: Failed to end session', response.status);
      }
    } catch (error) {
      console.warn('TrackingManager: Error ending session', error.message);
    } finally {
      this.currentSessionId = null;
      this.currentGameSlug = null;
    }
  }

  /**
   * Flush queued events to the server
   */
  async flushEventQueue() {
    if (this.eventQueue.length === 0 || !this.currentSessionId) {
      return;
    }

    // If offline, store events locally
    if (!this.isOnline) {
      this.storeEventsLocally();
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(
        `${this.getApiBaseUrl()}/api/sessions/${this.currentSessionId}/events/`,
        {
          method: 'POST',
          headers: {
            ...authManager.getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ events: eventsToSend })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`TrackingManager: Flushed ${data.created} events`);
      } else {
        // Re-queue events on failure
        console.warn('TrackingManager: Failed to flush events, re-queuing');
        this.eventQueue = [...eventsToSend, ...this.eventQueue];
      }
    } catch (error) {
      console.warn('TrackingManager: Error flushing events', error.message);
      // Re-queue events on error
      this.eventQueue = [...eventsToSend, ...this.eventQueue];
    }
  }

  /**
   * Start the automatic flush timer
   */
  startFlushTimer() {
    this.stopFlushTimer();
    this.flushTimer = setInterval(() => {
      this.flushEventQueue();
    }, this.flushIntervalMs);
  }

  /**
   * Stop the automatic flush timer
   */
  stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Store events in IndexedDB when offline
   */
  async storeEventsLocally() {
    if (this.eventQueue.length === 0 || !this.currentSessionId) return;

    try {
      await offlineQueue.enqueue({
        type: 'game_events',
        endpoint: `${this.getApiBaseUrl()}/api/sessions/${this.currentSessionId}/events/`,
        method: 'POST',
        data: { events: this.eventQueue },
        priority: 5
      });
      console.log(`TrackingManager: Queued ${this.eventQueue.length} events offline`);
      this.eventQueue = [];
    } catch (error) {
      console.warn('TrackingManager: Failed to queue events offline', error);
      // Keep events in memory queue as fallback
    }
  }

  /**
   * Handle coming online - sync via OfflineQueue
   */
  async handleOnline() {
    this.isOnline = true;
    console.log('TrackingManager: Back online');
    
    // OfflineQueue handles sync automatically on 'online' event
    // But we can trigger a manual sync for immediate results
    const results = await offlineQueue.syncAll();
    console.log(`TrackingManager: Synced ${results.synced} queued requests`);
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    this.isOnline = false;
    console.log('TrackingManager: Offline mode');
  }

  /**
   * Handle page unload - queue events for later sync
   */
  handleUnload() {
    if (this.eventQueue.length > 0 && this.currentSessionId) {
      // Queue events via OfflineQueue (will sync on next load)
      this.storeEventsLocally();
    }
  }

  /**
   * Detect device type
   */
  getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    return this.currentSessionId;
  }

  /**
   * Check if a session is active
   */
  hasActiveSession() {
    return this.currentSessionId !== null;
  }
}

// Singleton instance
export const trackingManager = new TrackingManagerClass();
