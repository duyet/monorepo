---
title: Coding Agents
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
 - AI
slug: /2026/01/coding-agent
thumbnail: /media/2026/01/ai/ai-banner.png
description: Reflect on what I'm thinking and doing in this LLM era
featured: true
parts:
  - claude-code
  - claude-code-setup
  - parallel-sub-agents
  - duyet-claude-plugins
  - plan-mode
  - claude-design
  - claude-md-agents-md
  - interview-mode
  - long-running-agent
  - z-claude-mi-claude-or-claude
  - opencode
changelog:
  - date: "2026-07"
    note: "Add CodeRabbit"
  - date: "2026-06"
    note: "Split into a chaptered overview — each topic is now its own page. Refreshed Top on my list (Opus 4.8, GLM 5.1, AnyRouter). Added Open Design alternative, opencode and the OpenClaw note on long-running autonomous agents."
  - date: "2026-03"
    note: "Parallel Sub-Agents / Teams with the native Agent Teams note, and the Ralph Loop + cron scheduling sections."
  - date: "2026-02"
    note: "opencode and the OpenClaw note on long-running autonomous agents."
  - date: "2026-01"
    note: "Claude Code setup, plugins, Plan Mode, CLAUDE.md, GitHub Actions, provider wrappers (z_claude, ar_claude, etc)."
---

My last post was more than 14 months ago. Right around the time when the LLM hype exploded, AI workflows, AI agents, ... I stayed silent for a while busy watching everyone blowing mind about how LLMs could solve LeetCode problems to 80% hard problem, or how RAG could change how traditional chatbots work. People with ML backgrounds didn't quite accept that AI building is now just OpenAI API integration - something any developer can do. The beauty of data science used to lie in playing with data, feature engineering, model tuning, etc. 

But then so many new AI applications became useful. New techniques, new "tasks" emerged around it. Prompt engineering, token optimization, creating MCPs for existing apps, tool calling, etc. The models just got so much better - we gave them tools to push their capacity beyond pure reasoning. 
People used to complain about LLMs hallucinating on outdated data.
Now LLMs without web search or reasoning or MCPs are just ... weird.
Grok is about can giving you real-time answers with up to information what just happened,
Claude will try to run Python code to give you a complex math solution as possible.

You and I can't ignore that anymore. I started building from small stuff, creating UDF calling OpenAI to process a pandas dataset, building an MCP on top of ClickHouse, started using AI agents and building things more seriously. There are thousands of models out there now, from large to small, closed to open weight. The coding agents now really good I could say. I built LLM workflows, played with [MCP](https://modelcontextprotocol.io/), deployed vector database, RAG, etc.

Coding agents control the terminal. I'm not writing code or even reading it - I'm watching them work instead. I test their results, tell them what I expect tests to look like to keep them focused, and build skills to teach them specific tasks. This is the new normal, I guess.


I've tried over a hundred models and tools in the past year: [GitHub Copilot](https://github.com/features/copilot) from the early days, [Tabnine](https://www.tabnine.com/), [v0.dev](https://v0.dev), [Codex](https://openai.com/codex/), [Claude Code](https://code.claude.com), [Cursor](https://cursor.com/), [Windsurf](https://codeium.com/windsurf), [opencode](https://github.com/sst/opencode), n8n + AI Agent node, code review tools like [CodeRabbit](https://coderabbit.ai/), [Greptile](https://greptile.com/), [Sourcery](https://sourcery.ai/), etc. dozens of models from gpt-4o, Claude, Gemini, Grok, Mistral, DeepSeek, Qwen, MiniMax, GLM, etc.
Both free and paid. I can't tell you which one is "the best" because they'll be legacy by next week. When choosing a framework for AI applications, there are tons of options: [LangChain](https://www.langchain.com/), [LangGraph](https://www.langchain.com/langgraph), [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk), then [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk) came along and was better, [Cloudflare Agents](https://agents.cloudflare.com/), [Vercel AI SDK](https://ai-sdk.dev/). The competition never ends. Maybe 90% of AI projects are just wrapping LLM APIs - most don't ship anything real. A few stand out, some become worth millions and turn into the next big thing, but most of them are just demos or POCs. I have no idea.

While people are still scared of vibe coding, I ship it to production. For me, AI agents are no longer just tools for learning or asking questions about your codebase - they're fully capable of producing production-grade code if you plug them into the right tools and give them good instructions. My top language on [WakaTime](https://wakatime.com/) is now `markdown`, damn. Things change fast. Your model gets stuck today, but tomorrow someone releases something better. You have an idea, someone builds a product around it, and it gets killed or goes legacy some random morning.

![Claude Cowork](/media/2026/01/ai/claude_cowork_killed_startup.png)

I didn't stop writing, tons of drafts in my [obsidian](https://obsidian.md/), none published because they became outdated before I could finish them. I want to kick off this first 2026 post as my [digital garden](https://joelhooks.com/digital-garden/) - a place to reflect on what I'm thinking and doing in this LLM era. This post will be updated from time to time.

<div class="not-prose my-8 rounded-2xl border border-border dark:border-white/10 p-6 sm:p-8">
  <p class="text-[0.7rem] uppercase tracking-[0.2em] font-mono text-terracotta">Updated Jun 2026</p>
  <p class="text-2xl font-serif text-foreground mt-2">Top on my list</p>
  <div class="mt-5 border-t border-border dark:border-white/10 divide-y divide-border dark:divide-white/10">
    <div class="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-4 py-3.5">
      <span class="text-xs uppercase tracking-wide font-mono text-terracotta">Coding Agent</span>
      <span class="text-foreground"><a href="/2026/01/coding-agent/claude-code" class="underline underline-offset-2">Claude Code</a>, <a href="/2026/01/coding-agent/opencode" class="underline underline-offset-2">opencode</a></span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-4 py-3.5">
      <span class="text-xs uppercase tracking-wide font-mono text-terracotta">Code Review</span>
      <span class="text-foreground">
        <a href="https://www.coderabbit.ai/" class="underline underline-offset-2">CodeRabbit</a>
      </span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-4 py-3.5">
      <span class="text-xs uppercase tracking-wide font-mono text-terracotta">Model</span>
      <span class="text-foreground"><a href="/2026/01/coding-agent/z-claude-mi-claude-or-claude" class="underline underline-offset-2">Fable 5</a>, <a href="/2026/01/coding-agent/z-claude-mi-claude-or-claude" class="underline underline-offset-2">Opus 4.8</a>, <a href="/2026/01/coding-agent/z-claude-mi-claude-or-claude" class="underline underline-offset-2">GLM 5.1</a></span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-4 py-3.5">
      <span class="text-xs uppercase tracking-wide font-mono text-terracotta">Provider</span>
      <span class="text-foreground"><a href="/2026/01/coding-agent/long-running-agent" class="underline underline-offset-2">OpenRouter</a>, <a href="https://anyrouter.dev" class="underline underline-offset-2">AnyRouter</a>, Cloudflare AI Gateway</span>
    </div>
  </div>
</div>

This is a living overview — each topic below is its own page, kept up to date independently.
