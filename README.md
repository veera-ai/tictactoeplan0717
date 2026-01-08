# Project Repository

This repository includes a minimal **Express** server so the container preview can start successfully.

## Run locally

```bash
npm install
npm start
```

The server listens on `process.env.PORT || 3001` and binds to `0.0.0.0` (container/preview friendly).

## Routing structure

- `server.js` - entrypoint that starts the HTTP server
- `src/app.js` - initializes the Express app and middleware
- `src/routes/index.js` - root routes (`/` and `/health`)
- `src/routes/api.js` - API routes under `/api`
- `src/services/tictactoe.js` - in-memory Tic-Tac-Toe game logic/service

## Endpoints (existing)

- `GET /`  
  Serves the Tic-Tac-Toe UI (static HTML/JS).

- `GET /health`  
  Returns JSON (`Content-Type: application/json`) like:

  ```json
  { "status": "ok", "port": 3001 }
  ```

## Browser UI

After starting the server, open:

- http://localhost:3001/

The page will automatically create a new game and render a 3x3 board. Click a cell to make a move.
Use **New game** (or **Restart**) to start over.

## Tic-Tac-Toe API (`/api`)

Games are stored **in memory** (a process-local `Map`). Restarting the server clears all games.

### Data model

- `board`: 3x3 array of arrays containing `'X' | 'O' | null`
- `nextPlayer`: `'X'` then `'O'` alternating (only meaningful while `status === 'in_progress'`)
- `status`: `'in_progress' | 'won' | 'draw'`
- `winner`: present only when `status === 'won'`

### 1) Create game

`POST /api/games`

```bash
curl -s -X POST http://localhost:3001/api/games | jq
```

Example response (`201`):

```json
{
  "gameId": "0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73",
  "board": [[null, null, null], [null, null, null], [null, null, null]],
  "nextPlayer": "X",
  "status": "in_progress"
}
```

### 2) Get game state

`GET /api/games/:id`

```bash
curl -s http://localhost:3001/api/games/<gameId> | jq
```

Example response (`200`):

```json
{
  "gameId": "0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73",
  "board": [[null, null, null], [null, null, null], [null, null, null]],
  "nextPlayer": "X",
  "status": "in_progress"
}
```

If the game does not exist (`404`):

```json
{ "error": "Game not found" }
```

### 3) Make a move

`POST /api/games/:id/moves`

Body: `{ "row": 0..2, "col": 0..2 }`

```bash
curl -s -X POST http://localhost:3001/api/games/<gameId>/moves \
  -H 'Content-Type: application/json' \
  -d '{ "row": 0, "col": 0 }' | jq
```

Example response (`200`), after the first move:

```json
{
  "gameId": "0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73",
  "board": [["X", null, null], [null, null, null], [null, null, null]],
  "nextPlayer": "O",
  "status": "in_progress"
}
```

If the move wins the game (`200`):

```json
{
  "gameId": "0e0d2a29-9b7a-4c60-8f6d-76b38d3b7a73",
  "board": [["X", "X", "X"], ["O", "O", null], [null, null, null]],
  "nextPlayer": "X",
  "status": "won",
  "winner": "X"
}
```

Invalid requests return `{ "error": string }`:

- Bad JSON body / missing fields / wrong types (`400`)
- Out-of-range coordinates (`400`)
- Cell already occupied (`400`)
- Game already finished (`400`)
- Unknown `gameId` (`404`)

## Linting & formatting

This project uses **ESLint** (with Prettier integration) and **Prettier** for consistent code style.

```bash
# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check
```

## Documentation

Developer-facing docs live in:

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

## Preview

The preview environment expects the service to bind on port `3001` by default, which this server does.

