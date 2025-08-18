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

## Development

```bash
yarn dev
```

Visit http://localhost:3001 to see the dashboard.