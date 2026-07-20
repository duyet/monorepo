---
title: "I am building anyrouter.dev"
date: 2026-07-19
author: Duyet
category: AI
tags:
  - AI
  - LLM
  - Agents
slug: /2026/07/anyrouter
thumbnail: /media/2026/07/anyrouter/anyrouter-intro.png
description: "I am building AnyRouter to solve my problem of collecting free LLM tokens from everywhere and unifying the MCP Gateway. Yes, it's another router, but this is a router of routers."
x: https://x.com/_duyet/status/2078848270064066623
---

I am building [<img src="/media/2026/07/anyrouter/anyrouter-icon.png" alt="" class="inline-icon" />AnyRouter](https://anyrouter.dev) to solve my problem of collecting free LLM tokens from everywhere and unifying the MCP Gateway. Yes, it's another router, but this is a router of routers.

I am solving this by building:

- A unified API Gateway that can take all your BYOK keys from various providers and auto-convert between any format — chat completions or the Claude Messages API.
- A shared key pool where anyone like me can donate their (free) idle keys and turn them into credits.

This is the foundation. There is a ton I want to build next around it: agent sandbox, a unified MCP Gateway, Login with AnyRouter, and more.

<video src="/media/2026/07/anyrouter/anyrouter-overview.mp4" autoplay muted loop playsinline controls></video>

# Unified LLM API

A unified API that gives you access to hundreds of AI models is the idea of every LLM API Gateway. This is nothing new, but implementing it myself is how I get to control everything better.

It works with the OpenAI SDK, Python, the AI SDK, MCP, the CLI, or plain cURL. Pick a tab on [anyrouter.dev](https://anyrouter.dev) and copy the real request — same base URL, same key, whatever client you already use. Everything is compatible with your existing LLM API or OpenRouter setup.

<div class="code-tabs">
<input type="radio" name="unified-api" id="tab-curl" checked />
<input type="radio" name="unified-api" id="tab-openai" />
<input type="radio" name="unified-api" id="tab-ai-sdk" />
<nav class="tab-list">
<label for="tab-curl">cURL</label>
<label for="tab-openai">OpenAI SDK</label>
<label for="tab-ai-sdk">AI SDK</label>
</nav>
<div class="tab-panel">

```bash
curl https://anyrouter.dev/api/v1/chat/completions \
  -H "Authorization: Bearer <ANYROUTER_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-5.4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

</div>
<div class="tab-panel">

```typescript
import OpenAI from "openai"

const client = new OpenAI({
  baseURL: "https://api.openai.com/v1", // [!code --]
  baseURL: "https://anyrouter.dev/api/v1", // [!code ++]
  apiKey: process.env.ANYROUTER_API_KEY,
})

const completion = await client.chat.completions.create({
  model: "openai/gpt-5.4",
  messages: [{ role: "user", content: "Hello" }],
})
```

</div>
<div class="tab-panel">

```typescript
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

const anyrouter = createOpenAI({
  baseURL: "https://anyrouter.dev/api/v1", // [!code ++]
  apiKey: process.env.ANYROUTER_API_KEY,
})

const { text } = await generateText({
  model: anyrouter("openai/gpt-5.4"),
  prompt: "Hello",
})
```

</div>
</div>

If you care about ZDR (zero data retention) — and you should — turn it on in the [provider routing settings](https://docs.anyrouter.dev/guides/provider-routing#field-reference) with `"provider": { "zdr": true }`, like the cURL tab above.

# Bring your own keys (BYOK) and Shared key pool

AnyRouter supports both AnyRouter credits and the option to bring your own provider keys (BYOK). This is the initial idea: bring all your keys into one place and combine them — automatic fallback and more.

If you'd rather keep your keys private, add your own providers and subscriptions — OpenRouter, Gemini, Groq, NVIDIA NIM, Z.AI, and more — and call them all through one OpenAI-compatible URL. No markup on your keys. Your own rate limits. Automatic pooling and failover across whatever you've added. You can add a key in seconds.

<!-- TODO: screenshot: BYOK add-key UI -->

A lot of providers give you some free tokens. This one unifies and combines them all, which is really useful in most cases. NVIDIA, for example, provides free API access to many models for $0, with a rate limit. On my own I burn through the limit and the rest sits idle. But I'm not the only one with idle free tokens — plenty of people are sitting on keys they'll never fully use.

When those keys go into the shared pool, the idle capacity turns into credits and free models for everyone. **You donate what you're not using, and you draw from what others aren't using.** [Donating your idle free keys to the pool](https://anyrouter.dev/donate) is the way to a good source of free tokens for everyone.

<div class="img-row">
  <img src="/media/2026/07/anyrouter/anyrouter-shared-pool-bg.png" alt="The shared key pool" loading="lazy" />
  <img src="/media/2026/07/anyrouter/anyrouter-shared-pool-2-bg.png" alt="Shared pool models" loading="lazy" />
</div>

# Why Starter at $1/mo

I launched a few weeks ago giving each new user $2 free right after sign up. Thousands of spam accounts got created.
So I am starting the plan at $1/mo — nothing compared to a $200 Claude or Codex plan or the bunch of other subscriptions you already pay for, not even worth your morning coffee. Honestly, it's a good way to prevent spam.

<div class="img-row">
  <img src="/media/2026/07/anyrouter/anyrouter-spam.jpeg" alt="Spam accounts after launch" loading="lazy" />
  <img src="/media/2026/07/anyrouter/anyrouter-to-start-bg.png" alt="Getting the Starter plan" loading="lazy" />
</div>

Another way to get the Starter plan: donate at least one good shared key to the pool.
I will improve this over time.

# How I built anyrouter: Self improvement

There is a lot more to build than I thought (landing, api, mcp, admin, email, blog, dashboard, playground, etc), and tons of model catalogs and upstreams to maintain. I don't have the time (or tokens) to do all of it myself.

**Build:** I started the codebase from scratch with a plan and the docs. Instead of jumping straight into generating code, I generated the docs I expect end users to read first, all API specs, etc. Using Opus and Fable to analyze and generate a large number of epics and tasks. Then ran a large number of [goal and loop](/2026/06/goal-and-loop/) sessions with any coding subscription I have (claude, opencode, ZAI, commandcode, antigravity) to build toward them. Fable rewrite and fix the most of hardest logic (routing algo, payment, etc). This works really well for me: I can see the progress in the docs, and the role pivots me into a product owner and a user instead of a coder. GitHub issues turned out to be a good place to track everything — bug reports, epics, and so on.

Every night, a scheduled agent sandbox runs more goal-and-loop sessions to build toward the docs and address as many GitHub issues as possible. That's the continuous self-improvement. I also keep Claude Code or Codex at hand for customization, adjustments, or correcting things myself.

**Manage**: [duyetbot](https://duyet.net/about-duyetbot) (Hermes agent) helps a lot as the manager. It has jobs hunting for newly released models and new upstream providers, running smoke tests, generating reports, analytics, health checks, catching bugs — everything auto-tracked and turned into GitHub issues again, and another agent comes to fix them the next morning.

I think this is the right way I've found so far to self-improve and manage a large codebase and product like this.

<div class="img-row">
  <img src="/media/2026/07/anyrouter/anyrouter-github-issues.png" alt="GitHub issues tracking" loading="lazy" />
  <img src="/media/2026/07/anyrouter/anyrouter-issues-new-mode-bg.png" alt="New model auto-detect issue" loading="lazy" />
  <img src="/media/2026/07/anyrouter/anyrouter-duyetbot-managed-bg.jpeg" alt="duyetbot managing AnyRouter" loading="lazy" />
</div>


The UI and UX keep changing over time. I never read the code and have no idea what is behind it, but I don't care by trust thousands of realistic test cases and smoke tests to keep it stable.

# The SDK & CLI

There is a typed SDK if you want it: [`@anyr/sdk`](https://docs.anyrouter.dev/sdk). Prefer the Vercel AI SDK? Install `@anyr/ai-sdk-provider` and point any model id at AnyRouter through `createAnyRouter`.

<div class="code-tabs">
<input type="radio" name="sdk-tabs" id="tab-anyr-sdk" checked />
<input type="radio" name="sdk-tabs" id="tab-anyr-provider" />
<input type="radio" name="sdk-tabs" id="tab-anyr-cli" />
<nav class="tab-list">
<label for="tab-anyr-sdk">@anyr/sdk</label>
<label for="tab-anyr-provider">@anyr/ai-sdk-provider</label>
<label for="tab-anyr-cli">CLI</label>
</nav>
<div class="tab-panel">

```typescript
import { AnyRouter } from "@anyr/sdk"

// Reads the key from ANYROUTER_API_KEY when omitted.
const client = new AnyRouter()

const completion = await client.chat.completions.create({
  model: "z-ai/glm-4.7",
  messages: [{ role: "user", content: "Hello!" }],
})

console.log(completion.choices[0].message.content)
```

</div>
<div class="tab-panel">

```typescript
import { createAnyRouter } from "@anyr/ai-sdk-provider"
import { generateText } from "ai"

const anyrouter = createAnyRouter() // reads ANYROUTER_API_KEY

const { text } = await generateText({
  model: anyrouter("z-ai/glm-4.7"),
  prompt: "What is AnyRouter?",
})
```
 
</div>
<div class="tab-panel">

```bash
# Pick any model (e.g. GLM-5.2)
npx @anyr/cli claude --model z-ai/glm-5.2
```

</div>
</div>

# Things people actually build with AnyRouter

People wire it into coding agents, chat apps, and batch jobs — anywhere they'd otherwise juggle several provider keys by hand. A few real setups are collected at [anyrouter.dev/use-cases](https://anyrouter.dev/use-cases). Take whatever's useful.

![AnyRouter use cases](/media/2026/07/anyrouter/anyrouter-use-cases.png)

I hope everyone can use it and give me more feedback: [https://anyrouter.dev](https://anyrouter.dev/?utm_source=blog&utm_medium=post&ref=blog)
