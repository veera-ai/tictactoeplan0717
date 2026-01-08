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

/**
 * GET /docs
 * Preview environments often probe /docs as the default landing page.
 * Redirect to the actual UI root.
 */
router.get('/docs', (req, res) => {
  res.redirect(302, '/');
});

/**
 * GET /openapi.json
 * Minimal OpenAPI document to satisfy preview probes and basic API discovery.
 *
 * Note: This is intentionally lightweight and describes only the existing routes.
 */
router.get('/openapi.json', (req, res) => {
  const port = Number.parseInt(process.env.PORT, 10) || 3001;

  res.status(200).json({
    openapi: '3.0.3',
    info: {
      title: 'tictactoeplan0717',
      version: '0.0.1',
      description: 'Minimal Express Tic-Tac-Toe UI + REST API.',
    },
    servers: [{ url: `http://localhost:${port}` }],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'OK',
            },
          },
        },
      },
      '/api/games': {
        post: {
          summary: 'Create a new game',
          responses: {
            '201': { description: 'Game created' },
          },
        },
      },
      '/api/games/{id}': {
        get: {
          summary: 'Get game state',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Game state' },
            '404': { description: 'Game not found' },
          },
        },
      },
      '/api/games/{id}/moves': {
        post: {
          summary: 'Make a move',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    row: { type: 'integer', minimum: 0, maximum: 2 },
                    col: { type: 'integer', minimum: 0, maximum: 2 },
                  },
                  required: ['row', 'col'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Updated game state' },
            '400': { description: 'Invalid move/body' },
            '404': { description: 'Game not found' },
          },
        },
      },
    },
  });
});

module.exports = router;
