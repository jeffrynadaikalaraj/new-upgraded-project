import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import './styles/index.css';

// Initialize secure auth token cache before rendering
import { useAuthStore } from './stores/authStore';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

// Initialize auth from secure storage, then render
useAuthStore.getState().initAuth().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <GoogleOAuthProvider clientId={clientId}>
          <App />
        </GoogleOAuthProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
});
