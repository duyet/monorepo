# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development

- `bun run build` - Build all apps and packages using Turbo
- `bun run dev` - Start development servers for all apps with Turbo parallel execution
- `bun run start` - Start production servers for all apps
- `bun run config` - Run workspace config tasks, including app secret syncs where defined
- `bun run deploy` - Build deployable apps, then run the workspace config step

### Code Quality

- `bun run lint` - Lint the workspace with Biome
- `bun run fmt` - Format all TypeScript, TSX, and Markdown files with Biome
- `bun run test` - Run tests across all packages using Turbo

### Individual App Development

Navigate to specific app directories and run:

- `bun run dev` - Start development server (port varies per app)
- `bun run build` - Build specific app
- `bun run check-types` - TypeScript type checking
- `bun run analyze` - Bundle analysis (available in some apps)

### Cloudflare Pages Deployment

Local deployment commands:

```bash
# Deploy all apps to preview (branch deployment)
bun run cf:deploy

# Deploy all apps to production
bun run cf:deploy --prod

# Deploy all apps to production via turbo
bun run cf:deploy:prod

# Deploy specific app to production
cd apps/blog && bun run cf:deploy:prod
```

GitHub Actions automatically deploy:
- **Production**: Push to `master`/`main` deploys changed apps to production
- **Preview**: PRs get preview deployments with URLs commented by @duyetbot
- Both deploy workflows run type checks (`bun run turbo check-types`), unit tests, and lint before deploy jobs.

## Architecture Overview

This is a **Bun monorepo** managed by **Turborepo** containing:

### Apps (`/apps/`)

1. **blog** (`apps/blog/`) - Vite SPA blog with Auth0 authentication and Vercel KV for comments
   - Live at https://blog.duyet.net (official) / https://duyet.vercel.app (Vercel) / https://duyet-blog.pages.dev (Cloudflare)
   - Uses Auth0 for auth, Vercel KV for Redis storage
   - Supports markdown posts with KaTeX math rendering

2. **cv** (`apps/cv/`) - Simple CV hosting application
   - Live at https://cv.duyet.net (official) / https://duyet-cv.vercel.app (Vercel) / https://duyet-cv.pages.dev (Cloudflare)
   - Serves PDF CV from `/public` directory

3. **insights** (`apps/insights/`) - Analytics dashboard
   - Live at https://insights.duyet.net (official) / https://duyet-insights.vercel.app (Vercel) / https://duyet-insights.pages.dev (Cloudflare)
   - Integrates Cloudflare Analytics, GitHub data, PostHog, WakaTime, ClickHouse

4. **home** (`apps/home/`) - Personal homepage with GitHub activity
   - Live at https://duyet.net (official) / https://duyet-home.pages.dev (Cloudflare)
   - Uses Recharts for data visualization

5. **photos** (`apps/photos/`) - Photo gallery with Unsplash integration
   - Live at https://photos.duyet.net (official) / https://duyet-photos.vercel.app (Vercel) / https://duyet-photos.pages.dev (Cloudflare)
   - Features masonry layout and Framer Motion animations

6. **homelab** (`apps/homelab/`) - Homelab documentation and resources
   - Live at https://homelab.duyet.net (official) / https://duyet-homelab.pages.dev (Cloudflare)
   - Documentation for personal infrastructure and homelab setup

7. **llm-timeline** (`apps/llm-timeline/`) - Interactive timeline of LLM releases
   - Live at https://llm-timeline.duyet.net (official) / https://duyet-llm-timeline.pages.dev (Cloudflare)
   - 50+ LLM models from 2017-2025 with search and filtering by license, type, organization
   - Client-side filtering with dark mode support

8. **agents** (`apps/agents/`) - AI chat interface with Cloudflare Pages Functions and Workers AI via AI Gateway
   - Live at https://agents.duyet.net (Cloudflare Pages)
   - Builds skills before compile/deploy

9. **api** (`apps/api/`) - Hono API on Cloudflare Workers for AI-powered blog descriptions
    - Live at https://api.duyet.net (Cloudflare Workers)
    - Use `bun run dev`, `bun run deploy`, `bun run test`, and `bun run check-types` for local API changes

10. **ai-percentage** (`apps/ai-percentage/`) - Dashboard showing the percentage of code written by AI across repositories
    - Live at https://ai-percentage.duyet.net (Cloudflare Pages)
    - Static SPA; use `bun run build` locally and `bun run cf:deploy:prod` for production deploy
    - Data depends on `apps/data-sync` via `bun run sync ai-code-percentage`

11. **data-sync** (`apps/data-sync/`) - CLI for syncing analytics and activity data into ClickHouse
    - Use `bun run sync <name>`, `bun run migrate`, and `bun run cleanup` for operational data workflows
    - `bun run sync wakatime-activity` is the key feed for Insights WakaTime history

### Shared Packages (`/packages/`)

- `@duyet/components` - Shared React components
- `@duyet/libs` - Utility libraries and functions
- `@duyet/interfaces` - TypeScript type definitions
- `@duyet/config` - Shared configuration for all apps (app, api, ui configs)
- `@duyet/tailwind-config` - Tailwind CSS configuration
- `@duyet/tsconfig` - TypeScript configurations

## Environment Variables

Global environment variables are defined in `turbo.json` and include:

- Cross-app public URLs for navigation
- Auth0 configuration (domain, client ID, admin email)
- Vercel KV Redis credentials
- PostgreSQL database connections
- External API tokens (PostHog, GitHub, Cloudflare, etc.)

Place environment files as `.env` or `.env.local` in the root directory.

## Technology Stack

- **Framework**: Vite + TanStack Router (SPA) with React 19
- **Build Tool**: Turborepo for monorepo management
- **Package Manager**: Bun (specified in package.json)
- **Styling**: Tailwind CSS with custom configurations
- **Authentication**: Auth0 (blog app)
- **Database**: PostgreSQL + Vercel KV Redis
- **Analytics**: PostHog, Cloudflare Analytics
- **Deployment**: Vercel, Cloudflare Pages

## Development Patterns

- Use Bun workspaces for cross-package dependencies (`@duyet/package-name`)
- Turbo handles build orchestration and dependency management
- All apps share common Biome and TypeScript configurations
- Environment variables are globally managed through Turborepo
- Shared components and utilities live in `/packages` and are imported as workspace dependencies
- App-specific scripts may include prebuild steps or wrappers; check the relevant `package.json` before assuming `bun run dev` is the plain Vite server. Several apps also expose `test:watch`, `test:coverage`, `preview`, `sync`, `migrate`, `cleanup`, `rss`, `llms-txt`, and `sitemap` scripts.
- Notable app workflows:
  - `apps/agents`: `bun run prebuild` builds skills before `vite build`; `bun run dev` installs `http-proxy` before starting `node dev.js`, while `bun run dev:vite` runs Vite-only local development; `bun run test:e2e` runs the browser test harness.
  - `apps/api`: `bun run dev` uses Wrangler, `bun run deploy` builds then deploys the worker, and `bun run test:watch` is available for iterative API testing.
  - `apps/cv`: `bun run preview` serves the built app locally to validate production output before deploy.
  - `apps/data-sync`: `bun run sync:all`, `sync:wakatime`, `sync:cloudflare`, `sync:github`, `sync:unsplash`, `migrate:up|down|status|verify`, and `cleanup:dry-run`.
  - `apps/data-sync`: `bun run sync ai-code-percentage` refreshes the dataset used by `apps/ai-percentage`.
  - `apps/llm-timeline`: `bun run rss`, `llms-txt`, `sitemap`, `sync`, and `sync:dry` for content generation and sync checks.
  - Several apps also expose `cf:deploy:prod`; check the app `package.json` before using the generic root deploy flow for production.

## Git Workflow

- Use the `/commit` command to create a signed commit with the message
- Follow semantic commit conventions (feat, fix, chore, docs, etc.)
- Always include duyet and duyetbot as co-authors in commits:
  - `Co-Authored-By: duyet <me@duyet.net>`
  - `Co-Authored-By: duyetbot <duyetbot@users.noreply.github.com>`

### Commitlint Scopes

Commits must use one of these scopes (enforced by `.commitlintrc.js`):

| Scope | Description |
|-------|-------------|
| `deps` | Dependency updates |
| `post` | Blog post content |
| `blog` | Blog app (`apps/blog`) |
| `cv` | CV app (`apps/cv`) |
| `home` | Home app (`apps/home`) |
| `insights` | Insights app (`apps/insights`) |
| `photos` | Photos app (`apps/photos`) |
| `travel` | Travel app |
| `auth` | Authentication changes |
| `ci` | CI/CD pipeline |
| `ui` | Shared UI / cross-app styling |
| `rust` | Rust-related changes |
| `docs` | Documentation |
| `lib` | Shared packages (`packages/*`) |
| `agents` | Agents app (`apps/agents`) |
| `llm-timeline` | LLM Timeline app (`apps/llm-timeline`) |

Scope-less commits are allowed (warning, not error) but discouraged. For apps without a dedicated scope (e.g. `homelab`, `ai-percentage`, `data-sync`), use no scope or the closest match.
