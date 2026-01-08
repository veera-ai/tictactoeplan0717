'use strict';

const http = require('http');
const url = require('url');

// Prefer explicit PORT env var; fall back to 3001 which matches the preview expectation.
const PORT = Number.parseInt(process.env.PORT, 10) || 3001;
// Bind on all interfaces to work in container/preview environments.
const HOST = process.env.HOST || '0.0.0.0';

function sendJson(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '/', true);

  // Basic health endpoint expected by many preview systems.
  if (req.method === 'GET' && (parsed.pathname === '/' || parsed.pathname === '/healthz')) {
    return sendJson(res, 200, {
      ok: true,
      service: 'tictactoeplan0717',
      port: PORT,
      path: parsed.pathname,
    });
  }

  // Simple not-found for everything else.
  return sendJson(res, 404, { ok: false, error: 'Not found' });
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
