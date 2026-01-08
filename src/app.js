'use strict';

const express = require('express');
const path = require('path');
const indexRoutes = require('./routes');
const apiRoutes = require('./routes/api');

/**
 * PUBLIC_INTERFACE
 * createApp
 * Creates and configures the Express application instance.
 *
 * @returns {import('express').Express} Configured Express app.
 */
function createApp() {
  const app = express();

  // Lightweight request logging (keep minimal; useful for preview diagnostics).
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`);
    });
    next();
  });

  // Parse JSON bodies (safe default for future expansion).
  app.use(express.json());

  // Serve static UI assets.
  // This enables /index.html, /app.js, etc.
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));

  // API routes must remain stable and continue to work.
  app.use('/api', apiRoutes);

  /**
   * Root routes.
   * We keep /health working, and update / to serve the new UI.
   */
  app.use('/', indexRoutes);

  // Fallback 404 handler.
  app.use((req, res) => {
    res.status(404).json({ status: 'error', error: 'Not found' });
  });

  return app;
}

module.exports = { createApp };
