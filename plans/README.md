# plans/ — duyet.net roadmap & overnight agent kickoff

Generated 2026-07-03 from a four-cluster read-only audit (AI agents, content, data/insights, platform/DX). This directory is the single source of truth for what to build next and how to launch autonomous agents to build it overnight.

- **[STRATEGY.md](STRATEGY.md)** — positioning, north-star, principles, Now/Next/Later roadmap.
- **[AUDIT.md](AUDIT.md)** — consolidated evidence base (what exists, what's missing, what's broken).
- **[BACKLOG.md](BACKLOG.md)** — the full ranked feature menu (everything, every size).
- **Numbered plan files** — one initiative each, with a self-contained **Kickoff Prompt** you can paste into a fresh agent session.

## How to launch overnight work

Each plan file ends with a `## Kickoff Prompt` block. Copy it into a new agent session (Claude Code / Cowork) and it will run end-to-end. Prompts are self-contained but assume the **Overnight Agent Contract** below.

### Overnight Agent Contract (applies to every kickoff prompt)

1. **Read first:** `CLAUDE.md` → `docs/ai/internal-knowledge.md` → the referenced plan file. Do not skip.
2. **Autonomy:** full — implement, commit, push to `master`, and deploy to production (`pnpm run cf:deploy:prod` or the app's `cf:deploy:prod`). Pushing to `master` also auto-deploys via `.github/workflows/cf-deploy.yml`.
3. **Commits:** semantic messages with a scope from `.commitlintrc.js` (e.g. `feat(blog): …`). Keep changes surgical; do not reformat unrelated code.
4. **Verify narrow → broad:** `pnpm exec biome lint <path>` first, then `pnpm run lint` / `pnpm run check-types` / `pnpm run test` for the touched apps. Never mark done on a red check.
5. **Build/deploy on the main thread**, never inside a subagent (repo rule). Subagents may explore/implement; the main thread builds, deploys, and QAs.
6. **Browser QA after deploy** (per `goal.md`): screenshot the affected production URL in light + dark at desktop + mobile (~390px); confirm no horizontal overflow, dark-mode round-trips, and the feature renders.
7. **Design rule:** shadcn-only, no custom CSS/colors/fonts, Inter-first, warm/near-black tokens (see `docs/ai/internal-knowledge.md` → Public App UI Direction). Exceptions are called out explicitly per plan (e.g. the hero shader in `26`).
8. **Write findings back** to the plan file's Status section and, for durable maintenance facts, `docs/ai/core-memory.md`.
9. **Secrets:** never commit keys. If a task needs a new secret, add it to the secret-sync flow and document it; do not paste secret values into code or commits.

## Wave ordering & conflict groups

Run **P0 first**. Within a wave, initiatives in different conflict groups can run in parallel; same-group initiatives must run sequentially (they touch shared files).

| Wave | Plans | Rationale |
|------|-------|-----------|
| **0 — P0** | `00` | Security/correctness. Leaked keys + unauthenticated API + ungated Worker deploy. Do before anything else. |
| **1 — Foundations** | `10`, `30`, `40`, `44`(in `42`) | Shared agent-core, metrics-API+caching, error tracking + CI gates, env validation. Unblock everything downstream. |
| **2 — Capabilities** | `11`, `12`, `20`, `21`, `31`, `41` | RAG, MCP server, structured-data/OG, search, data observability, design-system. |
| **3 — Reach & polish** | `13`, `22`, `23`, `24`, `25`, `26`, `32`, `42`, `90` | Evals, photos, content graph, syndication, CV PDF, hero shader, date-range, hygiene, quick-wins. |

### Conflict groups (do not run two from the same group in parallel)
- **CI/workflows:** `00`, `31`, `40`, `90` all edit `.github/workflows/*`. Serialize or assign one owner.
- **Blog routes/scripts:** `20`, `21`, `23`, `24`, `90` touch `apps/blog`. Serialize per app.
- **apps/api:** `00`, `30`, `31` touch the Hono Worker. `00` (auth) lands first; `30`/`31` build on it.
- **Shared packages:** `10`, `41`, `42` touch `packages/*`. `41` (extract `@duyet/ui`) is the big mover — land it before other package refactors or rebase them after.
- **agent-ui/agent-api:** `10`, `13` touch the agent stack. `10` lands the shared core + streaming first.

## Plan index

| ID | Title | Area | Effort | Impact | Status |
|----|-------|------|--------|--------|--------|
| 00 | P0 security: secrets, API auth, deploy gate | Platform/All | M | Critical | Ready |
| 10 | Agent core + real streaming + history | Agents | L | High | Ready |
| 11 | RAG over blog + kb content | Agents | L | High | Ready |
| 12 | Reactivate apps/mcp as duyet.net MCP server | Agents | L | High | Ready |
| 13 | Agent observability + evals + tests | Agents | M | Med | Ready |
| 20 | Structured data (JSON-LD) + OG images | Content | M–L | High | Ready |
| 21 | Federated static full-text search | Content | M | High | Ready |
| 22 | Photos enrichment: feeds, map, albums | Content | M | Med | Ready |
| 23 | Cross-app content graph + embeddings | Content | L | Med | Ready |
| 24 | Syndication + newsletter | Content | M | Med | Ready |
| 25 | CV automated PDF export | Content | M | Med | Ready |
| 26 | Home hero: Paper Shaders redesign | Content | M | Med | Ready |
| 30 | Unified metrics API: caching, OpenAPI, export | Data | M–L | High | Ready |
| 31 | Data observability: freshness, status, alerts | Data | M | High | Ready |
| 32 | Insights: free date-range + drill-down | Data | L | High | Ready |
| 40 | Production readiness: Sentry + e2e + CI gates | Platform | L | High | Ready |
| 41 | Design system extraction + playground | Platform | L | High | Ready |
| 42 | Platform hygiene: env, dead code, WASM | Platform | M | Med | Ready |
| 90 | Quick wins sweep (<2h each) | All | S | High | Ready |

Status legend: **Ready** (kickoff prompt written) · **In progress** · **Shipped** · **Blocked**.
