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
description: "I was on SuperGrok Heavy because of Grok Bot. First impression: the harness and the UI are surprisingly good. Same feeling as when Claude Code launched."
---

I was on SuperGrok Heavy because of Grok Bot.

My first impression was just: wow. The harness is surprisingly good. The UI/UX is surprisingly good. Same feeling as when Claude Code launched.

This changes how I use coding agents. I think it changes it for software engineers too.

## A year of trying to automate duyetbot

I have been trying to automate duyetbot for a year. First it was Claude Code on a cron. Then OpenClaw. Then Hermes. Grok Bot is the first one that looks like what I actually wanted.

The difference is the computer. Not a headless sandbox. The bot has a browser, persistent memory, a workspace you can watch. That UI/UX is the part that clicked.

I already started posting the first-run notes yesterday. Comment on this post [there](https://x.com/_duyet/status/2089665924454633766).

> Wait, I can install @Tailscale and @herdrdev on the Grok Bot Computer. I will ask it to install Grok Build and then work on some repos first. The network is also very fast.
> https://x.com/_duyet/status/2089665924454633766

## How I designed the team

I designed a main CEO, then a bunch of agents that talk to each other and keep working.

- **duyetbot** — the CEO. Assigns work, keeps [kb.duyet.net](https://kb.duyet.net) current, talks to the others.
- **QA** — one bot for test and validate. Recerts live after each ship. Files only on fail.
- **one delegated worker per project** — chmonitor, anyrouter, monorepo, oma. They keep working.

I may add more roles later.

They share a computer, each with its own screen, and they message each other. I don't copy a stack trace from one window into another.

That part is what I wanted a year ago. Day one I was still asking [what to do first](https://x.com/_duyet/status/2089655766336844221). Day two they were already handing work to each other.

> Since the Grok bot has its own desktop computer, I am asking it to review the whole product, going page by page, using a smoke test account. It has found something then create a lot of github issues and will spawn Grok Build to fix them all. I think this kind of daily automation tries to make duyetbot act like a real customer, then report issues and have another bot fix and deploy them autonomously.
> https://x.com/_duyet/status/2089687655458259272

## Two days in

I stood the team up on [chmonitor](https://chmonitor.dev), [anyrouter.dev](https://anyrouter.dev), [news.duyet.net](https://news.duyet.net), and the rest of the duyet.net apps.

This morning chmonitor shipped a TTL inventory fix ([#3122](https://github.com/chmonitor/chmonitor/pull/3122)). The manager told QA to recert `dash.chmonitor.dev/ttl-partition-health`. QA came back PASS: 136 rows, charts fine, no silent Retry. The manager told chmonitor. I read the result.

I didn't sit in the middle pasting stack traces around. I also didn't walk away. Someone still owns the loop: the manager bot, and me when a call is mine.

The rest of the two days looks like that, on a schedule. They watch GitHub issues and PRs across the fleet and squash-merge except release-please. Fixes go through Grok Build or a Cursor cloud agent. If the repo has no Cursor GitHub app, the engineer says so and falls back. After each ship, QA recerts the live URL and files only on fail. They read [kb.duyet.net](https://kb.duyet.net) `MEMORY.md` before they invent the product, and write durable facts back. Weekday routines cover a morning GitHub digest, inbox, hourly token import, and a late-afternoon production QA pass. I print a one-page A4 on the Mac. Tailscale + herdr on the bot computer so I can watch from anywhere. After an Update, Tailscale has to be reinstalled (the package does not survive; the files do).

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

Grok Bot is the Goal-and-Loop shape, hosted: a CEO, specialists, a computer that stays on. I would not use it to rewrite a monorepo at 1am. I am using it to keep four live sites honest during the day.

The products in the fleet are the same ones I already write about. [AnyRouter](/2026/07/anyrouter) is one of them.

> I am building AnyRouter to solve my problem of collecting free LLM tokens from everywhere and unifying the MCP Gateway. Yes, it’s another router, but this is a router of routers.
> https://x.com/_duyet/status/2078848270064066623

## What held, and what didn't

I created roles, not chats. They have weekday watches. The computer keeps running when the laptop is closed. That is the part that feels different from a session I open and close, and from a headless sandbox that dies when the job ends.

Fallback matters more than the first tool. The default is a Cursor cloud agent. `chmonitor/chmonitor` does not have the Cursor GitHub app. The engineer said so and switched to Grok Build on a checkout.

Without kb, five bots on one computer still hallucinate the product.

They do talk to each other. They also talk too much. The first day was a pile of acks I did not need. The useful messages are the ones with a result: a PR, a PASS, a blocker.

Usage is real. People are burning most of a weekly window in a couple of days. A fleet that recerts live sites is not a cheap toy.

One computer is not one brain. Context does not magically appear in the other bot. If the manager does not write the handoff — URL, expected columns, do not add a host — QA will test the wrong thing.

I still have leftovers the team correctly left alone: Advisor ON CLUSTER DDL, a Postgres host I never added, an OS deploy waiting on env. Autonomy that knows when to stop is the feature.

Two days. The team is real. This is the setup I had been trying to build for a year.

I will write again when a week of weekday routines has either held or gone quiet.
