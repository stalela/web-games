# GCompris to Lalela Web Games - Migration Plan

> **Last Updated:** January 3, 2026
> **Total Games:** 199 | **Completed:** 59 | **Remaining:** 140
> **Progress:** ██████░░░░ 29.6%

---

## 📋 Table of Contents
1. [Homage Standard](#-homage-standard)
2. [Standard Porting Checklist](#-standard-porting-checklist)
3. [Migration Backlog by Category](#-migration-backlog-by-category)
4. [Phase Roadmap](#-phase-roadmap)

---

## 🎨 Homage Standard

Every ported game must faithfully replicate the original GCompris activity. This is not a "reimagining" — it is an **homage**.

### Visual Fidelity
| Aspect | Requirement |
|--------|-------------|
| **Colors** | Match the original color palette exactly. Extract hex values from SVG assets or QML files. |
| **Layout** | Preserve element positioning and proportions. Use percentage-based positioning for responsiveness. |
| **Assets** | Copy original SVG/PNG assets from `GCompris-qt-master/src/activities/[game]/resource/`. |
| **Typography** | Use similar fonts (Fredoka One as primary, fallback to system fonts). |
| **Animations** | Replicate timing and easing of original animations. |

### Logical Fidelity
| Aspect | Requirement |
|--------|-------------|
| **Game Rules** | Identical to original. No modifications unless fixing bugs. |
| **Level Progression** | Same number of levels, same difficulty curve. Copy level data from `.js` files. |
| **Scoring** | Same scoring logic and feedback (stars, sounds, messages). |
| **Win/Lose Conditions** | Exact match to original behavior. |

### When in Doubt
**Request a screenshot** of the original game from the user. Do not guess at visual design.

---

## ✅ Standard Porting Checklist

Copy this checklist for each new game task.

```markdown
### [GameName] Porting Checklist

#### Phase 1: Analysis & Setup
- [ ] Read `ActivityInfo.qml` for metadata (category, difficulty, description)
- [ ] Read `[GameName].qml` and `[GameName].js` for logic
- [ ] List all assets in `resource/` folder
- [ ] Decide base class: `LalelaGame` | `DragDropGame`
- [ ] Create `src/games/[GameName].js` from template

#### Phase 2: Asset Migration
- [ ] Copy SVG/PNG assets to `src/assets/game-icons/` or `src/assets/[game-name]/`
- [ ] Copy sound files to `src/assets/sounds/`
- [ ] Verify all assets load in browser (check console for 404s)

#### Phase 3: Core Implementation
- [ ] Implement `preload()` - load all assets
- [ ] Implement `createBackground()` - static scene (depth: -1)
- [ ] Implement `createUI()` - instructions, score, navigation dock
- [ ] Implement `setupGameLogic()` - game rules and interactions
- [ ] Implement level data and progression

#### Phase 4: Polish & Integration
- [ ] Add sound effects (click, success, fail, level complete)
- [ ] Test touch/mouse input on mobile viewport
- [ ] Test window resize / responsive scaling
- [ ] Register in `src/index.js` (scene registration)
- [ ] Register in `src/scenes/GameMenuScene.js` (allGames array)
- [ ] Run `npm test` to verify no regressions

#### Phase 5: Commit & Push
- [ ] Update this MIGRATION_PLAN.md (increment completed count, move game to completed table)
- [ ] Stage all changes: `git add -A`
- [ ] Commit with descriptive message: `git commit -m "Add [GameName] - [brief description]"`
- [ ] Push to GitHub: `git push origin main`
```

---

## 📦 Migration Backlog by Category

### ✅ Completed Games (19)

| Game | Category | Base Class | Status |
|------|----------|------------|--------|
| AdjacentNumbers | Math | DragDropGame | ✅ Complete |
| EnumerateGame | Math | LalelaGame | ✅ Complete |
| Guesscount | Math | LalelaGame | ✅ Complete |
| LearnAdditionsGame | Math | LalelaGame | ✅ Complete |
| LearnDigitsGame | Math | LalelaGame | ✅ Complete |
| LearnQuantitiesGame | Math | LalelaGame | ✅ Complete |
| LearnSubtractionsGame | Math | LalelaGame | ✅ Complete |
| SmallnumbersGame | Math | LalelaGame | ✅ Complete |
| Smallnumbers2Game | Math | LalelaGame | ✅ Complete |
| VerticalAdditionGame | Math | LalelaGame | ✅ Complete |
| AlgebraPlusGame | Math | AlgebraGame | ✅ Complete |
| AlgebraMinusGame | Math | AlgebraGame | ✅ Complete |
| AlgebraByGame | Math | AlgebraGame | ✅ Complete |
| AlgebraDivGame | Math | AlgebraGame | ✅ Complete |
| MoneyGame | Math | MoneyGame | ✅ Complete |
| MoneyCentsGame | Math | MoneyGame | ✅ Complete |
| MoneyBackGame | Math | MoneyGame | ✅ Complete |
| ClickOnLetterGame | Reading | ClickOnLetterGame | ✅ Complete |
| ClickOnLetterUpGame | Reading | ClickOnLetterGame | ✅ Complete |
| AlphabetSequenceGame | Reading | LalelaGame | ✅ Complete |
| CheckersGame | Strategy | LalelaGame | ✅ Complete |
| HexagonGame | Logic | LalelaGame | ✅ Complete |
| MemoryGame | Memory | LalelaGame | ✅ Complete |
| MemoryImageGame | Memory | LalelaGame | ✅ Complete |
| MemorySoundGame | Memory | LalelaGame | ✅ Complete |
| BabyMatchGame | Discovery | DragDropGame | ✅ Complete |
| ColorMixGame | Discovery | LalelaGame | ✅ Complete |
| SoundButtonGame | Discovery | LalelaGame | ✅ Complete |
| GeographyMapGame | Geography | LalelaGame | ✅ Complete |
| ColorsGame | Discovery | LalelaGame | ✅ Complete |
| AdvancedColorsGame | Discovery | LalelaGame | ✅ Complete |
| ColorMixPaintGame | Discovery | LalelaGame | ✅ Complete |
| ColorMixLightGame | Discovery | LalelaGame | ✅ Complete |
| ExploreMonumentsGame | Discovery | LalelaGame | ✅ Complete |
| ExploreWorldMusicGame | Discovery | LalelaGame | ✅ Complete |
| InstrumentsGame | Discovery | LalelaGame | ✅ Complete |
| BabyKeyboardGame | Computer | LalelaGame | ✅ Complete |
| BabyMouseGame | Computer | LalelaGame | ✅ Complete |
| ClickGame | Computer | LalelaGame | ✅ Complete |
| EraseGame | Computer | LalelaGame | ✅ Complete |
| EraseClickGame | Computer | LalelaGame | ✅ Complete |

---

### 🔢 Mathematics (~50 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `algebra_plus` | P1 | ✅ Complete | - |
| `algebra_minus` | P1 | ✅ Complete | - |
| `algebra_by` | P1 | ✅ Complete | - |
| `algebra_div` | P1 | ✅ Complete | - |
| `money` | P1 | ✅ Complete | - |
| `money_back` | P1 | ✅ Complete | - |
| `money_cents` | P1 | ✅ Complete | - |
| `fractions_create` | P2 | ⬜ Not Started | - |
| `fractions_find` | P2 | ⬜ Not Started | - |
| `calcudoku` | P2 | ⬜ Not Started | - |
| `sudoku` | P2 | ⬜ Not Started | - |
| `magic-hat-plus` | P2 | ⬜ Not Started | - |
| `magic-hat-minus` | P2 | ⬜ Not Started | - |
| `balancebox` | P3 | ⬜ Not Started | - |
| `graduated_line_read` | P3 | ⬜ Not Started | - |
| `graduated_line_use` | P3 | ⬜ Not Started | - |
| `learn_decimals` | P3 | ⬜ Not Started | - |
| `learn_decimals_additions` | P3 | ⬜ Not Started | - |
| `learn_decimals_subtractions` | P3 | ⬜ Not Started | - |
| `comparator` | P3 | ⬜ Not Started | - |
| `gnumch-equality` | P3 | ⬜ Not Started | - |
| `gnumch-factors` | P3 | ⬜ Not Started | - |
| `gnumch-inequality` | P3 | ⬜ Not Started | - |
| `gnumch-multiples` | P3 | ⬜ Not Started | - |
| `gnumch-primes` | P3 | ⬜ Not Started | - |
| `guess24` | P3 | ⬜ Not Started | - |
| `guessnumber` | P3 | ⬜ Not Started | - |
| `clockgame` | P2 | ⬜ Not Started | - |
| `calendar` | P2 | ⬜ Not Started | - |
| `find_the_day` | P2 | ⬜ Not Started | - |

---

### 📖 Reading & Language (~40 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `alphabet-sequence` | P1 | ✅ Complete | - |
| `click_on_letter` | P1 | ✅ Complete | - |
| `click_on_letter_up` | P1 | ✅ Complete | - |
| `letter-in-word` | P1 | ✅ Complete | - |
| `missing-letter` | P1 | ✅ Complete | - |
| `readingh` | P1 | ✅ Complete | - |
| `readingv` | P1 | ✅ Complete | - |
| `wordsgame` | P1 | ✅ Complete | - |
| `hangman` | P2 | ⬜ Not Started | - |
| `gletters` | P2 | ⬜ Not Started | - |
| `imagename` | P2 | ⬜ Not Started | - |
| `lang` | P2 | ⬜ Not Started | - |
| `braille_alphabets` | P3 | ⬜ Not Started | - |
| `braille_fun` | P3 | ⬜ Not Started | - |
| `louis-braille` | P3 | ⬜ Not Started | - |
| `grammar_analysis` | P3 | ⬜ Not Started | - |
| `grammar_classes` | P3 | ⬜ Not Started | - |

---

### 🧩 Logic & Strategy (~35 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `align4` | P1 | ✅ Complete | - |
| `align4_2players` | P1 | ✅ Complete | - |
| `chess` | P1 | ✅ Complete | - |
| `chess_2players` | P1 | ✅ Complete | - |
| `tic_tac_toe` | P1 | ✅ Complete | - |
| `tic_tac_toe_2players` | P1 | ✅ Complete | - |
| `hanoi` | P2 | ⬜ Not Started | - |
| `hanoi_real` | P2 | ⬜ Not Started | - |
| `fifteen` | P2 | ⬜ Not Started | - |
| `lightsoff` | P2 | ⬜ Not Started | - |
| `maze` | P2 | ⬜ Not Started | - |
| `mazeinvisible` | P2 | ⬜ Not Started | - |
| `mazerelative` | P2 | ⬜ Not Started | - |
| `traffic` | P2 | ⬜ Not Started | - |
| `bargame` | P3 | ⬜ Not Started | - |
| `bargame_2players` | P3 | ⬜ Not Started | - |
| `graph-coloring` | P3 | ⬜ Not Started | - |
| `algorithm` | P3 | ⬜ Not Started | - |
| `frieze` | P3 | ⬜ Not Started | - |

---

### 🔬 Discovery & Science (~30 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `colors` | P1 | ✅ Complete | - |
| `advanced_colors` | P1 | ✅ Complete | - |
| `color_mix` | P1 | ✅ Complete | - |
| `color_mix_light` | P1 | ✅ Complete | - |
| `explore_farm_animals` | P1 | ✅ Complete | - |
| `explore_world_animals` | P1 | ✅ Complete | - |
| `explore_monuments` | P2 | ✅ Complete | - |
| `explore_world_music` | P2 | ✅ Complete | - |
| `instruments` | P2 | ✅ Complete | - |
| `melody` | P2 | ✅ Complete | - |
| `analog_electricity` | P3 | ⬜ Not Started | - |
| `digital_electricity` | P3 | ⬜ Not Started | - |
| `canal_lock` | P3 | ✅ Complete | - |
| `watercycle` | P3 | ✅ Complete | - |
| `solar_system` | P3 | ✅ Complete | - |
| `renewable_energy` | P3 | ⬜ Not Started | - |
| `gravity` | P3 | ⬜ Not Started | - |
| `chronos` | P3 | ⬜ Not Started | - |
| `family` | P2 | ✅ Complete | - |
| `family_find_relative` | P2 | ✅ Complete | - |

---

### 🖱️ Computer Skills (~15 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `baby_keyboard` | P1 | ✅ Complete | - |
| `baby_mouse` | P1 | ✅ Complete | - |
| `clickgame` | P1 | ✅ Complete | - |
| `erase` | P1 | ✅ Complete | - |
| `erase_clic` | P1 | ✅ Complete | - |
| `erase_2clic` | P1 | ✅ Complete | - |
| `clickanddraw` | P2 | ⬜ Not Started | - |
| `drawletters` | P2 | ⬜ Not Started | - |
| `drawnumbers` | P2 | ⬜ Not Started | - |
| `followline` | P2 | ⬜ Not Started | - |
| `left_right_click` | P2 | ⬜ Not Started | - |
| `leftright` | P2 | ⬜ Not Started | - |
| `baby_wordprocessor` | P3 | ⬜ Not Started | - |

---

### 🧸 Fun & Puzzles (~10 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `tangram` | P1 | ✅ Complete | - |
| `baby_tangram` | P1 | ✅ Complete | - |
| `puzzle` | P1 | ⬜ Not Started | - |
| `babyshapes` | P1 | ✅ Complete | - |
| `crane` | P2 | ⬜ Not Started | - |
| `football` | P2 | ⬜ Not Started | - |
| `ballcatch` | P2 | ⬜ Not Started | - |
| `land_safe` | P3 | ⬜ Not Started | - |

---

### 🃏 Memory Games (~20 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `memory` | P1 | ✅ Complete | - |
| `memory-sound` | P1 | ✅ Complete | - |
| `memory-case-association` | P2 | ✅ Complete | - |
| `memory-case-association-tux` | P2 | ✅ Complete | - |
| `memory-enumerate` | P2 | ✅ Complete | - |
| `memory-math-add` | P2 | ⬜ Not Started | - |
| `memory-math-add-minus` | P2 | ⬜ Not Started | - |
| `memory-math-add-minus-mult-div` | P3 | ⬜ Not Started | - |
| `memory-math-add-tux` | P3 | ⬜ Not Started | - |
| `memory-math-div` | P3 | ⬜ Not Started | - |
| `memory-math-minus` | P3 | ⬜ Not Started | - |
| `memory-math-mult` | P3 | ⬜ Not Started | - |
| `memory-math-mult-div` | P3 | ⬜ Not Started | - |

---

## 🗓️ Phase Roadmap

### Phase 2: Mathematics Mastery (Current)
**Goal:** Port all P1 Math games (algebra, money, time)
**Timeline:** Weeks 1-8
**Games:** ~15

### Phase 3: Language & Reading
**Goal:** Port all P1 Language games (alphabet, reading, words)
**Timeline:** Weeks 9-16
**Games:** ~12
**Requirement:** Create `WordGame` base class for text handling

### Phase 4: Logic & Strategy
**Goal:** Port board games (chess, connect4, tic-tac-toe)
**Timeline:** Weeks 17-24
**Games:** ~10
**Requirement:** Integrate AI libraries (chess.js, minimax)

### Phase 5: Discovery & Science
**Goal:** Port simulation games (electricity, water cycle)
**Timeline:** Weeks 25-32
**Games:** ~15
**Requirement:** Physics engine integration (Box2D)

### Phase 6: Computer Skills & Puzzles
**Goal:** Port remaining games
**Timeline:** Weeks 33-40
**Games:** ~20

### Phase 7: Polish & QA
**Goal:** Full regression testing, performance optimization
**Timeline:** Weeks 41-52

---

## 📝 Notes

- **Priority Legend:** P1 = Critical (must have), P2 = Important, P3 = Nice to have
- **Status Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked
- **GCompris Source:** `c:\Users\HomePC\Documents\GCompris-qt-master\GCompris-qt-master\src\activities\`
- **See Also:** [agent-instructions.md](agent-instructions.md) for detailed porting guidelines
