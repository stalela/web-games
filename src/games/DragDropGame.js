/**
 * DragDropGame - Base class for all drag and drop educational games
 * Provides common functionality for games involving dragging tiles/objects to target zones
 */
import { LalelaGame } from '../utils/LalelaGame.js';
import { DraggableTile } from '../components/DraggableTile.js';
import { DropZone } from '../components/DropZone.js';

export class DragDropGame extends LalelaGame {
  constructor(config) {
    super({
      ...config,
      category: 'mathematics'
    });

    // Drag & drop specific properties
    this.draggableTiles = [];
    this.dropZones = [];
    this.currentDraggedTile = null;
    this.snapThreshold = 50; // Distance for auto-snap to drop zones
    this.dragStartPosition = null;

    // Game state
    this.correctPlacements = 0;
    this.totalPlacements = 0;
    this.levelComplete = false;
  }

  /**
   * Initialize drag and drop systems
   */
  init(data) {
    super.init(data);

    // Setup drag and drop event handlers
    this.setupDragDropEvents();
  }

  /**
   * Setup drag and drop event handlers
   */
  setupDragDropEvents() {
    // Mouse/touch events for dragging
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);

    // Enhanced input handling through InputManager if available
    if (this.game.inputManager) {
      this.game.inputManager.on('dragstart', this.onDragStart, this);
      this.game.inputManager.on('drag', this.onDrag, this);
      this.game.inputManager.on('dragend', this.onDragEnd, this);
      this.game.inputManager.on('tap', this.onTap, this);
    }
  }

  /**
   * Create draggable tiles for the game
   */
  createDraggableTiles(tilesConfig) {
    this.draggableTiles = [];

    tilesConfig.forEach((config, index) => {
      const tile = new DraggableTile(this, {
        x: config.x,
        y: config.y,
        value: config.value,
        text: config.text || config.value.toString(),
        color: config.color || 0x0062FF, // River Blue from brand guide
        size: config.size || 60,
        fontSize: config.fontSize || 24,
        ...config
      });

      this.draggableTiles.push(tile);
      this.add.existing(tile);
    });
  }

  /**
   * Create drop zones for the game
   */
  createDropZones(zonesConfig) {
    this.dropZones = [];

    zonesConfig.forEach((config, index) => {
      const zone = new DropZone(this, {
        x: config.x,
        y: config.y,
        width: config.width || 80,
        height: config.height || 80,
        expectedValue: config.expectedValue,
        label: config.label,
        color: config.color || 0x00B378, // Aloe Green from brand guide
        acceptedValues: config.acceptedValues,
        ...config
      });

      this.dropZones.push(zone);
      this.add.existing(zone);
    });
  }

  /**
   * Handle pointer down events
   */
  onPointerDown(pointer) {
    // Find if we clicked on a draggable tile
    const clickedTile = this.getTileAt(pointer.x, pointer.y);

    if (clickedTile && !this.levelComplete) {
      this.startDragging(clickedTile, pointer);
    }
  }

  /**
   * Handle pointer move events
   */
  onPointerMove(pointer) {
    if (this.currentDraggedTile && !this.levelComplete) {
      this.updateDragging(pointer);
    }
  }

  /**
   * Handle pointer up events
   */
  onPointerUp(pointer) {
    if (this.currentDraggedTile && !this.levelComplete) {
      this.stopDragging(pointer);
    }
  }

  /**
   * Start dragging a tile
   */
  startDragging(tile, pointer) {
    if (this.currentDraggedTile) return;

    this.currentDraggedTile = tile;
    this.dragStartPosition = { x: tile.x, y: tile.y };

    // Bring tile to front
    this.children.bringToTop(tile);

    // Visual feedback
    tile.setDragging(true);

    // Play sound
    if (this.game.audioManager) {
      this.game.audioManager.playSound('click');
    }

    // Emit event
    this.events.emit('dragstart', { tile, pointer });
  }

  /**
   * Update dragging position
   */
  updateDragging(pointer) {
    if (!this.currentDraggedTile) return;

    // Update tile position to follow pointer
    this.currentDraggedTile.x = pointer.x;
    this.currentDraggedTile.y = pointer.y;

    // Check for snapping to drop zones
    this.checkSnapping(pointer);
  }

  /**
   * Stop dragging and handle drop
   */
  stopDragging(pointer) {
    if (!this.currentDraggedTile) return;

    const tile = this.currentDraggedTile;
    const droppedZone = this.getDropZoneAt(pointer.x, pointer.y);

    // Reset dragging state
    tile.setDragging(false);

    if (droppedZone) {
      // Try to drop in zone
      this.handleDropInZone(tile, droppedZone);
    } else {
      // Return to original position or snap to nearest zone
      this.handleDropOutsideZone(tile, pointer);
    }

    // Clear dragging state
    this.currentDraggedTile = null;
    this.dragStartPosition = null;

    // Emit dragend event
    this.events.emit('dragend', { tile, pointer, droppedZone });
  }

  /**
   * Handle dropping a tile in a drop zone
   */
  handleDropInZone(tile, dropZone) {
    const isValid = dropZone.acceptTile(tile);

    if (isValid) {
      // Successful drop
      this.onValidDrop(tile, dropZone);

      // Play success sound
      if (this.game.audioManager) {
        this.game.audioManager.playSound('success');
      }

      // Visual feedback
      this.tweens.add({
        targets: tile,
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });

      // Check level completion
      this.checkLevelCompletion();

    } else {
      // Invalid drop - return to start
      this.returnTileToStart(tile);

      // Play error sound
      if (this.game.audioManager) {
        this.game.audioManager.playSound('error');
      }

      // Visual feedback for invalid drop
      this.tweens.add({
        targets: tile,
        x: tile.x + 10,
        duration: 100,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
    }
  }

  /**
   * Handle dropping a tile outside any drop zone
   */
  handleDropOutsideZone(tile, pointer) {
    // Check if close enough to snap to a zone
    const nearestZone = this.getNearestDropZone(pointer.x, pointer.y);

    if (nearestZone && this.getDistance(pointer.x, pointer.y, nearestZone.x, nearestZone.y) < this.snapThreshold) {
      // Auto-snap to nearest zone
      this.snapTileToZone(tile, nearestZone);
    } else {
      // Return to start position
      this.returnTileToStart(tile);
    }
  }

  /**
   * Snap tile to a specific zone
   */
  snapTileToZone(tile, zone) {
    this.tweens.add({
      targets: tile,
      x: zone.x,
      y: zone.y,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.handleDropInZone(tile, zone);
      }
    });
  }

  /**
   * Return tile to its starting position
   */
  returnTileToStart(tile) {
    this.tweens.add({
      targets: tile,
      x: this.dragStartPosition.x,
      y: this.dragStartPosition.y,
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Check if tile should snap to nearby zones during drag
   */
  checkSnapping(pointer) {
    const nearestZone = this.getNearestDropZone(pointer.x, pointer.y);
    const distance = nearestZone ?
      this.getDistance(pointer.x, pointer.y, nearestZone.x, nearestZone.y) : Infinity;

    // Visual feedback for potential snap
    this.dropZones.forEach(zone => {
      const zoneDistance = this.getDistance(pointer.x, pointer.y, zone.x, zone.y);
      zone.setHighlight(zoneDistance < this.snapThreshold);
    });
  }

  /**
   * Handle valid drop (to be overridden by subclasses)
   */
  onValidDrop(tile, dropZone) {
    this.correctPlacements++;
    this.totalPlacements++;

    // Update score
    this.addScore(10);

    // Emit correctDrop event
    this.events.emit('correctDrop', { tile, dropZone });

    // Subclass-specific logic
    this.handleValidDrop(tile, dropZone);
  }

  /**
   * Handle valid drop (subclass implementation)
   */
  handleValidDrop(tile, dropZone) {
    // To be implemented by subclasses
  }

  /**
   * Check if level is completed
   */
  checkLevelCompletion() {
    // To be implemented by subclasses
    // Check if all required tiles are correctly placed
  }

  /**
   * Get tile at specific position
   */
  getTileAt(x, y) {
    // Check in reverse order (topmost first)
    for (let i = this.draggableTiles.length - 1; i >= 0; i--) {
      const tile = this.draggableTiles[i];
      if (tile.getBounds().contains(x, y) && tile.isInteractive) {
        return tile;
      }
    }
    return null;
  }

  /**
   * Get drop zone at specific position
   */
  getDropZoneAt(x, y) {
    return this.dropZones.find(zone => zone.getBounds().contains(x, y)) || null;
  }

  /**
   * Get nearest drop zone to a position
   */
  getNearestDropZone(x, y) {
    let nearest = null;
    let minDistance = Infinity;

    this.dropZones.forEach(zone => {
      const distance = this.getDistance(x, y, zone.x, zone.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = zone;
      }
    });

    return nearest;
  }

  /**
   * Calculate distance between two points
   */
  getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  /**
   * Enhanced input event handlers (for InputManager integration)
   */
  onDragStart(data) {
    const tile = this.getTileAt(data.position.x, data.position.y);
    if (tile) {
      this.startDragging(tile, data.pointer);
    }
  }

  onDrag(data) {
    if (this.currentDraggedTile) {
      this.updateDragging(data.pointer);
    }
  }

  onDragEnd(data) {
    if (this.currentDraggedTile) {
      this.stopDragging(data.pointer);
    }
  }

  onTap(data) {
    // Handle tap gestures if needed
  }

  /**
   * Reset level state
   */
  resetLevelState() {
    super.resetLevelState();

    // Reset drag & drop specific state
    this.correctPlacements = 0;
    this.totalPlacements = 0;
    this.levelComplete = false;

    // Clear highlights
    this.dropZones.forEach(zone => zone.setHighlight(false));

    // Reset tiles to starting positions
    this.resetTiles();
  }

  /**
   * Reset tiles to starting positions
   */
  resetTiles() {
    // To be implemented by subclasses
    // Reset all tiles to their initial positions
  }

  /**
   * Show hint for current level
   */
  showHint() {
    // Provide visual hint for stuck players
    if (this.uiManager) {
      this.uiManager.showTutorial(
        "Drag the correct numbers to their matching positions!",
        "center"
      );
    }
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    return {
      ...super.getGameStats(),
      correctPlacements: this.correctPlacements,
      totalPlacements: this.totalPlacements,
      accuracy: this.totalPlacements > 0 ? this.correctPlacements / this.totalPlacements : 0
    };
  }

  /**
   * Clean up drag and drop resources
   */
  destroy() {
    // Clean up event listeners
    if (this.game.inputManager) {
      this.game.inputManager.off('dragstart', this.onDragStart, this);
      this.game.inputManager.off('drag', this.onDrag, this);
      this.game.inputManager.off('dragend', this.onDragEnd, this);
      this.game.inputManager.off('tap', this.onTap, this);
    }

    // Clean up tiles and zones
    this.draggableTiles.forEach(tile => tile.destroy());
    this.dropZones.forEach(zone => zone.destroy());

    this.draggableTiles = [];
    this.dropZones = [];

    super.destroy();
  }
}