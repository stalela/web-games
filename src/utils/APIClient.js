/**
 * APIClient - Handles communication with the Django backend
 * Manages authentication, game data, and user progress
 */
export class APIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.authToken = null;
    this.refreshToken = null;
    this.requestQueue = [];
    this.isRefreshing = false;

    this.loadAuthTokens();
    this.setupInterceptors();
  }

  /**
   * Load authentication tokens from localStorage
   */
  loadAuthTokens() {
    try {
      const auth = JSON.parse(localStorage.getItem('lalela_auth') || '{}');
      this.authToken = auth.access;
      this.refreshToken = auth.refresh;
    } catch (error) {
      console.warn('Failed to load auth tokens:', error);
      this.clearAuthTokens();
    }
  }

  /**
   * Save authentication tokens to localStorage
   */
  saveAuthTokens(accessToken, refreshToken) {
    this.authToken = accessToken;
    this.refreshToken = refreshToken;

    try {
      localStorage.setItem('lalela_auth', JSON.stringify({
        access: accessToken,
        refresh: refreshToken,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save auth tokens:', error);
    }
  }

  /**
   * Clear authentication tokens
   */
  clearAuthTokens() {
    this.authToken = null;
    this.refreshToken = null;
    localStorage.removeItem('lalela_auth');
  }

  /**
   * Setup request/response interceptors
   */
  setupInterceptors() {
    // Store original fetch for fallback
    this.originalFetch = window.fetch;

    // Override fetch with interceptor
    window.fetch = this.interceptedFetch.bind(this);
  }

  /**
   * Intercepted fetch with automatic auth handling
   */
  async interceptedFetch(url, options = {}) {
    // Clone options to avoid modifying original
    const requestOptions = { ...options };

    // Add auth headers if we have a token
    if (this.authToken) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Bearer ${this.authToken}`
      };
    }

    // Add default headers
    requestOptions.headers = {
      'Content-Type': 'application/json',
      ...requestOptions.headers
    };

    try {
      const response = await this.originalFetch(url, requestOptions);

      // Handle 401 (unauthorized) - try to refresh token
      if (response.status === 401 && this.refreshToken) {
        return this.handleTokenRefresh(url, requestOptions);
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Handle token refresh on 401 responses
   */
  async handleTokenRefresh(originalUrl, originalOptions) {
    if (this.isRefreshing) {
      // Wait for ongoing refresh
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ originalUrl, originalOptions, resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshResponse = await this.originalFetch('/api/auth/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken })
      });

      if (refreshResponse.ok) {
        const tokenData = await refreshResponse.json();
        this.saveAuthTokens(tokenData.access, tokenData.refresh);

        // Retry original request with new token
        const retryResponse = await this.interceptedFetch(originalUrl, originalOptions);

        // Process queued requests
        this.processRequestQueue();

        return retryResponse;
      } else {
        // Refresh failed, clear tokens and redirect to login
        this.clearAuthTokens();
        this.redirectToLogin();
        throw new Error('Authentication failed');
      }
    } catch (error) {
      this.clearAuthTokens();
      this.redirectToLogin();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  processRequestQueue() {
    while (this.requestQueue.length > 0) {
      const { originalUrl, originalOptions, resolve, reject } = this.requestQueue.shift();

      this.interceptedFetch(originalUrl, originalOptions)
        .then(resolve)
        .catch(reject);
    }
  }

  /**
   * Redirect to login page
   */
  redirectToLogin() {
    if (typeof window !== 'undefined') {
      window.location.href = '/accounts/login/?next=' + encodeURIComponent(window.location.pathname);
    }
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const response = await this.interceptedFetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Authentication methods
   */
  async login(username, password) {
    const response = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    this.saveAuthTokens(response.access, response.refresh);
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout/', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error);
    }

    this.clearAuthTokens();
  }

  async register(userData) {
    const response = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    this.saveAuthTokens(response.access, response.refresh);
    return response;
  }

  /**
   * Game data methods
   */
  async getGames(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/games/${queryParams ? '?' + queryParams : ''}`;
    return this.request(endpoint);
  }

  async getGame(gameId) {
    return this.request(`/games/${gameId}/`);
  }

  async getGameLevels(gameId) {
    return this.request(`/games/${gameId}/levels/`);
  }

  async getGameAssets(gameId) {
    return this.request(`/games/${gameId}/assets/`);
  }

  /**
   * User progress methods
   */
  async getUserProgress(gameId = null) {
    const endpoint = gameId ? `/progress/${gameId}/` : '/progress/';
    return this.request(endpoint);
  }

  async saveProgress(gameId, progressData) {
    return this.request(`/progress/${gameId}/`, {
      method: 'POST',
      body: JSON.stringify(progressData)
    });
  }

  async updateProgress(gameId, progressData) {
    return this.request(`/progress/${gameId}/`, {
      method: 'PUT',
      body: JSON.stringify(progressData)
    });
  }

  /**
   * Achievement methods
   */
  async getAchievements() {
    return this.request('/achievements/');
  }

  async unlockAchievement(achievementId) {
    return this.request(`/achievements/${achievementId}/unlock/`, {
      method: 'POST'
    });
  }

  /**
   * Leaderboard methods
   */
  async getLeaderboard(gameId, timeframe = 'all') {
    return this.request(`/leaderboard/${gameId}/?timeframe=${timeframe}`);
  }

  async submitScore(gameId, score, level = null) {
    return this.request('/scores/', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, score, level })
    });
  }

  /**
   * Settings and preferences
   */
  async getUserSettings() {
    return this.request('/settings/');
  }

  async updateUserSettings(settings) {
    return this.request('/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  /**
   * Analytics and reporting
   */
  async trackGameEvent(eventType, eventData) {
    return this.request('/analytics/events/', {
      method: 'POST',
      body: JSON.stringify({
        event_type: eventType,
        ...eventData,
        timestamp: new Date().toISOString()
      })
    });
  }

  async reportBug(errorData) {
    return this.request('/bugs/', {
      method: 'POST',
      body: JSON.stringify({
        ...errorData,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    });
  }

  /**
   * Offline queue for when network is unavailable
   */
  queueOfflineRequest(endpoint, options) {
    const offlineQueue = JSON.parse(localStorage.getItem('lalela_offline_queue') || '[]');
    offlineQueue.push({
      endpoint,
      options,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });

    localStorage.setItem('lalela_offline_queue', JSON.stringify(offlineQueue));
  }

  async processOfflineQueue() {
    const offlineQueue = JSON.parse(localStorage.getItem('lalela_offline_queue') || '[]');

    if (offlineQueue.length === 0) return;

    const processedRequests = [];

    for (const request of offlineQueue) {
      try {
        await this.request(request.endpoint, request.options);
        processedRequests.push(request.id);
      } catch (error) {
        // Keep failed requests in queue
        console.warn('Offline request failed, keeping in queue:', error);
      }
    }

    // Remove processed requests
    const remainingQueue = offlineQueue.filter(req => !processedRequests.includes(req.id));
    localStorage.setItem('lalela_offline_queue', JSON.stringify(remainingQueue));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.authToken;
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    return this.request('/auth/user/');
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.originalFetch(`${this.baseURL}/health/`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}