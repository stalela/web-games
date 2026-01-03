# Agent Instructions for GCompris to Lalela Web Games Porting

## Objective
Replicate or clone a specific GCompris activity into the Lalela Web Games project using Phaser 3. The goal is to create a faithful "homage" to the original game, preserving its logic, style, and assets while adapting it to the web architecture.

## Source Material
The source code for the original GCompris games is located in:
`c:\Users\HomePC\Documents\GCompris-qt-master\GCompris-qt-master\src\activities\[activity_name]`

### Files to Analyze
1.  **Logic**: Look for `.js` files (e.g., `adjacent_numbers.js`) and `.qml` files (e.g., `Adjacent_numbers.qml`). These contain the game rules, level data, and interaction logic.
2.  **UI/Layout**: The `.qml` files define the visual structure. Pay attention to positioning, colors, and element hierarchy.
3.  **Assets**:
    *   Look in the `resource/` subdirectory of the activity folder.
    *   Look for `.svg` or image files in the activity root.
    *   *Note*: Some common assets might be in shared GCompris folders, but focus on the activity-specific ones first.

## Implementation Steps

### 1. Asset Migration
*   **Identify**: List all images, sounds, and data files used by the original activity.
*   **Copy**: Copy necessary assets to the `web-games/src/assets/` directory (organize into subfolders like `game-icons`, `sounds`, etc., if needed).
*   **Format**: Ensure assets are web-compatible (SVG, PNG, MP3/OGG).

### 2. Logic Replication
*   **Analyze**: Read the GCompris `.js` and `.qml` files to understand:
    *   Game states (start, playing, win, lose).
    *   Level progression and difficulty settings.
    *   Scoring and feedback mechanisms.
*   **Implement**: Translate this logic into the Phaser game class.
    *   Use the `LalelaGame` or `DragDropGame` base classes.
    *   Implement `init()`, `preload()`, `create()`, and `update()` (if needed).
    *   **Crucial**: Replicate the exact rules and behavior of the original game.

### 3. UI & Style (The "Homage")
*   **Visual Fidelity**: The web version should look and feel like the original GCompris activity.
*   **CSS/Styling**:
    *   Use Phaser's game objects (Images, Text, Shapes) to recreate the UI.
    *   Match colors, fonts, and layout proportions.
    *   **Reference**: See `src/games/AdjacentNumbers.js` for how to structure the UI using `createBackground()` and `createUI()`.
*   **Responsiveness**: Ensure the UI scales correctly for different screen sizes (handled partly by the base class, but check element positioning).

### 4. Reference Implementation
*   **Gold Standard**: Use `src/games/AdjacentNumbers.js` as the primary example of a correct implementation.
*   **Structure**:
    *   Extend `LalelaGame` or `DragDropGame`.
    *   Load assets in `preload()`.
    *   Setup UI in `createUI()`.
    *   Setup background in `createBackground()`.

## Requesting Help
*   **Screenshots**: If the visual design or layout is unclear from the code alone, **request screenshots** of the original game from the user. Do not guess at the design if it's ambiguous.

---

## Related Documents
*   **[MIGRATION_PLAN.md](MIGRATION_PLAN.md)** - Master task list with all 199 games, status tracking, and phase roadmap.
*   **[lalela-web-games-project-plan.md](lalela-web-games-project-plan.md)** - Original project specification and game descriptions.
