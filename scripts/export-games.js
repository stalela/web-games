#!/usr/bin/env node
/**
 * Export Games Registry
 * 
 * Extracts game metadata from GameMenuScene.js and exports to JSON
 * for syncing with Django backend.
 * 
 * Usage:
 *   node scripts/export-games.js > games.json
 *   node scripts/export-games.js --output=games.json
 */

const fs = require('fs');
const path = require('path');

// Path to GameMenuScene.js
const GAME_MENU_PATH = path.join(__dirname, '../src/scenes/GameMenuScene.js');

// Parse --output=filename argument
let OUTPUT_FILE = null;
for (const arg of process.argv) {
    if (arg.startsWith('--output=')) {
        OUTPUT_FILE = arg.split('=')[1];
        break;
    }
}

/**
 * Parse defaultGames array from GameMenuScene.js
 */
function extractGamesFromSource() {
    const source = fs.readFileSync(GAME_MENU_PATH, 'utf-8');
    
    console.error('Extracting games from GameMenuScene.js...');
    
    // Find the defaultGames array definition (can span many lines)
    // Look for this.defaultGames = [ ... ];
    const startMarker = 'this.defaultGames = [';
    const startIndex = source.indexOf(startMarker);
    
    if (startIndex === -1) {
        console.error('Could not find defaultGames array in GameMenuScene.js');
        process.exit(1);
    }
    
    // Find the matching closing bracket
    let bracketCount = 0;
    let endIndex = startIndex + startMarker.length;
    let inString = false;
    let stringChar = null;
    
    for (let i = startIndex; i < source.length; i++) {
        const char = source[i];
        
        // Handle string boundaries
        if ((char === '"' || char === "'") && source[i-1] !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = null;
            }
        }
        
        if (!inString) {
            if (char === '[') bracketCount++;
            if (char === ']') {
                bracketCount--;
                if (bracketCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }
    }
    
    const gamesArrayStr = source.slice(startIndex + startMarker.length - 1, endIndex);
    const games = [];
    
    // Match each game object - handle multi-line format
    const gameRegex = /\{\s*scene:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*icon:\s*['"]([^'"]+)['"],\s*difficulty:\s*(\d+),\s*category:\s*['"]([^'"]+)['"]\s*\}/gs;
    
    let match;
    while ((match = gameRegex.exec(gamesArrayStr)) !== null) {
        games.push({
            scene: match[1],
            name: match[2],
            icon: match[3],
            difficulty: parseInt(match[4], 10),
            category: match[5],
            // Generate slug from scene name
            slug: match[1].replace(/Game$/, '').replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
        });
    }
    
    console.error(`Found ${games.length} games`);
    return games;
}

/**
 * Map category to ELDA domains
 */
function mapCategoryToELDA(category) {
    const mapping = {
        'math': ['elda4'],
        'reading': ['elda3'],
        'puzzle': ['elda5'],
        'strategy': ['elda5'],
        'science': ['elda6'],
        'music': ['elda5'],
        'computer': ['elda6'],
    };
    return mapping[category] || [];
}

/**
 * Generate Django fixture format
 */
function generateDjangoFixture(games) {
    return games.map((game, index) => ({
        model: 'webapp.game',
        pk: index + 1,
        fields: {
            title: game.name,
            slug: game.slug,
            section: game.category,
            difficulty: game.difficulty,
            icon: game.icon,
            scene_key: game.scene,
            elda_domains: mapCategoryToELDA(game.category),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    }));
}

/**
 * Main execution
 */
function main() {
    console.error('Extracting games from GameMenuScene.js...');
    
    const games = extractGamesFromSource();
    console.error(`Found ${games.length} games`);
    
    // Choose output format based on flag
    const isDjangoFixture = process.argv.includes('--django');
    
    let output;
    if (isDjangoFixture) {
        output = generateDjangoFixture(games);
    } else {
        output = {
            version: '1.0.0',
            exported_at: new Date().toISOString(),
            count: games.length,
            games: games
        };
    }
    
    const jsonOutput = JSON.stringify(output, null, 2);
    
    if (OUTPUT_FILE) {
        fs.writeFileSync(OUTPUT_FILE, jsonOutput);
        console.error(`Written to ${OUTPUT_FILE}`);
    } else {
        console.log(jsonOutput);
    }
}

main();
