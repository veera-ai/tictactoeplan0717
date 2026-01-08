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

## Endpoints

- `GET /`  
  Returns a small HTML page (`Content-Type: text/html`) titled **"Tic-Tac-Toe Starter"** confirming the server is running.

- `GET /health`  
  Returns JSON (`Content-Type: application/json`) like:

  ```json
  { "status": "ok", "port": 3001 }
  ```

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

## Preview

The preview environment expects the service to bind on port `3001` by default, which this server does.
