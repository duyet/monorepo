---
title: Grok Bot
date: 2026-08-19
author: Duyet
category: AI
series: AI Harness Engineering
tags:
  - AI
  - Agents
  - Grok
slug: /2026/08/grok-bot
x: https://x.com/_duyet/status/2089665924454633766
description: "I am on SuperGrok Heavy because of Grok Bot and I am super impressed. Wow, from me, at first. The harness is surprisingly good. The UI/UX is surprisingly good."
---

I am on SuperGrok Heavy because of Grok Bot and I am super impressed. Wow, from me, at first. The harness is surprisingly good. The UI/UX is surprisingly good. Same feeling as when Claude Code launched.

This will change how we use coding agents. I think it changes software engineering forever.

## A year of trying to automate duyetbot

I have been trying to automate duyetbot for a year. First it was Claude Code on a cron, custom Claude Agent SDK -> then OpenClaw -> Hermes Agent. Grok Bot is the first one that looks like what I actually wanted.

The difference is the computer. Not a headless sandbox. The bot has a browser, persistent memory, a workspace you can watch.

## Design the team

duyetbot was the first one. I was not clear yet how it was working. Then a bunch of agents that talk to each other.

I assign each bot to one repo on purpose so the work stays isolated. Not a shared pile of agents on every repo. One delegated worker per project is the isolation, not just an org chart.

QA is one bot for test and validate. Recerts live after each ship, files only on fail. chmonitor, anyrouter, monorepo, oma each have their own worker. They keep working. I may add more roles later.

They share a computer, each with its own screen, and they message each other. I don't copy a stack trace from one window into another.

> Since the Grok bot has its own desktop computer, I am asking it to review the whole product, going page by page, using a smoke test account. It has found something then create a lot of github issues and will spawn Grok Build to fix them all. I think this kind of daily automation tries to make duyetbot act like a real customer, then report issues and have another bot fix and deploy them autonomously.
> https://x.com/_duyet/status/2089687655458259272

## Two days in

I stood the team up on [chmonitor](https://chmonitor.dev), [anyrouter.dev](https://anyrouter.dev), [news.duyet.net](https://news.duyet.net), and the rest of the duyet.net apps.

This morning chmonitor shipped a TTL inventory fix ([#3122](https://github.com/chmonitor/chmonitor/pull/3122)). The manager told QA to recert `dash.chmonitor.dev/ttl-partition-health`. QA came back PASS: 136 rows, charts fine, no silent Retry. The manager told chmonitor. I read the result.

They watch GitHub issues and PRs and squash-merge except release-please. Fixes go through Grok Build or a Cursor cloud agent. `chmonitor/chmonitor` does not have the Cursor GitHub app, so the engineer said so and switched to Grok Build. After each ship, QA recerts the live URL and files only on fail. They read [kb.duyet.net](https://kb.duyet.net) `MEMORY.md` first. Weekday routines: morning GitHub digest, inbox, hourly token import, late-afternoon production QA. I print a one-page A4 on the Mac. Tailscale + herdr so I can watch from anywhere. After an Update, Tailscale has to be reinstalled (the package does not survive; the files do).

I still leave the calls that are mine: don't add a host, don't start a feature I didn't ask for, leave release-please.

## This is the same series

I already wrote the two shapes this sits next to.

A single long goal, walk away, wake up to PRs: [Letting Claude Code work overnight, 2026](/2026/06/coding-agent-2026). The chmonitor Next → TanStack migrate was the expensive version of that.

> I migrated chmonitor.dev from Nextjs 15 to Tanstack Start in about 37 hours with a long Claude code session, ~ $728, 12 tickets, and 79 PRs created.
> https://x.com/_duyet/status/2070880670852005898

Many loops, a knowledge base, a stop sign: [Goal and Loop](/2026/06/goal-and-loop).

> You give your AI a prompt, the AI spits out an output. This is Generative AI. You give your AI a goal and a loop, and it keeps working until it meets that goal. This is Agentic AI.
> https://x.com/_duyet/status/2069746255333654869

The bigger loop outside one local session: [Agent Sandbox on Kubernetes](/2026/06/agent-sandbox-on-kubernetes).

> I run Claude inside agent sandboxes on a Kubernetes cluster to automatically fix errors and consume issue request tickets on the loop. Issues in, PRs out.
> https://x.com/_duyet/status/2070201703241281789

Grok Bot is the Goal-and-Loop shape, hosted. I would not use it to rewrite a monorepo at 1am. I am using it to keep four live sites honest during the day.

[AnyRouter](/2026/07/anyrouter) is one of the products in the fleet.

> I am building AnyRouter to solve my problem of collecting free LLM tokens from everywhere and unifying the MCP Gateway. Yes, it’s another router, but this is a router of routers.
> https://x.com/_duyet/status/2078848270064066623

## What held, and what didn't

They talk too much. The first day was a pile of acks I did not need.

Usage is real. People are burning most of a weekly window in a couple of days.

One computer is not one brain. If the manager does not write the handoff — URL, expected columns, do not add a host — QA will test the wrong thing.

I still have leftovers the team correctly left alone: Advisor ON CLUSTER DDL, a Postgres host I never added, an OS deploy waiting on env.

I will write again when a week of weekday routines has either held or gone quiet.
