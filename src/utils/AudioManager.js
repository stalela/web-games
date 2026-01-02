import { Howl, Howler } from 'howler';

/**
 * AudioManager - Handles all audio-related functionality for Lalela games
 * Manages sound effects, background music, voiceovers, and audio settings
 */
export class AudioManager {
  constructor() {
    this.howler = null;
    this.sounds = new Map();
    this.musicTracks = new Map();
    this.currentMusic = null;
    this.masterVolume = 1.0;
    this.sfxVolume = 1.0;
    this.musicVolume = 1.0;
    this.voiceVolume = 1.0;
    this.isMuted = false;

    this.initializeHowler();
    this.loadSettings();
  }

  /**
   * Initialize Howler.js audio context
   */
  initializeHowler() {
    // Configure Howler for optimal performance
    Howler.autoUnlock = true;
    Howler.html5PoolSize = 10;
    Howler.autoSuspend = false;

    // Handle audio context issues on mobile
    this.handleMobileAudio();
  }

  /**
   * Handle mobile audio initialization issues
   */
  handleMobileAudio() {
    // Create a silent audio context to unlock Web Audio API on mobile
    const unlockAudio = () => {
      const silentSound = new Howl({
        src: [this.createSilentAudio()],
        autoplay: true,
        volume: 0.01,
        onplay: () => {
          Howler.ctx.resume().then(() => {
            silentSound.unload();
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('touchend', unlockAudio);
            document.removeEventListener('click', unlockAudio);
          });
        }
      });
    };

    // Add unlock listeners for mobile devices
    if (this.isMobileDevice()) {
      document.addEventListener('touchstart', unlockAudio, { once: true });
      document.addEventListener('touchend', unlockAudio, { once: true });
      document.addEventListener('click', unlockAudio, { once: true });
    }
  }

  /**
   * Create a silent audio file for mobile unlock
   */
  createSilentAudio() {
    // Create a tiny silent WAV file
    const sampleRate = 44100;
    const duration = 0.1;
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Check if device is mobile
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Load audio settings from localStorage
   */
  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('lalela_audio_settings') || '{}');
      this.masterVolume = settings.masterVolume || 1.0;
      this.sfxVolume = settings.sfxVolume || 1.0;
      this.musicVolume = settings.musicVolume || 1.0;
      this.voiceVolume = settings.voiceVolume || 1.0;
      this.isMuted = settings.isMuted || false;
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
  }

  /**
   * Save audio settings to localStorage
   */
  saveSettings() {
    try {
      const settings = {
        masterVolume: this.masterVolume,
        sfxVolume: this.sfxVolume,
        musicVolume: this.musicVolume,
        voiceVolume: this.voiceVolume,
        isMuted: this.isMuted
      };
      localStorage.setItem('lalela_audio_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }

  /**
   * Load a sound effect
   */
  loadSound(key, url, options = {}) {
    if (typeof Howl === 'undefined') return null;

    const sound = new Howl({
      src: Array.isArray(url) ? url : [url],
      volume: (this.sfxVolume * this.masterVolume) * (options.volume || 1.0),
      loop: options.loop || false,
      preload: options.preload !== false,
      onload: () => {
        console.log(`Loaded sound: ${key}`);
      },
      onloaderror: (id, error) => {
        console.warn(`Failed to load sound ${key}:`, error.message || 'File not found');
        // Don't add to sounds map if loading failed
        return;
      },
      ...options
    });

    this.sounds.set(key, sound);
    return sound;
  }

  /**
   * Load background music
   */
  loadMusic(key, url, options = {}) {
    if (typeof Howl === 'undefined') return null;

    const music = new Howl({
      src: Array.isArray(url) ? url : [url],
      volume: (this.musicVolume * this.masterVolume) * (options.volume || 1.0),
      loop: options.loop !== false,
      preload: options.preload !== false,
      onload: () => {
        console.log(`Loaded music: ${key}`);
      },
      onloaderror: (id, error) => {
        console.error(`Failed to load music ${key}:`, error);
      },
      ...options
    });

    this.musicTracks.set(key, music);
    return music;
  }

  /**
   * Play a sound effect
   */
  playSound(key, options = {}) {
    const sound = this.sounds.get(key);
    if (!sound) {
      console.warn(`Sound not found: ${key}`);
      return null;
    }

    if (this.isMuted) return null;

    const volume = options.volume !== undefined ?
      (this.sfxVolume * this.masterVolume * options.volume) :
      (this.sfxVolume * this.masterVolume);

    return sound.play({
      volume,
      ...options
    });
  }

  /**
   * Play background music
   */
  playMusic(key, options = {}) {
    // Stop current music
    this.stopMusic();

    const music = this.musicTracks.get(key);
    if (!music) {
      console.warn(`Music not found: ${key}`);
      return null;
    }

    if (this.isMuted) return null;

    this.currentMusic = key;
    const volume = options.volume !== undefined ?
      (this.musicVolume * this.masterVolume * options.volume) :
      (this.musicVolume * this.masterVolume);

    return music.play({
      volume,
      ...options
    });
  }

  /**
   * Stop current music
   */
  stopMusic() {
    if (this.currentMusic) {
      const music = this.musicTracks.get(this.currentMusic);
      if (music) {
        music.stop();
      }
      this.currentMusic = null;
    }
  }

  /**
   * Pause current music
   */
  pauseMusic() {
    if (this.currentMusic) {
      const music = this.musicTracks.get(this.currentMusic);
      if (music) {
        music.pause();
      }
    }
  }

  /**
   * Resume current music
   */
  resumeMusic() {
    if (this.currentMusic) {
      const music = this.musicTracks.get(this.currentMusic);
      if (music) {
        music.play();
      }
    }
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveSettings();
  }

  /**
   * Set sound effects volume (0.0 to 1.0)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateSoundVolumes();
    this.saveSettings();
  }

  /**
   * Set music volume (0.0 to 1.0)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolumes();
    this.saveSettings();
  }

  /**
   * Set voice volume (0.0 to 1.0)
   */
  setVoiceVolume(volume) {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
    // Update voice volumes if implemented
    this.saveSettings();
  }

  /**
   * Mute/unmute all audio
   */
  setMuted(muted) {
    this.isMuted = muted;
    Howler.mute(muted);
    this.saveSettings();
  }

  /**
   * Update volumes for all sounds
   */
  updateAllVolumes() {
    this.updateSoundVolumes();
    this.updateMusicVolumes();
  }

  /**
   * Update volumes for sound effects
   */
  updateSoundVolumes() {
    this.sounds.forEach(sound => {
      sound.volume(this.sfxVolume * this.masterVolume);
    });
  }

  /**
   * Update volumes for music tracks
   */
  updateMusicVolumes() {
    this.musicTracks.forEach(music => {
      music.volume(this.musicVolume * this.masterVolume);
    });
  }

  /**
   * Get current volume levels
   */
  getVolumeLevels() {
    return {
      master: this.masterVolume,
      sfx: this.sfxVolume,
      music: this.musicVolume,
      voice: this.voiceVolume,
      muted: this.isMuted
    };
  }

  /**
   * Preload common game sounds
   */
  preloadCommonSounds() {
    // Skip loading audio files that don't exist to avoid 404 errors
    // In a production environment, these files would be provided
    console.log('Audio files not available - audio functionality limited to available sounds only');
  }

  /**
   * Check if audio is available and working
   */
  isAudioAvailable() {
    return typeof Howl !== 'undefined' && Howler.ctx && Howler.ctx.state === 'running';
  }

  /**
   * Get audio statistics
   */
  getStats() {
    return {
      soundsLoaded: this.sounds.size,
      musicTracksLoaded: this.musicTracks.size,
      currentMusic: this.currentMusic,
      isMuted: this.isMuted,
      audioAvailable: this.isAudioAvailable(),
      volumeLevels: this.getVolumeLevels()
    };
  }

  /**
   * Clean up audio resources
   */
  unloadSound(key) {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.unload();
      this.sounds.delete(key);
    }
  }

  /**
   * Clean up all audio resources
   */
  destroy() {
    // Stop all sounds
    this.sounds.forEach(sound => sound.stop());
    this.musicTracks.forEach(music => music.stop());

    // Unload all resources
    this.sounds.forEach(sound => sound.unload());
    this.musicTracks.forEach(music => music.unload());

    // Clear collections
    this.sounds.clear();
    this.musicTracks.clear();
    this.currentMusic = null;
  }
}