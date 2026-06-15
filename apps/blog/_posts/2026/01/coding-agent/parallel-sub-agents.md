---
title: Parallel Sub-Agents / Teams
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/parallel-sub-agents
parent: /2026/01/coding-agent
description: Lead a team of parallel agents with leader delegation to senior and junior roles
---

Don't just try to generate code, start leading a team of parallel agents and using background tasks for your agents. 

I built a [team-agents](https://github.com/duyet/claude-plugins/tree/master/team-agents) plugin for a coordinated agent team for parallel task execution with leader delegation to senior/junior. I keep the number of roles minimal, but you can add more for specific tasks. High-level architecture for you, try to parallelize work while maintaining quality on the complex parts.

![Team Agents](/media/2026/01/ai/cc_team_agent.png)


2026-03: [Agent Teams](https://code.claude.com/docs/en/agent-teams) just dropped - this is basically what I was trying to build with my [team-agents plugin](https://github.com/duyet/claude-plugins/tree/master/team-agents). Multiple Claude Code sessions that actually talk to each other, not just report back to a parent. Now it's built-in. Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`.

Haven't tried it much yet, but I think this will become the new standard for how AI agents work together.

Use cases I'm planning to try:
- **Parallel code review** - spawn reviewers for security, performance, and test coverage, each applying a different lens to the same PR
- **New features with clear boundaries** - each teammate owns a separate module without stepping on each other
- **Debugging** - spawn teammates with different theories, have them try to disprove each other

![Team Agents](/media/2026/01/ai/claude-agent-team.png)
