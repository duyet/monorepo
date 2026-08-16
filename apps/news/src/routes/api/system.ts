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
              "Cache-Control": "public, max-age=120, s-maxage=300",
            },
          });
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : "query failed" },
            { status: 500 }
          );
        }
      },
    },
  },
});
