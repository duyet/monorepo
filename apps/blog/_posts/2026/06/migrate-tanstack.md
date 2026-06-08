---
title: Autonomous Claude Code Migrate Nextjs to Tanstack Start
date: 2026-06-03
author: Duyet
category: AI
series: AI Harness Engineering
tags:
  - AI
  - Agents
  - Claude Code
slug: /2026/06/migrate-tanstack
thumbnail: /media/2026/06/migrate-tanstack/thumbnail.png
description: "I handed Claude Code a real migration task — Next.js to TanStack Start on a production ClickHouse monitoring dashboard — and let it run autonomously. Here's what happened."
---

The second large `ultrawork` run used **dynamic workflows** to migrate chmonitor.dev from Next.js to TanStack Start, to see how autonomous it can get.

```
Plan to migrate to TanStack: research to see is it good or bad?
Write a detailed plan and create issues for another agent to pick up.

The plan should ask agents to use the Claude Code Dynamic Workflows
to spawn parallel and multiple steps, including self-development,
self-PR, self-babysit PR, self-merge, and self-deploy.
Verify production with all end-to-end tests, aiming for 100% automation without me.

I am going to sleep now, you have 30m to ask me anything.
```

The approach here is different: I asked it to create issue tickets, then spawn workflows for more agents to pick up with more detail: [Epic #1392](https://github.com/duyet/clickhouse-monitoring/issues/1392)

```
Issue breakdown (epic + 13 issues) with dependency DAG

        ┌────────────────────────────────────────────┐
        │ #0 Epic + baselines + create all issues    │  (bootstrap, sequential)
        └───────────────┬────────────────────────────┘
                        ▼
        #1 Substrate spike (scaffold + CF deploy)         ← CRITICAL PATH, blocks all
                        ▼
        #2 Shared config + env bridge (NEXT_PUBLIC_→VITE_)
            ├──────────────┬───────────────┬─────────────────┐
            ▼              ▼               ▼                 ▼
        #3 Routing      #5 API routes    #6 middleware     (these 4 fan out in parallel)
           skeleton        (×56, fan)       →auth guards
            ▼              ▼               ▼
        #4 Data/SWR     #7 Clerk port    #8 Agent stream   #9 MCP in-proc route
           wiring          (clerk-tsr)      (verify)          (thin re-point)
            ▼
        #10 Pages (×83, fan out by route group)
            └──────────────┬─────────────────────────────────┐
                           ▼                                  ▼
                  #11 CI/CD rewire                    #12 e2e + smoke parity
                           └───────────────┬──────────────────┘
                                           ▼
                              #13 Production cutover (canary → 100% → bake → decommission)

Parallelizable waves: after #2, issues #3, #5, #6, #9 start together.
#5 (API routes) and #10 (pages) are themselves fanned out internally
via the Workflow tool by category / route group.
```

![Claude Code's plan and honest assessment of the migration](/media/2026/06/coding-agent/coding-agent-chm-migrate-tanstack-1.png)

I don't care about 2 weeks or 2 months.

<div class="img-row">
<img src="/media/2026/06/migrate-tanstack/agent-substrate-spike-workflow.png" alt="Agent kicking off the critical-path substrate spike via a dynamic workflow" />
<img src="/media/2026/06/migrate-tanstack/github-epic-issue-checklist.png" alt="GitHub epic with live issue checklist in DAG order" />
</div>

Codex, Coderabbit and Claude Code (under @duyet) and duyetbot keep working together, Claude Code driving them all until the epic issue is fulfilled. Claude Code keeps commenting and updating progress — the [$100 Claude Code Max](https://docs.anthropic.com/en/docs/claude-code/max) window limit kept hitting, so the epic issue was the source of truth for continuity: [Epic #1392](https://github.com/duyet/clickhouse-monitoring/issues/1392)

Claude Code also [debates and explains its reasoning](https://github.com/duyet/clickhouse-monitoring/pull/1444#issuecomment-4619786220) to other agents.

<div class="img-row">
<img src="/media/2026/06/migrate-tanstack/test-coverage-comparison.png" alt="Test coverage comparison between Next.js and TanStack Start" />
<img src="/media/2026/06/migrate-tanstack/test-coverage-detail.png" alt="Detailed test coverage metrics" />
</div>

## Not fully autonomous — yet

This will not be fully autonomous if you're doing this for the first time. It woke me up a few times to add more Cloudflare API permissions, handle production cutover, etc. Claude also rejected the migration a few times — arguing that a live production system shouldn't be migrated without proper notice periods or addressing breaking changes in docs.

```
The three remaining open issues (#1403, #1404, #1405) are all owner-gated:
- #1403 — build Win-Metrics captured (21.2s/1.79 GB), old baseline deferred
- #1404 — smoke unblocked by registry fixes, needs your CHM_API_KEY_SECRET + Lighthouse
- #1405 — production cutover — holding for your explicit go
```

## Dynamic workflows

The optimization loop: **measure → post → optimize → PR → babysit → recompute → repeat**

- Worker bundle reduction
- Runtime performance
- Security hardening
- Design consistency
- Docs updates

Using cheap haiku model for trivial tasks (measure, PR comment, babysit, ...) and sonnet/opus for complex reasoning. Optimization cycle: investigate (Opus/Sonnet) → implement+PR (Sonnet, worktree) → report (Haiku). Model-tiered. ~1.3M tokens per workflow.

<div class="img-row">
<img src="/media/2026/06/migrate-tanstack/workflow-optimization-cycle.png" alt="Dynamic workflow optimization cycle running" />
<img src="/media/2026/06/migrate-tanstack/workflow-progress.png" alt="Workflow progress dashboard" />
</div>

![Token usage breakdown across models](/media/2026/06/migrate-tanstack/token-usage-breakdown.png)

This consumed 1.2M tokens (across all models) and hit ~40% of Claude Code Max window limit, so I continued on GLM 5.1 with `z_claude`:

```bash
$ z_claude

⚡ Running Claude Code with Z.AI config...
Base URL: https://api.z.ai/api/anthropic
Model Haiku: glm-4.7 | Model Sonnet: glm-5.1 | Model Opus: glm-5.1
```

<div class="img-row">
<img src="/media/2026/06/migrate-tanstack/glm-51-continue-session.png" alt="Continuing the session with GLM 5.1" />
<img src="/media/2026/06/migrate-tanstack/glm-51-optimization.png" alt="GLM 5.1 working on optimization" />
</div>

![Final results after optimization cycles](/media/2026/06/migrate-tanstack/final-results.png)

## Results

After 11 optimization cycles, the migration reached technical completion. Full comparison measured live against both production domains:

| Metric | Next.js | TanStack Start | Δ |
|---|---|---|---|
| **Build time** | 116s | ~10-14s | **−88%** |
| **Worker bundle (gzip)** | 2,708 KiB | ~1,800 KiB | **−33.5%** |
| **Deploy output** | 122 MB | 27 MB | **−78%** |
| **Dependencies** | 142 | 85 | **−40%** |
| **Source LOC** | 145,475 | 133,705 | **−8.1%** |
| **Line coverage** | 81.9% | 88.07% | **+6.2 pts** |
| **Tests** | 2,894 | 1,290 | **−56%** (leaner) |
| **TBT /overview** | 4,012ms | 941ms | **−77%** |
| **LCP /overview** | 18,951ms | 14,321ms | **−24%** |
| **TTFB** | 193ms | 191ms | parity |

### Sub-issues status

| Issue | Description | Status |
|---|---|---|
| [#1393](https://github.com/duyet/clickhouse-monitoring/issues/1393) | Substrate spike (scaffold + CF deploy) | ✅ |
| [#1394](https://github.com/duyet/clickhouse-monitoring/issues/1394) | Shared config + env bridge | ✅ |
| [#1395](https://github.com/duyet/clickhouse-monitoring/issues/1395) | Routing skeleton | ✅ |
| [#1396](https://github.com/duyet/clickhouse-monitoring/issues/1396) | Data/SWR wiring | ✅ |
| [#1397](https://github.com/duyet/clickhouse-monitoring/issues/1397) | API routes (×56) | ✅ |
| [#1398](https://github.com/duyet/clickhouse-monitoring/issues/1398) | Middleware / auth guards | ✅ |
| [#1399](https://github.com/duyet/clickhouse-monitoring/issues/1399) | Clerk port | ✅ |
| [#1400](https://github.com/duyet/clickhouse-monitoring/issues/1400) | Agent stream | ✅ |
| [#1401](https://github.com/duyet/clickhouse-monitoring/issues/1401) | MCP in-proc route | ✅ |
| [#1402](https://github.com/duyet/clickhouse-monitoring/issues/1402) | Pages (×83) | ✅ |
| [#1403](https://github.com/duyet/clickhouse-monitoring/issues/1403) | CI/CD rewire | 🟢 |
| [#1404](https://github.com/duyet/clickhouse-monitoring/issues/1404) | e2e + smoke parity | 🟡 |
| [#1405](https://github.com/duyet/clickhouse-monitoring/issues/1405) | Production cutover | 🔴 owner-gated |

### Cost

| Metric | Value |
|---|---|
| **Total cost (documented)** | **$728.52** |
| Sessions | 13 |
| API duration | ~20h |
| Wall duration | ~37h |
| Code changes | +31,243 / −6,466 lines |
| Cost per added line | ~$0.023 |

Opus: 90.7% of cost (~$661) — the migration was reasoning-heavy. Cache reads >100M tokens; prompt caching is what kept the bill from being multiples higher.

**Cutover ([#1405](https://github.com/duyet/clickhouse-monitoring/issues/1405)) remains my call — not flipping yet.** The direct product value is ~zero since no SSR was adopted (the dashboard remains a client-fetched SPA). The payoff is entirely build/infra/maintainability.

## Skills used

Most used skills during the migration:

- [context7](https://www.skills.sh/upstash/context7/context7-mcp) — library docs on demand
- cloudflare/skills — Workers, Pages, KV
- tanstack-skills — Router, Start, Query

```bash
npx skills add upstash/context7
npx skills add cloudflare/skills
npx skills add tanstack-skills/tanstack-skills
```
