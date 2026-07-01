/**
 * Secure Storage Utility
 * Uses Capacitor Preferences (native encrypted storage) on mobile,
 * falls back to localStorage on web. This provides a unified API
 * so the rest of the app doesn't need to know about the platform.
 */
import { Preferences } from '@capacitor/preferences';
import { isNativePlatform } from './platform';

const storage = {
  /**
   * Store a key-value pair securely.
   */
  async set(key, value) {
    if (isNativePlatform()) {
      await Preferences.set({ key, value: typeof value === 'string' ? value : JSON.stringify(value) });
    } else {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  },

  /**
   * Retrieve a value by key.
   * @returns {Promise<string|null>}
   */
  async get(key) {
    if (isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  },

  /**
   * Remove a value by key.
   */
  async remove(key) {
    if (isNativePlatform()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },

  /**
   * Clear all stored data.
   */
  async clear() {
    if (isNativePlatform()) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  },
};

export default storage;
