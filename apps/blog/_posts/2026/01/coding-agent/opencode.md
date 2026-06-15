---
title: opencode
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/opencode
parent: /2026/01/coding-agent
description: A coding agent with nice UI/UX that consolidates all your subscriptions
---

If you want to try a good coding agent with nice UI/UX - [opencode](https://github.com/sst/opencode) is really solid right now. Fast, simple, and it reads all your Claude config and plugins out of the box.
It can consolidate all your subscriptions: ~Claude Code~, xAI, Z.AI, 
[GitHub Copilot](https://x.com/github/status/2011822451613712646), Codex, OpenRouter, ...  seamlessly switch between all of the models + plus some free [Zen](https://opencode.ai/docs/zen/) models from their own provider.

![opencode](/media/2026/01/ai/opencode.png)

You can save and share sessions - handy when you want to show someone how you solved something. They also have a native web UI now.

I suggest trying [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - it adds some powerful workflows on top of opencode:

- **Sisyphus agent** - an orchestrator (Opus 4.6) that "keeps the boulder rolling" through autonomous task completion. It uses subagents, background parallel execution, and won't stop until tasks are actually finished
- **Multi-model orchestration** - coordinates GPT-5.2, Gemini, and Claude by specialized purpose
- **Background parallelization** - runs exploration and research tasks async while main work continues
- **Magic word `ultrawork`** - add this to your prompt and it activates maximum orchestration: parallel agents, background tasks, deep exploration, relentless execution

![opencode](/media/2026/01/ai/opencode_2.png)

Vibe from anywhere: opencode can also run [headless](https://opencode.ai/docs/server/) on a remote machine (VM/CI runner/container) and your local CLI connects as a client. Handy for offloading heavy workloads to a beefy VM while you work from a laptop. 


```bash
opencode serve
```

![opencode](/media/2026/01/ai/opencode_serve.png)
