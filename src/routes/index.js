'use strict';

const express = require('express');
const path = require('path');

const router = express.Router();

/**
 * GET /
 * Serve the Tic-Tac-Toe UI (static index.html).
 *
 * Note: static middleware also serves /index.html, but this keeps the root route
 * explicitly working and documents behavior.
 */
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

/**
 * GET /health
 * Health endpoint: JSON response for uptime/preview checks.
 */
router.get('/health', (req, res) => {
  const port = Number.parseInt(process.env.PORT, 10) || 3001;
  res.status(200).json({ status: 'ok', port });
});

module.exports = router;
