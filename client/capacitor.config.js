const config = {
  appId: 'com.ailifeos.app',
  appName: 'AI LifeOS',
  webDir: 'dist',
  server: {
    // In development, point to your local Vite dev server
    // Uncomment the line below and replace with your machine's local IP
    // url: 'http://192.168.1.X:3000',
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#6366f1',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
