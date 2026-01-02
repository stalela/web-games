/**
 * InputManager - Unified input handling system for Lalela games
 * Handles touch, mouse, keyboard, and gesture inputs across all devices
 */
export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.isTouchDevice = this.detectTouchDevice();
    this.activePointers = new Map();
    this.gestureState = {
      isDragging: false,
      dragStart: null,
      dragThreshold: 10,
      lastTap: 0,
      tapCount: 0,
      pinchDistance: 0,
      isPinching: false
    };

    this.eventCallbacks = new Map();
    this.setupInput();
  }

  /**
   * Detect if device supports touch
   */
  detectTouchDevice() {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0);
  }

  /**
   * Setup input event handlers
   */
  setupInput() {
    if (!this.scene || !this.scene.input) {
      console.warn('Scene input not available, deferring input setup');
      return;
    }

    const input = this.scene.input;

    // Enable multi-touch
    input.addPointer(2);

    // Mouse events
    input.on('pointerdown', this.onPointerDown, this);
    input.on('pointerup', this.onPointerUp, this);
    input.on('pointermove', this.onPointerMove, this);

    // Touch-specific events
    if (this.isTouchDevice) {
      input.on('gesturestart', this.onGestureStart, this);
      input.on('gestureupdate', this.onGestureUpdate, this);
      input.on('gestureend', this.onGestureEnd, this);
    }

    // Keyboard events
    this.setupKeyboardInput();

    // Prevent default behaviors that interfere with games
    this.preventDefaultBehaviors();
  }

  /**
   * Setup keyboard input
   */
  setupKeyboardInput() {
    if (!this.scene.input.keyboard) return;

    const keys = this.scene.input.keyboard.addKeys({
      'W': Phaser.Input.Keyboard.KeyCodes.W,
      'A': Phaser.Input.Keyboard.KeyCodes.A,
      'S': Phaser.Input.Keyboard.KeyCodes.S,
      'D': Phaser.Input.Keyboard.KeyCodes.D,
      'UP': Phaser.Input.Keyboard.KeyCodes.UP,
      'DOWN': Phaser.Input.Keyboard.KeyCodes.DOWN,
      'LEFT': Phaser.Input.Keyboard.KeyCodes.LEFT,
      'RIGHT': Phaser.Input.Keyboard.KeyCodes.RIGHT,
      'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
      'ENTER': Phaser.Input.Keyboard.KeyCodes.ENTER,
      'ESC': Phaser.Input.Keyboard.KeyCodes.ESC,
      'TAB': Phaser.Input.Keyboard.KeyCodes.TAB
    });

    // Movement keys
    this.movementKeys = {
      up: [keys.W, keys.UP],
      down: [keys.S, keys.DOWN],
      left: [keys.A, keys.LEFT],
      right: [keys.D, keys.RIGHT]
    };

    // Action keys
    this.actionKeys = {
      space: keys.SPACE,
      enter: keys.ENTER,
      esc: keys.ESC,
      tab: keys.TAB
    };
  }

  /**
   * Prevent default browser behaviors
   */
  preventDefaultBehaviors() {
    // Prevent context menu on right click
    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.emit('contextmenu', { x: pointer.x, y: pointer.y });
        return false;
      }
    });

    // Prevent text selection
    document.addEventListener('selectstart', (e) => {
      if (this.scene.game.canvas.contains(e.target)) {
        e.preventDefault();
      }
    });

    // Prevent touch scrolling
    document.addEventListener('touchmove', (e) => {
      if (this.scene.game.canvas.contains(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  /**
   * Handle pointer down events
   */
  onPointerDown(pointer) {
    const pointerId = pointer.id;
    const position = { x: pointer.x, y: pointer.y, worldX: pointer.worldX, worldY: pointer.worldY };

    this.activePointers.set(pointerId, {
      pointer,
      startPosition: { ...position },
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    });

    // Check for multi-touch gestures
    if (this.activePointers.size === 2 && this.isTouchDevice) {
      this.startPinchGesture();
    }

    // Handle tap detection
    this.handleTap(pointer);

    // Emit events
    this.emit('pointerdown', { pointerId, position, pointer });
    this.emit('touchstart', { pointerId, position, pointer }); // Alias for compatibility
  }

  /**
   * Handle pointer up events
   */
  onPointerUp(pointer) {
    const pointerId = pointer.id;
    const pointerData = this.activePointers.get(pointerId);

    if (pointerData) {
      const position = { x: pointer.x, y: pointer.y, worldX: pointer.worldX, worldY: pointer.worldY };
      const wasDragging = pointerData.isDragging;

      // Handle drag end
      if (wasDragging) {
        this.emit('dragend', {
          pointerId,
          startPosition: pointerData.startPosition,
          endPosition: position,
          offset: pointerData.dragOffset
        });
      }

      // Handle tap/click
      if (!wasDragging) {
        this.emit('tap', { pointerId, position });
        this.emit('click', { pointerId, position }); // Alias for compatibility
      }

      this.activePointers.delete(pointerId);
    }

    // End pinch gesture if applicable
    if (this.activePointers.size < 2 && this.gestureState.isPinching) {
      this.endPinchGesture();
    }

    this.emit('pointerup', { pointerId, position: { x: pointer.x, y: pointer.y } });
    this.emit('touchend', { pointerId, position: { x: pointer.x, y: pointer.y } }); // Alias
  }

  /**
   * Handle pointer move events
   */
  onPointerMove(pointer) {
    const pointerId = pointer.id;
    const pointerData = this.activePointers.get(pointerId);

    if (!pointerData) return;

    const currentPosition = { x: pointer.x, y: pointer.y, worldX: pointer.worldX, worldY: pointer.worldY };
    const startPosition = pointerData.startPosition;

    // Calculate drag offset
    const offsetX = currentPosition.x - startPosition.x;
    const offsetY = currentPosition.y - startPosition.y;
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    // Start dragging if threshold exceeded
    if (!pointerData.isDragging && distance > this.gestureState.dragThreshold) {
      pointerData.isDragging = true;
      this.gestureState.isDragging = true;

      this.emit('dragstart', {
        pointerId,
        startPosition,
        currentPosition
      });
    }

    // Update drag data
    if (pointerData.isDragging) {
      pointerData.dragOffset = { x: offsetX, y: offsetY };

      this.emit('drag', {
        pointerId,
        startPosition,
        currentPosition,
        offset: pointerData.dragOffset,
        distance
      });
    }

    // Handle pinch gesture updates
    if (this.gestureState.isPinching && this.activePointers.size === 2) {
      this.updatePinchGesture();
    }

    // Emit general move event
    this.emit('pointermove', { pointerId, position: currentPosition, pointer });
  }

  /**
   * Handle tap detection
   */
  handleTap(pointer) {
    const now = Date.now();
    const timeDiff = now - this.gestureState.lastTap;

    if (timeDiff < 300) { // Double tap threshold
      this.gestureState.tapCount++;

      if (this.gestureState.tapCount === 2) {
        this.emit('doubletap', { x: pointer.x, y: pointer.y });
        this.gestureState.tapCount = 0;
      }
    } else {
      this.gestureState.tapCount = 1;

      // Single tap timeout
      setTimeout(() => {
        if (this.gestureState.tapCount === 1) {
          // Single tap already handled in pointerup
          this.gestureState.tapCount = 0;
        }
      }, 300);
    }

    this.gestureState.lastTap = now;
  }

  /**
   * Gesture handling for multi-touch
   */
  onGestureStart(event) {
    this.emit('gesturestart', event);
  }

  onGestureUpdate(event) {
    this.emit('gestureupdate', event);
  }

  onGestureEnd(event) {
    this.emit('gestureend', event);
  }

  /**
   * Pinch gesture handling
   */
  startPinchGesture() {
    const pointers = Array.from(this.activePointers.values());
    if (pointers.length === 2) {
      const p1 = pointers[0].pointer;
      const p2 = pointers[1].pointer;

      this.gestureState.pinchDistance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
      this.gestureState.isPinching = true;

      this.emit('pinchstart', {
        distance: this.gestureState.pinchDistance,
        pointers: [p1, p2]
      });
    }
  }

  updatePinchGesture() {
    const pointers = Array.from(this.activePointers.values());
    if (pointers.length === 2 && this.gestureState.isPinching) {
      const p1 = pointers[0].pointer;
      const p2 = pointers[1].pointer;

      const newDistance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
      const deltaDistance = newDistance - this.gestureState.pinchDistance;
      const scale = newDistance / this.gestureState.pinchDistance;

      this.emit('pinch', {
        distance: newDistance,
        deltaDistance,
        scale,
        pointers: [p1, p2]
      });

      this.gestureState.pinchDistance = newDistance;
    }
  }

  endPinchGesture() {
    this.gestureState.isPinching = false;
    this.emit('pinchend');
  }

  /**
   * Event system for input callbacks
   */
  on(eventType, callback, context = null) {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType).push({ callback, context });
  }

  off(eventType, callback = null) {
    if (!this.eventCallbacks.has(eventType)) return;

    if (callback) {
      const callbacks = this.eventCallbacks.get(eventType);
      const index = callbacks.findIndex(cb => cb.callback === callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.eventCallbacks.delete(eventType);
    }
  }

  emit(eventType, data = {}) {
    if (!this.eventCallbacks.has(eventType)) return;

    const callbacks = this.eventCallbacks.get(eventType);
    callbacks.forEach(({ callback, context }) => {
      try {
        callback.call(context || this, data);
      } catch (error) {
        console.error(`Error in ${eventType} callback:`, error);
      }
    });
  }

  /**
   * Utility methods for common input checks
   */
  isMovementKeyPressed(direction) {
    if (!this.movementKeys[direction]) return false;
    return this.movementKeys[direction].some(key => key.isDown);
  }

  isActionKeyPressed(action) {
    if (!this.actionKeys[action]) return false;
    return this.actionKeys[action].isDown;
  }

  getPointerCount() {
    return this.activePointers.size;
  }

  getActivePointers() {
    return Array.from(this.activePointers.values()).map(data => data.pointer);
  }

  /**
   * Enable/disable input
   */
  enable() {
    this.scene.input.enabled = true;
  }

  disable() {
    this.scene.input.enabled = false;
    this.activePointers.clear();
    this.gestureState.isDragging = false;
    this.gestureState.isPinching = false;
  }

  /**
   * Clean up
   */
  destroy() {
    this.scene.input.removeAllListeners();
    this.activePointers.clear();
    this.eventCallbacks.clear();
  }
}