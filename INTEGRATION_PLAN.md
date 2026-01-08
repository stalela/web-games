# Lalela Web Games + Django Backend Integration Plan

## Executive Summary

This document outlines the integration of the Lalela Web Games (Phaser 3 frontend) with the Django backend for:
1. **Authentication** - Parents authenticate children to access games
2. **Activity Tracking** - Record game sessions, scores, time spent, levels completed
3. **Competence Profiles** - Build learning profiles from gameplay data (aligned with ELDA domains)

---

## Architectural Foundation

### Hexagonal Architecture (Ports & Adapters)

Following the established Lalela architecture principles, we maintain separation between:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DJANGO ADAPTERS                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Django Admin│  │ DRF API     │  │ ORM/DB      │              │
│  │ (CMS UI)    │  │ (Web API)   │  │ (Postgres)  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         ▼                ▼                ▼                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PORT INTERFACES                       │    │
│  │   ContentPort  │  IdentityPort  │  ObservationPort      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN CORE (Pure Python)                  │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│   │ Competence   │   │ Observation  │   │ Activity     │       │
│   │ Calculator   │   │ Aggregator   │   │ Matcher      │       │
│   └──────────────┘   └──────────────┘   └──────────────┘       │
│                                                                 │
│   Business Logic: ELDA scoring, NCF taxonomy, progression       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND ADAPTERS                           │
│   ┌─────────────────┐        ┌─────────────────────────────┐   │
│   │ Phaser 3 Games  │        │ Service Worker (PWA)        │   │
│   │ (Web Games)     │◄──────►│ Offline Cache + Sync        │   │
│   └─────────────────┘        └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principle: Django as Adapter, Not Core

> ⚠️ **Critical:** Keep business logic in `/domain_core/` as pure Python (no Django imports). Django Views/Models are **adapters** only. This enables future mobile app reuse.

### File Structure (Django Side)

```
lalela/
├── domain_core/                    # ← PURE PYTHON (No Django!)
│   ├── __init__.py
│   ├── competence/
│   │   ├── calculator.py          # ELDA proficiency scoring
│   │   ├── elda_domains.py        # Domain definitions
│   │   └── progression.py         # Level/skill progression
│   ├── observation/
│   │   ├── aggregator.py          # Event → Competence mapping
│   │   └── scoring.py             # Score normalization
│   ├── activity/
│   │   ├── matcher.py             # Game → Competence matching
│   │   └── taxonomy.py            # NCF curriculum alignment
│   └── ports/                     # Abstract interfaces
│       ├── content_port.py
│       ├── identity_port.py
│       └── observation_port.py
│
├── api/                           # ← DJANGO ADAPTER (Web API)
│   ├── views.py                   # Thin controllers calling domain_core
│   ├── serializers.py
│   └── adapters/                  # Port implementations
│       ├── content_adapter.py     # Uses Django ORM
│       ├── identity_adapter.py    # Uses Django Auth
│       └── observation_adapter.py # Uses GameSession models
│
├── webapp/                        # ← DJANGO ADAPTER (Models + Admin)
│   ├── models.py                  # ORM definitions
│   └── admin.py                   # CMS interface
│
└── manage.py
```

---

## Current State Analysis

### Django Backend (`lalela/`)
- **User Model**: Django's built-in `User` with `ParentProfile` extension
- **Child Model**: UUID-based `Child` linked to `ParentProfile` with age, language preferences
- **Content Model**: Base `Content` class with `Game` specialization (already has `difficulty`, `section`, `levels`)
- **Permissions**: `ChildContentPermission` controls per-child content access
- **Existing URLs**: `/webapp/login/`, `/webapp/signup/`, `/webapp/parent/`

### Web Games Frontend (`web-games/`)
- **~200 games** across 7 categories: `computer`, `puzzle`, `math`, `reading`, `strategy`, `science`, `music`
- **Difficulty levels**: 1-6 per game
- **Base class**: `LalelaGame` with lifecycle hooks (`init`, `preload`, `create`, `setupGameLogic`)
- **Existing scaffolding**: `APIClient.js`, `DataManager.js` already have auth token handling and progress sync stubs

---

## Phase 0: Game Registration & Sync

### 0.1 The Problem

Currently:
- **Frontend** (`GameMenuScene.js`): Has `allGames` array with ~200 games hardcoded (scene key, name, icon, difficulty, category)
- **Backend** (`Game` model): Has structure for games but no data synced from frontend
- **No link**: Games aren't registered in Django, so permissions/tracking can't work

### 0.2 Solution: Game Registry Sync

**Step 1: Export games from frontend to JSON**

Create a build script to extract game metadata:

```javascript
// scripts/export-games.js
const fs = require('fs');

// Import the allGames array (or parse GameMenuScene.js)
const allGames = [
  { scene: 'BabyKeyboardGame', name: 'Baby Keyboard', icon: 'baby_keyboard.svg', difficulty: 1, category: 'computer' },
  { scene: 'BabyMouseGame', name: 'Baby Mouse', icon: 'baby_mouse.svg', difficulty: 1, category: 'computer' },
  // ... all 200 games
];

// Transform to Django-compatible format
const gamesForDjango = allGames.map(game => ({
  game_slug: game.scene,
  title: game.name,
  difficulty: game.difficulty,
  section: game.category,
  icon_filename: game.icon,
  age_range: difficultyToAgeRange(game.difficulty),
  is_premium: false, // Default, can be updated in admin
  content_type: 'Game'
}));

function difficultyToAgeRange(difficulty) {
  const mapping = {
    1: '2-4', 2: '3-5', 3: '4-6', 
    4: '5-7', 5: '6-8', 6: '7-9'
  };
  return mapping[difficulty] || '3-7';
}

fs.writeFileSync('games-export.json', JSON.stringify(gamesForDjango, null, 2));
console.log(`Exported ${gamesForDjango.length} games`);
```

**Step 2: Django management command to import**

```python
# webapp/management/commands/import_games.py

import json
from django.core.management.base import BaseCommand
from webapp.models import Game

class Command(BaseCommand):
    help = 'Import games from web-games frontend export'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str)

    def handle(self, *args, **options):
        with open(options['json_file']) as f:
            games_data = json.load(f)
        
        created = 0
        updated = 0
        
        for game_data in games_data:
            game, was_created = Game.objects.update_or_create(
                game_slug=game_data['game_slug'],
                defaults={
                    'title': game_data['title'],
                    'difficulty': game_data['difficulty'],
                    'section': game_data['section'],
                    'age_range': game_data['age_range'],
                    'is_premium': game_data.get('is_premium', False),
                }
            )
            if was_created:
                created += 1
            else:
                updated += 1
        
        self.stdout.write(f'Created: {created}, Updated: {updated}')
```

**Step 3: Run sync**
```bash
# In web-games/
node scripts/export-games.js

# In lalela/
python manage.py import_games ../web-games/games-export.json
```

### 0.3 Keep Registries in Sync

Add to frontend `package.json`:
```json
{
  "scripts": {
    "export-games": "node scripts/export-games.js",
    "sync-games": "node scripts/export-games.js && curl -X POST http://localhost:8000/api/games/sync/ -d @games-export.json"
  }
}
```

Or use Django admin to manage games and have frontend fetch from API (recommended for production).

---

## Phase 1: Authentication Layer

### 1.1 Django API Endpoints

Create new Django app: `api/` with Django REST Framework

```python
# New URLs to add at /api/
POST   /api/auth/login/              # Parent login → returns JWT tokens
POST   /api/auth/refresh/            # Refresh access token
POST   /api/auth/logout/             # Invalidate tokens
GET    /api/auth/me/                 # Current user info

GET    /api/children/                # List parent's children
GET    /api/children/<uuid>/         # Get specific child
POST   /api/children/<uuid>/select/  # Set active child for session

GET    /api/games/                   # List available games (filtered by child permissions)
GET    /api/games/<slug>/            # Game details + child's progress
```

### 1.2 Django Models to Add

```python
# api/models.py

class ChildSession(models.Model):
    """Tracks active child sessions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    child = models.ForeignKey(Child, on_delete=models.CASCADE)
    parent = models.ForeignKey(ParentProfile, on_delete=models.CASCADE)
    token = models.CharField(max_length=500)  # JWT token reference
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
```

### 1.3 Frontend Auth Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Parent Login  │────▶│  Child Selector │────▶│   Game Menu     │
│   (Django page) │     │  (Django page)  │     │  (Phaser app)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        Child token passed
                        via URL param or
                        localStorage
```

**Option A: Session-Based (Recommended for simplicity)**
- Parent logs in via Django (`/webapp/login/`)
- Parent selects child on Django page (`/webapp/parent/children/`)
- Django sets session cookie with active child ID
- Web games served at `/webapp/games/` reads session

**Option B: JWT-Based (Better for mobile apps later)**
- Separate JWT endpoint returns child-specific token
- Frontend stores token in localStorage
- All API calls include `Authorization: Bearer <token>`

### 1.4 Frontend Changes

```javascript
// src/utils/AuthManager.js (new file)

export class AuthManager {
  constructor() {
    this.childId = null;
    this.childName = null;
    this.sessionToken = null;
  }

  async initialize() {
    // Check URL params first (from Django redirect)
    const params = new URLSearchParams(window.location.search);
    const childToken = params.get('child_token');
    
    if (childToken) {
      await this.validateAndSetChild(childToken);
      return true;
    }

    // Check localStorage for existing session
    const stored = localStorage.getItem('lalela_child_session');
    if (stored) {
      const session = JSON.parse(stored);
      if (session.expires > Date.now()) {
        this.childId = session.childId;
        this.childName = session.childName;
        return true;
      }
    }

    // No valid session - redirect to Django login
    this.redirectToLogin();
    return false;
  }

  redirectToLogin() {
    window.location.href = '/webapp/login/?next=/games/';
  }

  getChildId() {
    return this.childId;
  }
}
```

---

## Phase 1.5: Game Filtering & Permissions

### 1.5.1 Parent Game Selection (Onboarding)

During child onboarding, parents can select which games their child can access.

**Django: API Endpoints**
```python
# api/urls.py

GET    /api/children/<uuid>/permissions/          # Get child's game permissions
POST   /api/children/<uuid>/permissions/          # Bulk update permissions
PATCH  /api/children/<uuid>/permissions/<game_id>/ # Toggle single game

GET    /api/games/catalog/                        # Full game catalog for parent selection
```

**Django: Serializers**
```python
# api/serializers.py

class GameCatalogSerializer(serializers.ModelSerializer):
    """For parent game selection view"""
    is_enabled = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = ['id', 'game_slug', 'title', 'difficulty', 'section', 
                  'age_range', 'is_premium', 'thumbnail', 'description', 'is_enabled']
    
    def get_is_enabled(self, obj):
        child = self.context.get('child')
        if not child:
            return True
        permission = ChildContentPermission.objects.filter(
            child=child, content=obj
        ).first()
        return permission.is_enabled if permission else True  # Default enabled


class BulkPermissionUpdateSerializer(serializers.Serializer):
    """Bulk update game permissions"""
    permissions = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField())
    )
    # Expected format: [{"game_id": 1, "enabled": true}, ...]
```

**Django: View for Bulk Update**
```python
# api/views.py

class ChildPermissionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, child_uuid):
        child = get_object_or_404(Child, id=child_uuid, parent=request.user.parent_profile)
        
        permissions = request.data.get('permissions', [])
        
        for perm in permissions:
            game = Game.objects.get(id=perm['game_id'])
            ChildContentPermission.objects.update_or_create(
                child=child,
                content=game,
                defaults={'is_enabled': perm['enabled']}
            )
        
        return Response({'status': 'updated', 'count': len(permissions)})
```

### 1.5.2 Premium Games

**Model Update**
```python
# In webapp/models.py - Content already has is_premium field

class Game(Content):
    # ... existing fields ...
    
    # Premium pricing tiers
    PREMIUM_TIER_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic Subscription'),
        ('premium', 'Premium Subscription'),
    ]
    premium_tier = models.CharField(
        max_length=20,
        choices=PREMIUM_TIER_CHOICES,
        default='free'
    )
```

**API: Filter by subscription**
```python
# api/views.py

class ChildGamesView(APIView):
    """Get games available to a specific child"""
    
    def get(self, request, child_uuid):
        child = get_object_or_404(Child, id=child_uuid)
        parent = child.parent
        
        # Get parent's subscription level
        subscription_tier = getattr(parent, 'subscription_tier', 'free')
        
        # Base queryset: age-appropriate games
        games = Game.objects.filter(
            age_range__in=self._get_age_ranges_for_child(child)
        )
        
        # Filter by subscription
        if subscription_tier == 'free':
            games = games.filter(premium_tier='free')
        elif subscription_tier == 'basic':
            games = games.filter(premium_tier__in=['free', 'basic'])
        # premium users get all games
        
        # Apply parent permissions
        disabled_game_ids = ChildContentPermission.objects.filter(
            child=child,
            is_enabled=False
        ).values_list('content_id', flat=True)
        
        games = games.exclude(id__in=disabled_game_ids)
        
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)
    
    def _get_age_ranges_for_child(self, child):
        """Get appropriate age ranges based on child's age"""
        age = child.age
        ranges = []
        for ar in ['2-4', '3-5', '4-6', '5-7', '3-7', '2-6', '4-8', '6-8', '7-9', '8-10']:
            min_age, max_age = map(int, ar.split('-'))
            if min_age <= age <= max_age:
                ranges.append(ar)
        return ranges
```

### 1.5.3 Frontend: Filtered Game Menu

**Modify GameMenuScene.js**
```javascript
// src/scenes/GameMenuScene.js

class GameMenuScene extends Phaser.Scene {
  
  async create() {
    // Fetch filtered games from API instead of using hardcoded allGames
    this.allGames = await this.fetchChildGames();
    
    // Rest of create logic...
    this.createGameGrid();
  }
  
  async fetchChildGames() {
    const childId = this.authManager?.getChildId();
    
    if (!childId) {
      // Fallback to local games if not authenticated
      return this.getLocalGamesList();
    }
    
    try {
      const response = await fetch(`/api/children/${childId}/games/`);
      const data = await response.json();
      
      // Transform API response to match existing format
      return data.map(game => ({
        scene: game.game_slug,
        name: game.title,
        icon: game.icon_filename || `${game.game_slug.toLowerCase()}.svg`,
        difficulty: game.difficulty,
        category: game.section,
        isPremium: game.premium_tier !== 'free',
        isLocked: game.is_locked // If parent hasn't subscribed
      }));
    } catch (error) {
      console.warn('Failed to fetch games from API, using local list');
      return this.getLocalGamesList();
    }
  }
  
  getLocalGamesList() {
    // Original hardcoded list as fallback
    return [
      { scene: 'BabyKeyboardGame', name: 'Baby Keyboard', ... },
      // ...
    ];
  }
}
```

### 1.5.4 Filter & Sort UI

**Add filter bar to GameMenuScene**
```javascript
// src/scenes/GameMenuScene.js

createFilterBar() {
  const filterY = 120;
  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Easy', value: 'easy', difficulties: [1, 2] },
    { label: 'Medium', value: 'medium', difficulties: [3, 4] },
    { label: 'Hard', value: 'hard', difficulties: [5, 6] },
  ];
  
  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Math', value: 'math', icon: '🔢' },
    { label: 'Reading', value: 'reading', icon: '📖' },
    { label: 'Puzzle', value: 'puzzle', icon: '🧩' },
    { label: 'Computer', value: 'computer', icon: '💻' },
    { label: 'Science', value: 'science', icon: '🔬' },
    { label: 'Music', value: 'music', icon: '🎵' },
    { label: 'Strategy', value: 'strategy', icon: '♟️' },
  ];
  
  // Difficulty filter chips
  let x = 100;
  filters.forEach(filter => {
    const chip = this.createFilterChip(x, filterY, filter.label, () => {
      this.activeFilter.difficulty = filter.value;
      this.applyFilters();
    });
    x += chip.width + 15;
  });
  
  // Category dropdown or horizontal scroll
  this.createCategoryFilter(x + 50, filterY, categories);
  
  // Sort dropdown
  this.createSortDropdown(this.scale.width - 200, filterY);
}

createSortDropdown(x, y) {
  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Name A-Z', value: 'name_asc' },
    { label: 'Difficulty ↑', value: 'difficulty_asc' },
    { label: 'Difficulty ↓', value: 'difficulty_desc' },
    { label: 'Recently Played', value: 'recent' },
  ];
  // Create dropdown UI...
}

applyFilters() {
  let filtered = [...this.allGames];
  
  // Apply difficulty filter
  if (this.activeFilter.difficulty !== 'all') {
    const diffRange = {
      'easy': [1, 2],
      'medium': [3, 4],
      'hard': [5, 6]
    }[this.activeFilter.difficulty];
    
    filtered = filtered.filter(g => 
      g.difficulty >= diffRange[0] && g.difficulty <= diffRange[1]
    );
  }
  
  // Apply category filter
  if (this.activeFilter.category !== 'all') {
    filtered = filtered.filter(g => g.category === this.activeFilter.category);
  }
  
  // Apply sort
  filtered = this.sortGames(filtered, this.activeFilter.sort);
  
  // Re-render game grid
  this.displayedGames = filtered;
  this.refreshGameGrid();
}

sortGames(games, sortBy) {
  switch (sortBy) {
    case 'name_asc':
      return games.sort((a, b) => a.name.localeCompare(b.name));
    case 'difficulty_asc':
      return games.sort((a, b) => a.difficulty - b.difficulty);
    case 'difficulty_desc':
      return games.sort((a, b) => b.difficulty - a.difficulty);
    case 'recent':
      // Would need to fetch recent games from API/localStorage
      return games;
    case 'recommended':
    default:
      // Could use competence data to recommend games
      return games;
  }
}
```

### 1.5.5 Age-Based Recommendations

**API: Get recommended games**
```python
# api/views.py

class RecommendedGamesView(APIView):
    """Get personalized game recommendations for a child"""
    
    def get(self, request, child_uuid):
        child = get_object_or_404(Child, id=child_uuid)
        
        recommendations = []
        
        # 1. Age-appropriate games not yet played
        played_game_ids = GameSession.objects.filter(
            child=child
        ).values_list('game_id', flat=True).distinct()
        
        unplayed = Game.objects.filter(
            age_range__in=self._get_age_ranges(child)
        ).exclude(id__in=played_game_ids)[:5]
        
        recommendations.extend([
            {'game': g, 'reason': 'New game for you!'}
            for g in unplayed
        ])
        
        # 2. Games to improve weak competence areas
        weak_areas = ChildCompetenceScore.objects.filter(
            child=child,
            proficiency_score__lt=50
        ).order_by('proficiency_score')[:2]
        
        for score in weak_areas:
            games = Game.objects.filter(
                competence_mappings__competence=score.competence
            ).exclude(id__in=played_game_ids)[:2]
            
            recommendations.extend([
                {'game': g, 'reason': f'Practice your {score.competence.name}'}
                for g in games
            ])
        
        # 3. Games at next difficulty level
        # (if child is doing well at current level)
        
        return Response(RecommendationSerializer(recommendations, many=True).data)
```

---

## Phase 2: Activity Tracking & Scoring System

### 2.1 Django Models for Game Analytics

```python
# api/models.py

class GameSession(models.Model):
    """Individual game play session"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='game_sessions')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='sessions')
    
    # Timing
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    
    # Level info
    level_started = models.PositiveIntegerField(default=1)
    level_reached = models.PositiveIntegerField(default=1)
    
    # Scoring
    score = models.PositiveIntegerField(default=0)
    max_possible_score = models.PositiveIntegerField(null=True)
    
    # Completion
    completed = models.BooleanField(default=False)
    completion_percentage = models.FloatField(default=0.0)
    
    # Device info (for analytics)
    device_type = models.CharField(max_length=50, blank=True)  # mobile/tablet/desktop
    
    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['child', 'game']),
            models.Index(fields=['child', 'started_at']),
        ]


class GameLevelAttempt(models.Model):
    """Individual level attempt within a session"""
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='level_attempts')
    level = models.PositiveIntegerField()
    
    # Performance metrics
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    
    # Scoring
    score = models.PositiveIntegerField(default=0)
    errors = models.PositiveIntegerField(default=0)
    hints_used = models.PositiveIntegerField(default=0)
    
    # Success metrics
    passed = models.BooleanField(default=False)
    accuracy = models.FloatField(null=True)  # 0.0 to 1.0
    
    class Meta:
        ordering = ['session', 'level']


class GameEvent(models.Model):
    """Granular event tracking within a game session"""
    EVENT_TYPES = [
        ('answer_correct', 'Correct Answer'),
        ('answer_wrong', 'Wrong Answer'),
        ('hint_used', 'Hint Used'),
        ('level_complete', 'Level Complete'),
        ('game_paused', 'Game Paused'),
        ('game_resumed', 'Game Resumed'),
        ('object_moved', 'Object Moved'),
        ('tile_dropped', 'Tile Dropped'),
    ]
    
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.PositiveIntegerField(null=True)
    
    # Flexible event data
    event_data = models.JSONField(default=dict)  # e.g., {"expected": 5, "actual": 3, "position": [100, 200]}
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session', 'event_type']),
        ]
```

### 2.2 API Endpoints for Tracking

```python
# api/urls.py

# Session Management
POST   /api/sessions/start/                    # Start new game session
PATCH  /api/sessions/<uuid>/                   # Update session (score, level)
POST   /api/sessions/<uuid>/end/               # End session
POST   /api/sessions/<uuid>/events/            # Log game event

# Progress & Stats
GET    /api/children/<uuid>/progress/          # Child's overall progress
GET    /api/children/<uuid>/games/<slug>/stats/ # Child's stats for specific game
GET    /api/children/<uuid>/competence/        # Competence profile
```

### 2.3 Frontend Tracking Integration

Modify `LalelaGame.js` to add tracking hooks:

```javascript
// src/utils/LalelaGame.js - Add to base class

class LalelaGame extends Phaser.Scene {
  
  // Add tracking properties
  constructor(config) {
    super(config);
    // ... existing code ...
    
    // Tracking
    this.sessionId = null;
    this.sessionStartTime = null;
    this.currentLevelStartTime = null;
    this.levelAttempts = [];
    this.eventQueue = [];
  }

  // Start tracking when game begins
  async startSession() {
    if (!this.dataManager || !this.dataManager.isAuthenticated()) return;
    
    const response = await fetch('/api/sessions/start/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_slug: this.gameConfig.id,
        level: this.level,
        device_type: this.detectDeviceType()
      })
    });
    
    const data = await response.json();
    this.sessionId = data.session_id;
    this.sessionStartTime = Date.now();
  }

  // Track level completion
  async onLevelComplete(passed, score, errors = 0) {
    if (!this.sessionId) return;
    
    const duration = Math.floor((Date.now() - this.currentLevelStartTime) / 1000);
    
    await this.trackEvent('level_complete', {
      level: this.level,
      passed,
      score,
      errors,
      duration_seconds: duration,
      accuracy: errors > 0 ? score / (score + errors) : 1.0
    });
    
    // Update session
    await this.updateSession({ 
      level_reached: this.level,
      score: this.score 
    });
  }

  // Track individual events
  async trackEvent(eventType, eventData = {}) {
    if (!this.sessionId) return;
    
    // Queue events for batch sending
    this.eventQueue.push({
      event_type: eventType,
      level: this.level,
      timestamp: new Date().toISOString(),
      event_data: eventData
    });
    
    // Flush queue periodically or when it gets large
    if (this.eventQueue.length >= 10) {
      await this.flushEventQueue();
    }
  }

  async flushEventQueue() {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    await fetch(`/api/sessions/${this.sessionId}/events/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    });
  }

  // End session when leaving game
  async endSession() {
    if (!this.sessionId) return;
    
    await this.flushEventQueue();
    
    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    
    await fetch(`/api/sessions/${this.sessionId}/end/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration_seconds: duration,
        completed: this.gameState === 'completed',
        final_score: this.score,
        final_level: this.level
      })
    });
  }
  
  // Detect device type
  detectDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}
```

### 2.4 Game-Specific Tracking Examples

**DragDropGame** - Track tile placements:
```javascript
// In handleDropInZone()
this.trackEvent('tile_dropped', {
  tile_value: tile.value,
  expected_value: zone.expectedValue,
  correct: tile.value === zone.expectedValue,
  drop_position: { x: zone.x, y: zone.y }
});
```

**Memory Games** - Track matches:
```javascript
// In checkMatch()
this.trackEvent(isMatch ? 'answer_correct' : 'answer_wrong', {
  card1: firstCard.value,
  card2: secondCard.value,
  attempts_so_far: this.attempts
});
```

**Math Games** - Track answers:
```javascript
// In checkAnswer()
this.trackEvent(correct ? 'answer_correct' : 'answer_wrong', {
  question: this.currentQuestion,
  expected_answer: this.correctAnswer,
  given_answer: userAnswer,
  time_to_answer: Date.now() - this.questionStartTime
});
```

---

## Phase 3: Competence Profiles

### 3.1 Competence Categories (ELDA-Aligned)

Based on the Early Learning Development Areas (ELDA) framework and game categories:

| ELDA Domain | Competence Area | Related Game Categories | Skills Measured |
|-------------|-----------------|------------------------|-----------------|
| **ELDA 1: Wellbeing** | Social-Emotional | `strategy` (turn-based) | Patience, fair play, emotional regulation |
| **ELDA 2: Identity & Belonging** | Cultural Awareness | `reading` (multilingual) | Language identity, cultural connection |
| **ELDA 3: Communication** | Literacy | `reading` | Letter recognition, word formation, comprehension |
| **ELDA 4: Exploring Mathematics** | Numeracy | `math` | Number recognition, counting, arithmetic, fractions |
| **ELDA 5: Creativity** | Creative Expression | `music`, `puzzle` (tangrams) | Pattern creation, musical expression |
| **ELDA 6: Knowledge & Understanding** | Scientific Thinking | `science` | Cause/effect, observation, experimentation |
| **Cross-cutting** | Logic & Problem Solving | `puzzle`, `strategy` | Pattern recognition, spatial reasoning, planning |
| **Cross-cutting** | Digital Literacy | `computer` | Mouse control, keyboard familiarity, click precision |
| **Cross-cutting** | Memory & Attention | `puzzle` (memory games) | Short-term memory, focus, recall |
| **Cross-cutting** | Fine Motor Skills | `computer`, `puzzle` | Fine motor control, drag accuracy |

### 3.2 Django Models for Competence

```python
# api/models.py

class CompetenceArea(models.Model):
    """Define competence areas and their associated skills"""
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True)  # Icon name/path
    
    # Which game categories contribute to this competence
    game_categories = models.JSONField(default=list)  # ['math', 'puzzle']
    
    # Skill subcategories
    skills = models.JSONField(default=list)  # ['counting', 'addition', 'subtraction']


class ChildCompetenceScore(models.Model):
    """Aggregated competence score for a child in a specific area"""
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='competence_scores')
    competence = models.ForeignKey(CompetenceArea, on_delete=models.CASCADE)
    
    # Current proficiency (0-100)
    proficiency_score = models.FloatField(default=0.0)
    
    # Confidence in the score (based on amount of data)
    confidence = models.FloatField(default=0.0)  # 0.0 to 1.0
    
    # Trend
    trend = models.CharField(max_length=20, choices=[
        ('improving', 'Improving'),
        ('stable', 'Stable'),
        ('declining', 'Declining'),
        ('insufficient_data', 'Insufficient Data'),
    ], default='insufficient_data')
    
    # Time tracking
    total_time_seconds = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(null=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['child', 'competence']


class GameCompetenceMapping(models.Model):
    """Map games to competence areas with weights"""
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='competence_mappings')
    competence = models.ForeignKey(CompetenceArea, on_delete=models.CASCADE)
    weight = models.FloatField(default=1.0)  # How much this game contributes
    skills_tested = models.JSONField(default=list)  # Specific skills within the competence
```

### 3.3 Competence Calculation Algorithm (Domain Core)

> ⚠️ This logic lives in `domain_core/competence/calculator.py` - **NO Django imports!**

```python
# domain_core/competence/calculator.py

from typing import List, Dict, Protocol
from dataclasses import dataclass
from datetime import datetime, timedelta

# Port interface - implemented by Django adapter
class ObservationPort(Protocol):
    def get_sessions(self, child_id: str, game_ids: List[str], since: datetime) -> List[dict]: ...
    def get_events(self, session_ids: List[str], event_type: str) -> List[dict]: ...

class GameMappingPort(Protocol):
    def get_competence_mappings(self, competence_slug: str) -> List[dict]: ...

@dataclass
class CompetenceResult:
    score: float
    confidence: float
    trend: str
    skills: Dict[str, float]

class CompetenceCalculator:
    """
    Pure business logic for calculating child competence profiles.
    No Django ORM, no database queries - only port interfaces.
    """
    
    def __init__(self, observation_port: ObservationPort, mapping_port: GameMappingPort):
        self.observations = observation_port
        self.mappings = mapping_port
    
    def calculate_competence(self, child_id: str, competence_slug: str) -> CompetenceResult:
        """Calculate proficiency score for a child in a competence area"""
        
        # Get game mappings for this competence
        game_mappings = self.mappings.get_competence_mappings(competence_slug)
        
        if not game_mappings:
            return CompetenceResult(score=0, confidence=0, trend='insufficient_data', skills={})
        
        game_ids = [m['game_id'] for m in game_mappings]
        since = datetime.now() - timedelta(days=30)
        
        # Fetch observations via port
        sessions = self.observations.get_sessions(child_id, game_ids, since)
        
        if not sessions:
            return CompetenceResult(score=0, confidence=0, trend='insufficient_data', skills={})
        
        # Pure calculation logic
        weighted_scores = []
        total_weight = 0
        skill_scores = {}
        
        for mapping in game_mappings:
            game_sessions = [s for s in sessions if s['game_id'] == mapping['game_id']]
            
            if game_sessions:
                avg_completion = sum(s['completion_percentage'] for s in game_sessions) / len(game_sessions)
                avg_accuracy = self._calculate_accuracy(game_sessions)
                
                difficulty_weight = mapping['difficulty'] / 3.0
                game_score = (avg_completion * 0.4 + avg_accuracy * 0.6) * difficulty_weight
                
                weighted_scores.append(game_score * mapping['weight'])
                total_weight += mapping['weight']
                
                # Track skill-level scores
                for skill in mapping.get('skills', []):
                    if skill not in skill_scores:
                        skill_scores[skill] = []
                    skill_scores[skill].append(game_score)
        
        if total_weight == 0:
            return CompetenceResult(score=0, confidence=0, trend='insufficient_data', skills={})
        
        final_score = min(100, (sum(weighted_scores) / total_weight) * 100)
        confidence = min(1.0, len(sessions) / 20)
        
        # Aggregate skill scores
        skill_averages = {
            skill: sum(scores) / len(scores) * 100
            for skill, scores in skill_scores.items()
        }
        
        return CompetenceResult(
            score=final_score,
            confidence=confidence,
            trend=self._calculate_trend(child_id, competence_slug),
            skills=skill_averages
        )
    
    def _calculate_accuracy(self, sessions: List[dict]) -> float:
        """Calculate accuracy from session events"""
        session_ids = [s['id'] for s in sessions]
        correct = len(self.observations.get_events(session_ids, 'answer_correct'))
        wrong = len(self.observations.get_events(session_ids, 'answer_wrong'))
        total = correct + wrong
        return correct / total if total > 0 else 0
    
    def _calculate_trend(self, child_id: str, competence_slug: str) -> str:
        # Compare last 7 days vs previous 7 days
        # ... trend calculation logic ...
        return 'stable'
```

**Django Adapter Implementation:**
```python
# api/adapters/observation_adapter.py

from domain_core.competence.calculator import ObservationPort
from webapp.models import GameSession, GameEvent

class DjangoObservationAdapter(ObservationPort):
    """Django ORM implementation of ObservationPort"""
    
    def get_sessions(self, child_id, game_ids, since):
        sessions = GameSession.objects.filter(
            child_id=child_id,
            game_id__in=game_ids,
            started_at__gte=since
        ).values('id', 'game_id', 'completion_percentage', 'score')
        return list(sessions)
    
    def get_events(self, session_ids, event_type):
        events = GameEvent.objects.filter(
            session_id__in=session_ids,
            event_type=event_type
        ).values('id', 'event_type', 'event_data')
        return list(events)


# Usage in Django View:
# api/views.py

from domain_core.competence.calculator import CompetenceCalculator
from .adapters.observation_adapter import DjangoObservationAdapter
from .adapters.mapping_adapter import DjangoMappingAdapter

class ChildCompetenceView(APIView):
    def get(self, request, child_uuid):
        # Wire up domain logic with Django adapters
        calculator = CompetenceCalculator(
            observation_port=DjangoObservationAdapter(),
            mapping_port=DjangoMappingAdapter()
        )
        
        result = calculator.calculate_competence(str(child_uuid), 'numeracy')
        
        return Response({
            'score': result.score,
            'confidence': result.confidence,
            'trend': result.trend,
            'skills': result.skills
        })
```

### 3.4 Competence API Response

```json
GET /api/children/<uuid>/competence/

{
  "child_id": "uuid",
  "child_name": "Thabo",
  "age": 6,
  "total_play_time_hours": 12.5,
  "games_played": 45,
  "last_activity": "2026-01-07T10:30:00Z",
  
  "competence_profile": [
    {
      "area": "numeracy",
      "name": "Numeracy",
      "proficiency_score": 72.5,
      "confidence": 0.85,
      "trend": "improving",
      "skills": {
        "counting": 85.0,
        "addition": 70.0,
        "subtraction": 65.0,
        "number_recognition": 90.0
      },
      "recommended_games": ["LearnAdditionsGame", "AlgebraPlusGame"],
      "recent_progress": [
        {"date": "2026-01-01", "score": 65.0},
        {"date": "2026-01-07", "score": 72.5}
      ]
    },
    {
      "area": "literacy",
      "name": "Literacy",
      "proficiency_score": 58.0,
      "confidence": 0.6,
      "trend": "stable",
      "skills": {
        "letter_recognition": 75.0,
        "word_formation": 50.0,
        "reading": 45.0
      }
    }
    // ... more areas
  ],
  
  "strengths": ["number_recognition", "counting"],
  "areas_for_growth": ["reading", "word_formation"],
  
  "next_recommended_games": [
    {
      "game_slug": "WordsGame",
      "reason": "Will help improve word formation skills"
    }
  ]
}
```

---

## Phase 4: Implementation Roadmap

### Sprint 1: Authentication (Week 1-2)
- [ ] Create `api` Django app with DRF
- [ ] Implement JWT authentication endpoints
- [ ] Create `ChildSession` model
- [ ] Add child selector view in Django
- [ ] Create `AuthManager.js` in frontend
- [ ] Modify `index.js` to require auth before loading

### Sprint 2: Basic Tracking (Week 3-4)
- [ ] Create `GameSession`, `GameLevelAttempt`, `GameEvent` models
- [ ] Implement session start/end/update API endpoints
- [ ] Add `startSession()`, `endSession()` to `LalelaGame.js`
- [ ] Add basic event tracking to 5 representative games
- [ ] Create admin dashboard to view sessions

### Sprint 3: Extended Tracking (Week 5-6)
- [ ] Add tracking to all ~200 games (batch by category)
- [ ] Implement event batching and queue flushing
- [ ] Add offline event queuing
- [ ] Create game-specific tracking for DragDropGame, MemoryGame patterns

### Sprint 4: Competence Profiles (Week 7-8)
- [ ] Create competence models and seed data
- [ ] Map all games to competence areas
- [ ] Implement `CompetenceCalculator` service
- [ ] Create competence API endpoints
- [ ] Build parent dashboard to view competence profiles

### Sprint 5: Polish & Testing (Week 9-10)
- [ ] Performance optimization for tracking
- [ ] Privacy controls for data collection
- [ ] Data export functionality
- [ ] Integration testing
- [ ] Documentation

---

## Technical Considerations

### CORS Configuration
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",  # Webpack dev server
]
CORS_ALLOW_CREDENTIALS = True
```

### Offline-First Strategy (PWA with Service Worker)

The Node.js architecture used downloadable ZIPs for mobile offline support. For web-first Django, we use **Progressive Web App (PWA)** patterns:

```javascript
// public/service-worker.js

const CACHE_NAME = 'lalela-games-v1';
const STATIC_ASSETS = [
  '/',
  '/static/bundle.js',
  '/static/vendor.js',
  '/assets/category-icons/',
  // Game assets cached on first play
];

// Install: Cache shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch: Cache-first for assets, Network-first for API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API calls: Network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Static assets: Cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
```

**Offline Queue for Game Events:**
```javascript
// src/utils/OfflineQueue.js

class OfflineQueue {
  constructor() {
    this.dbName = 'lalela_offline';
    this.storeName = 'pending_events';
  }
  
  async queueEvent(event) {
    const db = await this.openDB();
    await db.add(this.storeName, {
      ...event,
      queued_at: Date.now()
    });
  }
  
  async syncWhenOnline() {
    if (!navigator.onLine) return;
    
    const db = await this.openDB();
    const events = await db.getAll(this.storeName);
    
    if (events.length === 0) return;
    
    try {
      await fetch('/api/sessions/batch-events/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
      
      // Clear synced events
      await db.clear(this.storeName);
    } catch (error) {
      console.warn('Sync failed, will retry later');
    }
  }
}

// Listen for online event
window.addEventListener('online', () => {
  new OfflineQueue().syncWhenOnline();
});
```

The existing `DataManager.js` already supports offline queuing. Extend it:
- Queue events locally when offline
- Sync when connection restored
- Store last session state in localStorage

### Performance
- Batch event logging (every 10 events or 30 seconds)
- Use WebSocket for real-time session updates (optional future enhancement)
- Index database on `(child, game)` and `(child, started_at)`

### Privacy
- Only collect gameplay data, never personal identifiable info in events
- Parents can download/delete their child's data
- Age-appropriate data handling (COPPA compliance)

---

## Files to Create/Modify

### Django (lalela/) - Hexagonal Structure

```
lalela/
├── domain_core/                   # NEW - Pure Python business logic
│   ├── __init__.py
│   ├── competence/
│   │   ├── __init__.py
│   │   ├── calculator.py          # Proficiency scoring (no Django!)
│   │   ├── elda_domains.py        # ELDA domain definitions
│   │   └── progression.py         # Level/skill progression rules
│   ├── observation/
│   │   ├── __init__.py
│   │   ├── aggregator.py          # Event → Competence mapping
│   │   └── scoring.py             # Score normalization
│   ├── activity/
│   │   ├── __init__.py
│   │   ├── matcher.py             # Game → Competence matching
│   │   └── taxonomy.py            # NCF curriculum alignment
│   ├── gamification/
│   │   ├── __init__.py
│   │   ├── badge_rules.py         # Badge unlock logic
│   │   └── xp_calculator.py       # XP/Level calculations
│   └── ports/                     # Abstract interfaces
│       ├── __init__.py
│       ├── content_port.py        # Game/Activity access
│       ├── identity_port.py       # Child/Parent auth
│       └── observation_port.py    # Session/Event storage
│
├── api/                           # Django Adapter - Web API
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                  # GameSession, GameEvent, Competence models
│   ├── serializers.py             # DRF serializers
│   ├── views.py                   # Thin controllers → domain_core
│   ├── urls.py                    # API routes
│   ├── adapters/                  # Port implementations (Django ORM)
│   │   ├── __init__.py
│   │   ├── content_adapter.py
│   │   ├── identity_adapter.py
│   │   └── observation_adapter.py
│   └── services/                  # Orchestration (wires adapters to domain)
│       ├── __init__.py
│       └── competence_service.py
│
├── webapp/                        # Existing - Models + Admin CMS
│   ├── models.py                  # Game, Content, Child, Parent models
│   ├── admin.py                   # Django Admin CMS
│   └── ...
│
└── manage.py
```

### Web Games (web-games/) - PWA-Ready

```
web-games/
├── public/
│   ├── manifest.json              # NEW - PWA manifest
│   └── service-worker.js          # NEW - Offline caching
│
├── scripts/
│   └── export-games.js            # NEW - Game registry export
│
├── src/
│   ├── utils/
│   │   ├── AuthManager.js         # NEW - Authentication handling
│   │   ├── TrackingManager.js     # NEW - Game event tracking
│   │   ├── BadgeManager.js        # NEW - Badge notifications
│   │   ├── OfflineQueue.js        # NEW - Offline event queue
│   │   ├── APIClient.js           # MODIFY - Add session endpoints
│   │   ├── DataManager.js         # MODIFY - Integrate tracking
│   │   └── LalelaGame.js          # MODIFY - Add tracking hooks
│   │
│   ├── scenes/
│   │   └── GameMenuScene.js       # MODIFY - Fetch filtered games, add filters
│   │
│   └── index.js                   # MODIFY - Add auth check, register SW
│
└── games-export.json              # Generated - Game registry for Django
```

---

## Architecture Comparison: Node.js vs Django

| Component | Node.js / Serverless (Original) | Django Monolith (Current Plan) |
| :--- | :--- | :--- |
| **Domain Core** | TypeScript (Pure) | Python (Pure) - `/domain_core/` |
| **CMS Handler** | Strapi (External Adapter) | Django Admin (Integrated) |
| **Data Storage** | DynamoDB (NoSQL / Single Table) | PostgreSQL (Relational) |
| **Bundling** | CLI tool generating Signed ZIPs | Management Commands + Static Assets |
| **Game Loading** | Download ZIP → Local FS | Fetch JSON → Stream from CDN |
| **API Layer** | API Gateway + Multiple Lambdas | Django Rest Framework (One App) |
| **Auth** | Cognito Adapter (Custom) | Django Auth + JWT |
| **Offline** | Bundle Manager (App) | Service Worker (PWA) |
| **Deployment** | AWS CDK / CloudFormation | Docker on ECS/Fargate or Vercel |

### Key Architectural Decisions

1. **Hexagonal Maintained**: Domain logic stays in pure Python, Django is just an adapter
2. **ELDA Alignment**: Competence areas map to Early Learning Development Areas
3. **PWA for Offline**: Service Worker replaces mobile bundle manager
4. **Manifest via ORM**: Game manifests generated from database, not ZIPs
5. **Static Asset CDN**: Games load assets from S3/CloudFront, not local storage

---

## Open Questions

1. **Session timeout policy?** How long before a child session expires? (Suggest: 2 hours of inactivity)

2. **Multi-child same device?** Can siblings share a device? Need child-switcher in game menu?

3. **Guest mode?** Should games be playable without authentication? (Limited features, no progress saving)

4. **Data retention?** How long to keep detailed event data? (Suggest: 1 year, then aggregate)

5. **Gamification?** Add badges/achievements based on competence milestones?

---

## Phase 5: Gamification & Achievements

### 5.1 Badge & Achievement System

**Core Concepts:**
- **Badges**: Visual rewards earned by completing specific actions
- **Milestones**: Progress markers within a competence area
- **Streaks**: Consecutive day play rewards
- **Levels**: Overall player level based on XP

### 5.2 Django Models

```python
# api/models.py

class Badge(models.Model):
    """Badge definitions"""
    BADGE_CATEGORY_CHOICES = [
        ('competence', 'Competence Mastery'),
        ('exploration', 'Game Exploration'),
        ('streak', 'Play Streaks'),
        ('achievement', 'Special Achievement'),
        ('milestone', 'Milestone'),
    ]
    
    BADGE_RARITY_CHOICES = [
        ('common', 'Common'),        # Bronze
        ('rare', 'Rare'),            # Silver
        ('epic', 'Epic'),            # Gold
        ('legendary', 'Legendary'),  # Diamond
    ]
    
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=100)  # Icon filename or emoji
    category = models.CharField(max_length=20, choices=BADGE_CATEGORY_CHOICES)
    rarity = models.CharField(max_length=20, choices=BADGE_RARITY_CHOICES, default='common')
    
    # Unlock criteria (JSON for flexibility)
    criteria = models.JSONField(default=dict)
    # Examples:
    # {"type": "games_played", "count": 10}
    # {"type": "competence_score", "area": "numeracy", "min_score": 80}
    # {"type": "streak", "days": 7}
    # {"type": "game_complete", "game_slug": "ChessGame", "difficulty": 6}
    
    # XP reward for earning this badge
    xp_reward = models.PositiveIntegerField(default=10)
    
    # Display order
    display_order = models.PositiveIntegerField(default=0)
    is_secret = models.BooleanField(default=False)  # Hidden until earned
    
    class Meta:
        ordering = ['category', 'display_order']


class ChildBadge(models.Model):
    """Badges earned by children"""
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    # Context for how it was earned
    earned_context = models.JSONField(default=dict)
    # e.g., {"game": "ChessGame", "score": 100, "level": 6}
    
    # Whether child has seen the badge notification
    is_seen = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['child', 'badge']
        ordering = ['-earned_at']


class ChildLevel(models.Model):
    """Child's overall level and XP"""
    child = models.OneToOneField(Child, on_delete=models.CASCADE, related_name='level_info')
    
    current_level = models.PositiveIntegerField(default=1)
    current_xp = models.PositiveIntegerField(default=0)
    total_xp = models.PositiveIntegerField(default=0)
    
    # Streak tracking
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_play_date = models.DateField(null=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def add_xp(self, amount):
        """Add XP and handle level ups"""
        self.current_xp += amount
        self.total_xp += amount
        
        # Check for level up
        xp_for_next = self.xp_for_level(self.current_level + 1)
        while self.current_xp >= xp_for_next:
            self.current_xp -= xp_for_next
            self.current_level += 1
            xp_for_next = self.xp_for_level(self.current_level + 1)
        
        self.save()
        return self.current_level
    
    @staticmethod
    def xp_for_level(level):
        """XP required to reach a level (exponential curve)"""
        return int(100 * (1.5 ** (level - 1)))
    
    def update_streak(self):
        """Update play streak based on today's date"""
        from datetime import date, timedelta
        today = date.today()
        
        if self.last_play_date == today:
            return  # Already played today
        
        if self.last_play_date == today - timedelta(days=1):
            # Consecutive day
            self.current_streak += 1
        else:
            # Streak broken
            self.current_streak = 1
        
        self.longest_streak = max(self.longest_streak, self.current_streak)
        self.last_play_date = today
        self.save()


class Milestone(models.Model):
    """Progress milestones within competence areas"""
    competence = models.ForeignKey(CompetenceArea, on_delete=models.CASCADE, related_name='milestones')
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    
    # Threshold to unlock
    proficiency_threshold = models.FloatField()  # 0-100
    
    # Associated badge (optional)
    badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)
    
    display_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['competence', 'proficiency_threshold']


class ChildMilestone(models.Model):
    """Milestones achieved by children"""
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='milestones')
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE)
    achieved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['child', 'milestone']
```

### 5.3 Badge Definitions (Seed Data)

```python
# api/fixtures/badges.json

BADGE_DEFINITIONS = [
    # Exploration Badges
    {
        "slug": "first_game",
        "name": "First Steps",
        "description": "Play your first game",
        "icon": "🎮",
        "category": "exploration",
        "rarity": "common",
        "criteria": {"type": "games_played", "count": 1},
        "xp_reward": 10
    },
    {
        "slug": "game_explorer_10",
        "name": "Game Explorer",
        "description": "Play 10 different games",
        "icon": "🗺️",
        "category": "exploration",
        "rarity": "common",
        "criteria": {"type": "unique_games_played", "count": 10},
        "xp_reward": 25
    },
    {
        "slug": "game_master_50",
        "name": "Game Master",
        "description": "Play 50 different games",
        "icon": "👑",
        "category": "exploration",
        "rarity": "rare",
        "criteria": {"type": "unique_games_played", "count": 50},
        "xp_reward": 100
    },
    {
        "slug": "completionist",
        "name": "Completionist",
        "description": "Complete all levels in any game",
        "icon": "✅",
        "category": "achievement",
        "rarity": "rare",
        "criteria": {"type": "game_all_levels_complete", "count": 1},
        "xp_reward": 50
    },
    
    # Streak Badges
    {
        "slug": "streak_3",
        "name": "On Fire",
        "description": "Play 3 days in a row",
        "icon": "🔥",
        "category": "streak",
        "rarity": "common",
        "criteria": {"type": "streak", "days": 3},
        "xp_reward": 15
    },
    {
        "slug": "streak_7",
        "name": "Week Warrior",
        "description": "Play 7 days in a row",
        "icon": "⚡",
        "category": "streak",
        "rarity": "rare",
        "criteria": {"type": "streak", "days": 7},
        "xp_reward": 50
    },
    {
        "slug": "streak_30",
        "name": "Monthly Champion",
        "description": "Play 30 days in a row",
        "icon": "🏆",
        "category": "streak",
        "rarity": "epic",
        "criteria": {"type": "streak", "days": 30},
        "xp_reward": 200
    },
    
    # Competence Badges
    {
        "slug": "numeracy_beginner",
        "name": "Number Novice",
        "description": "Reach 25% proficiency in Numeracy",
        "icon": "🔢",
        "category": "competence",
        "rarity": "common",
        "criteria": {"type": "competence_score", "area": "numeracy", "min_score": 25},
        "xp_reward": 20
    },
    {
        "slug": "numeracy_intermediate",
        "name": "Math Wizard",
        "description": "Reach 50% proficiency in Numeracy",
        "icon": "🧮",
        "category": "competence",
        "rarity": "rare",
        "criteria": {"type": "competence_score", "area": "numeracy", "min_score": 50},
        "xp_reward": 50
    },
    {
        "slug": "numeracy_master",
        "name": "Math Master",
        "description": "Reach 80% proficiency in Numeracy",
        "icon": "🎓",
        "category": "competence",
        "rarity": "epic",
        "criteria": {"type": "competence_score", "area": "numeracy", "min_score": 80},
        "xp_reward": 100
    },
    # Similar for literacy, logic, etc.
    
    # Category Badges
    {
        "slug": "puzzle_lover",
        "name": "Puzzle Lover",
        "description": "Complete 20 puzzle games",
        "icon": "🧩",
        "category": "achievement",
        "rarity": "rare",
        "criteria": {"type": "category_games_complete", "category": "puzzle", "count": 20},
        "xp_reward": 40
    },
    
    # Perfect Score Badges
    {
        "slug": "perfect_score",
        "name": "Perfectionist",
        "description": "Complete a game with 100% accuracy",
        "icon": "💯",
        "category": "achievement",
        "rarity": "rare",
        "criteria": {"type": "perfect_accuracy", "count": 1},
        "xp_reward": 30
    },
    {
        "slug": "speed_demon",
        "name": "Speed Demon",
        "description": "Complete a level in under 30 seconds",
        "icon": "⚡",
        "category": "achievement",
        "rarity": "rare",
        "criteria": {"type": "level_time", "max_seconds": 30},
        "xp_reward": 25
    },
]
```

### 5.4 Badge Award Service

```python
# api/services/badges.py

from datetime import date, timedelta
from django.db.models import Count, Avg

class BadgeAwardService:
    """Service to check and award badges"""
    
    def __init__(self, child):
        self.child = child
        self.newly_awarded = []
    
    def check_all_badges(self):
        """Check all badge criteria and award any earned"""
        all_badges = Badge.objects.exclude(
            id__in=self.child.badges.values_list('badge_id', flat=True)
        )
        
        for badge in all_badges:
            if self._check_criteria(badge):
                self._award_badge(badge)
        
        return self.newly_awarded
    
    def check_after_game_session(self, session):
        """Check badges that could be earned from a game session"""
        self._check_games_played_badges()
        self._check_streak_badges()
        self._check_completion_badges(session)
        self._check_accuracy_badges(session)
        self._check_competence_badges()
        
        return self.newly_awarded
    
    def _check_criteria(self, badge):
        """Evaluate if badge criteria is met"""
        criteria = badge.criteria
        ctype = criteria.get('type')
        
        if ctype == 'games_played':
            count = GameSession.objects.filter(child=self.child).count()
            return count >= criteria['count']
        
        elif ctype == 'unique_games_played':
            count = GameSession.objects.filter(
                child=self.child
            ).values('game').distinct().count()
            return count >= criteria['count']
        
        elif ctype == 'streak':
            level_info = getattr(self.child, 'level_info', None)
            if level_info:
                return level_info.current_streak >= criteria['days']
            return False
        
        elif ctype == 'competence_score':
            try:
                score = ChildCompetenceScore.objects.get(
                    child=self.child,
                    competence__slug=criteria['area']
                )
                return score.proficiency_score >= criteria['min_score']
            except ChildCompetenceScore.DoesNotExist:
                return False
        
        elif ctype == 'category_games_complete':
            count = GameSession.objects.filter(
                child=self.child,
                game__section=criteria['category'],
                completed=True
            ).count()
            return count >= criteria['count']
        
        elif ctype == 'perfect_accuracy':
            count = GameLevelAttempt.objects.filter(
                session__child=self.child,
                accuracy=1.0
            ).count()
            return count >= criteria['count']
        
        elif ctype == 'level_time':
            exists = GameLevelAttempt.objects.filter(
                session__child=self.child,
                duration_seconds__lte=criteria['max_seconds'],
                passed=True
            ).exists()
            return exists
        
        return False
    
    def _award_badge(self, badge, context=None):
        """Award a badge to the child"""
        child_badge, created = ChildBadge.objects.get_or_create(
            child=self.child,
            badge=badge,
            defaults={'earned_context': context or {}}
        )
        
        if created:
            # Award XP
            level_info, _ = ChildLevel.objects.get_or_create(child=self.child)
            level_info.add_xp(badge.xp_reward)
            
            self.newly_awarded.append({
                'badge': badge,
                'xp_earned': badge.xp_reward,
                'new_level': level_info.current_level
            })
        
        return created
```

### 5.5 Frontend: Badge Display

```javascript
// src/utils/BadgeManager.js

export class BadgeManager {
  constructor(scene) {
    this.scene = scene;
    this.pendingBadges = [];
  }
  
  async checkForNewBadges() {
    const childId = this.scene.authManager?.getChildId();
    if (!childId) return;
    
    const response = await fetch(`/api/children/${childId}/badges/unseen/`);
    const badges = await response.json();
    
    if (badges.length > 0) {
      this.pendingBadges = badges;
      this.showBadgeNotification(badges[0]);
    }
  }
  
  showBadgeNotification(badge) {
    const { width, height } = this.scene.scale;
    
    // Create overlay
    const overlay = this.scene.add.rectangle(
      width / 2, height / 2, width, height, 0x000000, 0.7
    ).setDepth(1000);
    
    // Badge container
    const container = this.scene.add.container(width / 2, height / 2).setDepth(1001);
    
    // Background card
    const card = this.scene.add.graphics();
    card.fillStyle(0xFFFFFF, 1);
    card.fillRoundedRect(-150, -200, 300, 400, 20);
    container.add(card);
    
    // Badge icon (large)
    const icon = this.scene.add.text(0, -100, badge.icon, {
      fontSize: '80px'
    }).setOrigin(0.5);
    container.add(icon);
    
    // "Badge Earned!" text
    const title = this.scene.add.text(0, -20, 'Badge Earned!', {
      fontSize: '28px',
      color: '#F08A00',
      fontFamily: 'Fredoka One'
    }).setOrigin(0.5);
    container.add(title);
    
    // Badge name
    const name = this.scene.add.text(0, 30, badge.name, {
      fontSize: '24px',
      color: '#101012',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(name);
    
    // Description
    const desc = this.scene.add.text(0, 70, badge.description, {
      fontSize: '16px',
      color: '#666666',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 250 }
    }).setOrigin(0.5);
    container.add(desc);
    
    // XP earned
    const xp = this.scene.add.text(0, 120, `+${badge.xp_reward} XP`, {
      fontSize: '20px',
      color: '#00B378',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(xp);
    
    // Continue button
    const button = this.scene.add.rectangle(0, 170, 150, 45, 0x0062FF)
      .setInteractive({ useHandCursor: true });
    container.add(button);
    
    const buttonText = this.scene.add.text(0, 170, 'Awesome!', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    container.add(buttonText);
    
    // Animate in
    container.setScale(0);
    this.scene.tweens.add({
      targets: container,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Handle dismiss
    button.on('pointerdown', async () => {
      // Mark badge as seen
      await fetch(`/api/badges/${badge.id}/seen/`, { method: 'POST' });
      
      // Animate out
      this.scene.tweens.add({
        targets: [container, overlay],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          container.destroy();
          overlay.destroy();
          
          // Show next badge if any
          this.pendingBadges.shift();
          if (this.pendingBadges.length > 0) {
            this.showBadgeNotification(this.pendingBadges[0]);
          }
        }
      });
    });
  }
}
```

### 5.6 Profile Screen with Badges

**API Endpoint**
```python
GET /api/children/<uuid>/profile/

{
  "child_id": "uuid",
  "name": "Thabo",
  "avatar": "hero.png",
  
  "level": {
    "current_level": 12,
    "current_xp": 450,
    "xp_for_next_level": 759,
    "total_xp": 3250
  },
  
  "streak": {
    "current": 5,
    "longest": 14,
    "last_played": "2026-01-07"
  },
  
  "badges": {
    "earned": [
      {"slug": "first_game", "name": "First Steps", "icon": "🎮", "earned_at": "2026-01-01"},
      {"slug": "streak_3", "name": "On Fire", "icon": "🔥", "earned_at": "2026-01-03"},
      // ...
    ],
    "total_earned": 8,
    "total_available": 25
  },
  
  "stats": {
    "games_played": 45,
    "total_time_hours": 12.5,
    "favorite_category": "math",
    "favorite_game": "AdjacentNumbers"
  },
  
  "milestones": [
    {"area": "numeracy", "current": 72, "next_milestone": 75, "next_name": "Math Whiz"},
    {"area": "literacy", "current": 58, "next_milestone": 60, "next_name": "Word Builder"}
  ]
}
```

### 5.7 XP & Level Display in Game Menu

```javascript
// Add to GameMenuScene.js

createProfileHeader() {
  const profile = this.childProfile;
  
  // Avatar
  this.add.image(60, 50, profile.avatar).setScale(0.8);
  
  // Name
  this.add.text(110, 30, profile.name, {
    fontSize: '24px',
    color: '#FFFFFF',
    fontFamily: 'Fredoka One'
  });
  
  // Level badge
  const levelBg = this.add.circle(110, 70, 20, 0xF08A00);
  this.add.text(110, 70, profile.level.current_level.toString(), {
    fontSize: '16px',
    color: '#FFFFFF',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // XP bar
  const xpBarBg = this.add.rectangle(200, 70, 150, 12, 0x333333).setOrigin(0, 0.5);
  const xpProgress = profile.level.current_xp / profile.level.xp_for_next_level;
  const xpBarFill = this.add.rectangle(200, 70, 150 * xpProgress, 12, 0x00B378).setOrigin(0, 0.5);
  
  // Streak display
  if (profile.streak.current > 0) {
    this.add.text(this.scale.width - 100, 50, `🔥 ${profile.streak.current}`, {
      fontSize: '20px',
      color: '#F08A00'
    }).setOrigin(0.5);
  }
}
```

---

## Updated Implementation Roadmap

### Sprint 1: Game Registry & Auth (Week 1-2)
- [ ] Create game export script (frontend)
- [ ] Create import management command (Django)
- [ ] Sync all 200 games to database
- [ ] Implement JWT authentication endpoints
- [ ] Add child selector and session management

### Sprint 2: Permissions & Filtering (Week 3-4)
- [ ] Implement `ChildContentPermission` API
- [ ] Create parent game selection UI (Django template)
- [ ] Add premium tier support
- [ ] Modify `GameMenuScene` to fetch filtered games
- [ ] Add filter/sort UI components

### Sprint 3: Activity Tracking (Week 5-6)
- [ ] Create `GameSession`, `GameLevelAttempt`, `GameEvent` models
- [ ] Implement tracking in `LalelaGame.js` base class
- [ ] Add tracking to all games
- [ ] Build basic analytics admin

### Sprint 4: Competence Profiles (Week 7-8)
- [ ] Create competence models and mappings
- [ ] Implement `CompetenceCalculator`
- [ ] Build parent dashboard for profiles
- [ ] Add recommendations engine

### Sprint 5: Gamification (Week 9-10)
- [ ] Create badge/level/milestone models
- [ ] Implement `BadgeAwardService`
- [ ] Seed badge definitions
- [ ] Build badge notification UI
- [ ] Add profile screen with badges/levels

### Sprint 6: Polish & Launch (Week 11-12)
- [ ] Performance optimization
- [ ] Privacy controls
- [ ] Data export
- [ ] Integration testing
- [ ] Documentation & deployment
