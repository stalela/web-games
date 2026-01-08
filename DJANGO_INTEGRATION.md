# Web Games - Django Integration Guide

> Reference for AI agents integrating web-games frontend with Django backend

## API Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000/api/` |
| Production | `https://api.lalela.org/api/` |

---

## Authentication Flow

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Django Login   │────▶│  Child Select   │────▶│   Web Games      │
│  /webapp/login/  │     │ /webapp/select/ │     │ localhost:8081   │
└──────────────────┘     └─────────────────┘     └──────────────────┘
                                  │                       │
                                  │  child_token in URL   │
                                  └───────────────────────┘
                                            │
                                            ▼
                          ┌─────────────────────────────────┐
                          │  Frontend stores token in       │
                          │  localStorage, includes in all  │
                          │  API requests                   │
                          └─────────────────────────────────┘
```

1. Parent logs in via Django (`/webapp/login/`)
2. Parent selects child (`/webapp/select-child/`)
3. Django redirects to web-games with `child_token` param
4. Frontend stores token in `localStorage`
5. All API calls include `Authorization: Bearer {token}`

---

## Key Integration Points

### AuthManager (`src/utils/AuthManager.js`)

```javascript
import { authManager } from './utils/AuthManager.js';

// Check if authenticated
const isAuthenticated = await authManager.initialize();

// Get child ID for API calls
const childId = authManager.getChildId();

// Get token for Authorization header
const token = authManager.getToken();

// Redirect to Django login
authManager.redirectToLogin();
```

**Methods:**
| Method | Description |
|--------|-------------|
| `initialize()` | Check URL params for token, validate, store |
| `getChildId()` | Returns active child UUID |
| `getToken()` | Returns JWT token for API calls |
| `isAuthenticated()` | Returns boolean |
| `redirectToLogin()` | Navigate to Django login page |
| `logout()` | Clear session, redirect |

---

### TrackingManager (`src/utils/TrackingManager.js`)

```javascript
import { trackingManager } from './utils/TrackingManager.js';

// In game's create() method
await trackingManager.startSession('adjacent_numbers', 1);

// During gameplay
trackingManager.trackEvent('answer_correct', {
  question: '3 + 2',
  answer: 5,
  response_time_ms: 2500
});

// When leaving game
await trackingManager.endSession();
```

**Methods:**
| Method | Description |
|--------|-------------|
| `startSession(gameSlug, level)` | Create session, get session_id |
| `trackEvent(type, data)` | Queue event for batch send |
| `updateProgress(level, score)` | Update session progress |
| `endSession()` | Flush events, end session |
| `flushEventQueue()` | Force send queued events |

**Batching:**
- Events queued locally
- Auto-flush every 30 seconds or 10 events
- Manual flush on `endSession()`

---

### BadgeManager (`src/utils/BadgeManager.js`)

```javascript
import { badgeManager } from './utils/BadgeManager.js';

// Check for new badges (call after session ends)
const newBadges = await badgeManager.checkForNewBadges();

// Display badge notification
if (newBadges.length > 0) {
  badgeManager.showBadgeNotification(newBadges[0]);
}
```

---

## GameMenuScene Changes

The menu scene must fetch games from API instead of using hardcoded list.

### Before (Hardcoded)
```javascript
// src/scenes/GameMenuScene.js
this.allGames = [
  { scene: 'AdjacentNumbers', name: 'Adjacent Numbers', ... },
  // ... hardcoded list
];
```

### After (API-Driven)
```javascript
// src/scenes/GameMenuScene.js
async create() {
  super.create();
  
  // Show loading
  this.showLoadingSpinner();
  
  // Fetch from API
  this.allGames = await this.fetchChildGames();
  
  // Build menu
  this.buildGameGrid();
}

async fetchChildGames() {
  const childId = this.authManager?.getChildId();
  if (!childId) {
    return this.getFallbackGames(); // Offline fallback
  }
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/children/${childId}/games/`,
      {
        headers: {
          'Authorization': `Bearer ${this.authManager.getToken()}`
        }
      }
    );
    return response.json();
  } catch (error) {
    console.warn('API fetch failed, using fallback');
    return this.getFallbackGames();
  }
}

getFallbackGames() {
  // Return cached games or static list for offline mode
  return JSON.parse(localStorage.getItem('cached_games') || '[]');
}
```

---

## LalelaGame Base Class Integration

### Session Lifecycle

```javascript
// src/utils/LalelaGame.js

create() {
  super.create();
  this.createBackground();
  this.createUI();
  this.setupGameLogic();
  
  // START SESSION
  this.initializeTracking();
}

async initializeTracking() {
  if (this.trackingManager && this.gameSlug) {
    await this.trackingManager.startSession(
      this.gameSlug,
      this.currentLevel || 1
    );
  }
}

// Call this method from games when events occur
trackEvent(eventType, eventData = {}) {
  if (this.trackingManager) {
    this.trackingManager.trackEvent(eventType, {
      ...eventData,
      level: this.currentLevel
    });
  }
}

// Override shutdown to end session
shutdown() {
  if (this.trackingManager) {
    this.trackingManager.endSession();
  }
  super.shutdown();
}
```

---

## Event Types to Track

### Answer Events
```javascript
// Correct answer
this.trackEvent('answer_correct', {
  question: '5 + 3',
  answer: 8,
  response_time_ms: 1500
});

// Wrong answer
this.trackEvent('answer_wrong', {
  question: '5 + 3',
  answer: 7,
  expected: 8,
  response_time_ms: 2000
});
```

### Level Events
```javascript
// Level complete
this.trackEvent('level_complete', {
  score: 150,
  accuracy: 0.85,
  time_seconds: 45
});

// Game complete
this.trackEvent('game_complete', {
  total_score: 850,
  levels_completed: 5,
  total_time_seconds: 320
});
```

### Interaction Events
```javascript
// Hint used
this.trackEvent('hint_used', { hint_number: 1 });

// Tile dropped (DragDropGame)
this.trackEvent('tile_dropped', {
  tile_value: 5,
  expected_value: 5,
  correct: true,
  zone_index: 2
});

// Object clicked
this.trackEvent('object_clicked', {
  object_id: 'apple_3',
  correct: true
});
```

---

## API Error Handling

```javascript
async apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authManager.getToken()}`,
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      // Token expired
      this.authManager.redirectToLogin();
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return null;
    }
    
    return response.json();
  } catch (error) {
    // Network error - queue for offline
    if (this.offlineQueue) {
      this.offlineQueue.add({ endpoint, options });
    }
    return null;
  }
}
```

---

## Offline Support

### Service Worker Strategy
- **Static assets**: Cache-first (games, images, sounds)
- **API responses**: Network-first with cache fallback
- **Events**: Queue in IndexedDB, sync when online

### OfflineQueue (`src/utils/OfflineQueue.js`)

```javascript
import { offlineQueue } from './utils/OfflineQueue.js';

// Queue an event when offline
offlineQueue.add({
  type: 'event',
  endpoint: '/sessions/abc123/events/',
  payload: { events: [...] }
});

// Sync when back online
window.addEventListener('online', () => {
  offlineQueue.sync();
});
```

---

## Environment Variables

Create `.env` file (not committed):

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_DJANGO_LOGIN_URL=http://localhost:8000/webapp/login/
```

Access in code:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

---

## Testing Integration

### Mock Auth for Development
```javascript
// src/utils/AuthManager.js

// In development, allow mock auth
if (process.env.NODE_ENV === 'development' && !token) {
  this.mockAuth();
}

mockAuth() {
  this.childId = 'dev-child-uuid';
  this.token = 'mock-dev-token';
  console.warn('Using mock authentication for development');
}
```

### API Mocking
Use MSW (Mock Service Worker) for API mocking in tests:

```javascript
// src/tests/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/children/:id/games/', (req, res, ctx) => {
    return res(ctx.json({ results: mockGames }));
  }),
  
  rest.post('/api/sessions/start/', (req, res, ctx) => {
    return res(ctx.json({ session_id: 'mock-session-id' }));
  }),
];
```

---

## Files to Create/Modify

| File | Status | Purpose |
|------|--------|---------|
| `src/utils/AuthManager.js` | Create | Authentication handling |
| `src/utils/TrackingManager.js` | Create | Session & event tracking |
| `src/utils/BadgeManager.js` | Create | Badge notifications |
| `src/utils/OfflineQueue.js` | Create | Offline event queue |
| `src/utils/ApiClient.js` | Create | Centralized API calls |
| `src/scenes/GameMenuScene.js` | Modify | API-driven game list |
| `src/utils/LalelaGame.js` | Modify | Session lifecycle |
| `src/index.js` | Modify | Auth initialization |
| `public/service-worker.js` | Create | PWA offline support |
| `public/manifest.json` | Create | PWA manifest |
