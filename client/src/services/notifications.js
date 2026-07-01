/**
 * Push Notification Service
 * Handles registration and incoming push notifications via
 * Firebase Cloud Messaging on native platforms.
 * Gracefully degrades to a no-op on web.
 */
import { PushNotifications } from '@capacitor/push-notifications';
import { isNativePlatform, isPluginAvailable } from '../utils/platform';

class NotificationService {
  constructor() {
    this._listeners = [];
    this._initialized = false;
  }

  /**
   * Initialize push notification listeners.
   * Call this once at app startup (e.g., in main.jsx or App.jsx).
   */
  async initialize() {
    if (!isNativePlatform() || !isPluginAvailable('PushNotifications')) {
      console.log('[Notifications] Not on native platform, skipping push setup.');
      return;
    }

    if (this._initialized) return;

    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.warn('[Notifications] Push notification permission denied.');
      return;
    }

    // Register with FCM
    await PushNotifications.register();

    // Registration success — you get the FCM token here
    PushNotifications.addListener('registration', (token) => {
      console.log('[Notifications] FCM Token:', token.value);
      // TODO: Send this token to your backend so you can push to this device
      // e.g., api.post('/users/fcm-token', { token: token.value });
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Notifications] Registration Error:', error);
    });

    // Notification received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Notifications] Received in foreground:', notification);
      this._listeners.forEach((cb) => cb(notification));
    });

    // Notification tapped (app opened from notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Notifications] Notification tapped:', action);
      // Navigate to relevant screen based on action.notification.data
    });

    this._initialized = true;
    console.log('[Notifications] Push notifications initialized.');
  }

  /**
   * Subscribe to foreground notification events.
   * @param {Function} callback - Called with the notification payload.
   * @returns {Function} unsubscribe function
   */
  onNotification(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    };
  }
}

const notificationService = new NotificationService();
export default notificationService;
