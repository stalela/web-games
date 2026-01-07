# GCompris Game Restyle Implementation Plan

## Overview
This document serves as a template for restyling Lalela Web Games to match GCompris implementations. When provided with the necessary files and screenshots, follow this systematic approach to ensure visual and functional parity with GCompris.

---

## Required Inputs

### 1. GCompris Reference Folder
**Path Pattern:** `GCompris-qt-master/src/activities/{activity_name}/`

**Key Files to Analyze:**
- `{ActivityName}.qml` - Main game logic and layout
- `ActivityInfo.qml` - Metadata (difficulty, category, description)
- `resource/` - SVG assets, audio files, level data
- `*.js` - JavaScript logic files
- `resource/{level}/Data.qml` - Level-specific configurations

### 2. Current Implementation File
**Path Pattern:** `web-games/src/games/{GameName}.js`

### 3. Screenshots
- **Screenshot 1:** Current Lalela implementation (shows what we have)
- **Screenshot 2:** GCompris golden standard (shows what we need to match)

---

## Implementation Checklist

### Phase 1: Asset Analysis & Setup

#### 1.1 Background Assets
- [ ] Identify GCompris background SVG (`background.svg`, `hillside.svg`, etc.)
- [ ] Check if asset exists in `web-games/src/assets/{game}/`
- [ ] Copy missing assets from GCompris `resource/` folder
- [ ] Note background styling (fill mode, transparency, layering)

```bash
# Copy assets command pattern
cp GCompris-qt-master/src/activities/{activity}/resource/*.svg web-games/src/assets/{game}/
cp GCompris-qt-master/src/activities/{activity}/resource/*.wav web-games/src/assets/{game}/
```

#### 1.2 Audio Assets
- [ ] List all sound effects used (click, success, wrong, level-specific)
- [ ] Copy audio files to appropriate asset folder
- [ ] Note audio trigger points in game flow

#### 1.3 Icon Assets
- [ ] Verify navigation icons exist: `bar_home.svg`, `bar_help.svg`, `bar_reload.svg`, `bar_previous.svg`, `bar_next.svg`, `bar_config.svg`
- [ ] Check for game-specific icons

---

### Phase 2: Visual Styling Analysis

#### 2.1 Color Palette
Extract from GCompris QML files:

| Element | GCompris Color | Hex Value |
|---------|---------------|-----------|
| Primary Text | - | - |
| Secondary Text | - | - |
| Button Primary | - | - |
| Button Secondary | - | - |
| Background | - | - |
| Accent | - | - |

**Common GCompris Colors:**
- Orange text: `#d2611d` or `#F08A00`
- Green (OK/Success): `#00B378` or `#2ECC71`
- Blue (Home): `#4FC3F7` or `#0062FF`
- Purple (Config): `#9C6ADE` or `#AB47BC`
- White panels: `#FFFFFF` with `0.9-0.95` opacity

#### 2.2 Typography
- [ ] Font family (GCompris uses system fonts, we use `Arial` or `Fredoka One`)
- [ ] Font sizes for: title, instructions, labels, buttons
- [ ] Font weights (bold, normal)
- [ ] Text alignment and origins

#### 2.3 Layout Dimensions
From GCompris QML, note:
- [ ] Panel widths/heights (often as percentage of screen)
- [ ] Margins and padding (`GCStyle.baseMargins`)
- [ ] Spacing between elements
- [ ] Corner radius for rounded elements

---

### Phase 3: Navigation Bar Implementation

#### 3.1 GCompris Navigation Bar Pattern
GCompris uses circular buttons at bottom-left with level navigation:

```
[Config] [Help] [Home] [<Prev] {Level#} [Next>] [Menu]
```

#### 3.2 Standard Button Configuration
```javascript
const controls = [
    { icon: 'help', action: 'help', color: 0x00B378 },      // Green
    { icon: 'home', action: 'home', color: 0x4FC3F7 },      // Cyan
    { icon: 'bar_prev', action: 'prev', color: 0xF08A00 },  // Orange
    // Level number text goes here
    { icon: 'bar_next', action: 'next', color: 0xF08A00 },  // Orange
    { icon: 'config', action: 'menu', color: 0x9C6ADE }     // Purple
];
```

#### 3.3 Button Styling
- **Shape:** Circular (`fillCircle`)
- **Size:** 60-70px diameter
- **Border:** 3px white stroke
- **Icon:** White tint, 55% of button size
- **Spacing:** 80-100px between centers

---

### Phase 4: UI Components

#### 4.1 Progress Indicator
- [ ] Position: Usually top-right or near OK button
- [ ] Format: `{current}/{total}` (e.g., "0/3")
- [ ] Styling: White rounded rectangle with subtle border

#### 4.2 Score/Character Badge
- [ ] Position: Bottom-right or top-right
- [ ] Elements: Character image + score number
- [ ] GCompris uses `child.svg` or `tux.svg`

#### 4.3 OK Button
- [ ] Shape: Large green circle
- [ ] Text: "OK" in white bold
- [ ] Position: Right side of main game area
- [ ] Size: ~80-100px diameter

#### 4.4 Hint Button
- [ ] Shape: Orange circle with lightbulb icon
- [ ] Position: Near OK button
- [ ] Visibility: Only when hints available

---

### Phase 5: Game-Specific Elements

#### 5.1 Main Game Container
- [ ] Background color (usually white or light cream)
- [ ] Border styling (color, width, radius)
- [ ] Position relative to screen
- [ ] Size constraints

#### 5.2 Interactive Elements
- [ ] Default state appearance
- [ ] Selected/active state appearance
- [ ] Hover effects (if applicable)
- [ ] Animation on interaction

#### 5.3 Level Data Structure
From GCompris `resource/{level}/Data.qml`:
- [ ] Number of levels
- [ ] Sublevels per level
- [ ] Difficulty progression
- [ ] Data ranges/values per level

---

### Phase 6: Code Implementation

#### 6.1 Class Structure
```javascript
import { LalelaGame } from '../utils/LalelaGame.js';

export class {GameName} extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: '{GameName}',
            title: '{Game Title}',
            description: '{Description}',
            category: '{category}'
        });
        // Game-specific properties
    }

    preload() {
        super.preload();
        // Load GCompris background
        this.load.svg('{bg-key}', 'assets/{game}/background.svg');
        // Load navigation icons
        // Load game-specific assets
        // Load audio files
    }

    createBackground() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, '{bg-key}')
            .setDisplaySize(width, height)
            .setDepth(-2);
    }

    createUI() {
        super.createUI();
        this.createNavigationDock();
        // Create game-specific UI
    }

    createNavigationDock() {
        // Implement GCompris-style circular button bar
    }

    setupGameLogic() {
        // Initialize game state
        // Create game elements
        // Start first level
    }

    // Game-specific methods...
}
```

#### 6.2 Audio Manager Pattern
```javascript
playSound(key) {
    if (this.audioManager) {
        this.audioManager.playSound(key);
    } else {
        try { this.sound.play(key); } catch (e) {}
    }
}
```

#### 6.3 Help Modal Pattern
```javascript
showHelpModal() {
    if (this.helpModal) return;
    const { width, height } = this.scale;
    this.helpModal = this.add.container(width / 2, height / 2).setDepth(200);
    // Overlay, panel, title, instructions, close button
}
```

---

### Phase 7: Testing & Validation

#### 7.1 Visual Comparison Checklist
- [ ] Background matches GCompris
- [ ] Navigation bar position and styling matches
- [ ] Colors match GCompris palette
- [ ] Font sizes are proportionally similar
- [ ] Element spacing is consistent
- [ ] Interactive states look correct

#### 7.2 Functional Testing
- [ ] All navigation buttons work (Home, Help, Reload, Levels)
- [ ] Level progression works correctly
- [ ] Score/progress updates properly
- [ ] Audio plays at correct moments
- [ ] Win/lose conditions trigger appropriately

#### 7.3 Completion Workflow
**DO NOT run `npm run build` after restyling.** Instead, push changes directly to GitHub for CI/CD pipeline validation:

```bash
cd web-games
git add -A
git commit -m "Restyle {GameName} to match GCompris implementation"
git push
```

The Vercel deployment will automatically build and validate the changes.

---

## Common Patterns & Gotchas

### Pattern 1: Null Checks for Parent Properties
Always check if parent class properties exist before using:
```javascript
if (this.instructionText) {
    this.instructionText.setText('...');
}
```

### Pattern 2: Depth Management
- `-2 to -1`: Background layers
- `0-9`: Game objects
- `10-19`: UI elements
- `20+`: Modals and overlays
- `100+`: Navigation dock
- `200+`: Help modals

### Pattern 3: Responsive Sizing
Use percentages of screen dimensions:
```javascript
const { width, height } = this.scale;
const panelWidth = Math.min(600, width * 0.8);
const buttonSize = Math.min(70, width * 0.05);
```

### Pattern 4: Interactive Element Setup
```javascript
element.setInteractive({ useHandCursor: true });
element.on('pointerdown', () => this.handleClick());
element.on('pointerover', () => this.handleHover());
element.on('pointerout', () => this.handleHoverOut());
```

---

## File Locations Reference

| Asset Type | GCompris Location | Web Games Location |
|------------|-------------------|-------------------|
| Backgrounds | `activities/{name}/resource/*.svg` | `src/assets/{name}/*.svg` |
| Sounds | `activities/{name}/resource/*.wav` | `src/assets/{name}/*.wav` |
| Nav Icons | `core/resource/*.svg` | `src/assets/game-icons/*.svg` |
| Game Code | `activities/{name}/{Name}.qml` | `src/games/{Name}.js` |

---

## Commit Message Template

```
Restyle {GameName} to match GCompris implementation

- Update background to use GCompris {background}.svg
- Implement GCompris-style navigation bar with circular buttons
- Match color palette (orange text, green OK, etc.)
- Add proper level progression with {X} levels
- Fix layout to match GCompris positioning
- Add audio feedback for {actions}
- Implement help modal with game instructions
```

---

## Quick Start Prompt

When ready to implement, use this prompt format:

```
Restyle {GameName} to match GCompris golden standard.

**Provided:**
1. GCompris folder: {folder_path}
2. Current implementation: {js_file_path}
3. Screenshot 1: Current implementation
4. Screenshot 2: GCompris target

**Key differences to fix:**
- {List specific visual differences from screenshots}

**Requirements:**
- Match background exactly
- Match navigation bar style (circular buttons)
- Match color palette
- Match element positioning and sizing
- Implement proper level structure
- Add audio feedback
- Add help system
```
