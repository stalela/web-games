# Game Tracking & Configuration Implementation Plan

## Status: Sprint 1 Complete ✅

### What's Now Working
1. **Session Tracking** - Sessions are created when games start
2. **Games API** - Returns all games with last_played, times_played, best_score
3. **Age-Based Filtering** - Games filtered by child's age
4. **JWT Auth Flow** - Parent portal → web-games with child token

### Verified via Testing
- Created 2+ GameSession records in database
- Games API returns 150+ games for 4-year-old child
- Session includes child, game, started_at, level info

---

## Current State Analysis

### What's Already Built ✅
1. **TrackingManager.js** - Handles API calls for session/event tracking
2. **LalelaGame.js** - Base class with tracking methods:
   - `startTrackingSession()` - Starts a session when game begins
   - `endTrackingSession()` - Ends session with score/completion status
   - `trackEvent(type, data)` - Generic event tracking
   - `trackCorrectAnswer()`, `trackWrongAnswer()`, `trackLevelComplete()`, `trackHintUsed()`
3. **Django API Endpoints**:
   - `POST /api/sessions/start/` - Start game session
   - `POST /api/sessions/{id}/events/` - Batch event submission
   - `POST /api/sessions/{id}/end/` - End session
   - `GET /api/children/{uuid}/games/` - Get games for child

### Current Issues 🔴
1. **Games not loading from API** - `fetchAndDisplayGames()` exists but API returns error
2. **Events not being stored** - API calls may be failing silently
3. **Game-specific events not implemented** - Each game needs custom event calls
4. **No parent dashboard for viewing activity** - Child profile shows static data

---

## Implementation Plan

### Phase 1: Fix Core Tracking Pipeline (Priority: HIGH)

#### TRACK-FIX-001: Debug & Fix Session Start API
**Files**: `api/views.py`, `src/utils/TrackingManager.js`
- Verify `SessionStartView` can find games by slug
- Add fallback to create session even if game not found in DB
- Test with actual game play

**Acceptance Criteria**:
- [ ] Session created when game starts
- [ ] Session ID returned and stored in TrackingManager
- [ ] Console shows "Session started: {id}"

#### TRACK-FIX-002: Fix Game Slug Mismatch  
**Files**: `src/utils/LalelaGame.js`
- ✅ Already fixed - converts CamelCase to snake_case
- Verify scene key `BabyKeyboardGame` → `baby_keyboard`

#### TRACK-FIX-003: Add CORS Headers for API Requests
**Files**: `lalela/settings.py`
- Verify CORS allows credentials and all needed headers
- Add `X-Child-Id` to allowed headers

---

### Phase 2: Games Loading from Backend (Priority: HIGH)

#### API-GAMES-001: Fix ChildGamesView Response Format
**Files**: `api/views.py`, `api/serializers.py`
- Ensure API returns fields expected by frontend:
  ```json
  {
    "scene_name": "BabyKeyboardGame",
    "name": "Baby Keyboard",
    "icon": "baby_keyboard.svg",
    "difficulty": 1,
    "category": "computer",
    "is_locked": false,
    "last_played": "2026-01-07T12:00:00Z",
    "best_score": 100
  }
  ```

#### API-GAMES-002: Add Game Configuration Fields
**Files**: `webapp/models.py`, migrations
- Add to Game model:
  - `scene_key` - Phaser scene name (e.g., "BabyKeyboardGame")
  - `config_json` - JSON field for game-specific settings
  - `tracked_events` - JSON list of event types this game tracks
  - `is_active` - Enable/disable from backend

#### API-GAMES-003: Frontend Uses API Games
**Files**: `src/scenes/GameMenuScene.js`
- Ensure `fetchAndDisplayGames()` is called in `create()`
- Map API response correctly
- Handle locked games visually

---

### Phase 3: Game-Specific Event Tracking (Priority: MEDIUM)

#### EVENTS-001: Define Standard Event Types
Create standard event schema for all games:

```javascript
// Event Types (stored in GameEvent.event_type)
const EVENT_TYPES = {
  // Session lifecycle
  'session_start': {},
  'session_end': { score, completed, duration },
  
  // Level progression
  'level_start': { level },
  'level_complete': { level, score, time_taken, attempts },
  'level_failed': { level, reason },
  
  // Answer events
  'correct_answer': { question, answer, time_taken, attempts },
  'wrong_answer': { question, given_answer, correct_answer, attempts },
  'answer_retry': { question, attempt_number },
  
  // Interactions
  'hint_used': { hint_type, hint_number },
  'item_dragged': { item_id, from_zone, to_zone, is_correct },
  'tile_placed': { tile_id, position, is_correct },
  'selection_made': { selected, is_correct },
  
  // Progress
  'checkpoint_reached': { checkpoint_id, score },
  'achievement_unlocked': { achievement_id },
  'game_paused': {},
  'game_resumed': {},
};
```

#### EVENTS-002: Update LalelaGame Base Class
**Files**: `src/utils/LalelaGame.js`
Add convenience methods:
```javascript
// Item-based games
trackItemDragged(itemId, fromZone, toZone, isCorrect) { }
trackTilePlaced(tileId, position, isCorrect) { }
trackSelectionMade(selected, isCorrect) { }

// Progress tracking
trackCheckpoint(checkpointId, score) { }
trackLevelFailed(level, reason) { }
trackAnswerRetry(question, attemptNumber) { }
```

#### EVENTS-003: Implement Tracking in DragDropGame
**Files**: `src/games/DragDropGame.js`
- Track each tile drop with `trackItemDragged()`
- Track level completion with attempts count
- ✅ Partially done - has `trackEvent('tile_dropped')`

#### EVENTS-004: Add Tracking to 10 Key Games
Priority games to add tracking:
1. `AdjacentNumbers` - Track number placements
2. `OrderingGame` - Track sequence attempts
3. `MemoryGame` variants - Track card flips, matches
4. `MathOperationsGame` - Track each answer
5. `AlphabetGame` variants - Track letter selections
6. `ClockGame` - Track time settings
7. `MazeGame` - Track path choices
8. `TangramGame` - Track piece placements
9. `SudokuGame` - Track number entries
10. `HangmanGame` - Track letter guesses

---

### Phase 4: Parent Dashboard - Activity View (Priority: MEDIUM)

#### DASHBOARD-001: Child Activity API
**Files**: `api/views.py`, `api/serializers.py`
```
GET /api/children/{uuid}/activity/
```
Returns:
```json
{
  "recent_sessions": [
    {
      "game_name": "Baby Keyboard",
      "played_at": "2026-01-07T12:00:00Z",
      "duration_seconds": 300,
      "score": 85,
      "completed": true,
      "level_reached": 3
    }
  ],
  "stats": {
    "total_games_played": 50,
    "total_time_minutes": 120,
    "favorite_category": "math",
    "streak_days": 5
  }
}
```

#### DASHBOARD-002: Update Child Detail Template
**Files**: `webapp/templates/webapp/parent/child_detail.html`
- Replace static "Weekly Achievements" with real data
- Show recent games played
- Show time spent per category
- Add progress charts

#### DASHBOARD-003: Progress Overview Page
**Files**: `webapp/views/progress.py`, templates
- Show competence profile (ELDA domains)
- Show badges earned
- Show activity timeline

---

### Phase 5: Game Configuration from Backend (Priority: LOW)

#### CONFIG-001: Game Settings Model
**Files**: `webapp/models.py`
```python
class GameConfig(models.Model):
    game = models.OneToOneField(Game, on_delete=models.CASCADE)
    config = models.JSONField(default=dict)
    # Example config:
    # {
    #   "levels": 10,
    #   "time_limit": 60,
    #   "show_hints": true,
    #   "hint_penalty": 10,
    #   "difficulty_scaling": 1.2
    # }
```

#### CONFIG-002: Per-Child Game Settings
**Files**: `webapp/models.py`
```python
class ChildGameSettings(models.Model):
    child = models.ForeignKey(Child)
    game = models.ForeignKey(Game)
    settings_override = models.JSONField(default=dict)
    # Parent can customize per child:
    # {
    #   "max_level": 5,
    #   "time_limit": 90,
    #   "hints_enabled": true
    # }
```

#### CONFIG-003: Frontend Loads Game Config
**Files**: `src/utils/LalelaGame.js`
```javascript
async loadGameConfig() {
  const config = await fetch(`/api/games/${gameSlug}/config/`);
  this.applyConfig(config);
}
```

---

## Implementation Order

### Sprint 1: Fix Core Pipeline (1-2 days)
1. TRACK-FIX-001: Fix session start API
2. TRACK-FIX-003: Fix CORS
3. API-GAMES-001: Fix games API response

### Sprint 2: Game Events (2-3 days)
1. EVENTS-001: Define event types
2. EVENTS-002: Update LalelaGame
3. EVENTS-004: Add tracking to 10 games

### Sprint 3: Parent Dashboard (2 days)
1. DASHBOARD-001: Activity API
2. DASHBOARD-002: Child detail page
3. DASHBOARD-003: Progress page

### Sprint 4: Configuration (1-2 days)
1. API-GAMES-002: Game config model
2. CONFIG-001, CONFIG-002, CONFIG-003

---

## Quick Wins to Start

1. **Test API manually** - Verify `/api/sessions/start/` works
2. **Add console logging** - See what's happening in TrackingManager
3. **Check browser Network tab** - See if requests are being made
4. **Verify CORS** - Check for CORS errors in console

Would you like me to start with Sprint 1 (fixing the core pipeline)?
