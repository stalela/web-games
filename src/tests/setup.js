/**
 * Jest setup file - Configure testing environment
 */

// Mock Phaser
const mockContainer = jest.fn().mockImplementation(function(scene, x, y) {
  this.scene = scene;
  this.x = x || 0;
  this.y = y || 0;
  this.setDepth = jest.fn().mockReturnThis();
  this.setAlpha = jest.fn().mockReturnThis();
  this.setScale = jest.fn().mockReturnThis();
  this.setVisible = jest.fn().mockReturnThis();
  this.destroy = jest.fn();
  this.add = jest.fn().mockReturnThis();
});

const mockRectangle = jest.fn().mockImplementation(function(x, y, width, height, fillColor) {
  this.x = x || 0;
  this.y = y || 0;
  this.setFillStyle = jest.fn().mockReturnThis();
  this.setStrokeStyle = jest.fn().mockReturnThis();
  this.setSize = jest.fn().mockReturnThis();
  this.setVisible = jest.fn().mockReturnThis();
  this.destroy = jest.fn();
  return this;
});

const mockText = jest.fn().mockImplementation(function(x, y, text, style) {
  this.x = x || 0;
  this.y = y || 0;
  this.setText = jest.fn().mockReturnThis();
  this.setOrigin = jest.fn().mockReturnThis();
  this.setInteractive = jest.fn().mockReturnThis();
  this.on = jest.fn().mockReturnThis();
  this.setVisible = jest.fn().mockReturnThis();
  this.destroy = jest.fn();
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
      getScene: jest.fn()
    },
    config: { width: 800, height: 600 },
    scale: { resize: jest.fn() },
    input: {
      enabled: true,
      addPointer: jest.fn(),
      on: jest.fn(),
      removeAllListeners: jest.fn()
    }
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: mockText.mockImplementation((x, y, text, style) => new mockText(x, y, text, style)),
    cameras: { main: { setBackgroundColor: jest.fn() } },
    physics: { world: { setBounds: jest.fn() }, pause: jest.fn(), resume: jest.fn() },
    input: { keyboard: { addKeys: jest.fn() }, on: jest.fn() },
    load: { on: jest.fn(), image: jest.fn() },
    time: { delayedCall: jest.fn() },
    sound: { get: jest.fn(), play: jest.fn() },
    tweens: { add: jest.fn() },
    events: { emit: jest.fn() },
    scale: { width: 800, height: 600 }
  })),
  GameObjects: {
    Container: mockContainer,
    Rectangle: mockRectangle,
    Text: mockText
  },
  Geom: {
    Rectangle: jest.fn().mockImplementation((x, y, width, height) => ({
      x: x || 0, y: y || 0, width: width || 0, height: height || 0,
      contains: jest.fn().mockReturnValue(false)
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
  volume: jest.fn(),
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
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.localStorage = localStorageMock;

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
    localStorage.clear();
  }
};

// Setup and teardown
beforeEach(() => {
  testUtils.cleanup();
});

afterEach(() => {
  testUtils.cleanup();
});