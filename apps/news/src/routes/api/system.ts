import { createFileRoute } from "@tanstack/react-router";
import { loadSystemStats } from "../../lib/system-queries";

export const Route = createFileRoute("/api/system")({
  server: {
    handlers: {
      GET: async ({ context }: { context: any }) => {
        let env =
          context?.cloudflare?.env ||
          context?.env ||
          (globalThis as any).CF_ENV;
        if (!env?.DB) {
          try {
            env = (await import("cloudflare:workers")).env;
          } catch {
            // not running in a workers runtime
          }
        }
        const db: D1Database | undefined = env?.DB;
        if (!db) {
          return Response.json(
            { error: "D1 binding DB not configured" },
            { status: 500 }
          );
        }

        try {
          const stats = await loadSystemStats(db, env);
          return Response.json(stats, {
            headers: {
              // Operational: lastRun/runsToday must not sit behind the 5-minute
              // edge cache that hid ingest completion from /api/system recert.
              "Cache-Control": "no-store",
            },
          });
        } catch (e) {
          console.error("system:", e);
          return Response.json({ error: "query failed" }, { status: 500 });
        }
      },
    },
  },
});
