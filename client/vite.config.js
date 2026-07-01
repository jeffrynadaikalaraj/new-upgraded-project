import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Allow access from local network (needed for Capacitor live reload)
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Output to 'dist' — this is what Capacitor reads (configured in capacitor.config.ts)
    outDir: 'www',
    sourcemap: false,
    // Optimize chunk size for mobile
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
});
