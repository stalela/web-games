/**
 * CollisionDetector - Advanced collision detection system for drag and drop games
 * Handles various collision shapes and provides precise intersection testing
 */
export class CollisionDetector {
  constructor() {
    this.collisionLayers = new Map();
    this.collisionCallbacks = new Map();
  }

  /**
   * Register a collision layer
   */
  registerLayer(layerName, objects = []) {
    this.collisionLayers.set(layerName, new Set(objects));
    return this.collisionLayers.get(layerName);
  }

  /**
   * Add object to collision layer
   */
  addToLayer(layerName, object) {
    if (!this.collisionLayers.has(layerName)) {
      this.registerLayer(layerName);
    }
    this.collisionLayers.get(layerName).add(object);
  }

  /**
   * Remove object from collision layer
   */
  removeFromLayer(layerName, object) {
    const layer = this.collisionLayers.get(layerName);
    if (layer) {
      layer.delete(object);
    }
  }

  /**
   * Register collision callback between two layers
   */
  onCollision(layerA, layerB, callback) {
    const key = this.getCollisionKey(layerA, layerB);
    if (!this.collisionCallbacks.has(key)) {
      this.collisionCallbacks.set(key, []);
    }
    this.collisionCallbacks.get(key).push(callback);
  }

  /**
   * Get unique key for collision pair
   */
  getCollisionKey(layerA, layerB) {
    return [layerA, layerB].sort().join('_');
  }

  /**
   * Check collisions between two layers
   */
  checkCollisions(layerA, layerB) {
    const objectsA = this.collisionLayers.get(layerA);
    const objectsB = this.collisionLayers.get(layerB);

    if (!objectsA || !objectsB) return [];

    const collisions = [];
    const key = this.getCollisionKey(layerA, layerB);

    for (const objA of objectsA) {
      for (const objB of objectsB) {
        if (this.testCollision(objA, objB)) {
          const collision = {
            objectA: objA,
            objectB: objB,
            layerA: layerA,
            layerB: layerB
          };

          collisions.push(collision);

          // Trigger callbacks
          const callbacks = this.collisionCallbacks.get(key);
          if (callbacks) {
            callbacks.forEach(callback => callback(collision));
          }
        }
      }
    }

    return collisions;
  }

  /**
   * Test collision between two objects
   */
  testCollision(objA, objB) {
    // Handle different object types
    if (objA.getBounds && objB.getBounds) {
      // Both objects have bounds (rectangular collision)
      return this.testRectangleCollision(objA.getBounds(), objB.getBounds());
    }

    if (objA.containsPoint && objB.containsPoint) {
      // Both objects have point containment
      return this.testPointInObject(objA, objB) || this.testPointInObject(objB, objA);
    }

    // Fallback to distance-based collision
    return this.testDistanceCollision(objA, objB);
  }

  /**
   * Test rectangular collision
   */
  testRectangleCollision(rectA, rectB) {
    return Phaser.Geom.Rectangle.Overlaps(rectA, rectB);
  }

  /**
   * Test if object A contains any point of object B
   */
  testPointInObject(objA, objB) {
    // Sample points from object B
    const boundsB = objB.getBounds ? objB.getBounds() : this.getObjectBounds(objB);
    const points = this.getRectanglePoints(boundsB);

    return points.some(point => objA.containsPoint(point.x, point.y));
  }

  /**
   * Test distance-based collision
   */
  testDistanceCollision(objA, objB, threshold = 50) {
    const posA = this.getObjectPosition(objA);
    const posB = this.getObjectPosition(objB);

    const distance = Phaser.Math.Distance.Between(posA.x, posA.y, posB.x, posB.y);
    return distance < threshold;
  }

  /**
   * Get rectangle corner points
   */
  getRectanglePoints(rect) {
    return [
      { x: rect.x, y: rect.y }, // top-left
      { x: rect.x + rect.width, y: rect.y }, // top-right
      { x: rect.x + rect.width, y: rect.y + rect.height }, // bottom-right
      { x: rect.x, y: rect.y + rect.height }, // bottom-left
      { x: rect.x + rect.width/2, y: rect.y + rect.height/2 } // center
    ];
  }

  /**
   * Get object bounds
   */
  getObjectBounds(obj) {
    if (obj.getBounds) {
      return obj.getBounds();
    }

    // Fallback: create bounds from position and size
    const size = obj.config?.size || 60;
    return new Phaser.Geom.Rectangle(
      obj.x - size/2,
      obj.y - size/2,
      size,
      size
    );
  }

  /**
   * Get object position
   */
  getObjectPosition(obj) {
    return { x: obj.x, y: obj.y };
  }

  /**
   * Find nearest object in a layer to a point
   */
  findNearestInLayer(layerName, point, maxDistance = Infinity) {
    const layer = this.collisionLayers.get(layerName);
    if (!layer) return null;

    let nearest = null;
    let minDistance = maxDistance;

    for (const obj of layer) {
      const pos = this.getObjectPosition(obj);
      const distance = Phaser.Math.Distance.Between(point.x, point.y, pos.x, pos.y);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = obj;
      }
    }

    return nearest ? { object: nearest, distance: minDistance } : null;
  }

  /**
   * Find all objects in layer within radius of point
   */
  findInRadius(layerName, point, radius) {
    const layer = this.collisionLayers.get(layerName);
    if (!layer) return [];

    const results = [];

    for (const obj of layer) {
      const pos = this.getObjectPosition(obj);
      const distance = Phaser.Math.Distance.Between(point.x, point.y, pos.x, pos.y);

      if (distance <= radius) {
        results.push({ object: obj, distance });
      }
    }

    return results.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get objects at specific point
   */
  getObjectsAtPoint(layerName, point) {
    const layer = this.collisionLayers.get(layerName);
    if (!layer) return [];

    const results = [];

    for (const obj of layer) {
      if (obj.containsPoint && obj.containsPoint(point.x, point.y)) {
        results.push(obj);
      } else {
        // Fallback to bounds check
        const bounds = this.getObjectBounds(obj);
        if (bounds.contains(point.x, point.y)) {
          results.push(obj);
        }
      }
    }

    return results;
  }

  /**
   * Advanced collision testing with shapes
   */
  testAdvancedCollision(objA, objB, options = {}) {
    const {
      shapeA = 'rectangle',
      shapeB = 'rectangle',
      rotationA = 0,
      rotationB = 0,
      scaleA = 1,
      scaleB = 1
    } = options;

    // Get basic bounds
    const boundsA = this.getObjectBounds(objA);
    const boundsB = this.getObjectBounds(objB);

    // Apply transformations
    const transformedBoundsA = this.applyTransformation(boundsA, objA, { rotation: rotationA, scale: scaleA });
    const transformedBoundsB = this.applyTransformation(boundsB, objB, { rotation: rotationB, scale: scaleB });

    // Test based on shape types
    switch (`${shapeA}_${shapeB}`) {
      case 'rectangle_rectangle':
        return this.testRectangleCollision(transformedBoundsA, transformedBoundsB);

      case 'circle_circle':
        return this.testCircleCollision(transformedBoundsA, transformedBoundsB);

      case 'rectangle_circle':
        return this.testRectangleCircleCollision(transformedBoundsA, transformedBoundsB);

      case 'circle_rectangle':
        return this.testRectangleCircleCollision(transformedBoundsB, transformedBoundsA);

      default:
        return this.testRectangleCollision(transformedBoundsA, transformedBoundsB);
    }
  }

  /**
   * Apply transformation to bounds
   */
  applyTransformation(bounds, obj, transform) {
    const { rotation = 0, scale = 1 } = transform;
    const centerX = obj.x;
    const centerY = obj.y;

    // For now, return original bounds (advanced transformation would be more complex)
    return bounds;
  }

  /**
   * Test circle collision (approximating rectangles as circles)
   */
  testCircleCollision(boundsA, boundsB) {
    const centerA = {
      x: boundsA.x + boundsA.width/2,
      y: boundsA.y + boundsA.height/2
    };
    const radiusA = Math.min(boundsA.width, boundsA.height) / 2;

    const centerB = {
      x: boundsB.x + boundsB.width/2,
      y: boundsB.y + boundsB.height/2
    };
    const radiusB = Math.min(boundsB.width, boundsB.height) / 2;

    const distance = Phaser.Math.Distance.Between(centerA.x, centerA.y, centerB.x, centerB.y);
    return distance < (radiusA + radiusB);
  }

  /**
   * Test rectangle-circle collision
   */
  testRectangleCircleCollision(rectBounds, circleBounds) {
    const circleCenter = {
      x: circleBounds.x + circleBounds.width/2,
      y: circleBounds.y + circleBounds.height/2
    };
    const circleRadius = Math.min(circleBounds.width, circleBounds.height) / 2;

    // Find closest point on rectangle to circle center
    const closestX = Math.max(rectBounds.x, Math.min(circleCenter.x, rectBounds.x + rectBounds.width));
    const closestY = Math.max(rectBounds.y, Math.min(circleCenter.y, rectBounds.y + rectBounds.height));

    const distance = Phaser.Math.Distance.Between(circleCenter.x, circleCenter.y, closestX, closestY);
    return distance < circleRadius;
  }

  /**
   * Create spatial partitioning for performance
   */
  createSpatialGrid(cellSize = 100) {
    return {
      cellSize,
      grid: new Map(),

      addObject: (obj) => {
        const bounds = this.getObjectBounds(obj);
        const cells = this.getCellsForBounds(bounds, cellSize);

        cells.forEach(cellKey => {
          if (!this.grid.has(cellKey)) {
            this.grid.set(cellKey, new Set());
          }
          this.grid.get(cellKey).add(obj);
        });
      },

      removeObject: (obj) => {
        this.grid.forEach(cell => cell.delete(obj));
      },

      getNearbyObjects: (point, radius) => {
        const cells = this.getCellsInRadius(point, radius, cellSize);
        const nearby = new Set();

        cells.forEach(cellKey => {
          const cellObjects = this.grid.get(cellKey);
          if (cellObjects) {
            cellObjects.forEach(obj => nearby.add(obj));
          }
        });

        return Array.from(nearby);
      }
    };
  }

  /**
   * Get grid cells for bounds
   */
  getCellsForBounds(bounds, cellSize) {
    const cells = new Set();
    const startX = Math.floor(bounds.x / cellSize);
    const endX = Math.floor((bounds.x + bounds.width) / cellSize);
    const startY = Math.floor(bounds.y / cellSize);
    const endY = Math.floor((bounds.y + bounds.height) / cellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.add(`${x}_${y}`);
      }
    }

    return cells;
  }

  /**
   * Get cells in radius
   */
  getCellsInRadius(point, radius, cellSize) {
    const cells = new Set();
    const centerCellX = Math.floor(point.x / cellSize);
    const centerCellY = Math.floor(point.y / cellSize);
    const cellRadius = Math.ceil(radius / cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        cells.add(`${centerCellX + dx}_${centerCellY + dy}`);
      }
    }

    return cells;
  }

  /**
   * Update collision detection (call in game loop)
   */
  update() {
    // Check all registered collision pairs
    const layerNames = Array.from(this.collisionLayers.keys());

    for (let i = 0; i < layerNames.length; i++) {
      for (let j = i + 1; j < layerNames.length; j++) {
        this.checkCollisions(layerNames[i], layerNames[j]);
      }
    }
  }

  /**
   * Clear all collision data
   */
  clear() {
    this.collisionLayers.clear();
    this.collisionCallbacks.clear();
  }

  /**
   * Get collision statistics
   */
  getStats() {
    const stats = {
      layers: this.collisionLayers.size,
      totalObjects: 0,
      callbacks: this.collisionCallbacks.size
    };

    this.collisionLayers.forEach(layer => {
      stats.totalObjects += layer.size;
    });

    return stats;
  }
}