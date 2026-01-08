# Insights Dashboard

Analytics dashboard showing GitHub activity, WakaTime coding statistics, and more.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the following variables:

### Required for WakaTime Integration

- `WAKATIME_API_KEY` - Get your API key from [WakaTime Settings](https://wakatime.com/api-key)

### Other API Keys

- `GITHUB_TOKEN` - GitHub personal access token for repository analytics
- `POSTHOG_API_KEY` / `POSTHOG_PROJECT_ID` - PostHog analytics
- `NEXT_PUBLIC_CLOUDFLARE_*` - Cloudflare analytics
- `KV_*` - Vercel KV Redis storage

## WakaTime Setup

1. Sign up at [wakatime.com](https://wakatime.com)
2. Install WakaTime plugins for your editors/IDEs
3. Get your API key from [WakaTime Settings](https://wakatime.com/api-key)
4. Add `WAKATIME_API_KEY=your_api_key_here` to `.env.local`

## AI Usage Data Source

The **AI Usage** tab displays Claude Code usage analytics imported from the [ccusage-import](https://github.com/duyet/ccusage-import) script. This script:

- Imports Claude Code usage data into ClickHouse database
- Provides cost tracking and token usage analytics
- Requires ClickHouse environment variables (see below)

See the [ccusage-import repository](https://github.com/duyet/ccusage-import) for setup instructions and import scheduling.

## Development

```bash
yarn dev
```

Visit http://localhost:3001 to see the dashboard.

---

**This repository is maintained by [@duyetbot](https://github.com/duyetbot).**

