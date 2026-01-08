# Lalela Integration - Implementation Tasks

> **Purpose**: Granular tasks suitable for AI coding agents (GitHub Copilot, Claude, etc.)
> Each task is a single commit-sized unit of work.

## 🎉 Implementation Complete!

All tasks in this plan have been successfully implemented:

| Phase | Tasks | Status |
|-------|-------|--------|
| **ENV** | ENV-001 to ENV-005 | ✅ Complete |
| **CTX** | CTX-001 to CTX-003 | ✅ Complete |
| **AUTH** | AUTH-001 to AUTH-004 | ✅ Complete |
| **FILTER** | FILTER-001 to FILTER-004 | ✅ Complete |
| **TRACK** | TRACK-001 to TRACK-006 | ✅ Complete |
| **COMP** | COMP-001 to COMP-005 | ✅ Complete |
| **BADGE** | BADGE-001 to BADGE-006 | ✅ Complete |
| **PWA** | PWA-001 to PWA-004 | ✅ Complete |
| **GAME** | GAME-001 to GAME-003 | ✅ Complete |

**Key Files Created/Modified:**
- Django: `api/` app, `domain_core/`, adapters, models, views, serializers
- Frontend: `AuthManager.js`, `TrackingManager.js`, `BadgeManager.js`, `OfflineQueue.js`
- PWA: `service-worker.js`, `manifest.json`
- Scripts: `scripts/export-games.js`, `scripts/sync-games.sh`
- Docs: `DJANGO_INTEGRATION.md`, `API_REFERENCE.md`

---

## Prerequisites & Environment Setup

### ENV-001: Install Django REST Framework and JWT Dependencies
**Assignee**: AI Agent
**Complexity**: Low
**Files**: `lalela/requirements.txt`

```bash
# Add to requirements.txt:
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
```

**Acceptance Criteria**:
- [x] Dependencies added to requirements.txt
- [x] `pip install -r requirements.txt` succeeds
- [x] No version conflicts

---

### ENV-002: Configure Django REST Framework Settings
**Assignee**: AI Agent
**Complexity**: Low
**Files**: `lalela/lalela/settings.py`

**Changes**:
```python
INSTALLED_APPS = [
    # ... existing
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'api',  # New app
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add before CommonMiddleware
    # ... existing
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]
CORS_ALLOW_CREDENTIALS = True
```

**Acceptance Criteria**:
- [x] DRF settings configured
- [x] CORS configured for dev server
- [x] JWT settings added

---

### ENV-003: Create Django API App Structure
**Assignee**: AI Agent
**Complexity**: Low
**Files**: New `lalela/api/` directory

```bash
cd lalela
python manage.py startapp api
```

Create structure:
```
api/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── views.py
├── urls.py
├── adapters/
│   ├── __init__.py
│   └── .gitkeep
└── migrations/
    └── __init__.py
```

**Acceptance Criteria**:
- [x] API app created
- [x] App registered in INSTALLED_APPS
- [x] Basic urls.py with empty urlpatterns

---

### ENV-004: Create Domain Core Directory Structure
**Assignee**: AI Agent
**Complexity**: Low
**Files**: New `lalela/domain_core/` directory

Create pure Python domain structure (no Django imports):
```
domain_core/
├── __init__.py
├── competence/
│   ├── __init__.py
│   ├── calculator.py      # Empty with docstring
│   └── elda_domains.py    # Empty with docstring
├── observation/
│   ├── __init__.py
│   └── aggregator.py      # Empty with docstring
├── gamification/
│   ├── __init__.py
│   └── badge_rules.py     # Empty with docstring
└── ports/
    ├── __init__.py
    ├── content_port.py    # Protocol definitions
    ├── identity_port.py   # Protocol definitions
    └── observation_port.py # Protocol definitions
```

**Acceptance Criteria**:
- [x] Directory structure created
- [x] All `__init__.py` files present
- [x] Port protocols defined as abstract interfaces

---

### ENV-005: Create Frontend Scripts Directory
**Assignee**: AI Agent
**Complexity**: Low
**Files**: New `web-games/scripts/` directory

```
scripts/
├── export-games.js        # Game registry export
└── sync-games.sh          # Sync to Django
```

**Acceptance Criteria**:
- [x] Scripts directory created
- [x] Placeholder scripts with usage comments

---

## Context Files for AI Agents

### CTX-001: Create Agent Context - Django API
**Assignee**: Human/AI Agent
**Complexity**: Low
**Files**: `lalela/.github/copilot-instructions.md`

Create context file for AI agents working on Django:

```markdown
# Lalela Django Backend - AI Agent Instructions

## Project Overview
Django 4.2 backend for Lalela educational platform.
- Parents onboard and manage children
- Children play educational games (served by web-games frontend)
- System tracks gameplay and builds competence profiles

## Architecture (Hexagonal)
- `domain_core/` - Pure Python business logic (NO Django imports!)
- `api/` - Django REST Framework endpoints (adapters)
- `webapp/` - Models and Django Admin CMS

## Key Models (webapp/models.py)
- `ParentProfile` - Extends Django User
- `Child` - UUID-based, linked to parent
- `Game` - Inherits from Content, has difficulty/section
- `ChildContentPermission` - Per-child game access

## Conventions
- Use UUID for child IDs
- All API endpoints under `/api/`
- Domain logic must not import Django
- Views are thin - delegate to domain_core

## Commands
```bash
python manage.py runserver     # Dev server :8000
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```
```

**Acceptance Criteria**:
- [x] Context file created
- [x] Covers architecture, models, conventions

---

### CTX-002: Create Agent Context - API Endpoints Reference
**Assignee**: AI Agent
**Complexity**: Low
**Files**: `lalela/API_REFERENCE.md`

Document all planned API endpoints:

```markdown
# Lalela API Reference

## Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login/ | Parent login, returns JWT |
| POST | /api/auth/refresh/ | Refresh access token |
| POST | /api/auth/logout/ | Invalidate tokens |
| GET | /api/auth/me/ | Current user info |

## Children
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/children/ | List parent's children |
| GET | /api/children/{uuid}/ | Get child details |
| POST | /api/children/{uuid}/select/ | Set active child |

## Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/games/ | List games (filtered by child) |
| GET | /api/games/{slug}/ | Game details |
| GET | /api/games/catalog/ | Full catalog for parent |

## Sessions & Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/sessions/start/ | Start game session |
| PATCH | /api/sessions/{uuid}/ | Update session |
| POST | /api/sessions/{uuid}/end/ | End session |
| POST | /api/sessions/{uuid}/events/ | Log events |

## Progress & Competence
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/children/{uuid}/progress/ | Overall progress |
| GET | /api/children/{uuid}/competence/ | Competence profile |
| GET | /api/children/{uuid}/badges/ | Earned badges |

## Permissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/children/{uuid}/permissions/ | Game permissions |
| POST | /api/children/{uuid}/permissions/ | Bulk update |
```

**Acceptance Criteria**:
- [x] All endpoints documented
- [x] Request/response examples for key endpoints

---

### CTX-003: Create Agent Context - Frontend Integration
**Assignee**: AI Agent
**Complexity**: Low
**Files**: `web-games/DJANGO_INTEGRATION.md`

```markdown
# Web Games - Django Integration Guide

## API Base URL
- Development: `http://localhost:8000/api/`
- Production: `https://api.lalela.org/api/`

## Authentication Flow
1. Parent logs in via Django (`/webapp/login/`)
2. On child select, Django sets `child_token` in URL params
3. Frontend stores token in localStorage
4. All API calls include `Authorization: Bearer {token}`

## Key Integration Points

### AuthManager (src/utils/AuthManager.js)
- `initialize()` - Check for valid session
- `getChildId()` - Returns active child UUID
- `redirectToLogin()` - Redirect to Django login

### TrackingManager (src/utils/TrackingManager.js)
- `startSession(gameSlug)` - Call when game starts
- `trackEvent(type, data)` - Log gameplay events
- `endSession()` - Call when leaving game

### GameMenuScene Changes
- Fetch games from `/api/children/{id}/games/`
- Show locked icon for premium games
- Add filter/sort UI

## Event Types to Track
- `answer_correct` / `answer_wrong`
- `level_complete`
- `hint_used`
- `tile_dropped` (drag-drop games)
```

**Acceptance Criteria**:
- [x] Integration points documented
- [x] Event types listed

---

## Phase 0: Game Registration

### GAME-001: Create Game Export Script
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `web-games/scripts/export-games.js`

Parse `GameMenuScene.js` and export all games to JSON:

```javascript
const fs = require('fs');
const path = require('path');

// Read GameMenuScene.js and extract allGames array
// Transform to Django-compatible format
// Write to games-export.json
```

**Acceptance Criteria**:
- [x] Script extracts all ~200 games from GameMenuScene.js
- [x] Output JSON matches Game model fields
- [x] Includes: game_slug, title, difficulty, section, age_range
- [x] Run: `node scripts/export-games.js`

---

### GAME-002: Create Django Import Command
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/webapp/management/commands/import_games.py`

```python
from django.core.management.base import BaseCommand
from webapp.models import Game
import json

class Command(BaseCommand):
    help = 'Import games from web-games export'
    
    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str)
    
    def handle(self, *args, **options):
        # Load JSON, create/update Game objects
        pass
```

**Acceptance Criteria**:
- [x] Command creates/updates Game objects
- [x] Handles duplicates (update_or_create)
- [x] Reports created/updated counts
- [x] Run: `python manage.py import_games games-export.json`

---

### GAME-003: Sync Games to Database
**Assignee**: Human (one-time)
**Complexity**: Low
**Files**: None (runtime task)

```bash
# In web-games/
node scripts/export-games.js

# Copy to lalela/
cp games-export.json ../lalela/

# In lalela/
python manage.py import_games games-export.json
```

**Acceptance Criteria**:
- [x] All ~200 games exist in Django database
- [x] Games visible in Django Admin

---

## Phase 1: Authentication

### AUTH-001: Create JWT Auth Endpoints
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/views.py`, `lalela/api/urls.py`, `lalela/api/serializers.py`

Implement:
- `POST /api/auth/login/` - Returns access + refresh tokens
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Current user info

**Acceptance Criteria**:
- [x] Login returns JWT tokens
- [x] Refresh extends session
- [x] /me/ returns parent profile

---

### AUTH-002: Create Child Session Endpoints
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/views.py`, `lalela/api/models.py`

Implement:
- `GET /api/children/` - List parent's children
- `POST /api/children/{uuid}/select/` - Set active child, return child token

**Acceptance Criteria**:
- [x] Children list only shows parent's children
- [x] Select returns child-specific token
- [x] Token includes child_id claim

---

### AUTH-003: Create Frontend AuthManager
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `web-games/src/utils/AuthManager.js`

```javascript
export class AuthManager {
  constructor() { ... }
  async initialize() { ... }
  getChildId() { ... }
  getToken() { ... }
  redirectToLogin() { ... }
}
```

**Acceptance Criteria**:
- [x] Reads child_token from URL params
- [x] Stores session in localStorage
- [x] Redirects to Django login if no session
- [x] Exports singleton instance

---

### AUTH-004: Integrate Auth Check in index.js
**Assignee**: AI Agent
**Complexity**: Low
**Files**: `web-games/src/index.js`

Add auth check before Phaser game starts:

```javascript
import { authManager } from './utils/AuthManager.js';

async init() {
  const isAuthenticated = await authManager.initialize();
  if (!isAuthenticated) return; // Redirected to login
  
  // Continue with Phaser setup...
}
```

**Acceptance Criteria**:
- [x] Games don't load without auth
- [x] Unauthenticated users redirected to Django
- [x] Child ID available to all scenes

---

## Phase 1.5: Game Filtering

### FILTER-001: Create Filtered Games API Endpoint
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/views.py`

Implement `GET /api/children/{uuid}/games/`:
- Filter by age range
- Filter by parent permissions
- Filter by subscription tier
- Return game list with metadata

**Acceptance Criteria**:
- [x] Only age-appropriate games returned
- [x] Disabled games excluded
- [x] Premium games marked but included

---

### FILTER-002: Modify GameMenuScene to Fetch from API
**Assignee**: AI Agent
**Complexity**: High
**Files**: `web-games/src/scenes/GameMenuScene.js`

Replace hardcoded `allGames` with API fetch:

```javascript
async create() {
  this.allGames = await this.fetchChildGames();
  // ... rest of create
}

async fetchChildGames() {
  const childId = this.authManager?.getChildId();
  const response = await fetch(`/api/children/${childId}/games/`);
  return response.json();
}
```

**Acceptance Criteria**:
- [x] Games fetched from API
- [x] Fallback to local list if API fails
- [x] Loading state shown while fetching

---

### FILTER-003: Add Filter UI to GameMenuScene
**Assignee**: AI Agent
**Complexity**: High
**Files**: `web-games/src/scenes/GameMenuScene.js`

Add filter bar with:
- Difficulty filter (Easy/Medium/Hard)
- Category filter chips
- Sort dropdown

**Acceptance Criteria**:
- [x] Filter chips toggle active state
- [x] Game grid updates on filter change
- [x] Sort changes game order

---

### FILTER-004: Create Parent Permission Management API
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/views.py`

Implement:
- `GET /api/children/{uuid}/permissions/` - List all game permissions
- `POST /api/children/{uuid}/permissions/` - Bulk update

**Acceptance Criteria**:
- [x] Returns all games with enabled/disabled status
- [x] Bulk update modifies ChildContentPermission

---

## Phase 2: Activity Tracking

### TRACK-001: Create GameSession Model
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/models.py`

```python
class GameSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    child = models.ForeignKey(Child, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    level_started = models.PositiveIntegerField(default=1)
    level_reached = models.PositiveIntegerField(default=1)
    score = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    device_type = models.CharField(max_length=50, blank=True)
```

**Acceptance Criteria**:
- [x] Model created with all fields
- [x] Migrations generated and applied
- [x] Admin registered

---

### TRACK-002: Create GameEvent Model
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/models.py`

```python
class GameEvent(models.Model):
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.PositiveIntegerField(null=True)
    event_data = models.JSONField(default=dict)
```

**Acceptance Criteria**:
- [x] Model created
- [x] Indexed on (session, event_type)
- [x] Admin registered

---

### TRACK-003: Create Session API Endpoints
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/views.py`

Implement:
- `POST /api/sessions/start/` - Create session
- `PATCH /api/sessions/{uuid}/` - Update score/level
- `POST /api/sessions/{uuid}/end/` - End session
- `POST /api/sessions/{uuid}/events/` - Batch log events

**Acceptance Criteria**:
- [x] Start returns session_id
- [x] Events saved in batch
- [x] End calculates duration

---

### TRACK-004: Create Frontend TrackingManager
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `web-games/src/utils/TrackingManager.js`

```javascript
export class TrackingManager {
  constructor() { ... }
  async startSession(gameSlug, level) { ... }
  async trackEvent(eventType, eventData) { ... }
  async endSession() { ... }
  async flushEventQueue() { ... }
}
```

**Acceptance Criteria**:
- [x] Queues events for batch sending
- [x] Flushes on 10 events or 30 seconds
- [x] Handles offline gracefully

---

### TRACK-005: Integrate Tracking in LalelaGame.js
**Assignee**: AI Agent
**Complexity**: High
**Files**: `web-games/src/utils/LalelaGame.js`

Add to base class:
- `startSession()` in `create()`
- `trackEvent()` method
- `endSession()` on scene shutdown

**Acceptance Criteria**:
- [x] All games automatically track sessions
- [x] Events include level and timestamp
- [x] Clean shutdown ends session

---

### TRACK-006: Add Tracking to DragDropGame
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `web-games/src/games/DragDropGame.js`

Track tile drops:
```javascript
handleDropInZone(tile, zone) {
  this.trackEvent('tile_dropped', {
    tile_value: tile.value,
    expected_value: zone.expectedValue,
    correct: tile.value === zone.expectedValue
  });
}
```

**Acceptance Criteria**:
- [x] All drag-drop events tracked
- [x] Includes correct/incorrect flag

---

## Phase 3: Competence Profiles

### COMP-001: Create ELDA Domain Definitions
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/domain_core/competence/elda_domains.py`

Define ELDA domains as pure Python (no Django):

```python
from dataclasses import dataclass
from typing import List

@dataclass
class ELDADomain:
    code: str
    name: str
    description: str
    skills: List[str]
    game_categories: List[str]

ELDA_DOMAINS = [
    ELDADomain(
        code='elda4',
        name='Exploring Mathematics',
        description='Number concepts and operations',
        skills=['counting', 'addition', 'subtraction', 'number_recognition'],
        game_categories=['math']
    ),
    # ... more domains
]
```

**Acceptance Criteria**:
- [x] All 6 ELDA domains defined
- [x] Skills listed per domain
- [x] No Django imports

---

### COMP-002: Create Port Interfaces
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/domain_core/ports/observation_port.py`

```python
from typing import Protocol, List
from datetime import datetime

class ObservationPort(Protocol):
    def get_sessions(self, child_id: str, game_ids: List[str], since: datetime) -> List[dict]: ...
    def get_events(self, session_ids: List[str], event_type: str) -> List[dict]: ...
```

**Acceptance Criteria**:
- [x] Protocol interfaces defined
- [x] Type hints complete
- [x] No Django imports

---

### COMP-003: Create Django Observation Adapter
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/adapters/observation_adapter.py`

Implement `ObservationPort` using Django ORM:

```python
class DjangoObservationAdapter:
    def get_sessions(self, child_id, game_ids, since):
        return list(GameSession.objects.filter(...).values())
```

**Acceptance Criteria**:
- [x] Implements all port methods
- [x] Uses Django ORM
- [x] Returns dicts, not model instances

---

### COMP-004: Create CompetenceCalculator (Domain Core)
**Assignee**: AI Agent
**Complexity**: High
**Files**: `lalela/domain_core/competence/calculator.py`

Pure Python competence scoring:

```python
class CompetenceCalculator:
    def __init__(self, observation_port, mapping_port):
        ...
    
    def calculate_competence(self, child_id, competence_slug):
        # Pure business logic, no Django
        ...
```

**Acceptance Criteria**:
- [x] Pure Python (no Django imports)
- [x] Uses dependency injection via ports
- [x] Returns CompetenceResult dataclass

---

### COMP-005: Create Competence API Endpoint
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/views.py`

Wire domain logic with Django adapters:

```python
class ChildCompetenceView(APIView):
    def get(self, request, child_uuid):
        calculator = CompetenceCalculator(
            observation_port=DjangoObservationAdapter(),
            mapping_port=DjangoMappingAdapter()
        )
        result = calculator.calculate_competence(str(child_uuid), 'numeracy')
        return Response(...)
```

**Acceptance Criteria**:
- [x] Returns competence profile
- [x] Includes all ELDA domains
- [x] Shows skill breakdown

---

## Phase 4: Gamification

### BADGE-001: Create Badge Model
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/models.py`

Create Badge and ChildBadge models per INTEGRATION_PLAN.md spec.

**Acceptance Criteria**:
- [x] Badge model with criteria JSONField
- [x] ChildBadge with earned_at timestamp
- [x] Admin registered with list filters

---

### BADGE-002: Create Badge Definitions Fixture
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/fixtures/badges.json`

Seed data for ~20 starter badges across categories.

**Acceptance Criteria**:
- [x] Exploration badges (first game, 10 games, etc.)
- [x] Streak badges (3, 7, 30 days)
- [x] Competence badges (per ELDA domain)

---

### BADGE-003: Create BadgeAwardService (Domain Core)
**Assignee**: AI Agent
**Complexity**: High
**Files**: `lalela/domain_core/gamification/badge_rules.py`

Pure Python badge award logic:

```python
class BadgeAwardService:
    def check_all_badges(self, child_stats: dict, earned_badges: List[str]) -> List[str]:
        # Returns list of newly earned badge slugs
        ...
```

**Acceptance Criteria**:
- [x] Checks all badge criteria
- [x] Pure Python (no Django)
- [x] Returns newly earned badges

---

### BADGE-004: Create Badge API Endpoints
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/views.py`

Implement:
- `GET /api/children/{uuid}/badges/` - All earned badges
- `GET /api/children/{uuid}/badges/unseen/` - New badges
- `POST /api/badges/{id}/seen/` - Mark as seen

**Acceptance Criteria**:
- [x] Returns badge details with earned_at
- [x] Unseen badges for notifications
- [x] Mark seen updates ChildBadge

---

### BADGE-005: Create Frontend BadgeManager
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `web-games/src/utils/BadgeManager.js`

Badge notification display per INTEGRATION_PLAN.md spec.

**Acceptance Criteria**:
- [x] Fetches unseen badges
- [x] Shows animated notification
- [x] Marks badges as seen

---

### BADGE-006: Create ChildLevel Model
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `lalela/api/models.py`

XP and leveling system:

```python
class ChildLevel(models.Model):
    child = models.OneToOneField(Child)
    current_level = models.PositiveIntegerField(default=1)
    current_xp = models.PositiveIntegerField(default=0)
    total_xp = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveIntegerField(default=0)
```

**Acceptance Criteria**:
- [x] XP calculation method
- [x] Level-up logic
- [x] Streak tracking

---

## Phase 5: PWA & Offline

### PWA-001: Create Service Worker
**Assignee**: AI Agent
**Complexity**: High
**Files**: `web-games/public/service-worker.js`

Offline caching strategy per INTEGRATION_PLAN.md.

**Acceptance Criteria**:
- [x] Caches static assets
- [x] Network-first for API
- [x] Cache fallback for offline

---

### PWA-002: Create PWA Manifest
**Assignee**: AI Agent
**Complexity**: Low
**Files**: `web-games/public/manifest.json`

```json
{
  "name": "Lalela Games",
  "short_name": "Lalela",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0062FF",
  "background_color": "#FFFFFF",
  "icons": [...]
}
```

**Acceptance Criteria**:
- [x] Valid PWA manifest
- [x] Icons for all sizes
- [x] Installable on mobile

---

### PWA-003: Create Offline Event Queue
**Assignee**: AI Agent
**Complexity**: Medium
**Files**: `web-games/src/utils/OfflineQueue.js`

IndexedDB-based queue for offline events.

**Acceptance Criteria**:
- [x] Stores events when offline
- [x] Syncs when online
- [x] Clears after successful sync

---

### PWA-004: Register Service Worker in index.js
**Assignee**: AI Agent
**Complexity**: Low
**Files**: `web-games/src/index.js`

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

**Acceptance Criteria**:
- [x] SW registered on load
- [x] Update notification shown

---

## MCP Servers & Tools Needed

### Tool Requirements

| Tool | Purpose | Setup |
|------|---------|-------|
| **Django Dev Server** | Backend API | `python manage.py runserver` |
| **Webpack Dev Server** | Frontend games | `npm start` (port 8081) |
| **PostgreSQL** | Production database | Docker or local install |
| **Redis** (optional) | Caching/sessions | For production |

### Recommended VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-python.python",
    "github.copilot",
    "github.copilot-chat",
    "batisteo.vscode-django",
    "ms-vscode.js-debug"
  ]
}
```

### MCP Server Configuration

For AI agents to access both projects:

```json
// .vscode/settings.json (workspace)
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "file": "web-games/.github/copilot-instructions.md"
    },
    {
      "file": "lalela/.github/copilot-instructions.md"
    }
  ]
}
```

---

## Task Dependencies Graph

```
ENV-001 ──┬── ENV-002 ──┬── ENV-003 ──┬── GAME-001
          │             │             │
          │             └── ENV-004   └── GAME-002 ── GAME-003
          │
          └── CTX-001 ──┬── CTX-002
                        └── CTX-003

GAME-003 ──┬── AUTH-001 ── AUTH-002 ── AUTH-003 ── AUTH-004
           │
           └── FILTER-001 ── FILTER-002 ── FILTER-003

AUTH-004 ── TRACK-001 ── TRACK-002 ── TRACK-003 ── TRACK-004 ── TRACK-005

TRACK-005 ── COMP-001 ── COMP-002 ── COMP-003 ── COMP-004 ── COMP-005

TRACK-005 ── BADGE-001 ── BADGE-002 ── BADGE-003 ── BADGE-004 ── BADGE-005

BADGE-005 ── PWA-001 ── PWA-002 ── PWA-003 ── PWA-004
```

---

## Suggested Sprint Assignments

### Sprint 1 (Week 1-2): Foundation
- ENV-001 through ENV-005
- CTX-001 through CTX-003
- GAME-001 through GAME-003

### Sprint 2 (Week 3-4): Authentication
- AUTH-001 through AUTH-004
- FILTER-001

### Sprint 3 (Week 5-6): Filtering & Tracking
- FILTER-002 through FILTER-004
- TRACK-001 through TRACK-003

### Sprint 4 (Week 7-8): Tracking Integration
- TRACK-004 through TRACK-006
- COMP-001, COMP-002

### Sprint 5 (Week 9-10): Competence & Badges
- COMP-003 through COMP-005
- BADGE-001 through BADGE-004

### Sprint 6 (Week 11-12): Gamification & PWA
- BADGE-005, BADGE-006
- PWA-001 through PWA-004

---

## How to Use This Document with AI Agents

### GitHub Copilot Coding Agent
Reference a task ID when creating an issue:
```
Title: [AUTH-001] Create JWT Auth Endpoints
Body: Implement per IMPLEMENTATION_TASKS.md AUTH-001 spec.
```

### Claude/ChatGPT
```
I'm working on task TRACK-004 from IMPLEMENTATION_TASKS.md.
Create TrackingManager.js per the specification.
```

### Manual Verification
Each task has acceptance criteria checkboxes. Verify before committing.
