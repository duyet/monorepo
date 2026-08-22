# CLAUDE.md — Tip

Ko-fi tip page for https://tip.duyet.net.

- **Port**: 3012
- **Domain**: https://tip.duyet.net
- **Widget**: official Ko-fi embed for ko-fi.com/duyet (`src/lib/site.ts`)

```bash
pnpm run dev
pnpm run build
```

Public pages must stay prerendered. Keep the page a single centered section
with the shared `SiteHeader`; do not add runtime data fetches.
