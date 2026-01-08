# Lalela Web Games - AI Coding Agent Instructions

## Project Overview
Educational games platform porting **GCompris** (Qt/QML) to **Phaser 3.80.0** + Howler.js.
- **~200 games** implemented across categories: math, reading, puzzles, strategy, science
- Dev server: `npm start` → localhost:8081

## Architecture

### Class Hierarchy (Critical)
```
Phaser.Scene
  └── LalelaGame (src/utils/LalelaGame.js)     ← Read this first
        └── DragDropGame (src/games/DragDropGame.js)
              └── Specific games (AdjacentNumbers, OrderingGame, etc.)
```

### Manager Injection Pattern
Managers created once in `src/index.js`, injected via `init(data)`. **Never instantiate in games.**
```javascript
// ✓ Correct: use injected manager
if (this.audioManager) this.audioManager.playSound('success');

// ✗ Wrong: instantiating manager in game
this.audioManager = new AudioManager(); // NEVER do this
```

| Manager | Purpose |
|---------|---------|
| `this.assetManager` | Asset preloading |
| `this.audioManager` | Howler.js sounds (`playSound('click')`, `playSound('success')`, `playSound('fail')`) |
| `this.uiManager` | Modals, buttons |
| `this.gameManager` | Scene orchestration |
| `this.dataManager` | LocalStorage progress |

### Lifecycle Hooks
```javascript
init(data) {
  super.init(data);  // REQUIRED - stores managers
  this.levels = this.loadLevelData();
}

preload() {
  super.preload();  // REQUIRED
  this.load.svg('bg', 'assets/game-icons/background-wood.svg');
}

// DON'T override create() - override these instead:
createBackground() { }  // Depth -1, called first
createUI() { }          // Score, instructions, add nav dock here
setupGameLogic() { }    // Start game, spawn objects
```

## Adding a New Game (3 Steps)

1. **Create class** in `src/games/YourGame.js`:
```javascript
import { LalelaGame } from '../utils/LalelaGame.js';
// or: import { DragDropGame } from './DragDropGame.js';

export class YourGame extends LalelaGame {
  createUI() {
    // Your UI...
    this.createNavigationDock(this.scale.width, this.scale.height);
  }
  setupGameLogic() { /* game logic */ }
}
```

2. **Register scene** in `src/index.js`:
```javascript
import { YourGame } from './games/YourGame.js';
// In init(): 
this.game.scene.add('YourGame', YourGame);
```

3. **Add menu entry** in `src/scenes/GameMenuScene.js` (`allGames` array ~line 66):
```javascript
{ scene: 'YourGame', name: 'Your Game', icon: 'yourgame.svg', difficulty: 2, category: 'math' }
```

**Categories**: `computer`, `puzzle`, `math`, `reading`, `strategy`, `science`, `music`

## Conventions

### Brand Colors
`0x0062FF` (River Blue) | `0x00B378` (Aloe Green) | `0xF08A00` (Orange) | `0xA74BFF` (Purple)

### Z-Depth Layers
| Range | Usage |
|-------|-------|
| -1 | Background |
| 0-9 | Game objects |
| 10-19 | UI elements |
| 100+ | Navigation dock, modals |

### Prefer Programmatic Graphics
```javascript
// ✓ No asset loading required
this.add.rectangle(x, y, 100, 100, 0x0062FF);
this.add.graphics().fillStyle(0x00B378).fillCircle(x, y, 50);

// Only use SVGs for complex graphics
this.load.svg('icon', 'assets/category-icons/icon.svg');
```

### Navigation Dock (Required)
```javascript
createUI() {
  // ... your UI elements
  this.createNavigationDock(this.scale.width, this.scale.height);
}
```

## Commands
```bash
npm start                    # Dev server localhost:8081
npm run build               # Production → dist/
npm test                    # Jest unit tests
npm run test:comprehensive  # Puppeteer integration
npm run benchmark           # Performance profiling
```

## Testing
- Jest config: `jest.config.js`, mocks in `src/tests/setup.js`
- Mocks Phaser objects globally - games can be unit tested without browser
- Test files: `src/**/__tests__/*.test.js`

## Common Pitfalls
1. **Forgetting `super.init(data)`** → managers undefined
2. **Overriding `create()`** → breaks lifecycle; use `createBackground/createUI/setupGameLogic`
3. **Missing `.setDepth()`** → objects hidden behind dock (depth 100+)
4. **Using `'mousedown'`** → breaks touch; use `'pointerdown'`
5. **Wrong asset paths** → Webpack copies to `dist/assets/`, reference as `'assets/...'`

## Key Files
| File | Purpose |
|------|---------|
| `src/utils/LalelaGame.js` | **Read first** - base class, lifecycle, nav dock |
| `src/games/DragDropGame.js` | Drag-drop mechanics with `createDraggableTiles()`, `createDropZones()` |
| `src/games/AdjacentNumbers.js` | Reference implementation |
| `src/index.js` | Bootstrap, managers, scene registration |
| `src/scenes/GameMenuScene.js` | Menu + `allGames` registry |
| `src/components/` | Reusable: `DraggableTile.js`, `DropZone.js`, `Card.js` |
