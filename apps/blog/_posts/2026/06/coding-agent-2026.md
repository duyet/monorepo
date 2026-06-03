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
thumbnail: /media/2026/06/coding-agent/coding-agent-chm-autonomous-8-summary-screenshot-new-landing-page.png
description: "A quick snapshot of where coding agents are in 2026: you can hand one a real, multi-part task, walk away, and come back to merged PRs and a live deploy and workaround issues."
---

A quick snapshot of where coding agents are in 2026: you can hand one a real, multi-part task, walk away, and come back to merged PRs and a live deploy and workaround issues.

Late one night, just before bed, I handed Claude Code a task in `ultrawork` mode:

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

This was a big one. After a few rounds of exploration and an interview first, it came back with a clear target:

![Claude Code presenting the agreed plan for the overnight refactor](/media/2026/06/coding-agent/coding-agent-chm-autonomous-1-plan.png)

I have no much idea with its plan. I noticed I had only 30% left of my 5-hour usage window, and it will be at 3 AM. So I told it to keep working and to find a way to wake itself up if it ran out of tokens mid-task. I went to bed.

It got through the refactoring workflows and built the new landing page to move and redeploy everything (mcp, docs, etc). At 
`00:12`, since local-`ScheduleWakeup` caps at one hour, it pre-schedule a Remote Cloud Agent to continue with the current context, also flagged a concern: because this wasn't a local wake-up, some memory and context would be lost. I thought local session can auto recover after usage limit resolved.

![Workflows running with auto-scheduled wake-ups](/media/2026/06/coding-agent/coding-agent-chm-autonomous-2-workflows-and-auto-schedule.png)

```
※ Now, continuing non-stop. The landing-build workflow is running in the background ...
```

![The set of workflows in flight](/media/2026/06/coding-agent/coding-agent-chm-autonomous-3-workflows.png)

![The cloud schedule keeping the work alive overnight](/media/2026/06/coding-agent/coding-agent-chm-autonomous-4-cloud-schedule.png)

It was a very long conversation next morning. The session limit was hit three times, which I think maps to three one hour capped local wake-ups. The remote trigger did fire, but the local session also recovered. It noted that the remote trigger had run, so it was checking status by pulling the PRs.

![Reviewing the overnight run from the Claude iPhone app](/media/2026/06/coding-agent/coding-agent-chm-autonomous-5-claude-iphone.png)

The one snag was the **https://dash.chmonitor.dev** deploy, but it found a way to recover. It left two hand-off items for me - which I'm going to pass to a fresh Claude session anyway 🗿.
 
![The two hand-off items, viewed on mobile](/media/2026/06/coding-agent/coding-agent-chm-autonomous-6-claude-iphone.png)

![The final summary of the overnight work](/media/2026/06/coding-agent/coding-agent-chm-autonomous-7-summary.png)

Everything just worked, and I never looked at the code as always. It all deployed correctly:

![The new landing page, live](/media/2026/06/coding-agent/coding-agent-chm-autonomous-8-summary-screenshot-new-landing-page.png)

![The dashboard moved to its new domain](/media/2026/06/coding-agent/coding-agent-chm-autonomous-9-summary-screenshot-new-dash.png)

That is roughly the state of coding agents in mid-2026: long-running and mostly autonomous. The interesting question is no longer "can it write the code" but how it manages itself over hours — planning, splitting work into PRs, merging them, and routing around its own token limits with scheduled wake-ups and cloud agents. I reviewed the whole run from my phone and never opened the editor.

What stands out to me is the harness, not just the model. I spent a good while in Codex but Claude Code still does the most of any of them for this kind of long, self-managing run. It is still good enough that it holds up even when I swap in a different model like GLM 5.1. That is the part that feels ahead right now.

![Session usage for the overnight run: \$58.69 total, 10h 18m wall time, 616 lines added](/media/2026/06/coding-agent/coding-agent-chm-autonomous-10-session-usage.png)
