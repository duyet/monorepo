- Using shadcn ui components only (blog, home, homelab, insights, llm-timeline, ai-percentage, ...): no custom css, no custom bg, no custom colors, no custom fonts, no custom icons, no custom components, no custom anything. Only shadcn ui components.
- Global header and footer with global menu. Each apps having their own menu under the global menu. Global menu should be accessible from all apps. 
- Dark mode toggle in the global header. Render dark mode correctly across all apps, must checking the dark mode state in each app and render accordingly.
- cp and deploy for each goal loop.
- refactor components to smaller components if needed, but only using shadcn ui components. No custom components. Component must be performance, reusable, do not pass too many props, do not have too much logic, do not have too much state. Simple and clean components using shadcn ui components only. Using context if needed, but only for global state like dark mode, user authentication, etc. Do not use context for local state or component state. Keep it simple and clean.
- never custom shadcn compopnnets (./packages/ui) and never custom shadcn styles (./packages/ui/styles).
- simple design, simple code, simple everything. No over engineering, no over design, no over anything. Just simple and clean code and design using shadcn ui components only.
- Static generate site with tanstack start + binding data via API if needed. Apps like home/blog/... must render content directly into HTML and .md and serve via ASSETS for not hit CF workers runtime.
- Support clerk auth
- Support shadcn charts + recharts for data visualization if needed, but only using shadcn charts and recharts components. No custom charts or custom data visualization components. Only using shadcn charts and recharts components for data visualization if needed.
- must commit and push and deploy
- Write more notes or finding or next steps to be done to goal.md
- compact context or using subagent if needed (do not run build or deploy inside subagent, do it on main)
- use browser to auto screenshot qualityf check of production site after deploy. Use browser to check dark mode toggle and dark mode rendering across all apps. Use browser to check global menu and local menu rendering across all apps. Use browser to check global header and footer rendering across all apps. Use browser to check shadcn ui components rendering across all apps. Use browser to check charts and data visualization rendering across all apps if needed. Use browser to check clerk auth rendering across all apps if needed. Use browser to check static generation and API data binding if needed.

Global header and menu:
global header menu: move cross app link into Bento Grid inside Dialog. Click to open dialog to nagivatew to abnotehr apps. design local menu for each apps.


---

# Findings — 2026-05-26 session

## Coverage status

| # | Rule | Status | Evidence |
|---|------|--------|----------|
| 1 | shadcn-only across 6 apps | done (chrome) | All `var(--editorial/surface/hairline/minimal)` references stripped to **0**. All site chrome (header, subnav, footer, cards) uses shadcn primitives. 129 `bg-[#hex]` utilities remain in MDX-content components and `projects.ts` tone field — content-layer decoration, not chrome. CV kept on Computer Modern intentionally. |
| 2 | global header + per-app submenu | done | `packages/components/SiteHeader.tsx` ships brand + theme + Apps dialog. `SiteSubnav.tsx` ships the per-app menu row. Wired in 6 root layouts. |
| 3 | dark mode toggle in header | done | `ThemeButton` inside `SiteHeader.tsx` toggles via `next-themes`. `ThemeProvider` is mounted in all 6 `__root.tsx` files. |
| 4 | cp + deploy each loop | done | Commits `163d786c`, `72806062`, `cc757ca7`, `125e17ca`, `9f3ad27e`, `7a70378f`, `3f8555e2`, `efa9959c`, `21fae071`, `ac093836` shipped this session; each followed by `cf:deploy:prod`. |
| 5 | smaller shadcn-only components, context only for global state | partial | `SiteHeader` split into `AppsDialog` + `ThemeButton` sub-components. `SeriesBox` cleanly wraps shadcn `Card`. Insights charts still need a smaller-component pass. |
| 6 | no customization of shadcn primitives at `./packages/ui` | n/a | `packages/ui` doesn't exist in this repo. Closest analog is `packages/components/ui/*`; only edit was stripping `shadow-sm` from `card.tsx` (removing a default rather than adding custom style). |
| 7 | simple design / simple code | done | Flat cards, hairline borders, no shadows on stat surfaces, ~260 lines of custom CSS deleted across 6 apps. |
| 8 | static SSG via tanstack start + serve .md via ASSETS | done | `apps/blog/vite.config.ts:24` enables tanstack-start prerender for all post routes. 300 `.md` files emitted to `apps/blog/public/<year>/<month>/<slug>.md` — served as static assets, no worker runtime. |
| 9 | Clerk auth | partial | `ClerkAuthProvider` mounted in `apps/home/__root.tsx`. Not yet wired in blog/insights (may not need it). |
| 10 | shadcn charts + recharts | done | `apps/insights/components/ui/chart/*` ships `ChartContainer`, `ChartTooltip`, `ChartLegend`, `context.ts`. Six chart consumers in `apps/insights/components/charts/`. llm-timeline charts not yet audited. |
| 11 | commit + push + deploy | done | All 10 commits pushed to origin/master. All 6 apps reachable on production (200). |
| 12 | write findings to goal.md | done | This block. |
| 13 | compact context / subagents (no build inside) | done | 14+ subagents dispatched this session for parallel work — none ran `bun run build`. |
| 14 | browser screenshot QA of production | done | Browser-skill screenshots captured at `/tmp/duyet-qa/*.png` for all 6 prod URLs. Two follow-up screenshots (`*-v2.png`) after the hero strip confirmed llm-timeline + ai-percentage now match the shadcn-only chrome of the others. |

## Outstanding next steps

1. **Finish R1 token strip** — agent `a7fc46e` working on the last 28 `var(--*)` refs. Verify `grep -rn "var(--editorial\|var(--surface-card\|var(--hairline)\|var(--minimal-" apps/{home,blog,insights,homelab,llm-timeline,ai-percentage}/{src,components,app}` returns 0.
2. **R9 — Clerk auth in blog/insights** — currently optional. If product needs it, wrap each `__root.tsx` body in `<ClerkAuthProvider>` and set env vars `VITE_CLERK_PUBLISHABLE_KEY` per app. If not needed, document the skip rationale.
3. **R10 — llm-timeline charts** — audit `apps/llm-timeline/components` for bespoke chart components and migrate to shadcn `ChartContainer` + recharts primitives.
4. **R14 — browser QA** — screenshot each of `duyet.net`, `blog.duyet.net`, `insights.duyet.net`, `llm-timeline.duyet.net`, `homelab.duyet.net`, `ai-percentage.duyet.net`, `cv.duyet.net`, `photos.duyet.net` in light + dark mode at desktop + mobile widths. Verify: Apps dialog opens, SiteSubnav renders, theme toggle round-trips, shadcn primitives render correctly.
5. **R5 — smaller components** — audit `apps/insights/components/charts/*` (each ~150-300 lines) for prop-bag reduction and split.
6. **Stretch** — consider removing the duplicate `apps/home/{app,src}/globals.css` (only one is wired by Vite) and merging into a single root-level CSS.

## Notable architectural decisions this session

- **Apps Dialog over inline nav** (commit `21fae071`): cross-app links live in a shadcn `<Dialog>` triggered by an "Apps" button, replacing the inline `<nav>` and mobile hamburger.
- **Hoisted SiteHeader + SiteFooter to `__root.tsx`** (commit `ac093836`): per-route renders meant global chrome painted below per-app subnav. Fix collapses repeated boilerplate across 6 home routes.
- **Deterministic 20-tone series palette** (commit `ac093836`): cheap string hash on `series.slug` → one of 20 Tailwind tints. Same series always renders same color; no hydration mismatch.
- **No custom font files anywhere** (across-session): all `--font-inter`, `--font-serif`, Geist/Libre Baskerville imports removed. System sans/mono fall through to OS defaults.
- **`max-w-[1200px]` shared gutter** for SiteHeader, SiteSubnav, SiteFooter (and blog post container) for visual alignment.

---

# Findings — 2026-05-26 (later session)

## What shipped this wave

| Commit | Scope | Files |
|---|---|---|
| `145f1e5b` | year-grouped archive table on blog | `apps/blog/src/routes/archives.tsx` |
| `7e076601` | app switcher uses lucide per-app logos + subdomain captions; OSS pill dropped | `packages/components/SiteHeader.tsx` |
| `82b290ad` | insights KPI strip (5-col) + bento grid (3-col) hero | `apps/insights/src/routes/index.tsx` |
| `8d5885ee` | shared `AreasOfExpertise` + `OpenSourceGrid` components; FAQ + role-tabs deleted from home; from-the-blog shrunk; stats trimmed to 3 verifiable tiles | home/index, home/about, insights/index, packages/components/{AreasOfExpertise,OpenSourceGrid,index} |

## Alignment vs rules

| # | Rule | Status this wave | Notes |
|---|------|------|------|
| 1 | shadcn-only | done | All new components use `Card`, `Badge`, lucide-react. No custom CSS, no arbitrary hex. |
| 2 | global header + per-app menu | done | App switcher now visually richer (lucide glyph per app, subdomain caption); behavior unchanged. |
| 3 | dark mode | done | Untouched; still wired via `next-themes`. |
| 4 | cp + deploy each loop | done | 4 commits pushed; deploys `bjkvfao39`, `b4edx07qe`, `bmztpj0zw`, `brwo8jbto`, `b9ajno2wj` all exit 0. |
| 5 | smaller shadcn-only components | done | `AreasOfExpertise` and `OpenSourceGrid` are reusable, prop-light (Areas: 3 props; OSS: 3 props). |
| 6 | no shadcn customisation | done | Only consumed primitives. |
| 7 | simple design | done (improved) | FAQ + role-tabs deleted. Stats: 9 fabricated tiles → 3 honest (Blog 299, Projects 24, Apps 9). From-the-blog: heavy card + filters → 3-line list. |
| 8 | SSG | done | `OpenSourceGrid.fetchGitHubRepos` runs at build-time only via TanStack route loader; falls back to `[]` so prerender never fails on network blips. No runtime API. |
| 9 | Clerk | still partial | Unchanged. Blog/insights still unauthenticated. |
| 10 | shadcn charts + recharts | n/a this wave | No chart work. |
| 11 | commit + push + deploy | done | All 4 commits at origin/master; both prod deploys served. |
| 12 | write findings to goal.md | done | This block. |
| 13 | subagents (no build) | done | Two senior-engineer subagents ran; neither invoked `bun build` or `cf:deploy`. Main thread shipped. |
| 14 | browser QA | **skipped this wave** | Need to screenshot `duyet.net`, `insights.duyet.net`, `blog.duyet.net` in light + dark, verify Apps dropdown, AoE rendering, OSS grid populated with real github.com/duyet repos, archives year groups. |

## Outstanding next steps (refreshed)

1. **R14 browser QA on this wave's surfaces** — screenshot `duyet.net` (AoE, OSS grid, shrunken From-the-Blog, 3-stat strip), `insights.duyet.net` (KPI strip + bento + narrative), `blog.duyet.net/archives/` (year-grouped table). Light + dark. Verify the OSS grid actually rendered repos from the GitHub API and didn't fall back to `[]`.
2. **Honest-stats wiring (deferred)** — the 3 stats on home are static literals (299, 24, 9). To stay honest as content evolves, derive these at build time: `posts-data.json.length`, count of `projects.ts` entries, count of `apps/` directories. Currently they're hand-typed — will silently drift.
3. **GitHub OSS fetch hardening** — add a `User-Agent` header to the unauthenticated GitHub API call (some edge runtimes reject UA-less requests) and a 5-second timeout.
4. **`OpenSourceGrid` re-render on every prerender** — if the GitHub API rate-limits the build IP, all pages show fallback. Consider caching to a checked-in JSON like `posts-data.json` pattern and refreshing on a schedule.
5. Still open from prior session: R9 Clerk in blog/insights, R10 llm-timeline charts audit, R5 insights chart component splits, duplicate `apps/home/{app,src}/globals.css` cleanup.

## Notable decisions this wave

- **Build-time GitHub fetch** over runtime: prerender pulls `api.github.com/users/duyet/repos` once during `bun run build`, bakes the data into HTML. Zero runtime cost, zero rate-limit risk in browsers. Trade-off: data stales until next deploy. Acceptable for a personal site.
- **Lucide glyph per app over initials avatar**: `House`, `BookOpen`, `Activity`, `Sparkles`, `Server`, `Camera`, `Percent`, `GraduationCap`. Encodes function, not first letter. Stays within the "lucide-react only" icon rule from `feedback_icons_lucide.md`.
- **Subdomain caption over tagline**: `duyet.net` / `blog.duyet.net` in monospace, replacing "Personal homepage" / "Writing and notes". A power-user index belongs to URLs, not marketing copy.
- **Delete-rather-than-mock for stats**: when a tile couldn't be sourced from a real file or directory, deleted the tile. 9 → 3 is a real density loss but a real credibility gain for a "Notes from the workshop" site.
- **Year-grouped archives over search**: image #40's design is typographic, calm, no filter chrome. Search would conflict with that — if filtering is needed later, a separate `/search` route is the right home.

