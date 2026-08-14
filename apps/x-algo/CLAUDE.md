# CLAUDE.md — X Algo

Static explainer for the open-sourced X For You ranking weights.

- **Port**: 3011
- **Domain**: https://x-algo.duyet.net
- **Source of numbers**: `src/lib/scoring.ts` (mirrors `xai-org/x-algorithm` `home-mixer/params/param.rs`, last sync 2026-08-12)

```bash
pnpm run dev
pnpm run test
pnpm run build
```

Public pages must stay prerendered. Do not invent weights — change `scoring.ts` only when the upstream repo changes.
