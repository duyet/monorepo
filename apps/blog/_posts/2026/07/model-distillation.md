---
title: Learn from smart models, repeat it on cheaper ones
date: 2026-07-02
author: Duyet
category: AI
series: AI Harness Engineering
tags:
  - AI
  - Agents
  - Claude Code
slug: /2026/07/model-distillation-skills
thumbnail: /media/2026/06/coding-agent/thumbnail.png
description: "A cheap trick for coding agents: let an expensive model (Opus, Fable) figure out the hard part once, save it as a skill, then run it on a smaller or open model like Sonnet, GLM, or Qwen."
---

This is how I keep the same quality across every model I use. When my Claude Max 20x plan runs out of tokens, when I switch between models or sessions, or even move to another coding agent like opencode or agy — the work should still stay on track and keep focus. A skill is what carries that focus over.

Big models are smart but expensive. Small and open models are cheap but need more hand-holding. The trick I keep coming back to: let the expensive model do the thinking **once**, write down what it learned as a skill, then let a cheaper model repeat it. You pay for the smart model one time. After that, a smaller model reads the skill and does the same job for much less.

It is a bit like distillation, but you are not training weights. You are just moving knowledge into plain text — a skill file the agent reads every time.

I already keep a knowledge base in `~/kb` for notes and facts I look up. But notes are not enough. `~/kb` tells the agent *what is true*; a skill tells it *how to do the job*. So next to `~/kb`, I keep a folder of local skills too — one per repeatable task — that any model can load and follow.

A skill is just a folder with a `SKILL.md` file: a name, a short line on when to use it, and clear steps ([best practices here](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)). The flow is simple. Give a real task to a strong model (Opus or Fable), let it explore and make mistakes until it finds the working path. When it's done, ask it to turn that path into a skill. Then switch to a cheaper or open model (Sonnet, GLM-4.7, Qwen) — it reads the skill and follows the steps instead of figuring everything out again. The smart model paid the learning tax; the small model just runs it.

So after a long session where the big model solved something, don't throw the chat away. Save the lesson:

```prompt
Based on this conversation, build a skill for <task>.
Keep the steps I actually did, the commands that worked, and the mistakes to avoid.
Write it in simple English so a smaller model can follow it.
```

Skills are not write-once. Every time a cheaper model gets something wrong, that is free feedback — feed it back in:

```prompt
Build and keep improving a skill for maintaining the catalog list.
When it makes a mistake, update the skill so it does not happen again.
Add the new rule to the steps and keep the file short.
```

This is the important part. A skill that gets patched after each mistake slowly becomes very good. The smart model fixes the skill, the cheap model runs the better version next time, and the gap between them keeps shrinking. 🗿

Smart models are for learning, skills are for remembering, cheap models are for repeating. Once you split the work that way, most of your daily coding can run on a small model — and still feel like the big one.
