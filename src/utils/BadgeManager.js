/**
 * BadgeManager - Handles badge notifications and display
 * 
 * Fetches unseen badges from the API, displays animated notifications,
 * and marks badges as seen.
 * 
 * @example
 * import { badgeManager } from './utils/BadgeManager.js';
 * 
 * // Check for new badges after game completion
 * await badgeManager.checkForNewBadges(scene);
 */

import { authManager } from './AuthManager.js';

// API Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';

// Badge icon mappings (icon name -> emoji or asset path)
const BADGE_ICONS = {
    'gamepad': '🎮',
    'star': '⭐',
    'rocket': '🚀',
    'trophy': '🏆',
    'search': '🔍',
    'fire': '🔥',
    'lightning': '⚡',
    'muscle': '💪',
    'crown': '👑',
    'numbers': '🔢',
    'plus': '➕',
    'book-open': '📖',
    'books': '📚',
    'palette': '🎨',
    'microscope': '🔬',
    'chart-line': '📈',
    'target': '🎯',
    'hundred': '💯',
    'clock': '⏰',
    'rainbow': '🌈',
};

class BadgeManager {
    constructor() {
        this.pendingBadges = [];
        this.isShowingNotification = false;
        this.notificationQueue = [];
    }

    /**
     * Check for new (unseen) badges and show notifications
     * Call this after game sessions end
     * 
     * @param {Phaser.Scene} scene - The current scene for displaying notifications
     * @returns {Promise<Array>} Array of new badges
     */
    async checkForNewBadges(scene) {
        if (!authManager.isAuthenticated()) {
            return [];
        }

        try {
            const childId = authManager.getChildId();
            const response = await fetch(
                `${API_BASE_URL}/children/${childId}/badges/unseen/`,
                {
                    headers: {
                        'Authorization': `Bearer ${authManager.getToken()}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                console.warn('BadgeManager: Failed to fetch unseen badges');
                return [];
            }

            const data = await response.json();
            const newBadges = data.results || [];

            if (newBadges.length > 0 && scene) {
                // Queue badges for display
                this.queueBadgeNotifications(newBadges, scene);
            }

            return newBadges;
        } catch (error) {
            console.error('BadgeManager: Error checking badges:', error);
            return [];
        }
    }

    /**
     * Queue badge notifications for sequential display
     * 
     * @param {Array} badges - Array of badge objects
     * @param {Phaser.Scene} scene - Scene for display
     */
    queueBadgeNotifications(badges, scene) {
        badges.forEach(badge => {
            this.notificationQueue.push({ badge, scene });
        });

        // Start showing if not already
        if (!this.isShowingNotification) {
            this.showNextNotification();
        }
    }

    /**
     * Show the next queued notification
     */
    async showNextNotification() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }

        this.isShowingNotification = true;
        const { badge, scene } = this.notificationQueue.shift();

        try {
            await this.showBadgeNotification(badge, scene);
            // Mark as seen
            await this.markBadgeSeen(badge.slug);
        } catch (error) {
            console.error('BadgeManager: Error showing notification:', error);
        }

        // Small delay between notifications
        setTimeout(() => {
            this.showNextNotification();
        }, 500);
    }

    /**
     * Display an animated badge notification
     * 
     * @param {Object} badge - Badge data from API
     * @param {Phaser.Scene} scene - Scene for display
     * @returns {Promise} Resolves when animation completes
     */
    showBadgeNotification(badge, scene) {
        return new Promise((resolve) => {
            if (!scene || !scene.add) {
                resolve();
                return;
            }

            const { width, height } = scene.scale;
            const centerX = width / 2;
            const centerY = height / 2;

            // Create overlay
            const overlay = scene.add.rectangle(
                centerX, centerY,
                width, height,
                0x000000, 0.7
            ).setDepth(200);

            // Create badge container
            const container = scene.add.container(centerX, centerY).setDepth(201);

            // Badge background (golden circle)
            const bg = scene.add.circle(0, 0, 80, 0xFFD700);
            const bgBorder = scene.add.circle(0, 0, 85, 0xFFA500);
            bgBorder.setStrokeStyle(4, 0xFFD700);

            // Badge icon
            const iconEmoji = BADGE_ICONS[badge.icon] || '🏅';
            const icon = scene.add.text(0, -10, iconEmoji, {
                fontSize: '64px',
            }).setOrigin(0.5);

            // Badge name
            const nameText = scene.add.text(0, 100, badge.name, {
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 4,
            }).setOrigin(0.5);

            // Badge description
            const descText = scene.add.text(0, 145, badge.description, {
                fontSize: '18px',
                color: '#FFFFFF',
                align: 'center',
                wordWrap: { width: 300 },
            }).setOrigin(0.5, 0);

            // "Badge Earned!" header
            const header = scene.add.text(0, -130, '🎉 Badge Earned! 🎉', {
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#FFFFFF',
            }).setOrigin(0.5);

            container.add([bgBorder, bg, icon, nameText, descText, header]);

            // Start animation - scale from 0
            container.setScale(0);

            // Entrance animation
            scene.tweens.add({
                targets: container,
                scale: 1,
                duration: 400,
                ease: 'Back.out',
            });

            // Sparkle effect
            this.createSparkles(scene, centerX, centerY);

            // Auto-dismiss after delay or on click
            const dismissNotification = () => {
                scene.tweens.add({
                    targets: [container, overlay],
                    alpha: 0,
                    scale: 0.8,
                    duration: 300,
                    onComplete: () => {
                        container.destroy();
                        overlay.destroy();
                        resolve();
                    }
                });
            };

            // Click to dismiss
            overlay.setInteractive();
            overlay.on('pointerdown', dismissNotification);
            container.setSize(300, 300);
            container.setInteractive();
            container.on('pointerdown', dismissNotification);

            // Auto-dismiss after 4 seconds
            scene.time.delayedCall(4000, dismissNotification);
        });
    }

    /**
     * Create sparkle particle effect
     */
    createSparkles(scene, x, y) {
        const colors = [0xFFD700, 0xFFFFFF, 0xFFA500];
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 120 + Math.random() * 40;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            const sparkle = scene.add.star(
                x, y, 4, 4, 8,
                Phaser.Utils.Array.GetRandom(colors)
            ).setDepth(202).setScale(0);

            scene.tweens.add({
                targets: sparkle,
                x: targetX,
                y: targetY,
                scale: 1,
                alpha: 0,
                duration: 800,
                delay: i * 50,
                ease: 'Quad.out',
                onComplete: () => sparkle.destroy()
            });
        }
    }

    /**
     * Mark a badge as seen
     * 
     * @param {string} badgeSlug - Badge slug to mark seen
     */
    async markBadgeSeen(badgeSlug) {
        if (!authManager.isAuthenticated()) return;

        try {
            const childId = authManager.getChildId();
            await fetch(
                `${API_BASE_URL}/children/${childId}/badges/seen/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authManager.getToken()}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        badge_slugs: [badgeSlug]
                    })
                }
            );
        } catch (error) {
            console.error('BadgeManager: Error marking badge seen:', error);
        }
    }

    /**
     * Get all earned badges for current child
     * 
     * @returns {Promise<Array>} Array of earned badges
     */
    async getAllBadges() {
        if (!authManager.isAuthenticated()) {
            return [];
        }

        try {
            const childId = authManager.getChildId();
            const response = await fetch(
                `${API_BASE_URL}/children/${childId}/badges/`,
                {
                    headers: {
                        'Authorization': `Bearer ${authManager.getToken()}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('BadgeManager: Error fetching badges:', error);
            return [];
        }
    }

    /**
     * Get all available badges (for trophy case display)
     * 
     * @returns {Promise<Array>} Array of all badge definitions
     */
    async getBadgeCatalog() {
        if (!authManager.isAuthenticated()) {
            return [];
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/badges/`,
                {
                    headers: {
                        'Authorization': `Bearer ${authManager.getToken()}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('BadgeManager: Error fetching badge catalog:', error);
            return [];
        }
    }

    /**
     * Get icon emoji for badge
     * 
     * @param {string} iconName - Icon name from API
     * @returns {string} Emoji character
     */
    getIconEmoji(iconName) {
        return BADGE_ICONS[iconName] || '🏅';
    }
}

// Singleton instance
export const badgeManager = new BadgeManager();
export { BadgeManager };
