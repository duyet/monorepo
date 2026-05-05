# Chat API Decision

- Route primary agent traffic through `routeAgentRequest()`.
- Keep `POST /api/chat` as compatibility shim for `apps/home` inline composer.
- Require Clerk bearer token for all mutation routes.
- Keep `/health` unauthenticated for probes.
