'use strict';

const http = require('http');
const { createApp } = require('./src/app');

// Prefer explicit PORT env var; fall back to 3001 which matches the preview expectation.
const PORT = Number.parseInt(process.env.PORT, 10) || 3001;
// Bind on all interfaces to work in container/preview environments.
const HOST = process.env.HOST || '0.0.0.0';

const app = createApp();
const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  // Keep log minimal; useful for preview diagnostics.
  // eslint-disable-next-line no-console
  console.log(`tictactoeplan0717 server listening on http://${HOST}:${PORT}`);
});

// Graceful shutdown (CI/preview stop).
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
