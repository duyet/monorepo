import { createFileRoute } from "@tanstack/react-router";
import { getStory } from "../../lib/story-queries";

export const Route = createFileRoute("/api/story/$id")({
  server: {
    handlers: {
      GET: async ({
        params,
        context,
      }: {
        params: { id: string };
        context: any;
      }) => {
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
          const idPrefix = params.id.slice(0, 64);
          const item = await getStory(db, idPrefix);
          if (!item) {
            return Response.json({ error: "not found" }, { status: 404 });
          }
          return Response.json(item, {
            headers: {
              "Cache-Control":
                "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
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
