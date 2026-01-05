import { MemoryTuxBaseGame } from './MemoryTuxBaseGame.js';

export class MemoryTuxGame extends MemoryTuxBaseGame {
    constructor() {
        super({
            key: 'MemoryTuxGame',
            title: 'Memory Tux',
            description: 'Match image pairs against Tux.',
            category: 'memory'
        });
        
        this.imageCategories = ['animals', 'transport', 'tools'];
    }

    preload() {
        super.preload();
        // Load some generic icons if not already loaded
        // We can use the existing category icons or game icons
        // For now, let's assume we have some assets or use text/shapes if assets missing
        // Actually, let's use the 'animals' category from MemoryImageGame if available
        // or just use the game icons we have.
        
        // Let's use the game icons as card images for variety
        this.load.svg('icon-1', 'assets/game-icons/baby_mouse.svg');
        this.load.svg('icon-2', 'assets/game-icons/clickgame.svg');
        this.load.svg('icon-3', 'assets/game-icons/erase.svg');
        this.load.svg('icon-4', 'assets/game-icons/colors.svg');
        this.load.svg('icon-5', 'assets/game-icons/hanoi.svg');
        this.load.svg('icon-6', 'assets/game-icons/maze.svg');
        this.load.svg('icon-7', 'assets/game-icons/money.svg');
        this.load.svg('icon-8', 'assets/game-icons/sudoku.svg');
    }

    setupLevel() {
        const numPairs = Math.min(3 + this.level, 8);
        const availableIcons = ['icon-1', 'icon-2', 'icon-3', 'icon-4', 'icon-5', 'icon-6', 'icon-7', 'icon-8'];
        
        // Shuffle icons
        for (let i = availableIcons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIcons[i], availableIcons[j]] = [availableIcons[j], availableIcons[i]];
        }
        
        const selectedIcons = availableIcons.slice(0, numPairs);
        
        this.cardPairs = [];
        selectedIcons.forEach((icon, index) => {
            // Add pair
            this.cardPairs.push({
                matchId: index,
                type: 'image',
                value: index,
                imageKey: icon
            });
            this.cardPairs.push({
                matchId: index,
                type: 'image',
                value: index,
                imageKey: icon
            });
        });
        
        super.setupLevel();
    }
}
