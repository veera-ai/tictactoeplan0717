'use strict';

const http = require('http');
const url = require('url');

// Prefer explicit PORT env var; fall back to 3001 which matches the preview expectation.
const PORT = Number.parseInt(process.env.PORT, 10) || 3001;
// Bind on all interfaces to work in container/preview environments.
const HOST = process.env.HOST || '0.0.0.0';

/**
 * INTERNAL: Sends a JSON response with appropriate headers.
 * @param {http.ServerResponse} res
 * @param {number} statusCode
 * @param {any} obj
 */
function sendJson(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * INTERNAL: Sends an HTML response with appropriate headers.
 * @param {http.ServerResponse} res
 * @param {number} statusCode
 * @param {string} html
 */
function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
  });
  res.end(html);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '/', true);
  const pathname = parsed.pathname || '/';

  // Homepage: small HTML page to confirm the preview/server is alive.
  if (req.method === 'GET' && pathname === '/') {
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
      <p>The Node server is running.</p>
      <p>Try <code>GET /health</code> for a JSON health check.</p>
    </main>
  </body>
</html>`;
    return sendHtml(res, 200, html);
  }

  // Health endpoint: JSON response for uptime/preview checks.
  if (req.method === 'GET' && pathname === '/health') {
    return sendJson(res, 200, {
      status: 'ok',
      port: PORT,
    });
  }

  // Simple not-found for everything else.
  return sendJson(res, 404, { status: 'error', error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  // Keep log minimal; useful for preview diagnostics.
  console.log(`tictactoeplan0717 server listening on http://${HOST}:${PORT}`);
});

// Graceful shutdown (CI/preview stop).
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
`````

Explanation: Add minimal Node package manifest with a start script so the preview runner can launch the server.
````write file="tictactoeplan0717/package.json"
{
  "name": "tictactoeplan0717",
  "version": "0.0.1",
  "private": true,
  "description": "Minimal placeholder server so the preview can run on port 3001.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18"
  }
}
