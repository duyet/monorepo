---
title: Long-running and self-improving coding agent
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/long-running-agent
parent: /2026/01/coding-agent
description: Build a long-running autonomous coding agent that runs 24/7
---

Long-running autonomous coding agents - this is something I've always wanted to achieve. From the beginning, I put them inside an interval bash script loop. Now I have a better version using Claude Agent SDK in TypeScript called *duyetbot-agent* (need a better name!) that runs 24/7, written by Claude Code, but you can plan to build something similar with some ideas:

```text
Build a long-running autonomous coding agent using Claude Agent SDK 
that continuously processes tasks, creates PRs, and manages its own backlog.

Core components:

- Orchestrator: Main loop managing session lifecycle, scheduler, monitoring, analytics dashboard
- Sub-Agents: Planner Agent, Coder Agent, Reviewer Agent, PR Manager
- Tools: Git worktree management, GitHub MCP, memory persistence (Supermemory)
- Stop Hooks: Graceful exit with state preservation
- Skills: Reusable workflow templates
- Configuration: Flexible YAML-based settings
- Quality Gates: Automated checks before PR creation
...
```

I was thinking of publishing it for general use, but it still needs a lot of work to be generic enough. (2026-01-25: Yes someone did it, check out [OpenClaw](https://clawd.bot) (~~Clawdbot~~ → ~~BoltBot~~ → OpenClaw, they changed the name a few times) - a personal agent and I am really impressed, you might try it out). Don't expect too much from me though, some big name will probably do it first. I believe this is a milestone the industry has always wanted to reach before we get to AGI.

[Claude Code + Ralph Loop](#claude-code-ralph-loop) is the easiest way to try this, it uses StopHook to extend your session and keep working for hours or days to complete your task. See Boris's explanation:

> Claude consistently runs for minutes, hours, and days at a time (using Stop hooks)
> https://x.com/simonw/status/2004916070973645242

I've also put my agent source code folder under its loop, to build a self-improving coding agent. I want to see how possible it is to have an agent that codes itself. It's not as good as expected with many issues, but it's still something I want to achieve

- bad execution loop and bad plan will generate broken agent and stops infinite loops
- reflection mechanism, need to extract the failure, error pattern, root cause to enhance the codebase itself
- better context engineering and long-term memory improvement
- code safety, detect potentially dangerous operations, monitoring and rollback, etc

Some solutions out there you can try:
[Continuous Claude](https://github.com/AnandChowdhary/continuous-claude), 
[Continuous-Claude-v3](https://github.com/parcadei/Continuous-Claude-v3)

Good reads:

- [Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents)
- [Anthropic CEO on Claude, AGI & the Future of AI & Humanity | Lex Fridman Podcast #452](https://lexfridman.com/dario-amodei-transcript)
- [2025 LLM Year in Review - Andrej Karpathy](https://karpathy.bearblog.dev/year-in-review-2025/)

Next: [Claws](/2026/02/claws.html)

## Claude Code + Ralph Loop

The [ralph-wiggum plugin](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum) is my favorite for long-running tasks or vibe coding on fun projects while I'm asleep. You define a goal condition and let the agent loop until it verifiably reaches that goal. With cheap Z.AI GLM 4.7 tokens, I can let it run 24/7. Run it with `--permission-mode=dontAsk` or `--dangerously-skip-permissions`.

```text
/plugin install ralph-wiggum@claude-plugins-official
```

```text
/ralph-wiggum:ralph-loop "Implement feature X following TDD:
1. Write failing tests
2. Implement feature
3. Run tests
4. If any fail, debug and fix
5. Refactor if needed
6. Repeat until all green
7. Output: <promise>COMPLETE</promise>" --completion-promise "COMPLETE"
```

### Claude cron scheduling tools

Claude Code now has native [scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks) built in — this can replace the loop or Ralph Loop for many use cases, and I find it works much better. The `/loop` command lets you schedule recurring prompts that fire in the background while you keep working.

Tasks are session-scoped: they live in the current Claude Code process and are gone when you exit. For durable scheduling that survives restarts, use GitHub Actions (see below) or Desktop scheduled tasks.

```text
/loop 5m check if the deployment finished and tell me what happened
```

```text
/loop babysit all my PRs, fix issues based on code review comments, merge when they look good enough, every hour
```

You can also loop over other commands or skills:

```text
/loop 20m /review-pr 1234
```

Ask Claude in natural language to list or cancel tasks, or reference the underlying tools directly:

```text
what scheduled tasks do I have?
```

```text
cancel the deploy check job
```

Under the hood, Claude uses `CronCreate`, `CronList`, and `CronDelete` tools. Each task has an 8-character ID, and a session can hold up to 50 scheduled tasks. Recurring tasks auto-expire after 3 days. Set `CLAUDE_CODE_DISABLE_CRON=1` to disable the scheduler entirely.

### Paperclip

If [OpenClaw](https://openclaw.ai) is the employee, [Paperclip](https://paperclip.dev) is the company. For zero-human companies, Paperclip lets you spin up an entire org where every role - CEO, staff engineers, reviewers - is a Claude Code instance, from the smartest model down to the cheapest. I'm using it now to run Duet Company: one Opus agent as the CEO, a squad of cheap GLM 4.7 workers burning through tickets, and whatever free model is available as the reviewer - Gemma 4, Qwen 3.6. I defined the org chart, set some goals and cronjobs, and it just starts going - assigning tasks, breaking them down, discovering more work on its own. It's wild.

It looks like a real enterprise now - the agents keep reassigning tickets back and forth to each other all day. I accidentally built corporate bureaucracy in AI form. At least they don't schedule unnecessary meetings... yet.

<p class="not-prose my-4"><a href="https://github.com/user-attachments/assets/773bdfb2-6d1e-4e30-8c5f-3487d5b70c8f" target="_blank" rel="noopener noreferrer">Watch the Duet Company demo video</a></p>

### Claude Code (+ OpenRouter) on GitHub Actions

![Claude Github Action](/media/2026/01/ai/claude_github_action.jpg)

Something else you can try for maximize automation that [Claude Code Action](https://github.com/anthropics/claude-code-action) which is Claude Agent SDK that running on Github Actions.
The best part is I'm running Claude GitHub Actions with OpenRouter at no cost by using free models. I have an OpenRouter preset that can switch between SOTA free models automatically.

```yaml
- name: Run Claude Code Review
  id: review
  uses: anthropics/claude-code-action@v1
  env:
    ANTHROPIC_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
    ANTHROPIC_BASE_URL: https://openrouter.ai/api
    ANTHROPIC_DEFAULT_HAIKU_MODEL: xiaomi/mimo-v2-flash:free
    ANTHROPIC_DEFAULT_SONNET_MODEL: xiaomi/mimo-v2-flash:free
    ANTHROPIC_DEFAULT_OPUS_MODEL: xiaomi/mimo-v2-flash:free
  with:
    anthropic_api_key: ${{ secrets.OPENROUTER_API_KEY }}
    additional_permissions: |
      actions: read
    claude_args: |
      --allowed-tools Bash Edit Glob Grep Read Write
      --mcp-config .github/mcp-config.json
    plugins: |
      ralph-wiggum@claude-plugins-official
```


I put together some reusable workflows at [duyet/github-actions](https://github.com/duyet/github-actions) that other repos can reuse:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    uses: duyet/github-actions/.github/workflows/claude-code-review.yml@main
    permissions:
      contents: read
      pull-requests: write
      issues: read
      id-token: write
    secrets:
      api_key: ${{ secrets.OPENROUTER_API_KEY }}
      bot_github_token: ${{ secrets.DUYETBOT_GITHUB_TOKEN }}
```

Check out the official documentation: [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions).
Some use cases:

- **Code Review** - Automated PR reviews with AI feedback
- **Nightly Codebase Analysis** - A scheduled workflow that scans the codebase every night, finds things to improve or refactor, creates an issue, and assigns it to @claude to fix via PR
- Triggering cross-repo workflows (e.g. SDK change -> updates docs). 


This way you can have Claude Code + OpenRouter free or cheap models running 24/7 for you. A lot of automation becomes possible: smart cronjobs, automated refactoring, documentation sync, etc. The AI does the boring stuff while you sleep.

<div class="img-row">
<img src="/media/2026/01/ai/github_actions.png" alt="Github Actions + OpenRouter" />
<img src="/media/2026/01/ai/github_actions_2.png" alt="Github Actions + OpenRouter" />
</div>
