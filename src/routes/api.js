'use strict';

const express = require('express');
const { TicTacToeService } = require('../services/tictactoe');

const router = express.Router();

// Single in-memory service instance for the lifetime of the process.
const service = new TicTacToeService();

/**
 * Helper to return consistent error responses.
 *
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 */
function sendError(res, statusCode, message) {
  res.status(statusCode).json({ error: message });
}

/**
 * POST /api/games
 * Create a new game.
 */
router.post('/games', (req, res) => {
  const game = service.createGame();
  res.status(201).json(game);
});

/**
 * GET /api/games/:id
 * Get current game state by id.
 */
router.get('/games/:id', (req, res) => {
  const gameId = req.params.id;
  const game = service.getGame(gameId);

  if (!game) {
    return sendError(res, 404, 'Game not found');
  }

  return res.status(200).json(game);
});

/**
 * POST /api/games/:id/moves
 * Make a move for the current player at (row, col).
 *
 * Body: { row, col }
 */
router.post('/games/:id/moves', (req, res) => {
  const gameId = req.params.id;
  const { row, col } = req.body || {};

  // Validate payload types early to avoid confusing errors
  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    return sendError(res, 400, 'Invalid request body: expected JSON { "row": number, "col": number }');
  }

  const result = service.makeMove(gameId, { row, col });
  if (!result.ok) {
    return sendError(res, result.statusCode, result.error);
  }

  return res.status(200).json(result.game);
});

module.exports = router;

