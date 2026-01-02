/**
 * Jest setup file - Configure testing environment
 */

// Mock Phaser GameObjects
const mockGameObject = jest.fn().mockImplementation(function(scene, x, y) {
  this.scene = scene;
  this.x = x || 0;
  this.y = y || 0;
  this.setScale = jest.fn().mockReturnThis();
  this.setDepth = jest.fn().mockReturnThis();
  this.setAlpha = jest.fn().mockReturnThis();
  this.setVisible = jest.fn().mockReturnThis();
  this.setInteractive = jest.fn().mockReturnThis();
  this.on = jest.fn().mockReturnThis();
  this.off = jest.fn().mockReturnThis();
  this.destroy = jest.fn();
  this.getBounds = jest.fn().mockReturnValue({ x: this.x, y: this.y, width: 10, height: 10 }); // Basic bounds for interaction
});

const mockContainer = jest.fn().mockImplementation(function(scene, x, y) {
  mockGameObject.call(this, scene, x, y); // Inherit common GameObject properties
  this.list = [];
  this.add = jest.fn(child => { this.list.push(child); return this; });
  this.remove = jest.fn(child => {
    const index = this.list.indexOf(child);
    if (index > -1) {
      this.list.splice(index, 1);
    }
    return this;
  });
  this.setSize = jest.fn().mockReturnThis();
  this.width = 100;
  this.height = 100;
  this.setOrigin = jest.fn().mockReturnThis();
  return this;
});

const mockRectangle = jest.fn().mockImplementation(function(scene, x, y, width, height, fillColor) {
  mockGameObject.call(this, scene, x, y); // Inherit common GameObject properties
  this.width = width || 0;
  this.height = height || 0;
  this.fillColor = fillColor;
  this.setFillStyle = jest.fn().mockReturnThis();
  this.setStrokeStyle = jest.fn().mockReturnThis();
  this.setDisplaySize = jest.fn().mockReturnThis();
  this.setOrigin = jest.fn().mockReturnThis();
  this.isPlayable = false; // For CheckersGame
  this.boardPos = -1; // For CheckersGame
  // Override getBounds for rectangle specific dimensions
  this.getBounds = jest.fn().mockReturnValue({ x: this.x - this.width/2, y: this.y - this.height/2, width: this.width, height: this.height });
  return this;
});

const mockImage = jest.fn().mockImplementation(function(scene, x, y, key) {
  mockGameObject.call(this, scene, x, y); // Inherit common GameObject properties
  this.key = key;
  this.setDisplaySize = jest.fn().mockReturnThis();
  this.setOrigin = jest.fn().mockReturnThis();
  this.pieceType = null; // For CheckersGame
  this.boardPos = -1; // For CheckersGame
  this.setTexture = jest.fn().mockReturnThis();
  return this;
});

const mockText = jest.fn().mockImplementation(function(scene, x, y, text, style) {
  mockGameObject.call(this, scene, x, y); // Inherit common GameObject properties
  this.text = text;
  this.style = style;
  this.setText = jest.fn().mockReturnThis();
  this.setOrigin = jest.fn().mockReturnThis();
  return this;
});

const mockCircle = jest.fn().mockImplementation(function(scene, x, y, radius, fillColor, alpha) {
  mockGameObject.call(this, scene, x, y);
  this.radius = radius;
  this.fillColor = fillColor;
  this.alpha = alpha;
  this.setFillStyle = jest.fn().mockReturnThis();
  return this;
});

global.Phaser = {
  Game: jest.fn().mockImplementation(() => ({
    scene: {
      add: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      getScene: jest.fn(),
      remove: jest.fn()
    },
    config: { width: 800, height: 600 },
    scale: { width: 800, height: 600, resize: jest.fn() },
    input: {
      enabled: true,
      addPointer: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      removeAllListeners: jest.fn(),
      setDraggable: jest.fn()
    },
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    },
    audioManager: { // Mock audioManager here
      playSound: jest.fn()
    }
  })),
  Scene: jest.fn().mockImplementation(function() {
    this.sys = {
      game: new global.Phaser.Game(), // Ensure game reference is available
      queueDepthSort: jest.fn(),
      displayList: { add: jest.fn(), remove: jest.fn() },
      updateList: { add: jest.fn(), remove: jest.fn() },
      scale: { width: 800, height: 600 }, // Mock scale property here
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
      }
    };
    this.add = {
      rectangle: jest.fn((...args) => new mockRectangle(this, ...args)),
      image: jest.fn((...args) => new mockImage(this, ...args)),
      text: jest.fn((...args) => new mockText(this, ...args)),
      container: jest.fn((...args) => new mockContainer(this, ...args)),
      graphics: jest.fn(() => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRoundedRect: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        strokeRoundedRect: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        off: jest.fn().mockReturnThis()
      })),
      circle: jest.fn((...args) => new mockCircle(this, ...args)),
      existing: jest.fn(gameObject => gameObject), // Important for adding custom GameObjects
    };
    this.cameras = { main: { setBackgroundColor: jest.fn(), fade: jest.fn() } };
    this.physics = { world: { setBounds: jest.fn() }, pause: jest.fn(), resume: jest.fn() };
    this.input = {
      keyboard: { addKeys: jest.fn() },
      on: jest.fn(),
      off: jest.fn(),
      setDraggable: jest.fn()
    };
    this.load = { on: jest.fn(), image: jest.fn(), svg: jest.fn(), audio: jest.fn() };
    this.time = { delayedCall: jest.fn() };
    this.sound = { get: jest.fn(), add: jest.fn(), play: jest.fn() };
    this.tweens = { add: jest.fn() };
    this.events = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    };
    this.scale = { width: 800, height: 600 }; // Ensure scale is available directly on the scene
    this.children = {
      bringToTop: jest.fn()
    };
  }),
  GameObjects: {
    Container: mockContainer,
    Rectangle: mockRectangle,
    Text: mockText,
    Image: mockImage,
    Graphics: jest.fn(),
    Zone: jest.fn()
  },
  Geom: {
    Rectangle: jest.fn().mockImplementation((x, y, width, height) => ({
      x: x || 0, y: y || 0, width: width || 0, height: height || 0,
      contains: jest.fn().mockReturnValue(false),
      setPosition: jest.fn(),
      setSize: jest.fn()
    })),
    Point: jest.fn()
  },
  Math: {
    Distance: { Between: jest.fn().mockReturnValue(0) },
    Clamp: jest.fn()
  },
  AUTO: 'AUTO',
  Scale: {
    RESIZE: 'RESIZE',
    CENTER_BOTH: 'CENTER_BOTH'
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        W: 87, A: 65, S: 83, D: 68,
        UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39,
        SPACE: 32, ENTER: 13, ESC: 27, TAB: 9
      }
    }
  }
};

// Mock Howler
global.Howl = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  volume: jest.fn().mockReturnThis(),
  unload: jest.fn()
}));

global.Howler = {
  ctx: { state: 'running' },
  autoUnlock: true,
  html5PoolSize: 10,
  autoSuspend: false,
  mute: jest.fn()
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock indexedDB
global.indexedDB = {
  open: jest.fn().mockImplementation(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      transaction: jest.fn().mockImplementation(() => ({
        objectStore: jest.fn().mockReturnValue({
          put: jest.fn(),
          get: jest.fn(),
          delete: jest.fn(),
          clear: jest.fn(),
          getAll: jest.fn(),
          count: jest.fn(),
          index: jest.fn().mockReturnValue({
            getAll: jest.fn(),
            openCursor: jest.fn()
          }),
          createIndex: jest.fn()
        })
      }))
    }
  }))
};

// Mock fetch
global.fetch = jest.fn();

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock URL constructor
global.URL = jest.fn().mockImplementation((url) => ({
  href: url,
  searchParams: {
    get: jest.fn(),
    set: jest.fn(),
    toString: jest.fn().mockReturnValue('')
  }
}));

// Global test utilities
global.testUtils = {
  // Create mock game data
  createMockGameData: (overrides = {}) => ({
    id: 'test-game',
    title: 'Test Game',
    description: 'A test game',
    category: 'logic',
    difficulty: 2,
    ...overrides
  }),

  // Create mock user
  createMockUser: (overrides = {}) => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    ...overrides
  }),

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  }),

  // Clean up after tests
  cleanup: () => {
    jest.clearAllMocks();
    localStorageMock.clear(); // Use the mocked localStorage.clear()
  },
  
  // A helper to create a mock scene for game classes
  createMockScene: () => {
    const scene = new Phaser.Scene();
    // Explicitly add a mock game object to the scene's sys
    scene.sys.game = new Phaser.Game();
    return scene;
  }
};

// Setup and teardown
beforeEach(() => {
  testUtils.cleanup();
});

afterEach(() => {
  testUtils.cleanup();
});