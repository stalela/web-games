# GCompris to Lalela Web Games - Migration Plan

> **Last Updated:** January 5, 2026
> **Total Games:** 199 | **Completed:** 190 | **Remaining:** 9
> **Progress:** ███████████████████ 95.4%

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

### ✅ Completed Games

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
| MemoryMathAddGame | Memory | MemoryGame | ✅ Complete |
| MemoryMathAddMinusGame | Memory | MemoryGame | ✅ Complete |
| HanoiGame | Strategy | LalelaGame | ✅ Complete |
| HanoiRealGame | Strategy | HanoiGame | ✅ Complete |
| FifteenGame | Strategy | LalelaGame | ✅ Complete |
| LightsOffGame | Strategy | LalelaGame | ✅ Complete |
| MazeGame | Strategy | LalelaGame | ✅ Complete |
| MazeInvisibleGame | Strategy | MazeGame | ✅ Complete |
| MazeRelativeGame | Strategy | MazeGame | ✅ Complete |
| TrafficGame | Strategy | LalelaGame | ✅ Complete |
| HangmanGame | Reading | LalelaGame | ✅ Complete |
| FractionsCreateGame | Math | LalelaGame | ✅ Complete |
| FractionsFindGame | Math | LalelaGame | ✅ Complete |
| CalcudokuGame | Math | LalelaGame | ✅ Complete |
| SudokuGame | Math | LalelaGame | ✅ Complete |
| MagicHatPlusGame | Math | LalelaGame | ✅ Complete |
| MagicHatMinusGame | Math | LalelaGame | ✅ Complete |
| ClockGame | Math | LalelaGame | ✅ Complete |
| CalendarGame | Math | LalelaGame | ✅ Complete |
| FindTheDayGame | Math | LalelaGame | ✅ Complete |
| BalanceBoxGame | Math | LalelaGame | ✅ Complete |
| GraduatedLineReadGame | Math | LalelaGame | ✅ Complete |
| GraduatedLineUseGame | Math | LalelaGame | ✅ Complete |
| LearnDecimalsGame | Math | LalelaGame | ✅ Complete |
| LearnDecimalsAdditionsGame | Math | LalelaGame | ✅ Complete |
| LearnDecimalsSubtractionsGame | Math | LalelaGame | ✅ Complete |
| ComparatorGame | Math | LalelaGame | ✅ Complete |
| GnumchEqualityGame | Math | LalelaGame | ✅ Complete |
| GnumchFactorsGame | Math | LalelaGame | ✅ Complete |
| GnumchInequalityGame | Math | LalelaGame | ✅ Complete |
| ImageNameGame | Reading | DragDropGame | ✅ Complete |
| ClickAndDrawGame | Computer | LalelaGame | ✅ Complete |
| LeftRightClickGame | Computer | LalelaGame | ✅ Complete |
| FollowLineGame | Computer | LalelaGame | ✅ Complete |
| DrawLettersGame | Reading | LalelaGame | ✅ Complete |
| CraneGame | Fun | LalelaGame | ✅ Complete |
| FootballGame | Fun | LalelaGame | ✅ Complete |
| BallCatchGame | Fun | LalelaGame | ✅ Complete |
| PenaltyGame | Fun | LalelaGame | ✅ Complete |
| BarGame | Strategy | LalelaGame | ✅ Complete |
| BarGame2Players | Strategy | LalelaGame | ✅ Complete |
| AlgorithmGame | Strategy | LalelaGame | ✅ Complete |
| FriezeGame | Strategy | LalelaGame | ✅ Complete |
| PaintingsGame | Fun | DragDropGame | ✅ Complete |
| MemoryMathAddMinusMultDivGame | Math | MemoryGame | ✅ Complete |
| MemoryMathAddTuxGame | Math | MemoryGame | ✅ Complete |
| MemoryMathDivGame | Math | MemoryGame | ✅ Complete |
| MemoryMathMinusGame | Math | MemoryGame | ✅ Complete |
| MemoryMathMultGame | Math | MemoryGame | ✅ Complete |
| MemoryMathMultDivGame | Math | MemoryGame | ✅ Complete |
| MemoryMathAddMinusTuxGame | Math | MemoryTuxGame | ✅ Complete |
| MemoryMathAddMinusMultDivTuxGame | Math | MemoryTuxGame | ✅ Complete |
| MemoryMathAddTuxGame | Math | MemoryTuxGame | ✅ Complete |
| MemoryMathDivTuxGame | Math | MemoryTuxGame | ✅ Complete |
| MemoryMathMinusTuxGame | Math | MemoryTuxGame | ✅ Complete |
| MemoryMathMultTuxGame | Math | MemoryTuxGame | ✅ Complete |
| MemoryMathMultDivTuxGame | Math | MemoryTuxGame | ✅ Complete |
| MemorySoundTuxGame | Memory | MemoryTuxGame | ✅ Complete |
| MemoryTuxGame | Memory | MemoryTuxGame | ✅ Complete |
| MemoryWordNumberGame | Reading | MemoryGame | ✅ Complete |
| OwareTwoPlayerGame | Strategy | OwareGame | ✅ Complete |
| PathEncodingGame | Discovery | PathEncodingGame | ✅ Complete |
| PathEncodingRelativeGame | Discovery | PathEncodingGame | ✅ Complete |
| PathDecodingRelativeGame | Discovery | PathDecodingGame | ✅ Complete |
| PlaneGame | Math | PlaneGame | ✅ Complete |
| PlayPianoGame | Discovery | PlayPianoGame | ✅ Complete |
| PlayRhythmGame | Discovery | PlayPianoGame | ✅ Complete |
| GraphColoringGame | Strategy | LalelaGame | ✅ Complete |
| GrammarAnalysisGame | Reading | LalelaGame | ✅ Complete |
| GrammarClassesGame | Reading | LalelaGame | ✅ Complete |
| GravityGame | Sciences | LalelaGame | ✅ Complete |
| ChronosGame | Sciences | DragDropGame | ✅ Complete |
| AnalogElectricityGame | Sciences | LalelaGame | ✅ Complete |
| DigitalElectricityGame | Sciences | LalelaGame | ✅ Complete |
| RenewableEnergyGame | Sciences | LalelaGame | ✅ Complete |
| BabyWordprocessorGame | Computer | LalelaGame | ✅ Complete |
| BinaryBulbGame | Math | LalelaGame | ✅ Complete |
| CategorizationGame | Discovery | LalelaGame | ✅ Complete |
| ChessPartyEndGame | Strategy | ChessGame | ✅ Complete |
| DrawingWheelsGame | Discovery | LalelaGame | ✅ Complete |
| GeoCountryGame | Geography | DragDropGame | ✅ Complete |
| MiningGame | Strategy | LalelaGame | ✅ Complete |
| MosaicGame | Discovery | LalelaGame | ✅ Complete |
| NumbersOddEvenGame | Math | LalelaGame | ✅ Complete |
| NumberSequenceGame | Math | LalelaGame | ✅ Complete |
| OrderingAlphabetsGame | Reading | LalelaGame | ✅ Complete |

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
| `fractions_create` | P2 | ✅ Complete | - |
| `fractions_find` | P2 | ✅ Complete | - |
| `calcudoku` | P2 | ✅ Complete | - |
| `sudoku` | P2 | ✅ Complete | - |
| `magic-hat-plus` | P2 | ✅ Complete | - |
| `magic-hat-minus` | P2 | ✅ Complete | - |
| `balancebox` | P3 | ✅ Complete | - |
| `graduated_line_read` | P3 | ✅ Complete | - |
| `graduated_line_use` | P3 | ✅ Complete | - |
| `learn_decimals` | P3 | ✅ Complete | - |
| `learn_decimals_additions` | P3 | ✅ Complete | - |
| `learn_decimals_subtractions` | P3 | ✅ Complete | - |
| `comparator` | P3 | ✅ Complete | - |
| `gnumch-equality` | P3 | ✅ Complete | - |
| `gnumch-factors` | P3 | ✅ Complete | - |
| `gnumch-inequality` | P3 | ✅ Complete | - |
| `gnumch-multiples` | P3 | ✅ Complete | - |
| `gnumch-primes` | P3 | ✅ Complete | - |
| `guess24` | P3 | ✅ Complete | - |
| `guessnumber` | P3 | ✅ Complete | - |
| `clockgame` | P2 | ✅ Complete | - |
| `calendar` | P2 | ✅ Complete | - |
| `find_the_day` | P2 | ✅ Complete | - |

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
| `hangman` | P2 | ✅ Complete | - |
| `gletters` | P2 | ✅ Complete | - |
| `imagename` | P2 | ✅ Complete | - |
| `lang` | P2 | ❌ Blocked (Missing Assets) | - |
| `braille_alphabets` | P3 | ✅ Complete | - |
| `braille_fun` | P3 | ✅ Complete | - |
| `louis-braille` | P3 | ✅ Complete | - |
| `grammar_analysis` | P3 | ✅ Complete | - |
| `grammar_classes` | P3 | ✅ Complete | - |

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
| `hanoi` | P2 | ✅ Complete | - |
| `hanoi_real` | P2 | ✅ Complete | - |
| `fifteen` | P2 | ✅ Complete | - |
| `lightsoff` | P2 | ✅ Complete | - |
| `maze` | P2 | ✅ Complete | - |
| `mazeinvisible` | P2 | ✅ Complete | - |
| `mazerelative` | P2 | ✅ Complete | - |
| `traffic` | P2 | ✅ Complete | - |
| `bargame` | P3 | ✅ Complete | - |
| `bargame_2players` | P3 | ✅ Complete | - |
| `graph-coloring` | P3 | ✅ Complete | - |
| `algorithm` | P3 | ✅ Complete | - |
| `frieze` | P3 | ✅ Complete | - |
| `nine_men_morris` | P2 | ✅ Complete | - |
| `nine_men_morris_2players` | P2 | ✅ Complete | - |

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
| `analog_electricity` | P3 | ✅ Complete | - |
| `digital_electricity` | P3 | ✅ Complete | - |
| `canal_lock` | P3 | ✅ Complete | - |
| `watercycle` | P3 | ✅ Complete | - |
| `solar_system` | P3 | ✅ Complete | - |
| `renewable_energy` | P3 | ✅ Complete | - |
| `gravity` | P3 | ✅ Complete | - |
| `chronos` | P3 | ✅ Complete | - |
| `family` | P2 | ✅ Complete | - |
| `family_find_relative` | P2 | ✅ Complete | - |
| `morse_code` | P2 | ✅ Complete | - |
| `note_names` | P2 | ✅ Complete | - |
| `piano_composition` | P2 | ✅ Complete | - |
| `programmingMaze` | P2 | ✅ Complete | - |
| `scalesboard_weight` | P2 | ✅ Complete | - |
| `scalesboard_weight_avoirdupois` | P2 | ✅ Complete | - |
| `sketch` | P2 | ✅ Complete | - |
| `submarine` | P2 | ✅ Complete | - |

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
| `clickanddraw` | P2 | ✅ Complete | - |
| `drawletters` | P2 | ✅ Complete | - |
| `drawnumbers` | P2 | ✅ Complete | - |
| `followline` | P2 | ✅ Complete | - |
| `left_right_click` | P2 | ✅ Complete | - |
| `leftright` | P2 | ✅ Complete | - |
| `baby_wordprocessor` | P3 | ✅ Complete | - |

---

### 🧸 Fun & Puzzles (~10 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `tangram` | P1 | ✅ Complete | - |
| `baby_tangram` | P1 | ✅ Complete | - |
| `paintings` | P1 | ✅ Complete | - |
| `babyshapes` | P1 | ✅ Complete | - |
| `crane` | P2 | ✅ Complete | - |
| `football` | P2 | ✅ Complete | - |
| `ballcatch` | P2 | ✅ Complete | - |
| `penalty` | P2 | ✅ Complete | - |
| `land_safe` | P3 | ✅ Complete | - |

---

### 🃏 Memory Games (~20 games)

| GCompris Activity | Priority | Status | Assigned |
|-------------------|----------|--------|----------|
| `memory` | P1 | ✅ Complete | - |
| `memory-sound` | P1 | ✅ Complete | - |
| `memory-case-association` | P2 | ✅ Complete | - |
| `memory-case-association-tux` | P2 | ✅ Complete | - |
| `memory-enumerate` | P2 | ✅ Complete | - |
| `memory-math-add` | P2 | ✅ Complete | - |
| `memory-math-add-minus` | P2 | ✅ Complete | - |
| `memory-math-add-minus-mult-div` | P3 | ✅ Complete | - |
| `memory-math-add-tux` | P3 | ✅ Complete | - |
| `memory-math-div` | P3 | ✅ Complete | - |
| `memory-math-minus` | P3 | ✅ Complete | - |
| `memory-math-mult` | P3 | ✅ Complete | - |
| `memory-math-mult-div` | P3 | ✅ Complete | - |

| `tens_complement_calculate` | P2 | ✅ Complete | - |
| `tens_complement_find` | P2 | ✅ Complete | - |
| `tens_complement_swap` | P2 | ✅ Complete | - |
| `tens_complement_use` | P2 | ✅ Complete | - |
| `vertical_subtraction` | P2 | ✅ Complete | - |
| `vertical_subtraction_compensation` | P2 | ✅ Complete | - |
| `money_back_cents` | P1 | ✅ Complete | - |

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
