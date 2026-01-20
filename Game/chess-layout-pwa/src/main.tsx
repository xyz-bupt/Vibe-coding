/**
 *象棋布局教学 PWA - Main Entry Point
 * Security-hardened initialization
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Sanitizes user input to prevent XSS attacks
 * Basic implementation for string sanitization
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  // Remove potentially dangerous characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Safe Service Worker Registration
 * Only registers in production and with proper error handling
 */
function registerServiceWorker(): void {
  // Only register in production environment
  if (import.meta.env.DEV) {
    return;
  }

  // Check browser support
  if ('serviceWorker' in navigator) {
    // Wait for page to fully load
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker.register(swUrl, {
        scope: '/',
        updateViaCache: 'none' // Always fetch fresh version
      })
        .then((registration) => {
          // Successful registration
          console.info('[Security] SW registered:', registration.scope);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - notify user (non-blocking)
                console.info('[Security] New content available');
                // You can dispatch a custom event here to show a UI update notification
                window.dispatchEvent(new CustomEvent('app-update-available'));
              }
            });
          });
        })
        .catch((error) => {
          console.error('[Security] SW registration failed:', error);
        });
    });

    // Handle controller changes (when a new SW takes control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New service worker is now controlling the page
      console.info('[Security] Service worker controller changed');
      // Optionally reload to get fresh content
      // window.location.reload();
    });
  }
}

/**
 * Secure Application Initialization
 */
function initApp(): void {
  // Validate root element exists
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Failed to find root element');
  }

  // Register Service Worker
  registerServiceWorker();

  // Render the application
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Start the application
initApp();
