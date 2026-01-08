'use strict';

const express = require('express');
const indexRoutes = require('./routes');

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

  // Routes (structured for future expansion).
  app.use('/', indexRoutes);

  // Fallback 404 handler.
  app.use((req, res) => {
    res.status(404).json({ status: 'error', error: 'Not found' });
  });

  return app;
}

module.exports = { createApp };
