# Product Requirements Document (PRD) — Tic-Tac-Toe (tictactoeplan0717)

## Problem statement

Developers and reviewers need a small, self-contained example application that demonstrates a complete (but minimal) web flow: a browser UI backed by a REST API, with clear game-state rules and predictable error handling. The project should run in a preview/container environment without extra infrastructure.

## Goals

This project aims to provide a working Tic-Tac-Toe experience that is easy to run, understand, and extend.

The primary goals are:

1. The server serves a simple web UI at `/` that allows a user to play Tic-Tac-Toe.
2. The server exposes a minimal JSON REST API under `/api` to create a game, read game state, and make moves.
3. Game state is kept in memory to keep the project simple and dependency-free.
4. The app runs reliably in a container preview environment (default port 3001, bind `0.0.0.0`).

## Non-goals

The project is intentionally minimal. It does not aim to be a production-ready game platform.

The non-goals include:

1. Multi-user matchmaking, lobbies, or real-time play (WebSockets).
2. Authentication/authorization.
3. Persistence across server restarts.
4. AI opponent or difficulty settings.
5. A “polished” design system or advanced UI state management.

## Target users

The intended users are:

1. Developers reviewing or learning a simple Express + browser UI architecture.
2. CI/preview environments that need a minimal HTTP service to start successfully.
3. Contributors who want a base to add persistence, auth, tests, or richer UI patterns.

## User stories and flows

### Create a game (via UI)

A user opens the application in a browser. On page load, the UI creates a new game by calling the backend and then renders an empty 3x3 board.

Flow:

1. User navigates to `GET /`.
2. Browser loads static assets.
3. Client calls `POST /api/games`.
4. Client renders the board from the returned game state.

### Make a move (via UI)

A user clicks a cell. The UI sends a move request and re-renders the board using the returned game state.

Flow:

1. User clicks a cell.
2. Client calls `POST /api/games/:id/moves` with `{ "row": ..., "col": ... }`.
3. Backend validates and applies the move.
4. Client updates status text (next player / winner / draw) and disables occupied cells (and disables all input when finished).

### View game state (via API)

A user or developer can retrieve the current state of an existing game.

Flow:

1. Client (or curl) calls `GET /api/games/:id`.
2. Backend returns JSON with `board`, `nextPlayer`, `status`, and optionally `winner`.

### Start over (via UI)

A user clicks “New game” or “Restart” and receives a fresh game state (new ID, empty board).

Flow:

1. User clicks button.
2. Client calls `POST /api/games`.
3. Client renders new board and updates displayed game ID.

## Functional requirements

### REST API requirements

The server must provide the following endpoints and behaviors.

#### Create game

The server must create a new game with a unique ID, an empty board, and `nextPlayer = "X"`.

- Method and path: `POST /api/games`
- Success response: `201` with JSON game state.

Example:

```bash
curl -s -X POST http://localhost:3001/api/games
```

Response (`201`):

```json
{
  "gameId": "0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73",
  "board": [[null, null, null], [null, null, null], [null, null, null]],
  "nextPlayer": "X",
  "status": "in_progress"
}
```

#### Get game state

The server must return the game state when the game exists, and a 404 error when it does not.

- Method and path: `GET /api/games/:id`
- Success response: `200` with JSON game state.
- Error response: `404` with `{ "error": "Game not found" }`.

Example:

```bash
curl -s http://localhost:3001/api/games/0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73
```

Response (`200`):

```json
{
  "gameId": "0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73",
  "board": [[null, null, null], [null, null, null], [null, null, null]],
  "nextPlayer": "X",
  "status": "in_progress"
}
```

#### Make a move

The server must validate the move request and apply it for the current player.

- Method and path: `POST /api/games/:id/moves`
- Request body: JSON `{ "row": number, "col": number }`
- Success response: `200` with updated game state.
- Error responses:
  - `400` for invalid body, out-of-bounds coordinates, occupied cell, or game already finished
  - `404` for unknown game ID

Example:

```bash
curl -s -X POST http://localhost:3001/api/games/0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73/moves \
  -H 'Content-Type: application/json' \
  -d '{ "row": 0, "col": 0 }'
```

Response (`200`):

```json
{
  "gameId": "0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73",
  "board": [["X", null, null], [null, null, null], [null, null, null]],
  "nextPlayer": "O",
  "status": "in_progress"
}
```

Winning example (`200`):

```json
{
  "gameId": "0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73",
  "board": [["X", "X", "X"], ["O", "O", null], [null, null, null]],
  "nextPlayer": "X",
  "status": "won",
  "winner": "X"
}
```

### UI requirements

The server must serve a browser UI that can be used without additional tooling.

1. The UI must be served at `GET /` and be usable in a modern browser.
2. The UI must show a 3x3 board and allow clicking on cells to make moves.
3. The UI must display the game ID and a status line.
4. The UI must provide a “New game” control, and a “Restart” control.
5. The UI must disable occupied cells and must prevent further moves once the game ends (win/draw).
6. On API errors, the UI must show an error message and re-sync with the server state.

### Health endpoint requirements

The server must provide a lightweight health endpoint for preview/uptime checks.

- Method and path: `GET /health`
- Response: `200` JSON like `{ "status": "ok", "port": 3001 }`.

## Non-functional requirements

### Performance

The project should respond quickly for typical usage.

1. API requests should complete in milliseconds on a local machine under normal load.
2. There is no requirement to support high concurrency; it is a single-process in-memory service.

### Statelessness and simplicity

This project favors simplicity over distributed correctness.

1. Game state is stored in-memory (process-local) and is lost on restart.
2. There is no external database or cache dependency.
3. The API is not designed to be horizontally scalable without adding a persistence/session layer.

### Reliability and predictability

1. The API must return JSON errors in the form `{ "error": "<message>" }`.
2. The app must bind to `0.0.0.0` by default to work in container/preview environments.

### Security (minimal)

1. There is no authentication and no sensitive data stored.
2. Inputs are validated for move requests (`row` and `col` must be integers).

## Out of scope

The following items are explicitly out of scope for the current implementation:

1. Authentication and authorization.
2. Persistent storage (database, file system, etc.).
3. User accounts, profiles, or player tracking.
4. Multiplayer synchronization, turn enforcement across clients, or spectator modes.
5. Formal OpenAPI/Swagger documentation (beyond the examples in this repo).
6. Automated test suite (unit/integration/e2e).

## Success metrics

Because this is a small reference application, success is measured by correctness and developer experience.

1. A developer can run `npm install` and `npm start` and load the UI at `http://localhost:3001/`.
2. A user can complete a game (win or draw) using only the UI controls.
3. API calls match documented responses and return consistent error shapes.
4. The service starts successfully in a preview environment expecting port 3001.
