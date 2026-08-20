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
thumbnail: /media/2026/08/grok-bot/hero.jpg
video: /media/2026/08/grok-bot/hero.mp4
---

I am on SuperGrok Heavy because of Grok Bot and I am super impressed. Wow, from me, at first. The harness is surprisingly good. The UI/UX is surprisingly good. Same feeling as when Claude Code launched.

This will change how we use coding agents. I think it changes software engineering forever.

## Years of trying to automate duyetbot

I have been trying to automate [@duyetbot](https://x.com/duyetbot) for years. First it was Claude Code on a cron, custom Claude Agent SDK -> then OpenClaw -> Hermes Agent -> Grok Bot.
Grok Bot is the first one that looks like what I actually wanted by the end.

The difference is the computer. Not a headless sandbox. The bot has a real desktop, a browser, persistent memory, and a workspace you can watch while it works.

Musk's deal with Cursor is really a good deal. Cursor already had Cloud Agents, sandboxes, and Chrome Desktop on those sandboxes for automation and UI tests. Grok Bot feels like that idea taken all the way: not "run a coding agent in a box," but give the agent a machine you can see.

![duyetbot GitHub contributions — 29,480 in the last year](/media/2026/08/grok-bot/duyetbot-github.jpg)

This screenshot is the GitHub contributions of my [@duyetbot](https://github.com/duyetbot), which is now owned by Grok Bot.

## Design the team

duyetbot was the first one. I was not clear yet how it was working. Then a bunch of agents that talk to each other.

I assign each bot to one repo on purpose so the work stays isolated. Not a shared pile of agents on every repo. One delegated worker per project is the isolation, not just an org chart.

QA is its own bot for testing and validation. It runs live recerts after every ship and only files when something fails. chmonitor, anyrouter, monorepo, and oma each have their own worker. They keep working. I may add more roles later.

![duyetbot the boss with per-repo workers in the sidebar](/media/2026/08/grok-bot/design-the-team.jpg)

> Since the Grok bot has its own desktop computer, I am asking it to review the whole product, going page by page, using a smoke test account. It has found something then create a lot of github issues and will spawn Grok Build to fix them all. I think this kind of daily automation tries to make duyetbot act like a real customer, then report issues and have another bot fix and deploy them autonomously.
> https://x.com/_duyet/status/2089687655458259272

The next piece is communication between the bots and the automation loop. They have schedules. They keep pinging back and forth. Sometimes silent for a while. Sometimes suddenly back to work.

Give them a mailbox, a Cloudflare account, a GitHub account — the same surfaces a human uses — and they can do a lot without you sitting in the loop. Mail for alerts and inbound asks. Cloudflare for deploy and config. GitHub for issues, PRs, and review. The schedule is what keeps the team alive when you are not watching.

## This replaced my local coding agent

When I ask a bot to code, it launches a Cursor Cloud Agent for each task and PR. I can keep feeding it input or adjust details in realtime. You can also install Cursor CLI or Grok Build and code remotely via herdr — the way I still work from my homelab machine, only now from anywhere. The bot can drive those local coding agents without issues.

![Cursor Cloud Agent launched from Grok Bot](/media/2026/08/grok-bot/cursor-cloud-agent.jpg)

The team babysits GitHub issues and PRs, auto-deploys, and validates. Fixes go through Grok Build or a Cursor Cloud Agent (SuperGrok Heavy, so Cursor Ultra $200 is actually in the loop). Long time since I was back in Cursor. They are so good now.

I chat with duyetbot the boss. It knows who can handle it. If I find something off I paste a screenshot and it assigns an agent to fix, validate, and deliver.

I also asked it to print a one-page A4 every morning when I walk into the home office. That feels real in a way a dashboard does not.

<div class="img-row">
<img src="/media/2026/08/grok-bot/duyetbot.jpg" alt="duyetbot the boss" />
<img src="/media/2026/08/grok-bot/daily-print.jpg" alt="duyetbot daily report on the T720DW" />
</div>

I will keep using it, discovering more, and posting updates.

