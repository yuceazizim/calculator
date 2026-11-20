/**
 * Welding Consumable Calculator (WCC)
 * Main Frontend Application Entry Point
 * Pure JavaScript (.js only - no .jsx)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { I18nProvider } from './i18n.js';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Fatal: Root element #root was not found in the HTML document.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);

// Register Offline-First PWA Service Worker in Production Build
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .catch((err) => console.warn('SW registration skipped:', err));
  });
}