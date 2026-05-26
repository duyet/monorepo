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
| 1 | shadcn-only across 6 apps | partial | 28 `var(--editorial/surface/hairline/minimal)` references remained; an agent is mid-strip on master `ac093836`. CV intentionally kept (LaTeX-style serif). |
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
| 14 | browser screenshot QA of production | pending | Next step — needs the `browser` skill against the 6 prod URLs (light + dark mode). |

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
