---
title: Claude Design
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/claude-design
parent: /2026/01/coding-agent
description: Claude Design reads your codebase and builds a design system from your colors and typography
---

I wasn't paying attention to this one at first. Then I tried [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) (Anthropic Labs) and realized it comes up with genuinely good design - not the usual generic AI look. It reads your codebase during onboarding, builds a design system from your colors, typography, and components, then every prototype after that just uses them.

![Claude Design](/media/2026/01/ai/claude_design_1.png)

This makes frontend work so much more accurate and beautiful. You describe what you want in plain language, tweak inline - comments, live spacing/color knobs - and it produces a complete, self-contained artifact. The dashboards below took a few prompts each.

![Claude Design](/media/2026/01/ai/claude_design_2.png)

The best part: when a design is ready, Claude packages it into a handoff bundle you pass to Claude Code with a single instruction. The hand-off is seamless - Claude Code reads the bundle and builds the real thing from it. Design → code with almost no translation loss.

One thing if you don't want to get locked into a vendor cloud: [Open Design](https://github.com/nexu-io/open-design) is the local-first, open-source alternative (BYOK, Apache-2.0). It drives your *local* CLI instead - opencode, Claude Code, Gemini CLI, Codex, Qwen - so generated artifacts land in your project directory, not someone's cloud. It's still a bit behind Claude Design, but somehow already very good.
