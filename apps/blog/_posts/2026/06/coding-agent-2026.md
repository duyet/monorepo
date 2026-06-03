---
title: Letting Claude Code work overnight, 2026
date: 2026-06-03
author: Duyet
category: AI
series: AI Harness Engineering
tags:
  - AI
  - Agents
  - Claude Code
slug: /2026/06/coding-agent-2026
thumbnail: /media/2026/06/coding-agent/thumbnail.png
description: "A quick snapshot of where coding agents are in 2026: you can hand one a real, multi-part task, walk away, and come back to merged PRs, a live deploy, and a few issues it worked around on its own."
---

A quick snapshot of where coding agents are in 2026: you can hand one a real, multi-part task, walk away, and come back to merged PRs, a live deploy, and a few issues it worked around on its own.

## Refactor to monorepo

Late at night, just before bed, I handed Claude Code a task in `ultrawork` mode:

```
Create a workflow:

- Refactor chmonitor.dev into a monorepo and add a landing page from the design: https://api.anthropic.com/v1/design/h/xxxxxx?open_file=chmonitor+Landing.html
- Move the current main app from https://chmonitor.dev to https://dash.chmonitor.dev.
  - Rename apps/web to apps/dashboard.
  - Support cloud.chmonitor.dev but redirect to dash.chmonitor.dev.
- Deploy the landing page at https://chmonitor.dev (new: apps/landing).
- Rename apps/mcp-worker to apps/mcp (standardize).
- Docker: keep release code of the main app only + docs.
- Make as many PRs as possible with clear, scoped changes. Use /github:babysit-pr to auto-merge them one by one.
```

This was a big one. After a few rounds of exploration and an interview, it came back with a clear target:

![Claude Code presenting the agreed plan for the overnight refactor](/media/2026/06/coding-agent/coding-agent-chm-autonomous-1-plan.png)

I didn't have a strong read on the plan. I noticed I had only 30% left in my 5-hour usage window, and it would reset around 3 AM. So I told it to keep working and to find a way to wake itself up if it ran out of tokens mid-task. I went to bed.

It got through the refactoring workflows and built the new landing page, then moved and redeployed everything (mcp, docs, etc). At `00:12`, since the local `ScheduleWakeup` caps at one hour, it pre-scheduled a Remote Cloud Agent to continue with the current context. It also flagged a concern: because this wasn't a local wake-up, some memory and context would be lost. I figured the local session could auto-recover once the usage limit reset.

<div class="img-row">
<img src="/media/2026/06/coding-agent/coding-agent-chm-autonomous-2-workflows-and-auto-schedule.png" alt="" />
<img src="/media/2026/06/coding-agent/coding-agent-chm-autonomous-3-workflows.png" alt="The set of workflows in flight" />
</div>

It was a very long conversation by the next morning. The session limit was hit three times, which I think maps to three one-hour-capped local wake-ups. The remote trigger did fire, but the local session also recovered. It noted that the remote trigger had run, so it was checking status by pulling the PRs.

The one snag was the **https://dash.chmonitor.dev** deploy, but it found a way to recover. It left two hand-off items for me - which I'm going to pass to a fresh Claude session anyway 🗿.
 
<div class="img-row">
<img src="/media/2026/06/coding-agent/coding-agent-chm-autonomous-5-claude-iphone.png" alt="Reviewing the overnight run from the Claude iPhone app" />
<img src="/media/2026/06/coding-agent/coding-agent-chm-autonomous-6-claude-iphone.png" alt="The two hand-off items, viewed on mobile" />
<img src="/media/2026/06/coding-agent/coding-agent-chm-autonomous-7-summary.png" alt="The final summary of the overnight work" />
</div>

Everything just worked, and as always I never looked at the code. It all deployed correctly:

<div class="img-row">
<img src="/media/2026/06/coding-agent/coding-agent-chm-autonomous-8-summary-screenshot-new-landing-page.png" alt="The new landing page, live" />
<img src="/media/2026/06/coding-agent/coding-agent-chm-autonomous-9-summary-screenshot-new-dash.png" alt="The dashboard moved to its new domain" />
</div>

That is roughly the state of coding agents in mid-2026: long-running and mostly autonomous. The interesting question is no longer "can it write the code" but how it manages itself over hours — planning, splitting work into PRs, merging them, and routing around its own token limits with scheduled wake-ups and cloud agents. I reviewed the whole run from my phone and never opened the editor.

What stands out to me is the harness, not just the model. I spent a good while in Codex, but Claude Code still does the most of any of them for this kind of long, self-managing run. The harness is good enough that it holds up even when I swap in a different model like GLM 5.1. That is the part that feels ahead right now.

![Session usage for the overnight run: \$58.69 total, 10h 18m wall time, 616 lines added](/media/2026/06/coding-agent/coding-agent-chm-autonomous-10-session-usage.png)

---

## Migrate Nextjs to Tanstack Start

The second large `ultrawork` run used **dynamic workflows** to migrate chmonitor from Next.js to TanStack Start.

```
Plan to migrate to TanStack: research to see is it good or bad? Write a detailed plan and create issues for another agent to pick up.

The plan should ask agents to use the Claude Code Dynamic Workflows to spawn parallel and multiple steps, including self-development, self-PR, self-babysit PR, self-merge, and self-deploy. Verify production with all end-to-end tests, aiming for 100% automation without me.
```

The approach here is different: I asked it to create issue tickets, then spawn workflows for more agents to pick up with more detail: https://github.com/duyet/clickhouse-monitoring/issues/1392

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

Parallelizable waves: after #2, issues #3, #5, #6, #9 start together. #5 (API routes) and #10 (pages) are themselves fanned out internally via the Workflow tool by category / route group.

My honest assessment: this is a bad trade right now

Not because it's infeasible — the exploration shows it's ~2–4 weeks of mechanical work (83 pages, 56 API routes, one middleware, redo the OpenNext/wrangler substrate). It's bad because: ...
```

![Claude Code's plan and honest assessment of the Next.js to TanStack migration](/media/2026/06/coding-agent/coding-agent-chm-migrate-tanstack-1.png)

I don't care about 2 weeks or 2 months.

<div class="img-row">
<img src="/media/2026/06/coding-agent/coding-agent-chm-migrate-tanstack-2.png" alt="The agent kicking off the critical-path substrate spike via a dynamic workflow" />
<img src="/media/2026/06/coding-agent/coding-agent-chm-migrate-tanstack-3.png" alt="The resulting GitHub epic with the live issue checklist in DAG order" />
</div>