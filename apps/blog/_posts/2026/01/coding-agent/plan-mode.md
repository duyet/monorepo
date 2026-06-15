---
title: Plan Mode
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/plan-mode
parent: /2026/01/coding-agent
description: Plan mode performs significantly better than just prompting directly
---

![Plan Mode](/media/2026/01/ai/cc_plan.png)

Plan mode performs significantly better than just prompting directly. When you give Claude time to think and plan first, the results are way more accurate. Less back-and-forth, fewer mistakes.

<div class="not-prose my-8 space-y-6">
  <div class="flex gap-3">
    <span class="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border dark:border-white/10 text-sm font-medium text-foreground/70">1</span>
    <div class="flex-1">
      <p class="font-semibold text-foreground mb-2">Plan</p>
      <p class="text-foreground/70 mb-3">Hit <code>shift+tab</code> twice to enter Plan mode. I do this for most tasks and start a new session for each one. Claude writes a plan file for you to review - keep adjusting until you're happy with it.</p>
      <p class="text-foreground/70 mb-3">Once the plan is solid, Claude usually finishes the whole thing in one shot without asking questions.</p>
      <p class="text-foreground/70">You can also use <code>/batch &lt;instruction&gt;</code> to enter plan mode — it researches the codebase, decomposes the work into 5–30 independent units, and presents a plan for approval. Once approved, it spawns one background agent per unit, each in an isolated git worktree. Each agent implements its unit, runs tests, and opens a pull request. Example: <code>/batch migrate src/ from Solid to React</code>.</p>
    </div>
  </div>
  <div class="flex gap-3">
    <span class="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border dark:border-white/10 text-sm font-medium text-foreground/70">2</span>
    <div class="flex-1">
      <p class="font-semibold text-foreground mb-2">Implement</p>
      <p class="text-foreground/70 mb-3">With a good plan, I usually don't do much here - just let it run. You can open another Claude Code session to work on something else while waiting.</p>
      <p class="text-foreground/70 mb-3">If things go off track, inject a prompt mid-way. Claude will catch up and keep going.</p>
      <p class="text-foreground/70">You can kick off background agents for specific tasks (research, small changes, refactoring) while working.</p>
    </div>
  </div>
  <div class="flex gap-3">
    <span class="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border dark:border-white/10 text-sm font-medium text-foreground/70">3</span>
    <div class="flex-1">
      <p class="font-semibold text-foreground mb-2">Review</p>
      <p class="text-foreground/70 mb-3">The <strong>Explanatory</strong> output style shows you why Claude made certain choices - useful for learning.</p>
      <p class="text-foreground/70 mb-3">I use <code>/simplify</code> for review — it reviews your recently changed files for code reuse, quality, and efficiency issues, then fixes them. It spawns three review agents in parallel (code reuse, code quality, efficiency), aggregates their findings, and applies fixes. Pass optional text to focus on specific concerns: <code>/simplify focus on memory efficiency</code>. I also use <code>@refactor</code> or <code>@testing</code> for specific checks.</p>
      <p class="text-foreground/70"><a href="https://code.claude.com/docs/en/hooks-guide">Claude Hooks</a> save time here - auto-format, run linters, or custom verification.</p>
    </div>
  </div>
</div>
