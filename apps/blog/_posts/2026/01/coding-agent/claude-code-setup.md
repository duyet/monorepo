---
title: Claude Code Setup
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/claude-code-setup
parent: /2026/01/coding-agent
description: How I configure Claude Code - auto-compact, permissions, MCPs, and skills
---

![Claude Code Setup](/media/2026/01/ai/cc_setup.png)

I prefer disabling Auto-compact - it's slow, wastes 45.0k tokens (22.5%) for the buffer, and usually loses context. I use sub-agents when possible since they have their own context. Otherwise I run `/export` to the clipboard, then `/clear` and paste the previous content back. The export won't include thinking tokens or tool calls, so you save a lot and the model still tracks well. 

I always work with `--dangerously-skip-permissions` - it's not as dangerous as you'd think.

```bash
claude --dangerously-skip-permissions --chrome
```

My default list of MCPs are: [context7](https://github.com/upstash/context7#installation), [sequential-thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking), and [zread](https://zread.ai/mcp). It depends on the project I'm working on.

Skills I'm currently working on: [supabase/agent-skills](https://github.com/supabase/agent-skills), [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), [`code-simplifier`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier) for refactoring and simplifying complex code while preserving functionality, and [`frontend-design`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design) for generating distinctive, production-grade frontend interfaces that avoid generic AI aesthetics (see the [Frontend Aesthetics Cookbook](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb) for prompting tips).

```bash
bunx skills add supabase/agent-skills
bunx skills add vercel-labs/agent-skills
npx skills add https://github.com/anthropics/claude-plugins-official --skill code-simplifier
npx skills add https://github.com/anthropics/claude-plugins-official --skill frontend-design
```

### History

- Mid 2025: [SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) - a collection of commands, agents, and behaviors installed in your `.claude` folder. Claude Plugins is more convenient now.
- Early 2025: [Zen MCP](https://github.com/BeehiveInnovations/pal-mcp-server) was a game changer at the time - it let you invoke other providers like Gemini for brainstorming.
