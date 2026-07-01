/**
 * Platform Detection Utility
 * Detects whether the app is running inside a Capacitor native shell
 * or in a standard web browser. Used throughout the app to conditionally
 * enable native features.
 */
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform(); // 'web' | 'android' | 'ios'
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isWeb = () => Capacitor.getPlatform() === 'web';

/**
 * Check if a specific Capacitor plugin is available on the current platform.
 * Useful for graceful degradation on web.
 */
export const isPluginAvailable = (pluginName) => {
  return Capacitor.isPluginAvailable(pluginName);
};
