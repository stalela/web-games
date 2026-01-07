# Lalela Web Games - AI Coding Agent Instructions

## Project Overview
Web-based educational games platform converting GCompris (Qt/QML) games to **Phaser 3**.
- **Goal**: 199 target games (~200 implemented, some duplicates being consolidated).
- **Engine**: Phaser 3.80.0 + Howler.js for audio.
- **Repos**: `web-games` (active), `GCompris-qt-master` (reference source for porting).

## GCompris Reference (Porting Source)
Original game logic in `GCompris-qt-master/src/activities/{activity_name}/`:
- `ActivityInfo.qml`: Metadata (difficulty 1-6, category, description)
- `{Name}.qml`: Main QML logic to port (translate to Phaser patterns)
- `resource/`: Assets (SVGs preferred - copy to `src/assets/`)

## Architecture

### Game Class Hierarchy
```
Phaser.Scene
  └── LalelaGame (src/utils/LalelaGame.js) - Base with lifecycle, pooling, nav dock
        └── DragDropGame (src/games/DragDropGame.js) - Drag-and-drop mechanics
              └── Specific games (e.g., AdjacentNumbers, OrderingGame)
```

### Manager Injection Pattern (Critical)
Managers instantiated once in [src/index.js](src/index.js#L250-L260), injected via `init(data)`.
**NEVER instantiate managers in games.** Access via `this.managerName`.

| Manager | Access | Purpose |
|---------|--------|---------|
| `assetManager` | `this.assetManager` | Asset preloading |
| `uiManager` | `this.uiManager` | Modals, buttons |
| `audioManager` | `this.audioManager` | Howler.js sounds |
| `gameManager` | `this.gameManager` | Scene orchestration |
| `dataManager` | `this.dataManager` | LocalStorage progress |

### Lifecycle Hooks (Override These)
```javascript
init(data) {
  super.init(data);  // REQUIRED - stores managers
  this.levels = this.loadLevelData();  // Game-specific setup
}

preload() {
  super.preload();  // REQUIRED
  this.load.svg('bg', 'assets/game-icons/background-wood.svg');
}

// DON'T override create() - it chains these automatically:
createBackground() { }  // Depth -1
createUI() { }          // Score, instructions, nav dock
setupGameLogic() { }    // Start game, spawn objects
```

## Development Workflow

### Commands
```bash
npm start                    # Dev server at localhost:8081
npm run build               # Production build to dist/
npm test                    # Jest unit tests
npm run test:comprehensive  # Puppeteer full integration
npm run benchmark           # Performance profiling
```

### Adding a New Game (3 Registration Points)
1. **Create class** in `src/games/YourGame.js` extending `LalelaGame` or `DragDropGame`
2. **Import + add scene** in [src/index.js](src/index.js):
   ```javascript
   import { YourGame } from './games/YourGame.js';
   // In init(): 
   this.game.scene.add('YourGame', YourGame);
   ```
3. **Add metadata** to `allGames` in [src/scenes/GameMenuScene.js](src/scenes/GameMenuScene.js#L65):
   ```javascript
   { scene: 'YourGame', name: 'Your Game', icon: 'yourgame.svg', difficulty: 2, category: 'math' }
   ```

**Scene key pattern**: Some use suffix (`CheckersGame`), some don't (`Oware`). Match existing patterns for that game family.

## Conventions

### Brand Colors (Hex for Phaser)
- River Blue: `0x0062FF` | Aloe Green: `0x00B378`
- Orange: `0xF08A00` | Purple: `0xA74BFF`

### Z-Depth Layers
| Range | Usage |
|-------|-------|
| -1 | Background |
| 0-9 | Game objects |
| 10-19 | UI elements |
| 100+ | Navigation dock, modals |

### Graphics Preference
Prefer **programmatic graphics** over images:
```javascript
// Good - no asset loading
this.add.rectangle(x, y, 100, 100, 0x0062FF);
const gfx = this.add.graphics();
gfx.fillStyle(0x00B378).fillCircle(x, y, 50);

// Only load SVGs when complex graphics needed
this.load.svg('icon', 'assets/category-icons/icon.svg');
```

### Navigation Dock (Required)
Every game needs bottom nav. Use `createNavigationDock()` from base class:
```javascript
createUI() {
  // ... your UI
  this.createNavigationDock(this.scale.width, this.scale.height);
}
```
Icons loaded in preload: `exit`, `settings`, `help`, `home` from `assets/category-icons/`.

## Common Patterns

### DragDropGame Usage
```javascript
class MyGame extends DragDropGame {
  setupGameLogic() {
    this.createDraggableTiles([
      { x: 100, y: 200, value: 5, text: '5', color: 0x0062FF }
    ]);
    this.createDropZones([
      { x: 400, y: 200, expectedValue: 5, width: 80, height: 80 }
    ]);
  }
}
```

### Object Pooling (Performance)
```javascript
// Pools auto-created in base class
const rect = this.getPooledObject('rectangles', { x, y, width, height });
// When done:
this.releasePooledObject('rectangles', rect);
```

### Scene Transitions
```javascript
// Return to menu (managers auto-available on GameMenu)
this.scene.start('GameMenu');

// Start game with explicit manager injection (for inter-game transitions)
this.scene.start('AdjacentNumbers', {
  assetManager: this.assetManager,
  audioManager: this.audioManager
});
```

## Common Pitfalls

1. **Manager instantiation in games** - Use injected `this.assetManager`, never `new AssetManager()`
2. **Missing super calls** - Always `super.init(data)`, `super.preload()` first
3. **Overriding create()** - Override `createBackground()`, `createUI()`, `setupGameLogic()` instead
4. **Depth collisions** - Always `.setDepth()` explicitly; dock is 100+
5. **Asset paths** - Webpack copies to `dist/assets/`. Reference as `'assets/category-icons/foo.svg'`
6. **Touch/mouse** - Test both. Use `this.input.on('pointerdown')` not `'mousedown'`

## Key Files Reference
| File | Purpose |
|------|---------|
| [src/utils/LalelaGame.js](src/utils/LalelaGame.js) | **Read first** - base class with all lifecycle hooks |
| [src/games/DragDropGame.js](src/games/DragDropGame.js) | Drag-drop base with tile/zone helpers |
| [src/games/AdjacentNumbers.js](src/games/AdjacentNumbers.js) | Reference implementation |
| [src/index.js](src/index.js) | Bootstrap, manager creation, scene registration |
| [src/scenes/GameMenuScene.js](src/scenes/GameMenuScene.js) | Menu + `allGames` registry |
| [src/tests/setup.js](src/tests/setup.js) | Jest mocks for Phaser objects |
| [src/components/DraggableTile.js](src/components/DraggableTile.js) | Reusable drag component |
