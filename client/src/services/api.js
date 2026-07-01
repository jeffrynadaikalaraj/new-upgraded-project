import axios from 'axios';
import storage from '../utils/storage';

// In production: VITE_API_URL = https://your-backend.onrender.com/api
// In development: Vite proxy forwards /api → http://localhost:5001
// On Capacitor native: Use the full backend URL (no proxy available)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout for mobile networks
});

// In-memory token cache to avoid async storage reads on every request
let _tokenCache = null;

/**
 * Initialize the token cache from storage.
 * Call this once at app startup before making any API calls.
 */
export async function initTokenCache() {
  _tokenCache = await storage.get('token');
}

/**
 * Update the cached token (called after login/register/refresh).
 */
export function setCachedToken(token) {
  _tokenCache = token;
}

/**
 * Clear the cached token (called on logout).
 */
export function clearCachedToken() {
  _tokenCache = null;
}

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Use cached token for sync access (falls back to localStorage for web)
    const token = _tokenCache || localStorage.getItem('token');
    if (token) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await storage.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        // Try to get new token
        const res = await axios.post('/api/auth/refresh', { refreshToken });
        
        if (res.data.token) {
          await storage.set('token', res.data.token);
          setCachedToken(res.data.token);
          
          // Retry original request with new token using .set() for AxiosHeaders compatibility
          if (typeof originalRequest.headers.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${res.data.token}`);
          } else {
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        await storage.remove('token');
        await storage.remove('refreshToken');
        clearCachedToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
