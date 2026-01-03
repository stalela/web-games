# Lalela Web Games - AI Coding Agent Instructions

## Project Overview
Web-based educational games platform (199 target games) using **Phaser 3** game engine. Converting GCompris educational games to browser-based versions for the Lalela platform. Currently 15/199 games implemented (7.5% complete).

## Architecture

### Three-Tier Game Hierarchy
1. **LalelaGame** ([src/utils/LalelaGame.js](src/utils/LalelaGame.js)) - Base class for ALL games. Provides lifecycle management, performance monitoring, object pooling, and common UI.
2. **DragDropGame** ([src/games/DragDropGame.js](src/games/DragDropGame.js)) - Extends LalelaGame for drag-and-drop mechanics. Used by ~30% of games.
3. **Specific Games** (e.g., [src/games/AdjacentNumbers.js](src/games/AdjacentNumbers.js)) - Extend either LalelaGame or DragDropGame.

**Critical Pattern:** Games MUST override `createBackground()`, `createUI()`, and `setupGameLogic()` in that order. The base class handles the lifecycle orchestration.

### Manager Singleton Pattern
All manager classes in [src/utils/](src/utils/) are instantiated ONCE in [src/index.js](src/index.js) and injected into game scenes via `init(data)`. Never instantiate managers within game classes.

**Core Managers:**
- `AssetManager` - Handles asset preloading (currently minimal, games use programmatic graphics)
- `AudioManager` - Uses Howler.js, handles mobile audio unlock dance
- `UIManager` - Creates reusable UI components (modals, buttons, navigation)
- `GameManager` - Orchestrates game lifecycle and scene transitions
- `InputManager` - Unified touch/mouse/keyboard input handling
- `DataManager` - Local storage and progress tracking

### Application Entry Point
[src/index.js](src/index.js) initializes Phaser, registers ALL game scenes, and starts `GameMenuScene`. To add a new game:
1. Import the game class
2. Add `this.game.scene.add('GameName', GameClassName)` in init()
3. Register in GameMenuScene's `allGames` array with metadata (icon, category, difficulty)

## Development Workflows

### Running the App
```bash
npm start              # Dev server on :8081 with hot reload
npm run build          # Production build to dist/
npm run build:dev      # Dev build (unminified, with source maps)
```

### Testing Strategy
```bash
npm test                      # Jest unit tests
npm run test:comprehensive    # Full test suite with Puppeteer
npm run test:chrome           # Browser-specific testing
npm run benchmark             # Performance profiling
```

**Test Location:** `src/**/__tests__/**/*.test.js` - tests colocated with source code, not in root `test-*` files (those are automation scripts).

### Creating a New Game

1. **Extend the right base class:**
   ```javascript
   // For drag-and-drop mechanics:
   import { DragDropGame } from './DragDropGame.js';
   export class MyGame extends DragDropGame { ... }
   
   // For other game types:
   import { LalelaGame } from '../utils/LalelaGame.js';
   export class MyGame extends LalelaGame { ... }
   ```

2. **Implement required lifecycle methods:**
   ```javascript
   preload() {
     super.preload(); // ALWAYS call super first
     this.load.svg('my-asset', 'assets/my-asset.svg');
   }
   
   init(data) {
     super.init(data); // Receives injected managers
     // Setup game-specific initialization
   }
   
   createBackground() {
     // Create and position background elements
     this.background = this.add.image(...);
     this.background.setDepth(-1); // Keep backgrounds at depth -1
   }
   
   createUI() {
     // Create instruction text, score displays, navigation
     // Use UIManager for modal dialogs
   }
   
   setupGameLogic() {
     // Start game loop, spawn objects, begin level
     this.startGame();
   }
   ```

3. **Register in application:**
   - Import in [src/index.js](src/index.js)
   - Add scene to Phaser: `this.game.scene.add('MyGame', MyGame)`
   - Add metadata to [src/scenes/GameMenuScene.js](src/scenes/GameMenuScene.js) `allGames` array

## Project-Specific Conventions

### Brand Colors (from src/styles/brand.css)
Use these exact colors for consistency:
- **River Blue:** `0x0062FF` - Primary game elements
- **Aloe Green:** `0x00B378` - Success states, correct answers
- **Orange:** `0xF08A00` - Warnings, attention
- **Purple:** `0xA74BFF` - Bonus/special items

### Asset Loading Pattern
**99% of games use NO external assets** - they create graphics programmatically with Phaser primitives. Only reference assets in `assets/` if they actually exist. Check [src/utils/AssetManager.js](src/utils/AssetManager.js) manifest before loading.

### Z-Depth Convention
- `-1`: Backgrounds
- `0-9`: Game objects (default)
- `10-19`: UI elements
- `20+`: Modals and overlays

### Navigation Dock
All games should include bottom navigation with icons: exit, settings, help, home. Use `createNavigationDock()` method from base class or copy pattern from [src/games/AdjacentNumbers.js](src/games/AdjacentNumbers.js) lines 141-200.

### Audio Best Practices
- Always check if sound exists before playing: `if (this.audioManager.sounds.has('click')) { ... }`
- Mobile devices require user interaction to unlock audio - AudioManager handles this
- Use Howler.js for all audio (already integrated in AudioManager)

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
Using **Phaser 3.80.0** - check docs at https://photonstorm.github.io/phaser3-docs/ for API references.

## Key Files Reference
- **Main App:** [src/index.js](src/index.js) (458 lines) - Application bootstrap
- **Game Menu:** [src/scenes/GameMenuScene.js](src/scenes/GameMenuScene.js) (1313 lines) - Category-based game selection
- **Base Game Class:** [src/utils/LalelaGame.js](src/utils/LalelaGame.js) (591 lines) - All games inherit from this
- **Build Config:** [webpack.config.js](webpack.config.js) - Output to `dist/`, dev server on port 8081
- **Project Plan:** [lalela-web-games-project-plan.md](lalela-web-games-project-plan.md) - Full roadmap with 199 game descriptions
