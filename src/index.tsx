import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// It's good practice to have a main CSS file, even if it's empty.
// I'll assume one might be created later.
// import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
