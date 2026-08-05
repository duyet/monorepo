---
title: "Cloudflare Agents Week so far"
date: 2026-08-04
url: https://blog.duyet.net/note/cloudflare-agents-week
---

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
