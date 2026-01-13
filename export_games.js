/**
 * Export games from GameMenuScene.js to JSON format for Django import.
 * Usage: node export_games.js > games.json
 */

const fs = require('fs');
const path = require('path');

// Read the GameMenuScene.js file
const gameMenuPath = path.join(__dirname, 'src/scenes/GameMenuScene.js');
const content = fs.readFileSync(gameMenuPath, 'utf8');

// Extract the defaultGames array using regex
// Match from "this.defaultGames = [" to the closing "];"
const match = content.match(/this\.defaultGames\s*=\s*\[([\s\S]*?)\n\s*\];/);

if (!match) {
  console.error('Could not find defaultGames array in GameMenuScene.js');
  process.exit(1);
}

const gamesArrayStr = '[' + match[1] + ']';

// Parse the JavaScript object notation (convert to valid JSON)
let games;
try {
  // Use a safer eval-like approach - convert JS object literals to JSON
  // Replace single quotes with double quotes, handle trailing commas
  const jsonStr = gamesArrayStr
    .replace(/'/g, '"')                           // single to double quotes
    .replace(/(\w+):/g, '"$1":')                  // unquoted keys to quoted
    .replace(/,\s*}/g, '}')                       // trailing commas in objects
    .replace(/,\s*\]/g, ']')                      // trailing commas in arrays
    .replace(/\/\/[^\n]*/g, '');                  // remove comments

  games = JSON.parse(jsonStr);
} catch (e) {
  // Fallback: use eval in a safer way
  try {
    games = eval(gamesArrayStr);
  } catch (e2) {
    console.error('Failed to parse games array:', e2.message);
    process.exit(1);
  }
}

// Transform to the format expected by import_games_json
const exportedGames = games.map(game => ({
  game_slug: game.scene.replace(/Game$/, '').toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '').replace(/_+/g, '_'),
  title: game.name,
  category: game.category,
  difficulty: game.difficulty,
  icon: game.icon,
  scene_key: game.scene
}));

// Remove duplicates based on scene_key
const seen = new Set();
const uniqueGames = exportedGames.filter(game => {
  if (seen.has(game.scene_key)) {
    return false;
  }
  seen.add(game.scene_key);
  return true;
});

// Output as JSON
const output = {
  generated_at: new Date().toISOString(),
  source: 'web-games/src/scenes/GameMenuScene.js',
  count: uniqueGames.length,
  games: uniqueGames
};

// Write to file
const outputPath = path.join(__dirname, '..', 'DF', 'https___superchill.org_en_', 'superchill.org', 'lalela', 'games.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Exported ${uniqueGames.length} games to ${outputPath}`);
