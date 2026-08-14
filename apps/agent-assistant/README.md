This is the [assistant-ui](https://github.com/assistant-ui/assistant-ui) starter project for LangGraph. It ships a minimal Claude-backed agent (`backend/agent.ts`) plus a Next.js chat UI that streams from it.

## Getting Started

1. Copy env template and fill in secrets:
   
   ```bash
   cp .env.example .env.local
   ```

   Required:
   - `OPENAI_API_KEY` — used by `backend/agent.ts`
   - `ASSISTANT_API_TOKEN` (or `AGENT_API_TOKEN`) — Worker secret; every `/api/threads*` request needs `Authorization: Bearer <token>`
   - `VITE_ASSISTANT_API_TOKEN` — same value as the Worker secret so the same-origin UI can send the bearer header locally. This is a low-privilege gate for a personal tool, not a user password.

   Optional:
   - `OPENAI_MODEL` — override the default model id (`gpt-4o-mini`)
   - `LANGSMITH_TRACING` / `LANGSMITH_API_KEY` / `LANGSMITH_PROJECT` — tracing
   - `LANGCHAIN_API_KEY` — only needed when pointing `LANGGRAPH_API_URL` at LangGraph Platform (cloud)

## Authentication

`/api/threads*` is fail-closed. Missing token, wrong token, or an unconfigured Worker secret all return 401 before thread storage or model calls. CORS is limited to `https://agent-assistant.duyet.net` and localhost.

2. Install deps and run both the LangGraph backend and the Next.js frontend:

   ```bash
   bun install
   bun run dev
   ```

   - `localhost:2024` — LangGraph dev server (serves the `agent` graph)
   - `localhost:3000` — Next.js app (proxies `/api/*` → `LANGGRAPH_API_URL`)

   Run them individually with `bun run dev:backend` and `bun run dev:frontend`.

## Project layout

```
app/                Next.js App Router pages + /api proxy
backend/agent.ts    LangGraph graph exported as `graph`
lib/chatApi.ts      LangGraph SDK client factory
langgraph.json      LangGraph CLI config (graph id, node version, env file)
```

`app/assistant.tsx` builds the runtime with `unstable_createLangGraphStream({ client, assistantId })` from `@assistant-ui/react-langgraph`.
