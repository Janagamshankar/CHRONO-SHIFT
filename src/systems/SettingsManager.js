// SettingsManager.js - Central persistent settings store
class SettingsManager {
  constructor() {
    this.STORAGE_KEY = 'chrono_shift_settings_v1';
    this.defaults = {
      masterVolume: 80,
      musicVolume: 70,
      sfxVolume: 90,
      reducedMotion: false
    };

    this.settings = { ...this.defaults };
    this.loadSettings();
    this.listeners = new Set();
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.defaults, ...parsed };
      }
    } catch (e) {
      console.warn('[SettingsManager] LocalStorage unavailable, using defaults');
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[SettingsManager] Unable to save to LocalStorage');
    }
    this.notify();
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.settings);
      } catch (err) {
        console.error('[SettingsManager] Error in listener:', err);
      }
    }
  }
}

export const settingsManager = new SettingsManager();
