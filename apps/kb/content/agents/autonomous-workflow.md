---
title: "Autonomous Workflow Patterns"
category: "agents"
tags: ["autopilot", "loop", "agents", "workflow"]
links: ["duyetbot-scope", "commit-push-deploy", "deploy-workflow"]
summary: "Patterns for running duyetbot autonomously — /loop for recurring tasks, background deploys, memory checkpoints before context compaction."
updated: "2026-05-26"
---

# Autonomous Workflow Patterns

duyetbot can run autonomously within a session (via `/loop`) or as a one-shot task (via `claude -p`). These patterns reduce human-in-the-loop friction for routine maintenance.

## Context compaction

Auto-compaction is explicitly welcomed when the conversation grows long. The user confirmed on 2026-05-25: "remember -> can compact to save tokens when needed."

Before compaction happens, save anything future turns will need into a memory file or commit body. Never repeat goal text verbatim in responses — the goal hook re-surfaces it on every stop. Commit messages are the most durable form of session memory.

## Background deploys

Always run `cf:deploy:prod` in the background after pushing. Continue with the next task immediately. The harness notifies when the deploy completes; verify production after the notification.

Do NOT run two background deploys in parallel — `cf-deploy-prod.sh` renames `.env.local` → `.env.local.deploy-bak` during execution. Parallel invocations collide on that rename and lose `CLOUDFLARE_API_TOKEN` propagation.

## Recurring task pattern (`/loop`)

```
/loop 1h "run PLAN.md maintenance: benchmark → assess → act → verify → ship"
```

Each iteration:
1. Measure current state
2. Fix the highest-priority issue
3. Verify (lint + test + build pass)
4. Commit and push
5. Deploy in background
6. Log to `memory/maintenance-log.md`

## Autonomous decision priority

When running unattended, address issues in this order:

1. Build fails → fix immediately
2. Tests fail → fix immediately
3. Lint errors → auto-fix
4. Deploy needed → verify then ship
5. Code quality → improve if no higher-priority issues open
6. New features → only from `memory/roadmap.md`

## Improvement rotation

Nine improvement cycles completed as of March 2026 (~155 total fixes). A cycle typically runs as a scoped `/loop` targeting one category (security, dead code, design, tests). Cycle 9 added 104 new tests and unified the design system across llm-timeline, cv, and homelab.
