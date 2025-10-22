import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/game.css';
import './styles/accessibility.css';
import { validateEnvironment } from './utils/security';

// Validate environment variables on startup
try {
  validateEnvironment();
} catch (error) {
  console.warn('Environment validation warning:', error);
  // Continue execution with warning - app should work without API keys
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
