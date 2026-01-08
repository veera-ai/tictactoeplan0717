'use strict';

const crypto = require('crypto');

/**
 * @typedef {'X'|'O'} Player
 * @typedef {'in_progress'|'won'|'draw'} GameStatus
 */

/**
 * Create an empty 3x3 board.
 *
 * @returns {(('X'|'O'|null)[])[]} board
 */
function createEmptyBoard() {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

/**
 * Check if coordinates are within [0..2].
 *
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
function isInBounds(row, col) {
  return Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row <= 2 && col >= 0 && col <= 2;
}

/**
 * Determine if a board has a winner.
 *
 * @param {(('X'|'O'|null)[])[]} board
 * @returns {{ winner: ('X'|'O'|null), winningLine: { type: string, index?: number } | null }}
 */
function findWinner(board) {
  // Rows
  for (let r = 0; r < 3; r += 1) {
    const a = board[r][0];
    if (a && a === board[r][1] && a === board[r][2]) return { winner: a, winningLine: { type: 'row', index: r } };
  }

  // Columns
  for (let c = 0; c < 3; c += 1) {
    const a = board[0][c];
    if (a && a === board[1][c] && a === board[2][c]) return { winner: a, winningLine: { type: 'col', index: c } };
  }

  // Diagonals
  const center = board[1][1];
  if (center) {
    if (center === board[0][0] && center === board[2][2]) return { winner: center, winningLine: { type: 'diag', index: 0 } };
    if (center === board[0][2] && center === board[2][0]) return { winner: center, winningLine: { type: 'diag', index: 1 } };
  }

  return { winner: null, winningLine: null };
}

/**
 * Check if board is full (no null cells).
 *
 * @param {(('X'|'O'|null)[])[]} board
 * @returns {boolean}
 */
function isBoardFull(board) {
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

/**
 * Recompute status/winner after a move.
 *
 * @param {import('./tictactoe').Game} game
 * @returns {void}
 */
function updateGameStatus(game) {
  const { winner } = findWinner(game.board);
  if (winner) {
    game.status = 'won';
    game.winner = winner;
    return;
  }

  if (isBoardFull(game.board)) {
    game.status = 'draw';
    delete game.winner;
    return;
  }

  game.status = 'in_progress';
  delete game.winner;
}

/**
 * @typedef {object} Game
 * @property {string} gameId
 * @property {(('X'|'O'|null)[])[]} board
 * @property {Player} nextPlayer
 * @property {GameStatus} status
 * @property {Player=} winner
 */

/**
 * In-memory Tic-Tac-Toe service.
 */
class TicTacToeService {
  constructor() {
    /** @type {Map<string, Game>} */
    this.games = new Map();
  }

  /**
   * PUBLIC_INTERFACE
   * createGame
   * Creates a new game with an empty board, X to play, and in_progress status.
   *
   * @returns {Game} newly created game state
   */
  createGame() {
    const gameId = crypto.randomUUID();
    /** @type {Game} */
    const game = {
      gameId,
      board: createEmptyBoard(),
      nextPlayer: 'X',
      status: 'in_progress',
    };

    this.games.set(gameId, game);
    return this._publicGameState(game);
  }

  /**
   * PUBLIC_INTERFACE
   * getGame
   * Retrieves an existing game's state by id.
   *
   * @param {string} gameId
   * @returns {Game|null} game state or null if not found
   */
  getGame(gameId) {
    const game = this.games.get(gameId);
    if (!game) return null;
    return this._publicGameState(game);
  }

  /**
   * PUBLIC_INTERFACE
   * makeMove
   * Applies a move for the current player (game.nextPlayer) at (row, col),
   * validates the move, updates status/winner, and advances nextPlayer if needed.
   *
   * @param {string} gameId
   * @param {{row: number, col: number}} move
   * @returns {{ ok: true, game: Game } | { ok: false, error: string, statusCode: number }}
   */
  makeMove(gameId, move) {
    const game = this.games.get(gameId);
    if (!game) return { ok: false, error: 'Game not found', statusCode: 404 };

    const { row, col } = move;

    if (!isInBounds(row, col)) {
      return { ok: false, error: 'Invalid move: row and col must be integers between 0 and 2', statusCode: 400 };
    }

    if (game.status !== 'in_progress') {
      return { ok: false, error: 'Invalid move: game is already finished', statusCode: 400 };
    }

    if (game.board[row][col] !== null) {
      return { ok: false, error: 'Invalid move: cell is already occupied', statusCode: 400 };
    }

    // Apply move
    game.board[row][col] = game.nextPlayer;

    // Update status/winner
    updateGameStatus(game);

    // Toggle nextPlayer only if the game remains in progress
    if (game.status === 'in_progress') {
      game.nextPlayer = game.nextPlayer === 'X' ? 'O' : 'X';
    }

    return { ok: true, game: this._publicGameState(game) };
  }

  /**
   * Create a copy of game state safe to return to clients.
   *
   * @private
   * @param {Game} game
   * @returns {Game}
   */
  _publicGameState(game) {
    // Deep-ish copy board to avoid accidental external mutation.
    const boardCopy = game.board.map((row) => row.slice());
    const state = {
      gameId: game.gameId,
      board: boardCopy,
      nextPlayer: game.nextPlayer,
      status: game.status,
    };
    if (game.status === 'won' && game.winner) {
      state.winner = game.winner;
    }
    return state;
  }
}

module.exports = { TicTacToeService };

