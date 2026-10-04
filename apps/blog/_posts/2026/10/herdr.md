---
title: Herdr
date: 2026-10-04
author: Duyet
category: AI
series: AI Harness Engineering
tags:
  - AI
  - Agents
  - Herdr
slug: /2026/10/herdr
description: "I landed 1000+ PRs this week, and this is how I use Herdr these days to achieve that."
thumbnail: /media/2026/10/herdr/thumbnail.jpeg
---

I landed 1000+ PRs this week, and this is how I use [Herdr](https://herdr.dev) these days to achieve that.

I am starting the master agent session as the manager (for each repo), with the smart models, asking it to take that role: manage and spawn the child Herdr worktree sessions, prompting them, checking their progress, more agents to review, merge, etc. Each child worktree can run any coding agent. I can spawn 50 sessions at a time across Pi, Claude, Grok, OpenCode, and Devin, etc., to keep them planning, implementing, and doing PR reviews. You can see they communicate via Herdr ([Herdr Agent Automation](https://herdr.dev/docs/agent-automation/)), sending prompts to each other, inspecting their state, collecting their results, etc., and keep them all busy day and night. Create skills to teach your master agent which is the best for which task.

I have the [herdr-desk](https://github.com/duyet/herdr-desk) plugin, which is scheduled to wake up sometimes to do the automated and boring tasks: GitHub issue triage, code review, summary stuff, and reporting to me via Telegram.

This is also the best for working across repos, one integrated with another, and one agent can raise an issue for another one to fix, and both keep improving.

You can launch Herdr on multiple machines and keep one Herdr dashboard, even on your phone. Install Tailscale on all of them. You should design the Tailscale ACL groups carefully, to isolate them for security.

If you are using Grok Bot or Cue or Muse or Dot, install Tailscale and Herdr on their computer, working the same way. They can control it, and you can see what is actually running from your Mac.

![Herdr sessions across repos](/media/2026/10/herdr/herdr-1.jpeg)

<div></div>

![Herdr agent integrations](/media/2026/10/herdr/herdr-2.jpeg)
