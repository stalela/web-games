/**
 * AssetManager - Advanced asset preloading and caching system
 * Manages images, audio, fonts, and other game resources with progress tracking
 */
export class AssetManager {
  constructor() {
    this.loadedAssets = new Map();
    this.loadingPromises = new Map();
    this.assetCache = new Map();
    this.loadingProgress = new Map();
    this.assetManifest = null;
    this.preloadedAssets = new Set();
  }

  /**
   * Initialize comprehensive asset manifest for all games
   */
  initializeAssetManifest() {
    this.assetManifest = {
      core: {
        images: [
          // Core UI assets - will be created programmatically if needed
        ],
        audio: [
          // Audio assets - games will work without them, using Web Audio API fallbacks
        ],
        fonts: [
          // Fonts loaded via Google Fonts in HTML, no local assets needed
        ]
      },

      games: {
        // All games use programmatically created graphics
        // No external asset files needed - games work with colored shapes and text
        AdjacentNumbers: { images: [], audio: [] },
        SmallnumbersGame: { images: ['dice0', 'dice1', 'dice2', 'dice3', 'dice4', 'dice5', 'dice6', 'dice7', 'dice8', 'dice9', 'smallnumbers_bg'], audio: [] },
        Smallnumbers2Game: { images: ['smallnumbers2_bg'], audio: [] },
        LearnQuantitiesGame: { images: ['learn_quantities_bg', 'orange', 'arrow_selector'], audio: [] },
        LearnAdditionsGame: { images: ['learn_additions_bg'], audio: [] },
        LearnSubtractionsGame: { images: ['learn_subtractions_bg'], audio: [] },
        VerticalAdditionGame: { images: ['vertical_addition_bg'], audio: [] },
        Guesscount: { images: [], audio: [] },
        MemoryImageGame: { images: [], audio: [] },
        MemorySoundGame: { images: [], audio: [] },
        BabyMatchGame: { images: [], audio: [] },

        ColorMixGame: { images: [], audio: [] },
        GeographyMapGame: { images: [], audio: [] },
        SoundButtonGame: { images: [], audio: [] },
        LearnDigitsGame: { images: [], audio: [] }
      }
    };
  }

  /**
   * Comprehensive preload of all application assets
   */
  async preloadAllAssets(scene, onProgress = null) {
    if (!this.assetManifest) {
      this.initializeAssetManifest();
    }

    const totalAssets = this.countTotalAssets();

    // If no assets to load, immediately complete
    if (totalAssets === 0) {
      if (onProgress) onProgress(1);
      this.preloadedAssets.add('all');
      return;
    }

    let loadedAssets = 0;

    // Preload core assets first
    await this.preloadAssetGroup(this.assetManifest.core, scene, (progress) => {
      loadedAssets += progress;
      if (onProgress) onProgress(loadedAssets / totalAssets);
    });

    // Preload game assets
    for (const [gameId, gameAssets] of Object.entries(this.assetManifest.games)) {
      await this.preloadAssetGroup(gameAssets, scene, (progress) => {
        loadedAssets += progress;
        if (onProgress) onProgress(loadedAssets / totalAssets);
      });
    }

    // Mark all assets as preloaded
    this.preloadedAssets.add('all');
  }

  /**
   * Count total assets for progress calculation
   */
  countTotalAssets() {
    if (!this.assetManifest) return 0;

    let count = 0;

    // Count core assets
    count += this.countAssetsInGroup(this.assetManifest.core);

    // Count game assets
    for (const gameAssets of Object.values(this.assetManifest.games)) {
      count += this.countAssetsInGroup(gameAssets);
    }

    return count;
  }

  /**
   * Count assets in a specific group
   */
  countAssetsInGroup(assetGroup) {
    let count = 0;
    if (assetGroup.images) count += assetGroup.images.length;
    if (assetGroup.audio) count += assetGroup.audio.length;
    if (assetGroup.fonts) count += assetGroup.fonts.length;
    if (assetGroup.data) count += assetGroup.data.length;
    return count;
  }

  /**
   * Preload a group of assets with progress tracking
   */
  async preloadAssetGroup(assetGroup, scene, onProgress) {
    const promises = [];

    // Load images
    if (assetGroup.images) {
      promises.push(...assetGroup.images.map(asset =>
        this.loadAssetWithFallback(asset, 'image', scene)
      ));
    }

    // Load audio
    if (assetGroup.audio) {
      promises.push(...assetGroup.audio.map(asset =>
        this.loadAssetWithFallback(asset, 'audio', scene)
      ));
    }

    // Load fonts
    if (assetGroup.fonts) {
      promises.push(...assetGroup.fonts.map(asset =>
        this.loadAssetWithFallback(asset, 'font', scene)
      ));
    }

    // Load data
    if (assetGroup.data) {
      promises.push(...assetGroup.data.map(asset =>
        this.loadAssetWithFallback(asset, 'data', scene)
      ));
    }

    // Track progress
    let completed = 0;
    const total = promises.length;

    const progressPromises = promises.map(promise =>
      promise.then(() => {
        completed++;
        if (onProgress) onProgress(completed / total);
      })
    );

    await Promise.all(progressPromises);
  }

  /**
   * Load asset with fallback handling
   */
  async loadAssetWithFallback(asset, type, scene) {
    try {
      await this.loadAsset(asset, type, scene);
    } catch (error) {
      console.warn(`Failed to load ${type} asset: ${asset.key} from ${asset.url}`);

      // Try fallback if available
      if (asset.fallback) {
        try {
          await this.loadAsset({ key: asset.key, url: asset.fallback }, type, scene);
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${asset.key}: ${fallbackError}`);
          // Create placeholder or skip
        }
      }
    }
  }

  /**
   * Load individual asset
   */
  async loadAsset(asset, type, scene) {
    return new Promise((resolve, reject) => {
      try {
        switch (type) {
          case 'image':
            scene.load.image(asset.key, asset.url);
            break;
          case 'audio':
            scene.load.audio(asset.key, asset.url);
            break;
          case 'font':
            // For fonts, we might need custom loading
            // For now, assume they're loaded via CSS
            resolve();
            return;
          case 'data':
            scene.load.json(asset.key, asset.url);
            break;
          default:
            resolve();
            return;
        }

        scene.load.once('filecomplete', () => resolve());
        scene.load.once('filecomplete-failed', () => reject());

        // Start loading
        scene.load.start();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Load core application assets (legacy method for compatibility)
   */
  async loadCoreAssets() {
    if (!this.assetManifest) {
      this.initializeAssetManifest();
    }

    // For backward compatibility, just mark core as loaded
    this.preloadedAssets.add('core');
  }

  /**
   * Load assets for a specific game
   */
  async loadGameAssets(gameId) {
    // Check if already loaded
    if (this.loadedAssets.has(gameId)) {
      return this.loadedAssets.get(gameId);
    }

    // Check if already loading
    if (this.loadingPromises.has(gameId)) {
      return this.loadingPromises.get(gameId);
    }

    const loadPromise = this._loadGameAssetsInternal(gameId);
    this.loadingPromises.set(gameId, loadPromise);

    try {
      const assets = await loadPromise;
      this.loadedAssets.set(gameId, assets);
      this.loadingPromises.delete(gameId);
      return assets;
    } catch (error) {
      this.loadingPromises.delete(gameId);
      throw error;
    }
  }

  async _loadGameAssetsInternal(gameId) {
    // This would typically fetch from an API or load from local files
    // For now, return placeholder asset structure
    const gameAssets = {
      images: [],
      audio: [],
      data: []
    };

    // Simulate asset loading with proper structure
    switch (gameId) {
      case 'adjacent_numbers':
        gameAssets.images = [
          { key: 'number-tile', url: '/assets/games/adjacent_numbers/tile.svg' },
          { key: 'drop-zone', url: '/assets/games/adjacent_numbers/drop-zone.svg' }
        ];
        gameAssets.audio = [
          { key: 'tile-drop', url: '/assets/games/adjacent_numbers/drop.mp3' }
        ];
        break;

      case 'memory':
        gameAssets.images = [
          { key: 'card-back', url: '/assets/games/memory/card-back.svg' },
          { key: 'card-front-1', url: '/assets/games/memory/card-1.svg' },
          { key: 'card-front-2', url: '/assets/games/memory/card-2.svg' }
        ];
        gameAssets.audio = [
          { key: 'card-flip', url: '/assets/games/memory/flip.mp3' },
          { key: 'match-found', url: '/assets/games/memory/match.mp3' }
        ];
        break;

      case 'color_mix':
        gameAssets.images = [
          { key: 'color-palette', url: '/assets/games/color_mix/palette.svg' },
          { key: 'color-dropper', url: '/assets/games/color_mix/dropper.svg' }
        ];
        break;
    }

    // Preload assets
    await this.loadAssets(gameAssets);

    return gameAssets;
  }

  /**
   * Load assets into Phaser
   */
  async loadAssets(assetConfig, scene = null) {
    const promises = [];

    // Load images
    if (assetConfig.images) {
      promises.push(...assetConfig.images.map(asset =>
        this.loadImage(asset.key, asset.url, scene)
      ));
    }

    // Load audio
    if (assetConfig.audio) {
      promises.push(...assetConfig.audio.map(asset =>
        this.loadAudio(asset.key, asset.url, scene)
      ));
    }

    // Load data
    if (assetConfig.data) {
      promises.push(...assetConfig.data.map(asset =>
        this.loadData(asset.key, asset.url, scene)
      ));
    }

    await Promise.all(promises);
  }

  async loadImage(key, url, scene = null) {
    return new Promise((resolve, reject) => {
      if (scene) {
        scene.load.image(key, url);
        scene.load.once('filecomplete', resolve);
        scene.load.once('filecomplete-failed', reject);
      } else {
        // For global assets, we'd need to handle differently
        resolve();
      }
    });
  }

  async loadAudio(key, url, scene = null) {
    return new Promise((resolve, reject) => {
      if (scene) {
        scene.load.audio(key, url);
        scene.load.once('filecomplete', resolve);
        scene.load.once('filecomplete-failed', reject);
      } else {
        resolve();
      }
    });
  }

  async loadData(key, url, scene = null) {
    return new Promise((resolve, reject) => {
      if (scene) {
        scene.load.json(key, url);
        scene.load.once('filecomplete', resolve);
        scene.load.once('filecomplete-failed', reject);
      } else {
        resolve();
      }
    });
  }

  /**
   * Get cached asset
   */
  getAsset(key) {
    return this.assetCache.get(key);
  }

  /**
   * Cache asset for reuse
   */
  cacheAsset(key, asset) {
    this.assetCache.set(key, asset);
  }

  /**
   * Clear cached assets for a game
   */
  clearGameAssets(gameId) {
    if (this.loadedAssets.has(gameId)) {
      this.loadedAssets.delete(gameId);
    }
  }

  /**
   * Get loading progress
   */
  getLoadingProgress(gameId) {
    // This would be implemented to track loading progress
    return 0.5; // Placeholder
  }
}