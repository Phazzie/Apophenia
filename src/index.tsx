/**
 * MAIN ENTRY POINT
 *
 * Bootstraps the React application with:
 * - React StrictMode for development checks
 * - CSS imports for styling
 * - Environment validation (non-blocking)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { GameErrorBoundary } from './components/ErrorBoundary';

// Import global styles
import './styles/game.css';
import './styles/accessibility.css';

// Optional: Environment validation
// Note: App should work without API keys (uses mock AI)
try {
  const hasGrokKey = !!import.meta.env.VITE_XAI_API_KEY;

  if (hasGrokKey) {
    console.log('✅ Grok API key detected - AI features enabled');
  } else {
    console.log('ℹ️  No API keys detected - running in MOCK mode');
    console.log('ℹ️  Set VITE_XAI_API_KEY to enable Grok AI');
  }
} catch (error) {
  console.warn('Environment check failed:', error);
}

// Render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameErrorBoundary>
      <App />
    </GameErrorBoundary>
  </React.StrictMode>,
);
