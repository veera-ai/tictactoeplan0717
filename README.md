# Project Repository

This repository includes a minimal HTTP server so the container preview can start successfully.

## Run locally

```bash
npm install
npm start
```

The server listens on `process.env.PORT || 3001` and binds to `0.0.0.0` (container/preview friendly).

## Endpoints

- `GET /`  
  Returns a small HTML page (`Content-Type: text/html`) titled **"Tic-Tac-Toe Starter"** confirming the server is running.

- `GET /health`  
  Returns JSON (`Content-Type: application/json`) like:

  ```json
  { "status": "ok", "port": 3001 }
  ```

## Preview

The preview environment expects the service to bind on port `3001` by default, which this server does.