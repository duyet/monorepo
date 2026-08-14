# Insights Dashboard

Analytics dashboard for https://insights.duyet.net (Cloudflare Pages project `duyet-insights`). Aggregates GitHub, WakaTime, PostHog, Cloudflare Analytics, and ClickHouse (ccusage / AI usage).

## Environment Variables

There is no `.env.local.example`. Copy values into `.env.local` (gitignored) for local scripts, or set them on the Cloudflare Pages project. Names match `apps/insights/environment.d.ts`.

### Server / build-time

- `GITHUB_TOKEN` — GitHub personal access token
- `WAKATIME_API_KEY` — [WakaTime Settings](https://wakatime.com/api-key)
- `POSTHOG_API_KEY` / `POSTHOG_PROJECT_ID` — PostHog
- `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_API_KEY` + `CLOUDFLARE_ZONE_ID` — Cloudflare analytics
- `CLICKHOUSE_HOST`, `CLICKHOUSE_PORT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_DATABASE`, `CLICKHOUSE_PROTOCOL` — AI usage / WakaTime history

### Client (Vite)

- `VITE_MEASUREMENT_ID` — Google Analytics
- `VITE_DUYET_BLOG_URL`, `VITE_DUYET_INSIGHTS_URL`, `VITE_DUYET_CV_URL`, `VITE_BASE_URL`

Do not use `NEXT_PUBLIC_*` names. This app is Vite / TanStack Start, not Next.js.

## Development

```bash
pnpm run dev          # http://localhost:3001
pnpm run test
pnpm run check-types
pnpm run cf:deploy:prod
```

## AI Usage Data Source

The AI Usage tab uses Claude Code usage imported via `apps/data-sync` (`pnpm run sync ai-code-percentage` / ccusage syncers) into ClickHouse.

---

**This repository is maintained by [@duyetbot](https://github.com/duyetbot).**
