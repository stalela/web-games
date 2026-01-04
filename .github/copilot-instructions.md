# Lalela Web Games - AI Coding Agent Instructions

## Project Overview
Web-based educational games platform converting GCompris games to **Phaser 3**.
- **Goal**: 199 target games (currently ~80 implemented).
- **Engine**: Phaser 3.80.0 + Howler.js.
- **Repo**: `web-games` (active development), `GCompris-qt-master` (reference assets/logic).

## Architecture

### Game Hierarchy
1. **`LalelaGame`** ([src/utils/LalelaGame.js](src/utils/LalelaGame.js)): Base class. Handles lifecycle, performance, object pooling, and common UI.
2. **`DragDropGame`** ([src/games/DragDropGame.js](src/games/DragDropGame.js)): Extends `LalelaGame` for drag-and-drop mechanics.
3. **Specific Games**: Extend `LalelaGame` or `DragDropGame`.

### Manager Singleton Pattern
Managers are instantiated in [src/index.js](src/index.js) and injected into games via `init(data)`.
**DO NOT** instantiate managers in games. Use `this.managerName`.

| Manager | Purpose |
|---------|---------|
| `GameManager` | Orchestrates lifecycle, scene transitions. |
| `AssetManager` | Asset preloading (programmatic graphics preferred). |
| `UIManager` | Reusable UI (modals, buttons, nav). |
| `InputManager` | Unified touch/mouse/keyboard. |
| `AudioManager` | Howler.js wrapper, mobile unlock. |
| `DataManager` | Local storage, progress tracking. |
| `PerformanceMonitor` | FPS/memory tracking (auto-integrated in base). |
| `HelpSystem` | In-game help overlays. |

### Lifecycle Hooks (Override Order)
1. `init(data)`: Call `super.init(data)`. Setup game-specific data.
2. `preload()`: Call `super.preload()`. Load assets (if any).
3. `create()`: **DO NOT OVERRIDE**. It calls the following methods in order:
    - `createBackground()`: Depth -1.
    - `createUI()`: Score, instructions, nav dock.
    - `setupGameLogic()`: Start game loop, spawn objects.

## Development Workflows

### Commands
- **Run**: `npm start` (Dev server :8081)
- **Build**: `npm run build` (dist/)
- **Test**: 
  - `npm test` (Jest unit tests)
  - `npm run test:comprehensive` (Puppeteer full suite)
  - `npm run test:browser` (Cross-browser simulation)
  - `npm run benchmark` (Performance profiling)

**Test Location:** `src/**/__tests__/**/*.test.js` - tests colocated with source code.

### Adding a New Game
1. **Create Class**: Extend `LalelaGame` or `DragDropGame` in `src/games/`.
2. **Register**:
   - Import in [src/index.js](src/index.js).
   - Add to Phaser: `this.game.scene.add('GameName', GameClass)`.
   - Add metadata to `allGames` in [src/scenes/GameMenuScene.js](src/scenes/GameMenuScene.js).

## Conventions & Patterns

### Brand Colors
- **River Blue:** `0x0062FF`
- **Aloe Green:** `0x00B378`
- **Orange:** `0xF08A00`
- **Purple:** `0xA74BFF`

### Graphics & Assets
- **Programmatic Graphics**: Prefer `this.add.graphics()` or `this.add.rectangle()` over loading images.
- **Asset Loading**: If needed, check `src/utils/AssetManager.js`.
- **Z-Depth**:
  - `-1`: Background
  - `0-9`: Game Objects
  - `10-19`: UI
  - `20+`: Modals/Overlays

### Performance
- **Object Pooling**: Use `this.objectPools` (Map) or `GameObjectPool` from `src/utils/ObjectPool.js` for frequent spawns.
- **Rendering**: `LalelaGame` includes `RenderingOptimizer`.

### Audio
- Use `this.audioManager.play('soundKey')`.
- Always check existence: `if (this.audioManager.sounds.has('click')) ...`

### Navigation
- Implement `createNavigationDock()` (available in base) or copy from `AdjacentNumbers.js`.
- Icons: Exit, Settings, Help, Home.

## Common Pitfalls

1. **Don't create managers in games** - Use injected instances from `init(data)`, e.g., `this.assetManager`, `this.uiManager`
2. **Call super methods** - Always call `super.preload()`, `super.init(data)`, etc. before your code
3. **Scene lifecycle order matters** - Background → UI → Game Logic. Don't spawn game objects before UI is ready
4. **Depth management** - Explicitly set `.setDepth()` on all sprites to avoid z-fighting
5. **Asset paths** - Assets are copied to `dist/assets/` by webpack. Reference as `'assets/category-icons/icon.svg'`
6. **Mobile testing** - Always test touch input, not just mouse. Use InputManager for unified handling

## Integration Points

### Scene Transitions
```javascript
// Return to menu
this.scene.start('GameMenu');

// Start another game
this.scene.start('AdjacentNumbers', {
  assetManager: this.assetManager,
  uiManager: this.uiManager,
  gameManager: this.gameManager,
  audioManager: this.audioManager
});
```

### Phaser Version
Using **Phaser 3.80.0**.

## Key Files
- [src/index.js](src/index.js): App bootstrap, manager injection.
- [src/utils/LalelaGame.js](src/utils/LalelaGame.js): Base class. READ THIS FIRST.
- [src/scenes/GameMenuScene.js](src/scenes/GameMenuScene.js): Game selection menu.
- [src/games/AdjacentNumbers.js](src/games/AdjacentNumbers.js): Reference implementation.
