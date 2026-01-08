#!/bin/bash
#
# Sync Games to Django
#
# Exports game registry from web-games and imports into Django.
#
# Usage:
#   ./scripts/sync-games.sh
#   ./scripts/sync-games.sh --dry-run
#
# Requirements:
#   - Node.js installed
#   - Django server accessible
#   - Python environment activated for lalela
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_GAMES_DIR="$(dirname "$SCRIPT_DIR")"
LALELA_DIR="${LALELA_DIR:-$HOME/Documents/DF/https___superchill.org_en_/superchill.org/lalela}"

# Check if dry run
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "=== DRY RUN MODE ==="
fi

echo "=== Syncing Games from Web Games to Django ==="
echo "Web Games: $WEB_GAMES_DIR"
echo "Lalela:    $LALELA_DIR"
echo ""

# Step 1: Export games from web-games
echo "Step 1: Exporting games from GameMenuScene.js..."
GAMES_JSON="$SCRIPT_DIR/.games-export.json"

node "$SCRIPT_DIR/export-games.js" --django --output="$GAMES_JSON"

if [[ ! -f "$GAMES_JSON" ]]; then
    echo "Error: Failed to export games"
    exit 1
fi

GAME_COUNT=$(jq 'length' "$GAMES_JSON")
echo "Exported $GAME_COUNT games to $GAMES_JSON"
echo ""

# Step 2: Copy fixture to Django
echo "Step 2: Copying fixture to Django..."
FIXTURE_PATH="$LALELA_DIR/api/fixtures/games.json"

if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would copy $GAMES_JSON to $FIXTURE_PATH"
else
    mkdir -p "$(dirname "$FIXTURE_PATH")"
    cp "$GAMES_JSON" "$FIXTURE_PATH"
    echo "Copied to $FIXTURE_PATH"
fi
echo ""

# Step 3: Load fixture into Django
echo "Step 3: Loading fixture into Django..."

if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would run: python manage.py import_games_json games.json"
else
    cd "$LALELA_DIR"
    python manage.py import_games_json "$FIXTURE_PATH"
    echo "Games imported successfully"
fi
echo ""

# Step 4: Clean up
rm -f "$GAMES_JSON"

echo "=== Sync Complete ==="
echo ""
echo "Games are now available in Django."
echo "Access Django admin at: http://localhost:8000/admin/webapp/game/"
