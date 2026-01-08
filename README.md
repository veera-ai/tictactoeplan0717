# Project Repository

This repository now includes a minimal HTTP server so the container preview can start successfully.

## Run locally

```bash
npm install
npm start
```

The server binds to `PORT` (defaults to `3001`) on `0.0.0.0`.

## Endpoints

- `GET /` -> basic JSON response
- `GET /healthz` -> health check JSON response