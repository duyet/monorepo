---
title: z_claude, mi_claude & or_claude
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/z-claude-mi-claude-or-claude
parent: /2026/01/coding-agent
description: Wrapper scripts to use Claude Code with alternative providers
---

The good thing about Claude Code is that you can use it with alternative providers that offer the same Anthropic API interface. I've created some wrapper scripts for this:

- [z_claude](https://gist.github.com/duyet/ad5971afe423cf992f519aa8a2ea10d5) - Uses Z.AI's GLM 4.7 model, which works great. Unbelievably cheap (starts at $3/mo). I use this a lot to burn their tokens instead of my Claude MAX subscription.
- [mi_claude](https://gist.github.com/duyet/7f03bbcf392ca67c6d41bd221d4ab8fd) - Uses Xiaomi Mimo API.
- [or_claude](https://gist.github.com/duyet/d9a9f9b6daa5b3ae4b9343e08743540d) - Uses [OpenRouter](https://openrouter.ai/docs/guides/claude-code-integration) models. Plenty of good free models available, though with rate limits.

You can start working with `claude` using Opus, then exit and continue the same session with `z_claude --continue`. Use `mi_claude` or `or_claude` the same way.

![z_claude](/media/2026/01/ai/z_claude.png)
