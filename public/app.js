/* global window, document, fetch */
'use strict';

let currentGameId = null;
let currentGameState = null;

function el(id) {
  return document.getElementById(id);
}

function setStatus(text) {
  el('status').textContent = text;
}

function setGameId(gameId) {
  el('gameId').textContent = gameId || '—';
}

function indexToRowCol(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return { row, col };
}

function getStatusText(game) {
  if (!game) return 'Loading…';

  if (game.status === 'won') {
    return `Winner: ${game.winner}`;
  }

  if (game.status === 'draw') {
    return 'Draw.';
  }

  return `Next player: ${game.nextPlayer}`;
}

function isGameOver(game) {
  return game && (game.status === 'won' || game.status === 'draw');
}

function clearBoard() {
  const boardEl = el('board');
  boardEl.innerHTML = '';
}

function renderBoard(game) {
  const boardEl = el('board');
  clearBoard();

  const disabled = isGameOver(game);

  for (let i = 0; i < 9; i += 1) {
    const { row, col } = indexToRowCol(i);
    const cellValue = game.board[row][col];

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cell';
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);
    btn.dataset.index = String(i);
    btn.textContent = cellValue || '';

    const cellOccupied = cellValue !== null;

    if (cellValue === 'X') btn.classList.add('cell--x', 'cell--filled');
    if (cellValue === 'O') btn.classList.add('cell--o', 'cell--filled');

    btn.disabled = disabled || cellOccupied;

    btn.addEventListener('click', async () => {
      await makeMove(i);
    });

    boardEl.appendChild(btn);
  }
}

async function createGame() {
  const resp = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`Failed to create game: ${resp.status} ${msg}`);
  }

  const game = await resp.json();
  currentGameId = game.gameId;
  return game;
}

async function fetchGame(gameId) {
  const resp = await fetch(`/api/games/${encodeURIComponent(gameId)}`);
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`Failed to load game: ${resp.status} ${msg}`);
  }
  return resp.json();
}

async function postMove(gameId, index) {
  const { row, col } = indexToRowCol(index);

  const resp = await fetch(`/api/games/${encodeURIComponent(gameId)}/moves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, col }),
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const errMsg = data && data.error ? data.error : `HTTP ${resp.status}`;
    throw new Error(errMsg);
  }

  return data;
}

async function renderFromServer() {
  if (!currentGameId) return;
  const game = await fetchGame(currentGameId);
  currentGameState = game;

  setGameId(game.gameId);
  setStatus(getStatusText(game));
  renderBoard(game);

  const restartBtn = el('restartBtn');
  restartBtn.disabled = false;
}

async function startNewGameFlow() {
  setStatus('Creating game…');
  const game = await createGame();
  currentGameState = game;

  setGameId(game.gameId);
  setStatus(getStatusText(game));
  renderBoard(game);

  const restartBtn = el('restartBtn');
  restartBtn.disabled = false;
}

async function restartGame() {
  await startNewGameFlow();
}

async function makeMove(index) {
  if (!currentGameId) return;
  if (isGameOver(currentGameState)) return;

  setStatus('Making move…');

  try {
    const updated = await postMove(currentGameId, index);
    currentGameState = updated;
    setStatus(getStatusText(updated));
    renderBoard(updated);

    // Small polish: when game ends, keep focus on board for easy restart/new game.
    if (isGameOver(updated)) {
      const boardEl = el('board');
      if (boardEl) boardEl.focus?.();
    }
  } catch (err) {
    // Re-render from server after error to keep UI consistent.
    setStatus(`Error: ${err.message}`);
    await renderFromServer();
  }
}

function registerKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Ignore when typing in any input-like element (none in current UI, but safe).
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      el('newGameBtn')?.click();
    }

    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      el('restartBtn')?.click();
    }
  });
}

// PUBLIC_INTERFACE
function init() {
  /** Initialize UI event handlers and auto-create first game. */
  const newGameBtn = el('newGameBtn');
  const restartBtn = el('restartBtn');

  newGameBtn.addEventListener('click', async () => {
    try {
      await startNewGameFlow();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  });

  restartBtn.addEventListener('click', async () => {
    try {
      await restartGame();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  });

  registerKeyboardShortcuts();

  // Disable restart until first game is created.
  restartBtn.disabled = true;

  // On load: create a game and render.
  startNewGameFlow().catch((err) => {
    setStatus(`Error: ${err.message}`);
  });
}

window.addEventListener('DOMContentLoaded', init);
