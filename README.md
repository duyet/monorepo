# duyet.net

Personal monorepo for duyet.net — blog, CV, AI agent demos, and data tooling. TanStack Start + Cloudflare Workers/Pages + Rust/WASM.

## Apps

- **Home**: https://duyet.net (official) | https://duyet-home.pages.dev (Cloudflare Pages)
- **Blog**: https://blog.duyet.net (official) | https://duyet-blog.pages.dev (Cloudflare Pages)
- **CV**: https://cv.duyet.net (official) | https://duyet-cv.pages.dev (Cloudflare Pages)
- **Insights**: https://insights.duyet.net (official) | https://duyet-insights.pages.dev (Cloudflare Pages)
- **Photos**: https://photos.duyet.net (official) | https://duyet-photos.pages.dev (Cloudflare Pages)
- **Homelab**: https://homelab.duyet.net (official) | https://duyet-homelab.pages.dev (Cloudflare Pages)
- **LLM Timeline**: https://llm-timeline.duyet.net (official) | https://duyet-llm-timeline.pages.dev (Cloudflare Pages)
- **KB**: https://kb.duyet.net (official) — interactive knowledge graph, [about](https://kb.duyet.net/about), [llms.txt](https://kb.duyet.net/llms.txt)
- **News (aidr)**: https://aidr.today (official) — `news.duyet.net` path-preserving redirects via `apps/news-redirect`
- **X-Algo**: https://x-algo.duyet.net (official)
- **Burns**: https://burn.duyet.net (official) | https://duyet-burns.pages.dev (Cloudflare Pages)
- **Agent Assistant**: https://agent-assistant.duyet.net (official)
- **AI Agents API**: https://agents.duyet.net (official) | `agents-api.duyet.net` is configured in the Cloudflare dashboard (the wrangler route is commented to avoid zone-permission deploy failures)
- **AI Chat**: https://ai.duyet.net (official)
- **AI Percentage**: https://ai-percentage.duyet.net (official)
- **API**: https://api.duyet.net (official)
- **Paid API**: https://paid.duyet.net (official) — x402 USDC-gated chat Worker

## App Docs

- Blog: [./apps/blog/README.md](./apps/blog/README.md)
- News host redirect: [./apps/news-redirect/README.md](./apps/news-redirect/README.md)
- Insights: [./apps/insights/README.md](./apps/insights/README.md)
- CV: [./apps/cv/README.md](./apps/cv/README.md)
- Homelab: [./apps/homelab/README.md](./apps/homelab/README.md)
- Photos: [./apps/photos/README.md](./apps/photos/README.md)
- LLM Timeline: [./apps/llm-timeline/README.md](./apps/llm-timeline/README.md)
- Agent Assistant: [./apps/agent-assistant/README.md](./apps/agent-assistant/README.md)
- API: [./apps/api/README.md](./apps/api/README.md)
- Data Sync: [./apps/data-sync/README.md](./apps/data-sync/README.md)
- Paid API: [./apps/paid-api/README.md](./apps/paid-api/README.md)

## CLI (`duyet`)

Installers live on duyet.net (stable URL + Pages cache). Channel manifests are
`https://duyet.net/cli/stable.json` and `https://duyet.net/cli/beta.json`
(filled by the dist release pipeline, issue #1444).

macOS / Linux:

```sh
curl -fsSL https://duyet.net/install.sh | sh
DUYET_CHANNEL=beta curl -fsSL https://duyet.net/install.sh | sh
DUYET_VERSION=0.1.0-beta.1 curl -fsSL https://duyet.net/install.sh | sh
```

Windows (PowerShell 5.1 or 7):

```powershell
irm https://duyet.net/install.ps1 | iex
$env:DUYET_CHANNEL = "beta"; irm https://duyet.net/install.ps1 | iex
$env:DUYET_VERSION = "0.1.0-beta.1"; irm https://duyet.net/install.ps1 | iex
```

Manual download plus attestation (after #1444 ships signed GitHub Releases):

```sh
gh attestation verify duyet-x86_64-unknown-linux-musl.tar.xz --repo duyet/monorepo
```

The scripts print the PATH line instead of editing shell rc files unless
`DUYET_MODIFY_PATH=1` (Unix) or `-Yes` / `$env:DUYET_MODIFY_PATH=1` (Windows).

## More

- Repository maintained by [@duyetbot](https://github.com/duyetbot)
- [Repobeats analytics](https://repobeats.axiom.co/)
