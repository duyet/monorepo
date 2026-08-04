---
title: Cloudflare is all you need
date: 2026-05-06
author: Duyet
category: AI
series: AI Harness Engineering
tags:
  - AI
  - Agents
  - Cloudflare
slug: /2026/05/cloudflare-is-all-you-need
thumbnail: /media/2026/05/cloudflare-is-all-you-need/npm-i-agents.svg
description: Cloudflare's Agents SDK runs stateful TypeScript agents on Durable Objects, with Workers AI, AI Gateway, AI Search, Vectorize, Browser Run, Queues, Workflows, Email, Dynamic Workers, and Sandboxes around it. Plus Flue, the open agent harness from the Astro team Cloudflare acquired.
---

Cloudflare has one of the most generous free plans I've seen for building websites in the last 10 years, and it is still true now that they are shifting focus to AI agents. With the free tier, you already get enough for personal projects and medium-scale workloads.

Start with [agents.cloudflare.com](https://agents.cloudflare.com). It already lists almost everything you need.

Cloudflare's `agents` SDK is a good one, alongside the [AI SDK](https://github.com/vercel/ai).

Each agent runs as a TypeScript class on a Durable Object, with its own SQL database, WebSocket connections, scheduling, state, and lifecycle.

The stack is simple: run agent logic on [Workers](https://developers.cloudflare.com/workers/), keep state in [Durable Objects](https://developers.cloudflare.com/durable-objects/), call models with [Workers AI](https://developers.cloudflare.com/workers-ai/) or [AI Gateway](https://developers.cloudflare.com/ai-gateway/), retrieve knowledge from [AI Search](https://developers.cloudflare.com/ai-search/) or [Vectorize](https://developers.cloudflare.com/vectorize/), and let agents act through [Browser Run](https://developers.cloudflare.com/browser-run/), [MCP](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/), [Queues](https://developers.cloudflare.com/queues/), [Workflows](https://developers.cloudflare.com/workflows/), [Email](https://developers.cloudflare.com/email-service/), [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/), and [Sandboxes](https://developers.cloudflare.com/containers/).

An agent is just a class. You extend `Agent`, keep state with `setState`, and route requests to it:

```ts
import { Agent, routeAgentRequest, callable } from "agents";

export class Counter extends Agent<Env, { count: number }> {
  initialState = { count: 0 };

  @callable()
  increment() {
    this.setState({ count: this.state.count + 1 });
    return this.state.count;
  }
}

export default {
  async fetch(request, env) {
    return (await routeAgentRequest(request, env)) ?? new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

The starter for the Agents SDK also includes streaming chat, tools, human-in-the-loop approval, scheduling, and Workers AI by default. Scaffold it with `npm create cloudflare@latest -- --template cloudflare/agents-starter` ([cloudflare/agents-starter](https://github.com/cloudflare/agents-starter)).

This is the free/pricing snapshot they offer today:

| Service | Free budget | Pricing |
| --- | --- | --- |
| **Agents SDK** | No separate quota. Uses Workers and Durable Objects. | Pay for the underlying services. ([Cloudflare Docs][1]) |
| **Workers** | 100k requests/day, 10 ms CPU/invocation. | Paid starts at $5/mo: 10M requests/mo, 30M CPU-ms/mo, then usage-based overage. ([Cloudflare Docs][2]) |
| **Durable Objects** | 100k requests/day, 13k GB-s/day, SQLite-backed DOs on Free. | Paid includes 1M requests/mo and 400k GB-s/mo, then overage. ([Cloudflare Docs][2]) |
| **Workers AI** | 10k Neurons/day. | $0.011 per 1k Neurons after free allocation on Paid. ([Cloudflare Docs][3]) |
| **AI Gateway** | Core features free; 100k persistent logs total on Free. | Paid has 10M logs/gateway. Logpush: $0.05/M requests. Guardrails bill through Workers AI. ([Cloudflare Docs][4]) |
| **AI Search** | Open beta: 100 instances, 100k files/instance, 20k queries/mo, 500 crawled pages/day. | Paid: 5k instances, 1M files or 500k hybrid search, unlimited queries/crawling. Future pricing has not been announced yet. ([Cloudflare Docs][5]) |
| **Vectorize** | 30M queried vector dimensions/mo, 5M stored dimensions. | Paid includes 50M queried dimensions/mo and 10M stored dimensions, then $0.01/M queried and $0.05/100M stored. ([Cloudflare Docs][6]) |
| **D1** | 5M rows read/day, 100k rows written/day, 5 GB storage. | Paid includes 25B reads/mo, 50M writes/mo, 5 GB storage, then overage. ([Cloudflare Docs][2]) |
| **R2** | 10 GB-month, 1M Class A ops, 10M Class B ops, free egress. | $0.015/GB-month, $4.50/M Class A, $0.36/M Class B, egress free. ([Cloudflare Docs][2]) |
| **KV** | 100k reads/day, 1k writes/day, 1 GB storage. | Paid includes 10M reads/mo and 1M writes/mo, then usage-based overage. ([Cloudflare Docs][2]) |
| **Queues** | 10k operations/day, 24h retention. | Paid includes 1M operations/mo, then $0.40/M operations. ([Cloudflare Docs][2]) |
| **Workflows** | Included on Free; shares Workers limits; 1 GB storage. | Same as Workers pricing, plus workflow storage after quota. ([Cloudflare Docs][7]) |
| **Browser Run** | 10 min/day, 3 concurrent browsers. | Paid includes 10 hours/mo and 10 browsers, then $0.09/hour and $2/browser. ([Cloudflare Docs][8]) |
| **MCP Servers** | Cloudflare provides managed remote MCP servers. | Cost depends on the services/tools used by the MCP server. ([Cloudflare Docs][9]) |
| **Email Service** | Inbound Email Routing is unlimited. Outbound email is not on Free. | Paid includes 3k outbound emails/mo, then $0.35/1k emails. ([Cloudflare Docs][10]) |
| **Dynamic Workers** | Paid only. | 1k unique Dynamic Workers/mo included, then $0.002 per Dynamic Worker/day. Requests and CPU bill as Workers. Billing starts May 26, 2026. ([Cloudflare Docs][11]) |
| **Sandboxes / Containers** | No free container budget. | Paid includes 25 GiB-hours, 375 vCPU-min, 200 GB-hours/mo, then usage-based overage. ([Cloudflare Docs][2]) |
| **Realtime** | 1,000 GB free tier. | $0.05/GB egress after the free tier. ([Cloudflare Docs][12]) |

[1]: https://developers.cloudflare.com/agents/ "Agents - Cloudflare Agents docs"
[2]: https://developers.cloudflare.com/workers/platform/pricing/ "Pricing - Cloudflare Workers docs"
[3]: https://developers.cloudflare.com/workers-ai/platform/pricing/ "Pricing - Cloudflare Workers AI docs"
[4]: https://developers.cloudflare.com/ai-gateway/reference/pricing/ "Pricing - Cloudflare AI Gateway docs"
[5]: https://developers.cloudflare.com/ai-search/platform/limits-pricing/ "Limits & pricing - Cloudflare AI Search docs"
[6]: https://developers.cloudflare.com/vectorize/platform/pricing/ "Pricing - Cloudflare Vectorize docs"
[7]: https://developers.cloudflare.com/workflows/reference/pricing/ "Pricing - Cloudflare Workflows docs"
[8]: https://developers.cloudflare.com/browser-run/pricing/ "Pricing - Cloudflare Browser Run docs"
[9]: https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/ "Cloudflare's own MCP servers - Cloudflare Agents docs"
[10]: https://developers.cloudflare.com/email-service/platform/pricing/ "Pricing - Cloudflare Email Service docs"
[11]: https://developers.cloudflare.com/dynamic-workers/pricing/ "Pricing - Cloudflare Dynamic Workers docs"
[12]: https://developers.cloudflare.com/realtime/sfu/pricing/ "Pricing - Cloudflare Realtime docs"

# My default stack

For a simple agent, I would start with:

[Workers](https://developers.cloudflare.com/workers/) + [Agents SDK](https://developers.cloudflare.com/agents/) + [Durable Objects](https://developers.cloudflare.com/durable-objects/) + [Workers AI](https://developers.cloudflare.com/workers-ai/) + [AI Gateway](https://developers.cloudflare.com/ai-gateway/) + [AI Search](https://developers.cloudflare.com/ai-search/)

Then add:

[Browser Run](https://developers.cloudflare.com/browser-run/) for web browsing, [Queues](https://developers.cloudflare.com/queues/) and [Workflows](https://developers.cloudflare.com/workflows/) for background jobs, [R2](https://developers.cloudflare.com/r2/) for files, [Email Service](https://developers.cloudflare.com/email-service/) for email agents, and [Sandboxes](https://developers.cloudflare.com/containers/) or [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/) for coding agents.

# Flue, if you want a harness

The Agents SDK gives you the runtime. [Flue](https://flueframework.com), an open agent framework from the team behind Astro — which [Cloudflare acquired in January 2026](https://blog.cloudflare.com/astro-joins-cloudflare/) — gives you the harness on top: sessions, tools, skills, and a secure sandbox. It's powered by the Pi harness and runs multi-cloud (write once, deploy anywhere, any LLM), but Cloudflare is the target it maps onto most cleanly. The idea is that you describe what an agent _knows_ instead of scripting what it _does_:

```ts
import { createAgent } from "@flue/runtime";

export default createAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  instructions: "Tell a funny hello-world engineering joke.",
}));
```

```bash
npm install @flue/runtime
npx flue init --target cloudflare
```

When you target Cloudflare, each Flue agent becomes its own Durable Object — isolated storage, isolated compute, scales to as many agents as you spin up, costs nothing idle. Write once, run on whatever model you choose, deploy without lab lock-in.

Example code: [withastro/flue](https://github.com/withastro/flue) · [Cloudflare's launch post](https://blog.cloudflare.com/agents-platform-flue-sdk/).

# Cloudflare Agents Week so far

**Cloudflare CI/CD** — A TypeScript-native CI/CD system built on [Workflows](https://blog.cloudflare.com/ci-workflows/). Define pipelines in code instead of YAML: each CI step maps to a Workflow step with built-in retries, state persistence, and parallel execution via `Promise.all()`. Includes dependency caching through sandbox snapshots in R2, and self-healing builds powered by [Think](https://developers.cloudflare.com/think/) agents on Workers AI that detect failures and push fixes automatically. Trigger pipelines directly on `artifact push` events — no manual queue wiring required.

**Cloudflare Wallet** — [cloudflare.pay](https://cloudflare.pay/) — Cloudflare's payments and billing surface. Keep an eye on the blog for more details as it lands.

**Agent Tracing** — Out-of-the-box debugging for AI agent sessions. Session replay lets you inspect full conversation context: system instructions, model thinking, tool calls, and responses. Trace waterfall view shows time allocation across model calls, tool execution, and infrastructure calls. Supports Think, Flue, and AI SDK harnesses natively, with OpenTelemetry export to any OTLP-compatible backend. Enable in `wrangler.jsonc` with `observability.traces.enabled: true`. Pricing starts October 1, 2026: 200k events/day free, then 20M included/month on Paid at $0.60/M additional. Currently free while in beta. ([blog.cloudflare.com/agents-on-cloudflare](https://blog.cloudflare.com/agents-on-cloudflare/))

**@cloudflare/computer** — Early-preview agent runtime that dynamically orchestrates between fast isolates and full Linux containers on a shared virtual filesystem. Each agent gets a dedicated filespace while the platform picks the right execution environment per task. FUSE mount + SQLite-backed storage + agent hibernation when idle. Built on just-bash for isolates, npm-capable for containers. Open-source with tutorials at [github.com/cloudflare/computer](https://github.com/cloudflare/computer). ([blog.cloudflare.com/cloudflare-computer](https://blog.cloudflare.com/cloudflare-computer/))

**Otel traces in `wrangler dev`** — OpenTelemetry tracing now ships inside local development. Agents get the same observability they have in production, built directly into Wrangler and the Cloudflare Vite plugin — no external collector setup needed to iterate locally.

**Agent Development Lifecycle (ADLC)** — Cloudflare is replacing the traditional SDLC with an [Agent Development Lifecycle](https://blog.cloudflare.com/agent-development-lifecycle/) built for autonomous software factories where agents own the full dev loop. Cloudflare identifies seven requirements: programmatic, horizontally scalable, reproducible, real-time/push-based, atomic changes, permissioned access, and self-improving.

**Building a Software Factory** — Cloudflare's own internal implementation runs on the same primitives it ships to customers: [Artifacts](https://developers.cloudflare.com/artifacts/) for versioned code storage, [Workflows](https://developers.cloudflare.com/workflows/) for durable orchestration, [Sandboxes](https://developers.cloudflare.com/containers/) for isolated execution, [Workers AI](https://developers.cloudflare.com/workers-ai/) for agent intelligence, and [Dynamic Workflows](https://developers.cloudflare.com/dynamic-workers/) for customer-defined jobs alongside platform-managed pipelines. Feature flagging via [Flagship](https://blog.cloudflare.com/flagship/) gives every change its own flag; gradual deployments roll out code to a percentage of traffic over time.

**Enforcing AI Standards** — Cloudflare now enforces AI coding standards across all internal repositories automatically: lint, typecheck, build, and AI-specific checks gate every PR. The same system powers self-healing CI that detects failures, diagnoses root cause, and pushes a fix commit without human intervention.

**Cloudflare MCP Server** — Powered by [Code Mode](https://developers.cloudflare.com/agents/code-mode/) and Dynamic Workers, giving agents programmatic access to the entire Cloudflare API: buy domains, create accounts, manage DNS, query D1, upload to R2 — anything the API can do, an agent can do.

**Local dev for everything** — Remote bindings let you run agents locally against real production resources without deploying. The local dev environment now mirrors production runtime across DOs, Workflows, Queues, and Containers, so what works locally works in production.

---

_I'll keep this section updated as Cloudflare Agents Week progresses — check back for new announcements._
