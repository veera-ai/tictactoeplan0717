'use strict';

const express = require('express');

const router = express.Router();

/**
 * GET /
 * Small HTML homepage to confirm the preview/server is alive.
 */
router.get('/', (req, res) => {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tic-Tac-Toe Starter</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 2rem; line-height: 1.4; }
      .card { max-width: 48rem; padding: 1.25rem 1.5rem; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; }
      h1 { margin: 0 0 0.5rem 0; font-size: 1.5rem; }
      p { margin: 0.25rem 0; color: #374151; }
      code { background: #f3f4f6; padding: 0.15rem 0.35rem; border-radius: 6px; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Tic-Tac-Toe Starter</h1>
      <p>The Express server is running.</p>
      <p>Try <code>GET /health</code> for a JSON health check.</p>
    </main>
  </body>
</html>`;

  res.type('html').status(200).send(html);
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
