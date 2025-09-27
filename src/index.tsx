/**
 * @file index.tsx
 * @description The main entry point for the React application.
 * This file is responsible for rendering the root `App` component into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/game.css'; // Imports the main stylesheet for the application.

// Renders the root App component into the DOM element with the ID 'root'.
// React.StrictMode is used to highlight potential problems in the application during development.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
