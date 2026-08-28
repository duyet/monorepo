# worker/

Ingestion backend for the news app: source adapters, LLM scoring/translation,
ranking, ClickHouse mirroring, and the `NewsIngestWorkflow` Cloudflare
Workflow. Owned by the backend agent; `apps/news/src/**` (frontend) is
separate territory.

## Wiring into the build (action needed from the frontend/entry-server owner)

`wrangler.toml` points `main` at `dist/server/server.js`, which is produced
by the TanStack Start / `@cloudflare/vite-plugin` build from `src/server.ts`
(see `apps/agent-assistant/src/entry-server.tsx` for the sibling app's pattern,
where `ThreadStateDO` is exported directly alongside `createStartHandler`).

For the Workflow class, Durable Object scheduler, and `scheduled` handler in
this directory to end up in the final Worker bundle, re-export them from
`apps/news/src/server.ts`:

```ts
export { NewsIngestWorkflow } from "../worker/workflow";
export { NewsIngestScheduler } from "../worker/ingest-scheduler";
```

Everything else (migrations, adapters, LLM calls, ranking, ClickHouse
mirroring, the workflow itself) is fully implemented in this directory and
does not depend on the frontend.
