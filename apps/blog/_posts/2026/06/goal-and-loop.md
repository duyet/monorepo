---
title: Goal and Loop
date: 2026-06-20
author: Duyet
category: AI
series: AI Harness Engineering
tags:
  - AI
  - Agents
  - Claude Code
slug: /2026/06/goal-and-loop
thumbnail: /media/2026/06/goal-and-loop/contributions.svg
description: "You've probably heard of the agent loop by now. This is just a quick note on how I actually use it day to day — a `goal` and a `loop` — to get a lot more shipped."

---

You've probably heard of the agent loop by now. This is just a quick note on how I actually use it day to day — a `goal` and a `loop` — to get a lot more shipped.

- You give your AI a prompt, the AI spits out an output. This is **Generative AI**.
- You give your AI a goal and a loop, and it keeps working until it meets that goal, learns from it, proactively proposes next steps. This is **Agentic AI**.

When I start something new, I brainstorm or let the agent interview me first: what language, what framework, where it deploys, what I care about. It can already see my [kb.duyet.net](https://kb.duyet.net), so it knows my taste and rarely comes back with something I'd never have picked. Then it builds.

The plan mode is still very useful but I also stopped giving instructions and started giving goals.

`Edit this file, add this test function` is an instruction. `Ship the refactor in small PRs, deploy each one, don't break master` is a goal. The first keeps me in the loop. The second lets me leave it — I write the goal, kick off a loop, and walk off. I'm not driving or reading code anymore. I decide what *done* means and check the result.

## A goal and a loop

Two parts: a goal the agent reads, and a loop that keeps going until the goal is met.

The goal lives in a file — the target, the rules it can't break, an explicit *done when*, and a findings section it writes to on every pass:

```prompt
# Goal — ship the refactor, small PRs, deploy each one
# Rules — one concern per PR; never leave master red
# Done when — feature works, a screenshot matches, tests green
# Findings — <the loop appends status + next steps here>
```

*Done when* is the stop sign, so it finishes instead of polishing forever. *Findings* is the memory — context gets compacted, sessions die, so the next pass reads the file to see where it left off. The state lives on disk, not in the chat.

## The knowledge base

A run also keeps a knowledge base it reads before work and updates after ([kb.duyet.net](https://kb.duyet.net)), and folds its working memory into short-term and long-term memory between sessions — so the next run wakes up already knowing the place, even when you start a new session.

There are two levels. The agent reads them before a task and adds to them on its own when it learns something — or when I tell it to remember:
- Global `~/kb`: things that hold across every project.
- Project `~/project/<project>/docs/kb`: what's true for that one repo.

![The docs/kb "engineering brain": one rule per file, kebab-cased so ripgrep finds it, with the retrieval paths an agent follows to land on the right note](/media/2026/06/goal-and-loop/knowledge-base.png)

You can ask Claude Code to create one from the codebase for you, start taking notes and keep it updated on its own:

```prompt
Set up a docs/kb/ knowledge base for this project: a durable, git-tracked "brain" that agents and engineers read before non-trivial work and write to after solving something non-trivial.

Principle: one rule per file, named so ripgrep finds it (kebab-case the rule into the filename), with the rule stated in the first line. Only write a note when something actually bit you — a real bug, outage, surprising behavior, or hard decision — and explain why it bit you so nobody repeats it. Don't document what the code or README already says.

Group notes into a few folders by concern (e.g. architecture, development, operations), each with an index file listing its notes. Cross-link related notes.

To seed it: dig through git log for fixes/reverts/regressions and through long "why is this weird" code comments, and turn the real ones into notes. Then list the candidates you found but didn't write up.

Goal: a stranger greps a keyword, lands on one note, and knows exactly what to do.
```

Reference to my own setup here: [https://github.com/duyet/kb](https://github.com/duyet/kb?ref=blog.duyet.net)

## Plan for product vision, then loop

No need to write the goals by hand either. With a new idea I'd rather just talk it out with the agent first — the vision, the core values, who it's for — and let it turn that into goals for each feature. You can talk the product vision through with [Cowork as the planner](/2026/01/coding-agent/cowork-planner/) - yes cowork is much better these days, and ask it to write everything down as a plan tree under `docs/` and keep maintaining it:

```
docs/
├── vision.md            # the north star
├── status.md            # one board for everything
└── plans/
    └── <feature>/
        ├── prd.md       # what & why
        └── plan.md      # sequenced steps
```

The vision becomes goals, the goals become the loop.

This is the more yolo way to work. You set the vision and the values and let it do whatever it wants until the result lines up with them. Cowork figures out *what*, the loop figures out *how*, and I just keep asking one question: does this match what I said I wanted?

Here's what comes back: a plan plus a handful of copy-paste prompts, written to a playbook file, sequenced, with the guardrails called out — ready to hand straight to Claude Code.

![Cowork chat handing back an overnight kickoff plan — operating protocol, deploy-safety rules, a visual timeline, the product thesis — straight into the editor](/media/2026/06/goal-and-loop/cowork-vision-chat.png)

## Docs-driven Development

The sharpest version is to write the docs before the product. I get the agent to describe what the finished thing *looks like* first — the customer-facing docs, every feature from the user's side, the API params and the responses you'd expect back. For example, I am actually writing https://docs.chmonitor.dev before the feature exists.

Now the docs are the goal, and the prompt is just a pointer at the doc:

```prompt
/goal Implement, test, and verify @docs/business/features until it is finished. Keep updating the progress in @docs/business/status.md.
```

The agent loops until the product matches the docs it wrote — API endpoints must return what the docs say, features must behave the way they're described. If the docs promise a response the code doesn't return, that's just a failing check, and it keeps going until the gap closes. Writing the spec as docs is the cleanest *done when* I've found: it reads well, it's the same thing the user sees, and you can check it line by line.

![A /goal run against docs/business/: "Implement, test, and verify /business/features until it is finished", with the docs tree it works through on the right](/media/2026/06/goal-and-loop/docs-driven-goal.png)

## Make coding agent verify itself

This is the bit people skip, and it's the bit that makes walking away safe. Every pass has to end on a real check the agent runs itself — a test, a type check, a screenshot, an API call. Don't tell it *how*; tell it what done looks like and make it prove done before it comes back. It checks its own work first and then only looks at the final result.

```prompt
/goal use chrome to test and spot 20+ issues on the playground. Fix, deploy, and test non-stop until you can fix the race condition
of sending two messages at the same time. [...]
```

```prompt
/goal create a smoke test script for testing the routing API against 100 upstream providers.
Fix, deploy, and test in a loop until all succeed.
```


## Let agent file its own issues to auto fix later

```prompt
# CLAUDE.md

While you work, don't fix everything inline. When you hit tech debt, a TODO, or an out-of-scope improvement, open a GitHub issue for it: title, what's wrong, where, and how you'd fix it. Label it (bug / tech-debt / ci) and assign @duyetbot. Then keep going.
```

While it works, the loop keeps finding things it shouldn't fix right now — tech debt, a TODO, a small improvement. Instead of dropping them, it writes each one up as a GitHub issue with enough detail to pick up later.

I wired Claude into GitHub Actions for this, with the same prompts, skills, and `docs/kb` context the loop already uses, so it always knows the project. It triages each issue on its own: opens a PR for the easy ones, comments or closes the ones that don't belong, and splits a big one into smaller issues when it's too much for a single pass. The self-improving loop feeds itself from here.

![Eleven issues the loop filed itself — failing playground tests, a single-homed embeddings endpoint, a dead upstream — selected and assigned to duyetbot to pick up](/media/2026/06/goal-and-loop/triage-issues.png)

The [agent-loop](https://github.com/duyet/codex-claude-plugins/tree/master/agent-loop) plugin is built to manage all of this if you maintain a repo with a lot of PRs to review and merge — continuous overnight/day repository maintenance with autonomous agent loops:

Wake every 5m ──► Triage repos ──► Dispatch threads ──► Track & land

```prompt
/agent-loop:start
```

## Let main agent control its member

The main session does more than execute — it coordinates. I run the main session (Opus) as the orchestrator, and it assigns work to child agents based on complexity, then rewrites my rough instructions into proper specs before handing them down. It has all the context — the codebase, the conventions, the current state — so the child gets a full brief, not my shorthand.

I say something vague:

```prompt
Send the message to the one who implements billing: keep the number of subscriptions dynamic, not hard-coded. I will add more later.
```

Opus captures the intent, adds the context it already knows — the right files, the existing patterns, the constraints — and sends the child member a spec with enough detail to actually work without asking back.

The main stays in the coordinator role: it knows the full picture, decides who handles what, and makes sure each handoff lands cleanly.

![Opus translating a vague billing instruction into a full technical spec — dynamic PLAN_CONFIG, Polar product ID linkage — ready for the child agent to implement](/media/2026/06/goal-and-loop/main-agent-control-member.png)

## Working across a pile of projects

The same agent-loop works when you have many projects, not just one. I start a single session in the folder that holds every repo:

```bash
cd ~/project
claude "/agent-loop:start"
```

It takes the pile from there. One state file tracks where each project's loop.

I didn't come up with this part. Waking every few minutes, holding a list of repos, handing work to parallel threads — that's Peter Steinberger's maintainer-orchestrator pattern, which the [agent-loop](https://github.com/duyet/codex-claude-plugins/tree/master/agent-loop) plugin is built on. He keeps a large set of projects shipping releases almost daily off it.

On a busy night hundreds of these runs go at once. A year ago I'd not have read every diff anymore. I read the changelog and the short note each run leaves — what it changed, what it checked, what it left for me — and only dig in when a note says to.

![Auto-generated release notes for chmonitor v0.2.9: 51 commits across 43 PRs in 3 days, 44 daytime and 7 night-time commits, 3 contributors, 222 review comments, 6 AI agents involved, with feature and fix highlights](/media/2026/06/goal-and-loop/release-v0.2.9.png)

A release note like this one writes itself at the end of a run — features, fixes, a recap of how it got there. That's how I keep up with the work now: the summary, not the commits.

The goal also works when you're developing one project that needs to integrate with another one or more. You write a goal that targets the second project while making it fix the first one until integration succeeds — autonomous, self-improving:

```prompt
/goal Integrate this eve agent ~/project/eve with anyrouter (~/project/anyrouter) for LLM routing (docs: https://anyrouter.dev/docs.md). If you hit any issues in upstream anyrouter, file an issue, fix it, and redeploy anyrouter until the integration succeeds.
```

## These prompts might be useful for you

A good goal is short: what to do, what to do when it fails, and when to stop.

**The one I run most nightly**
```prompt
/goal test realistic scenarios. When one fails, document it, add regression and benchmark coverage, fix it, and restart the streak.
Stop after 1000 successful cases in a row.
```

Since it already knows the internal docs and how the thing works, it writes the scenarios itself — every input combination, the edge cases, the weird states — and becomes its own tester. It turns up a surprising number of real bugs and small wins, fixes them, adds a regression test so they stay fixed, and only stops after a thousand clean runs in a row. Leave it overnight and it just keeps making the thing sturdier.

**The one I run most mornings**

```prompt
/goal triage the open issues. For each: reproduce, fix, add a regression test,
open a small PR, auto-merge when CI is green. Stop when the queue is empty.
```

```prompt
/goal make this project better 1%
```

**Migrate a codebase without a big-bang PR:**

```prompt
/goal migrate from nextjs to TanStack Start. One module per PR, tests stay green, deploy each PR.
Done when every module is moved and prod smoke passes.
```

All these I've shared at [anyrouter.dev/duyet](https://anyrouter.dev/duyet), take whatever's useful for you.
