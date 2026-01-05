const fs = require('fs');
const path = require('path');

const activitiesPath = 'c:/Users/HomePC/Documents/GCompris-qt-master/GCompris-qt-master/src/activities/activities.txt';
const gamesPath = 'c:/Users/HomePC/Documents/web-games/src/games/';

const activities = fs.readFileSync(activitiesPath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

const gameFiles = fs.readdirSync(gamesPath);

// Map activity names to expected game class names
// This is a heuristic, might need manual adjustment
const normalize = (name) => {
    return name.replace(/[-_]/g, '').toLowerCase();
};

const gameFileMap = new Set(gameFiles.map(f => normalize(f.replace('.js', ''))));

const missing = [];

activities.forEach(activity => {
    let expectedName = activity.replace(/[-_]/g, '').toLowerCase();
    
    // Handle known naming differences
    if (expectedName === 'smallnumbers') expectedName = 'smallnumbersgame';
    if (expectedName === 'smallnumbers2') expectedName = 'smallnumbers2game';
    if (expectedName === 'eraseclic') expectedName = 'eraseclickgame';
    if (expectedName === 'geography') expectedName = 'geographymapgame';
    if (expectedName === 'geocountry') expectedName = 'geocountrygame';
    if (expectedName.endsWith('2players')) {
        expectedName = expectedName.replace('2players', 'twoplayergame');
    }
    
    // Check if we have a match in game files (ignoring 'Game' suffix which most have)
    let found = false;
    for (const file of gameFileMap) {
        if (file === expectedName || file === expectedName + 'game') {
            found = true;
            break;
        }
    }
    
    if (!found) {
        missing.push(activity);
    }
});

console.log('Missing activities:', missing);
