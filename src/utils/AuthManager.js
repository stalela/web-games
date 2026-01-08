/**
 * AuthManager - Handles authentication with Django backend
 * 
 * Manages JWT tokens for child sessions and provides authentication
 * state to all game scenes.
 * 
 * @example
 * import { authManager } from './utils/AuthManager.js';
 * 
 * // In index.js init
 * const isAuthenticated = await authManager.initialize();
 * if (!isAuthenticated) return; // Already redirected
 * 
 * // In any scene
 * const childId = authManager.getChildId();
 * const token = authManager.getToken();
 */

// API Configuration - use window.__ENV__ if provided, otherwise defaults
const API_BASE_URL = (typeof window !== 'undefined' && window.__ENV__?.API_BASE_URL) || 'http://localhost:8000/api';
const DJANGO_LOGIN_URL = (typeof window !== 'undefined' && window.__ENV__?.DJANGO_LOGIN_URL) || 'http://localhost:8000/webapp/login/';

// Storage keys
const STORAGE_KEYS = {
    CHILD_TOKEN: 'lalela_child_token',
    CHILD_ID: 'lalela_child_id',
    CHILD_NAME: 'lalela_child_name',
    TOKEN_EXPIRY: 'lalela_token_expiry',
};

export class AuthManager {
    constructor() {
        this.token = null;
        this.childId = null;
        this.childName = null;
        this.tokenExpiry = null;
        this.isInitialized = false;
    }

    /**
     * Initialize authentication state
     * Checks URL params for token, validates existing session, or redirects to login
     * 
     * @returns {Promise<boolean>} True if authenticated, false if redirecting
     */
    async initialize() {
        if (this.isInitialized) {
            return this.isAuthenticated();
        }

        // 1. Check URL params for new token (from Django redirect)
        const urlToken = this.getTokenFromUrl();
        if (urlToken) {
            await this.setToken(urlToken);
            // Clean URL
            this.cleanUrl();
        }

        // 2. Try to restore from localStorage
        if (!this.token) {
            this.restoreFromStorage();
        }

        // 3. Validate token if we have one
        if (this.token) {
            const isValid = await this.validateToken();
            if (!isValid) {
                this.clearSession();
                this.redirectToLogin();
                return false;
            }
        } else {
            // No token at all - redirect to login
            this.redirectToLogin();
            return false;
        }

        this.isInitialized = true;
        return true;
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        if (!this.token || !this.childId) {
            return false;
        }

        // Check if token is expired
        if (this.tokenExpiry && Date.now() > this.tokenExpiry) {
            return false;
        }

        return true;
    }

    /**
     * Get the current child's UUID
     * @returns {string|null}
     */
    getChildId() {
        return this.childId;
    }

    /**
     * Get the current child's name
     * @returns {string|null}
     */
    getChildName() {
        return this.childName;
    }

    /**
     * Get the JWT token for API calls
     * @returns {string|null}
     */
    getToken() {
        return this.token;
    }

    /**
     * Get authorization header for fetch requests
     * @returns {Object}
     */
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Redirect to Django login page
     */
    redirectToLogin() {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${DJANGO_LOGIN_URL}?next=${returnUrl}`;
    }

    /**
     * Log out - clear session and redirect to login
     */
    logout() {
        this.clearSession();
        this.redirectToLogin();
    }

    /**
     * Extract token from URL query parameters
     * @private
     * @returns {string|null}
     */
    getTokenFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('child_token');
    }

    /**
     * Remove token from URL without page reload
     * @private
     */
    cleanUrl() {
        const url = new URL(window.location.href);
        url.searchParams.delete('child_token');
        window.history.replaceState({}, document.title, url.toString());
    }

    /**
     * Set and decode a JWT token
     * @private
     * @param {string} token
     */
    async setToken(token) {
        this.token = token;

        // Decode JWT to extract claims (without verification - server validates)
        try {
            const payload = this.decodeJwt(token);
            this.childId = payload.child_id || null;
            this.childName = payload.child_name || null;
            
            // Set expiry (JWT exp is in seconds, JS uses milliseconds)
            if (payload.exp) {
                this.tokenExpiry = payload.exp * 1000;
            }
        } catch (error) {
            console.error('Failed to decode JWT:', error);
        }

        // Persist to storage
        this.saveToStorage();
    }

    /**
     * Decode JWT payload (base64)
     * @private
     * @param {string} token
     * @returns {Object}
     */
    decodeJwt(token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        const payload = parts[1];
        // Handle base64url encoding
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    }

    /**
     * Validate token with backend
     * @private
     * @returns {Promise<boolean>}
     */
    async validateToken() {
        // First check local expiry
        if (this.tokenExpiry && Date.now() > this.tokenExpiry) {
            return false;
        }

        // Optionally validate with backend (can be disabled for offline mode)
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me/`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            return response.ok;
        } catch (error) {
            // Network error - allow offline mode if token hasn't expired
            console.warn('Could not validate token with server, using local validation');
            return this.tokenExpiry ? Date.now() < this.tokenExpiry : false;
        }
    }

    /**
     * Save session to localStorage
     * @private
     */
    saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEYS.CHILD_TOKEN, this.token || '');
            localStorage.setItem(STORAGE_KEYS.CHILD_ID, this.childId || '');
            localStorage.setItem(STORAGE_KEYS.CHILD_NAME, this.childName || '');
            localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiry?.toString() || '');
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    /**
     * Restore session from localStorage
     * @private
     */
    restoreFromStorage() {
        try {
            this.token = localStorage.getItem(STORAGE_KEYS.CHILD_TOKEN) || null;
            this.childId = localStorage.getItem(STORAGE_KEYS.CHILD_ID) || null;
            this.childName = localStorage.getItem(STORAGE_KEYS.CHILD_NAME) || null;
            
            const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
            this.tokenExpiry = expiryStr ? parseInt(expiryStr, 10) : null;
        } catch (error) {
            console.warn('Could not restore from localStorage:', error);
        }
    }

    /**
     * Clear all session data
     * @private
     */
    clearSession() {
        this.token = null;
        this.childId = null;
        this.childName = null;
        this.tokenExpiry = null;
        this.isInitialized = false;

        try {
            localStorage.removeItem(STORAGE_KEYS.CHILD_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.CHILD_ID);
            localStorage.removeItem(STORAGE_KEYS.CHILD_NAME);
            localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        } catch (error) {
            console.warn('Could not clear localStorage:', error);
        }
    }
}

// Export singleton instance
export const authManager = new AuthManager();
