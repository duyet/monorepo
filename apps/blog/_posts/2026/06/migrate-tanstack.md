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
thumbnail: /media/2026/06/migrate-tanstack/hero.png
description: "The second ultrawork run: I asked Claude Code to migrate chmonitor.dev from Next.js to TanStack Start and went to sleep. It planned the work, spawned parallel agents, and kept going for days."
---

The second `ultrawork` run, right after the [overnight refactor](/2026/06/coding-agent-2026). I am trying to see how possible to make it fully autonomous — without checking a single line of code. The task: migrate chmonitor.dev from Next.js to TanStack Start.

```
Plan to migrate to TanStack: research to see is it good or bad?
Write a detailed plan and create issues for another agent to pick up.

The plan should ask agents to use the Claude Code Dynamic Workflows
to spawn parallel and multiple steps, including self-development,
self-PR, self-babysit PR, self-merge, and self-deploy.

I am going to sleep now, you have 30m to ask me anything.
```

This time the approach was different. Instead of doing everything itself, it created an epic with 13 sub-issues and a dependency DAG, then spawned workflows for more agents to pick them up in parallel: [Epic #1392](https://github.com/duyet/clickhouse-monitoring/issues/1392)

![Claude Code's plan and honest assessment of the migration](/media/2026/06/coding-agent/coding-agent-chm-migrate-tanstack-1.png)

It also gave an honest assessment: this is a bad trade right now. Not because it's infeasible — it mapped it to ~2–4 weeks of mechanical work — but the return on a live production system is questionable. I told it I don't care about 2 weeks or 2 months.

<div class="img-row">
<img src="/media/2026/06/migrate-tanstack/agent-substrate-spike-workflow.png" alt="Agent kicking off the substrate spike" />
<img src="/media/2026/06/migrate-tanstack/github-epic-issue-checklist.png" alt="GitHub epic with live issue checklist" />
</div>

Over the next couple of days, Codex, Coderabbit and Claude Code kept working together. Claude was driving — commenting on PRs, updating the epic, even [debating its reasoning with other agents](https://github.com/duyet/clickhouse-monitoring/pull/1444#issuecomment-4619786220).

The [$100 Claude Code Max](https://docs.anthropic.com/en/docs/claude-code/max) window limit kept hitting, but the epic issue held everything together as a source of truth. Each time it recovered, it picked up where it left off.

It was not fully autonomous — it woke me up a few times for Cloudflare API permissions and the production cutover. Claude also pushed back on migrating a live system without a proper notice period, which is a fair point.

## Dynamic workflows

The interesting part was the optimization loop. After the initial migration, it ran 11 cycles of: measure → optimize → PR → babysit → recompute → repeat. Model-tiered: Opus for reasoning, Sonnet for implementation, Haiku for trivial work. ~1.3M tokens per workflow.

<div class="img-row">
<img src="/media/2026/06/migrate-tanstack/workflow-optimization-cycle.png" alt="Dynamic workflow running" />
<img src="/media/2026/06/migrate-tanstack/token-usage-breakdown.png" alt="Token usage across models" />
</div>

<img src="/media/2026/06/migrate-tanstack/workflow-progress.png" alt="Workflow progress" />

It consumed ~1.2M tokens across all models. When the Claude Code Max window ran out, I continued on GLM 5.1 through Z.AI:

```bash
$ z_claude
⚡ Running Claude Code with Z.AI config...
Model Haiku: glm-4.7 | Model Sonnet: glm-5.1 | Model Opus: glm-5.1
```

<div class="img-row">
<img src="/media/2026/06/migrate-tanstack/glm-51-continue-session.png" alt="Continuing with GLM 5.1" />
<img src="/media/2026/06/migrate-tanstack/final-results.png" alt="GLM 5.1 optimization" />
</div>

## Where it landed

The migration is technically complete. 82/82 pages, 32/32 API routes, agent chat + MCP live.

![Next.js vs TanStack Start comparison](/media/2026/06/migrate-tanstack/nextjs-vs-tanstack-results.png)

| | Next.js | TanStack Start | Δ |
|---|---|---|---|
| Build time | 116s | ~10-14s | **−88%** |
| Build peak memory | 2,724 MB | 1,925 MB | **−29%** |
| Intermediate artifacts | 1.5 GB (.next) | 27 MB (dist) | **−98%** |
| Deploy output | 122 MB (.open-next) | 27 MB (.output) | **−78%** |
| Worker bundle (gzip) | 2,708 KiB | ~1,800 KiB | **−33.5%** |
| Dependencies | 142 | 85 | **−40%** |
| Source LOC (excl. tests) | 145,475 | 133,705 | **−8.1%** |
| Chart components | 142 | 101 | **−29%** |
| Line coverage | 81.9% | 88.07% | **+6.2 pts** |
| TBT /overview | 4,012ms | 941ms | **−77%** |
| LCP /overview | 18,951ms | 14,321ms | **−24%** |

The honest framing is that the direct product value is ~zero — the dashboard was and remains a client-fetched SPA, so no SSR was gained. The payoff is entirely build and infra.

### Claude Code usage

Across 13 sessions over ~3 days:

| | |
|---|---|
| Total cost | **$728.52** |
| API duration | ~20h |
| Wall duration | ~37h |
| Code changes | +31,243 / −6,466 lines |
| Cost per added line | ~$0.023 |

Opus did 90.7% of the work (~$661) — the migration was reasoning-heavy. Cache reads were >100M tokens; prompt caching is what kept the bill from being multiples higher.

| Model | Cost | Share |
|---|---|---|
| claude-opus-4-8 | ~$661 | 90.7% |
| claude-sonnet-4-6 | ~$42 | 5.7% |
| glm-5.1 / glm-4.7 | ~$24 | 3.2% |
| claude-haiku-4-5 | ~$2 | 0.3% |

